import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";

const port = Number(process.env.COACH_PORT ?? 8787);
const model = process.env.OPENAI_MODEL ?? "gpt-5.6";
const cacheFile = new URL("./coach-memory.json", import.meta.url);
const cacheVersion = 1;
const maxCacheEntries = Number(process.env.COACH_CACHE_MAX_ENTRIES ?? 250);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "http://127.0.0.1:5173",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_200_000) {
        reject(new Error("Payload troppo grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON non valido"));
      }
    });
    req.on("error", reject);
  });
}

function outputText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const chunks = [];
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

function systemPrompt() {
  return [
    "Sei il Coach AI di una webapp per asta Fantacalcio 2026/27.",
    "Rispondi in italiano, con tono pratico da asta live.",
    "Usa solo i dati nello snapshot sintetico: budget, rose, max bid, turno chiamata, squadra del cuore e vibe degli avversari.",
    "Dai indicazioni operative: rilancia/lascia, prezzo massimo, rischio avversari, alternativa immediata.",
    "Quando l'utente chiede di segnare un acquisto, conferma cosa registrare e segnala eventuali incoerenze; l'app applica i comandi deterministici lato client.",
    "Non inventare notizie esterne o aggiornamenti calciomercato in tempo reale."
  ].join("\n");
}

function truncateText(value, maxLength = 280) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function pickStats(stats) {
  if (!stats || typeof stats !== "object") return undefined;
  return {
    pv: stats.pv ?? "0",
    gol: stats.gol ?? "0",
    ass: stats.ass ?? "0",
    fm: stats.fm ?? "0"
  };
}

function compactPlayer(player) {
  if (!player || typeof player !== "object") return null;
  return {
    name: player.name,
    role: player.role,
    team: player.team,
    maxBid: player.maxBid,
    liveMax: player.liveMax,
    openBid: player.openBid,
    status: player.status,
    owner: player.owner,
    paid: player.paid,
    reason: truncateText(player.reason, 180) || undefined,
    note: truncateText(player.note, 220) || undefined,
    stats26: pickStats(player.stats26),
    stats25: pickStats(player.stats25)
  };
}

function compactSnapshot(snapshot = {}) {
  const currentPlayer = compactPlayer(snapshot.currentPlayer);
  const managers = Array.isArray(snapshot.managers) ? snapshot.managers : [];
  const managerRows = currentPlayer
    ? [...managers].sort((a, b) => Number(b.estimateOnCurrentPlayer ?? 0) - Number(a.estimateOnCurrentPlayer ?? 0)).slice(0, 6)
    : managers;

  return {
    currentPlayer,
    nextRecommended: compactPlayer(snapshot.nextRecommended),
    myTeam: {
      budget: snapshot.myTeam?.budget,
      spent: snapshot.myTeam?.spent,
      remaining: snapshot.myTeam?.remaining,
      activeRole: snapshot.myTeam?.activeRole,
      bought: Array.isArray(snapshot.myTeam?.bought) ? snapshot.myTeam.bought.map(compactPlayer) : [],
      roleStats: Array.isArray(snapshot.myTeam?.roleStats)
        ? snapshot.myTeam.roleStats.map((row) => ({
            role: row.role,
            bought: row.bought,
            slots: row.slots,
            spent: row.spent,
            remaining: row.remaining,
            smartRemaining: row.smartRemaining
          }))
        : []
    },
    managers: managerRows.map((row) => ({
      name: row.name,
      heartTeam: row.heartTeam,
      vibe: row.vibe,
      spent: row.spent,
      remainingBudget: row.remainingBudget,
      roster: row.roster,
      roles: row.roles,
      maxSingle: row.maxSingle,
      estimateOnCurrentPlayer: row.estimateOnCurrentPlayer,
      reading: truncateText(row.reading, 130)
    })),
    visiblePlayers: Array.isArray(snapshot.visiblePlayers)
      ? snapshot.visiblePlayers.slice(0, 8).map((player) => ({
          name: player.name,
          role: player.role,
          team: player.team,
          maxBid: player.maxBid,
          status: player.status,
          owner: player.owner,
          paid: player.paid
        }))
      : [],
    callTurn: snapshot.callTurn,
    rules: snapshot.rules
  };
}

function compactHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((message) => message?.role !== "assistant" || message?.id !== "coach-welcome")
    .slice(-4)
    .map((message) => ({
      role: message.role,
      text: truncateText(message.text, 260)
    }));
}

function normalizeQuestion(message) {
  return String(message ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isCacheableQuestion(message) {
  const normalized = normalizeQuestion(message);
  if (normalized.length < 8) return false;
  return !/^(e|ma|pero|invece|quindi|ok|si|no)\b/.test(normalized);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((sorted, key) => {
      if (value[key] !== undefined) sorted[key] = stableValue(value[key]);
      return sorted;
    }, {});
}

function hashValue(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
}

async function readMemory() {
  try {
    const parsed = JSON.parse(await fs.readFile(cacheFile, "utf8"));
    if (parsed?.version === cacheVersion && Array.isArray(parsed.entries)) return parsed;
  } catch {
    // Missing or malformed cache: start fresh.
  }
  return { version: cacheVersion, updatedAt: null, entries: [] };
}

async function writeMemory(memory) {
  const entries = [...memory.entries]
    .sort((a, b) => String(b.lastUsedAt ?? b.createdAt).localeCompare(String(a.lastUsedAt ?? a.createdAt)))
    .slice(0, maxCacheEntries);
  const nextMemory = {
    version: cacheVersion,
    updatedAt: new Date().toISOString(),
    entries
  };
  const tempFile = new URL("./coach-memory.json.tmp", import.meta.url);
  await fs.writeFile(tempFile, `${JSON.stringify(nextMemory, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, cacheFile);
}

async function cachedReply(cacheKey) {
  const memory = await readMemory();
  const entry = memory.entries.find((item) => item.key === cacheKey);
  if (!entry) return null;
  entry.hits = Number(entry.hits ?? 0) + 1;
  entry.lastUsedAt = new Date().toISOString();
  await writeMemory(memory).catch(() => undefined);
  return entry;
}

async function rememberReply({ cacheKey, message, contextHash, reply }) {
  const memory = await readMemory();
  memory.entries = memory.entries.filter((entry) => entry.key !== cacheKey);
  memory.entries.unshift({
    key: cacheKey,
    model,
    question: normalizeQuestion(message),
    contextHash,
    reply,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    hits: 0
  });
  await writeMemory(memory);
}

async function askOpenAI({ message, snapshot, history, localAction }) {
  const compactContext = compactSnapshot(snapshot);
  const shortHistory = compactHistory(history);
  const contextHash = hashValue({ snapshot: compactContext, localAction });
  const cacheKey = hashValue({
    version: cacheVersion,
    model,
    question: normalizeQuestion(message),
    contextHash
  });
  const useCache = isCacheableQuestion(message);
  const cached = useCache ? await cachedReply(cacheKey) : null;

  if (cached) {
    return {
      status: 200,
      body: {
        reply: cached.reply,
        configured: true,
        model,
        cached: true,
        tokenMode: "cache"
      }
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      status: 503,
      body: {
        reply: "Coach AI non configurato: imposta OPENAI_API_KEY e avvia l'app con npm run dev:ai. I comandi rapidi locali restano disponibili.",
        configured: false
      }
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: JSON.stringify({
            message: truncateText(message, 700),
            localAction,
            history: shortHistory,
            snapshot: compactContext
          })
        }
      ],
      max_output_tokens: 420
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: response.status,
      body: {
        reply: data?.error?.message ?? "Il Coach AI non ha risposto correttamente.",
        configured: true
      }
    };
  }

  const reply = outputText(data) || "Non ho abbastanza segnale per una risposta utile.";
  if (useCache) {
    await rememberReply({ cacheKey, message, contextHash, reply }).catch(() => undefined);
  }

  return {
    status: 200,
    body: {
      reply,
      configured: true,
      model,
      cached: false,
      tokenMode: "compact"
    }
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/coach") {
    sendJson(res, 404, { reply: "Endpoint non trovato." });
    return;
  }

  try {
    const payload = await readJson(req);
    const result = await askOpenAI(payload);
    sendJson(res, result.status, result.body);
  } catch (error) {
    sendJson(res, 500, {
      reply: error instanceof Error ? error.message : "Errore interno del Coach AI."
    });
  }
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.log(`Coach AI gia attivo su http://127.0.0.1:${port}`);
    process.exit(0);
  }
  throw error;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Coach AI pronto su http://127.0.0.1:${port}`);
});

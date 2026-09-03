import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";

function loadLocalEnv() {
  if (process.env.VERCEL) return;
  try {
    const envPath = new URL("../.env", import.meta.url);
    const envText = fs.readFileSync(envPath, "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator <= 0) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Local .env is optional.
  }
}

loadLocalEnv();

const model = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";
const maxCoachOutputTokens = Math.max(700, Number(process.env.COACH_MAX_OUTPUT_TOKENS ?? 950) || 950);
const cacheFile = new URL("./coach-memory.json", import.meta.url);
const cacheVersion = 2;
const maxCacheEntries = Number(process.env.COACH_CACHE_MAX_ENTRIES ?? 250);
const useFileCache = process.env.COACH_CACHE_MODE === "file" || !process.env.VERCEL;
let memoryCache = { version: cacheVersion, updatedAt: null, entries: [] };

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
    "Usa solo i dati nello snapshot sintetico: budget, rose, max bid, turno chiamata, squadra del cuore, vibe e memoria comportamentale degli avversari.",
    "Se la memoria mostra overpay, guerre di rilanci o pattern su ruoli specifici, adatta stop price e timing di chiamata in modo esplicito.",
    "Quando un avversario ha gia consumato molto budget nel reparto del giocatore corrente o deve ancora completare molti slot, considera meno probabile un rilancio forte anche se la sua memoria e calda.",
    "Dai indicazioni operative: rilancia/lascia, prezzo massimo, rischio avversari, alternativa immediata.",
    "Rispondi in modo completo ma compatto: se analizzi molti avversari, sintetizza e chiudi sempre con una decisione operativa.",
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
    gs: stats.gs ?? "0",
    rp: stats.rp ?? "0",
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
      spentByRole: row.spentByRole,
      maxSingle: row.maxSingle,
      estimateOnCurrentPlayer: row.estimateOnCurrentPlayer,
      reading: truncateText(row.reading, 130),
      roleBudgetPressure: row.roleBudgetPressure ? {
        role: row.roleBudgetPressure.role,
        roleBudget: row.roleBudgetPressure.roleBudget,
        roleSpent: row.roleBudgetPressure.roleSpent,
        roleBought: row.roleBudgetPressure.roleBought,
        roleSlotsLeft: row.roleBudgetPressure.roleSlotsLeft,
        ceiling: row.roleBudgetPressure.ceiling,
        usedPct: row.roleBudgetPressure.usedPct,
        concentrated: row.roleBudgetPressure.concentrated,
        reading: truncateText(row.roleBudgetPressure.reading, 90)
      } : undefined,
      learning: row.learning ? {
        notes: row.learning.notes,
        heat: row.learning.heat,
        summary: truncateText(row.learning.summary, 140),
        roleBias: row.learning.roleBias
      } : undefined
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
    auctionMemory: snapshot.auctionMemory ? {
      recentEvents: Array.isArray(snapshot.auctionMemory.recentEvents)
        ? snapshot.auctionMemory.recentEvents.slice(-6).map((event) => ({
            text: truncateText(event.text, 220),
            managers: event.managers,
            player: event.player,
            role: event.role,
            tags: event.tags,
            intensity: event.intensity
          }))
        : [],
      managerLearning: Array.isArray(snapshot.auctionMemory.managerLearning)
        ? snapshot.auctionMemory.managerLearning
            .filter((learning) => Number(learning.notes ?? 0) > 0)
            .map((learning) => ({
              manager: learning.manager,
              notes: learning.notes,
              heat: learning.heat,
              summary: truncateText(learning.summary, 150),
              roleBias: learning.roleBias
            }))
        : []
    } : undefined,
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
  if (!useFileCache) return memoryCache;
  try {
    const parsed = JSON.parse(await fsp.readFile(cacheFile, "utf8"));
    if (parsed?.version === cacheVersion && Array.isArray(parsed.entries)) {
      memoryCache = parsed;
      return parsed;
    }
  } catch {
    // Missing or malformed cache: start fresh.
  }
  return memoryCache;
}

async function writeMemory(memory) {
  const entries = [...memory.entries]
    .sort((a, b) => String(b.lastUsedAt ?? b.createdAt).localeCompare(String(a.lastUsedAt ?? a.createdAt)))
    .slice(0, maxCacheEntries);
  memoryCache = {
    version: cacheVersion,
    updatedAt: new Date().toISOString(),
    entries
  };
  if (!useFileCache) return;
  const tempFile = new URL("./coach-memory.json.tmp", import.meta.url);
  await fsp.writeFile(tempFile, `${JSON.stringify(memoryCache, null, 2)}\n`, "utf8");
  await fsp.rename(tempFile, cacheFile);
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

export async function handleCoachPayload({ message, snapshot, history, localAction }) {
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
    const setupHint = process.env.VERCEL
      ? "Coach AI non configurato: imposta OPENAI_API_KEY nelle Environment Variables di Vercel e fai redeploy."
      : "Coach AI non configurato: crea un file .env nella cartella webapp con OPENAI_API_KEY=la_tua_chiave, poi riavvia npm run dev:ai.";
    return {
      status: 503,
      body: {
        reply: setupHint,
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
      max_output_tokens: maxCoachOutputTokens
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

  const incompleteReason = data?.status === "incomplete"
    ? data?.incomplete_details?.reason ?? "limite risposta"
    : "";
  const baseReply = outputText(data) || "Non ho abbastanza segnale per una risposta utile.";
  const reply = incompleteReason
    ? `${baseReply}\n\nRisposta interrotta per ${incompleteReason}: ho aumentato il limite, ma chiedimi \"continua\" se vuoi proseguire da qui.`
    : baseReply;
  if (useCache && !incompleteReason) {
    await rememberReply({ cacheKey, message, contextHash, reply }).catch(() => undefined);
  }

  return {
    status: 200,
    body: {
      reply,
      configured: true,
      model,
      cached: false,
      incomplete: Boolean(incompleteReason),
      tokenMode: "compact"
    }
  };
}

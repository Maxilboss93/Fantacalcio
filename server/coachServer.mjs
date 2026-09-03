import http from "node:http";
import { handleCoachPayload } from "./coachCore.mjs";
import { readAuctionState, writeAuctionState } from "./stateCore.mjs";

const port = Number(process.env.COACH_PORT ?? 8787);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "http://127.0.0.1:5173",
    "access-control-allow-methods": "GET, POST, OPTIONS",
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

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.url === "/api/state" && req.method === "GET") {
    const result = await readAuctionState();
    sendJson(res, result.status, result.body);
    return;
  }

  if (req.url === "/api/state" && req.method === "POST") {
    try {
      const payload = await readJson(req);
      const result = await writeAuctionState(payload);
      sendJson(res, result.status, result.body);
    } catch (error) {
      sendJson(res, 400, {
        error: error instanceof Error ? error.message : "Stato asta non salvabile."
      });
    }
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/coach") {
    sendJson(res, 404, { reply: "Endpoint non trovato." });
    return;
  }

  try {
    const payload = await readJson(req);
    const result = await handleCoachPayload(payload);
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

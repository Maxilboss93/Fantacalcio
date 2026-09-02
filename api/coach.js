import { handleCoachPayload } from "../server/coachCore.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ reply: "Metodo non consentito." });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    const result = await handleCoachPayload(payload);
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({
      reply: error instanceof Error ? error.message : "Errore interno del Coach AI."
    });
  }
}

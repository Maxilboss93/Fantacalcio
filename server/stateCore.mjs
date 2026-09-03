import fs from "node:fs/promises";
import path from "node:path";

const stateFile = process.env.AUCTION_STATE_FILE
  ? path.resolve(process.env.AUCTION_STATE_FILE)
  : path.join(process.cwd(), "server", "auction-state.json");
const backupFile = stateFile.replace(/\.json$/i, ".backup.json");

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeState(input) {
  const payload = input?.state ?? input;
  if (!isObject(payload)) {
    throw new Error("Stato asta non valido.");
  }

  const auction = payload.auction ?? {};
  if (!isObject(auction)) {
    throw new Error("Stato giocatori non valido.");
  }

  const managers = Array.isArray(payload.managers) ? payload.managers : [];
  const callTurn = isObject(payload.callTurn) ? payload.callTurn : {};
  const auctionMemory = Array.isArray(payload.auctionMemory) ? payload.auctionMemory : [];

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    auction,
    managers,
    callTurn,
    auctionMemory
  };
}

export async function readAuctionState() {
  try {
    const raw = await fs.readFile(stateFile, "utf8");
    return { status: 200, body: { state: JSON.parse(raw) } };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { status: 200, body: { state: null } };
    }
    return { status: 500, body: { error: "Backup asta non leggibile." } };
  }
}

export async function writeAuctionState(input) {
  const state = normalizeState(input);
  await fs.mkdir(path.dirname(stateFile), { recursive: true });

  try {
    await fs.copyFile(stateFile, backupFile);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const tempFile = `${stateFile}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, stateFile);
  return { status: 200, body: { ok: true, savedAt: state.savedAt } };
}

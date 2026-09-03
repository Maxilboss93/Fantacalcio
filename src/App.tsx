import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  Download,
  ExternalLink,
  Goal,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy,
  Upload,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  allPlayers,
  AuctionPick,
  auctionRules,
  budgetPlan,
  defaultStatusFor,
  goalkeeperPairs,
  marketUpdates,
  numberFromStat,
  Player,
  postponedMatchInsights,
  results,
  Role,
  roleLabels,
  selectedPlayers,
  sources,
  starsText,
  Status,
  takers
} from "./fantaModel";

type View = "cockpit" | "listone" | "rosa" | "rose" | "avversari" | "coach" | "portieri" | "rigoristi" | "risultati" | "mercato" | "fonti";
type SortDirection = "asc" | "desc";
type SortKey = "priority" | "role" | "name" | "team" | "profile" | "stars" | "maxBid" | "paid" | "status" | "goals" | "assists" | "fm" | "fvm";
type SortState = { key: SortKey; direction: SortDirection };
type CoachRole = "user" | "assistant" | "system";
type CoachMessage = {
  id: string;
  role: CoachRole;
  text: string;
  meta?: string;
};
type ManagerVibe = "Freddo" | "Equilibrata" | "Tifoso" | "Aggressivo" | "Panic buyer" | "Risparmiatore";
type ManagerProfile = {
  id: string;
  name: string;
  heartTeam: string;
  vibe: ManagerVibe;
  budget: number;
};
type ManagerRow = {
  manager: ManagerProfile;
  players: Player[];
  spent: number;
  spentByRole: Record<Role, number>;
  remainingBudget: number;
  remainingSlots: number;
  maxSingle: number;
  countByRole: Record<Role, number>;
  estimatedPush: number;
  reading: string;
  roleBudgetPressure: OpponentRoleBudgetPressure | null;
};
type OpponentRoleBudgetPressure = {
  role: Role;
  roleBudget: number;
  roleSpent: number;
  roleBought: number;
  roleSlots: number;
  roleSlotsLeft: number;
  ceiling: number;
  usedPct: number;
  concentrated: boolean;
  reading: string;
};
type AuctionMemoryEvent = {
  id: string;
  createdAt: string;
  text: string;
  managerIds: string[];
  playerName?: string;
  playerRole?: Role;
  playerTeam?: string;
  tags: string[];
  intensity: number;
};
type DetectedAssignment = {
  player: Player;
  manager: ManagerProfile;
  paid: number;
};
type BulkAssignParse = {
  isBulk: boolean;
  assignments: DetectedAssignment[];
  skippedLines: string[];
};
type ManagerLearning = {
  managerId: string;
  notes: number;
  overpaySignals: number;
  bidWarSignals: number;
  oneCreditSignals: number;
  bugSignals: number;
  roleBias: Record<Role, number>;
  heat: number;
  summary: string;
};
type CallTurn = {
  order: string[];
  currentCallerId: string;
};
type LiveState = {
  exportedAt?: string;
  savedAt?: string;
  version?: number;
  auction: Record<string, AuctionPick>;
  managers: ManagerProfile[];
  callTurn: CallTurn;
  auctionMemory?: AuctionMemoryEvent[];
};

const storageKey = "fantacalcio-asta-2026-27-state";
const managerStorageKey = "fantacalcio-asta-2026-27-managers";
const callTurnStorageKey = "fantacalcio-asta-2026-27-call-turn";
const auctionMemoryStorageKey = "fantacalcio-asta-2026-27-memory";
const views: View[] = ["cockpit", "listone", "rosa", "rose", "avversari", "coach", "portieri", "rigoristi", "risultati", "mercato", "fonti"];
const statuses: Status[] = ["Da chiamare", "Monitor", "Comprato", "Perso", "Evita", "Consigliato"];
const roleOrder: Role[] = ["P", "D", "C", "A"];
const profileOptions = ["Tutti", "Titolare", "Titolare low cost", "Ballottaggio", "Secondo portiere", "Terzo portiere", "Riserva"];
const recommendationBlockedStatuses = new Set<Status>(["Comprato", "Perso", "Evita", "Consigliato"]);
const vibeOptions: ManagerVibe[] = ["Freddo", "Equilibrata", "Tifoso", "Aggressivo", "Panic buyer", "Risparmiatore"];
const defaultManagers: ManagerProfile[] = [
  { id: "me", name: "Io", heartTeam: "MIL", vibe: "Equilibrata", budget: 500 },
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `rival-${index + 1}`,
    name: `Avversario ${index + 1}`,
    heartTeam: "",
    vibe: "Equilibrata" as ManagerVibe,
    budget: 500
  }))
];

function initialCoachMessages(): CoachMessage[] {
  return [
    {
      id: "coach-welcome",
      role: "assistant",
      text: "Dimmi chi sta uscendo, chi rilancia e a che prezzo siamo. Posso consigliarti lo stop price oppure registrare comandi tipo: segna Samardzic ad Avversario 1 per 18."
    }
  ];
}

function normalizeCallOrder(order: unknown, managers: ManagerProfile[] = defaultManagers) {
  const validIds = new Set(managers.map((manager) => manager.id));
  const parsedOrder = Array.isArray(order) ? order.filter((id): id is string => typeof id === "string" && validIds.has(id)) : [];
  const uniqueOrder = Array.from(new Set(parsedOrder));
  const missingIds = managers.map((manager) => manager.id).filter((id) => !uniqueOrder.includes(id));
  return [...uniqueOrder, ...missingIds];
}

function viewFromHash(): View {
  const hash = window.location.hash.replace("#", "") as View;
  return views.includes(hash) ? hash : "cockpit";
}

function loadAuction(): Record<string, AuctionPick> {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function normalizeManagers(input: unknown): ManagerProfile[] {
  if (!Array.isArray(input)) return defaultManagers;
  return defaultManagers.map((fallback, index) => ({
    ...fallback,
    ...(input[index] ?? {}),
    id: fallback.id,
    budget: Number(input[index]?.budget ?? fallback.budget) || fallback.budget,
    vibe: vibeOptions.includes(input[index]?.vibe) ? input[index].vibe : fallback.vibe
  }));
}

function normalizeAuctionMemory(input: unknown): AuctionMemoryEvent[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((event): event is Partial<AuctionMemoryEvent> => Boolean(event) && typeof event === "object")
    .map((event) => ({
      id: typeof event.id === "string" ? event.id : crypto.randomUUID(),
      createdAt: typeof event.createdAt === "string" ? event.createdAt : new Date().toISOString(),
      text: String(event.text ?? "").slice(0, 500),
      managerIds: Array.isArray(event.managerIds) ? event.managerIds.filter((id): id is string => typeof id === "string") : [],
      playerName: typeof event.playerName === "string" ? event.playerName : undefined,
      playerRole: roleOrder.includes(event.playerRole as Role) ? event.playerRole as Role : undefined,
      playerTeam: typeof event.playerTeam === "string" ? event.playerTeam : undefined,
      tags: Array.isArray(event.tags) ? event.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 6) : [],
      intensity: Math.max(1, Math.min(5, Number(event.intensity) || 1))
    }))
    .filter((event) => event.text && event.managerIds.length)
    .slice(-80);
}

function normalizeLiveState(input: unknown): LiveState | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const parsed = input as Partial<LiveState>;
  const nextAuction = parsed.auction ?? input;
  if (!nextAuction || typeof nextAuction !== "object" || Array.isArray(nextAuction)) return null;

  const managers = normalizeManagers(parsed.managers);
  const importedOrder = normalizeCallOrder(parsed.callTurn?.order, managers);
  return {
    exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : undefined,
    savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : undefined,
    version: typeof parsed.version === "number" ? parsed.version : undefined,
    auction: nextAuction as Record<string, AuctionPick>,
    managers,
    callTurn: {
      order: importedOrder,
      currentCallerId: importedOrder.includes(parsed.callTurn?.currentCallerId ?? "")
        ? parsed.callTurn?.currentCallerId ?? importedOrder[0]
        : importedOrder[0]
    },
    auctionMemory: normalizeAuctionMemory(parsed.auctionMemory)
  };
}

function loadManagers(): ManagerProfile[] {
  try {
    const raw = localStorage.getItem(managerStorageKey);
    if (!raw) return defaultManagers;
    const parsed = JSON.parse(raw);
    return normalizeManagers(parsed);
  } catch {
    return defaultManagers;
  }
}

function loadCallTurn(): CallTurn {
  const fallbackOrder = normalizeCallOrder(undefined);
  try {
    const raw = localStorage.getItem(callTurnStorageKey);
    const parsed = raw ? JSON.parse(raw) : {};
    const order = normalizeCallOrder(parsed.order);
    return {
      order,
      currentCallerId: order.includes(parsed.currentCallerId) ? parsed.currentCallerId : order[0]
    };
  } catch {
    return {
      order: fallbackOrder,
      currentCallerId: fallbackOrder[0]
    };
  }
}

function loadAuctionMemory(): AuctionMemoryEvent[] {
  try {
    const raw = localStorage.getItem(auctionMemoryStorageKey);
    return raw ? normalizeAuctionMemory(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function pickKey(player: Player) {
  return `${player.name}|${player.team}|${player.role}`;
}

function hasCurrentSeasonStats(player: Player) {
  return numberFromStat(player.stats26?.pv) > 0;
}

function visibleStat(player: Player, key: "gol" | "ass" | "fm") {
  const stats = hasCurrentSeasonStats(player) ? player.stats26 : player.stats25;
  return numberFromStat(stats?.[key]);
}

function isOverpaid(player: Player, pick?: AuctionPick) {
  return pick?.paid !== undefined && pick.paid > player.maxBid;
}

function formatMoney(value: number) {
  return value.toLocaleString("it-IT", { maximumFractionDigits: 0 });
}

function ownerMatches(pick: AuctionPick | undefined, manager: ManagerProfile) {
  if (!pick) return false;
  return pick.ownerId === manager.id || (!pick.ownerId && pick.owner === manager.name);
}

function pickHasOwner(pick: AuctionPick | undefined) {
  return Boolean(pick?.ownerId || pick?.owner);
}

function managerVibeBonus(vibe: ManagerVibe) {
  return {
    Freddo: -6,
    Equilibrata: 0,
    Tifoso: 8,
    Aggressivo: 12,
    "Panic buyer": 18,
    Risparmiatore: -12
  }[vibe];
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectAssignIntent(message: string, managers: ManagerProfile[]): DetectedAssignment | null {
  const normalized = normalizeText(message);
  if (!/\b(segna|assegna|preso|presa|comprato|comprata|pagato|pagata)\b/.test(normalized)) return null;

  const player = [...allPlayers]
    .sort((a, b) => b.name.length - a.name.length)
    .find((item) => normalized.includes(normalizeText(item.name)));
  const manager = [...managers]
    .sort((a, b) => b.name.length - a.name.length)
    .find((item) => normalized.includes(normalizeText(item.name)));
  const prices = Array.from(normalized.matchAll(/\b(\d{1,3})\b/g))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);
  const paid = prices.at(-1);

  if (!player || !manager || !paid) return null;
  return { player, manager, paid };
}

function parseBulkAssignCommands(message: string, managers: ManagerProfile[]): BulkAssignParse {
  const lines = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return { isBulk: false, assignments: [], skippedLines: [] };

  const parsedLines = lines.map((line) => {
    const looksLikeAssignment = /\b(segna|assegna|preso|presa|comprato|comprata|pagato|pagata)\b/.test(normalizeText(line));
    const detected = looksLikeAssignment && isSimpleAssignCommand(line) ? detectAssignIntent(line, managers) : null;
    return { line, detected, looksLikeAssignment };
  });
  const isBulk = parsedLines.some((item) => item.looksLikeAssignment);

  return {
    isBulk,
    assignments: parsedLines.map((item) => item.detected).filter((item): item is DetectedAssignment => Boolean(item)),
    skippedLines: parsedLines.filter((item) => item.looksLikeAssignment && !item.detected).map((item) => item.line)
  };
}

function inferAuctionMemoryEvent(message: string, managers: ManagerProfile[]): AuctionMemoryEvent | null {
  const normalized = normalizeText(message);
  const signalWords = /\b(strapag|strapagato|strapagata|rilancio|rilanci|rilanciando|rilancia|guerra|scaten|forte|aggressivo|aggressiva|impazzito|impazzita|overpay|sovrapprezzo|uno alla volta|1 credito|bluff|finta|punta sempre)\b/;
  if (!signalWords.test(normalized)) return null;

  const managerIds = managers
    .filter((manager) => manager.id !== "me")
    .filter((manager) => normalized.includes(normalizeText(manager.name)))
    .map((manager) => manager.id);
  if (!managerIds.length) return null;

  const player = [...allPlayers]
    .sort((a, b) => b.name.length - a.name.length)
    .find((item) => normalized.includes(normalizeText(item.name)));
  const tags = [
    /\b(strapag|strapagato|strapagata|overpay|sovrapprezzo)\b/.test(normalized) ? "overpay" : "",
    /\b(guerra|scaten|duello)\b/.test(normalized) ? "guerra rilanci" : "",
    /\b(rilancio|rilanci|rilanciando|rilancia)\b/.test(normalized) ? "rilanci forti" : "",
    /\b(uno alla volta|1 credito)\b/.test(normalized) ? "salite da 1" : "",
    /\b(bluff|finta)\b/.test(normalized) ? "bluff" : "",
    player?.role === "C" && player.roleBug?.kind === "C-attacco" ? "bug attacco" : "",
    player?.role === "D" && player.roleBug?.kind === "D-centrocampo" ? "bug esterno" : ""
  ].filter(Boolean);
  const intensity = Math.min(5, 1 + tags.length + (/\b(scaten|guerra|impazzit|forte)\b/.test(normalized) ? 1 : 0));

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    text: message.slice(0, 500),
    managerIds,
    playerName: player?.name,
    playerRole: player?.role,
    playerTeam: player?.team,
    tags,
    intensity
  };
}

function summarizeAuctionMemory(memory: AuctionMemoryEvent[], managers: ManagerProfile[]): ManagerLearning[] {
  return managers
    .filter((manager) => manager.id !== "me")
    .map((manager) => {
      const events = memory.filter((event) => event.managerIds.includes(manager.id));
      const roleBias = roleOrder.reduce<Record<Role, number>>((counts, role) => {
        counts[role] = events.filter((event) => event.playerRole === role).length;
        return counts;
      }, { P: 0, D: 0, C: 0, A: 0 });
      const overpaySignals = events.filter((event) => event.tags.includes("overpay")).length;
      const bidWarSignals = events.filter((event) => event.tags.includes("guerra rilanci") || event.tags.includes("rilanci forti")).length;
      const oneCreditSignals = events.filter((event) => event.tags.includes("salite da 1")).length;
      const bugSignals = events.filter((event) => event.tags.includes("bug attacco") || event.tags.includes("bug esterno")).length;
      const heat = events.reduce((sum, event) => sum + event.intensity, 0);
      const strongestRole = roleOrder
        .filter((role) => roleBias[role] > 0)
        .sort((a, b) => roleBias[b] - roleBias[a])[0];
      const bits = [];
      if (overpaySignals) bits.push(`strapaga ${overpaySignals}x`);
      if (bidWarSignals) bits.push(`rilancia forte ${bidWarSignals}x`);
      if (oneCreditSignals) bits.push("sale spesso da 1");
      if (bugSignals) bits.push("sensibile ai bug di listone");
      if (strongestRole) bits.push(`focus ${roleLabels[strongestRole]}`);
      return {
        managerId: manager.id,
        notes: events.length,
        overpaySignals,
        bidWarSignals,
        oneCreditSignals,
        bugSignals,
        roleBias,
        heat,
        summary: bits.length ? bits.join(" · ") : "nessun pattern forte"
      };
    });
}

function memoryPushBonus(player: Player | null, learning?: ManagerLearning) {
  if (!player || !learning || !learning.notes) return 0;
  const roleHeat = learning.roleBias[player.role] * 3;
  const overpayHeat = Math.min(14, learning.overpaySignals * 5);
  const warHeat = Math.min(12, learning.bidWarSignals * 4);
  const oneCreditHeat = Math.min(4, learning.oneCreditSignals * 2);
  const bugHeat = player.roleBug && learning.bugSignals ? Math.min(8, learning.bugSignals * 4) : 0;
  return Math.min(24, roleHeat + overpayHeat + warHeat + oneCreditHeat + bugHeat);
}

function opponentRoleBudgetPressure(player: Player | null, spentByRole: Record<Role, number>, countByRole: Record<Role, number>): OpponentRoleBudgetPressure | null {
  if (!player) return null;
  const plan = budgetPlan.find((row) => row.role === player.role);
  if (!plan || plan.role === "R") return null;

  const roleSpent = spentByRole[player.role];
  const roleBought = countByRole[player.role];
  const roleSlotsLeft = Math.max(0, plan.slots - roleBought);
  const roleBudgetLeft = plan.budget - roleSpent;
  const minimumAfterThisPlayer = Math.max(0, roleSlotsLeft - 1);
  const ceiling = roleSlotsLeft <= 0 ? 0 : Math.max(0, roleBudgetLeft - minimumAfterThisPlayer);
  const usedPct = plan.budget > 0 ? Math.round((roleSpent / plan.budget) * 100) : 0;
  const concentrated = roleBought > 0 && roleBought <= 2 && usedPct >= 45;
  const reading = roleSlotsLeft <= 0
    ? "reparto pieno"
    : ceiling <= Math.max(1, player.openBid)
      ? "budget reparto quasi finito"
      : usedPct >= 90 || ceiling < player.maxBid * 0.45
        ? "budget reparto consumato"
        : usedPct >= 70 || ceiling < player.maxBid * 0.7
          ? "budget reparto stretto"
          : concentrated
            ? "spesa concentrata nel reparto"
            : "budget reparto libero";

  return {
    role: player.role,
    roleBudget: plan.budget,
    roleSpent,
    roleBought,
    roleSlots: plan.slots,
    roleSlotsLeft,
    ceiling,
    usedPct,
    concentrated,
    reading
  };
}

function applyBudgetPressureToEstimate(estimate: number, learnedBonus: number, pressure: OpponentRoleBudgetPressure | null) {
  if (!pressure) return estimate;
  if (pressure.roleSlotsLeft <= 0) return 0;
  const aggressionSlack = learnedBonus >= 12 ? Math.min(8, Math.round(learnedBonus / 3)) : 0;
  return Math.max(0, Math.min(estimate, pressure.ceiling + aggressionSlack));
}

function isSimpleAssignCommand(message: string) {
  const normalized = normalizeText(message);
  const strategyWords = /\b(rilancio|rilancia|rilanciare|spingo|spingermi|quanto|massimo|max|stop|consiglio|conviene|meglio|rischio|alternativa|chiamo|chiamare|priorita|aspettare)\b/;
  return !message.includes("?") && !strategyWords.test(normalized);
}

function playerStatus(player: Player, auction: Record<string, AuctionPick>): Status {
  return auction[pickKey(player)]?.status ?? defaultStatusFor(player);
}

type Recommendation = {
  player: Player;
  liveMax: number;
  reason: string;
};

function recommendNextPlayer(auction: Record<string, AuctionPick>, excludeKey = ""): Recommendation | null {
  const bought = allPlayers.filter((player) => playerStatus(player, auction) === "Comprato");
  const spentByRole = roleOrder.reduce<Record<Role, number>>((totals, role) => {
    totals[role] = bought
      .filter((player) => player.role === role)
      .reduce((sum, player) => sum + (auction[pickKey(player)]?.paid ?? 0), 0);
    return totals;
  }, { P: 0, D: 0, C: 0, A: 0 });
  const boughtCountByRole = roleOrder.reduce<Record<Role, number>>((counts, role) => {
    counts[role] = bought.filter((player) => player.role === role).length;
    return counts;
  }, { P: 0, D: 0, C: 0, A: 0 });
  const remaining = 500 - bought.reduce((sum, player) => sum + (auction[pickKey(player)]?.paid ?? 0), 0);
  const activeRole = roleOrder.find((role) => boughtCountByRole[role] < (budgetPlan.find((row) => row.role === role)?.slots ?? 0));
  const completed = roleOrder.filter((role) => boughtCountByRole[role] >= (budgetPlan.find((row) => row.role === role)?.slots ?? 0));

  function liveMaxFor(player: Player) {
    const plan = budgetPlan.find((row) => row.role === player.role);
    if (!plan) return 0;
    const otherNeeds = roleOrder
      .filter((otherRole) => otherRole !== player.role)
      .reduce((sum, otherRole) => {
        const otherPlan = budgetPlan.find((row) => row.role === otherRole);
        if (!otherPlan) return sum;
        const slotsLeft = Math.max(0, otherPlan.slots - boughtCountByRole[otherRole]);
        if (!slotsLeft) return sum;
        return sum + Math.max(slotsLeft, Math.max(0, otherPlan.budget - spentByRole[otherRole]));
      }, 0);
    const slotsAfterPurchase = Math.max(0, plan.slots - boughtCountByRole[player.role] - 1);
    return Math.max(0, remaining - otherNeeds - slotsAfterPurchase);
  }

  const centerBonusBought = bought.filter((player) => player.role === "C" && (player.penaltyRank === 1 || player.setPieceRank === 1 || player.stars >= 4)).length;
  const attackTopBought = bought.some((player) => player.role === "A" && player.stars >= 5);
  const attackSemiTopBought = bought.some((player) => player.role === "A" && player.stars >= 4);

  const candidates = selectedPlayers
    .filter((player) => pickKey(player) !== excludeKey)
    .filter((player) => !recommendationBlockedStatuses.has(playerStatus(player, auction)))
    .filter((player) => activeRole ? player.role === activeRole : false)
    .filter((player) => {
      const plan = budgetPlan.find((row) => row.role === player.role);
      return plan ? boughtCountByRole[player.role] < plan.slots : false;
    })
    .map((player) => {
      const liveMax = liveMaxFor(player);
      const marketCommitment = player.role === "A" && player.stars >= 5 ? auctionRules.firstBandAttackMin : player.openBid;
      const affordable = liveMax >= marketCommitment;
      const roleNeed = (budgetPlan.find((row) => row.role === player.role)?.slots ?? 0) - boughtCountByRole[player.role];
      const attackStructure = player.role === "A"
        ? (!attackTopBought && player.stars >= 5 ? 160 : !attackSemiTopBought && player.stars >= 4 ? 110 : 0)
        : 0;
      const midfieldStructure = player.role === "C" && centerBonusBought < 3 && (player.penaltyRank === 1 || player.setPieceRank === 1 || player.stars >= 4) ? 34 : 0;
      const quality = player.stars * 13 + Math.min(30, player.score / 4);
      const rolePriority = player.role === activeRole ? 45 : 0;
      const budgetFit = Math.min(24, (liveMax / Math.max(1, player.maxBid)) * 24);
      const bonusSignal = (player.penaltyRank === 1 ? 12 : 0) + (player.setPieceRank === 1 ? 8 : 0);
      const injuryRisk = player.injury ? { Alta: 70, Media: 34, Bassa: 12 }[player.injury.impact] : 0;
      return {
        player,
        liveMax,
        affordable,
        rank: (affordable ? 300 : -200) + rolePriority + roleNeed * 7 + attackStructure + midfieldStructure + quality + budgetFit + bonusSignal - injuryRisk
      };
    })
    .filter((candidate) => candidate.affordable)
    .sort((a, b) => b.rank - a.rank || b.player.score - a.player.score || a.player.name.localeCompare(b.player.name));

  const choice = candidates[0];
  if (!choice) return null;

  const { player, liveMax } = choice;
  const reasons = [activeRole === player.role ? `reparto prioritario: ${roleLabels[player.role]}` : `completa il reparto ${roleLabels[player.role]}`];
  if (player.role === "A" && !attackTopBought && player.stars >= 5) reasons.push(`copre il top di fascia 1: in lega da ${auctionRules.participants} il mercato parte da ${auctionRules.firstBandAttackMin}+`);
  else if (player.role === "A" && !attackSemiTopBought && player.stars >= 4) reasons.push("copre il target semitop in attacco");
  if (player.role === "C" && centerBonusBought < 3 && (player.penaltyRank === 1 || player.setPieceRank === 1 || player.stars >= 4)) reasons.push("aiuta l'obiettivo bonus a centrocampo");
  if (player.penaltyRank === 1) reasons.push("primo rigorista");
  else if (player.setPieceRank === 1) reasons.push("piazzati importanti");
  if (player.injury) reasons.push(`rischio fisico ${player.injury.impact.toLowerCase()} gia scontato`);
  reasons.push(`massimo live ${formatMoney(liveMax)}`);
  return { player, liveMax, reason: reasons.join(" · ") };
}

export function App() {
  const [view, setView] = useState<View>(() => viewFromHash());
  const [auction, setAuction] = useState<Record<string, AuctionPick>>(() => loadAuction());
  const [managers, setManagers] = useState<ManagerProfile[]>(() => loadManagers());
  const [callTurn, setCallTurn] = useState<CallTurn>(() => loadCallTurn());
  const [auctionMemory, setAuctionMemory] = useState<AuctionMemoryEvent[]>(() => loadAuctionMemory());
  const [callTurnNotice, setCallTurnNotice] = useState("");
  const [livePlayerName, setLivePlayerName] = useState("");
  const [liveManagerId, setLiveManagerId] = useState("me");
  const [livePrice, setLivePrice] = useState("");
  const [coachInput, setCoachInput] = useState("");
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(() => initialCoachMessages());
  const [coachLoading, setCoachLoading] = useState(false);
  const coachRequestRef = useRef(0);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "Tutti">("Tutti");
  const [team, setTeam] = useState("Tutte");
  const [profile, setProfile] = useState("Tutti");
  const [onlyTargets, setOnlyTargets] = useState(true);
  const [onlyPenalty, setOnlyPenalty] = useState(false);
  const [sortState, setSortState] = useState<SortState>({ key: "priority", direction: "desc" });
  const [selectedGoalkeeper, setSelectedGoalkeeper] = useState<Player | null>(null);
  const [serverStateReady, setServerStateReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Backup browser attivo");

  useEffect(() => {
    let cancelled = false;

    async function loadServerState() {
      try {
        const response = await fetch("/api/state", { headers: { accept: "application/json" } });
        if (!response.ok) throw new Error("Backup server non disponibile");

        const data = await response.json();
        const serverState = normalizeLiveState(data.state);
        if (!cancelled && serverState) {
          setAuction(serverState.auction);
          setManagers(serverState.managers);
          setCallTurn(serverState.callTurn);
          setAuctionMemory(serverState.auctionMemory ?? []);
          setSyncStatus("Backup server caricato");
        } else if (!cancelled) {
          setSyncStatus("Backup server pronto");
        }
      } catch {
        if (!cancelled) setSyncStatus("Backup solo browser");
      } finally {
        if (!cancelled) setServerStateReady(true);
      }
    }

    loadServerState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(auction));
  }, [auction]);

  useEffect(() => {
    localStorage.setItem(managerStorageKey, JSON.stringify(managers));
  }, [managers]);

  useEffect(() => {
    localStorage.setItem(auctionMemoryStorageKey, JSON.stringify(auctionMemory));
  }, [auctionMemory]);

  useEffect(() => {
    const order = normalizeCallOrder(callTurn.order, managers);
    const currentCallerId = order.includes(callTurn.currentCallerId) ? callTurn.currentCallerId : order[0];
    localStorage.setItem(callTurnStorageKey, JSON.stringify({ order, currentCallerId }));
  }, [callTurn, managers]);

  useEffect(() => {
    if (!serverStateReady) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      const order = normalizeCallOrder(callTurn.order, managers);
      const currentCallerId = order.includes(callTurn.currentCallerId) ? callTurn.currentCallerId : order[0];
      try {
        const response = await fetch("/api/state", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            state: {
              exportedAt: new Date().toISOString(),
              auction,
              managers,
              callTurn: { order, currentCallerId },
              auctionMemory
            }
          }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Salvataggio server fallito");
        const data = await response.json();
        setSyncStatus(typeof data.savedAt === "string" ? `Backup server ${new Date(data.savedAt).toLocaleTimeString("it-IT")}` : "Backup server salvato");
      } catch {
        if (!controller.signal.aborted) setSyncStatus("Backup solo browser");
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [auction, auctionMemory, callTurn, managers, serverStateReady]);

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const hasQuery = query.trim().length > 0;
  const basePlayers = onlyTargets && !hasQuery ? selectedPlayers : allPlayers;

  const filteredPlayers = useMemo(() => {
    const text = query.trim().toLowerCase();
    return basePlayers
      .filter((player) => role === "Tutti" || player.role === role)
      .filter((player) => team === "Tutte" || player.team === team)
      .filter((player) => profile === "Tutti" || (profile === "Ballottaggio" ? player.profile.startsWith("Ballottaggio con") : player.profile === profile))
      .filter((player) => !onlyPenalty || player.penaltyRank === 1)
      .filter((player) => {
        if (!text) return true;
        return [
          player.name,
          player.team,
          player.role,
          player.note,
          player.profile,
          player.injury?.concern,
          player.injury?.recovery,
          player.scouting?.origin,
          player.scouting?.lastSeason,
          player.scouting?.verdict
        ].some((value) =>
        String(value).toLowerCase().includes(text)
      );
    })
      .sort((a, b) => {
        return comparePlayers(a, b, sortState, auction);
      });
  }, [auction, basePlayers, onlyPenalty, profile, query, role, sortState, team]);

  const myManager = managers[0];
  const teamOptions = useMemo(() => Array.from(new Set(allPlayers.map((player) => player.team))).sort(), []);
  const takenPlayerKeys = useMemo(() => new Set(
    Object.entries(auction)
      .filter(([, pick]) => pick.status === "Comprato" || pick.status === "Perso" || pickHasOwner(pick))
      .map(([key]) => key)
  ), [auction]);
  const takenCount = takenPlayerKeys.size;

  const bought = useMemo(() => {
    return allPlayers
      .filter((player) => {
        const pick = auction[pickKey(player)];
        return pick?.status === "Comprato" && (!pickHasOwner(pick) || ownerMatches(pick, myManager));
      })
      .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) || a.name.localeCompare(b.name));
  }, [auction, myManager]);

  const totalSpent = bought.reduce((sum, player) => sum + (auction[pickKey(player)]?.paid ?? 0), 0);
  const totalBudget = 500;
  const remaining = totalBudget - totalSpent;

  const spentByRole = roleOrder.reduce<Record<Role, number>>((totals, role) => {
    totals[role] = bought
      .filter((player) => player.role === role)
      .reduce((sum, player) => sum + (auction[pickKey(player)]?.paid ?? 0), 0);
    return totals;
  }, { P: 0, D: 0, C: 0, A: 0 });
  const boughtCountByRole = roleOrder.reduce<Record<Role, number>>((counts, role) => {
    counts[role] = bought.filter((player) => player.role === role).length;
    return counts;
  }, { P: 0, D: 0, C: 0, A: 0 });
  const activeRole = roleOrder.find((role) => boughtCountByRole[role] < (budgetPlan.find((row) => row.role === role)?.slots ?? 0));
  const completedRoles = roleOrder.filter((role) => boughtCountByRole[role] >= (budgetPlan.find((row) => row.role === role)?.slots ?? 0));
  const reallocationPool = completedRoles.reduce((sum, role) => {
    const planned = budgetPlan.find((row) => row.role === role)?.budget ?? 0;
    return sum + planned - spentByRole[role];
  }, 0);

  function smartMaxForRole(role: Role) {
    const otherNeeds = roleOrder
      .filter((otherRole) => otherRole !== role)
      .reduce((sum, otherRole) => {
        const plan = budgetPlan.find((row) => row.role === otherRole);
        if (!plan) return sum;
        const slotsLeft = Math.max(0, plan.slots - boughtCountByRole[otherRole]);
        if (slotsLeft === 0) return sum;
        return sum + Math.max(slotsLeft, Math.max(0, plan.budget - spentByRole[otherRole]));
      }, 0);
    return Math.max(0, remaining - otherNeeds);
  }

  function smartMaxBid(player: Player) {
    const pick = auction[pickKey(player)];
    if (pick?.status === "Comprato") return pick.paid ?? player.maxBid;
    const slotsAfterPurchase = Math.max(0, (budgetPlan.find((row) => row.role === player.role)?.slots ?? 0) - boughtCountByRole[player.role] - 1);
    return Math.max(0, smartMaxForRole(player.role) - slotsAfterPurchase);
  }

  const recommendation = useMemo(() => {
    const explicit = selectedPlayers.find((player) => playerStatus(player, auction) === "Consigliato" && (!activeRole || player.role === activeRole));
    if (explicit) {
      return {
        player: explicit,
        liveMax: smartMaxBid(explicit),
        reason: `scelta mantenuta dopo gli acquisti · reparto ${roleLabels[explicit.role]} · massimo live ${formatMoney(smartMaxBid(explicit))}`
      };
    }
    return recommendNextPlayer(auction);
  }, [activeRole, auction]);

  const protectedFuture = activeRole
    ? roleOrder.slice(roleOrder.indexOf(activeRole) + 1).reduce((sum, role) => {
        const plan = budgetPlan.find((row) => row.role === role);
        if (!plan) return sum;
        const slotsLeft = Math.max(0, plan.slots - boughtCountByRole[role]);
        return sum + (slotsLeft ? Math.max(slotsLeft, Math.max(0, plan.budget - spentByRole[role])) : 0);
      }, 0)
    : 0;
  const activeBudget = activeRole ? Math.max(0, remaining - protectedFuture) : 0;

  const roleStats = budgetPlan.map((row) => {
    if (row.role === "R") {
      return { ...row, bought: 0, spent: 0, remaining: row.budget, smartRemaining: 0, fill: 0 };
    }
    const boughtByRole = boughtCountByRole[row.role];
    const spent = spentByRole[row.role];
    const remainingSlots = Math.max(0, row.slots - boughtByRole);
    return {
      ...row,
      bought: boughtByRole,
      spent,
      remaining: row.budget - spent,
      smartRemaining: remainingSlots && row.role === activeRole ? activeBudget : Math.max(0, row.budget - spent),
      fill: Math.min(100, Math.round((boughtByRole / row.slots) * 100))
    };
  });

  const selectedLivePlayer = useMemo(() => {
    const normalized = livePlayerName.trim().toLowerCase();
    if (!normalized) return null;
    return allPlayers.find((player) => player.name.toLowerCase() === normalized)
      ?? allPlayers.find((player) => player.name.toLowerCase().includes(normalized))
      ?? null;
  }, [livePlayerName]);

  const managerLearning = useMemo(() => summarizeAuctionMemory(auctionMemory, managers), [auctionMemory, managers]);

  const managerRows = useMemo<ManagerRow[]>(() => managers.map((manager) => {
    const players = allPlayers.filter((player) => ownerMatches(auction[pickKey(player)], manager));
    const spent = players.reduce((sum, player) => sum + (auction[pickKey(player)]?.paid ?? 0), 0);
    const spentByRole = roleOrder.reduce<Record<Role, number>>((totals, role) => {
      totals[role] = players
        .filter((player) => player.role === role)
        .reduce((sum, player) => sum + (auction[pickKey(player)]?.paid ?? 0), 0);
      return totals;
    }, { P: 0, D: 0, C: 0, A: 0 });
    const countByRole = roleOrder.reduce<Record<Role, number>>((counts, role) => {
      counts[role] = players.filter((player) => player.role === role).length;
      return counts;
    }, { P: 0, D: 0, C: 0, A: 0 });
    const remainingBudget = Math.max(0, manager.budget - spent);
    const remainingSlots = Math.max(0, 25 - players.length);
    const maxSingle = Math.max(0, remainingBudget - Math.max(0, remainingSlots - 1));
    const heartBonus = selectedLivePlayer && manager.heartTeam === selectedLivePlayer.team ? Math.round(selectedLivePlayer.maxBid * 0.22) : 0;
    const vibeBonus = selectedLivePlayer ? managerVibeBonus(manager.vibe) : 0;
    const learning = managerLearning.find((item) => item.managerId === manager.id);
    const learnedBonus = memoryPushBonus(selectedLivePlayer, learning);
    const roleBudgetPressure = opponentRoleBudgetPressure(selectedLivePlayer, spentByRole, countByRole);
    const rawEstimatedPush = selectedLivePlayer ? Math.max(0, Math.min(maxSingle, selectedLivePlayer.maxBid + heartBonus + vibeBonus + learnedBonus)) : 0;
    const estimatedPush = applyBudgetPressureToEstimate(rawEstimatedPush, learnedBonus, roleBudgetPressure);
    return {
      manager,
      players,
      spent,
      spentByRole,
      remainingBudget,
      remainingSlots,
      maxSingle,
      countByRole,
      estimatedPush,
      roleBudgetPressure,
      reading: selectedLivePlayer
        ? roleBudgetPressure && roleBudgetPressure.reading !== "budget reparto libero" && roleBudgetPressure.ceiling < selectedLivePlayer.maxBid
          ? `${roleBudgetPressure.reading}: ${formatMoney(roleBudgetPressure.roleSpent)}/${formatMoney(roleBudgetPressure.roleBudget)} ${selectedLivePlayer.role}`
          : learnedBonus >= 8
          ? `pattern caldo: ${learning?.summary ?? "memoria asta"}`
          : estimatedPush >= selectedLivePlayer.maxBid + 10
          ? "rischio rilancio"
          : estimatedPush >= selectedLivePlayer.maxBid
            ? "arriva al tuo max"
            : "probabile sotto"
        : "seleziona giocatore"
    };
  }), [auction, managerLearning, managers, selectedLivePlayer]);

  const callOrder = useMemo(() => normalizeCallOrder(callTurn.order, managers), [callTurn.order, managers]);
  const currentCallerId = callOrder.includes(callTurn.currentCallerId) ? callTurn.currentCallerId : callOrder[0];
  const currentCaller = managers.find((manager) => manager.id === currentCallerId) ?? managers[0];
  const nextCallerId = callOrder[(callOrder.indexOf(currentCallerId) + 1) % callOrder.length] ?? currentCallerId;
  const nextCaller = managers.find((manager) => manager.id === nextCallerId) ?? currentCaller;
  const currentCallNumber = Math.max(1, callOrder.indexOf(currentCallerId) + 1);

  function nextCallerMessage(nextManager = nextCaller) {
    return `Prossima chiamata: ${nextManager.name}.`;
  }

  function advanceCallTurn() {
    const nextId = nextCallerId;
    const nextManager = managers.find((manager) => manager.id === nextId) ?? currentCaller;
    setCallTurn({ order: callOrder, currentCallerId: nextId });
    const message = nextCallerMessage(nextManager);
    setCallTurnNotice(message);
    return message;
  }

  function advanceCallTurnBy(steps: number) {
    if (steps <= 0 || !callOrder.length) return "";
    const currentIndex = Math.max(0, callOrder.indexOf(currentCallerId));
    const nextId = callOrder[(currentIndex + steps) % callOrder.length] ?? currentCallerId;
    const nextManager = managers.find((manager) => manager.id === nextId) ?? currentCaller;
    setCallTurn({ order: callOrder, currentCallerId: nextId });
    const message = `Assegnazioni massive registrate: ${steps}. Ora chiama: ${nextManager.name}.`;
    setCallTurnNotice(message);
    return message;
  }

  function updateCurrentCaller(id: string) {
    if (!callOrder.includes(id)) return;
    setCallTurn({ order: callOrder, currentCallerId: id });
    const manager = managers.find((item) => item.id === id);
    setCallTurnNotice(manager ? `Ora chiama: ${manager.name}.` : "");
  }

  function updateCurrentCallerNumber(position: number) {
    if (!Number.isFinite(position) || !callOrder.length) return;
    const nextIndex = Math.max(0, Math.min(callOrder.length - 1, Math.round(position) - 1));
    const nextCallerFromNumber = callOrder[nextIndex];
    if (nextCallerFromNumber) updateCurrentCaller(nextCallerFromNumber);
  }

  function updateCallerPosition(id: string, position: number) {
    const boundedPosition = Math.max(0, Math.min(callOrder.length - 1, position));
    const nextOrder = callOrder.filter((managerId) => managerId !== id);
    nextOrder.splice(boundedPosition, 0, id);
    const nextCurrentId = nextOrder.includes(currentCallerId) ? currentCallerId : nextOrder[0];
    setCallTurn({ order: nextOrder, currentCallerId: nextCurrentId });
    setCallTurnNotice("");
  }

  function resetCallTurn() {
    const firstCallerId = callOrder[0];
    const firstCaller = managers.find((manager) => manager.id === firstCallerId) ?? managers[0];
    setCallTurn({ order: callOrder, currentCallerId: firstCallerId });
    setCallTurnNotice(firstCaller ? `Ora chiama: ${firstCaller.name}.` : "");
  }

  function localCoachReply(message: string) {
    const normalized = normalizeText(message);
    if (!/\b(chi|cosa|quale)\b/.test(normalized) || !/\b(chiamo|chiamare|chiamata|priorita)\b/.test(normalized)) return null;
    if (!recommendation) {
      return `Ora chiama ${currentCaller.name}. Non ho un target consigliato disponibile: controlla ruoli mancanti e budget residuo prima di aprire una chiamata.\nDopo l'assegnazione tocchera a ${nextCaller.name}.`;
    }
    return [
      `Ora chiama ${currentCaller.name}.`,
      `Chiamerei ${recommendation.player.name} (${recommendation.player.role}, ${recommendation.player.team}) con massimo live ${formatMoney(recommendation.liveMax)}.`,
      recommendation.reason,
      `Dopo l'assegnazione tocchera a ${nextCaller.name}.`
    ].join("\n");
  }

  function updatePick(player: Player, patch: Partial<AuctionPick>) {
    const key = pickKey(player);
    const current = auction[key];
    const nextOwnerId = patch.ownerId ?? current?.ownerId;
    const isMine = !nextOwnerId || nextOwnerId === myManager.id;
    if (patch.status === "Comprato" && current?.status !== "Comprato" && isMine) {
      const paid = patch.paid ?? current?.paid ?? player.openBid;
      const allowed = smartMaxBid(player);
      if (paid > allowed) {
        window.alert(`${player.name} non e sostenibile a ${formatMoney(paid)} crediti: il piano lascia al massimo ${formatMoney(allowed)} per questo acquisto, proteggendo i reparti successivi.`);
        return false;
      }
    }
    const shouldAdvanceTurn = Boolean(patch.ownerId) || (patch.status === "Comprato" && current?.status !== "Comprato");
    setAuction((previousAuction) => {
      const nextAuction: Record<string, AuctionPick> = {
        ...previousAuction,
        [key]: {
          ...(previousAuction[key] ?? { status: defaultStatusFor(player) }),
          ...patch
        }
      };

      const nextPick = nextAuction[key];
      if (nextPick.status === "Comprato" && !pickHasOwner(nextPick)) {
        nextAuction[key] = { ...nextPick, ownerId: myManager.id, owner: myManager.name };
      }

      if (patch.status === "Comprato" && current?.status !== "Comprato") {
        Object.entries(nextAuction).forEach(([pickKeyValue, pick]) => {
          if (pick.status === "Consigliato") {
            nextAuction[pickKeyValue] = { ...pick, status: "Da chiamare" };
          }
        });
        const nextRecommendation = recommendNextPlayer(nextAuction, key);
        if (nextRecommendation) {
          const nextKey = pickKey(nextRecommendation.player);
          nextAuction[nextKey] = {
            ...(nextAuction[nextKey] ?? { status: defaultStatusFor(nextRecommendation.player) }),
            status: "Consigliato"
          };
        }
      }

      return nextAuction;
    });
    if (shouldAdvanceTurn) advanceCallTurn();
    return true;
  }

  function quickBuy(player: Player) {
    const key = pickKey(player);
    const current = auction[key];
    if (current?.status === "Comprato" && ownerMatches(current, myManager)) {
      updatePick(player, { status: "Da chiamare", paid: undefined, owner: undefined, ownerId: undefined });
      return;
    }
    updatePick(player, {
      status: "Comprato",
      paid: current?.paid ?? player.openBid,
      owner: myManager.name,
      ownerId: myManager.id
    });
  }

  function updateManager(id: string, patch: Partial<ManagerProfile>) {
    setManagers((current) => current.map((manager) => manager.id === id ? { ...manager, ...patch } : manager));
    if (patch.name) {
      setAuction((current) => Object.fromEntries(Object.entries(current).map(([key, pick]) => [
        key,
        pick.ownerId === id ? { ...pick, owner: patch.name } : pick
      ])));
    }
  }

  function assignLivePick() {
    const player = selectedLivePlayer;
    const manager = managers.find((item) => item.id === liveManagerId) ?? myManager;
    const paid = Number(livePrice);
    if (!player || !manager || !Number.isFinite(paid) || paid <= 0) {
      window.alert("Seleziona giocatore, persona e cifra prima di assegnare.");
      return;
    }
    const status: Status = manager.id === myManager.id ? "Comprato" : "Perso";
    const assigned = updatePick(player, {
      status,
      paid,
      owner: manager.name,
      ownerId: manager.id
    });
    if (!assigned) return;
    setLivePrice("");
    setQuery(player.name);
  }

  function buildCoachSnapshot(
    auctionState: Record<string, AuctionPick> = auction,
    currentPlayer: Player | null = selectedLivePlayer,
    turnState: CallTurn = { order: callOrder, currentCallerId },
    memoryState: AuctionMemoryEvent[] = auctionMemory
  ) {
    const snapshotLearning = summarizeAuctionMemory(memoryState, managers);
    const snapshotCallOrder = normalizeCallOrder(turnState.order, managers);
    const snapshotCurrentCallerId = snapshotCallOrder.includes(turnState.currentCallerId) ? turnState.currentCallerId : snapshotCallOrder[0];
    const snapshotNextCallerId = snapshotCallOrder[(snapshotCallOrder.indexOf(snapshotCurrentCallerId) + 1) % snapshotCallOrder.length] ?? snapshotCurrentCallerId;
    const snapshotCurrentCaller = managers.find((manager) => manager.id === snapshotCurrentCallerId);
    const snapshotNextCaller = managers.find((manager) => manager.id === snapshotNextCallerId);
    const snapshotBought = allPlayers
      .filter((player) => {
        const pick = auctionState[pickKey(player)];
        return pick?.status === "Comprato" && (!pickHasOwner(pick) || ownerMatches(pick, myManager));
      })
      .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) || a.name.localeCompare(b.name));
    const snapshotSpent = snapshotBought.reduce((sum, player) => sum + (auctionState[pickKey(player)]?.paid ?? 0), 0);
    const snapshotRemaining = totalBudget - snapshotSpent;
    const snapshotSpentByRole = roleOrder.reduce<Record<Role, number>>((totals, role) => {
      totals[role] = snapshotBought
        .filter((player) => player.role === role)
        .reduce((sum, player) => sum + (auctionState[pickKey(player)]?.paid ?? 0), 0);
      return totals;
    }, { P: 0, D: 0, C: 0, A: 0 });
    const snapshotBoughtCountByRole = roleOrder.reduce<Record<Role, number>>((counts, role) => {
      counts[role] = snapshotBought.filter((player) => player.role === role).length;
      return counts;
    }, { P: 0, D: 0, C: 0, A: 0 });
    const snapshotActiveRole = roleOrder.find((role) => snapshotBoughtCountByRole[role] < (budgetPlan.find((row) => row.role === role)?.slots ?? 0));
    const snapshotProtectedFuture = snapshotActiveRole
      ? roleOrder.slice(roleOrder.indexOf(snapshotActiveRole) + 1).reduce((sum, role) => {
          const plan = budgetPlan.find((row) => row.role === role);
          if (!plan) return sum;
          const slotsLeft = Math.max(0, plan.slots - snapshotBoughtCountByRole[role]);
          return sum + (slotsLeft ? Math.max(slotsLeft, Math.max(0, plan.budget - snapshotSpentByRole[role])) : 0);
        }, 0)
      : 0;
    const snapshotActiveBudget = snapshotActiveRole ? Math.max(0, snapshotRemaining - snapshotProtectedFuture) : 0;
    const snapshotRoleStats = budgetPlan.map((row) => {
      if (row.role === "R") {
        return { ...row, bought: 0, spent: 0, remaining: row.budget, smartRemaining: 0 };
      }
      const boughtByRole = snapshotBoughtCountByRole[row.role];
      const spent = snapshotSpentByRole[row.role];
      const remainingSlots = Math.max(0, row.slots - boughtByRole);
      return {
        ...row,
        bought: boughtByRole,
        spent,
        remaining: row.budget - spent,
        smartRemaining: remainingSlots && row.role === snapshotActiveRole ? snapshotActiveBudget : Math.max(0, row.budget - spent)
      };
    });

    function snapshotSmartMaxForRole(role: Role) {
      const otherNeeds = roleOrder
        .filter((otherRole) => otherRole !== role)
        .reduce((sum, otherRole) => {
          const plan = budgetPlan.find((row) => row.role === otherRole);
          if (!plan) return sum;
          const slotsLeft = Math.max(0, plan.slots - snapshotBoughtCountByRole[otherRole]);
          if (slotsLeft === 0) return sum;
          return sum + Math.max(slotsLeft, Math.max(0, plan.budget - snapshotSpentByRole[otherRole]));
        }, 0);
      return Math.max(0, snapshotRemaining - otherNeeds);
    }

    function snapshotSmartMaxBid(player: Player) {
      const pick = auctionState[pickKey(player)];
      if (pick?.status === "Comprato") return pick.paid ?? player.maxBid;
      const slotsAfterPurchase = Math.max(0, (budgetPlan.find((row) => row.role === player.role)?.slots ?? 0) - snapshotBoughtCountByRole[player.role] - 1);
      return Math.max(0, snapshotSmartMaxForRole(player.role) - slotsAfterPurchase);
    }

    const snapshotExplicitRecommendation = selectedPlayers.find((player) => playerStatus(player, auctionState) === "Consigliato" && (!snapshotActiveRole || player.role === snapshotActiveRole));
    const snapshotRecommendation = snapshotExplicitRecommendation
      ? {
          player: snapshotExplicitRecommendation,
          liveMax: snapshotSmartMaxBid(snapshotExplicitRecommendation),
          reason: `scelta mantenuta dopo gli acquisti · reparto ${roleLabels[snapshotExplicitRecommendation.role]} · massimo live ${formatMoney(snapshotSmartMaxBid(snapshotExplicitRecommendation))}`
        }
      : recommendNextPlayer(auctionState);
    const snapshotManagerRows = managers.map((manager) => {
      const players = allPlayers.filter((player) => ownerMatches(auctionState[pickKey(player)], manager));
      const spent = players.reduce((sum, player) => sum + (auctionState[pickKey(player)]?.paid ?? 0), 0);
      const spentByRole = roleOrder.reduce<Record<Role, number>>((totals, role) => {
        totals[role] = players
          .filter((player) => player.role === role)
          .reduce((sum, player) => sum + (auctionState[pickKey(player)]?.paid ?? 0), 0);
        return totals;
      }, { P: 0, D: 0, C: 0, A: 0 });
      const countByRole = roleOrder.reduce<Record<Role, number>>((counts, role) => {
        counts[role] = players.filter((player) => player.role === role).length;
        return counts;
      }, { P: 0, D: 0, C: 0, A: 0 });
      const remainingBudget = Math.max(0, manager.budget - spent);
      const remainingSlots = Math.max(0, 25 - players.length);
      const maxSingle = Math.max(0, remainingBudget - Math.max(0, remainingSlots - 1));
      const heartBonus = currentPlayer && manager.heartTeam === currentPlayer.team ? Math.round(currentPlayer.maxBid * 0.22) : 0;
      const vibeBonus = currentPlayer ? managerVibeBonus(manager.vibe) : 0;
      const learning = snapshotLearning.find((item) => item.managerId === manager.id);
      const learnedBonus = memoryPushBonus(currentPlayer, learning);
      const roleBudgetPressure = opponentRoleBudgetPressure(currentPlayer, spentByRole, countByRole);
      const rawEstimatedPush = currentPlayer ? Math.max(0, Math.min(maxSingle, currentPlayer.maxBid + heartBonus + vibeBonus + learnedBonus)) : 0;
      const estimatedPush = applyBudgetPressureToEstimate(rawEstimatedPush, learnedBonus, roleBudgetPressure);
      return {
        manager,
        players,
        spent,
        spentByRole,
        remainingBudget,
        remainingSlots,
        maxSingle,
        countByRole,
        estimatedPush,
        learning,
        roleBudgetPressure,
        reading: currentPlayer
          ? roleBudgetPressure && roleBudgetPressure.reading !== "budget reparto libero" && roleBudgetPressure.ceiling < currentPlayer.maxBid
            ? `${roleBudgetPressure.reading}: ${formatMoney(roleBudgetPressure.roleSpent)}/${formatMoney(roleBudgetPressure.roleBudget)} ${currentPlayer.role}`
            : learnedBonus >= 8
            ? `pattern caldo: ${learning?.summary ?? "memoria asta"}`
            : estimatedPush >= currentPlayer.maxBid + 10
            ? "rischio rilancio"
            : estimatedPush >= currentPlayer.maxBid
              ? "arriva al tuo max"
              : "probabile sotto"
          : "seleziona giocatore"
      };
    });

    return {
      currentPlayer: currentPlayer ? {
        name: currentPlayer.name,
        role: currentPlayer.role,
        team: currentPlayer.team,
        maxBid: currentPlayer.maxBid,
        openBid: currentPlayer.openBid,
        status: playerStatus(currentPlayer, auctionState),
        owner: auctionState[pickKey(currentPlayer)]?.owner,
        paid: auctionState[pickKey(currentPlayer)]?.paid,
        note: currentPlayer.note,
        stats26: currentPlayer.stats26,
        stats25: currentPlayer.stats25
      } : null,
      nextRecommended: snapshotRecommendation ? {
        name: snapshotRecommendation.player.name,
        role: snapshotRecommendation.player.role,
        team: snapshotRecommendation.player.team,
        liveMax: snapshotRecommendation.liveMax,
        reason: snapshotRecommendation.reason
      } : null,
      myTeam: {
        budget: totalBudget,
        spent: snapshotSpent,
        remaining: snapshotRemaining,
        activeRole: snapshotActiveRole,
        bought: snapshotBought.map((player) => ({
          name: player.name,
          role: player.role,
          team: player.team,
          paid: auctionState[pickKey(player)]?.paid ?? 0
        })),
        roleStats: snapshotRoleStats.map((row) => ({
          role: row.role,
          bought: row.bought,
          slots: row.slots,
          spent: row.spent,
          remaining: row.remaining,
          smartRemaining: row.smartRemaining
        }))
      },
      managers: snapshotManagerRows.map((row) => ({
        name: row.manager.name,
        heartTeam: row.manager.heartTeam,
        vibe: row.manager.vibe,
        spent: row.spent,
        remainingBudget: row.remainingBudget,
        roster: row.players.length,
        roles: row.countByRole,
        spentByRole: row.spentByRole,
        maxSingle: row.maxSingle,
        estimateOnCurrentPlayer: currentPlayer ? row.estimatedPush : null,
        reading: row.reading,
        roleBudgetPressure: row.roleBudgetPressure,
        learning: row.learning ? {
          notes: row.learning.notes,
          heat: row.learning.heat,
          summary: row.learning.summary,
          roleBias: row.learning.roleBias
        } : undefined
      })),
      visiblePlayers: filteredPlayers.slice(0, 24).map((player) => ({
        name: player.name,
        role: player.role,
        team: player.team,
        maxBid: player.maxBid,
        status: playerStatus(player, auctionState),
        owner: auctionState[pickKey(player)]?.owner,
        paid: auctionState[pickKey(player)]?.paid,
        note: player.note
      })),
      callTurn: {
        currentCaller: snapshotCurrentCaller?.name,
        nextCaller: snapshotNextCaller?.name,
        order: snapshotCallOrder.map((id, index) => ({
          position: index + 1,
          name: managers.find((manager) => manager.id === id)?.name ?? id
        }))
      },
      auctionMemory: {
        recentEvents: memoryState.slice(-8).map((event) => ({
          text: event.text,
          managers: event.managerIds.map((id) => managers.find((manager) => manager.id === id)?.name ?? id),
          player: event.playerName,
          role: event.playerRole,
          tags: event.tags,
          intensity: event.intensity
        })),
        managerLearning: snapshotLearning.map((learning) => ({
          manager: managers.find((manager) => manager.id === learning.managerId)?.name ?? learning.managerId,
          notes: learning.notes,
          heat: learning.heat,
          summary: learning.summary,
          roleBias: learning.roleBias
        }))
      },
      rules: auctionRules
    };
  }

  function applyCoachAssign(player: Player, manager: ManagerProfile, paid: number) {
    updatePick(player, {
      status: manager.id === myManager.id ? "Comprato" : "Perso",
      paid,
      owner: manager.name,
      ownerId: manager.id
    });
    setLivePlayerName(player.name);
    setLiveManagerId(manager.id);
    setLivePrice(String(paid));
    setQuery(player.name);
  }

  function applyBulkCoachAssign(assignments: DetectedAssignment[]) {
    const lastAssignment = assignments.at(-1);
    setAuction((previousAuction) => {
      const nextAuction: Record<string, AuctionPick> = { ...previousAuction };
      for (const assignment of assignments) {
        const key = pickKey(assignment.player);
        nextAuction[key] = {
          ...(nextAuction[key] ?? { status: defaultStatusFor(assignment.player) }),
          status: assignment.manager.id === myManager.id ? "Comprato" : "Perso",
          paid: assignment.paid,
          owner: assignment.manager.name,
          ownerId: assignment.manager.id
        };
      }

      Object.entries(nextAuction).forEach(([key, pick]) => {
        if (pick.status === "Consigliato") {
          nextAuction[key] = { ...pick, status: "Da chiamare" };
        }
      });
      const nextRecommendation = recommendNextPlayer(nextAuction, lastAssignment ? pickKey(lastAssignment.player) : "");
      if (nextRecommendation) {
        const nextKey = pickKey(nextRecommendation.player);
        nextAuction[nextKey] = {
          ...(nextAuction[nextKey] ?? { status: defaultStatusFor(nextRecommendation.player) }),
          status: "Consigliato"
        };
      }

      return nextAuction;
    });

    if (lastAssignment) {
      setLivePlayerName(lastAssignment.player.name);
      setLiveManagerId(lastAssignment.manager.id);
      setLivePrice(String(lastAssignment.paid));
      setQuery(lastAssignment.player.name);
    }

    return advanceCallTurnBy(assignments.length);
  }

  async function askCoach(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = coachInput.trim();
    if (!message || coachLoading) return;

    const userMessage: CoachMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: message
    };
    const bulkParse = parseBulkAssignCommands(message, managers);
    if (bulkParse.isBulk) {
      const bulkAssignments = bulkParse.assignments;
      const turnText = applyBulkCoachAssign(bulkAssignments);
      const assignedByManager = bulkAssignments.reduce<Record<string, number>>((counts, assignment) => {
        counts[assignment.manager.name] = (counts[assignment.manager.name] ?? 0) + 1;
        return counts;
      }, {});
      const managerSummary = Object.entries(assignedByManager)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6)
        .map(([manager, count]) => `${manager} ${count}`)
        .join(" · ");
      const skippedText = bulkParse.skippedLines.length
        ? `\nRighe non riconosciute (${bulkParse.skippedLines.length}): ${bulkParse.skippedLines.slice(0, 6).join(" | ")}${bulkParse.skippedLines.length > 6 ? " | ..." : ""}`
        : "";
      setCoachMessages([...coachMessages, userMessage, {
        id: crypto.randomUUID(),
        role: "system",
        text: `Import massivo registrato: ${bulkAssignments.length} assegnazioni applicate localmente, 0 token API.${managerSummary ? `\nDistribuzione: ${managerSummary}.` : ""}${skippedText}${turnText ? `\n${turnText}` : ""}`,
        meta: "Locale: 0 token API"
      }]);
      setCoachInput("");
      setCoachLoading(false);
      return;
    }
    const detected = detectAssignIntent(message, managers);
    const memoryEvent = inferAuctionMemoryEvent(message, managers);
    const nextTurnText = detected ? nextCallerMessage() : "";
    const optimisticCallTurn = detected ? { order: callOrder, currentCallerId: nextCallerId } : { order: callOrder, currentCallerId };
    const optimisticAuction = detected ? {
      ...auction,
      [pickKey(detected.player)]: {
        ...(auction[pickKey(detected.player)] ?? { status: defaultStatusFor(detected.player) }),
        status: detected.manager.id === myManager.id ? "Comprato" as Status : "Perso" as Status,
        paid: detected.paid,
        owner: detected.manager.name,
        ownerId: detected.manager.id
      }
    } : auction;
    const localAction = detected || memoryEvent ? {
      assignment: detected ? {
        type: "assign",
        player: detected.player.name,
        manager: detected.manager.name,
        paid: detected.paid
      } : null,
      memoryEvent: memoryEvent ? {
        managers: memoryEvent.managerIds.map((id) => managers.find((manager) => manager.id === id)?.name ?? id),
        player: memoryEvent.playerName,
        tags: memoryEvent.tags,
        intensity: memoryEvent.intensity
      } : null
    } : null;
    const localMessages: CoachMessage[] = [];
    if (detected) {
      localMessages.push({
        id: crypto.randomUUID(),
        role: "system",
        text: `Aggiornato: ${detected.player.name} a ${detected.manager.name} per ${formatMoney(detected.paid)}.${nextTurnText ? `\n${nextTurnText}` : ""}`
      });
    }
    if (memoryEvent) {
      localMessages.push({
        id: crypto.randomUUID(),
        role: "system",
        text: `Memoria asta salvata: ${memoryEvent.managerIds.map((id) => managers.find((manager) => manager.id === id)?.name ?? id).join(", ")} · ${memoryEvent.tags.join(", ") || "nota comportamento"}${memoryEvent.playerName ? ` · ${memoryEvent.playerName}` : ""}.`
      });
    }
    const nextMemory = memoryEvent ? [...auctionMemory, memoryEvent].slice(-80) : auctionMemory;
    const nextMessages = [...coachMessages, userMessage, ...localMessages];

    setCoachMessages(nextMessages);
    setCoachInput("");
    if (detected) applyCoachAssign(detected.player, detected.manager, detected.paid);
    if (memoryEvent) setAuctionMemory(nextMemory);
    if (detected && isSimpleAssignCommand(message)) return;

    const localReply = localCoachReply(message);
    if (localReply) {
      setCoachMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: localReply,
        meta: "Locale: 0 token API"
      }]);
      return;
    }

    const requestId = coachRequestRef.current + 1;
    coachRequestRef.current = requestId;
    setCoachLoading(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          localAction,
          history: nextMessages.slice(-4),
          snapshot: buildCoachSnapshot(optimisticAuction, detected?.player ?? selectedLivePlayer, optimisticCallTurn, nextMemory)
        })
      });
      const raw = await response.text();
      let data: Record<string, unknown> = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      const reply = typeof data.reply === "string"
        ? data.reply
        : response.ok
          ? "Il Coach AI non ha restituito una risposta leggibile."
          : `Coach AI non disponibile (${response.status}). ${raw.trim().slice(0, 180) || "Controlla che npm run dev:ai sia attivo e che OPENAI_API_KEY sia impostata."}`;
      const meta = data.cached
        ? "Cache locale: 0 token API"
        : data.incomplete
          ? "Risposta incompleta"
        : data.tokenMode === "compact"
          ? "Snapshot sintetico"
          : undefined;
      if (coachRequestRef.current !== requestId) return;
      setCoachMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
        meta
      }]);
    } catch {
      if (coachRequestRef.current !== requestId) return;
      setCoachMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Coach AI non raggiungibile: avvia npm run dev:ai. I comandi rapidi locali restano comunque applicati quando riconosco giocatore, persona e cifra."
      }]);
    } finally {
      if (coachRequestRef.current === requestId) setCoachLoading(false);
    }
  }

  function exportCsv() {
    const header = ["Ruolo", "Calciatore", "Squadra", "Profilo", "Titolarita %", "Ballottaggio", "Stars", "Max", "Pagato", "Status", "Owner", "Infortunio", "Recupero", "Scouting", "Note"];
    const rows = selectedPlayers.map((player) => {
      const pick = auction[pickKey(player)];
      return [
        player.role,
        player.name,
        player.team,
        player.profile,
        player.lineup?.startPct ?? "",
        player.lineup?.ballotWith ?? "",
        starsText(player.stars),
        player.maxBid,
        pick?.paid ?? "",
        pick?.status ?? defaultStatusFor(player),
        pick?.owner ?? "",
        player.injury ? player.injury.impact : "",
        player.injury?.recovery ?? "",
        player.scouting ? `${player.scouting.origin}: ${player.scouting.lastSeason}` : "",
        pick?.liveNote ?? player.note
      ];
    });
    downloadFile(
      "asta-fantacalcio-2026-27.csv",
      [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n"),
      "text/csv;charset=utf-8"
    );
  }

  function exportState() {
    downloadFile(
      "asta-fantacalcio-2026-27-live.json",
      JSON.stringify({ exportedAt: new Date().toISOString(), auction, managers, callTurn: { order: callOrder, currentCallerId }, auctionMemory }, null, 2),
      "application/json"
    );
  }

  function importState(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? "{}"));
        const imported = normalizeLiveState(parsed);
        if (!imported) {
          throw new Error("Invalid auction state");
        }
        setManagers(imported.managers);
        setCallTurn(imported.callTurn);
        setAuctionMemory(imported.auctionMemory ?? []);
        setAuction(imported.auction);
        window.alert("Stato asta importato correttamente.");
      } catch {
        window.alert("File JSON non valido: esporta lo stato dalla webapp e riprova.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function resetState() {
    if (window.confirm("Vuoi azzerare acquisti, prezzi, note live, memoria e chat Coach?")) {
      coachRequestRef.current += 1;
      setAuction({});
      setAuctionMemory([]);
      setCoachMessages(initialCoachMessages());
      setCoachInput("");
      setCoachLoading(false);
    }
  }

  function changeView(nextView: View) {
    setView(nextView);
    if (window.location.hash !== `#${nextView}`) {
      window.history.replaceState(null, "", `#${nextView}`);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/app-icon.svg" alt="" className="brand-mark" />
          <div>
            <strong>Asta 26/27</strong>
            <span>500 crediti, lega a 10</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Sezioni">
          {[
            ["cockpit", Trophy, "Cockpit"],
            ["listone", Search, "Listone"],
            ["rosa", Users, "Mia Rosa"],
            ["rose", Trophy, "Rose Live"],
            ["avversari", Users, "Avversari"],
            ["coach", Bot, "Coach AI"],
            ["portieri", Shield, "Portieri"],
            ["rigoristi", Goal, "Rigoristi"],
            ["risultati", Star, "Risultati"],
            ["mercato", RefreshCw, "Mercato"],
            ["fonti", ExternalLink, "Fonti"]
          ].map(([id, Icon, label]) => (
            <button key={String(id)} className={view === id ? "active" : ""} onClick={() => changeView(id as View)}>
              <Icon size={18} />
              <span>{label as string}</span>
            </button>
          ))}
        </nav>
        <div className="side-note">
          <strong>Regola anti-cuore Milan</strong>
          <span>Ramos, Pulisic e Maignan solo entro massimale. Niente tassa emotiva.</span>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Cockpit live asta Fantacalcio</p>
            <h1>{view === "cockpit" ? "Chiamate, budget e stop price" : viewLabel(view)}</h1>
          </div>
          <div className="top-actions">
            <span className={syncStatus === "Backup solo browser" ? "sync-pill warning" : "sync-pill"}>
              {syncStatus}
            </span>
            <button className="ghost" onClick={exportState}>
              <Download size={16} /> JSON
            </button>
            <button className="ghost" onClick={exportCsv}>
              <Download size={16} /> CSV
            </button>
            <label className="ghost file-import">
              <Upload size={16} /> Import
              <input type="file" accept="application/json,.json" onChange={importState} />
            </label>
            <button className="danger" onClick={resetState}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </header>

        {view === "cockpit" || view === "listone" ? (
          <>
            {view === "cockpit" ? (
              <QuickAssignPanel
                players={allPlayers}
                managers={managers}
                managerRows={managerRows}
                playerName={livePlayerName}
                managerId={liveManagerId}
                price={livePrice}
                selectedPlayer={selectedLivePlayer}
                currentCaller={currentCaller}
                nextCaller={nextCaller}
                currentCallNumber={currentCallNumber}
                callOrderSize={callOrder.length}
                turnNotice={callTurnNotice}
                onPlayerNameChange={setLivePlayerName}
                onManagerIdChange={setLiveManagerId}
                onPriceChange={setLivePrice}
                onAssign={assignLivePick}
                onCurrentCallerNumberChange={updateCurrentCallerNumber}
              />
            ) : null}

            <section className="kpi-grid" aria-label="Budget">
              <MetricCard label="Speso" value={totalSpent} detail={`${formatMoney(remaining)} crediti residui`} tone="blue" />
              <MetricCard label="Rosa" value={bought.length} detail="25 slot obiettivo" tone="green" />
              <MetricCard label="Alert prezzo" value={bought.filter((p) => isOverpaid(p, auction[pickKey(p)])).length} detail="acquisti sopra massimale" tone="amber" />
              <MetricCard label="Assegnati" value={takenCount} detail={`${filteredPlayers.length} righe visibili`} tone="red" />
            </section>

            <section className={reallocationPool < 0 || remaining < protectedFuture ? "budget-intelligence risk" : "budget-intelligence"} aria-label="Gestione intelligente del budget">
              <div className="budget-intelligence-head">
                <div>
                  <p className="eyebrow">Piano budget live</p>
                  <h2>{activeRole ? `Reparto attivo: ${roleLabels[activeRole]}` : "Rosa completata"}</h2>
                </div>
                <strong className={reallocationPool < 0 ? "negative" : "positive"}>
                  {reallocationPool < 0 ? `-${formatMoney(Math.abs(reallocationPool))} da recuperare` : `+${formatMoney(reallocationPool)} liberati`}
                </strong>
              </div>
              <div className="budget-intelligence-grid">
                <div>
                  <span>Disponibile reparto</span>
                  <strong>{formatMoney(activeBudget)}</strong>
                  <small>senza intaccare gli obiettivi successivi</small>
                </div>
                <div>
                  <span>Attacco protetto</span>
                  <strong>{formatMoney(Math.max(0, (budgetPlan.find((row) => row.role === "A")?.budget ?? 0) - spentByRole.A))}</strong>
                  <small>budget residuo per top + semitop</small>
                </div>
                <div>
                  <span>Da tenere da parte</span>
                  <strong>{formatMoney(protectedFuture)}</strong>
                  <small>per completare i reparti successivi</small>
                </div>
              </div>
              <p className="budget-intelligence-note">
                {remaining < protectedFuture
                  ? `Attenzione: mancano ${formatMoney(protectedFuture - remaining)} crediti per proteggere il piano dei reparti successivi.`
                  : activeRole
                    ? `Il reparto si considera chiuso quando raggiunge tutti gli slot: da quel momento l'avanzo si libera automaticamente.`
                    : "Tutti i reparti sono completi e il budget e stato distribuito."}
              </p>
            </section>

            <section className="budget-strip">
              {roleStats.map((row) => (
                <article key={row.label} className="budget-card">
                  <div>
                    <strong>{row.label}</strong>
                    <span>{row.role === "R" ? "scorta" : `${row.bought}/${row.slots} slot`}</span>
                  </div>
                  <div className="progress" aria-hidden="true">
                    <span style={{ width: `${row.fill}%` }} />
                  </div>
                  <p>
                    {formatMoney(row.spent)} / {formatMoney(row.budget)}
                    <small className={row.remaining < 0 ? "negative" : ""}> residuo {formatMoney(row.remaining)}</small>
                  </p>
                  {row.role !== "R" && row.role === activeRole ? <small className="smart-budget">disponibili ora {formatMoney(row.smartRemaining)}</small> : null}
                </article>
              ))}
            </section>

            {recommendation ? (
              <section className="recommendation-panel" aria-label="Prossimo giocatore consigliato">
                <div className="recommendation-icon"><Star size={18} /></div>
                <div className="recommendation-copy">
                  <span className="eyebrow">Prossima chiamata consigliata</span>
                  <strong>{recommendation.player.name}</strong>
                  <small>{recommendation.player.team} · {roleLabels[recommendation.player.role]} · Max modello {formatMoney(recommendation.player.maxBid)} · Asta live {formatMoney(recommendation.liveMax)}</small>
                  <p>{recommendation.reason}</p>
                </div>
                <button
                  className="recommendation-action"
                  onClick={() => {
                    setQuery(recommendation.player.name);
                    setOnlyTargets(false);
                    setSortState({ key: "priority", direction: "desc" });
                  }}
                >
                  <Search size={15} /> Apri giocatore
                </button>
              </section>
            ) : null}

            <section className="filters">
              <label className="searchbox">
                <Search size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nome, squadra, note..." />
              </label>
              <label>
                Ruolo
                <select value={role} onChange={(event) => setRole(event.target.value as Role | "Tutti")}>
                  <option>Tutti</option>
                  <option value="P">Portieri</option>
                  <option value="D">Difensori</option>
                  <option value="C">Centrocampisti</option>
                  <option value="A">Attaccanti</option>
                </select>
              </label>
              <label>
                Squadra
                <select value={team} onChange={(event) => setTeam(event.target.value)}>
                  <option>Tutte</option>
                  {teamOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Profilo
                <select value={profile} onChange={(event) => setProfile(event.target.value)}>
                  {profileOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <button className={onlyTargets ? "toggle on" : "toggle"} onClick={() => setOnlyTargets((v) => !v)}>
                <SlidersHorizontal size={16} /> Lista corta
              </button>
              <button className={onlyPenalty ? "toggle on" : "toggle"} onClick={() => setOnlyPenalty((v) => !v)}>
                <Goal size={16} /> Rig 1
              </button>
              <button className={team === "MIL" ? "toggle on milan" : "toggle"} onClick={() => setTeam((value) => value === "MIL" ? "Tutte" : "MIL")}>
                Milan
              </button>
            </section>

            {selectedGoalkeeper ? (
              <GoalkeeperCompanions
                selected={selectedGoalkeeper}
                onSelect={setSelectedGoalkeeper}
                onClose={() => setSelectedGoalkeeper(null)}
              />
            ) : null}

            <PlayerTable
              players={filteredPlayers}
              auction={auction}
              updatePick={updatePick}
              quickBuy={quickBuy}
              managers={managers}
              myManager={myManager}
              sortState={sortState}
              setSortState={setSortState}
              selectedGoalkeeper={selectedGoalkeeper}
              onSelectGoalkeeper={setSelectedGoalkeeper}
              smartMaxBid={smartMaxBid}
            />
          </>
        ) : null}

        {view === "rosa" ? <RosterView bought={bought} auction={auction} roleStats={roleStats} /> : null}
        {view === "rose" ? <LeagueRostersView managerRows={managerRows} auction={auction} myManager={myManager} /> : null}
        {view === "avversari" ? (
          <ManagersView
            managers={managers}
            managerRows={managerRows}
            teamOptions={teamOptions}
            playerName={livePlayerName}
            selectedPlayer={selectedLivePlayer}
            callOrder={callOrder}
            currentCallerId={currentCallerId}
            currentCaller={currentCaller}
            nextCaller={nextCaller}
            currentCallNumber={currentCallNumber}
            callOrderSize={callOrder.length}
            turnNotice={callTurnNotice}
            onManagerChange={updateManager}
            onPlayerNameChange={setLivePlayerName}
            onCurrentCallerChange={updateCurrentCaller}
            onCurrentCallerNumberChange={updateCurrentCallerNumber}
            onCallerPositionChange={updateCallerPosition}
            onResetTurn={resetCallTurn}
          />
        ) : null}
        {view === "coach" ? (
          <CoachView
            messages={coachMessages}
            input={coachInput}
            loading={coachLoading}
            currentPlayer={selectedLivePlayer}
            recommendation={recommendation}
            managerRows={managerRows}
            managerLearning={managerLearning}
            auctionMemory={auctionMemory}
            currentCaller={currentCaller}
            nextCaller={nextCaller}
            currentCallNumber={currentCallNumber}
            callOrderSize={callOrder.length}
            onCurrentCallerNumberChange={updateCurrentCallerNumber}
            onInputChange={setCoachInput}
            onSubmit={askCoach}
            onPrompt={setCoachInput}
          />
        ) : null}
        {view === "portieri" ? <GoalkeeperView /> : null}
        {view === "rigoristi" ? <TakersView /> : null}
        {view === "risultati" ? <ResultsView /> : null}
        {view === "mercato" ? <MarketView /> : null}
        {view === "fonti" ? <SourcesView /> : null}
      </main>
    </div>
  );
}

function viewLabel(view: View) {
  return {
    cockpit: "Cockpit",
    listone: "Listone completo",
    rosa: "Mia Rosa",
    rose: "Rose Live",
    avversari: "Avversari e rilanci",
    coach: "Coach AI live",
    portieri: "Portieri e griglie",
    rigoristi: "Rigoristi e piazzati",
    risultati: "Risultati prime giornate",
    mercato: "Mercato aggiornato",
    fonti: "Fonti e metodo"
  }[view];
}

function comparePlayers(a: Player, b: Player, sortState: SortState, auction: Record<string, AuctionPick>) {
  const direction = sortState.direction === "asc" ? 1 : -1;
  const pickA = auction[pickKey(a)];
  const pickB = auction[pickKey(b)];

  if (sortState.key === "priority") {
    const statusPriority: Record<Status, number> = {
      Consigliato: 0,
      "Da chiamare": 1,
      Monitor: 2,
      Comprato: 3,
      Perso: 4,
      Evita: 5
    };
    return statusPriority[playerStatus(a, auction)] - statusPriority[playerStatus(b, auction)]
      || roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
      || b.stars - a.stars
      || b.score - a.score;
  }

  const values: Record<Exclude<SortKey, "priority">, [string | number, string | number]> = {
    role: [roleOrder.indexOf(a.role), roleOrder.indexOf(b.role)],
    name: [a.name, b.name],
    team: [a.team, b.team],
    profile: [a.profile, b.profile],
    stars: [a.stars, b.stars],
    maxBid: [a.maxBid, b.maxBid],
    paid: [pickA?.paid ?? -1, pickB?.paid ?? -1],
    status: [playerStatus(a, auction), playerStatus(b, auction)],
    goals: [visibleStat(a, "gol"), visibleStat(b, "gol")],
    assists: [visibleStat(a, "ass"), visibleStat(b, "ass")],
    fm: [visibleStat(a, "fm"), visibleStat(b, "fm")],
    fvm: [a.fvm, b.fvm]
  };
  const [left, right] = values[sortState.key];
  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * direction || a.name.localeCompare(b.name);
  }
  return String(left).localeCompare(String(right)) * direction || a.name.localeCompare(b.name);
}

function nextSort(current: SortState, key: SortKey): SortState {
  if (current.key !== key) {
    const descFirst: SortKey[] = ["stars", "maxBid", "paid", "goals", "assists", "fm", "fvm"];
    return { key, direction: descFirst.includes(key) ? "desc" : "asc" };
  }
  return { key, direction: current.direction === "asc" ? "desc" : "asc" };
}

function MetricCard({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: string }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{typeof value === "number" ? formatMoney(value) : value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function CoachView({
  messages,
  input,
  loading,
  currentPlayer,
  recommendation,
  managerRows,
  managerLearning,
  auctionMemory,
  currentCaller,
  nextCaller,
  currentCallNumber,
  callOrderSize,
  onCurrentCallerNumberChange,
  onInputChange,
  onSubmit,
  onPrompt
}: {
  messages: CoachMessage[];
  input: string;
  loading: boolean;
  currentPlayer: Player | null;
  recommendation: { player: Player; liveMax: number; reason: string } | null;
  managerRows: ManagerRow[];
  managerLearning: ManagerLearning[];
  auctionMemory: AuctionMemoryEvent[];
  currentCaller: ManagerProfile;
  nextCaller: ManagerProfile;
  currentCallNumber: number;
  callOrderSize: number;
  onCurrentCallerNumberChange: (value: number) => void;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPrompt: (value: string) => void;
}) {
  const threatRows = currentPlayer
    ? [...managerRows]
        .filter((row) => row.manager.id !== "me")
        .sort((a, b) => b.estimatedPush - a.estimatedPush)
        .slice(0, 4)
    : [];
  const promptSeeds = [
    currentPlayer ? `Quanto mi spingo per ${currentPlayer.name}?` : "Chi chiamo adesso?",
    recommendation ? `Meglio chiamare ${recommendation.player.name} ora o aspettare?` : "Qual e la priorita del prossimo reparto?",
    "Chi puo rilanciare piu forte sul giocatore selezionato?",
    "Nota memoria: Paul ha strapagato il giocatore X con guerra di rilanci"
  ];
  const hotLearning = managerLearning
    .filter((learning) => learning.notes > 0)
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 4);

  return (
    <section className="coach-layout" aria-label="Coach AI live">
      <aside className="coach-context">
        <div>
          <p className="eyebrow">Giro chiamata</p>
          <div className="coach-turn">
            <label className="coach-turn-number">
              <span>N.</span>
              <input
                type="number"
                min="1"
                max={callOrderSize}
                inputMode="numeric"
                value={currentCallNumber}
                onChange={(event) => {
                  if (event.target.value) onCurrentCallerNumberChange(Number(event.target.value));
                }}
              />
            </label>
            <div>
              <span>Ora</span>
              <strong>{currentCaller.name}</strong>
            </div>
            <div>
              <span>Dopo</span>
              <strong>{nextCaller.name}</strong>
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow">Giocatore attivo</p>
          {currentPlayer ? (
            <div className="coach-player">
              <span className={`role role-${currentPlayer.role}`}>{currentPlayer.role}</span>
              <strong>{currentPlayer.name}</strong>
              <small>{currentPlayer.team} · max {formatMoney(currentPlayer.maxBid)} · FM {visibleStat(currentPlayer, "fm").toFixed(2)}</small>
            </div>
          ) : (
            <p className="coach-empty">Seleziona o nomina un giocatore.</p>
          )}
        </div>

        <div>
          <p className="eyebrow">Pressione avversari</p>
          <div className="coach-threat-list">
            {threatRows.length ? threatRows.map((row) => (
              <div key={row.manager.id}>
                <span>{row.manager.name}</span>
                <strong>{formatMoney(row.estimatedPush)}</strong>
                <small>{row.manager.heartTeam || "-"} · {row.manager.vibe} · {row.reading}</small>
              </div>
            )) : (
              <p className="coach-empty">La stima compare quando c'e un giocatore attivo.</p>
            )}
          </div>
        </div>

        {recommendation ? (
          <div>
            <p className="eyebrow">Prossima chiamata</p>
            <div className="coach-player">
              <span className={`role role-${recommendation.player.role}`}>{recommendation.player.role}</span>
              <strong>{recommendation.player.name}</strong>
              <small>{recommendation.player.team} · live {formatMoney(recommendation.liveMax)}</small>
            </div>
          </div>
        ) : null}

        <div>
          <p className="eyebrow">Memoria asta</p>
          <div className="coach-memory-list">
            {hotLearning.length ? hotLearning.map((learning) => {
              const manager = managerRows.find((row) => row.manager.id === learning.managerId)?.manager;
              return (
                <div key={learning.managerId}>
                  <span>{manager?.name ?? learning.managerId}</span>
                  <strong>{learning.summary}</strong>
                  <small>{learning.notes} note · calore {learning.heat}</small>
                </div>
              );
            }) : (
              <p className="coach-empty">Scrivi note naturali sui rilanci per creare pattern.</p>
            )}
            {auctionMemory.at(-1) ? (
              <small className="coach-memory-last">Ultima: {auctionMemory.at(-1)?.text}</small>
            ) : null}
          </div>
        </div>
      </aside>

      <section className="coach-panel">
        <div className="coach-head">
          <div>
            <p className="eyebrow">Strategia testuale</p>
            <h2>Coach AI</h2>
          </div>
          <span><Sparkles size={15} /> Cache locale</span>
        </div>

        <div className="coach-prompts">
          {promptSeeds.map((prompt) => (
            <button key={prompt} type="button" onClick={() => onPrompt(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="coach-thread" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} className={`coach-message ${message.role}`}>
              <span>{message.role === "user" ? "Tu" : message.role === "system" ? "App" : "Coach"}</span>
              <p>{message.text}</p>
              {message.meta ? <small className="coach-message-meta">{message.meta}</small> : null}
            </article>
          ))}
          {loading ? (
            <article className="coach-message assistant">
              <span>Coach</span>
              <p>Sto leggendo budget, rose e rilanci in forma sintetica...</p>
            </article>
          ) : null}
        </div>

        <form className="coach-form" onSubmit={onSubmit}>
          <textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Es. Samardzic e a 16, Avversario 1 e atalantino: rilancio? Oppure incolla piu righe: assegna X a Y per N"
          />
          <button className="assign-button" disabled={loading || !input.trim()}>
            <Send size={16} /> Invia
          </button>
        </form>
      </section>
    </section>
  );
}

function QuickAssignPanel({
  players,
  managers,
  managerRows,
  playerName,
  managerId,
  price,
  selectedPlayer,
  currentCaller,
  nextCaller,
  currentCallNumber,
  callOrderSize,
  turnNotice,
  onPlayerNameChange,
  onManagerIdChange,
  onPriceChange,
  onAssign,
  onCurrentCallerNumberChange
}: {
  players: Player[];
  managers: ManagerProfile[];
  managerRows: ManagerRow[];
  playerName: string;
  managerId: string;
  price: string;
  selectedPlayer: Player | null;
  currentCaller: ManagerProfile;
  nextCaller: ManagerProfile;
  currentCallNumber: number;
  callOrderSize: number;
  turnNotice: string;
  onPlayerNameChange: (value: string) => void;
  onManagerIdChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onAssign: () => void;
  onCurrentCallerNumberChange: (value: number) => void;
}) {
  const threatRows = selectedPlayer
    ? [...managerRows]
        .filter((row) => row.manager.id !== "me")
        .sort((a, b) => b.estimatedPush - a.estimatedPush)
        .slice(0, 3)
    : [];

  return (
    <section className="quick-assign" aria-label="Assegnazione rapida asta">
      <div className="quick-fields">
        <label>
          Giocatore
          <input
            list="players-list"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="Nome giocatore"
          />
          <datalist id="players-list">
            {players.map((player) => (
              <option key={pickKey(player)} value={player.name}>{player.team} · {player.role}</option>
            ))}
          </datalist>
        </label>
        <label>
          Persona
          <select value={managerId} onChange={(event) => onManagerIdChange(event.target.value)}>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
        </label>
        <label>
          Cifra
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder={selectedPlayer ? String(selectedPlayer.openBid) : "0"}
          />
        </label>
        <button className="assign-button" onClick={onAssign}>
          <Check size={16} /> Assegna
        </button>
      </div>

      <div className="quick-scout">
        {selectedPlayer ? (
          <>
            <div>
              <span className={`role role-${selectedPlayer.role}`}>{selectedPlayer.role}</span>
              <strong>{selectedPlayer.name}</strong>
              <small>{selectedPlayer.team} · mio max {formatMoney(selectedPlayer.maxBid)}</small>
            </div>
            {threatRows.map((row) => (
              <button key={row.manager.id} onClick={() => onManagerIdChange(row.manager.id)} title="Seleziona questa persona">
                <span>{row.manager.name}</span>
                <strong>{formatMoney(row.estimatedPush)}</strong>
                <small>{row.reading}</small>
              </button>
            ))}
          </>
        ) : (
          <span>Seleziona un giocatore per vedere subito chi puo rilanciare di piu.</span>
        )}
      </div>

      <div className="turn-strip" aria-live="polite">
        <label className="turn-number-control">
          <span>Numero chiamata</span>
          <input
            type="number"
            min="1"
            max={callOrderSize}
            inputMode="numeric"
            value={currentCallNumber}
            onChange={(event) => {
              if (event.target.value) onCurrentCallerNumberChange(Number(event.target.value));
            }}
          />
        </label>
        <div>
          <span>Ora chiama</span>
          <strong>{currentCaller.name}</strong>
        </div>
        <div>
          <span>Dopo assegnazione</span>
          <strong>{nextCaller.name}</strong>
        </div>
        {turnNotice ? <p>{turnNotice}</p> : null}
      </div>
    </section>
  );
}

function ManagersView({
  managers,
  managerRows,
  teamOptions,
  playerName,
  selectedPlayer,
  callOrder,
  currentCallerId,
  currentCaller,
  nextCaller,
  currentCallNumber,
  callOrderSize,
  turnNotice,
  onManagerChange,
  onPlayerNameChange,
  onCurrentCallerChange,
  onCurrentCallerNumberChange,
  onCallerPositionChange,
  onResetTurn
}: {
  managers: ManagerProfile[];
  managerRows: ManagerRow[];
  teamOptions: string[];
  playerName: string;
  selectedPlayer: Player | null;
  callOrder: string[];
  currentCallerId: string;
  currentCaller: ManagerProfile;
  nextCaller: ManagerProfile;
  currentCallNumber: number;
  callOrderSize: number;
  turnNotice: string;
  onManagerChange: (id: string, patch: Partial<ManagerProfile>) => void;
  onPlayerNameChange: (value: string) => void;
  onCurrentCallerChange: (id: string) => void;
  onCurrentCallerNumberChange: (value: number) => void;
  onCallerPositionChange: (id: string, position: number) => void;
  onResetTurn: () => void;
}) {
  const orderedRows = [...managerRows].sort((a, b) => callOrder.indexOf(a.manager.id) - callOrder.indexOf(b.manager.id));

  return (
    <>
      <section className="manager-controls">
        <label className="searchbox">
          <Search size={18} />
          <input
            list="manager-player-list"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="Giocatore da stimare"
          />
          <datalist id="manager-player-list">
            {allPlayers.map((player) => (
              <option key={pickKey(player)} value={player.name}>{player.team} · {player.role}</option>
            ))}
          </datalist>
        </label>
        {selectedPlayer ? (
          <div className="manager-target">
            <span className={`role role-${selectedPlayer.role}`}>{selectedPlayer.role}</span>
            <strong>{selectedPlayer.name}</strong>
            <small>{selectedPlayer.team} · mio max {formatMoney(selectedPlayer.maxBid)}</small>
          </div>
        ) : null}
      </section>

      <section className="turn-panel" aria-label="Giro chiamata asta">
        <label>
          Numero chiamata
          <input
            type="number"
            min="1"
            max={callOrderSize}
            inputMode="numeric"
            value={currentCallNumber}
            onChange={(event) => {
              if (event.target.value) onCurrentCallerNumberChange(Number(event.target.value));
            }}
          />
        </label>
        <label>
          Ora chiama
          <select value={currentCallerId} onChange={(event) => onCurrentCallerChange(event.target.value)}>
            {callOrder.map((id, index) => {
              const manager = managers.find((item) => item.id === id);
              return manager ? <option key={id} value={id}>{index + 1}. {manager.name}</option> : null;
            })}
          </select>
        </label>
        <div>
          <span>Prossimo dopo assegnazione</span>
          <strong>{nextCaller.name}</strong>
        </div>
        <div>
          <span>Turno corrente</span>
          <strong>{currentCaller.name}</strong>
        </div>
        <button className="ghost" type="button" onClick={onResetTurn}>
          <RotateCcw size={15} /> Reset giro
        </button>
        {turnNotice ? <p>{turnNotice}</p> : null}
      </section>

      <section className="table-wrap managers-table">
        <table>
          <thead>
            <tr>
              <th>Giro</th>
              <th>Persona</th>
              <th>Cuore</th>
              <th>Vibe</th>
              <th>Budget</th>
              <th>Speso</th>
              <th>Residuo</th>
              <th>Rosa</th>
              <th>Reparti</th>
              <th>Max singola</th>
              <th>Stima su chiamata</th>
            </tr>
          </thead>
          <tbody>
            {orderedRows.map((row) => (
              <tr key={row.manager.id} className={row.manager.id === "me" ? "my-manager-row" : ""}>
                <td data-label="Giro">
                  <select
                    value={callOrder.indexOf(row.manager.id)}
                    onChange={(event) => onCallerPositionChange(row.manager.id, Number(event.target.value))}
                    aria-label={`Posizione giro chiamata per ${row.manager.name}`}
                  >
                    {callOrder.map((id, index) => {
                      const manager = managers.find((item) => item.id === id);
                      return <option key={id} value={index}>{index + 1}. {manager?.name ?? id}</option>;
                    })}
                  </select>
                </td>
                <td data-label="Persona">
                  <input
                    value={row.manager.name}
                    onChange={(event) => onManagerChange(row.manager.id, { name: event.target.value })}
                  />
                </td>
                <td data-label="Cuore">
                  <select
                    value={row.manager.heartTeam}
                    onChange={(event) => onManagerChange(row.manager.id, { heartTeam: event.target.value })}
                  >
                    <option value="">-</option>
                    {teamOptions.map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </td>
                <td data-label="Vibe">
                  <select
                    value={row.manager.vibe}
                    onChange={(event) => onManagerChange(row.manager.id, { vibe: event.target.value as ManagerVibe })}
                  >
                    {vibeOptions.map((vibe) => (
                      <option key={vibe}>{vibe}</option>
                    ))}
                  </select>
                </td>
                <td data-label="Budget">
                  <input
                    type="number"
                    min="1"
                    value={row.manager.budget}
                    onChange={(event) => onManagerChange(row.manager.id, { budget: Number(event.target.value) || 500 })}
                  />
                </td>
                <td data-label="Speso" className="max">{formatMoney(row.spent)}</td>
                <td data-label="Residuo" className="max">{formatMoney(row.remainingBudget)}</td>
                <td data-label="Rosa">{row.players.length}/25</td>
                <td data-label="Reparti">P {row.countByRole.P} · D {row.countByRole.D} · C {row.countByRole.C} · A {row.countByRole.A}</td>
                <td data-label="Max singola">{formatMoney(row.maxSingle)}</td>
                <td data-label="Stima su chiamata" className={row.estimatedPush >= (selectedPlayer?.maxBid ?? Infinity) ? "threat" : ""}>
                  <strong>{selectedPlayer ? formatMoney(row.estimatedPush) : "-"}</strong>
                  <small>{row.reading}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function PlayerTable({
  players,
  auction,
  updatePick,
  quickBuy,
  managers,
  myManager,
  sortState,
  setSortState,
  selectedGoalkeeper,
  onSelectGoalkeeper,
  smartMaxBid
}: {
  players: Player[];
  auction: Record<string, AuctionPick>;
  updatePick: (player: Player, patch: Partial<AuctionPick>) => void;
  quickBuy: (player: Player) => void;
  managers: ManagerProfile[];
  myManager: ManagerProfile;
  sortState: SortState;
  setSortState: (sortState: SortState) => void;
  selectedGoalkeeper: Player | null;
  onSelectGoalkeeper: (player: Player | null) => void;
  smartMaxBid: (player: Player) => number;
}) {
  function SortHeader({ sortKey, children }: { sortKey?: SortKey; children?: ReactNode }) {
    if (!sortKey) return <th>{children}</th>;
    const active = sortState.key === sortKey;
    const Icon = sortState.direction === "asc" ? ArrowUp : ArrowDown;
    return (
      <th>
        <button className={active ? "sort-button active" : "sort-button"} onClick={() => setSortState(nextSort(sortState, sortKey))}>
          <span>{children}</span>
          {active ? <Icon size={13} /> : <span className="sort-placeholder" />}
        </button>
      </th>
    );
  }

  return (
    <section className="table-wrap player-table">
      <table>
        <thead>
          <tr>
            <SortHeader sortKey="role">R</SortHeader>
            <SortHeader sortKey="name">Calciatore</SortHeader>
            <SortHeader sortKey="team">Sq</SortHeader>
            <SortHeader sortKey="profile">Profilo</SortHeader>
            <SortHeader sortKey="stars">Stars</SortHeader>
            <SortHeader sortKey="maxBid">Max</SortHeader>
            <SortHeader sortKey="paid">Pagato</SortHeader>
            <SortHeader sortKey="status">Status</SortHeader>
            <SortHeader>Owner</SortHeader>
            <SortHeader sortKey="goals">Stats</SortHeader>
            <SortHeader>Info utili</SortHeader>
            <SortHeader></SortHeader>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const key = pickKey(player);
            const pick = auction[key] ?? { status: defaultStatusFor(player) };
            const over = isOverpaid(player, pick);
            const liveMax = smartMaxBid(player);
            const isMine = ownerMatches(pick, myManager) || (!pickHasOwner(pick) && pick.status === "Comprato");
            const smartOver = isMine && pick.paid !== undefined && pick.paid > liveMax;
            return (
              <tr key={key} className={`${pick.status.toLowerCase().replaceAll(" ", "-")} ${player.team === "MIL" ? "milan-row" : ""}`}>
                <td data-label="Ruolo"><span className={`role role-${player.role}`}>{player.role}</span></td>
                <td data-label="Calciatore">
                  <div className="player-cell">
                    {player.role === "P" ? (
                      <button
                        className={selectedGoalkeeper && pickKey(selectedGoalkeeper) === key ? "player-link player-trigger selected" : "player-link player-trigger"}
                        onClick={() => onSelectGoalkeeper(player)}
                        aria-label={`Mostra copertura portieri ${player.team}`}
                      >
                        {player.name}
                      </button>
                    ) : (
                      <a href={player.url} target="_blank" rel="noreferrer" className="player-link">
                        {player.name}
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {player.injury ? (
                      <span className={`injury-badge injury-${player.injury.impact.toLowerCase()}`} title={`${player.injury.concern} Recupero: ${player.injury.recovery}`}>
                        INF {player.injury.impact}
                      </span>
                    ) : null}
                    {player.scouting ? (
                      <span className="scouting-badge" title={`${player.scouting.origin}: ${player.scouting.lastSeason}`}>
                        EST
                      </span>
                    ) : null}
                    {player.lineup?.startPct !== undefined || player.roleBug ? (
                      <span className="player-signals">
                        {player.lineup?.startPct !== undefined ? (
                          <span className={player.lineup.startPct >= 75 ? "lineup-badge safe" : player.lineup.startPct >= 55 ? "lineup-badge warn" : "lineup-badge risk"} title={`${player.lineup.source}${player.lineup.ballotWith ? ` · Ballottaggio con ${player.lineup.ballotWith}` : ""}`}>
                            TIT {player.lineup.startPct}%
                          </span>
                        ) : null}
                        {player.roleBug ? (
                          <span className={player.roleBug.kind === "C-attacco" ? "role-bug-badge attack" : "role-bug-badge wide"} title={`${player.roleBug.roleOnPitch}: ${player.roleBug.reason} Fonte: ${player.roleBug.source}`}>
                            {player.roleBug.label}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                    {player.role === "P" ? (
                      <a href={player.url} target="_blank" rel="noreferrer" className="external-player-link" aria-label={`Apri scheda ${player.name}`}>
                        <ExternalLink size={13} />
                      </a>
                    ) : null}
                  </div>
                </td>
                <td data-label="Squadra">{player.team}</td>
                <td data-label="Profilo">{player.profile}</td>
                <td data-label="Stars" className="stars">{starsText(player.stars)}</td>
                <td data-label="Max" className="max">
                  <div className="max-stack">
                    <span>{player.maxBid}</span>
                    <small className="smart-max">asta {liveMax}</small>
                  </div>
                </td>
                <td data-label="Pagato" className={smartOver ? "smart-over" : undefined}>
                  <input
                    className={over ? "overpay" : ""}
                    type="number"
                    min="0"
                    value={pick.paid ?? ""}
                    placeholder={String(player.openBid)}
                    onChange={(event) => updatePick(player, { paid: event.target.value === "" ? undefined : Number(event.target.value) })}
                  />
                  {over ? <AlertTriangle className="inline-alert" size={14} /> : null}
                  {smartOver ? <small className="smart-warning">Piano max {liveMax}</small> : null}
                </td>
                <td data-label="Status">
                  <select value={pick.status} onChange={(event) => updatePick(player, { status: event.target.value as Status })}>
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td data-label="Owner">
                  <select
                    value={pick.ownerId ?? ""}
                    onChange={(event) => {
                      const manager = managers.find((item) => item.id === event.target.value);
                      updatePick(player, manager
                        ? { ownerId: manager.id, owner: manager.name, status: manager.id === myManager.id ? "Comprato" : "Perso" }
                        : { ownerId: undefined, owner: undefined, status: "Da chiamare", paid: undefined });
                    }}
                  >
                    <option value="">-</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>{manager.name}</option>
                    ))}
                  </select>
                </td>
                <td data-label="Stats" className="stats-cell">
                  <span>{hasCurrentSeasonStats(player) ? "26/27" : "25/26"} G {visibleStat(player, "gol")} / A {visibleStat(player, "ass")}</span>
                  <span>FM {visibleStat(player, "fm").toFixed(2)}</span>
                </td>
                <td data-label="Info utili">
                  {player.injury ? (
                    <div className="injury-note">
                      {player.injury.concern} Recupero: {player.injury.recovery}.
                    </div>
                  ) : null}
                  {player.scouting ? (
                    <div className="scouting-note">
                      {player.scouting.lastSeason} {player.scouting.verdict}
                    </div>
                  ) : null}
                  {player.roleBug ? (
                    <div className="role-bug-note">
                      {player.roleBug.roleOnPitch}: {player.roleBug.reason}
                    </div>
                  ) : null}
                  <textarea
                    value={pick.liveNote ?? player.note}
                    onChange={(event) => updatePick(player, { liveNote: event.target.value })}
                  />
                </td>
                <td data-label="Compra">
                  <button
                    className={pick.status === "Comprato" ? "buy bought" : "buy"}
                    onClick={() => quickBuy(player)}
                    aria-label={pick.status === "Comprato" ? `Togli ${player.name} dagli acquistati` : `Segna ${player.name} come comprato`}
                  >
                    <Check size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function LeagueRostersView({
  managerRows,
  auction,
  myManager
}: {
  managerRows: ManagerRow[];
  auction: Record<string, AuctionPick>;
  myManager: ManagerProfile;
}) {
  const totalSpent = managerRows.reduce((sum, row) => sum + row.spent, 0);
  const completedSlots = managerRows.reduce((sum, row) => sum + row.players.length, 0);
  const avgSpent = managerRows.length ? totalSpent / managerRows.length : 0;
  const mostSpent = [...managerRows].sort((a, b) => b.spent - a.spent)[0];
  const orderedRows = [...managerRows].sort((a, b) => {
    if (a.manager.id === myManager.id) return -1;
    if (b.manager.id === myManager.id) return 1;
    return b.spent - a.spent || a.manager.name.localeCompare(b.manager.name);
  });

  return (
    <>
      <section className="kpi-grid roster-kpis" aria-label="Statistiche rose lega">
        <MetricCard label="Giocatori assegnati" value={completedSlots} detail={`${Math.max(0, managerRows.length * 25 - completedSlots)} slot ancora liberi`} tone="blue" />
        <MetricCard label="Crediti spesi" value={totalSpent} detail={`media ${formatMoney(avgSpent)} per squadra`} tone="green" />
        <MetricCard label="Piu esposto" value={mostSpent?.manager.name ?? "-"} detail={mostSpent ? `${formatMoney(mostSpent.spent)} spesi, ${formatMoney(mostSpent.remainingBudget)} residui` : "nessuna rosa avviata"} tone="amber" />
        <MetricCard label="Squadre complete" value={managerRows.filter((row) => row.players.length >= 25).length} detail={`${managerRows.length} partecipanti monitorati`} tone="red" />
      </section>

      <section className="league-rosters" aria-label="Rose complete lega">
        {orderedRows.map((row) => {
          const budgetUsed = Math.min(100, Math.round((row.spent / Math.max(1, row.manager.budget)) * 100));
          return (
            <article key={row.manager.id} className={row.manager.id === myManager.id ? "league-roster mine" : "league-roster"}>
              <header className="league-roster-head">
                <div>
                  <span>{row.manager.id === myManager.id ? "La mia squadra" : row.manager.vibe}</span>
                  <h2>{row.manager.name}</h2>
                </div>
                <strong>{row.players.length}/25</strong>
              </header>

              <div className="league-roster-budget">
                <div>
                  <span>Speso {formatMoney(row.spent)}</span>
                  <span>Residuo {formatMoney(row.remainingBudget)}</span>
                </div>
                <div className="progress" aria-hidden="true">
                  <span style={{ width: `${budgetUsed}%` }} />
                </div>
              </div>

              <div className="league-role-strip">
                {roleOrder.map((role) => {
                  const plan = budgetPlan.find((item) => item.role === role);
                  return (
                    <div key={role}>
                      <span className={`role role-${role}`}>{role}</span>
                      <strong>{row.countByRole[role]}/{plan?.slots ?? 0}</strong>
                      <small>{formatMoney(row.spentByRole[role])}</small>
                    </div>
                  );
                })}
              </div>

              <div className="league-roster-players">
                {roleOrder.map((role) => {
                  const rolePlayers = row.players
                    .filter((player) => player.role === role)
                    .sort((a, b) => (auction[pickKey(b)]?.paid ?? 0) - (auction[pickKey(a)]?.paid ?? 0) || a.name.localeCompare(b.name));
                  return (
                    <section key={role}>
                      <h3>{roleLabels[role]}</h3>
                      {rolePlayers.length ? rolePlayers.map((player) => {
                        const pick = auction[pickKey(player)];
                        const paid = pick?.paid ?? 0;
                        const delta = paid - player.maxBid;
                        return (
                          <div key={pickKey(player)} className="league-player-row">
                            <span className={`role role-${player.role}`}>{player.role}</span>
                            <strong>{player.name}</strong>
                            <small>{player.team}</small>
                            <b>{formatMoney(paid)}</b>
                            <em className={delta > 0 ? "negative" : "positive"}>{delta > 0 ? `+${delta}` : delta}</em>
                          </div>
                        );
                      }) : (
                        <p>Nessun acquisto</p>
                      )}
                    </section>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function RosterView({
  bought,
  auction,
  roleStats
}: {
  bought: Player[];
  auction: Record<string, AuctionPick>;
  roleStats: Array<{ role: Role | "R"; label: string; slots: number; budget: number; bought: number; spent: number; remaining: number; fill: number }>;
}) {
  const spent = bought.reduce((sum, player) => sum + (auction[pickKey(player)]?.paid ?? 0), 0);
  const overpaid = bought.filter((player) => isOverpaid(player, auction[pickKey(player)]));
  const goals = bought.reduce((sum, player) => sum + numberFromStat(player.stats25?.gol), 0);
  const assists = bought.reduce((sum, player) => sum + numberFromStat(player.stats25?.ass), 0);
  const avgFm = bought.length
    ? bought.reduce((sum, player) => sum + numberFromStat(player.stats25?.fm), 0) / bought.length
    : 0;
  const penaltyOne = bought.filter((player) => player.penaltyRank === 1).length;
  const setPieces = bought.filter((player) => player.setPieceRank).length;

  if (bought.length === 0) {
    return (
      <section className="empty-roster">
        <Users size={42} />
        <h2>La rosa si riempira qui</h2>
        <p>Quando imposti un giocatore su Comprato nel Cockpit o nel Listone, comparira in questa pagina con prezzo, statistiche e impatto sul budget.</p>
      </section>
    );
  }

  return (
    <>
      <section className="kpi-grid roster-kpis" aria-label="Statistiche rosa acquistata">
        <MetricCard label="Speso totale" value={spent} detail={`${formatMoney(500 - spent)} crediti residui`} tone="blue" />
        <MetricCard label="Gol 25/26" value={goals} detail={`${assists} assist nella rosa`} tone="green" />
        <MetricCard label="Fantamedia" value={avgFm.toFixed(2)} detail="media semplice acquistati" tone="amber" />
        <MetricCard label="Rigori/Piazzati" value={penaltyOne} detail={`${setPieces} tiratori piazzati`} tone="red" />
      </section>

      <section className="roster-layout">
        <div className="roster-summary">
          {roleStats.filter((row) => row.role !== "R").map((row) => (
            <article key={row.role} className={row.remaining < 0 ? "role-summary danger-zone" : "role-summary"}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.bought}/{row.slots}</span>
              </div>
              <div className="progress" aria-hidden="true">
                <span style={{ width: `${row.fill}%` }} />
              </div>
              <p>{formatMoney(row.spent)} spesi <small>su {formatMoney(row.budget)}</small></p>
              <small className={row.remaining < 0 ? "negative" : ""}>Residuo reparto: {formatMoney(row.remaining)}</small>
            </article>
          ))}
        </div>

        <article className={overpaid.length ? "warning-card" : "ok-card"}>
          <strong>{overpaid.length ? "Prezzi sopra massimale" : "Prezzi sotto controllo"}</strong>
          <span>
            {overpaid.length
              ? overpaid.map((player) => `${player.name} +${(auction[pickKey(player)]?.paid ?? 0) - player.maxBid}`).join(", ")
              : "Nessun acquisto ha superato lo stop price."}
          </span>
        </article>
      </section>

      <section className="table-wrap roster-table">
        <table>
          <thead>
            <tr>
              <th>R</th>
              <th>Calciatore</th>
              <th>Sq</th>
              <th>Pagato</th>
              <th>Max</th>
              <th>Delta</th>
              <th>Gol 25/26</th>
              <th>Assist 25/26</th>
              <th>FM 25/26</th>
              <th>Rig/Piazzati</th>
              <th>Nota live</th>
            </tr>
          </thead>
          <tbody>
            {bought.map((player) => {
              const pick = auction[pickKey(player)] ?? { status: "Comprato" as Status };
              const paid = pick.paid ?? 0;
              const delta = paid - player.maxBid;
              return (
                <tr key={pickKey(player)} className={`${delta > 0 ? "overpaid-row" : ""} ${player.team === "MIL" ? "milan-row" : ""}`}>
                  <td data-label="Ruolo"><span className={`role role-${player.role}`}>{player.role}</span></td>
                  <td data-label="Calciatore">
                    <a href={player.url} target="_blank" rel="noreferrer" className="player-link">
                      {player.name}
                      <ExternalLink size={13} />
                    </a>
                  </td>
                  <td data-label="Squadra">{player.team}</td>
                  <td data-label="Pagato" className="max">{paid}</td>
                  <td data-label="Max">{player.maxBid}</td>
                  <td data-label="Delta" className={delta > 0 ? "negative strong" : "positive strong"}>{delta > 0 ? `+${delta}` : delta}</td>
                  <td data-label="Gol 25/26">{numberFromStat(player.stats25?.gol)}</td>
                  <td data-label="Assist 25/26">{numberFromStat(player.stats25?.ass)}</td>
                  <td data-label="FM 25/26">{numberFromStat(player.stats25?.fm).toFixed(2)}</td>
                  <td data-label="Rig/Piazzati">{player.penaltyRank === 1 ? "Rig 1" : player.setPieceRank ? `Piazzati ${player.setPieceRank}` : "-"}</td>
                  <td data-label="Nota live">{pick.liveNote ?? player.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

function GoalkeeperView() {
  return (
    <section className="panel-grid">
      {goalkeeperPairs.map(([level, pair, budget, note]) => (
        <article className="info-card" key={pair}>
          <span>{level}</span>
          <h2>{pair}</h2>
          <strong>{budget} crediti</strong>
          <p>{note}</p>
        </article>
      ))}
    </section>
  );
}

function GoalkeeperCompanions({ selected, onSelect, onClose }: { selected: Player; onSelect: (player: Player) => void; onClose: () => void }) {
  const group = allPlayers.filter((player) => player.role === "P" && player.team === selected.team).slice(0, 3);

  return (
    <section className="goalkeeper-focus" aria-label={`Copertura portieri ${selected.team}`}>
      <header className="goalkeeper-focus-header">
        <div>
          <p className="eyebrow">Copertura porta {selected.team}</p>
          <h2>{selected.name} e alternative di squadra</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Chiudi copertura portieri" title="Chiudi">
          <X size={17} />
        </button>
      </header>
      <div className="goalkeeper-trio">
        {group.map((player, index) => (
          <article key={pickKey(player)} className={pickKey(player) === pickKey(selected) ? "goalkeeper-card active" : "goalkeeper-card"}>
            <div className="goalkeeper-card-top">
              <span>Portiere {index + 1}</span>
              <span className={`role role-${player.role}`}>{player.role}</span>
            </div>
            <button className="goalkeeper-name" onClick={() => onSelect(player)}>{player.name}</button>
            <div className="goalkeeper-meta">
              <span>{player.profile}</span>
              <strong>Max {player.maxBid}</strong>
            </div>
            <a href={player.url} target="_blank" rel="noreferrer" className="external-player-link">
              Apri scheda <ExternalLink size={13} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function TakersView() {
  return (
    <section className="taker-grid">
      {takers.map(([team, rig1, rig2, rig3, piazzati1, piazzati2, piazzati3]) => (
        <article key={team} className={team === "Milan" ? "taker-card milan-card" : "taker-card"}>
          <h2>{team}</h2>
          <div className="taker-columns">
            <div>
              <strong>Rigori</strong>
              <span><b>1</b>{rig1 || "-"}</span>
              <span><b>2</b>{rig2 || "-"}</span>
              <span><b>3</b>{rig3 || "-"}</span>
            </div>
            <div>
              <strong>Piazzati</strong>
              <span><b>1</b>{piazzati1 || "-"}</span>
              <span><b>2</b>{piazzati2 || "-"}</span>
              <span><b>3</b>{piazzati3 || "-"}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function ResultsView() {
  return (
    <>
      <section className="postponed-grid" aria-label="Posticipi giornata 2">
        {postponedMatchInsights.map((match) => (
          <article className="postponed-card" key={match.match}>
            <div className="postponed-card-head">
              <span>Giornata {match.day} · {match.date}</span>
              <strong>{match.status}</strong>
            </div>
            <h2>{match.match}</h2>
            <p className="postponed-score">{match.score}</p>
            <ul>
              {match.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="table-wrap compact results-table">
        <table>
          <thead>
            <tr>
              <th>Giornata</th>
              <th>Data</th>
              <th>Casa</th>
              <th>Trasferta</th>
              <th>Risultato/Ora</th>
            </tr>
          </thead>
          <tbody>
            {results.map(([day, date, home, away, score]) => (
              <tr key={`${day}-${home}-${away}`}>
                <td data-label="Giornata">{day}</td>
                <td data-label="Data">{date}</td>
                <td data-label="Casa">{home}</td>
                <td data-label="Trasferta">{away}</td>
                <td data-label="Risultato/Ora">{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="footnote">Aggiornato al 01/09/2026 con i posticipi del 31/08: Lecce-Roma 0-4 e Atalanta-Bologna 1-0.</p>
      </section>
    </>
  );
}

function MarketView() {
  return (
    <section className="market-grid" aria-label="Aggiornamenti mercato">
      {marketUpdates.map((item) => (
        <article className="market-card" key={`${item.name}-${item.team}`}>
          <div className="market-card-head">
            <span className={`role role-${item.role}`}>{item.role}</span>
            <strong>{item.action}</strong>
          </div>
          <h2>{item.name}</h2>
          <p className="market-team">{item.team}</p>
          <p>{item.update}</p>
          {marketScouting(item.name) ? (
            <p className="market-scouting">{marketScouting(item.name)}</p>
          ) : null}
          <small>{item.source}</small>
        </article>
      ))}
    </section>
  );
}

function marketScouting(name: string) {
  const player = allPlayers.find((player) => player.name === name);
  return player?.scouting ? `${player.scouting.origin}: ${player.scouting.lastSeason} ${player.scouting.verdict}` : "";
}

function SourcesView() {
  return (
    <section className="sources">
      <article className="method-card">
        <h2>Metodo</h2>
        <p>
          Fantacalcio.it resta la base per ruoli, quotazioni, FVM, rigoristi e statistiche. SOS Fanta e fonti simili
          servono da radar editoriale per fasce, hype, prezzi medi reali e scommesse. Un nome sale quando convergono
          piu fonti e i numeri lo sostengono.
        </p>
      </article>
      <div className="source-grid">
        {sources.map(([name, url]) => (
          <a href={url} target="_blank" rel="noreferrer" className="source-card" key={name}>
            <span>{name}</span>
            <ExternalLink size={16} />
          </a>
        ))}
      </div>
    </section>
  );
}

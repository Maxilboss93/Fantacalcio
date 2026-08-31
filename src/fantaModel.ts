import quotazioniRaw from "./data/quotazioni.json";
import stats25Raw from "./data/stats_2025_26.json";
import stats26Raw from "./data/stats_2026_27.json";

export type Role = "P" | "D" | "C" | "A";
export type Status = "Da chiamare" | "Monitor" | "Comprato" | "Perso" | "Evita";

export type RawPlayer = {
  name: string;
  role: Role;
  team: string;
  cqi: number;
  cqa: number;
  fvm: number;
  url: string;
};

export type RawStats = {
  name: string;
  role: Role;
  team: string;
  pv?: string;
  mv?: string;
  fm?: string;
  gol?: string;
  gs?: string;
  rig?: string;
  rp?: string;
  ass?: string;
  amm?: string;
  esp?: string;
};

export type Player = RawPlayer & {
  stars: number;
  tier: string;
  maxBid: number;
  openBid: number;
  score: number;
  note: string;
  penaltyRank?: number;
  setPieceRank?: number;
  stats25?: RawStats;
  stats26?: RawStats;
};

export type AuctionPick = {
  status: Status;
  paid?: number;
  owner?: string;
  liveNote?: string;
};

export type BudgetRow = {
  role: Role | "R";
  label: string;
  slots: number;
  budget: number;
};

export const roleLabels: Record<Role, string> = {
  P: "Portieri",
  D: "Difensori",
  C: "Centrocampisti",
  A: "Attaccanti"
};

export const sources = [
  ["Quotazioni Fantacalcio.it", "https://www.fantacalcio.it/quotazioni-fantacalcio"],
  ["Statistiche Fantacalcio.it 2026/27", "https://www.fantacalcio.it/statistiche-serie-a"],
  ["Statistiche Fantacalcio.it 2025/26", "https://www.fantacalcio.it/statistiche-serie-a/2025-26"],
  ["Rigoristi Fantacalcio.it", "https://www.fantacalcio.it/rigoristi-serie-a"],
  ["Risultati Sky Sport", "https://sport.sky.it/calcio/serie-a/calendario-risultati"],
  ["SOS Fanta guida asta", "https://www.sosfanta.com/guida-asta-fantacalcio/guida-asta-fantacalcio-2026-2027-tutti-consigli-fasce-chi-prendere/"],
  ["Goal guida asta", "https://www.goal.com/it/liste/consigli-fantacalcio-serie-a-2026-2027-chi-prendere-all-asta-la-guida-completa-divisione-in-fasce-e-ruoli/blt990f9f2a29ab947d"],
  ["Gazzetta FantaNews", "https://www.gazzetta.it/calcio/fantanews/11-08-2026/guida-fantacalcio-2026-2027-migliori-giocatori-da-comprare-all-asta.shtml"],
  ["Fantacalcio-Online prezzi reali", "https://www.fantacalcio-online.com/it/i-piu-comprati"],
  ["Fantacalcio.dev fasce oneste", "https://fantacalcio.dev/report/fasce-oneste-2026-27"],
  ["Fantacalciopedia", "https://www.fantacalciopedia.com/"],
  ["Fantapazz", "https://www.fantapazz.com/"],
  ["Fantamagazine", "https://www.fantamagazine.com/"]
] as const;

export const budgetPlan: BudgetRow[] = [
  { role: "P", label: "Portieri", slots: 3, budget: 40 },
  { role: "D", label: "Difensori", slots: 8, budget: 100 },
  { role: "C", label: "Centrocampisti", slots: 8, budget: 130 },
  { role: "A", label: "Attaccanti", slots: 6, budget: 210 },
  { role: "R", label: "Riserva tattica", slots: 0, budget: 20 }
];

export const rosterSlots: Record<Role, number> = { P: 3, D: 8, C: 8, A: 6 };

export const results = [
  [1, "2026-08-22", "Inter", "Monza", "4-1"],
  [1, "2026-08-22", "Udinese", "Como", "1-1"],
  [1, "2026-08-22", "Genoa", "Napoli", "0-2"],
  [1, "2026-08-22", "Parma", "Cagliari", "0-1"],
  [1, "2026-08-23", "Frosinone", "Juventus", "0-1"],
  [1, "2026-08-23", "Venezia", "Lecce", "0-2"],
  [1, "2026-08-23", "Atalanta", "Sassuolo", "2-1"],
  [1, "2026-08-23", "Torino", "Milan", "1-2"],
  [1, "2026-08-24", "Bologna", "Lazio", "0-1"],
  [1, "2026-08-24", "Roma", "Fiorentina", "4-0"],
  [2, "2026-08-28", "Milan", "Venezia", "2-0"],
  [2, "2026-08-29", "Fiorentina", "Frosinone", "0-3"],
  [2, "2026-08-29", "Monza", "Udinese", "2-3"],
  [2, "2026-08-29", "Sassuolo", "Torino", "2-1"],
  [2, "2026-08-29", "Juventus", "Parma", "2-0"],
  [2, "2026-08-30", "Napoli", "Como", "1-2"],
  [2, "2026-08-30", "Cagliari", "Inter", "0-1"],
  [2, "2026-08-30", "Lazio", "Genoa", "1-0"],
  [2, "2026-08-31", "Lecce", "Roma", "18:30"],
  [2, "2026-08-31", "Atalanta", "Bologna", "20:45"]
] as const;

export const goalkeeperPairs = [
  ["Alta", "Como + Fiorentina", "35-45", "Copertura forte, Como molto appetibile per clean sheet."],
  ["Alta", "Atalanta + Udinese", "30-40", "Buona alternanza e valore modificatore."],
  ["Media", "Fiorentina + Parma", "20-30", "Compromesso costo/rendimento."],
  ["Media", "Genoa + Udinese", "15-25", "Economica, utile se vuoi liberare crediti."],
  ["Media", "Lazio + Lecce", "15-25", "Incroci interessanti, verificare gerarchie Lazio."]
] as const;

export const takers = [
  ["Atalanta", "Scamacca", "Krstovic", "Samardzic", "De Ketelaere", "Samardzic", "Gaetano"],
  ["Bologna", "Orsolini", "Bernardeschi", "Dovbyk", "Orsolini", "Bernardeschi", "Miranda J."],
  ["Cagliari", "Kevin Carlos", "Maldini", "Mina", "Fazzini", "Maldini", "Romano"],
  ["Como", "Da Cunha", "Douvikas", "Paz N.", "Paz N.", "Baturina", "Milla"],
  ["Fiorentina", "Gudmundsson A.", "Mandragora", "", "Gudmundsson A.", "Mastantuono", "Atta"],
  ["Frosinone", "Calo", "Schmid", "Grillitsch", "Calo", "Schmid", "Ghedjemis"],
  ["Genoa", "Colombo", "Ostigard", "Vitinha O.", "Baldanzi", "Martin", "Vitinha O."],
  ["Inter", "Calhanoglu", "Zielinski", "Martinez L.", "Calhanoglu", "Dimarco", "Zielinski"],
  ["Juventus", "Kolo Muani", "Yildiz", "Locatelli", "Yildiz", "Locatelli", "Cambiaso"],
  ["Lazio", "Zaccagni", "Taylor K.", "Cataldi", "Rovella", "Zaccagni", "Cataldi"],
  ["Lecce", "Geubbels", "Stulic", "Berisha M.", "Pierotti", "Berisha M.", "Gandelman"],
  ["Milan", "Ramos G.", "Pulisic", "Modric", "Modric", "Pulisic", "Saelemaekers"],
  ["Monza", "Pessina", "Cutrone", "Petagna", "Pessina", "Colpani", "Mota"],
  ["Napoli", "De Bruyne", "Hojlund", "Politano", "De Bruyne", "Politano", "Neres"],
  ["Parma", "Pellegrino M.", "Toure E.", "Valeri", "Bernabe", "Nicolussi Caviglia", "Valeri"],
  ["Roma", "Malen", "Dybala", "Castro S.", "Dybala", "Malen", "Pellegrini Lo."],
  ["Sassuolo", "Berardi", "Pinamonti", "Lauriente", "Berardi", "Lauriente", "Adzic"],
  ["Torino", "Vlasic", "Kulenovic", "Simeone", "Vlasic", "Oristanio", "Gineitis"],
  ["Udinese", "Davis K.", "Solet", "Zaniolo", "Zaniolo", "Ekkelenkamp", "Unai Gomez"],
  ["Venezia", "Busio", "Adams A.", "Adorante", "Busio", "Yeboah J.", "Perez K."]
] as const;

const manualNotes: Record<string, { note: string; maxBid: number; tier: string }> = {
  "Malen": { note: "Top assoluto; rigorista Roma, 14 gol nel 2025/26 e avvio 2026/27 molto caldo.", maxBid: 148, tier: "Fascia 1" },
  "Martinez L.": { note: "Primo slot stabile: 17 gol e 6 assist nel 2025/26, alta affidabilita Inter.", maxBid: 132, tier: "Fascia 1" },
  "Thuram": { note: "Primo slot basso/secondo slot deluxe: 13 gol e 6 assist 2025/26.", maxBid: 96, tier: "Fascia 1" },
  "Ramos G.": { note: "Obiettivo Milan, primo rigorista indicato: prendere senza pagare tassa rossonera.", maxBid: 86, tier: "Fascia 1" },
  "Hojlund": { note: "Attaccante Napoli con doppia cifra realistica; 12 gol e 5 assist 2025/26.", maxBid: 94, tier: "Fascia 1" },
  "Douvikas": { note: "Assimilato nel Como di Fabregas, doppia cifra alla portata.", maxBid: 68, tier: "Fascia 2" },
  "Kolo Muani": { note: "Titolare Juve e primo rigorista; prezzo giusto, non inseguire hype.", maxBid: 76, tier: "Fascia 2" },
  "Kean": { note: "Potenziale doppia cifra, ma dipende da contesto e concorrenza.", maxBid: 58, tier: "Fascia 2" },
  "Yildiz": { note: "Talento e piazzati Juve: 10 gol e 6 assist 2025/26.", maxBid: 60, tier: "Fascia 2" },
  "Scamacca": { note: "Rigorista Atalanta; upside alto, controllare prezzo e tenuta fisica.", maxBid: 48, tier: "Fascia 3" },
  "Dybala": { note: "Piazzati Roma, classe enorme ma rischio minutaggio: solo a sconto.", maxBid: 40, tier: "Fascia 3" },
  "Dimarco": { note: "Difensore top da bonus: 7 gol e 17 assist 2025/26, perfetto col modificatore.", maxBid: 55, tier: "Fascia 1" },
  "Calhanoglu": { note: "Rigorista Inter: 9 gol, 4 assist e 4/5 rigori nel 2025/26.", maxBid: 80, tier: "Fascia 1" },
  "Paz N.": { note: "12 gol e 5 assist 2025/26; talento Como da pagare ma senza asta folle.", maxBid: 78, tier: "Fascia 1" },
  "McTominay": { note: "10 gol 2025/26, peso fisico e titolarita Napoli.", maxBid: 70, tier: "Fascia 1" },
  "Orsolini": { note: "Rigorista e piazzati Bologna: 10 gol nel 2025/26.", maxBid: 64, tier: "Fascia 1" },
  "Pulisic": { note: "Milan, alternativa rigori: 8 gol e 4 assist 2025/26. Target se resta sotto i top.", maxBid: 54, tier: "Fascia 2" },
  "Rabiot": { note: "Titolare Milan da voto e inserimenti, utile ma non da strapagare.", maxBid: 38, tier: "Fascia 2" },
  "Barella": { note: "Voti e assist: 9 assist 2025/26, meno gol di un top puro.", maxBid: 34, tier: "Fascia 2" },
  "De Bruyne": { note: "Rigorista e piazzati Napoli, valore alto se minutaggio stabile.", maxBid: 56, tier: "Fascia 2" },
  "Svilar": { note: "Portiere super top per clean sheet e rendimento Roma.", maxBid: 52, tier: "Fascia 1" },
  "Maignan": { note: "Porta Milan: utile col modificatore, ma non superare il prezzo top.", maxBid: 42, tier: "Fascia 1" },
  "Martinez Jo.": { note: "Porta Inter, investimento da primo slot se gerarchie confermate.", maxBid: 46, tier: "Fascia 1" },
  "Carnesecchi": { note: "Portiere da modificatore, Atalanta solida.", maxBid: 40, tier: "Fascia 1" },
  "Butez": { note: "Como forte per clean sheet; valutare coppia con Fiorentina/Udinese.", maxBid: 42, tier: "Fascia 1" },
  "Vicario": { note: "Titolare Juve indicato da SOS Fanta, primo slot.", maxBid: 42, tier: "Fascia 1" }
};

const roleMultiplier: Record<Role, number> = { P: 0.65, D: 0.22, C: 0.31, A: 0.34 };
const roleCaps: Record<Role, number> = { P: 55, D: 58, C: 86, A: 150 };

const quotazioni = quotazioniRaw as RawPlayer[];
const stats25 = new Map((stats25Raw as RawStats[]).map((row) => [row.name, row]));
const stats26 = new Map((stats26Raw as RawStats[]).map((row) => [row.name, row]));

function num(value: unknown): number {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(String(value).replace(",", ".").split(" ")[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

function penaltyRank(name: string): number | undefined {
  for (const row of takers) {
    for (let i = 1; i <= 3; i += 1) {
      if (row[i] === name) return i;
    }
  }
  return undefined;
}

function setPieceRank(name: string): number | undefined {
  for (const row of takers) {
    for (let i = 4; i <= 6; i += 1) {
      if (row[i] === name) return i - 3;
    }
  }
  return undefined;
}

function scorePlayer(q: RawPlayer): number {
  const s25 = stats25.get(q.name);
  const s26 = stats26.get(q.name);
  let score = q.fvm / 7;
  score += num(s25?.gol) * (q.role === "C" || q.role === "A" ? 4 : 2);
  score += num(s25?.ass) * (q.role === "D" || q.role === "C" ? 3 : 2);
  score += Math.max(0, num(s25?.mv) - 6) * 14;
  score += num(s26?.gol) * 6 + num(s26?.ass) * 3;
  if (penaltyRank(q.name) === 1) score += 18;
  if (setPieceRank(q.name)) score += 8;
  if (q.team === "MIL") score += 2;
  return Math.round(score * 10) / 10;
}

function calculatedMaxBid(q: RawPlayer): number {
  const manual = manualNotes[q.name];
  if (manual) return manual.maxBid;
  const s25 = stats25.get(q.name);
  const s26 = stats26.get(q.name);
  let value = q.fvm * roleMultiplier[q.role];
  value += Math.min(10, num(s25?.gol) * 0.6);
  value += Math.min(8, num(s25?.ass) * 0.35);
  value += penaltyRank(q.name) === 1 && q.role !== "P" ? 8 : 0;
  value += setPieceRank(q.name) && (q.role === "D" || q.role === "C") ? 4 : 0;
  value += Math.min(8, num(s26?.gol) * 2 + num(s26?.ass));
  return Math.max(1, Math.min(roleCaps[q.role], Math.round(value)));
}

function starsFor(role: Role, maxBid: number): number {
  const cuts: Record<Role, number[]> = {
    P: [45, 35, 25, 15, 7],
    D: [48, 36, 24, 14, 7],
    C: [72, 56, 40, 24, 10],
    A: [115, 85, 60, 35, 15]
  };
  for (let i = 0; i < cuts[role].length; i += 1) {
    if (maxBid >= cuts[role][i]) return 6 - i;
  }
  return 1;
}

function tierFor(q: RawPlayer, stars: number): string {
  const manual = manualNotes[q.name];
  if (manual) return manual.tier;
  if (stars >= 5) return "Fascia 1";
  if (stars === 4) return "Fascia 2";
  if (stars === 3) return "Fascia 3";
  if (stars === 2) return "Low cost";
  return "Riempitivo";
}

function noteFor(q: RawPlayer): string {
  const manual = manualNotes[q.name];
  if (manual) return manual.note;
  const s25 = stats25.get(q.name);
  const bits: string[] = [];
  if (penaltyRank(q.name) === 1) bits.push("primo rigorista");
  if (setPieceRank(q.name)) bits.push("piazzati");
  if (num(s25?.gol) >= 8) bits.push(`${num(s25?.gol)} gol 2025/26`);
  if (num(s25?.ass) >= 5) bits.push(`${num(s25?.ass)} assist 2025/26`);
  if (q.team === "MIL") bits.push("Milan: ok solo entro massimale");
  return bits.length ? `${bits.join("; ")}.` : "Profilo da valutare a prezzo, senza rilanci emotivi.";
}

export const allPlayers: Player[] = quotazioni.map((q) => {
  const maxBid = calculatedMaxBid(q);
  const stars = starsFor(q.role, maxBid);
  return {
    ...q,
    score: scorePlayer(q),
    maxBid,
    openBid: Math.max(1, Math.round(maxBid * 0.45)),
    stars,
    tier: tierFor(q, stars),
    note: noteFor(q),
    penaltyRank: penaltyRank(q.name),
    setPieceRank: setPieceRank(q.name),
    stats25: stats25.get(q.name),
    stats26: stats26.get(q.name)
  };
});

export const selectedPlayers: Player[] = ["P", "D", "C", "A"].flatMap((role) => {
  const limit: Record<Role, number> = { P: 28, D: 55, C: 55, A: 45 };
  return allPlayers
    .filter((player) => player.role === role)
    .sort((a, b) => b.stars - a.stars || b.score - a.score || b.fvm - a.fvm)
    .slice(0, limit[role as Role]);
}) as Player[];

export function starsText(stars: number): string {
  return "*".repeat(stars);
}

export function numberFromStat(value?: string): number {
  return num(value);
}

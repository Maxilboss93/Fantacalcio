import quotazioniRaw from "./data/quotazioni.json";
import stats25Raw from "./data/stats_2025_26.json";
import stats26Raw from "./data/stats_2026_27.json";

export type Role = "P" | "D" | "C" | "A";
export type Status = "Da chiamare" | "Monitor" | "Comprato" | "Perso" | "Evita" | "Consigliato";

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
  profile: string;
  maxBid: number;
  openBid: number;
  score: number;
  note: string;
  penaltyRank?: number;
  setPieceRank?: number;
  stats25?: RawStats;
  stats26?: RawStats;
  injury?: InjurySignal;
  scouting?: ExternalScoutingSignal;
};

export type AuctionPick = {
  status: Status;
  paid?: number;
  owner?: string;
  liveNote?: string;
};

export type EditorialAvoidSignal = {
  reason: string;
  source: string;
};

export type InjurySignal = {
  concern: string;
  recovery: string;
  impact: "Alta" | "Media" | "Bassa";
  source: string;
  maxBidDiscount: number;
  scorePenalty: number;
};

export type ExternalScoutingSignal = {
  origin: string;
  lastSeason: string;
  verdict: string;
  source: string;
  maxBidBoost: number;
  scoreBoost: number;
};

export type BudgetRow = {
  role: Role | "R";
  label: string;
  slots: number;
  budget: number;
};

export type MatchInsight = {
  day: number;
  date: string;
  match: string;
  score: string;
  status: "Finale" | "Dati parziali";
  notes: string[];
};

export type MarketUpdate = {
  name: string;
  role: Role;
  team: string;
  update: string;
  action: "Inserito" | "Aggiornato" | "Verificato" | "Rimosso";
  source: string;
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
  ["Fantacalcio.it trasferimenti ufficiali", "https://www.fantacalcio.it/calciomercato/trasferimenti-ufficiali"],
  ["Lega Serie A calciomercato", "https://www.legaseriea.it/serie-a/calciomercato"],
  ["AC Milan comunicato Leao", "https://www.acmilan.com/it/news/articoli/media/2026-08-30/comunicato-ufficiale-rafael-leao"],
  ["Galatasaray comunicato Leao", "https://www.galatasaray.org/haber/gs-sportif-a-s/rafael-leao-galatasarayda/60848"],
  ["Fantacalcio.it trappole asta 26/27", "https://www.fantacalcio.it/consigli-fantacalcio/19_08_2026/trappole-asta-fantacalcio-26-27-496633"],
  ["Fantacalcio.it antiscommesse 26/27", "https://www.fantacalcio.it/amp/consigli-fantacalcio/10_08_2026/fantacalcio-scommesse-antiscommesse-495816"],
  ["Fantacalcio.it indisponibili Serie A", "https://www.fantacalcio.it/serie-a/indisponibili"],
  ["SOS Fanta indisponibili Serie A", "https://www.sosfanta.com/indisponibili-e-squalificati/tabella-indisponibili-seriea-fantacalcio-asta-infortunati-tempi-recupero-squalificati-diffidati/"],
  ["Fantacalcio.it Lecce-Roma 31/08", "https://www.fantacalcio.it/serie-a/calendario/2/2026-27/lecce-roma/17970"],
  ["Lega Serie A Atalanta-Bologna stats", "https://www.legaseriea.it/serie-a/match/871c6bbab9df419cbf03467af7a82599/atalanta-vs-bologna"],
  ["FotMob profili giocatori", "https://www.fotmob.com/"],
  ["FootyStats profili giocatori", "https://footystats.org/"],
  ["StatMuse calcio", "https://www.statmuse.com/fc"],
  ["Toronto FC Bernardeschi 2025", "https://www.torontofc.ca/news/toronto-fc-agree-to-mutual-termination-with-winger-federico-bernardeschi"],
  ["PSG Ramos al Milan", "https://www.psg.fr/en/content/pr-goncalo-ramos-joins-ac-milan"],
  ["Goal guida asta", "https://www.goal.com/it/liste/consigli-fantacalcio-serie-a-2026-2027-chi-prendere-all-asta-la-guida-completa-divisione-in-fasce-e-ruoli/blt990f9f2a29ab947d"],
  ["Gazzetta FantaNews", "https://www.gazzetta.it/calcio/fantanews/11-08-2026/guida-fantacalcio-2026-2027-migliori-giocatori-da-comprare-all-asta.shtml"],
  ["Fantacalcio-Online prezzi reali", "https://www.fantacalcio-online.com/it/i-piu-comprati"],
  ["Fantacalcio.dev fasce oneste", "https://fantacalcio.dev/report/fasce-oneste-2026-27"],
  ["Fantacalciopedia", "https://www.fantacalciopedia.com/"],
  ["Fantapazz", "https://www.fantapazz.com/"],
  ["Fantamagazine", "https://www.fantamagazine.com/"]
] as const;

export const editorialAvoidSignals: Record<string, EditorialAvoidSignal> = {
  "Maldini": {
    reason: "Rischio continuita e gerarchie offensive ancora poco stabili.",
    source: "Fantacalcio.it, 3 trappole da evitare all'asta 26/27"
  },
  "Diao": {
    reason: "Rischio turnover, problemi fisici ricorrenti e prezzo da tenere molto basso.",
    source: "Fantacalcio.it, 3 trappole da evitare all'asta 26/27"
  },
  "Soulè": {
    reason: "Rientro da una seconda parte di stagione negativa e concorrenza aumentata.",
    source: "Fantacalcio.it, 3 trappole da evitare all'asta 26/27"
  },
  "De Roon": {
    reason: "Concorrenza in mediana: rischio di perdere terreno e diventare una riserva.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Pobega": {
    reason: "Concorrenza e posizione piu arretrata: bonus attesi in calo.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Borrelli": {
    reason: "Parte avanti ma potrebbe perdere presto terreno nelle gerarchie.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Addai": {
    reason: "Problemi fisici e concorrenza folta sulla trequarti.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Oulai": {
    reason: "Profilo piu da regista che da mezzala: pochi bonus attesi rispetto al prezzo.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Grillitsch": {
    reason: "Condizione da ritrovare e profilo poco incline ai bonus.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Mkhitaryan": {
    reason: "Titolarita meno certa, tanta concorrenza e bonus in calo.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Thuram K.": {
    reason: "Concorrenza in mediana e preparazione estiva condizionata.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Noslin": {
    reason: "Parte dietro nelle gerarchie offensive: minutaggio difficile da gestire.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Gandelman": {
    reason: "Condizione non ottimale e posizione leggermente indietro nelle gerarchie.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Chukwueze": {
    reason: "Adattamento tattico e attese basse per bonus e voti.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Pessina": {
    reason: "Rischio fisico e prezzo gonfiato dai rigori per un centrocampista arretrato.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Buongiorno": {
    reason: "Rientro fisico graduale dopo una preparazione condizionata.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Almqvist": {
    reason: "Titolarita non solida e rischio di perdere terreno durante la stagione.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "El Aynaoui": {
    reason: "Alternativa ai titolarissimi con compiti difensivi e pochi bonus.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Dominguez B.": {
    reason: "Parte dietro nelle gerarchie e rischia di essere soprattutto un subentrante.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Zapata D.": {
    reason: "Concorrenza offensiva molto alta e rischio fisico rilevante.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Chakvetadze": {
    reason: "Gerarchie non consolidate, adattamento e bonus non abbastanza freddi.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  },
  "Adorante": {
    reason: "Il mercato ha aumentato la concorrenza e puo diventare un comprimario.",
    source: "Fantacalcio.it, scommesse e antiscommesse 26/27"
  }
};

export const injurySignals: Record<string, InjurySignal> = {
  "Yildiz": {
    concern: "Problema al piede sinistro, con possibile intervento.",
    recovery: "rischio stop circa 3 mesi",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 20,
    scorePenalty: 26
  },
  "Gimenez": {
    concern: "Distorsione alla caviglia, out contro Venezia.",
    recovery: "da valutare per la 3a giornata",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 5,
    scorePenalty: 7
  },
  "Pessina": {
    concern: "Lussazione rotula ginocchio destro.",
    recovery: "prova rientro da inizio novembre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 10,
    scorePenalty: 18
  },
  "Buongiorno": {
    concern: "Recupero lento dopo intervento al menisco.",
    recovery: "ipotizzato da meta novembre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 12,
    scorePenalty: 20
  },
  "Marianucci": {
    concern: "Lesione alta del collaterale mediale.",
    recovery: "rischio almeno 2 mesi",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 7,
    scorePenalty: 14
  },
  "Nicolussi Caviglia": {
    concern: "Operazione dopo lesione di medio grado alla coscia.",
    recovery: "ipotesi rientro da novembre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 7,
    scorePenalty: 14
  },
  "Adorante": {
    concern: "Operazione alla schiena a fine luglio.",
    recovery: "buona parte del girone d'andata a rischio",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 8,
    scorePenalty: 16
  },
  "Chakvetadze": {
    concern: "Condizioni da monitorare.",
    recovery: "da valutare",
    impact: "Media",
    source: "Fantacalcio.it infortunati Serie A, 31/08/2026",
    maxBidDiscount: 5,
    scorePenalty: 8
  },
  "Hien": {
    concern: "Lesione al tendine prossimale del semimembranoso.",
    recovery: "pronto da inizio ottobre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 5,
    scorePenalty: 9
  },
  "Sulemana K.": {
    concern: "Lesione del collaterale mediale di secondo grado.",
    recovery: "recuperabile da inizio ottobre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 6,
    scorePenalty: 10
  },
  "Kristensen T.": {
    concern: "Problema alla caviglia.",
    recovery: "da valutare quotidianamente",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 3,
    scorePenalty: 5
  },
  "El Azzouzi O.": {
    concern: "Lesione del bicipite femorale sinistro.",
    recovery: "seconda meta settembre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 4,
    scorePenalty: 7
  },
  "Mina": {
    concern: "Affaticamento al polpaccio.",
    recovery: "da valutare per la 3a giornata",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 3,
    scorePenalty: 5
  },
  "Addai": {
    concern: "Rottura del tendine d'Achille.",
    recovery: "prova rientro dalla seconda meta settembre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 5,
    scorePenalty: 9
  },
  "Parisi": {
    concern: "Recupero da infortunio al crociato.",
    recovery: "punta a novembre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 7,
    scorePenalty: 14
  },
  "Rensch": {
    concern: "Risentimento muscolare al flessore sinistro.",
    recovery: "da valutare dopo Lecce-Roma",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 3,
    scorePenalty: 5
  },
  "Boloca": {
    concern: "Problema al ginocchio.",
    recovery: "da meta settembre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 4,
    scorePenalty: 7
  },
  "Casadei": {
    concern: "Affaticamento muscolare alla gamba.",
    recovery: "da valutare per la 3a giornata",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 3,
    scorePenalty: 5
  },
  "Palma": {
    concern: "Problema muscolare all'adduttore destro.",
    recovery: "meta settembre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 4,
    scorePenalty: 7
  },
  "Zanoli": {
    concern: "Recupero da lesione del crociato.",
    recovery: "puo tornare da ottobre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 5,
    scorePenalty: 9
  },
  "Walukiewicz": {
    concern: "Forte trauma contusivo alla gamba destra.",
    recovery: "da inizio settembre",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 2,
    scorePenalty: 4
  },
  "Pieragnolo": {
    concern: "Recupero da lesione del crociato.",
    recovery: "da ottobre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 5,
    scorePenalty: 9
  },
  "McKennie": {
    concern: "Affaticamento muscolare alla gamba.",
    recovery: "da valutare",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 3,
    scorePenalty: 5
  },
  "Thuram K.": {
    concern: "Sindrome femoro-rotulea.",
    recovery: "da valutare per la 3a giornata",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 6,
    scorePenalty: 10
  },
  "Trepy": {
    concern: "Condizioni monitorate dopo ricovero.",
    recovery: "assente nel prossimo turno, tempi da valutare",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 8,
    scorePenalty: 16
  },
  "Idrissi R.": {
    concern: "Recupero da rottura del crociato.",
    recovery: "fine ottobre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 31/08/2026",
    maxBidDiscount: 5,
    scorePenalty: 9
  }
};

export const externalScoutingSignals: Record<string, ExternalScoutingSignal> = {
  "Kessiè": {
    origin: "Al-Ahli, Saudi Pro League",
    lastSeason: "2025/26: 26 partite, 5 gol, 3 assist, 2173 minuti, rating FotMob 7.28.",
    verdict: "Rilancio vero: da prendere se resta sotto i top di centrocampo. Non e il Kessiè rigorista del Milan, ma porta fisico, titolarita e inserimenti.",
    source: "FotMob e FootyStats, controllo 31/08/2026",
    maxBidBoost: 17,
    scoreBoost: 16
  },
  "De Bruyne": {
    origin: "Manchester City / Napoli",
    lastSeason: "Storico elite City; avvio Serie A 2026/27: 1 gol e 1 assist in 57 minuti secondo FotMob.",
    verdict: "Top tecnico e piazzati: valore alto, ma va protetto dal rischio eta/minutaggio.",
    source: "FotMob, controllo 31/08/2026",
    maxBidBoost: 0,
    scoreBoost: 0
  },
  "Ramos G.": {
    origin: "Paris Saint-Germain",
    lastSeason: "2025/26 PSG: 45 presenze, 12 gol, 2 assist; in Ligue 1 6 gol e 0.56 xG/90 secondo FootyStats.",
    verdict: "Profilo da semitop/top basso: lo paghi per ruolo Milan e rigori, non per stagione estera dominante.",
    source: "PSG e FootyStats, controllo 31/08/2026",
    maxBidBoost: 0,
    scoreBoost: 0
  },
  "Bernardeschi": {
    origin: "Toronto FC, MLS",
    lastSeason: "2025 MLS: 4 gol e 4 assist in 15 partite prima della risoluzione col Toronto FC.",
    verdict: "Interessante per piazzati e ruolo da C, ma va trattato da bonus intermittente, non da top.",
    source: "Toronto FC, controllo 31/08/2026",
    maxBidBoost: 6,
    scoreBoost: 7
  },
  "Theate": {
    origin: "Eintracht Frankfurt, Bundesliga",
    lastSeason: "2025/26 Bundesliga: 24 partite da titolare, 1 gol, 2143 minuti, rating 6.70.",
    verdict: "Difensore affidabile da voto/minutaggio, poco bonus: buono a prezzo controllato.",
    source: "FotMob, controllo 31/08/2026",
    maxBidBoost: 7,
    scoreBoost: 8
  },
  "Balerdi": {
    origin: "Marsiglia, Ligue 1",
    lastSeason: "2025/26 Marsiglia: 26 presenze in Ligue 1, 0 gol; 36 presenze e 1 gol in tutte le competizioni.",
    verdict: "Centrale da rotazione/copertura: non alzare per il nome Roma, bonus molto limitati.",
    source: "Wikipedia e StatMuse, controllo 31/08/2026",
    maxBidBoost: 4,
    scoreBoost: 5
  },
  "Van Der Brempt": {
    origin: "Como / passaggio Sassuolo",
    lastSeason: "2025/26 Serie A: 14 presenze Fantacalcio, media voto 5.96, 1 assist.",
    verdict: "Low cost difensivo: puo dare minuti, ma non va confuso con un profilo da modificatore.",
    source: "Fantacalcio.it statistiche 2025/26",
    maxBidBoost: 1,
    scoreBoost: 2
  },
  "Njie": {
    origin: "Torino / passaggio Fiorentina",
    lastSeason: "2025/26 Serie A: 10 presenze Fantacalcio, 1 gol, 1 assist.",
    verdict: "Scommessa giovane: ruolo C interessante, ma minutaggio ancora da verificare.",
    source: "Fantacalcio.it statistiche 2025/26",
    maxBidBoost: 3,
    scoreBoost: 4
  }
};

export function defaultStatusFor(player: Pick<RawPlayer, "name">): Status {
  if (editorialAvoidSignals[player.name]) return "Evita";
  if (injurySignals[player.name]?.impact === "Alta") return "Monitor";
  return "Da chiamare";
}

export const budgetPlan: BudgetRow[] = [
  { role: "P", label: "Portieri", slots: 3, budget: 45 },
  { role: "D", label: "Difensori", slots: 8, budget: 80 },
  { role: "C", label: "Centrocampisti", slots: 8, budget: 150 },
  { role: "A", label: "Attaccanti", slots: 6, budget: 225 },
  { role: "R", label: "Riserva tattica", slots: 0, budget: 0 }
];

export const auctionRules = {
  participants: 10,
  firstBandAttackMin: 100
} as const;

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
  [2, "2026-08-31", "Lecce", "Roma", "0-0"],
  [2, "2026-08-31", "Atalanta", "Bologna", "0-0"]
] as const;

export const postponedMatchInsights: MatchInsight[] = [
  {
    day: 2,
    date: "2026-08-31",
    match: "Lecce-Roma",
    score: "0-0",
    status: "Dati parziali",
    notes: [
      "Risultato 0-0 dalle fonti consultate; tabellino, voti e statistiche squadra non ancora consolidati al controllo.",
      "Per asta: piccolo freno su hype Roma dopo il 4-0 iniziale, ma Svilar/difesa restano interessanti per clean sheet."
    ]
  },
  {
    day: 2,
    date: "2026-08-31",
    match: "Atalanta-Bologna",
    score: "0-0",
    status: "Dati parziali",
    notes: [
      "Risultato 0-0 dalle fonti consultate. Lega Serie A: xG 1.17-1.02, tiri 10-10, tiri in porta 1-5, angoli 2-5.",
      "Per asta: attacco Atalanta meno brillante del prezzo, Bologna solido ma ancora senza bonus offensivi."
    ]
  }
] as const;

export const marketUpdates: MarketUpdate[] = [
  {
    name: "Leao",
    role: "A",
    team: "GAL",
    update: "Cessione ufficiale a titolo definitivo dal Milan al Galatasaray il 30/08/2026: rimosso dal listone attivo Serie A e non acquistabile all'asta.",
    action: "Rimosso",
    source: "AC Milan e Galatasaray, comunicati ufficiali 30/08/2026"
  },
  {
    name: "Kessiè",
    role: "C",
    team: "ATA",
    update: "Arrivo dall'estero verificato nel listone: quotazione 12, FVM 47. Massimale rivalutato con scouting 2025/26.",
    action: "Verificato",
    source: "Fantacalcio.it quotazioni, FotMob, FootyStats"
  },
  {
    name: "De Bruyne",
    role: "C",
    team: "NAP",
    update: "Profilo estero/elite gia nel listone: quotazione 16, FVM 107. Alzato a top di centrocampo ma con controllo su eta e minuti.",
    action: "Verificato",
    source: "Fantacalcio.it quotazioni, FotMob"
  },
  {
    name: "Ramos G.",
    role: "A",
    team: "MIL",
    update: "Arrivo PSG verificato nel listone Milan: quotazione 27, FVM 228. Prezzo da top basso/semitop alto in lega a 10.",
    action: "Verificato",
    source: "Fantacalcio.it quotazioni, PSG, FootyStats"
  },
  {
    name: "Modric",
    role: "C",
    team: "MIL",
    update: "Profilo Milan verificato nel listone: quotazione 12, FVM 46. Tenuto basso per bonus attesi limitati.",
    action: "Verificato",
    source: "Fantacalcio.it quotazioni, StatMuse"
  },
  {
    name: "Bernardeschi",
    role: "C",
    team: "BOL",
    update: "Rientro MLS gia nel listone Bologna: quotazione 9, FVM 30. Valutato per piazzati e bonus intermittenti.",
    action: "Verificato",
    source: "Fantacalcio.it quotazioni, Toronto FC"
  },
  {
    name: "Massolin",
    role: "C",
    team: "CAG",
    update: "Nuovo ingresso nel listone ufficiale Fantacalcio.it: Cagliari, quotazione 4, FVM 12.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, controllo 31/08/2026"
  },
  {
    name: "Fini",
    role: "C",
    team: "FRO",
    update: "Nome ripulito dallo spazio finale; resta Frosinone, quotazione 4, FVM 13.",
    action: "Aggiornato",
    source: "Fantacalcio.it quotazioni, controllo 31/08/2026"
  },
  {
    name: "Ziolkowski",
    role: "D",
    team: "MON",
    update: "Squadra aggiornata a Monza nel listone ufficiale, quotazione 1, FVM 2.",
    action: "Aggiornato",
    source: "Fantacalcio.it quotazioni e Lega Serie A calciomercato, 31/08/2026"
  },
  {
    name: "De Roon",
    role: "C",
    team: "ROM",
    update: "Movimento Roma verificato: presente nel listone come centrocampista ROM, quotazione 4.",
    action: "Verificato",
    source: "Sky Sport, Fantacalcio.it trasferimenti ufficiali"
  },
  {
    name: "Balerdi",
    role: "D",
    team: "ROM",
    update: "Nuovo difensore Roma gia presente nel listone ufficiale, quotazione 6, FVM 11.",
    action: "Verificato",
    source: "Sky Sport, Fantacalcio.it trasferimenti ufficiali"
  },
  {
    name: "Theate",
    role: "D",
    team: "BOL",
    update: "Ritorno al Bologna verificato nel listone: quotazione 8, FVM 20.",
    action: "Verificato",
    source: "Sky Sport, Fantacalcio.it trasferimenti ufficiali"
  },
  {
    name: "Van Der Brempt",
    role: "D",
    team: "SAS",
    update: "Passaggio al Sassuolo verificato nel listone: quotazione 2, FVM 5.",
    action: "Verificato",
    source: "Sky Sport, Lega Serie A calciomercato"
  },
  {
    name: "Dembelè A.",
    role: "D",
    team: "LEC",
    update: "Difensore Lecce verificato nel listone ufficiale, quotazione 1, FVM 2.",
    action: "Verificato",
    source: "Sky Sport, Fantacalcio.it trasferimenti ufficiali"
  },
  {
    name: "Njie",
    role: "C",
    team: "FIO",
    update: "Passaggio alla Fiorentina verificato nel listone: quotazione 5, FVM 23.",
    action: "Verificato",
    source: "Sky Sport, Fantacalcio.it trasferimenti ufficiali"
  }
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
  ["Parma", "Pellegrino M.", "Tourè E.", "Valeri", "Bernabè", "Nicolussi Caviglia", "Valeri"],
  ["Roma", "Malen", "Dybala", "Castro S.", "Dybala", "Malen", "Pellegrini Lo."],
  ["Sassuolo", "Berardi", "Pinamonti", "Laurientè", "Berardi", "Laurientè", "Adzic"],
  ["Torino", "Vlasic", "Kulenovic", "Simeone", "Vlasic", "Oristanio", "Gineitis"],
  ["Udinese", "Davis K.", "Solet", "Zaniolo", "Zaniolo", "Ekkelenkamp", "Unai Gomez"],
  ["Venezia", "Busio", "Adams A.", "Adorante", "Busio", "Yeboah J.", "Perez K."]
] as const;

const manualNotes: Record<string, { note: string; maxBid: number; tier: string }> = {
  "Malen": { note: "Top assoluto; rigorista Roma, 14 gol nel 2025/26 e avvio 2026/27 molto caldo.", maxBid: 148, tier: "Fascia 1" },
  "Martinez L.": { note: "Primo slot stabile: 17 gol e 6 assist nel 2025/26, alta affidabilita Inter.", maxBid: 132, tier: "Fascia 1" },
  "Thuram": { note: "Primo slot basso/secondo slot deluxe: 13 gol e 6 assist 2025/26.", maxBid: 100, tier: "Fascia 1" },
  "Ramos G.": { note: "Obiettivo Milan, primo rigorista indicato: prendere senza pagare tassa rossonera.", maxBid: 100, tier: "Fascia 1" },
  "Hojlund": { note: "Attaccante Napoli con doppia cifra realistica; 12 gol e 5 assist 2025/26.", maxBid: 100, tier: "Fascia 1" },
  "Douvikas": { note: "Assimilato nel Como di Fabregas, doppia cifra alla portata.", maxBid: 68, tier: "Fascia 2" },
  "Kolo Muani": { note: "Titolare Juve e primo rigorista; prezzo giusto, non inseguire hype.", maxBid: 76, tier: "Fascia 2" },
  "Kean": { note: "Potenziale doppia cifra, ma dipende da contesto e concorrenza.", maxBid: 58, tier: "Fascia 2" },
  "Yildiz": { note: "Talento e piazzati Juve: 10 gol e 6 assist 2025/26.", maxBid: 60, tier: "Fascia 2" },
  "Scamacca": { note: "Rigorista Atalanta; upside alto, controllare prezzo e tenuta fisica.", maxBid: 48, tier: "Fascia 3" },
  "Dybala": { note: "Piazzati Roma, classe enorme ma rischio minutaggio: solo a sconto.", maxBid: 40, tier: "Fascia 3" },
  "Dovbyk": { note: "Bologna, prima punta fisica ma posticipi senza squillo e 2025/26 Roma non esplosivo: prendere solo a prezzo da terzo slot.", maxBid: 34, tier: "Fascia 3" },
  "Dimarco": { note: "Difensore top da bonus: 7 gol e 17 assist 2025/26, perfetto col modificatore.", maxBid: 55, tier: "Fascia 1" },
  "Calhanoglu": { note: "Rigorista Inter: 9 gol, 4 assist e 4/5 rigori nel 2025/26.", maxBid: 80, tier: "Fascia 1" },
  "Paz N.": { note: "12 gol e 5 assist 2025/26; talento Como da pagare ma senza asta folle.", maxBid: 78, tier: "Fascia 1" },
  "McTominay": { note: "10 gol 2025/26, peso fisico e titolarita Napoli.", maxBid: 70, tier: "Fascia 1" },
  "Orsolini": { note: "Rigorista e piazzati Bologna: 10 gol nel 2025/26.", maxBid: 64, tier: "Fascia 1" },
  "Kessiè": { note: "Atalanta, ritorno da profilo pesante: non e piu il vecchio rigorista Milan, ma resta centrocampista da inserimenti.", maxBid: 42, tier: "Fascia 2" },
  "Pulisic": { note: "Milan, alternativa rigori: 8 gol e 4 assist 2025/26. Target se resta sotto i top.", maxBid: 54, tier: "Fascia 2" },
  "Rabiot": { note: "Titolare Milan da voto e inserimenti, utile ma non da strapagare.", maxBid: 38, tier: "Fascia 2" },
  "Barella": { note: "Voti e assist: 9 assist 2025/26, meno gol di un top puro.", maxBid: 34, tier: "Fascia 2" },
  "De Bruyne": { note: "Rigorista e piazzati Napoli, avvio gia da bonus: top tecnico, ma gestire rischio eta/minuti.", maxBid: 62, tier: "Fascia 1" },
  "Modric": { note: "Regia e piazzati Milan, ma bonus strutturalmente bassi: utile da voto, non da asta emotiva.", maxBid: 24, tier: "Fascia 3" },
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
const transferredOutPlayerNames = new Set(["Leao"]);
const activeQuotazioni = quotazioni.filter((player) => !transferredOutPlayerNames.has(player.name));
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
  const injury = injurySignals[q.name];
  const scouting = externalScoutingSignals[q.name];
  let score = q.fvm / 7;
  score += num(s25?.gol) * (q.role === "C" || q.role === "A" ? 4 : 2);
  score += num(s25?.ass) * (q.role === "D" || q.role === "C" ? 3 : 2);
  score += Math.max(0, num(s25?.mv) - 6) * 14;
  score += num(s26?.gol) * 6 + num(s26?.ass) * 3;
  if (penaltyRank(q.name) === 1) score += 18;
  if (setPieceRank(q.name)) score += 8;
  if (q.team === "MIL") score += 2;
  score += scouting?.scoreBoost ?? 0;
  score -= injury?.scorePenalty ?? 0;
  return Math.max(0, Math.round(score * 10) / 10);
}

function calculatedMaxBid(q: RawPlayer): number {
  const manual = manualNotes[q.name];
  const injury = injurySignals[q.name];
  const scouting = externalScoutingSignals[q.name];
  let value: number;
  if (manual) {
    const marketFloor = q.role === "A" && manual.tier === "Fascia 1" ? auctionRules.firstBandAttackMin : 0;
    value = Math.max(marketFloor, manual.maxBid);
    return Math.max(1, value - (injury?.maxBidDiscount ?? 0));
  }
  const s25 = stats25.get(q.name);
  const s26 = stats26.get(q.name);
  value = q.fvm * roleMultiplier[q.role];
  value += Math.min(10, num(s25?.gol) * 0.6);
  value += Math.min(8, num(s25?.ass) * 0.35);
  value += penaltyRank(q.name) === 1 && q.role !== "P" ? 8 : 0;
  value += setPieceRank(q.name) && (q.role === "D" || q.role === "C") ? 4 : 0;
  value += Math.min(8, num(s26?.gol) * 2 + num(s26?.ass));
  value += scouting?.maxBidBoost ?? 0;
  value -= injury?.maxBidDiscount ?? 0;
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

function profileFor(q: RawPlayer, stars: number): string {
  const teammates = activeQuotazioni
    .filter((player) => player.team === q.team && player.role === q.role)
    .sort((a, b) => b.fvm - a.fvm || b.cqi - a.cqi);
  const rank = teammates.findIndex((player) => player.name === q.name);

  if (q.role === "P") {
    if (rank === 0) return "Titolare";
    if (rank === 1) return "Secondo portiere";
    if (rank === 2) return "Terzo portiere";
    return "Riserva";
  }

  if (stars >= 5) return "Titolare";
  if (stars === 4) return "Titolare low cost";
  if (stars === 3) {
    const rival = teammates.find((player) => player.name !== q.name && Math.abs(player.fvm - q.fvm) <= 45);
    return rival ? `Ballottaggio con ${rival.name}` : "Titolare low cost";
  }
  return "Riserva";
}

function noteFor(q: RawPlayer): string {
  const injury = injurySignals[q.name];
  const scouting = externalScoutingSignals[q.name];
  const injuryNote = injury
    ? `Infortunio ${injury.impact.toLowerCase()}: ${injury.concern} Recupero: ${injury.recovery}. Fonte: ${injury.source}.`
    : "";
  const scoutingNote = scouting
    ? `Scouting estero: ${scouting.lastSeason} ${scouting.verdict} Fonte: ${scouting.source}.`
    : "";
  const manual = manualNotes[q.name];
  if (manual) return [manual.note, scoutingNote, injuryNote].filter(Boolean).join(" ");
  const editorialAvoid = editorialAvoidSignals[q.name];
  if (editorialAvoid) return [editorialAvoid.reason, `Fonte: ${editorialAvoid.source}.`, scoutingNote, injuryNote].filter(Boolean).join(" ");
  const s25 = stats25.get(q.name);
  const bits: string[] = [];
  if (penaltyRank(q.name) === 1) bits.push("primo rigorista");
  if (setPieceRank(q.name)) bits.push("piazzati");
  if (num(s25?.gol) >= 8) bits.push(`${num(s25?.gol)} gol 2025/26`);
  if (num(s25?.ass) >= 5) bits.push(`${num(s25?.ass)} assist 2025/26`);
  if (q.team === "MIL") bits.push("Milan: ok solo entro massimale");
  if (scoutingNote) bits.push(scoutingNote);
  if (injuryNote) bits.push(injuryNote);
  return bits.length ? `${bits.join("; ")}.` : "Profilo da valutare a prezzo, senza rilanci emotivi.";
}

export const allPlayers: Player[] = activeQuotazioni.map((q) => {
  const maxBid = calculatedMaxBid(q);
  const stars = starsFor(q.role, maxBid);
  return {
    ...q,
    score: scorePlayer(q),
    maxBid,
    openBid: Math.max(1, Math.round(maxBid * 0.45)),
    stars,
    tier: tierFor(q, stars),
    profile: profileFor(q, stars),
    note: noteFor(q),
    penaltyRank: penaltyRank(q.name),
    setPieceRank: setPieceRank(q.name),
    stats25: stats25.get(q.name),
    stats26: stats26.get(q.name),
    injury: injurySignals[q.name],
    scouting: externalScoutingSignals[q.name]
  };
});

export const selectedPlayers: Player[] = ["P", "D", "C", "A"].flatMap((role) => {
  const limit: Record<Role, number> = { P: 28, D: 55, C: 55, A: 45 };
  const targets = allPlayers
    .filter((player) => player.role === role)
    .sort((a, b) => b.stars - a.stars || b.score - a.score || b.fvm - a.fvm)
    .slice(0, limit[role as Role]);
  const editorialAvoids = allPlayers.filter((player) => player.role === role && defaultStatusFor(player) === "Evita");
  const injuryWatch = allPlayers.filter((player) => player.role === role && Boolean(player.injury));
  const scoutingWatch = allPlayers.filter((player) => player.role === role && Boolean(player.scouting));
  return Array.from(new Map([...targets, ...editorialAvoids, ...injuryWatch, ...scoutingWatch].map((player) => [player.name, player])).values());
}) as Player[];

export function starsText(stars: number): string {
  return "*".repeat(stars);
}

export function numberFromStat(value?: string): number {
  return num(value);
}

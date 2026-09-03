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
  lineup?: LineupSignal;
  roleBug?: RoleBugSignal;
};

export type AuctionPick = {
  status: Status;
  paid?: number;
  owner?: string;
  ownerId?: string;
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

export type LineupSignal = {
  startPct?: number;
  ballotWith?: string;
  ballotPct?: number;
  note?: string;
  source: string;
};

export type RoleBugSignal = {
  kind: "C-attacco" | "D-centrocampo";
  label: string;
  roleOnPitch: string;
  reason: string;
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
  ["Probabili formazioni Fantacalcio.it live", "https://www.fantacalcio.it/probabili-formazioni-serie-a"],
  ["Ultime notizie Fantacalcio.it", "https://www.fantacalcio.it/ultime-notizie"],
  ["Risultati Sky Sport", "https://sport.sky.it/calcio/serie-a/calendario-risultati"],
  ["SOS Fanta guida asta", "https://www.sosfanta.com/guida-asta-fantacalcio/guida-asta-fantacalcio-2026-2027-tutti-consigli-fasce-chi-prendere/"],
  ["SOS Fanta cosa cambia dopo il mercato", "https://www.sosfanta.com/news/douvikas-atta-pellegrino-muani-cosa-cambia-al-fanta/"],
  ["SOS Fanta gerarchie portieri 2026/27", "https://www.sosfanta.com/consigli-fantacalcio/portieri/fantacalcio-asta-tutti-portieri-gerarchie-seriea-venti-squadre-campionato/"],
  ["Fantacalcio.it trasferimenti ufficiali", "https://www.fantacalcio.it/calciomercato/trasferimenti-ufficiali"],
  ["Lega Serie A calciomercato", "https://www.legaseriea.it/serie-a/calciomercato"],
  ["Sky Sport tabellone mercato 2026/27", "https://sport.sky.it/calciomercato/tabellone"],
  ["Sky Sport deadline day 2026", "https://sport.sky.it/calciomercato/calciomercato-serie-a-estate-2026-acquisti-ufficiali"],
  ["Goal deadline day 2026", "https://www.goal.com/it/liste/acquisti-ultimo-giorno-calciomercato-estivo-2026-serie-tutti-affari-ufficiali/blt83c95aa301f84682"],
  ["AC Milan comunicato Leao", "https://www.acmilan.com/it/news/articoli/media/2026-08-30/comunicato-ufficiale-rafael-leao"],
  ["Galatasaray comunicato Leao", "https://www.galatasaray.org/haber/gs-sportif-a-s/rafael-leao-galatasarayda/60848"],
  ["Fantacalcio.it trappole asta 26/27", "https://www.fantacalcio.it/consigli-fantacalcio/19_08_2026/trappole-asta-fantacalcio-26-27-496633"],
  ["Fantacalcio.it antiscommesse 26/27", "https://www.fantacalcio.it/amp/consigli-fantacalcio/10_08_2026/fantacalcio-scommesse-antiscommesse-495816"],
  ["Fantacalcio.it indisponibili Serie A", "https://www.fantacalcio.it/serie-a/indisponibili"],
  ["SOS Fanta indisponibili Serie A", "https://www.sosfanta.com/indisponibili-e-squalificati/tabella-indisponibili-seriea-fantacalcio-asta-infortunati-tempi-recupero-squalificati-diffidati/"],
  ["Fantacalcio.it Lecce-Roma 31/08", "https://www.fantacalcio.it/serie-a/calendario/2/2026-27/lecce-roma/17970"],
  ["Lega Serie A Atalanta-Bologna stats", "https://www.legaseriea.it/serie-a/match/871c6bbab9df419cbf03467af7a82599/atalanta-vs-bologna"],
  ["Goal centrocampisti in attacco 2026/27", "https://www.goal.com/it/liste/fantacalcio-2026-2027-centrocampisti-che-giocano-in-attacco/blt44334a86bccb6b06"],
  ["Goal difensori a centrocampo 2026/27", "https://www.goal.com/it/liste/fantacalcio-2026-2027-difensori-che-giocano-a-centrocampo/blt5003cefff169a736"],
  ["Calcio d'Angolo bug listone 2026/27", "https://calciodangolo.com/fantacalcio-bug-listone-2026-2027-wesley-pulisic-occasioni/"],
  ["FotMob profili giocatori", "https://www.fotmob.com/"],
  ["FootyStats profili giocatori", "https://footystats.org/"],
  ["StatMuse calcio", "https://www.statmuse.com/fc"],
  ["Toronto FC Bernardeschi 2025", "https://www.torontofc.ca/news/toronto-fc-agree-to-mutual-termination-with-winger-federico-bernardeschi"],
  ["PSG Ramos al Milan", "https://www.psg.fr/en/content/pr-goncalo-ramos-joins-ac-milan"],
  ["Goal guida asta", "https://www.goal.com/it/liste/consigli-fantacalcio-serie-a-2026-2027-chi-prendere-all-asta-la-guida-completa-divisione-in-fasce-e-ruoli/blt990f9f2a29ab947d"],
  ["Gazzetta FantaNews", "https://www.gazzetta.it/calcio/fantanews/11-08-2026/guida-fantacalcio-2026-2027-migliori-giocatori-da-comprare-all-asta.shtml"],
  ["Fantacalcio.it Chukwueze 2026/27", "https://www.fantacalcio.it/serie-a/squadre/milan/chukwueze/4856/2026-27/italia"],
  ["SOS Fanta formazioni tipo 2026/27", "https://www.sosfanta.com/asta-fantacalcio/seriea-tutte-formazioni-tipo-fantacalcio-2026-2027-asta-consigli-chi-prendere/"],
  ["DAZN probabile formazione Milan", "https://www.dazn.com/it-IT/news/calcio/probabile-formazione-milan-modulo-titolari-ballottaggi/1ovtpo3fat0e412ic9xn9kpicw"],
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
    concern: "Operato il 31 agosto per frattura alla base del V metatarso del piede sinistro.",
    recovery: "ipotesi rientro da fine novembre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 20,
    scorePenalty: 26
  },
  "Orsolini": {
    concern: "Risentimento ai flessori della coscia sinistra.",
    recovery: "ipotesi rientro da fine settembre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 12,
    scorePenalty: 18
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
  "McTominay": {
    concern: "Lieve aritmia benigna, intervento di correzione tramite ablazione.",
    recovery: "rientro in campo da inizio ottobre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 20,
    scorePenalty: 24
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
    concern: "Frattura al terzo metatarso del piede destro.",
    recovery: "rientro dalla prima meta settembre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
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
    recovery: "da valutare contro la Roma",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
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
    recovery: "da valutare contro il Lecce",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
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
    recovery: "convocazione a rischio contro il Milan",
    impact: "Bassa",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 3,
    scorePenalty: 5
  },
  "Thuram K.": {
    concern: "Sindrome femoro-rotulea, scelta operazione dopo consulto medico.",
    recovery: "tempi lunghi, ipotesi rientro da gennaio",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 10,
    scorePenalty: 18
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
  },
  "Geubbels": {
    concern: "Distorsione alla caviglia rimediata contro la Roma.",
    recovery: "out a Cagliari, tempi da valutare",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 5,
    scorePenalty: 9
  },
  "Varela G.": {
    concern: "Fastidio muscolare all'adduttore.",
    recovery: "out contro il Parma, tempi da valutare",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 5,
    scorePenalty: 9
  },
  "Rovella": {
    concern: "Lesione muscolare al polpaccio.",
    recovery: "rientro dalla prima meta ottobre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 8,
    scorePenalty: 14
  },
  "Cataldi": {
    concern: "Recupero dopo ernia bilaterale.",
    recovery: "recuperabile da meta settembre",
    impact: "Media",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 4,
    scorePenalty: 7
  },
  "Marusic": {
    concern: "Lesione muscolare alla coscia.",
    recovery: "ipotesi rientro da inizio ottobre",
    impact: "Alta",
    source: "Fantacalcio.it indisponibili Serie A, 03/09/2026",
    maxBidDiscount: 8,
    scorePenalty: 14
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
  },
  "Woltemade": {
    origin: "Newcastle / passaggio Juventus",
    lastSeason: "Nuovo arrivo del deadline day 2026: Fantacalcio.it lo quota attaccante Juventus, FVM 160.",
    verdict: "Nome grosso ma non da primo slot: seconda opzione rigori dietro Kolo Muani e concorrenza alta.",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026",
    maxBidBoost: 0,
    scoreBoost: 0
  },
  "Goncalves P.": {
    origin: "Sporting CP / passaggio Fiorentina",
    lastSeason: "Nuovo arrivo del deadline day 2026: Fantacalcio.it lo quota centrocampista Fiorentina, FVM 50.",
    verdict: "Listato C molto intrigante per piazzati e tecnica, ma va pagato da scommessa premium finche le gerarchie non si assestano.",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026",
    maxBidBoost: 5,
    scoreBoost: 7
  },
  "Beto": {
    origin: "Everton / passaggio Fiorentina",
    lastSeason: "Ritorno in Serie A nel deadline day 2026: Fantacalcio.it lo quota attaccante Fiorentina, FVM 50.",
    verdict: "Puo prendersi peso dopo l'uscita di Kean, ma il listino suggerisce prudenza: terzo slot, non semitop.",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026",
    maxBidBoost: 4,
    scoreBoost: 5
  },
  "Gnonto": {
    origin: "Leeds / passaggio Fiorentina",
    lastSeason: "Nuovo arrivo del deadline day 2026: Fantacalcio.it lo quota attaccante Fiorentina, FVM 25.",
    verdict: "Profilo elettrico da rotazione offensiva: interessante solo se resta low cost.",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026",
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Braganca": {
    origin: "Sporting CP / passaggio Torino",
    lastSeason: "Nuovo arrivo del deadline day 2026: Fantacalcio.it lo quota centrocampista Torino, FVM 20.",
    verdict: "Buon profilo tecnico ma bonus da verificare: chiamata bassa, utile piu come incastro che come obiettivo.",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026",
    maxBidBoost: 2,
    scoreBoost: 3
  },
  "Belghali": {
    origin: "Verona / passaggio Torino",
    lastSeason: "Nuovo arrivo Torino del deadline day 2026: Fantacalcio.it lo quota difensore, FVM 20.",
    verdict: "Difensore da monitorare per titolarita e spinta: low cost interessante col modificatore, senza rilanci.",
    source: "Fantacalcio.it quotazioni, Lega Serie A e Goal, controllo 02/09/2026",
    maxBidBoost: 2,
    scoreBoost: 3
  },
  "Mbangula": {
    origin: "Werder Brema / passaggio Bologna",
    lastSeason: "Sky segnala 3 gol in 27 presenze al Werder; Fantacalcio.it lo quota centrocampista Bologna, FVM 28.",
    verdict: "Ritorna in Italia da C: scommessa di rotazione con upside, da tenere sotto controllo.",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026",
    maxBidBoost: 2,
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
  [2, "2026-08-31", "Lecce", "Roma", "0-4"],
  [2, "2026-08-31", "Atalanta", "Bologna", "1-0"]
] as const;

export const postponedMatchInsights: MatchInsight[] = [
  {
    day: 2,
    date: "2026-08-31",
    match: "Lecce-Roma",
    score: "0-4",
    status: "Finale",
    notes: [
      "Malen ancora decisivo: doppietta e 5 gol nelle prime 2 giornate.",
      "Bonus anche per Soulè, Mora, Wesley e Mancini: Roma da tenere alta nei target, ma senza rilanci fuori piano."
    ]
  },
  {
    day: 2,
    date: "2026-08-31",
    match: "Atalanta-Bologna",
    score: "1-0",
    status: "Finale",
    notes: [
      "Samardzic segna al 96' su assist Zalewski: entrambi salgono come profili da rotazione bonus.",
      "Skorupski penalizzato dall'errore sul gol: porta Bologna meno attraente nel breve."
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
  },
  {
    name: "Kean",
    role: "A",
    team: "COM",
    update: "Deadline day 01/09: trasferimento dalla Fiorentina al Como recepito nel listone Fantacalcio.it. QA 24, FVM 183; massimale alzato ma non da primo slot.",
    action: "Aggiornato",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Woltemade",
    role: "A",
    team: "JUV",
    update: "Deadline day 01/09: nuovo attaccante Juventus dal Newcastle. Inserito nel listone con QA 23 e FVM 160; seconda opzione rigori dietro Kolo Muani.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "David",
    role: "A",
    team: "ATM",
    update: "Deadline day 01/09: uscita dalla Juventus verso l'Atletico Madrid. Filtrato dal listone attivo Serie A e non acquistabile all'asta.",
    action: "Rimosso",
    source: "Goal, controllo 02/09/2026"
  },
  {
    name: "Gudmundsson A.",
    role: "C",
    team: "LAZ",
    update: "Deadline day 01/09: passaggio Fiorentina-Lazio recepito nelle quotazioni. Rimosso il vecchio boost da rigorista Fiorentina; resta profilo da bonus controllato.",
    action: "Aggiornato",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Rowe",
    role: "C",
    team: "ATA",
    update: "Deadline day 01/09: trasferimento Bologna-Atalanta recepito nel listone. QA 10, FVM 40; scommessa da rotazione bonus.",
    action: "Aggiornato",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Beto",
    role: "A",
    team: "FIO",
    update: "Deadline day 01/09: ritorno in Serie A dall'Everton alla Fiorentina. Inserito in quotazioni con QA 14 e FVM 50.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Goncalves P.",
    role: "C",
    team: "FIO",
    update: "Deadline day 01/09: arrivo alla Fiorentina dallo Sporting. Listato centrocampista, QA 12 e FVM 50; candidato ai piazzati.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Gnonto",
    role: "A",
    team: "FIO",
    update: "Deadline day 01/09: arrivo alla Fiorentina dal Leeds. Listato attaccante, QA 7 e FVM 25; low cost da minuti da verificare.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Nzola",
    role: "A",
    team: "CAG",
    update: "Deadline day 01/09: passaggio Fiorentina-Cagliari. Inserito con QA 4 e FVM 10; sale solo per possibile peso sui rigori.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Mandragora",
    role: "C",
    team: "TOR",
    update: "Deadline day 01/09: passaggio Fiorentina-Torino recepito in quotazioni. QA 8, FVM 23; declassato senza il vecchio contesto viola.",
    action: "Aggiornato",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Mbangula",
    role: "C",
    team: "BOL",
    update: "Deadline day 01/09: arrivo al Bologna dal Werder Brema. QA 8, FVM 28; scommessa di rotazione.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Braganca",
    role: "C",
    team: "TOR",
    update: "Deadline day 01/09: arrivo al Torino dallo Sporting. QA 6, FVM 20; profilo tecnico da monitorare.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026"
  },
  {
    name: "Belghali",
    role: "D",
    team: "TOR",
    update: "Deadline day 01/09: passaggio Verona-Torino. QA 7, FVM 20; difensore low cost interessante se diventa titolare.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Lega Serie A e Goal, controllo 02/09/2026"
  },
  {
    name: "Sanchez Ro.",
    role: "P",
    team: "COM",
    update: "Deadline day 01/09: portiere Como dal Chelsea. QA 8, FVM 25; considerato copertura della porta Como dietro Butez.",
    action: "Inserito",
    source: "Fantacalcio.it quotazioni, Lega Serie A, Sky Sport e Goal, controllo 02/09/2026"
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
  ["Cagliari", "Nzola", "Kevin Carlos", "Mina", "Fazzini", "Maldini", "Romano"],
  ["Como", "Da Cunha", "Kean", "Douvikas", "Paz N.", "Baturina", "Milla"],
  ["Fiorentina", "Beto", "Goncalves P.", "", "Goncalves P.", "Mastantuono", "Atta"],
  ["Frosinone", "Calo", "Schmid", "Grillitsch", "Calo", "Schmid", "Ghedjemis"],
  ["Genoa", "Colombo", "Ostigard", "Vitinha O.", "Baldanzi", "Martin", "Vitinha O."],
  ["Inter", "Calhanoglu", "Zielinski", "Martinez L.", "Calhanoglu", "Dimarco", "Zielinski"],
  ["Juventus", "Kolo Muani", "Woltemade", "Gonzalez N.", "Yildiz", "Locatelli", "Douglas Luiz"],
  ["Lazio", "Zaccagni", "Gudmundsson A.", "Cataldi", "Rovella", "Zaccagni", "Gudmundsson A."],
  ["Lecce", "Geubbels", "Stulic", "Berisha M.", "Pierotti", "Berisha M.", "Gandelman"],
  ["Milan", "Ramos G.", "Pulisic", "Modric", "Modric", "Pulisic", "Saelemaekers"],
  ["Monza", "Cutrone", "Varela G.", "Ngonge", "Ngonge", "Folorunsho", "Pessina"],
  ["Napoli", "De Bruyne", "Hojlund", "Politano", "De Bruyne", "Politano", "Neres"],
  ["Parma", "Pellegrino M.", "Tourè E.", "Valeri", "Bernabè", "Nicolussi Caviglia", "Valeri"],
  ["Roma", "Malen", "Dybala", "Castro S.", "Dybala", "Malen", "Pellegrini Lo."],
  ["Sassuolo", "Berardi", "Pinamonti", "Laurientè", "Berardi", "Laurientè", "Adzic"],
  ["Torino", "Vlasic", "Kulenovic", "Simeone", "Vlasic", "Oristanio", "Gineitis"],
  ["Udinese", "Davis K.", "Solet", "Zaniolo", "Zaniolo", "Ekkelenkamp", "Unai Gomez"],
  ["Venezia", "Busio", "Adams A.", "Adorante", "Busio", "Yeboah J.", "Perez K."]
] as const;

const liveLineupSource = "Fantacalcio.it probabili formazioni giornata 3, aggiornamento 03/09/2026 08:37-08:38";
const typeLineupSource = "Fantacalcio.it/SOS Fanta formazioni tipo post-mercato, controllo 03/09/2026";

export const lineupSignals: Record<string, LineupSignal> = {
  "Bijlow": { startPct: 90, source: liveLineupSource },
  "Marcandalli": { startPct: 90, source: liveLineupSource },
  "Ostigard": { startPct: 90, source: liveLineupSource },
  "Vasquez": { startPct: 90, source: liveLineupSource },
  "Ellertsson": { startPct: 90, source: liveLineupSource },
  "Frendrup": { startPct: 90, source: liveLineupSource },
  "Sow": { startPct: 90, source: liveLineupSource },
  "Mitaj": { startPct: 80, source: liveLineupSource },
  "Baldanzi": { startPct: 90, source: liveLineupSource },
  "Vitinha O.": { startPct: 60, ballotWith: "Osmajic", ballotPct: 40, source: liveLineupSource },
  "Colombo": { startPct: 90, source: liveLineupSource },

  "Butez": { startPct: 90, source: liveLineupSource },
  "Couto": { startPct: 60, ballotWith: "Smolcic I.", ballotPct: 40, source: liveLineupSource },
  "Chalobah T.": { startPct: 80, source: liveLineupSource },
  "Ramon": { startPct: 80, source: liveLineupSource },
  "Valle": { startPct: 60, ballotWith: "Kaiki", ballotPct: 40, source: liveLineupSource },
  "Da Cunha": { startPct: 80, source: liveLineupSource },
  "Perrone": { startPct: 80, note: "Milla in crescita dopo due buone uscite: rotazioni piu alte.", source: liveLineupSource },
  "Diao": { startPct: 85, source: liveLineupSource },
  "Paz N.": { startPct: 90, source: liveLineupSource },
  "Baturina": { startPct: 80, ballotWith: "Milla", ballotPct: 40, source: liveLineupSource },
  "Kean": { startPct: 55, ballotWith: "Douvikas", ballotPct: 45, note: "Alternanza probabile col greco dopo il mercato.", source: liveLineupSource },
  "Douvikas": { startPct: 45, ballotWith: "Kean", ballotPct: 55, note: "SOS Fanta lo tiene alto per valore stagionale, ma il ballottaggio con Kean sara continuo.", source: "Fantacalcio.it probabili formazioni + SOS Fanta, 03/09/2026" },
  "Milla": { startPct: 40, ballotWith: "Baturina", ballotPct: 60, note: "Candidato concreto a guadagnare minuti.", source: typeLineupSource },
  "Rodriguez Je.": { startPct: 35, note: "Rotazione offensiva Como, non titolare fisso.", source: typeLineupSource },

  "De Gea": { startPct: 90, source: liveLineupSource },
  "Jimenez A.": { startPct: 55, ballotWith: "Joao Mario", ballotPct: 45, source: liveLineupSource },
  "Joao Mario": { startPct: 45, ballotWith: "Jimenez A.", ballotPct: 55, source: liveLineupSource },
  "Dragusin": { startPct: 90, source: liveLineupSource },
  "Viery": { startPct: 55, ballotWith: "Ranieri L.", ballotPct: 45, source: liveLineupSource },
  "Ranieri L.": { startPct: 45, ballotWith: "Viery", ballotPct: 55, source: liveLineupSource },
  "Valdepenas": { startPct: 80, source: liveLineupSource },
  "Ndour": { startPct: 85, source: liveLineupSource },
  "Oulai": { startPct: 70, note: "Puo agire da mezzala o regista: Fagioli resta minaccia.", source: liveLineupSource },
  "Atta": { startPct: 90, source: liveLineupSource },
  "Mastantuono": { startPct: 90, source: liveLineupSource },
  "Njie": { startPct: 60, ballotWith: "Gnonto", ballotPct: 40, source: liveLineupSource },
  "Gnonto": { startPct: 40, ballotWith: "Njie", ballotPct: 60, source: liveLineupSource },
  "Goncalves P.": { startPct: 55, ballotWith: "Njie", ballotPct: 45, note: "SOS Fanta lo vede candidato forte a sinistra: valore piu stagionale che da singola giornata.", source: "Fantacalcio.it probabili formazioni + SOS Fanta, 03/09/2026" },
  "Pellegrino M.": { startPct: 80, ballotWith: "Beto", ballotPct: 40, source: liveLineupSource },
  "Beto": { startPct: 40, ballotWith: "Pellegrino M.", ballotPct: 60, note: "Nuovo arrivo: volume possibile, ma gerarchia iniziale non ancora blindata.", source: "Fantacalcio.it/SOS Fanta, 03/09/2026" },
  "Fagioli": { startPct: 40, ballotWith: "Oulai", ballotPct: 60, source: typeLineupSource },

  "Perri": { startPct: 80, source: liveLineupSource },
  "Comuzzo": { startPct: 90, source: liveLineupSource },
  "Coco": { startPct: 90, source: liveLineupSource },
  "Comert": { startPct: 90, source: liveLineupSource },
  "Belghali": { startPct: 80, source: liveLineupSource },
  "Gineitis": { startPct: 55, ballotWith: "Mandragora", ballotPct: 45, source: liveLineupSource },
  "Mandragora": { startPct: 45, ballotWith: "Gineitis", ballotPct: 55, note: "Panchina live al 60% ma ballottaggio ufficiale lo mette dietro Gineitis.", source: liveLineupSource },
  "Fitz-Jim": { startPct: 85, source: liveLineupSource },
  "Cacciamani": { startPct: 60, ballotWith: "Fortini", ballotPct: 40, source: liveLineupSource },
  "Fortini": { startPct: 40, ballotWith: "Cacciamani", ballotPct: 60, source: liveLineupSource },
  "Adams C.": { startPct: 60, ballotWith: "Oristanio", ballotPct: 40, source: liveLineupSource },
  "Oristanio": { startPct: 40, ballotWith: "Adams C.", ballotPct: 60, source: liveLineupSource },
  "Vlasic": { startPct: 90, source: liveLineupSource },
  "Simeone": { startPct: 90, source: liveLineupSource },
  "Braganca": { startPct: 40, ballotWith: "Casadei", ballotPct: 60, source: typeLineupSource },
  "Kulenovic": { startPct: 35, source: liveLineupSource },

  "Martinez Jo.": { startPct: 90, source: liveLineupSource },
  "Bisseck": { startPct: 80, ballotWith: "Stones", ballotPct: 55, source: liveLineupSource },
  "Stones": { startPct: 55, ballotWith: "Bisseck", ballotPct: 45, source: liveLineupSource },
  "Akanji": { startPct: 90, source: liveLineupSource },
  "Bastoni": { startPct: 90, source: liveLineupSource },
  "Diouf": { startPct: 85, source: liveLineupSource },
  "Barella": { startPct: 90, source: liveLineupSource },
  "Calhanoglu": { startPct: 90, source: liveLineupSource },
  "Zielinski": { startPct: 60, ballotWith: "Jones C.", ballotPct: 40, source: liveLineupSource },
  "Jones C.": { startPct: 40, ballotWith: "Zielinski", ballotPct: 60, source: liveLineupSource },
  "Dimarco": { startPct: 90, source: liveLineupSource },
  "Martinez L.": { startPct: 90, source: liveLineupSource },
  "Esposito F.P.": { startPct: 55, ballotWith: "Thuram", ballotPct: 45, source: liveLineupSource },
  "Thuram": { startPct: 45, ballotWith: "Esposito F.P.", ballotPct: 55, note: "Per la singola giornata parte in ballottaggio; resta fascia alta stagionale.", source: liveLineupSource },
  "Sucic P.": { startPct: 40, source: liveLineupSource },

  "Meret": { startPct: 90, source: liveLineupSource },
  "Di Lorenzo": { startPct: 90, source: liveLineupSource },
  "Rrahmani": { startPct: 90, source: liveLineupSource },
  "Marin R.": { startPct: 60, ballotWith: "Beukema", ballotPct: 40, source: liveLineupSource },
  "Beukema": { startPct: 40, ballotWith: "Marin R.", ballotPct: 60, note: "Ultime Fantacalcio.it: pronto per Inter, ma non ancora favorito netto.", source: "Fantacalcio.it ultime notizie + probabili, 03/09/2026" },
  "Spinazzola": { startPct: 60, ballotWith: "Olivera", ballotPct: 40, source: liveLineupSource },
  "Olivera": { startPct: 40, ballotWith: "Spinazzola", ballotPct: 60, source: liveLineupSource },
  "Zambo Anguissa": { startPct: 90, source: liveLineupSource },
  "Lobotka": { startPct: 90, source: liveLineupSource },
  "De Bruyne": { startPct: 80, note: "Titolare alto, ma va gestito su eta/minuti e rotazioni.", source: liveLineupSource },
  "Politano": { startPct: 80, source: liveLineupSource },
  "Hojlund": { startPct: 90, source: liveLineupSource },
  "Santos A.": { startPct: 80, source: liveLineupSource },
  "Neres": { startPct: 50, ballotWith: "Politano", ballotPct: 50, source: liveLineupSource },
  "Lang": { startPct: 45, ballotWith: "Santos A.", ballotPct: 55, source: liveLineupSource },
  "Lucca": { startPct: 35, source: liveLineupSource },

  "Svilar": { startPct: 90, source: liveLineupSource },
  "Mancini": { startPct: 90, source: liveLineupSource },
  "Ghilardi": { startPct: 80, source: liveLineupSource },
  "Hermoso": { startPct: 90, source: liveLineupSource },
  "Molina N.": { startPct: 55, ballotWith: "Lulli", ballotPct: 45, source: liveLineupSource },
  "Konè M.": { startPct: 90, source: liveLineupSource },
  "Cristante": { startPct: 90, source: liveLineupSource },
  "Wesley": { startPct: 90, source: liveLineupSource },
  "Dybala": { startPct: 90, source: liveLineupSource },
  "Mora": { startPct: 60, ballotWith: "Soulè", ballotPct: 40, source: liveLineupSource },
  "Soulè": { startPct: 40, ballotWith: "Mora", ballotPct: 60, source: liveLineupSource },
  "Castro S.": { startPct: 45, ballotWith: "Dybala", ballotPct: 55, source: typeLineupSource },
  "Malen": { startPct: 90, source: liveLineupSource },
  "De Roon": { startPct: 45, source: liveLineupSource },

  "Carnesecchi": { startPct: 90, source: liveLineupSource },
  "Bellanova": { startPct: 60, ballotWith: "Zappacosta", ballotPct: 40, source: liveLineupSource },
  "Zappacosta": { startPct: 40, ballotWith: "Bellanova", ballotPct: 60, source: liveLineupSource },
  "Kossounou": { startPct: 90, source: liveLineupSource },
  "Scalvini": { startPct: 90, source: liveLineupSource },
  "Bernasconi": { startPct: 85, source: liveLineupSource },
  "Samardzic": { startPct: 55, ballotWith: "Pasalic", ballotPct: 45, source: liveLineupSource },
  "Pasalic": { startPct: 45, ballotWith: "Samardzic", ballotPct: 55, source: liveLineupSource },
  "Gaetano": { startPct: 90, source: liveLineupSource },
  "Ederson D.S.": { startPct: 90, source: liveLineupSource },
  "De Ketelaere": { startPct: 90, source: liveLineupSource },
  "Scamacca": { startPct: 60, ballotWith: "Krstovic", ballotPct: 40, source: liveLineupSource },
  "Krstovic": { startPct: 40, ballotWith: "Scamacca", ballotPct: 60, source: liveLineupSource },
  "Rowe": { startPct: 70, source: liveLineupSource },
  "Kessiè": { startPct: 45, ballotWith: "Gaetano/Samardzic", ballotPct: 55, source: typeLineupSource },
  "Raspadori": { startPct: 40, note: "SOS Fanta: gestione cambiata dal mercato, profilo di rotazione.", source: "SOS Fanta, 03/09/2026" },

  "Maignan": { startPct: 90, source: typeLineupSource },
  "Gila": { startPct: 90, source: liveLineupSource },
  "Gabbia": { startPct: 40, ballotWith: "De Winter", ballotPct: 60, source: liveLineupSource },
  "De Winter": { startPct: 60, ballotWith: "Gabbia", ballotPct: 40, source: liveLineupSource },
  "Pavlovic": { startPct: 90, source: liveLineupSource },
  "Moreira": { startPct: 60, source: liveLineupSource },
  "Modric": { startPct: 90, source: liveLineupSource },
  "Musah": { startPct: 90, source: liveLineupSource },
  "Loftus-Cheek": { startPct: 60, note: "Prima alternativa forte a centrocampo, non da considerare titolare fisso.", source: liveLineupSource },
  "Bartesaghi": { startPct: 85, source: liveLineupSource },
  "Chukwueze": { startPct: 85, source: liveLineupSource },
  "Rabiot": { startPct: 85, source: liveLineupSource },
  "Pulisic": { startPct: 50, note: "Non piu blindato nell'XI immediato, resta alto valore stagionale se arriva a sconto.", source: liveLineupSource },
  "Saelemaekers": { startPct: 40, ballotWith: "Cissè A.", ballotPct: 60, source: liveLineupSource },
  "Cissè A.": { startPct: 60, ballotWith: "Saelemaekers", ballotPct: 40, source: liveLineupSource },
  "Ramos G.": { startPct: 90, source: typeLineupSource },
  "Tomori": { startPct: 25, note: "Ultime Fantacalcio.it: torna convocabile con la Juventus, non ancora titolare.", source: "Fantacalcio.it ultime notizie, 03/09/2026" },
  "Hutchinson": { startPct: 40, note: "Rotazione dalla panchina: prendere solo come scommessa low cost.", source: liveLineupSource },
  "Nkunku": { startPct: 30, note: "Non ancora dentro l'XI live: profilo da aspettare a prezzo di saldo.", source: liveLineupSource },
  "Camarda": { startPct: 30, note: "Subentrante/under da ultimi slot, non titolare nel breve.", source: liveLineupSource },

  "Vicario": { startPct: 90, note: "Titolare Juventus: il vice corretto per coprire la porta e Grabara.", source: typeLineupSource },
  "Grabara": { startPct: 10, note: "Vice Vicario: da prendere solo se vuoi completare il pacchetto portieri Juventus.", source: "Fantacalcio.it, 22-26/08/2026" },
  "Kalulu": { startPct: 90, source: liveLineupSource },
  "Bremer": { startPct: 90, source: liveLineupSource },
  "Lucumì": { startPct: 60, ballotWith: "Kelly L.", ballotPct: 40, source: liveLineupSource },
  "Kelly L.": { startPct: 40, ballotWith: "Lucumì", ballotPct: 60, source: liveLineupSource },
  "Celik": { startPct: 80, source: liveLineupSource },
  "Cambiaso": { startPct: 40, note: "In dubbio per fastidio alla caviglia: evitare rilanci da titolare certo.", source: liveLineupSource },
  "Locatelli": { startPct: 90, source: liveLineupSource },
  "Douglas Luiz": { startPct: 80, source: liveLineupSource },
  "Sarr P.": { startPct: 70, note: "Ultime da Spalletti: ruolo da aiutare, titolarita non ancora granitica.", source: "SOS Fanta/Fantacalcio.it, 03/09/2026" },
  "Conceicao": { startPct: 90, source: liveLineupSource },
  "McKennie": { startPct: 45, ballotWith: "Koopmeiners", ballotPct: 55, source: typeLineupSource },
  "Gonzalez N.": { startPct: 90, note: "Ultime Fantacalcio.it: chance dal primo minuto confermata dalle probabili live.", source: liveLineupSource },
  "Boga": { startPct: 60, ballotWith: "Alajbegovic", ballotPct: 40, source: liveLineupSource },
  "Alajbegovic": { startPct: 40, ballotWith: "Boga", ballotPct: 60, source: liveLineupSource },
  "Kolo Muani": { startPct: 90, note: "SOS Fanta segnala concorrenza stagionale con Woltemade, ma live e XI immediato lo tengono avanti.", source: "Fantacalcio.it probabili formazioni + SOS Fanta, 03/09/2026" },
  "Woltemade": { startPct: 45, ballotWith: "Kolo Muani", ballotPct: 55, note: "Rotazione stagionale con Kolo Muani: prezzo da terzo slot, non da titolare blindato.", source: "Fantacalcio.it + SOS Fanta, 03/09/2026" },
  "Yildiz": { startPct: 0, note: "Out lungo, va trattato come stash a forte sconto.", source: "Fantacalcio.it indisponibili, 03/09/2026" },

  "Orsolini": { startPct: 0, note: "Out: Bernardeschi in pole per sostituirlo.", source: "Fantacalcio.it ultime notizie, 03/09/2026" },
  "Bernardeschi": { startPct: 70, note: "In pole per sostituire Orsolini: sale come low/mid cost da piazzati.", source: "Fantacalcio.it ultime notizie, 03/09/2026" },

  "Zaccagni": { startPct: 90, source: liveLineupSource },
  "Pinamonti": { startPct: 90, source: liveLineupSource },
  "Isaksen": { startPct: 60, ballotWith: "Cancellieri", ballotPct: 40, note: "SOS Fanta: Gudmundsson aumenta la concorrenza, ma in sconto resta jolly.", source: "Fantacalcio.it + SOS Fanta, 03/09/2026" },
  "Cancellieri": { startPct: 40, ballotWith: "Isaksen", ballotPct: 60, source: liveLineupSource },
  "Gudmundsson A.": { startPct: 40, ballotWith: "Pinamonti/Isaksen", ballotPct: 60, note: "Qualita alta ma incastro tattico ancora da trovare.", source: "SOS Fanta, 03/09/2026" },
  "Frattesi": { startPct: 90, source: liveLineupSource },
  "Taylor K.": { startPct: 90, source: liveLineupSource },
  "Mandas": { startPct: 90, source: liveLineupSource },
  "Tavares N.": { startPct: 85, source: liveLineupSource },
  "Doekhi": { startPct: 80, source: liveLineupSource },
  "Provstgaard": { startPct: 90, source: liveLineupSource },
  "Rovella": { startPct: 0, note: "Lesione al polpaccio: rientro prima meta ottobre.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Cataldi": { startPct: 0, note: "Recuperabile da meta settembre.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Marusic": { startPct: 0, note: "Lesione muscolare alla coscia, rientro inizio ottobre.", source: "Fantacalcio.it indisponibili, 03/09/2026" },

  "Davis K.": { startPct: 90, source: liveLineupSource },
  "Solet": { startPct: 90, source: liveLineupSource },
  "Zaniolo": { startPct: 0, note: "Lesione al bicipite femorale: tentativo rientro dalla seconda meta di settembre.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Ekkelenkamp": { startPct: 90, source: liveLineupSource },
  "Unai Gomez": { startPct: 90, source: liveLineupSource },

  "Caprile": { startPct: 90, source: typeLineupSource },
  "Mina": { startPct: 50, note: "Affaticamento al polpaccio: da valutare contro il Lecce.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Fazzini": { startPct: 80, source: typeLineupSource },
  "Maldini": { startPct: 75, source: typeLineupSource },
  "Kevin Carlos": { startPct: 55, ballotWith: "Nzola", ballotPct: 45, source: typeLineupSource },
  "Nzola": { startPct: 45, ballotWith: "Kevin Carlos", ballotPct: 55, source: typeLineupSource },
  "Sugawara": { startPct: 45, ballotWith: "Zè Pedro", ballotPct: 55, source: typeLineupSource },

  "Geubbels": { startPct: 0, note: "Distorsione alla caviglia: out a Cagliari.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Pierotti": { startPct: 85, source: typeLineupSource },
  "Berisha M.": { startPct: 70, source: typeLineupSource },
  "Falcone": { startPct: 90, source: typeLineupSource },
  "Tiago Gabriel": { startPct: 80, source: typeLineupSource },
  "Monteiro J.": { startPct: 75, source: typeLineupSource },

  "Skorupski": { startPct: 90, source: liveLineupSource },
  "Zortea": { startPct: 80, source: liveLineupSource },
  "Heggem": { startPct: 80, source: liveLineupSource },
  "Theate": { startPct: 85, source: liveLineupSource },
  "Miranda J.": { startPct: 85, source: liveLineupSource },
  "Odgaard": { startPct: 75, source: liveLineupSource },
  "Ferguson": { startPct: 80, source: liveLineupSource },
  "Pobega": { startPct: 60, source: liveLineupSource },
  "Mbangula": { startPct: 55, ballotWith: "Cambiaghi", ballotPct: 45, note: "Nuovo arrivo: concorrenza viva sulla trequarti.", source: typeLineupSource },
  "Cambiaghi": { startPct: 85, source: liveLineupSource },
  "Dovbyk": { startPct: 70, ballotWith: "Piccoli", ballotPct: 30, source: typeLineupSource },
  "Piccoli": { startPct: 30, ballotWith: "Dovbyk", ballotPct: 70, source: typeLineupSource },

  "Muric": { startPct: 90, source: liveLineupSource },
  "Van Der Brempt": { startPct: 85, source: liveLineupSource },
  "Idzes": { startPct: 85, source: liveLineupSource },
  "Leysen F.": { startPct: 75, source: liveLineupSource },
  "Doig": { startPct: 75, source: liveLineupSource },
  "Matic": { startPct: 80, source: liveLineupSource },
  "Bakola": { startPct: 80, source: liveLineupSource },
  "Thorstvedt": { startPct: 65, note: "Valore da bonus alto, ma nella singola probabile resta in concorrenza.", source: typeLineupSource },
  "Volpato": { startPct: 55, note: "Alternativa offensiva: utile solo se il prezzo resta sotto controllo.", source: typeLineupSource },
  "Konè I.": { startPct: 0, note: "Rottura tibia/perone: Fantacalcio.it indica rientro da dicembre.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Berardi": { startPct: 90, source: typeLineupSource },
  "Laurientè": { startPct: 80, source: typeLineupSource },
  "Adzic": { startPct: 70, source: liveLineupSource },
  "Esposito Se.": { startPct: 75, source: typeLineupSource },
  "Bowie": { startPct: 60, source: liveLineupSource },

  "Suzuki": { startPct: 90, source: liveLineupSource },
  "Diego Carlos": { startPct: 85, source: liveLineupSource },
  "Delprato": { startPct: 85, source: liveLineupSource },
  "Valeri": { startPct: 85, source: liveLineupSource },
  "Bernabè": { startPct: 85, source: liveLineupSource },
  "Tourè E.": { startPct: 70, ballotWith: "Romero D.", ballotPct: 55, source: liveLineupSource },
  "Romero D.": { startPct: 55, ballotWith: "Lontani/Tourè E.", ballotPct: 45, source: liveLineupSource },

  "Tornqvist": { startPct: 90, source: liveLineupSource },
  "Mangas": { startPct: 90, source: liveLineupSource },
  "Birindelli": { startPct: 90, source: liveLineupSource },
  "Carboni A.": { startPct: 85, source: liveLineupSource },
  "Lucchesi": { startPct: 85, source: liveLineupSource },
  "Ziolkowski": { startPct: 60, ballotWith: "Kouadio", ballotPct: 40, source: liveLineupSource },
  "Kouadio": { startPct: 40, ballotWith: "Ziolkowski", ballotPct: 60, source: liveLineupSource },
  "Akinsanmiro": { startPct: 80, source: liveLineupSource },
  "Folorunsho": { startPct: 85, source: liveLineupSource },
  "Colpani": { startPct: 80, source: liveLineupSource },
  "Ngonge": { startPct: 60, ballotWith: "Mout", ballotPct: 40, source: liveLineupSource },
  "Mout": { startPct: 40, ballotWith: "Ngonge", ballotPct: 60, source: liveLineupSource },
  "Cutrone": { startPct: 90, source: liveLineupSource },
  "Varela G.": { startPct: 0, note: "Problema all'adduttore: out contro Parma.", source: "Fantacalcio.it indisponibili, 03/09/2026" },

  "Palmisani": { startPct: 90, source: liveLineupSource },
  "Bracaglia": { startPct: 85, source: liveLineupSource },
  "Monterisi": { startPct: 85, source: liveLineupSource },
  "Calvani": { startPct: 85, source: liveLineupSource },
  "Calò": { startPct: 90, source: liveLineupSource },
  "Schmid": { startPct: 50, note: "In dubbio: fastidio muscolare al flessore della coscia.", source: liveLineupSource },
  "Bobcek": { startPct: 75, source: liveLineupSource },
  "Raimondo": { startPct: 60, ballotWith: "Kvernadze", ballotPct: 40, source: liveLineupSource },
  "Kvernadze": { startPct: 40, ballotWith: "Raimondo", ballotPct: 60, source: liveLineupSource },
  "Ghedjemis": { startPct: 55, source: liveLineupSource },

  "Stankovic F.": { startPct: 90, source: liveLineupSource },
  "Correia T.": { startPct: 85, source: liveLineupSource },
  "Bella-Kotchap": { startPct: 85, source: liveLineupSource },
  "Hainaut": { startPct: 75, source: liveLineupSource },
  "Basic": { startPct: 80, source: liveLineupSource },
  "Busio": { startPct: 85, source: liveLineupSource },
  "Perez K.": { startPct: 80, source: liveLineupSource },
  "Adams A.": { startPct: 85, source: liveLineupSource },
  "Yeboah J.": { startPct: 75, source: liveLineupSource },

  "Okoye": { startPct: 90, source: liveLineupSource },
  "Vojvoda": { startPct: 90, source: liveLineupSource },
  "Kabasele": { startPct: 80, source: liveLineupSource },
  "Abankwah": { startPct: 80, source: liveLineupSource },
  "Kamara H.": { startPct: 90, source: liveLineupSource },
  "Piotrowski": { startPct: 85, source: liveLineupSource },
  "Karlstrom": { startPct: 90, source: liveLineupSource },
  "Miller L.": { startPct: 60, source: liveLineupSource },
  "Gueye": { startPct: 45, note: "Alternativa offensiva a Davis, non titolare nel breve.", source: liveLineupSource },

  "Floriani Mussolini": { startPct: 90, source: liveLineupSource },
  "Belahyane": { startPct: 85, source: liveLineupSource },
  "Romagnoli": { startPct: 15, note: "Rientro graduale dalla panchina nella probabile live.", source: liveLineupSource },
  "Noslin": { startPct: 40, note: "Parte dietro, anche con chance da subentrante: evitare prezzo da titolare.", source: typeLineupSource },
  "Ratkov": { startPct: 35, note: "Alternativa a Pinamonti/Dia: ultimi slot.", source: typeLineupSource },
  "Dia": { startPct: 35, note: "Rotazione offensiva Lazio, non titolare live.", source: typeLineupSource },

  "N'Dicka": { startPct: 0, note: "Fastidio all'adduttore nel riscaldamento di Lecce: a rischio contro Atalanta.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "N&#x27;Dicka": { startPct: 0, note: "Fastidio all'adduttore nel riscaldamento di Lecce: a rischio contro Atalanta.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Sanchez Ro.": { startPct: 5, note: "Secondo portiere Como dietro Butez: utile solo in coppia.", source: typeLineupSource },
  "Dodò": { startPct: 40, note: "Dietro Jimenez/Joao Mario nella probabile live: non pagare da titolare fisso.", source: liveLineupSource },
  "Kristensen T.": { startPct: 0, note: "Problema alla caviglia: da valutare contro Roma.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Casadei": { startPct: 0, note: "Affaticamento muscolare: convocazione a rischio per Firenze.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Thuram K.": { startPct: 0, note: "Operato per infortunio al retto femorale: rientro atteso da gennaio.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Elmas": { startPct: 35, note: "Rotazione Atalanta dietro i trequartisti: solo a prezzo basso.", source: typeLineupSource },
  "Romano": { startPct: 65, note: "Mezzala Cagliari da titolarita probabile ma bonus contenuti.", source: typeLineupSource },
  "Liberali": { startPct: 25, note: "Talento Como da rotazione, non titolare nelle gerarchie immediate.", source: typeLineupSource },
  "Osmajic": { startPct: 40, ballotWith: "Vitinha O.", ballotPct: 60, source: liveLineupSource },
  "Spence": { startPct: 35, note: "Alternativa Inter sulla fascia, sotto Carlos Augusto nelle rotazioni immediate.", source: liveLineupSource },
  "Carlos Augusto": { startPct: 50, note: "Prima alternativa a sinistra/destra, utile ma non titolare live.", source: liveLineupSource },
  "Gutierrez": { startPct: 20, note: "Dietro Spinazzola/Olivera nel breve: investimento solo a sconto.", source: typeLineupSource },
  "Vergara": { startPct: 60, note: "Rotazione Napoli dalla panchina, non titolare live.", source: liveLineupSource },
  "McTominay": { startPct: 0, note: "Out fino a inizio ottobre dopo ablazione: non strapagare il vecchio hype.", source: "Fantacalcio.it indisponibili, 03/09/2026" },
  "Lukaku": { startPct: 0, note: "Non dentro la rotazione immediata Napoli: profilo da non trattare come titolare.", source: typeLineupSource },
  "Pellegrini Lo.": { startPct: 35, note: "Rotazione Roma, non nell'XI live.", source: typeLineupSource }
};

const attackingMidfielderSource = "Goal.com centrocampisti in attacco, 02/09/2026";
const advancedDefenderSource = "Goal.com difensori a centrocampo, 02/09/2026";
const listoneBugSource = "Calcio d'Angolo bug listone, 06/08/2026";

export const roleBugSignals: Record<string, RoleBugSignal> = {
  "Zalewski": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "jolly da tridente",
    reason: "Listato centrocampista, ma indicato come opzione offensiva nel 4-3-3.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Rowe": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno d'attacco",
    reason: "Listato C, ma segnalato come esterno del tridente: profilo da bonus aggiunto.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 4,
    scoreBoost: 8
  },
  "Orsolini": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala titolare",
    reason: "Rimane C nel listone, ma in campo e un esterno offensivo stabile.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Mbangula": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala/rotazione tridente",
    reason: "Listato C, ma impiegabile nel tridente: scommessa da bonus a prezzo basso.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Cambiaghi": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno d'attacco",
    reason: "Passato a centrocampo nel listone, ma indicato nel tridente.",
    source: attackingMidfielderSource,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Bernardeschi": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala/mezzala offensiva",
    reason: "Listato C, ma resta una freccia offensiva e puo giocare piu alto.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Odgaard": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "mezzala offensiva/trequarti",
    reason: "Posizione ibrida: mezzala ma con utilizzi piu alti nel corso della stagione.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Fazzini": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "sottopunta",
    reason: "Centrocampista che puo giocare vicino alla porta, a ridosso della punta.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Paz N.": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "trequartista/falso 9",
    reason: "Listato C, ma usato molto offensivo e anche da falso nove.",
    source: attackingMidfielderSource,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Rodriguez Je.": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno super offensivo",
    reason: "Listato centrocampista, ma agisce largo e alto nell'attacco del Como.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Addai": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno offensivo",
    reason: "Listato C, ma descritto come uno degli attaccanti esterni del Como.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Atta": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno/sottopunta",
    reason: "Puo giocare esterno d'attacco o sottopunta: C con upside da area.",
    source: attackingMidfielderSource,
    maxBidBoost: 4,
    scoreBoost: 7
  },
  "Goncalves P.": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "titolare nel tridente",
    reason: "Listato C, ma segnalato come nuovo titolare a sinistra nel tridente.",
    source: attackingMidfielderSource,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Mastantuono": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala destra",
    reason: "Centrocampista nel listone, ma titolare a destra in attacco.",
    source: attackingMidfielderSource,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Zerbin": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno d'attacco",
    reason: "Low cost listato C, utilizzabile da esterno nel 4-3-3.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Schmid": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno/mezzala",
    reason: "Candidato low cost da esterno del 4-3-3, con possibile uso anche da mezzala.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Fini": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno d'attacco",
    reason: "Listato C, ma impiegabile da esterno offensivo nel 4-3-3.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Baldanzi": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "trequartista",
    reason: "Alternativa nei due dietro la punta: profilo C da posizione avanzata.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Alajbegovic": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno/trequartista",
    reason: "Listato C, ma puo agire da esterno d'attacco o trequartista.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Conceicao": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno d'attacco",
    reason: "Nel 4-2-3-1 e sulla linea alta: C con compiti da ala.",
    source: attackingMidfielderSource,
    maxBidBoost: 4,
    scoreBoost: 7
  },
  "Zaccagni": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala titolare",
    reason: "Esterno titolare del tridente pur restando centrocampista nel listone.",
    source: attackingMidfielderSource,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Gudmundsson A.": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "jolly offensivo",
    reason: "Listato C, ma destinato ad avere spazio alto tra tridente e trequarti.",
    source: attackingMidfielderSource,
    maxBidBoost: 4,
    scoreBoost: 7
  },
  "Isaksen": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala",
    reason: "Segnalato tra gli esterni del 4-3-3: centrocampista solo nel listone.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Cancellieri": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala di rotazione",
    reason: "Alternativa low cost da corsia offensiva, listata centrocampista.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Pierotti": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "jolly da tridente",
    reason: "Listato C, ma puo giocare nel tridente del Lecce.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Monteiro J.": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno d'attacco",
    reason: "Nuovo profilo C che puo agire da esterno offensivo.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Pulisic": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "sottopunta/ala",
    reason: "Rimasto centrocampista, ma sulla carta gioca a supporto della punta.",
    source: `${attackingMidfielderSource}; ${listoneBugSource}`,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Cissè A.": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno alto",
    reason: "Nome da corsia offensiva nel nuovo Milan, ma listato a centrocampo.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Moreira": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "esterno alto",
    reason: "Preso come profilo da sostituzione sulla fascia offensiva, ma e C nel listone.",
    source: attackingMidfielderSource,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Saelemaekers": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "sottopunta/esterno",
    reason: "Listato C, ma all'occorrenza puo agire da sottopunta.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Loftus-Cheek": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "sottopunta/mezzala alta",
    reason: "Segnalato tra i C che possono alzarsi sulla trequarti.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Colpani": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "trequartista",
    reason: "Listato C, ma si gioca il posto nei due dietro la punta.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Ciurria": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "trequartista/esterno",
    reason: "C da posizione alta nei due dietro la punta: bonus possibile a prezzo minimo.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Politano": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala nel tridente",
    reason: "Torna nel tridente pur essendo listato centrocampista.",
    source: attackingMidfielderSource,
    maxBidBoost: 4,
    scoreBoost: 7
  },
  "Vergara": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala di rotazione",
    reason: "Listato C, ma puo essere impiegato sulla linea offensiva.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Mora": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "trequartista",
    reason: "Listato centrocampista, ma gioca sulla stessa linea dei rifinitori dietro la punta.",
    source: attackingMidfielderSource,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Pisilli": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "mezzala d'inserimento",
    reason: "Puo giocare vicino alla porta per sfruttare gli inserimenti.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Pellegrini Lo.": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "trequarti/inserimenti",
    reason: "Profilo C che puo occupare zone molto vicine alla porta.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Volpato": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala di rotazione",
    reason: "Alternativa nel tridente del Sassuolo pur essendo listato C.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Bakola": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "ala di rotazione",
    reason: "Listato C, ma alternativa offensiva nel tridente.",
    source: attackingMidfielderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Oristanio": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "seconda punta/trequarti",
    reason: "Puo giocare vicino alla punta, a volte come supporto diretto.",
    source: attackingMidfielderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Vlasic": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "seconda punta/trequarti",
    reason: "Listato C, ma utilizzabile molto vicino alla punta.",
    source: attackingMidfielderSource,
    maxBidBoost: 4,
    scoreBoost: 7
  },
  "Zaniolo": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "attaccante aggiunto",
    reason: "Rimane centrocampista, ma viene descritto come giocatore di fatto offensivo.",
    source: attackingMidfielderSource,
    maxBidBoost: 5,
    scoreBoost: 9
  },
  "Ekkelenkamp": {
    kind: "C-attacco",
    label: "BUG ATT",
    roleOnPitch: "trequartista vicino alla punta",
    reason: "Puo occupare la zona offensiva a ridosso del centravanti.",
    source: attackingMidfielderSource,
    maxBidBoost: 4,
    scoreBoost: 7
  },
  "Obert": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Difensore che puo avanzare sulla corsia di centrocampo nella difesa a tre.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Sugawara": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto destro",
    reason: "Difensore da corsia che puo agire alto in caso di difesa a tre.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Jimenez A.": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno/ala",
    reason: "Listato D, ma puo essere impiegato anche da esterno d'attacco.",
    source: advancedDefenderSource,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Dimarco": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Difensore nel listone, ma laterale con liberta di spingere e volume assist.",
    source: `${advancedDefenderSource}; ${listoneBugSource}`,
    maxBidBoost: 5,
    scoreBoost: 8
  },
  "Spence": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto destro",
    reason: "Profilo da corsia avanzata, indicato come potenziale top se prende minuti.",
    source: advancedDefenderSource,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Carlos Augusto": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Alternativa a Dimarco sulla fascia: D con mansioni da centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Cambiaso": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto/esterno",
    reason: "In difesa a tre puo essere esterno di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Celik": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto/esterno",
    reason: "Difensore che puo salire sulla linea dei centrocampisti.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Bartesaghi": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Nel 3-4-2-1 puo giocarsi la fascia sinistra da esterno di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Estupinan": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "D da corsia nel 3-4-2-1, con possibilita di assist.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Birindelli": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno di centrocampo",
    reason: "Listato D, ma base titolare da esterno nel sistema a tre.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Mangas": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno di centrocampo",
    reason: "Listato D, ma indicato tra gli esterni titolari di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Carboni A.": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Alternativa sulla fascia sinistra: D con possibile utilizzo alto.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Bakoune": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto destro",
    reason: "Alternativa sulla fascia destra in un assetto con esterni alti.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Delprato": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto/braccetto",
    reason: "Nel Parma puo agire da esterno di centrocampo o braccetto.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Valeri": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Titolare a sinistra tra i difensori che giocano sulla linea di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Britschgi": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto/braccetto",
    reason: "Intercambiabile sulla fascia destra: D con possibile posizione avanzata.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Wesley": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto offensivo",
    reason: "Listato D, ma largo e alto nel 3-4-2-1: profilo da assist e bonus.",
    source: `${advancedDefenderSource}; ${listoneBugSource}`,
    maxBidBoost: 5,
    scoreBoost: 8
  },
  "Molina N.": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto destro",
    reason: "Nuovo titolare sulla fascia destra di centrocampo nella Roma.",
    source: advancedDefenderSource,
    maxBidBoost: 4,
    scoreBoost: 7
  },
  "Lulli": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto di rotazione",
    reason: "Giovane lanciato da Gasperini sulle corsie: D da monitorare per spinta.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Rensch": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto di rotazione",
    reason: "Alternativa sulla fascia destra, anche se scesa nelle gerarchie dopo Molina.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Belghali": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno destro",
    reason: "Listato D, ma indicato titolare a destra sulla linea di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Fortini": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno su entrambe le fasce",
    reason: "Opzione per entrambe le corsie: D con possibile minutaggio alto sugli esterni.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Biraghi": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno sinistro",
    reason: "Alternativa a sinistra in ruolo da esterno di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Vojvoda": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto destro",
    reason: "Nasce terzino ma viene segnalato da quinto nel 3-5-2.",
    source: `${advancedDefenderSource}; ${listoneBugSource}`,
    maxBidBoost: 3,
    scoreBoost: 6
  },
  "Zanoli": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto destro",
    reason: "Contende la fascia destra di centrocampo a Vojvoda.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 4
  },
  "Kamara H.": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Titolare a sinistra sulla linea di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  },
  "Correia T.": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno jolly",
    reason: "Impiegabile su entrambe le fasce: D da corsia avanzata.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Hainaut": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno destro",
    reason: "Alternativa sulla fascia destra di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Mazzocchi": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "esterno destro",
    reason: "Difensore listato che puo alternarsi sulla corsia di centrocampo.",
    source: advancedDefenderSource,
    maxBidBoost: 1,
    scoreBoost: 3
  },
  "Haps": {
    kind: "D-centrocampo",
    label: "BUG EST",
    roleOnPitch: "quinto sinistro",
    reason: "Indicato come intoccabile a sinistra e uomo fanta per la difesa.",
    source: advancedDefenderSource,
    maxBidBoost: 2,
    scoreBoost: 5
  }
};

const manualNotes: Record<string, { note: string; maxBid: number; tier: string; profile?: string }> = {
  "Malen": { note: "Top assoluto; 5 gol nelle prime 2 giornate 2026/27, Roma a trazione bonus. Budget alto ma con disciplina.", maxBid: 150, tier: "Fascia 1" },
  "Martinez L.": { note: "Primo slot stabile: 17 gol e 6 assist nel 2025/26, alta affidabilita Inter.", maxBid: 132, tier: "Fascia 1" },
  "Thuram": { note: "Primo slot basso/secondo slot deluxe: 13 gol e 6 assist 2025/26.", maxBid: 100, tier: "Fascia 1" },
  "Ramos G.": { note: "Obiettivo Milan, primo rigorista indicato: prendere senza pagare tassa rossonera.", maxBid: 100, tier: "Fascia 1" },
  "Hojlund": { note: "Attaccante Napoli con doppia cifra realistica; 12 gol e 5 assist 2025/26.", maxBid: 100, tier: "Fascia 1" },
  "Douvikas": { note: "Assimilato nel Como di Fabregas, doppia cifra alla portata.", maxBid: 68, tier: "Fascia 2" },
  "Kolo Muani": { note: "Titolare Juve e primo rigorista; prezzo giusto, non inseguire hype.", maxBid: 76, tier: "Fascia 2" },
  "Kean": { note: "Deadline day: passa al Como. Seconda opzione rigori dietro Da Cunha, contesto offensivo forte ma concorrenza con Douvikas/Paz: semitop controllato.", maxBid: 76, tier: "Fascia 2" },
  "Woltemade": { note: "Deadline day: nuovo attaccante Juventus. Seconda opzione rigori, FVM alto, ma resta dietro Kolo Muani nelle priorita: non pagare da primo slot.", maxBid: 54, tier: "Fascia 3" },
  "Yildiz": { note: "Talento e piazzati Juve: 10 gol e 6 assist 2025/26.", maxBid: 60, tier: "Fascia 2" },
  "Scamacca": { note: "Rigorista Atalanta; upside alto, controllare prezzo e tenuta fisica.", maxBid: 48, tier: "Fascia 3" },
  "Samardzic": { note: "Gol decisivo al 96' e piazzati Atalanta: jolly da bonus, non ancora da pagare come titolare fisso.", maxBid: 24, tier: "Fascia 3" },
  "Zalewski": { note: "Assist da subentrato nel posticipo: low cost interessante se resta dentro le rotazioni di Sarri.", maxBid: 8, tier: "Low cost" },
  "Dybala": { note: "Piazzati Roma, classe enorme ma rischio minutaggio: solo a sconto.", maxBid: 40, tier: "Fascia 3" },
  "Soulè": { note: "Gol nel 4-0 di Lecce e buona centralita Roma: sale, ma attenzione al listino da attaccante.", maxBid: 24, tier: "Fascia 3" },
  "Mora": { note: "Secondo bonus di fila e primo gol giallorosso: talento caldo da prendere solo se il prezzo resta razionale.", maxBid: 34, tier: "Fascia 3" },
  "Wesley": { note: "Assist e voto alto nel 4-0: difensore da bonus/strappo, profilo molto utile col modificatore.", maxBid: 18, tier: "Fascia 3" },
  "Dovbyk": { note: "Bologna, prima punta fisica ma posticipi senza squillo e 2025/26 Roma non esplosivo: prendere solo a prezzo da terzo slot.", maxBid: 34, tier: "Fascia 3" },
  "Rowe": { note: "Deadline day: passa all'Atalanta. Listato C con upside, ma rotazioni alte: scommessa di fascia 3 entro prezzo razionale.", maxBid: 20, tier: "Fascia 3" },
  "Beto": { note: "Deadline day: Fiorentina dopo l'uscita di Kean. Puo avere volume, ma FVM basso e concorrenza nuova: terzo slot aggressivo solo a sconto.", maxBid: 30, tier: "Fascia 3" },
  "Gnonto": { note: "Deadline day: Fiorentina. Listato attaccante, profilo da strappi e minutaggio da verificare: low cost, non slot strutturale.", maxBid: 12, tier: "Low cost" },
  "Goncalves P.": { note: "Deadline day: Fiorentina. Listato C e candidato ai piazzati: scommessa premium interessante, ma aspetta indicazioni sulle gerarchie.", maxBid: 30, tier: "Fascia 3" },
  "Gudmundsson A.": { note: "Deadline day: passa alla Lazio. Listato C, puo diventare fonte bonus dietro Zaccagni: profilo interessante ma senza vecchio boost da rigorista Fiorentina.", maxBid: 28, tier: "Fascia 3" },
  "Mandragora": { note: "Deadline day: passa al Torino. Perde centralita e vecchio peso sui rigori Fiorentina: da prendere solo come rotazione low cost.", maxBid: 10, tier: "Low cost" },
  "Nzola": { note: "Deadline day: Cagliari, indicato da Fantacalcio.it come prima opzione rigori. FVM basso, ma i rigori lo rendono una scommessa da ultimi slot.", maxBid: 18, tier: "Low cost" },
  "Mbangula": { note: "Deadline day: Bologna dal Werder. Listato C, upside da esterno ma concorrenza viva: scommessa sotto i 12-14.", maxBid: 14, tier: "Low cost" },
  "Braganca": { note: "Deadline day: Torino dallo Sporting. Tecnico, ma bonus e titolarita da verificare: chiamata bassa.", maxBid: 10, tier: "Low cost" },
  "Belghali": { note: "Deadline day: Torino dal Verona. Difensore con FVM interessante per low cost: monitorare titolarita.", maxBid: 8, tier: "Low cost" },
  "Sugawara": { note: "Deadline day: Cagliari dal Southampton. Terzino da profilo ordinato, utile solo a prezzo basso.", maxBid: 7, tier: "Low cost" },
  "Sanchez Ro.": { note: "Deadline day: Como dal Chelsea. Secondo portiere quotato dietro Butez: utile solo come copertura della porta Como.", maxBid: 8, tier: "Low cost", profile: "Secondo portiere" },
  "Dimarco": { note: "Difensore top da bonus: 7 gol e 17 assist 2025/26, perfetto col modificatore.", maxBid: 55, tier: "Fascia 1" },
  "Calhanoglu": { note: "Rigorista Inter: 9 gol, 4 assist e 4/5 rigori nel 2025/26.", maxBid: 80, tier: "Fascia 1" },
  "Paz N.": { note: "12 gol e 5 assist 2025/26; talento Como da pagare ma senza asta folle.", maxBid: 78, tier: "Fascia 1" },
  "McTominay": { note: "10 gol 2025/26, peso fisico e titolarita Napoli.", maxBid: 70, tier: "Fascia 1" },
  "Orsolini": { note: "Rigorista e piazzati Bologna: 10 gol nel 2025/26.", maxBid: 64, tier: "Fascia 1" },
  "Kessiè": { note: "Atalanta, ritorno da profilo pesante: non e piu il vecchio rigorista Milan, ma resta centrocampista da inserimenti.", maxBid: 42, tier: "Fascia 2" },
  "Pulisic": { note: "Milan, alternativa rigori: 8 gol e 4 assist 2025/26. Target se resta sotto i top.", maxBid: 54, tier: "Fascia 2" },
  "Chukwueze": { note: "Titolare Milan al momento: 2 presenze a voto, 1 assist e FM 7,25 nel 2026/27. Scommessa viva, ma da prendere solo se resta low cost.", maxBid: 18, tier: "Low cost", profile: "Titolare low cost" },
  "Rabiot": { note: "Titolare Milan da voto e inserimenti, utile ma non da strapagare.", maxBid: 38, tier: "Fascia 2" },
  "Barella": { note: "Voti e assist: 9 assist 2025/26, meno gol di un top puro.", maxBid: 34, tier: "Fascia 2" },
  "De Bruyne": { note: "Rigorista e piazzati Napoli, avvio gia da bonus: top tecnico, ma gestire rischio eta/minuti.", maxBid: 62, tier: "Fascia 1" },
  "Modric": { note: "Regia e piazzati Milan, ma bonus strutturalmente bassi: utile da voto, non da asta emotiva.", maxBid: 24, tier: "Fascia 3" },
  "Svilar": { note: "Portiere super top per clean sheet e rendimento Roma.", maxBid: 52, tier: "Fascia 1" },
  "Maignan": { note: "Porta Milan: utile col modificatore, ma non superare il prezzo top.", maxBid: 42, tier: "Fascia 1" },
  "Martinez Jo.": { note: "Porta Inter, investimento da primo slot se gerarchie confermate.", maxBid: 46, tier: "Fascia 1" },
  "Carnesecchi": { note: "Portiere da modificatore, Atalanta solida.", maxBid: 40, tier: "Fascia 1" },
  "Butez": { note: "Como forte per clean sheet; valutare coppia con Fiorentina/Udinese.", maxBid: 42, tier: "Fascia 1" },
  "Vicario": { note: "Titolare Juve indicato da Fantacalcio.it/SOS Fanta; se prendi la porta Juventus la copertura corretta e Grabara, non Di Gregorio.", maxBid: 42, tier: "Fascia 1" },
  "Grabara": { note: "Vice Vicario: copertura tecnica della porta Juventus, utile solo in coppia col titolare.", maxBid: 2, tier: "Low cost", profile: "Secondo portiere" }
};

const roleMultiplier: Record<Role, number> = { P: 0.65, D: 0.22, C: 0.31, A: 0.34 };
const roleCaps: Record<Role, number> = { P: 55, D: 58, C: 86, A: 150 };

const quotazioni = quotazioniRaw as RawPlayer[];
const transferredOutPlayers = new Set([
  "Djimsiti|ATA",
  "Ahanor|ATA",
  "Dallinga|BOL",
  "Albarracin|CAG",
  "Prati|CAG",
  "Zappa|CAG",
  "Kuhn|COM",
  "Gelli J.|FRO",
  "Oyono J.|FRO",
  "Corrado|FRO",
  "Vogliacco|GEN",
  "Norton-Cuffy|GEN",
  "Di Gregorio|JUV",
  "Perin|JUV",
  "David|JUV",
  "Dia|LAZ",
  "Ratkov|LAZ",
  "Fruchtl|LEC",
  "Nkunku|MIL",
  "Leao|MIL",
  "Gimenez|MIL",
  "Fofana Y.|MIL",
  "Petagna|MON",
  "Pizzignacco|MON",
  "Delli Carri|MON",
  "Gutierrez|NAP",
  "Lukaku|NAP",
  "Ondrejka|PAR",
  "Angelino|ROM",
  "Vaz|ROM",
  "El Aynaoui|ROM",
  "Moro L.|SAS",
  "Macchioni|SAS",
  "Pedersen|TOR",
  "Camara A.|UDI",
  "Buksa|UDI",
  "Mlacic|UDI",
  "Bjarkason|VEN",
]);
const activeQuotazioni = quotazioni.filter((player) => !transferredOutPlayers.has(`${player.name}|${player.team}`));
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

function lineupFor(q: RawPlayer): LineupSignal | undefined {
  return lineupSignals[q.name];
}

function roleBugFor(q: RawPlayer): RoleBugSignal | undefined {
  const signal = roleBugSignals[q.name];
  if (!signal) return undefined;
  if (q.role === "C" && signal.kind === "C-attacco") return signal;
  if (q.role === "D" && signal.kind === "D-centrocampo") return signal;
  return undefined;
}

function lineupProfile(lineup: LineupSignal | undefined, role: Role, fallback: () => string): string {
  if (!lineup || lineup.startPct === undefined) return fallback();
  if (role === "P" && lineup.startPct < 10) return "Secondo portiere";
  if (lineup.startPct <= 5) return "Riserva";
  if (lineup.startPct === 0) return "Riserva";
  if (lineup.startPct < 55) return lineup.ballotWith ? `Ballottaggio con ${lineup.ballotWith}` : "Riserva";
  if (lineup.startPct < 75) return lineup.ballotWith ? `Ballottaggio con ${lineup.ballotWith}` : "Titolare low cost";
  return "Titolare";
}

function lineupNoteFor(q: RawPlayer): string {
  const lineup = lineupFor(q);
  if (!lineup) return "";
  const pctText = lineup.startPct !== undefined ? `Titolarita ${lineup.startPct}%` : "Titolarita da monitorare";
  const ballotText = lineup.ballotWith
    ? `, ballottaggio con ${lineup.ballotWith}${lineup.ballotPct !== undefined ? ` ${lineup.ballotPct}%` : ""}`
    : "";
  const extra = lineup.note ? ` ${lineup.note}` : "";
  return `${pctText}${ballotText}.${extra} Fonte: ${lineup.source}.`;
}

function roleBugNoteFor(q: RawPlayer): string {
  const roleBug = roleBugFor(q);
  if (!roleBug) return "";
  return `Bug listone: ${roleBug.reason} Ruolo reale: ${roleBug.roleOnPitch}. Fonte: ${roleBug.source}.`;
}

function statLabel(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatSeasonStats(role: Role, season: string, stats: RawStats): string {
  const base = `${season}: ${num(stats.pv)} PV, FM ${num(stats.fm) || "-"}`;
  if (role === "P") {
    return `${base}, ${statLabel(num(stats.gs), "gol subito", "gol subiti")}, ${statLabel(num(stats.rp), "rigore parato", "rigori parati")}`;
  }
  return `${base}, ${num(stats.gol)} gol, ${num(stats.ass)} assist`;
}

function seasonFormNote(q: RawPlayer): string {
  const s26 = stats26.get(q.name);
  const s25 = stats25.get(q.name);
  const bits: string[] = [`QA ${q.cqa}, FVM ${q.fvm}`];
  if (s26 && num(s26.pv) > 0) {
    bits.push(formatSeasonStats(q.role, "2026/27", s26));
    if (s25 && num(s25.pv) > 0) bits.push(formatSeasonStats(q.role, "2025/26", s25));
  } else if (s25 && num(s25.pv) > 0) {
    bits.push(formatSeasonStats(q.role, "2025/26", s25));
  } else {
    bits.push("storico Serie A recente limitato");
  }
  return bits.join("; ") + ".";
}

function scorePlayer(q: RawPlayer): number {
  const s25 = stats25.get(q.name);
  const s26 = stats26.get(q.name);
  const injury = injurySignals[q.name];
  const scouting = externalScoutingSignals[q.name];
  const roleBug = roleBugFor(q);
  let score = q.fvm / 7;
  score += num(s25?.gol) * (q.role === "C" || q.role === "A" ? 4 : 2);
  score += num(s25?.ass) * (q.role === "D" || q.role === "C" ? 3 : 2);
  score += Math.max(0, num(s25?.mv) - 6) * 14;
  score += num(s26?.gol) * 6 + num(s26?.ass) * 3;
  if (penaltyRank(q.name) === 1) score += 18;
  if (setPieceRank(q.name)) score += 8;
  if (q.team === "MIL") score += 2;
  score += scouting?.scoreBoost ?? 0;
  score += roleBug?.scoreBoost ?? 0;
  score -= injury?.scorePenalty ?? 0;
  return Math.max(0, Math.round(score * 10) / 10);
}

function calculatedMaxBid(q: RawPlayer): number {
  const manual = manualNotes[q.name];
  const injury = injurySignals[q.name];
  const scouting = externalScoutingSignals[q.name];
  const roleBug = roleBugFor(q);
  let value: number;
  if (manual) {
    const marketFloor = q.role === "A" && manual.tier === "Fascia 1" ? auctionRules.firstBandAttackMin : 0;
    value = Math.max(marketFloor, manual.maxBid);
    value += roleBug?.maxBidBoost ?? 0;
    return Math.max(1, Math.min(roleCaps[q.role], value - (injury?.maxBidDiscount ?? 0)));
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
  value += roleBug?.maxBidBoost ?? 0;
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
  const lineup = lineupFor(q);
  const manual = manualNotes[q.name];
  if (manual?.profile && !lineup) return manual.profile;

  const teammates = activeQuotazioni
    .filter((player) => player.team === q.team && player.role === q.role)
    .sort((a, b) => b.fvm - a.fvm || b.cqi - a.cqi);
  const rank = teammates.findIndex((player) => player.name === q.name);

  return lineupProfile(lineup, q.role, () => {
    if (manual?.profile) return manual.profile;

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
  });
}

function noteFor(q: RawPlayer): string {
  const injury = injurySignals[q.name];
  const scouting = externalScoutingSignals[q.name];
  const lineupNote = lineupNoteFor(q);
  const roleBugNote = roleBugNoteFor(q);
  const seasonNote = seasonFormNote(q);
  const injuryNote = injury
    ? `Infortunio ${injury.impact.toLowerCase()}: ${injury.concern} Recupero: ${injury.recovery}. Fonte: ${injury.source}.`
    : "";
  const scoutingNote = scouting
    ? `Scouting estero: ${scouting.lastSeason} ${scouting.verdict} Fonte: ${scouting.source}.`
    : "";
  const manual = manualNotes[q.name];
  if (manual) return [manual.note, seasonNote, lineupNote, roleBugNote, scoutingNote, injuryNote].filter(Boolean).join(" ");
  const editorialAvoid = editorialAvoidSignals[q.name];
  if (editorialAvoid) return [editorialAvoid.reason, `Fonte: ${editorialAvoid.source}.`, seasonNote, lineupNote, roleBugNote, scoutingNote, injuryNote].filter(Boolean).join(" ");
  const s25 = stats25.get(q.name);
  const bits: string[] = [];
  if (penaltyRank(q.name) === 1) bits.push("primo rigorista");
  if (setPieceRank(q.name)) bits.push("piazzati");
  if (num(s25?.gol) >= 8) bits.push(`${num(s25?.gol)} gol 2025/26`);
  if (num(s25?.ass) >= 5) bits.push(`${num(s25?.ass)} assist 2025/26`);
  if (q.team === "MIL") bits.push("Milan: ok solo entro massimale");
  if (scoutingNote) bits.push(scoutingNote);
  if (injuryNote) bits.push(injuryNote);
  const tacticalNote = bits.length ? `${bits.join("; ")}.` : "Profilo da valutare a prezzo, senza rilanci emotivi.";
  return [seasonNote, lineupNote, roleBugNote, tacticalNote].filter(Boolean).join(" ");
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
    scouting: externalScoutingSignals[q.name],
    lineup: lineupFor(q),
    roleBug: roleBugFor(q)
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
  const roleBugWatch = allPlayers.filter((player) => player.role === role && Boolean(player.roleBug));
  const manualWatch = allPlayers.filter((player) => player.role === role && Boolean(manualNotes[player.name]));
  return Array.from(new Map([...targets, ...editorialAvoids, ...injuryWatch, ...scoutingWatch, ...roleBugWatch, ...manualWatch].map((player) => [player.name, player])).values());
}) as Player[];

export function starsText(stars: number): string {
  return "*".repeat(stars);
}

export function numberFromStat(value?: string): number {
  return num(value);
}

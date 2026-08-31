import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  ExternalLink,
  Goal,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  Trophy,
  Upload,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  allPlayers,
  AuctionPick,
  auctionRules,
  budgetPlan,
  defaultStatusFor,
  goalkeeperPairs,
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

type View = "cockpit" | "listone" | "rosa" | "portieri" | "rigoristi" | "risultati" | "fonti";
type SortDirection = "asc" | "desc";
type SortKey = "priority" | "role" | "name" | "team" | "profile" | "stars" | "maxBid" | "paid" | "status" | "goals" | "assists" | "fm" | "fvm";
type SortState = { key: SortKey; direction: SortDirection };

const storageKey = "fantacalcio-asta-2026-27-state";
const views: View[] = ["cockpit", "listone", "rosa", "portieri", "rigoristi", "risultati", "fonti"];
const statuses: Status[] = ["Da chiamare", "Monitor", "Comprato", "Perso", "Evita", "Consigliato"];
const roleOrder: Role[] = ["P", "D", "C", "A"];
const profileOptions = ["Tutti", "Titolare", "Titolare low cost", "Ballottaggio", "Secondo portiere", "Terzo portiere", "Riserva"];
const recommendationBlockedStatuses = new Set<Status>(["Comprato", "Perso", "Evita", "Consigliato"]);

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

function isOverpaid(player: Player, pick?: AuctionPick) {
  return pick?.paid !== undefined && pick.paid > player.maxBid;
}

function formatMoney(value: number) {
  return value.toLocaleString("it-IT", { maximumFractionDigits: 0 });
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
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "Tutti">("Tutti");
  const [profile, setProfile] = useState("Tutti");
  const [onlyTargets, setOnlyTargets] = useState(true);
  const [onlyPenalty, setOnlyPenalty] = useState(false);
  const [onlyMilan, setOnlyMilan] = useState(false);
  const [sortState, setSortState] = useState<SortState>({ key: "priority", direction: "desc" });
  const [selectedGoalkeeper, setSelectedGoalkeeper] = useState<Player | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(auction));
  }, [auction]);

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
      .filter((player) => profile === "Tutti" || (profile === "Ballottaggio" ? player.profile.startsWith("Ballottaggio con") : player.profile === profile))
      .filter((player) => !onlyPenalty || player.penaltyRank === 1)
      .filter((player) => !onlyMilan || player.team === "MIL")
      .filter((player) => {
        if (!text) return true;
        return [player.name, player.team, player.role, player.note, player.profile, player.injury?.concern, player.injury?.recovery].some((value) =>
          String(value).toLowerCase().includes(text)
        );
      })
      .sort((a, b) => {
        return comparePlayers(a, b, sortState, auction);
      });
  }, [auction, basePlayers, onlyMilan, onlyPenalty, profile, query, role, sortState]);

  const bought = useMemo(() => {
    return allPlayers
      .filter((player) => auction[pickKey(player)]?.status === "Comprato")
      .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) || a.name.localeCompare(b.name));
  }, [auction]);

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

  function updatePick(player: Player, patch: Partial<AuctionPick>) {
    const key = pickKey(player);
    const current = auction[key];
    if (patch.status === "Comprato" && current?.status !== "Comprato") {
      const paid = patch.paid ?? current?.paid ?? player.openBid;
      const allowed = smartMaxBid(player);
      if (paid > allowed) {
        window.alert(`${player.name} non e sostenibile a ${formatMoney(paid)} crediti: il piano lascia al massimo ${formatMoney(allowed)} per questo acquisto, proteggendo i reparti successivi.`);
        return;
      }
    }
    setAuction((previousAuction) => {
      const nextAuction: Record<string, AuctionPick> = {
        ...previousAuction,
        [key]: {
          ...(previousAuction[key] ?? { status: defaultStatusFor(player) }),
          ...patch
        }
      };

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
  }

  function quickBuy(player: Player) {
    const key = pickKey(player);
    const current = auction[key];
    updatePick(player, {
      status: current?.status === "Comprato" ? "Da chiamare" : "Comprato",
      paid: current?.paid ?? player.openBid
    });
  }

  function exportCsv() {
    const header = ["Ruolo", "Calciatore", "Squadra", "Profilo", "Stars", "Max", "Pagato", "Status", "Owner", "Infortunio", "Recupero", "Note"];
    const rows = selectedPlayers.map((player) => {
      const pick = auction[pickKey(player)];
      return [
        player.role,
        player.name,
        player.team,
        player.profile,
        starsText(player.stars),
        player.maxBid,
        pick?.paid ?? "",
        pick?.status ?? defaultStatusFor(player),
        pick?.owner ?? "",
        player.injury ? player.injury.impact : "",
        player.injury?.recovery ?? "",
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
      JSON.stringify({ exportedAt: new Date().toISOString(), auction }, null, 2),
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
        const nextAuction = parsed.auction ?? parsed;
        if (!nextAuction || typeof nextAuction !== "object" || Array.isArray(nextAuction)) {
          throw new Error("Invalid auction state");
        }
        setAuction(nextAuction as Record<string, AuctionPick>);
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
    if (window.confirm("Vuoi azzerare acquisti, prezzi e note live?")) {
      setAuction({});
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
            ["rosa", Users, "Rosa"],
            ["portieri", Shield, "Portieri"],
            ["rigoristi", Goal, "Rigoristi"],
            ["risultati", Star, "Risultati"],
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
            <section className="kpi-grid" aria-label="Budget">
              <MetricCard label="Speso" value={totalSpent} detail={`${formatMoney(remaining)} crediti residui`} tone="blue" />
              <MetricCard label="Rosa" value={bought.length} detail="25 slot obiettivo" tone="green" />
              <MetricCard label="Alert prezzo" value={bought.filter((p) => isOverpaid(p, auction[pickKey(p)])).length} detail="acquisti sopra massimale" tone="amber" />
              <MetricCard label="Target visibili" value={filteredPlayers.length} detail={onlyTargets ? "lista corta" : "listone completo"} tone="red" />
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
              <button className={onlyMilan ? "toggle on milan" : "toggle"} onClick={() => setOnlyMilan((v) => !v)}>
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
              sortState={sortState}
              setSortState={setSortState}
              selectedGoalkeeper={selectedGoalkeeper}
              onSelectGoalkeeper={setSelectedGoalkeeper}
              smartMaxBid={smartMaxBid}
            />
          </>
        ) : null}

        {view === "rosa" ? <RosterView bought={bought} auction={auction} roleStats={roleStats} /> : null}
        {view === "portieri" ? <GoalkeeperView /> : null}
        {view === "rigoristi" ? <TakersView /> : null}
        {view === "risultati" ? <ResultsView /> : null}
        {view === "fonti" ? <SourcesView /> : null}
      </main>
    </div>
  );
}

function viewLabel(view: View) {
  return {
    cockpit: "Cockpit",
    listone: "Listone completo",
    rosa: "Rosa acquistata",
    portieri: "Portieri e griglie",
    rigoristi: "Rigoristi e piazzati",
    risultati: "Risultati prime giornate",
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
    goals: [numberFromStat(a.stats25?.gol), numberFromStat(b.stats25?.gol)],
    assists: [numberFromStat(a.stats25?.ass), numberFromStat(b.stats25?.ass)],
    fm: [numberFromStat(a.stats25?.fm), numberFromStat(b.stats25?.fm)],
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

function PlayerTable({
  players,
  auction,
  updatePick,
  quickBuy,
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
            const smartOver = pick.status !== "Comprato" && pick.paid !== undefined && pick.paid > liveMax;
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
                <td data-label="Stats" className="stats-cell">
                  <span>G {numberFromStat(player.stats25?.gol)} / A {numberFromStat(player.stats25?.ass)}</span>
                  <span>FM {numberFromStat(player.stats25?.fm).toFixed(2)}</span>
                </td>
                <td data-label="Info utili">
                  {player.injury ? (
                    <div className="injury-note">
                      {player.injury.concern} Recupero: {player.injury.recovery}.
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
        <p className="footnote">Aggiornato al 31/08/2026: i posticipi risultano 0-0 dalle fonti consultate; voti ufficiali e tabellini completi da consolidare appena pubblicati.</p>
      </section>
    </>
  );
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

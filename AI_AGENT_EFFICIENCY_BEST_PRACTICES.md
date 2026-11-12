# Best practice per agenti AI: qualità alta, consumo efficiente
Versione 1.0 · 12 novembre 2026 · Documento comune riutilizzabile in qualsiasi repository.

> **Scopo:** ridurre token, tempo, riesecuzioni e output superflui **senza ridurre qualità, sicurezza, copertura dei test o tracciabilità**. Questa guida non sostituisce le istruzioni specifiche del progetto (`AGENTS.md`, convenzioni, policy, CI o requisiti del committente). In caso di conflitto prevalgono i requisiti del progetto e le istruzioni più autorevoli.

## 1. Regole fondamentali
1. **Leggi il minimo contesto sufficiente, non il minimo assoluto.** Prima file di istruzioni, richiesta, stato corrente, diff e file coinvolti; amplia la lettura solo se un dubbio concreto lo richiede.
2. **Niente analisi ripetitive.** Cerca report, audit, ADR, issue, PR e test già prodotti. Un report è riutilizzabile solo dopo aver verificato commit, configurazione, ambiente e differenze successive.
3. **Distingui fatti, ipotesi e decisioni.** Indica sempre che cosa è verificato, che cosa è stimato e che cosa rimane aperto.
4. **Lavora per un obiettivo chiuso.** Definisci deliverable e criteri di completamento prima di iniziare. Non espandere automaticamente a refactor, nuove feature, audit generali o materiale diagnostico non richiesto.
5. **Non confondere contesto con quote.** Compattazione e sessioni corte possono evitare letture ripetute, ma non rimborsano token già spesi né aggirano i limiti del piano.
6. **Non sacrificare qualità.** Sicurezza, correttezza, test pertinenti, dati utente, accessibilità, retrocompatibilità e verifiche obbligatorie restano prioritari.
7. **Non dichiarare eseguito ciò che non è stato verificato.** Indica esiti reali e limiti; la CI verde non certifica automaticamente qualità UX, grafica o funzionale.
8. **Non sovrascrivere lavoro altrui.** Rispetta branch, modifiche locali, file esistenti; chiedi autorizzazione per merge, deploy, cancellazioni e operazioni potenzialmente irreversibili quando non sono incluse nel mandato.

## 2. Avvio efficiente di una sessione
1. Leggi l'`AGENTS.md` esistente (e le istruzioni più specifiche nelle directory interessate).
2. Recupera l'obiettivo esplicito e il suo criterio di accettazione; usa il ticket o la PR come fonte primaria.
3. Identifica branch, HEAD, stato Git e differenza rispetto alla base. Non partire da un audit dell'intero repository.
4. Cerca un handoff/stato operativo già esistente: `docs/agent/CURRENT_STATE.md`, `NEXT_TASK.md`, report di riferimento o equivalenti. **Non creare duplicati se il progetto li possiede già.**
5. Elenca in poche righe: già fatto; ancora da fare; file interessati; rischi e test necessari.
6. Leggi i file rilevanti e, per dipendenze, soltanto i loro consumatori/produttori necessari. Usa ricerca mirata per nomi/simboli e output brevi.

**Filtro anti-spreco:** prima di qualsiasi operazione costosa, rispondi a «quale decisione cambierà grazie a questa operazione?». Se nessuna, non farla.

## 3. Strategia di implementazione
- Prediligi una patch piccola e coesa per volta; conserva invarianti e contratti.
- Verifica le assunzioni più rischiose con un esperimento minimo, **prima** di generare decine di varianti.
- Evita di riscrivere componenti funzionanti solo perché lo stato non è stato letto.
- Per bug: riproduzione minima, causa, correzione, test di regressione. Per feature: contratto, implementazione, test e compatibilità. Per asset/UI: benchmark visivo a parità di input oltre ai test tecnici.
- Se un esperimento fallisce, registra l'esito con una sintesi e passa alla causa; non ripetere la stessa prova senza variazione di ipotesi.
- Conserva una sola fonte per ogni decisione: link ai documenti, non incollare interi report in altri report.

## 4. Test proporzionati al rischio
| Ambito della modifica | Prima verifica | Quando ampliare |
| --- | --- | --- |
| Solo documentazione | coerenza, link, Markdown e riferimenti | build/CI se richieste da policy |
| Configurazione o dipendenze | validatori + test toccati | suite estesa e controlli di sicurezza |
| Unità isolata | unit test pertinenti e regressione | integrazione se tocca contratti condivisi |
| API, dati, auth, salvataggi | unit + integrazione + compatibilità | suite completa, migrazioni e controlli di sicurezza |
| UI o grafica | test mirati + confronto visuale con input identico | browser, responsive, accessibilità, export |
| Renderer, pipeline o architettura | unit + integrazione + regressioni mirate | worker/fallback, benchmark e suite completa |
| PR pronta per merge/release | verifiche richieste dal progetto e CI al commit finale | nessuna esclusione non motivata |

Un test precedente è prova valida **per il commit e lo scenario che ha eseguito**. Non riusare esiti vecchi se la modifica tocca il comportamento coperto. Evita di rilanciare una suite completa più volte sullo **stesso SHA** senza motivazione; assicurati comunque che la CI richiesta giri sul commit finale.

## 5. Log, screenshot e benchmark
- Leggi inizialmente sintesi, errori e sezioni pertinenti; espandi soltanto quando serve. Non riversare migliaia di righe nel contesto.
- Non incorporare immagini, binari, grandi JSON o log grezzi nei prompt. Mantieni percorso, SHA, manifest e report sintetico.
- Un benchmark deve avere domanda precisa, baseline, ambiente, misure e soglie di accettazione. Non rieseguirlo per modifiche solo editoriali.
- Evita matrici visive enormi quando un pilota rappresentativo può discriminare le alternative; amplia la matrice per regressione e rilascio quando giustificato.
- Conserva prove riproducibili. Non abbassare test o aggiornare golden per mascherare errori. Distingui fallimenti preesistenti e regressioni nuove.

## 6. Gestione del contesto fra sessioni
Nei repository complessi usa pochi file **brevi e autorevoli**, se non esistono equivalenti:
- `AGENTS.md`: regole durevoli e indice, non cronologia.
- `docs/agent/CURRENT_STATE.md`: branch/commit verificato, funzionalità completate, blocchi e decisioni aperte.
- `docs/agent/DECISIONS.md`: decisioni con motivi, data, link e condizioni per rivederle.
- `docs/agent/VERIFICATION_LEDGER.md`: test/audit/benchmark, SHA, ambiente, risultati, riutilizzabilità e invalidazione.
- `docs/agent/NEXT_TASK.md`: **un** obiettivo, input, file, deliverable, criteri di accettazione e confini.

Aggiorna solo le sezioni che cambiano. Nel passaggio di consegne includi **riferimenti**, non il contenuto completo di tutti i file. In una nuova sessione leggi prima lo stato, poi i documenti solo su richiesta o per necessità. Usa compact/resume se supportati e appropriati; non affidarti esclusivamente al contesto conversazionale per informazioni durevoli.

### Handoff consigliato (massimo circa 20 righe)
```md
# Stato operativo
- Repository / branch / HEAD:
- Task e criteri di completamento:
- Già verificato (con link a PR, report o SHA):
- Modifiche effettuate:
- Test effettuati (ambito, esito, SHA):
- Rischi / problemi ancora aperti:
- Prossima azione ESATTA:
- Non rifare / fuori ambito:
```

## 7. Come formulare incarichi efficienti
Un buon incarico specifica **scopo, punto di partenza, vincoli, risultati e stop**:
```text
Obiettivo: [una cosa verificabile].
Base: [repository/branch/commit e documenti già affidabili].
Riutilizza: [report, test, decisioni esistenti].
Intervieni soltanto su: [aree/file].
Non rifare: [audit, benchmark, test o lavoro già valido].
Verifica: [test minimi e condizioni per ampliarli].
Consegna: [artefatti concreti, link, stato].
Fermati quando: [criterio di completamento].
Non fare: [merge, deploy, refactor o altre azioni non autorizzate].
```
Evita prompt che chiedono contemporaneamente «audit completo + implementazione totale + ogni benchmark + ogni immagine» se i risultati sono separabili.

## 8. Regola di stop e qualità della consegna
Prima di chiudere:
1. Ricontrolla i requisiti espliciti e verifica che il risultato li soddisfi.
2. Indica modifiche, prove realmente eseguite, problemi noti e link/commit.
3. Aggiorna il solo handoff necessario e la decisione interessata, non cinque diari.
4. **Fermati.** Niente attività «già che ci siamo» senza nuovo mandato.

## 9. Come misurare l'efficienza senza farsi ingannare
Rileva quando disponibili: token/crediti per task *completato e approvato*, durata, numero di sessioni, numero di audit ripetuti, esecuzioni CI duplicate, regressioni, rilavorazioni, tempi di review e qualità di accettazione. Un risparmio di token che aumenta bug o lavoro di revisione è un peggioramento. Misura prima/dopo su compiti comparabili e annota i cambi di modello e strumenti.

## 10. Adozione in un altro repository
Copia **questo singolo file** nella radice. Se il repository ha un `AGENTS.md`, aggiungi un rimando breve senza cancellare istruzioni precedenti; se non lo ha, creane uno minimo solo se l'agente lo utilizza. Non creare automaticamente cartelle `docs/agent/` nei repository piccoli. Applica il protocollo da subito, ma rispetta sempre test, sicurezza e modalità di lavoro specifici del progetto.

### Esempio di rimando facoltativo in AGENTS.md
```md
Per ridurre lavoro duplicato e consumo di contesto senza ridurre la qualità,
segui [AI_AGENT_EFFICIENCY_BEST_PRACTICES.md](AI_AGENT_EFFICIENCY_BEST_PRACTICES.md).
Le istruzioni del progetto prevalgono in caso di conflitto.
```

**Nota:** i file Markdown non applicano automaticamente una policy. Perché Codex la segua sistematicamente, il progetto deve richiamare questa guida dalle istruzioni che effettivamente carica, oppure il mandato deve citarla.

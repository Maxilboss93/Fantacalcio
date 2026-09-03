# Asta Fantacalcio 2026/27

Cockpit live per gestire l'asta:

- ricerca istantanea nel listone;
- ordinamento cliccabile sulle colonne principali;
- layout mobile con righe trasformate in schede operative;
- filtri per ruolo, profilo operativo, rigorista e Milan;
- massimale, offerta apertura e alert sovrapprezzo;
- tracker budget e slot per reparto;
- stato giocatore: Da chiamare, Monitor, Comprato, Perso, Evita, Consigliato;
- precompilazione dei nomi da evitare da segnali editoriali aggiornati e suggeritore live basato su acquisti, slot, budget e obiettivi di reparto;
- giro chiamata configurabile nella vista Avversari, con avanzamento automatico e prossimo chiamante mostrato dopo ogni assegnazione;
- badge infortunio nel listone con tempi di recupero, sconto automatico sul massimale e penalizzazione nei consigli;
- listone e statistiche 2026/27 riallineati al Fantacalcio.it live del 02/09/2026 dopo la chiusura del mercato estivo;
- scouting estero per i nuovi arrivi senza storico Serie A recente, con badge `EST`, rendimento 2025/26 e correzione del massimale;
- badge `TIT %` e note arricchite con titolarita, ballottaggi, fonte, QA/FVM e forma recente;
- pagina Rosa con acquistati, spesa totale, delta dal massimale, gol, assist, fantamedia e tiratori;
- Coach AI con cache locale su file, snapshot sintetico e comandi di assegnazione gestiti senza chiamata API quando non serve strategia;
- autosave locale su backend quando avvii `npm run dev:ai`: lo stato live resta nel browser e viene copiato anche in `server/auction-state.json`;
- export CSV ed export/import JSON dello stato live;
- supporto PWA leggero per riaprire l'app dopo il primo caricamento anche con rete instabile;
- viste portieri, rigoristi, risultati, mercato e fonti.
- vista Risultati aggiornata con i posticipi del 31/08/2026 e note operative quando voti/tabellini non sono ancora consolidati.
- vista Mercato con i movimenti del deadline day del 01/09/2026, gli aggiornamenti nel listone e le uscite filtrate.
- controllo del 03/09/2026 sulle ultime notizie, indisponibili e probabili formazioni live.

## Sviluppo locale

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Coach AI e token

Per usarlo in locale, crea `.env` partendo da `.env.example`, inserisci `OPENAI_API_KEY`, poi avvia:

```bash
npm run dev:ai
```

Il server salva le risposte in `server/coach-memory.json` e le riusa quando domanda, modello e stato asta sintetico coincidono. In quel caso l'app mostra `Cache locale: 0 token API`.

Per ridurre i token anche sulle domande nuove, il server invia a OpenAI solo lo snapshot utile: giocatore attivo, turno chiamata, prossima chiamata consigliata, budget, rosa, top minacce avversarie e pochi giocatori visibili. I comandi semplici tipo `segna Samardzic ad Avversario 1 per 18` vengono applicati dal browser senza chiamare il modello.

Su Vercel imposta `OPENAI_API_KEY` in Project Settings -> Environment Variables per Production, Preview e Development, poi fai un redeploy. La route `api/coach.js` usa quella variabile lato server, senza esporla al browser. La cache su Vercel resta in memoria nelle funzioni calde; in locale resta su file.

## Deploy su Vercel

Importa questa cartella come progetto Vercel:

```text
C:\xampp\htdocs\Fantacalcio2026_27\webapp
```

Impostazioni:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Stato live

La versione attuale salva acquisti, prezzi, avversari e giro chiamata in `localStorage` e, se il server locale e attivo con `npm run dev:ai`, fa anche autosave su `server/auction-state.json`. Il salvataggio server usa una scrittura atomica e mantiene una copia precedente in `server/auction-state.backup.json`.

L'indicatore in alto mostra se il backup server e attivo o se l'app sta lavorando solo col browser. Per usare lo stesso stato da piu dispositivi in contemporanea serve una persistenza remota vera, per esempio Vercel KV, Supabase o un database server-side.

Come paracadute mobile, esporta il JSON dal PC e importalo dallo smartphone se devi cambiare dispositivo durante l'asta.

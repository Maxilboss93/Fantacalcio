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
- pagina Rosa con acquistati, spesa totale, delta dal massimale, gol, assist, fantamedia e tiratori;
- export CSV ed export/import JSON dello stato live;
- supporto PWA leggero per riaprire l'app dopo il primo caricamento anche con rete instabile;
- viste portieri, rigoristi, risultati e fonti.

## Sviluppo locale

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

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

La versione attuale salva acquisti, prezzi e note in `localStorage`, quindi lo stato resta nel browser usato durante l'asta. Per usare lo stesso stato da piu dispositivi serve aggiungere persistenza remota, per esempio Vercel KV, Supabase o un endpoint serverless.

Come paracadute mobile, esporta il JSON dal PC e importalo dallo smartphone se devi cambiare dispositivo durante l'asta.

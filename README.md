# WisiRacer — Starfighter Grand Prix 🏁

Racing arcade spaziale con combattimento. Un gioco WiSiVERSE.

## Avvio in locale (VS Code)

```bash
npm install
npm run dev
```

Apri l'indirizzo che compare nel terminale (di solito http://localhost:5173).

## Aggiungere la grafica fotografica

Metti le immagini in `public/assets/` con i nomi indicati in `public/assets/LEGGIMI.txt`
(ship.png, pilot.png, bg_nebula.png, bg_ringworld.png + video intro/outro mp4).
Il gioco le rileva da solo all'avvio: niente upload manuale.

Consiglio per `ship.png`: usa una PNG con sfondo trasparente (rimuovi lo sfondo
con Higgsfield "remove background" o un tool qualsiasi). Se lo sfondo è pieno,
il gioco prova comunque a renderlo trasparente in automatico.

## Deploy su Vercel

Opzione A (consigliata): carica la cartella su GitHub, poi su vercel.com fai
"Import Project" — Vercel riconosce Vite da solo, nessuna configurazione.

Opzione B (da terminale):

```bash
npx vercel
```

## Comandi di gioco

Frecce / WASD: vira e cabra · SHIFT: boost · SPAZIO: laser · X: freno · ESC: pausa · M: audio

## Note tecniche

- React + Three.js, nessun backend, nessun database.
- I video intro/outro partono dopo il click su "VIA ALLA GARA" (gesto utente),
  quindi l'autoplay con audio è consentito dai browser. "SALTA" è sempre disponibile.

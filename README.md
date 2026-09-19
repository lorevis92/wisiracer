# Revisione mobile — Samsung Galaxy S24 Ultra

La selezione iniziale è **Prova guida**, un giro su un circuito largo con sparo libero (gli avversari non sparano).
Il dispositivo va tenuto in orizzontale. La simulazione si ferma in verticale e
quando la pagina non è visibile. Sterzo progressivo a sinistra, freno e boost a
destra; accelerazione automatica. Il giroscopio è attivo di default: mantieni il telefono in posizione di guida alla partenza; RICENTRA STERZO aggiorna la posizione neutra. Sterzo touch di riserva se i sensori non rispondono. Telecamera predefinita a distanza 10, altezza 3.6; pulsante SPARA da 88 px.

Nel setup sono disponibili telecamera Molto vicina / Vicina / Media e grafica
Leggera / Bilanciata / Dettagliata. Il profilo Bilanciata limita il pixel ratio a
1.25: è un punto di partenza, non una garanzia di 60 fps sul dispositivo.

Canair rimane selezionabile e passa da 68 a 112 unità di larghezza. Prova guida
misura 128 unità. Le navicelle sono larghe circa 14 unità. Gli avversari rallentano
in curva; la risposta dello sterzo è più dolce in velocità e più incisiva in frenata.

Verifica eseguita: build e 13 test di collisioni/guida. Da verificare nel browser
sul dispositivo: inquadratura, multi-touch, equilibrio della gara e prestazioni.
La grafica è ancora procedurale: il tratto realistico Red Fox è un lavoro successivo.

Per provare: `npm ci`, `npm run dev`. Test: `node --test tests/*.test.js`.

---

# WisiRacer — Canair Afterdark · prototipo

Questa copia aggiunge Canair Afterdark al progetto originale. Il sito pubblico
non viene aggiornato automaticamente da questi file.

## Prova sul tuo computer

1. Estrai lo ZIP in una nuova cartella (senza sovrascrivere il tuo progetto).
2. Apri un terminale in quella cartella. Serve Node.js 20.19+ o 22.12+.
3. Esegui `npm ci`, poi `npm run dev`.
4. Apri l'indirizzo mostrato dal terminale, premi INIZIA e lascia selezionato Canair.

Comandi: frecce o A/D per sterzare; Shift per boost; X per frenare;
Spazio per sparare; Esc per pausa; M per audio. Su telefono ci sono i comandi touch.

## Contenuto

- Circuito Canair con strada opaca, barriere continue, facciate e finestre,
  lampioni, vegetazione, insegne Red Fox e Lube Tone, galleria sopraelevata.
- Quattro piloti: Whiskey, Monna Whiskey, Bacco Whiskey e Whiskey con
  l’orecchino di perla. Livree provvisorie, stesso modello 3D W-Racer.
- Collisioni tra navicelle con impulsi e spostamento persistente degli avversari;
  barriere con rimbalzo, particelle, suono sintetizzato e risposta della camera.
- I circuiti precedenti restano selezionabili. Nessun autovettore da gara.

## Stato e limiti

È una prima implementazione procedurale, non la grafica finale creata in Blender.
Non contiene riproduzioni dei quadri: i ritratti originali devono ancora essere
forniti e integrati. Le geometrie di contatto sono approssimazioni arcade in XZ,
con filtro sulla differenza di quota; non è un simulatore fisico completo.

Verificato: build di produzione e 7 test automatici del risolutore di contatti
(urto frontale, tamponamento, separazione, centri coincidenti, barriere,
simmetria e collisioni rapide a 30/60/120 fps con sottopassi).

Non verificato: rendering nel browser, audio percepito, bilanciamento della gara
e prestazioni su telefono. L'anteprima locale è stata bloccata dal browser della
sessione di sviluppo. Serve una prova giocata prima di pubblicare su Vercel.

Per verificare: `node --test tests/collisions.test.js` e `npm run build`.

## File principali

- `src/canair.js`: tracciato e ambiente urbano.
- `src/collisions.js`: contatti arcade testabili senza browser.
- `src/WisiRacer.jsx`: integrazione, roster e gara.

---

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

## Canair · Prova città

Nuovo circuito selezionabile e predefinito: traduzione in Three.js della pianta
Higgsfield/Blender approvata, con geometrie native leggere (non caricamento del GLB).
Un giro, sterzo/camera/velocità invariati; armi disponibili al giocatore.
Anello circa 6,1 km, larghezza 70 unità e partenza sul rettilineo sud.
Utgenra ha pendici fino a circa 352 m, belvedere a 115 m, sentiero e statue
segnaposto. Quartieri e luoghi sono ancora volumi di studio.
Le vie secondarie sono visibili ma chiuse dalle barriere durante la gara.
Esplorazione libera, interni e collisioni pedonali non sono implementati.
Il tempo sul giro non è ancora calibrato a 2–3 minuti: le velocità restano quelle
approvate per non alterare la guida. Build e 15 test automatici verificati;
resa visiva e prestazioni nel browser mobile richiedono una prova sul dispositivo.

### Revisione durata e larghezza
La prova città estende di 4 volte le distanze orizzontali della pianta, mantenendo
velocità e comandi: anello circa 24,4 km nelle unità attuali, da cronometrare sul
telefono. Circa l'86% è largo 160 unità; due tratti brevi scendono gradualmente a
96. Strada, bordi e collisioni usano lo stesso profilo di larghezza. Campionamento
della pista aumentato per mantenere la precisione. Edifici ordinari più numerosi
in istanze condivise e dimensioni dei fabbricati conservate. La mappa di studio
Higgsfield resta alla scala precedente: questa è una variazione da collaudare
nel gioco prima di consolidarla nel progetto artistico. Build e 16 test passano.

### Canair materials pass — 18 September 2026
Bundled 512px WebP albedo textures generated with Higgsfield GPT Image 2.5:
asphalt `03298365-4d8c-448c-bde2-9ea5de16eb3c`, limestone facade
`48cd1fdc-8680-403b-9754-7fcde7e7b953`, stone
`d5e10b28-1d56-4807-9ea0-aeeb0c8191e0`.
Road UVs maintain a six-unit material repeat along the entire track. Instanced
street frontage adds modeled cornices, roof caps, shop glazing and lamps.
Red Fox gains a road-facing frontage extending toward the existing plot.
Daylight uses hemisphere fill and filmic tone mapping; daylight stars are removed.
This is the first environment art pass, not a completed photoreal city. No baked
shadows or normal maps yet. Phone frame rate still requires a physical device test.
Track dimensions, driving controls and camera are unchanged.

### Open streets foundation
Canair masterplan no longer renders race walls/rails or applies their lateral
collision. Existing other circuits retain barriers. Stone sidewalks, painted
road edges, dashed center markings and benches replace the enclosed track look.
This is an open-street prototype: building collision, pedestrian navigation and
checkpoint enforcement for off-route shortcuts are not implemented yet.

### Megalopolis structure — 19 September 2026
The previous scattered low-rise population is replaced by 1,118 deterministic
building plots, including 215 towers above 110 world units, two height clusters,
setback upper floors, podiums and roof crowns. A 17-avenue / 22-cross-street grid
joins the retained roads. Lots reserve the race corridor, landmarks and Utgenra.
Street frontage skips grid intersections. Spatial instancing batches allow
frustum culling; textures reuse existing Higgsfield assets. This is a structural
city expansion, not individually authored photoreal buildings or a completed
pedestrian simulation. Physical-device performance remains unmeasured.

### District architecture pass
Four deterministic building families replace the repeated tower silhouette:
stepped green terraces, oval shafts with bronze fins, paired wings with recessed
connections, and octagonal tapered crowns. District palettes use grey-green,
bronze and warm limestone tones with the existing Higgsfield facade assets.
Paired-wing lots include small planted forecourts. Geometry stays within existing
reserved lots. Vegetation is procedural and currently simplified; animated
pedestrians, realistic shadows and physical-device visual/performance review are
still outstanding. No new image generation was required for this geometry pass.

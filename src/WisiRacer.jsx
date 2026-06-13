import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";

/* =====================================================================
   WISIRACER — STARFIGHTER GRAND PRIX · un gioco WiSiVERSE
   Racing arcade spaziale con combattimento.
   ===================================================================== */

const DIFFS = {
  cadet: { label: "Cadetto", aiBase: 129, aiDmg: 6,  fireCd: 1.5, rubber: 14 },
  pilot: { label: "Pilota",  aiBase: 139, aiDmg: 9,  fireCd: 1.0, rubber: 11 },
  ace:   { label: "Asso",    aiBase: 149, aiDmg: 13, fireCd: 0.65, rubber: 8 },
};

// Asset fotografici: metti i file in public/assets/ e vengono caricati in automatico
const ASSET_PATHS = { ship: "/assets/ship.png", pilot: "/assets/pilot.png" };

const MODES = {
  grand_prix:    { label: "Grand Prix",      icon: "🏁", laps: 3, desc: "3 giri contro 6 rivali. Vince chi taglia per primo il traguardo. Le armi sono consentite — esplodere costa solo tempo." },
  survival_race: { label: "Survival Race",   icon: "💀", laps: 3, desc: "3 giri ma niente respawn: se il tuo scafo arriva a zero sei eliminato. Per vincere devi anche arrivare vivo." },
  last_flying:   { label: "Last One Flying", icon: "⚔️", laps: 0, desc: "Niente traguardo. Caccia totale lungo il circuito: vince l'ultima navicella ancora in volo." },
  timed:         { label: "Timed Survival",  icon: "⏱️", laps: 0, desc: "Sopravvivi 90 secondi mentre tutti ti danno la caccia. Ogni abbattimento vale punti extra." },
};

const TRACKS = {
  nebula: {
    label: "Nebula Run", desc: "Percorso galattico tra nubi cosmiche blu-viola e campi di asteroidi.",
    bg: 0x05060f, fog: 0x14123a, fogD: 0.0011, amb: 0x6677ff, sun: 0x9db4ff,
    nebula: true, planet: false, rockColor: 0x55505c, rocks: 70,
    bgImg: "/assets/bg_nebula.png", intro: "/assets/intro_nebula.mp4", outro: "/assets/outro_nebula.mp4",
    pts: [
      [0,0,0],[230,25,-190],[430,-15,-170],[570,45,40],[500,15,300],
      [270,-35,430],[0,25,380],[-250,65,440],[-470,5,270],[-580,-25,10],
      [-450,35,-230],[-210,-15,-310],
    ],
  },
  ringworld: {
    label: "Ring World", desc: "Un giro mozzafiato sopra un pianeta con anelli, tra i detriti dorati.",
    bg: 0x0a0710, fog: 0x241430, fogD: 0.0009, amb: 0xffb47a, sun: 0xffd9a0,
    nebula: false, planet: true, rockColor: 0x8a7a66, rocks: 90,
    bgImg: "/assets/bg_ringworld.png", intro: "/assets/intro_ringworld.mp4", outro: "/assets/outro_ringworld.mp4",
    pts: [
      [0,40,0],[260,10,-220],[480,60,-120],[600,0,120],[520,-40,360],
      [240,30,500],[-40,80,460],[-320,20,500],[-540,-30,300],[-620,40,20],
      [-480,-20,-240],[-220,50,-320],
    ],
  },
};

const TRACK_ICONS = {
  nebula:'🌌', ringworld:'🪐', vortex_gate:'⚡', crimson_dust:'🔴',
  dark_matter:'⬛', ice_cathedral:'❄️', solar_forge:'☀️', ghost_nebula:'👻',
};

const AI_ROSTER = [
  { name: "Vex",  color: 0xff4d4d },
  { name: "Korr", color: 0xff9b3d },
  { name: "Nyra", color: 0x69f06e },
  { name: "Dax",  color: 0xc77dff },
  { name: "Zhul", color: 0xffe14d },
  { name: "Mira", color: 0xff6ad5 },
];

const GP_POINTS = [10, 8, 6, 4, 3, 2, 1];
const UP = new THREE.Vector3(0, 1, 0);

/* ---------------------- texture glow condivisa ---------------------- */
let _glowTex = null;
function glowTexture() {
  if (_glowTex) return _glowTex;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.3, "rgba(170,225,255,0.85)");
  grd.addColorStop(1, "rgba(40,120,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

/* --------------------- costruttore W-Starfighter --------------------- */
function buildShip(accent) {
  const grp = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({ color: 0x9097a3, metalness: 0.75, roughness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x363b44, metalness: 0.6, roughness: 0.55 });
  const neonM = new THREE.MeshBasicMaterial({ color: accent });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0c1622, metalness: 0.9, roughness: 0.15 });

  // planform a W (vista dall'alto), muso verso -Z
  const s = new THREE.Shape();
  s.moveTo(0, 4.6); s.lineTo(1.0, 1.4); s.lineTo(7.0, -2.4); s.lineTo(6.3, -3.2);
  s.lineTo(2.0, -1.5); s.lineTo(1.1, -3.1); s.lineTo(0, -2.4);
  s.lineTo(-1.1, -3.1); s.lineTo(-2.0, -1.5); s.lineTo(-6.3, -3.2); s.lineTo(-7.0, -2.4);
  s.lineTo(-1.0, 1.4); s.closePath();
  const wing = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.14, bevelSegments: 1 }),
    hull
  );
  wing.rotation.x = -Math.PI / 2;
  wing.position.y = -0.1;
  grp.add(wing);

  const fus = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 5.4), hull);
  fus.position.set(0, 0.35, -0.6); grp.add(fus);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.62, 2.2, 4), hull);
  nose.rotation.x = -Math.PI / 2; nose.rotation.z = Math.PI / 4;
  nose.position.set(0, 0.3, -3.9); grp.add(nose);
  const cock = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 1.5), glass);
  cock.position.set(0, 0.82, -1.4); grp.add(cock);

  // tre motori (centrale grande + due laterali)
  [[0, 0.32, 2.3, 0.5], [1.75, 0.0, 2.6, 0.36], [-1.75, 0.0, 2.6, 0.36]].forEach(([x, y, z, r]) => {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.2, 1.5, 10), dark);
    e.rotation.x = Math.PI / 2; e.position.set(x, y, z); grp.add(e);
    const d = new THREE.Mesh(new THREE.CircleGeometry(r * 0.85, 12), neonM);
    d.position.set(x, y, z + 0.78); grp.add(d);
  });

  // strisce neon sui bordi d'attacco
  [[1, -1], [-1, 1]].forEach(([sx, rs]) => {
    const st = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.09, 0.24), neonM);
    st.position.set(sx * 3.5, 0.48, -1.1);
    st.rotation.y = rs * Math.PI / 4;
    grp.add(st);
  });

  // luci rosse alle estremità alari
  [[6.5], [-6.5]].forEach(([x]) => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.7), new THREE.MeshBasicMaterial({ color: 0xff3344 }));
    t.position.set(x, 0.4, 2.7); grp.add(t);
  });

  // bagliore motori
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color: accent, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  spr.position.set(0, 0.15, 3.6); spr.scale.set(4.5, 4.5, 1);
  grp.add(spr);
  grp.userData.glow = spr;
  return grp;
}

function makeAIShipMesh(color) {
  const wrap = new THREE.Group();
  const m = buildShip(color);
  m.rotation.y = Math.PI; // lookAt punta +Z, il muso del modello è -Z
  wrap.add(m);
  wrap.userData.glow = m.userData.glow;
  return wrap;
}

/* ---------------------------- audio synth ---------------------------- */
function makeAudio() {
  let ctx = null, master, comp, musicGain, musicEl = null, muted = false;
  let oscA, oscB, sub, engFilter, engGain, noiseFilter, noiseGain;
  let prevYawVel = 0, cornerTimer = 0, lastEngT = 0;

  function ensure() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 6;
      comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.18;
      master = ctx.createGain(); master.gain.value = 1.0;
      comp.connect(master); master.connect(ctx.destination);

      // Musica: MP3 via HTMLAudioElement → MediaElementSource → comp
      musicEl = new Audio("/assets/music.mp3");
      musicEl.loop = true;
      const mediaSrc = ctx.createMediaElementSource(musicEl);
      musicGain = ctx.createGain(); musicGain.gain.value = muted ? 0 : 0.35;
      mediaSrc.connect(musicGain); musicGain.connect(comp);
      musicEl.play().catch(() => {});

      // Motore: sawtooth × 2 + sub + waveshaper + filtro lowpass
      oscA = ctx.createOscillator(); oscA.type = "sawtooth";
      oscB = ctx.createOscillator(); oscB.type = "sawtooth"; oscB.detune.value = 14;
      sub  = ctx.createOscillator(); sub.type  = "square";
      const pre = ctx.createGain(); pre.gain.value = 0.6;
      const shaper = ctx.createWaveShaper();
      const curve  = new Float32Array(256);
      for (let i = 0; i < 256; i++) { const x = i / 127.5 - 1; curve[i] = Math.tanh(2.6 * x); }
      shaper.curve = curve;
      engFilter = ctx.createBiquadFilter();
      engFilter.type = "lowpass"; engFilter.frequency.value = 300; engFilter.Q.value = 1.2;
      engGain = ctx.createGain(); engGain.gain.value = 0;
      oscA.connect(pre); oscB.connect(pre); sub.connect(pre);
      pre.connect(shaper); shaper.connect(engFilter); engFilter.connect(engGain); engGain.connect(comp);
      oscA.start(); oscB.start(); sub.start();

      // Soffio propulsori
      const nlen = ctx.sampleRate * 2;
      const nbuf = ctx.createBuffer(1, nlen, ctx.sampleRate);
      const nd   = nbuf.getChannelData(0);
      for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1;
      const nsrc = ctx.createBufferSource(); nsrc.buffer = nbuf; nsrc.loop = true;
      noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass"; noiseFilter.frequency.value = 900; noiseFilter.Q.value = 0.6;
      noiseGain = ctx.createGain(); noiseGain.gain.value = 0;
      nsrc.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(comp);
      nsrc.start();
    } catch (e) { ctx = null; }
  }

  function blip(f0, f1, dur, type, vol) {
    if (!ctx || muted) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur + 0.02);
  }
  function noise(dur, vol, freq) {
    if (!ctx || muted) return;
    const n = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    n.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = vol;
    n.connect(f); f.connect(g); g.connect(master); n.start();
  }

  return {
    ensure,
    laser()      { blip(950, 240,  0.09, "square",   0.11); },
    enemyLaser() { blip(620, 180,  0.09, "square",   0.06); },
    hit()        { noise(0.08, 0.16, 1800); },
    explode()    { noise(0.5,  0.5,  700); blip(180, 40, 0.4, "sawtooth", 0.22); },
    pickup()     { blip(440,  1320, 0.18, "sine",    0.14); },
    count(hi)    { blip(hi ? 880 : 440, hi ? 880 : 440, 0.13, "sine", 0.2); },
    engine(speed, on, boosting, yawVel = 0) {
      if (!ctx) return;
      const now = ctx.currentTime;
      const dt  = lastEngT > 0 ? Math.min(0.05, now - lastEngT) : 0.016;
      lastEngT  = now;

      // Uscita curva: yawVel scende sotto 0.3 dopo essere stato sopra 0.8
      const curYaw = Math.abs(yawVel);
      if (Math.abs(prevYawVel) >= 0.8 && curYaw < 0.3 && on) cornerTimer = 0.6;
      cornerTimer = Math.max(0, cornerTimer - dt);
      prevYawVel = yawVel;

      // Frequenza base segue la velocità; filtro si apre con i giri
      const f = 38 + Math.min(150, speed) * 1.2;
      oscA.frequency.value = f; oscB.frequency.value = f * 1.006; sub.frequency.value = f * 0.5;
      engFilter.frequency.setTargetAtTime(200 + speed * 9, now, 0.1);

      if (muted) {
        engGain.gain.setTargetAtTime(0,     now, 0.15);
        noiseGain.gain.setTargetAtTime(0,   now, 0.15);
      } else if (!on) {
        // Brusio di fondo minimo (player morto o countdown)
        engGain.gain.setTargetAtTime(0.018, now, 0.15);
        noiseGain.gain.setTargetAtTime(0.006, now, 0.15);
      } else if (boosting || cornerTimer > 0) {
        // Volume alto: boost o uscita curva
        engGain.gain.setTargetAtTime(0.07,  now, 0.15);
        noiseGain.gain.setTargetAtTime(0.025, now, 0.15);
      } else {
        // Crociera normale
        engGain.gain.setTargetAtTime(0.038, now, 0.15);
        noiseGain.gain.setTargetAtTime(0.014, now, 0.15);
      }
    },
    setMuted(m) {
      muted = m;
      if (musicGain) musicGain.gain.value = muted ? 0 : 0.35;
      if (engGain)   engGain.gain.value   = muted ? 0 : 0.018;
      if (noiseGain) noiseGain.gain.value = muted ? 0 : 0.006;
      return muted;
    },
    toggleMuted() { return this.setMuted(!muted); },
    dispose() {
      if (musicEl) { musicEl.pause(); musicEl.src = ""; musicEl = null; }
      if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
    },
  };
}

/* ========================== MOTORE DI GIOCO ========================== */
function initGame(container, cfg, ui) {
  const TR = TRACKS[cfg.track], MD = MODES[cfg.mode], DF = DIFFS[cfg.diff];
  const keys = cfg.keys;
  const mirRef = cfg.mirRef || { current: { x: 0, y: 0 } };
  const RESPAWN = cfg.mode === "grand_prix";
  const RACEMODE = MD.laps > 0;
  const TIMED = cfg.mode === "timed";
  const ARENA = cfg.mode === "last_flying";

  const audio = makeAudio(); audio.ensure();

  /* ------ asset fotografici opzionali ------ */
  const ASSETS = cfg.assets || {};
  const texLoader = new THREE.TextureLoader();
  const shipTex = ASSETS.ship ? texLoader.load(ASSETS.ship) : null;

  const W = () => container.clientWidth || 800;
  const H = () => container.clientHeight || 600;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(TR.bg);
  scene.fog = new THREE.FogExp2(TR.fog, TR.fogD);
  const camera = new THREE.PerspectiveCamera(72, W() / H(), 0.1, 6000);

  scene.add(new THREE.AmbientLight(TR.amb, 0.6));
  const sun = new THREE.DirectionalLight(TR.sun, 1.1);
  sun.position.set(300, 500, 200); scene.add(sun);

  /* ------ stelle (con star-warp dinamico) ------ */
  const STAR_N = 1600;
  const starPos = new Float32Array(STAR_N * 3);
  for (let i = 0; i < STAR_N; i++) {
    const r = 1600 + Math.random() * 1800, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    starPos[i * 3 + 1] = r * Math.cos(ph);
    starPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.85 });
  starMat.fog = false;
  scene.add(new THREE.Points(starGeo, starMat));

  /* ------ sfondo fotografico ------ */
  if (ASSETS.bg) {
    const bgTex = texLoader.load(ASSETS.bg);
    const domeMat = new THREE.MeshBasicMaterial({ map: bgTex, side: THREE.BackSide });
    domeMat.fog = false;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3200, 36, 24), domeMat);
    dome.rotation.y = Math.PI / 2;
    scene.add(dome);
    scene.fog = new THREE.FogExp2(TR.fog, TR.fogD * 0.5);
  }

  /* ------ nebulose ------ */
  if (TR.nebula && !ASSETS.bg) {
    const cols = [0x6a4dff, 0x3d7bff, 0x9b3dff, 0x2bc8ff];
    for (let i = 0; i < 9; i++) {
      const sm = new THREE.SpriteMaterial({
        map: glowTexture(), color: cols[i % cols.length], transparent: true,
        opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      sm.fog = false;
      const sp = new THREE.Sprite(sm);
      const a = Math.random() * Math.PI * 2, r = 500 + Math.random() * 900;
      sp.position.set(Math.cos(a) * r, -150 + Math.random() * 400, Math.sin(a) * r);
      const sc = 500 + Math.random() * 700; sp.scale.set(sc, sc, 1);
      scene.add(sp);
    }
  }

  /* ------ pianeta con anelli ------ */
  if (TR.planet && !ASSETS.bg) {
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(520, 40, 28),
      new THREE.MeshStandardMaterial({ color: 0xb9895e, roughness: 0.95, metalness: 0.05 })
    );
    planet.position.set(0, -780, 150); scene.add(planet);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(640, 1020, 72),
      new THREE.MeshBasicMaterial({ color: 0xd9c39a, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
    );
    ring.position.copy(planet.position);
    ring.rotation.x = -Math.PI / 2.25; ring.rotation.y = 0.18;
    scene.add(ring);
  }

  /* ------ tracciato ------ */
  const SAMPLES = 800;
  const curve = new THREE.CatmullRomCurve3(TR.pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), true, "catmullrom", 0.6);
  const cPts = curve.getSpacedPoints(SAMPLES);
  const len = curve.getLength();

  /* ------ strada luminosa: nastro largo + piloni verticali ai bordi ------ */
  {
    const rc = document.createElement("canvas"); rc.width = 64; rc.height = 64;
    const rg = rc.getContext("2d");
    rg.clearRect(0, 0, 64, 64);
    rg.fillStyle = "rgba(40,110,255,0.14)"; rg.fillRect(0, 0, 64, 64);
    rg.fillStyle = "rgba(140,225,255,0.95)"; rg.fillRect(0, 0, 5, 64); rg.fillRect(59, 0, 5, 64);
    rg.fillStyle = "rgba(150,230,255,0.7)"; rg.fillRect(30, 0, 4, 34);
    const roadTex = new THREE.CanvasTexture(rc);
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;

    const HW = 16, STEP = 2, NSEG = Math.floor(SAMPLES / STEP);
    const vts = new Float32Array((NSEG + 1) * 2 * 3);
    const uvs = new Float32Array((NSEG + 1) * 2 * 2);
    const idx = [];
    const sideV = new THREE.Vector3(), dirV = new THREE.Vector3();
    for (let i = 0; i <= NSEG; i++) {
      const a = cPts[(i * STEP) % SAMPLES];
      const b = cPts[((i * STEP) + 2) % SAMPLES];
      dirV.copy(b).sub(a).normalize();
      sideV.crossVectors(dirV, UP).normalize();
      const o = i * 6;
      vts[o] = a.x - sideV.x * HW; vts[o + 1] = a.y - 7; vts[o + 2] = a.z - sideV.z * HW;
      vts[o + 3] = a.x + sideV.x * HW; vts[o + 4] = a.y - 7; vts[o + 5] = a.z + sideV.z * HW;
      const vv = i * 0.35;
      uvs[i * 4] = 0; uvs[i * 4 + 1] = vv; uvs[i * 4 + 2] = 1; uvs[i * 4 + 3] = vv;
      if (i < NSEG) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const rgeo = new THREE.BufferGeometry();
    rgeo.setAttribute("position", new THREE.BufferAttribute(vts, 3));
    rgeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    rgeo.setIndex(idx);
    const rmat = new THREE.MeshBasicMaterial({
      map: roadTex, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Mesh(rgeo, rmat));

    // piloni stile circuito futuristico (ogni tanto uno bianco, come i cordoli)
    const pylGeo = new THREE.BoxGeometry(0.9, 11, 0.9);
    const pylA = new THREE.MeshBasicMaterial({ color: 0x55c8ff });
    const pylB = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const NP = 72;
    for (let i = 0; i < NP; i++) {
      const t = i / NP;
      const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
      sideV.crossVectors(tan, UP).normalize();
      [-1, 1].forEach(sg => {
        const m = new THREE.Mesh(pylGeo, i % 4 === 0 ? pylB : pylA);
        m.position.copy(p).addScaledVector(sideV, sg * (HW + 2.5));
        m.position.y -= 2;
        scene.add(m);
      });
    }
  }

  // mappa normalizzata per minimappa
  let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
  cPts.forEach(p => { mnx = Math.min(mnx, p.x); mxx = Math.max(mxx, p.x); mnz = Math.min(mnz, p.z); mxz = Math.max(mxz, p.z); });
  const spanX = (mxx - mnx) || 1, spanZ = (mxz - mnz) || 1;
  const nrm = p => [0.06 + 0.88 * (p.x - mnx) / spanX, 0.06 + 0.88 * (p.z - mnz) / spanZ];
  ui.onTrackMap(cPts.filter((_, i) => i % 8 === 0).map(nrm));

  /* ------ porte / checkpoint ------ */
  const NG = 12;
  const gates = [];
  for (let i = 0; i < NG; i++) {
    const t = i / NG;
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(26, 1.1, 10, 36),
      new THREE.MeshBasicMaterial({ color: i === 0 ? 0xffffff : 0x35a8ff, transparent: true, opacity: 0.75 })
    );
    m.position.copy(p); m.lookAt(p.clone().add(tan));
    scene.add(m);
    gates.push({ t, pos: p, mesh: m });
  }

  /* ------ asteroidi ------ */
  const rocks = [];
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: TR.rockColor, roughness: 1, metalness: 0.1, flatShading: true });
  for (let i = 0; i < TR.rocks; i++) {
    const t = Math.random();
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
    const vert = new THREE.Vector3().crossVectors(side, tan).normalize();
    const off = (28 + Math.random() * 95) * (Math.random() < 0.5 ? 1 : -1);
    const voff = -50 + Math.random() * 110;
    const r = 3 + Math.random() * 11;
    const m = new THREE.Mesh(rockGeo, rockMat);
    m.position.copy(p).addScaledVector(side, off).addScaledVector(vert, voff);
    m.scale.setScalar(r);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(m);
    rocks.push({ mesh: m, r, hitCd: 0 });
  }

  /* ------ power-up ------ */
  const PUPS = [
    { k: "repair", c: 0x39ff7a, label: "+RIPARAZIONE" },
    { k: "shield", c: 0x39d2ff, label: "+SCUDI" },
    { k: "boost",  c: 0xffd23d, label: "+NITRO" },
  ];
  const pickups = [];
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    const type = PUPS[i % 3];
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const side = new THREE.Vector3().crossVectors(tan, UP).normalize();
    const pos = p.clone().addScaledVector(side, -16 + Math.random() * 32);
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(2.4, 0), new THREE.MeshBasicMaterial({ color: type.c }));
    m.position.copy(pos); scene.add(m);
    pickups.push({ type, pos, mesh: m, active: true, respawn: 0 });
  }

  /* ------ polvere spaziale (sensazione di velocità) ------ */
  const DUST = 380;
  const dustPos = new Float32Array(DUST * 3);
  {
    const sp0 = curve.getPointAt(0);
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = sp0.x + (Math.random() - 0.5) * 400;
      dustPos[i * 3 + 1] = sp0.y + (Math.random() - 0.5) * 400;
      dustPos[i * 3 + 2] = sp0.z + (Math.random() - 0.5) * 400;
    }
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 1.5, transparent: true, opacity: 0.5 });
  dustMat.fog = false;
  scene.add(new THREE.Points(dustGeo, dustMat));

  /* ------ particelle ------ */
  const PMAX = 700;
  const pPos = new Float32Array(PMAX * 3), pVel = new Float32Array(PMAX * 3),
        pLife = new Float32Array(PMAX), pCol = new Float32Array(PMAX * 3);
  for (let i = 0; i < PMAX; i++) pPos[i * 3 + 1] = -99999;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({
    size: 2.6, vertexColors: true, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  pMat.fog = false;
  scene.add(new THREE.Points(pGeo, pMat));
  let pIdx = 0;
  function burst(pos, n, col, spd) {
    for (let k = 0; k < n; k++) {
      const i = pIdx = (pIdx + 1) % PMAX;
      pPos[i * 3] = pos.x; pPos[i * 3 + 1] = pos.y; pPos[i * 3 + 2] = pos.z;
      pVel[i * 3] = (Math.random() - 0.5) * spd;
      pVel[i * 3 + 1] = (Math.random() - 0.5) * spd;
      pVel[i * 3 + 2] = (Math.random() - 0.5) * spd;
      pLife[i] = 0.5 + Math.random() * 0.7;
      pCol[i * 3] = col.r; pCol[i * 3 + 1] = col.g; pCol[i * 3 + 2] = col.b;
    }
  }

  /* ------ laser ------ */
  const lasGeo = new THREE.BoxGeometry(0.35, 0.35, 5.5);
  const lasers = [];
  const impactEffects = [];
  function fireLaser(owner, origin, dir, dmg, colorHex) {
    if (lasers.length > 110) return;
    const m = new THREE.Mesh(lasGeo, new THREE.MeshBasicMaterial({ color: colorHex }));
    m.position.copy(origin);
    m.lookAt(origin.clone().add(dir));
    scene.add(m);
    lasers.push({ mesh: m, vel: dir.clone().multiplyScalar(owner.isPlayer ? 430 : 390), ttl: 1.5, owner, dmg });
  }

  /* ------ aspetto navicelle: foto (sprite) o 3D procedurale ------ */
  function makeShipVisual(colorHex, isPlayer) {
    if (shipTex) {
      const mat = new THREE.SpriteMaterial({
        map: shipTex, transparent: true, depthWrite: false, alphaTest: 0.12,
        color: isPlayer ? 0xffffff : colorHex,
      });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(11.5, 11.5, 1);
      sp.userData.sprite = true;
      return sp;
    }
    return makeAIShipMesh(colorHex);
  }

  /* ------ piloti ------ */
  const racers = [];
  const player = {
    isPlayer: true, name: "BLU", color: 0x4fc3f7,
    mesh: makeShipVisual(0x4fc3f7, true),
    yaw: 0, pitch: 0, yawVel: 0, speed: 0,
    boost: 100, heat: 0, hot: false, nitro: 0, alt: false, fireT: 0,
    shields: 60, hull: 100, alive: true, inv: 0, lastHitT: -9,
    kills: 0, lapsDone: 0, t: 0, gateIdx: 1,
    finished: false, finishTime: 0, respawnT: 0, offMsgT: 0,
  };
  {
    const p0 = curve.getPointAt(0), tan = curve.getTangentAt(0);
    player.mesh.position.copy(p0);
    player.yaw = Math.atan2(-tan.x, -tan.z);
  }
  scene.add(player.mesh);
  racers.push(player);

  AI_ROSTER.forEach((a, i) => {
    const t0 = (0.0045 * (i + 1)) % 1;
    const r = {
      isPlayer: false, name: a.name, color: a.color,
      mesh: makeShipVisual(a.color, false),
      t: t0, lat: (i % 2 ? 1 : -1) * (8 + Math.floor(i / 2) * 5),
      voff: -3 + Math.random() * 6, wf: 0.5 + Math.random(), phase: Math.random() * 6,
      base: DF.aiBase + (Math.random() * 8 - 4), curSpeed: DF.aiBase,
      shields: 60, hull: 100, alive: true, inv: 0, lastHitT: -9,
      kills: 0, lapsDone: 0, fireCd: 1 + Math.random() * 2,
      finished: false, finishTime: 0, respawnT: 0,
    };
    const p = curve.getPointAt(t0);
    r.mesh.position.copy(p);
    scene.add(r.mesh);
    racers.push(r);
  });

  /* ------ stato gara ------ */
  let phase = "count", cT = 3.99, lastC = 4, overT = 0, ended = false;
  let elapsed = 0, shake = 0, timer = TIMED ? 90 : 0;
  let lockedTarget = null;
  let paused = false, hudAcc = 0, animId = 0;
  const elimOrder = [];
  const clock = new THREE.Clock();

  const progressOf = r => r.lapsDone + r.t;
  const getPos = r => r.mesh.position;
  function forwardDelta(a, b) { let d = b - a; if (d < -0.5) d += 1; if (d > 0.5) d -= 1; return d; }
  function closestT(pos, lastT) {
    let best = 0, bd = 1e18;
    const c0 = Math.floor(lastT * SAMPLES);
    for (let k = -12; k <= 40; k++) {
      const idx = ((c0 + k) % SAMPLES + SAMPLES) % SAMPLES;
      const d = pos.distanceToSquared(cPts[idx]);
      if (d < bd) { bd = d; best = idx; }
    }
    return { t: best / SAMPLES, d: Math.sqrt(bd) };
  }
  let lastMsgT = -9;
  function throttleMsg(m) { if (elapsed - lastMsgT > 0.7) { lastMsgT = elapsed; ui.onMsg(m); } }

  function posOf(r) {
    const key = x => x.finished ? 1e6 - x.finishTime : progressOf(x) - (x.alive ? 0 : 100);
    const k = key(r);
    return 1 + racers.filter(o => o !== r && key(o) > k).length;
  }

  function damage(r, dmg, attacker) {
    if (!r.alive || r.inv > 0 || phase !== "race") return;
    r.lastHitT = elapsed;
    let s = r.shields - dmg;
    if (s < 0) { r.hull += s; r.shields = 0; } else r.shields = s;
    burst(getPos(r), 6, new THREE.Color(0xffaa55), 32);
    if (r.isPlayer) {
      shake = Math.min(shake + 0.9, 1.8); ui.onExpr("hit"); ui.onHit(); audio.hit();
      if (r.shields <= 0 && r.hull < 35 && r.hull > 0) throttleMsg("SCAFO CRITICO!");
    }
    if (r.hull <= 0) destroy(r, attacker);
  }

  function destroy(r, attacker) {
    r.alive = false; r.hull = 0; r.mesh.visible = false;
    burst(getPos(r), 60, new THREE.Color(0xff7733), 60);
    burst(getPos(r), 30, new THREE.Color(0x66ccff), 75);
    audio.explode();
    if (attacker && attacker !== r) {
      attacker.kills++;
      if (attacker.isPlayer) { throttleMsg("HAI ABBATTUTO " + r.name + "!"); ui.onExpr("grin"); }
    }
    if (RESPAWN) {
      r.respawnT = 2.6;
      if (r.isPlayer) ui.onMsg("SEI ESPLOSO! Rientro in gara...");
    } else {
      elimOrder.push(r);
      if (r.isPlayer) { phase = "over"; overT = 2.2; ui.onMsg("ELIMINATO!"); }
      else throttleMsg(r.name + " eliminato (" + racers.filter(x => x.alive).length + " in volo)");
    }
    if (r.isPlayer) shake = 1.6;
  }

  function pickTarget(r) {
    const cands = racers.filter(o => o !== r && o.alive);
    if (!cands.length) return null;
    if (!ARENA && !TIMED && player.alive && Math.random() < 0.65) {
      if (getPos(player).distanceTo(getPos(r)) < 320) return player;
    }
    if (TIMED && player.alive) return player;
    let best = null, bd = 1e18;
    cands.forEach(o => { const d = getPos(o).distanceToSquared(getPos(r)); if (d < bd) { bd = d; best = o; } });
    return best;
  }

  function endRace() {
    if (ended) return; ended = true;
    let order;
    if (RACEMODE) {
      const key = r => r.finished ? 1e6 - r.finishTime : progressOf(r) - (r.alive ? 0 : 100);
      order = racers.slice().sort((a, b) => key(b) - key(a));
    } else {
      const alive = racers.filter(r => r.alive).sort((a, b) => b.kills - a.kills || progressOf(b) - progressOf(a));
      order = [...alive, ...elimOrder.slice().reverse()];
    }
    const rows = order.map((r, i) => ({
      pos: i + 1, name: r.name, isPlayer: !!r.isPlayer,
      colorCss: "#" + r.color.toString(16).padStart(6, "0"),
      status: RACEMODE
        ? (r.finished ? "Traguardo" : r.alive ? "In gara" : "Eliminato")
        : (r.alive ? (TIMED ? "Sopravvissuto" : "In volo") : "Abbattuto"),
      kills: r.kills,
      points: RACEMODE ? (r.alive || r.finished ? (GP_POINTS[i] || 0) : 0) : r.kills * 2 + Math.max(0, 8 - i),
    }));
    ui.onEnd(rows);
  }

  /* ------ input ------ */
  function setKey(code, v) {
    switch (code) {
      case "ArrowLeft": case "KeyA": keys.left = v; return true;
      case "ArrowRight": case "KeyD": keys.right = v; return true;
      case "ShiftLeft": case "ShiftRight": keys.boost = v; return true;
      case "Space": keys.fire = v; return true;
      case "KeyX": case "ControlLeft": case "ControlRight": keys.brake = v; return true;
      default: return false;
    }
  }
  const onKeyDown = e => {
    if (e.code === "Escape" && !e.repeat) { paused = !paused; }
    if (e.code === "KeyM" && !e.repeat) { audio.toggleMuted(); }
    if (setKey(e.code, 1)) e.preventDefault();
  };
  const onKeyUp = e => { if (setKey(e.code, 0)) e.preventDefault(); };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  const onResize = () => {
    camera.aspect = W() / H(); camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  };
  window.addEventListener("resize", onResize);

  /* ------ loop ------ */
  const fwdV = new THREE.Vector3(), rightV = new THREE.Vector3(), tmpV = new THREE.Vector3(), projV = new THREE.Vector3();

  function update(dt) {
    elapsed += dt;

    if (phase === "count") {
      cT -= dt;
      const c = Math.max(0, Math.ceil(cT));
      if (c !== lastC) { lastC = c; audio.count(c === 0); }
      if (cT <= 0) { phase = "race"; ui.onMsg("VIA! 🚀"); }
    }

    if (phase === "over" || phase === "finished") {
      overT -= dt;
      if (overT <= 0) endRace();
    }

    const racing = phase === "race" || phase === "finished";

    /* --- giocatore --- */
    if (player.alive && racing) {
      const ctrl = phase === "race" && !player.finished;
      const st = ctrl ? (keys.gyroActive ? (keys.gyroSteer || 0) : (keys.right ? 1 : 0) - (keys.left ? 1 : 0)) : 0;
      player.yawVel += ((-st * 1.95) - player.yawVel) * Math.min(1, dt * 8);
      player.yaw += player.yawVel * dt;

      let target = ctrl && keys.brake ? 85 : 145;
      let boosting = false;
      if (ctrl && keys.boost && player.boost > 0) {
        boosting = true; target = 195 + (player.nitro > 0 ? 22 : 0);
        player.boost = Math.max(0, player.boost - 34 * dt);
      } else {
        player.boost = Math.min(100, player.boost + (player.nitro > 0 ? 22 : 11) * dt);
      }
      player.nitro = Math.max(0, player.nitro - dt);
      player.speed += (target - player.speed) * Math.min(1, dt * (boosting ? 2.6 : 1.6));
      player.boosting = boosting;

      fwdV.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
      player.mesh.position.addScaledVector(fwdV, player.speed * dt);
      if (player.mesh.userData.sprite) {
        player.mesh.material.rotation = player.yawVel * 0.45;
      }
      if (player.mesh.userData.glow) player.mesh.userData.glow.scale.setScalar(3 + player.speed * 0.035 + (boosting ? 2 : 0));
      if (boosting && Math.random() < 0.9) burst(getPos(player).clone().addScaledVector(fwdV, -4), 5, new THREE.Color(0x55bbff), 18);

      // fuoco
      player.fireT -= dt;
      if (ctrl && keys.fire && player.fireT <= 0 && !player.hot) {
        player.fireT = 0.11; player.heat += 8; player.alt = !player.alt;
        rightV.crossVectors(fwdV, UP).normalize();
        const origin = getPos(player).clone().addScaledVector(fwdV, 3.5).addScaledVector(rightV, player.alt ? 2.3 : -2.3);
        origin.y += 0.2;
        const aimDir = new THREE.Vector3(mirRef.current.x / (W() / 2), -mirRef.current.y / (H() / 2), 1.0).unproject(camera).sub(camera.position).normalize();
        if (lockedTarget && lockedTarget.alive) {
          const toT = getPos(lockedTarget).clone().sub(origin).normalize();
          if (aimDir.dot(toT) > 0.6) aimDir.lerp(toT, 0.22).normalize();
        }
        fireLaser(player, origin, aimDir, 12, 0x7fdfff);
        audio.laser();
      }
      player.heat = Math.max(0, player.heat - 30 * dt);
      if (player.heat >= 100 && !player.hot) { player.hot = true; throttleMsg("SURRISCALDAMENTO!"); }
      if (player.hot && player.heat < 40) player.hot = false;

      // scudi
      if (elapsed - player.lastHitT > 3) player.shields = Math.min(60, player.shields + 4.5 * dt);
      player.inv = Math.max(0, player.inv - dt);
      player.mesh.visible = player.inv <= 0 || Math.floor(elapsed * 10) % 2 === 0;

      // tracciato: t più vicino, fuori pista, porte
      const prevT = player.t;
      const { t: newT, d: distC } = closestT(getPos(player), prevT);
      player.t = newT;

      // Altitudine automatica: segui il tracciato con +5 unità di quota
      const trackY = cPts[Math.floor(newT * SAMPLES)].y + 5;
      player.mesh.position.y += (trackY - player.mesh.position.y) * Math.min(1, dt * 6.5);

      // Attrazione laterale verso il centro del tracciato (magnetic road)
      if (distC > 18 && distC < 45) {
        const tPt = cPts[Math.floor(newT * SAMPLES)];
        const lf = Math.min(1, dt * 2.8);
        player.mesh.position.x += (tPt.x - player.mesh.position.x) * lf;
        player.mesh.position.z += (tPt.z - player.mesh.position.z) * lf;
      }

      // Orientamento visivo: inclina la navicella verso la pendenza del tracciato davanti
      if (!player.mesh.userData.sprite) {
        const lookIdx = (Math.floor(newT * SAMPLES) + 6) % SAMPLES;
        tmpV.set(
          player.mesh.position.x + fwdV.x * 14,
          cPts[lookIdx].y + 5,
          player.mesh.position.z + fwdV.z * 14
        );
        player.mesh.lookAt(tmpV);
        player.mesh.children[0].rotation.z = -player.yawVel * 0.55;
      }

      if (distC > 95 && phase === "race") {
        tmpV.copy(cPts[Math.floor(newT * SAMPLES)]).sub(getPos(player)).normalize();
        player.mesh.position.addScaledVector(tmpV, 30 * dt);
        player.speed *= Math.max(0.5, 1 - 0.35 * dt);
        player.offMsgT -= dt;
        if (player.offMsgT <= 0) { player.offMsgT = 1.6; ui.onMsg("⚠ FUORI ROTTA — torna sul percorso!"); }
      }
      if (RACEMODE && !player.finished) {
        const ng = player.gateIdx % NG;
        const dts = forwardDelta(prevT, newT);
        const dg = forwardDelta(prevT, gates[ng].t);
        if (dts > 0 && dg >= -0.0005 && dg <= dts + 0.0005 && distC < 90) {
          player.gateIdx++;
          burst(gates[ng].pos, 10, new THREE.Color(0x66e0ff), 25);
          if (ng === 0) {
            player.lapsDone++;
            if (player.lapsDone < MD.laps) {
              ui.onMsg(player.lapsDone === MD.laps - 1 ? "ULTIMO GIRO!" : "GIRO " + (player.lapsDone + 1) + "/" + MD.laps);
              audio.pickup();
            }
          }
        }
      } else if (!RACEMODE) {
        if (forwardDelta(prevT, newT) > 0 && prevT > newT) player.lapsDone++;
      }

      // collisioni asteroidi
      rocks.forEach(rk => {
        rk.hitCd = Math.max(0, rk.hitCd - dt);
        if (rk.hitCd > 0) return;
        const d = getPos(player).distanceTo(rk.mesh.position);
        if (d < rk.r + 3.5) {
          rk.hitCd = 0.6;
          damage(player, 8, null);
          tmpV.copy(getPos(player)).sub(rk.mesh.position).normalize();
          player.mesh.position.addScaledVector(tmpV, 4);
          player.speed *= 0.55; shake = Math.min(shake + 0.6, 1.4);
          throttleMsg("💥 IMPATTO ASTEROIDE!");
        }
      });

      // pickup
      pickups.forEach(pu => {
        if (!pu.active) return;
        if (getPos(player).distanceTo(pu.pos) < 7.5) {
          pu.active = false; pu.respawn = 12; pu.mesh.visible = false;
          audio.pickup(); ui.onMsg(pu.type.label); ui.onExpr("grin");
          if (pu.type.k === "repair") player.hull = Math.min(100, player.hull + 45);
          if (pu.type.k === "shield") player.shields = 60;
          if (pu.type.k === "boost") { player.boost = 100; player.nitro = 4; }
        }
      });
    }

    // respawn giocatore
    if (!player.alive && RESPAWN && player.respawnT > 0) {
      player.respawnT -= dt;
      if (player.respawnT <= 0) {
        player.alive = true; player.mesh.visible = true; player.inv = 2.4;
        player.shields = 60; player.hull = 55; player.speed = 100; player.heat = 0; player.hot = false;
        const gi = ((player.gateIdx - 1) % NG + NG) % NG;
        const g = gates[gi];
        player.mesh.position.copy(g.pos);
        const tan = curve.getTangentAt(g.t);
        player.yaw = Math.atan2(-tan.x, -tan.z); player.pitch = 0; player.yawVel = 0;
        player.t = g.t;
      }
    }

    /* --- IA --- */
    racers.forEach(r => {
      if (r.isPlayer) return;
      if (!r.alive) {
        if (RESPAWN && r.respawnT > 0) {
          r.respawnT -= dt;
          if (r.respawnT <= 0) { r.alive = true; r.mesh.visible = true; r.inv = 2; r.shields = 60; r.hull = 70; }
        }
        return;
      }
      if (!racing) return;
      r.inv = Math.max(0, r.inv - dt);
      r.mesh.visible = r.inv <= 0 || Math.floor(elapsed * 10) % 2 === 0;

      const diff = player.alive ? progressOf(player) - progressOf(r) : 0;
      const sp = r.curSpeed = r.base + THREE.MathUtils.clamp(diff * 45, -DF.rubber, DF.rubber);
      const pT = r.t;
      r.t += (sp / len) * dt;
      if (r.t >= 1) { r.t -= 1; r.lapsDone++; }

      const p = curve.getPointAt(r.t), tan = curve.getTangentAt(r.t);
      const side = tmpV.crossVectors(tan, UP).normalize().clone();
      const vert = new THREE.Vector3().crossVectors(side, tan).normalize();
      const wob = Math.sin(elapsed * r.wf + r.phase) * 3.5;
      r.mesh.position.copy(p).addScaledVector(side, r.lat + wob).addScaledVector(vert, r.voff + Math.cos(elapsed * r.wf * 0.7 + r.phase) * 2);
      if (!r.mesh.userData.sprite) r.mesh.lookAt(r.mesh.position.clone().add(tan));
      if (r.mesh.userData.glow) r.mesh.userData.glow.scale.setScalar(3 + sp * 0.03);

      if (elapsed - r.lastHitT > 3) r.shields = Math.min(60, r.shields + 5 * dt);

      // pickup IA
      pickups.forEach(pu => {
        if (!pu.active) return;
        if (r.mesh.position.distanceTo(pu.pos) < 7) {
          pu.active = false; pu.respawn = 12; pu.mesh.visible = false;
          if (pu.type.k === "repair") r.hull = Math.min(100, r.hull + 45);
          if (pu.type.k === "shield") r.shields = 60;
        }
      });

      // fuoco IA
      r.fireCd -= dt;
      if (r.fireCd <= 0 && phase === "race") {
        const tgt = pickTarget(r);
        if (tgt) {
          const to = getPos(tgt).clone().sub(r.mesh.position);
          const d = to.length();
          if (d < 340 && to.normalize().dot(tan) > 0.78) {
            to.x += (Math.random() - 0.5) * 0.07; to.y += (Math.random() - 0.5) * 0.07; to.z += (Math.random() - 0.5) * 0.07;
            to.normalize();
            fireLaser(r, r.mesh.position.clone().addScaledVector(to, 6), to, DF.aiDmg, r.color);
            audio.enemyLaser();
            r.fireCd = DF.fireCd * (0.7 + Math.random() * 0.7);
          } else r.fireCd = 0.25;
        } else r.fireCd = 0.5;
      }

      if (RACEMODE && !r.finished && r.lapsDone >= MD.laps) {
        r.finished = true; r.finishTime = elapsed;
        throttleMsg(r.name + " ha tagliato il traguardo");
      }
    });

    /* --- laser --- */
    for (let i = lasers.length - 1; i >= 0; i--) {
      const L = lasers[i];
      L.ttl -= dt;
      L.mesh.position.addScaledVector(L.vel, dt);
      let dead = L.ttl <= 0;
      if (!dead) {
        for (const r of racers) {
          if (!r.alive || r === L.owner) continue;
          if (L.mesh.position.distanceTo(getPos(r)) < 6.5) {
            damage(r, L.dmg, L.owner);
            burst(L.mesh.position, 5, new THREE.Color(L.mesh.material.color.getHex()), 25);
            const hitPos = L.mesh.position.clone();
            if (L.owner.isPlayer) {
              const flashMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffdd00, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
              const flash = new THREE.Sprite(flashMat); flash.position.copy(hitPos); flash.scale.setScalar(22); scene.add(flash);
              const ringMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffffff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
              const ring = new THREE.Sprite(ringMat); ring.position.copy(hitPos); ring.scale.setScalar(6); scene.add(ring);
              impactEffects.push({ flash, flashMat, ring, ringMat, t: 0, big: true });
              ui.onHitMsg("HIT — " + r.name.toUpperCase());
              if (navigator.vibrate) navigator.vibrate(60);
            } else {
              const flashMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffaa33, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
              const flash = new THREE.Sprite(flashMat); flash.position.copy(hitPos); flash.scale.setScalar(14); scene.add(flash);
              const ringMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffffff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
              const ring = new THREE.Sprite(ringMat); ring.position.copy(hitPos); ring.scale.setScalar(6); scene.add(ring);
              impactEffects.push({ flash, flashMat, ring, ringMat, t: 0, big: false });
            }
            dead = true; break;
          }
        }
      }
      if (dead) {
        scene.remove(L.mesh); L.mesh.material.dispose();
        lasers.splice(i, 1);
      }
    }

    /* --- impatto laser: flash + shockwave --- */
    for (let i = impactEffects.length - 1; i >= 0; i--) {
      const fx = impactEffects[i];
      fx.t += dt;
      if (fx.big) {
        if (fx.t < 0.08) {
          fx.flash.scale.setScalar(22 + 16 * (fx.t / 0.08));
          fx.flashMat.opacity = 1;
        } else {
          fx.flash.scale.setScalar(38);
          fx.flashMat.opacity = Math.max(0, 1 - (fx.t - 0.08) / 0.10);
        }
        const rp = Math.min(fx.t / 0.18, 1);
        fx.ring.scale.setScalar(6 + 26 * rp);
        fx.ringMat.opacity = 1 - rp;
        if (fx.t >= 0.18) { scene.remove(fx.flash); fx.flashMat.dispose(); scene.remove(fx.ring); fx.ringMat.dispose(); impactEffects.splice(i, 1); }
      } else {
        const p = Math.min(fx.t / 0.12, 1);
        fx.flashMat.opacity = 1 - p;
        fx.ringMat.opacity = 0.6 * (1 - p);
        fx.ring.scale.setScalar(6 + 8 * p);
        if (fx.t >= 0.15) { scene.remove(fx.flash); fx.flashMat.dispose(); scene.remove(fx.ring); fx.ringMat.dispose(); impactEffects.splice(i, 1); }
      }
    }

    /* --- pickup respawn + spin --- */
    pickups.forEach(pu => {
      if (!pu.active) {
        pu.respawn -= dt;
        if (pu.respawn <= 0) { pu.active = true; pu.mesh.visible = true; }
      }
      pu.mesh.rotation.y += dt * 2.2;
      pu.mesh.position.y = pu.pos.y + Math.sin(elapsed * 2 + pu.pos.x) * 1.2;
    });

    /* --- particelle --- */
    for (let i = 0; i < PMAX; i++) {
      if (pLife[i] <= 0) continue;
      pLife[i] -= dt;
      if (pLife[i] <= 0) { pPos[i * 3 + 1] = -99999; continue; }
      pPos[i * 3] += pVel[i * 3] * dt;
      pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
      pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;

    /* --- porta successiva evidenziata --- */
    if (RACEMODE) {
      gates.forEach((g, i) => {
        const isNext = i === player.gateIdx % NG;
        g.mesh.scale.setScalar(isNext ? 1 + 0.08 * Math.sin(elapsed * 6) : 1);
        g.mesh.material.color.setHex(isNext ? 0x9fe8ff : (i === 0 ? 0xffffff : 0x2580d0));
      });
    }

    /* --- fine modalità --- */
    if (phase === "race") {
      if (RACEMODE && player.finished === false && player.lapsDone >= MD.laps) {
        player.finished = true; player.finishTime = elapsed;
        phase = "finished"; overT = 2.0;
        ui.onMsg(posOf(player) === 1 ? "🏆 VITTORIA!" : "🏁 TRAGUARDO!");
        ui.onExpr("grin");
      }
      if (ARENA) {
        const alive = racers.filter(r => r.alive);
        if (alive.length <= 1) {
          phase = "finished"; overT = 1.6;
          if (alive[0] === player) { ui.onMsg("🏆 ULTIMO IN VOLO!"); ui.onExpr("grin"); }
        }
      }
      if (TIMED) {
        timer -= dt;
        if (timer <= 0) {
          timer = 0; phase = "finished"; overT = 1.4;
          if (player.alive) { ui.onMsg("🏆 SOPRAVVISSUTO!"); ui.onExpr("grin"); }
        }
      }
    }

    /* --- camera --- */
    shake = Math.max(0, shake - dt * 2.2);
    const cp2 = Math.cos(player.pitch);
    fwdV.set(-Math.sin(player.yaw) * cp2, Math.sin(player.pitch), -Math.cos(player.yaw) * cp2);
    tmpV.copy(getPos(player)).addScaledVector(fwdV, -14);
    tmpV.y += 4.8;
    camera.position.lerp(tmpV, 1 - Math.exp(-7 * dt));
    if (shake > 0) {
      camera.position.x += (Math.random() - 0.5) * shake * 1.6;
      camera.position.y += (Math.random() - 0.5) * shake * 1.6;
    }
    tmpV.copy(getPos(player)).addScaledVector(fwdV, 24);
    camera.lookAt(tmpV);

    // FOV dinamico: a tutta velocità il campo visivo si allarga (sensazione di velocità)
    const fovT = THREE.MathUtils.clamp(70 + player.speed * 0.16, 78, 108);
    if (Math.abs(camera.fov - fovT) > 0.05) {
      camera.fov += (fovT - camera.fov) * Math.min(1, dt * 6);
      camera.updateProjectionMatrix();
    }

    // star-warp: stelle si avvicinano alla camera quando speed > 130
    if (player.speed > 130) {
      const warpF = 0.4 * (player.speed / 145);
      const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
      for (let i = 0; i < STAR_N; i++) {
        const sx = starPos[i*3] - cx, sy = starPos[i*3+1] - cy, sz = starPos[i*3+2] - cz;
        const d2 = sx*sx + sy*sy + sz*sz;
        if (d2 < 400*400) {
          const r = 2000 + Math.random() * 1400, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
          starPos[i*3] = cx + r * Math.sin(ph) * Math.cos(th);
          starPos[i*3+1] = cy + r * Math.cos(ph);
          starPos[i*3+2] = cz + r * Math.sin(ph) * Math.sin(th);
        } else {
          const d = Math.sqrt(d2);
          starPos[i*3] -= (sx / d) * warpF;
          starPos[i*3+1] -= (sy / d) * warpF;
          starPos[i*3+2] -= (sz / d) * warpF;
        }
      }
      starGeo.attributes.position.needsUpdate = true;
      starMat.size = 3.5;
    } else {
      starMat.size = 2;
    }

    // polvere: ricicla i puntini davanti al giocatore
    for (let i = 0; i < DUST; i++) {
      const dx = dustPos[i * 3] - player.mesh.position.x;
      const dy = dustPos[i * 3 + 1] - player.mesh.position.y;
      const dz = dustPos[i * 3 + 2] - player.mesh.position.z;
      if (dx * dx + dy * dy + dz * dz > 60000) {
        dustPos[i * 3] = player.mesh.position.x + fwdV.x * 200 + (Math.random() - 0.5) * 260;
        dustPos[i * 3 + 1] = player.mesh.position.y + fwdV.y * 200 + (Math.random() - 0.5) * 260;
        dustPos[i * 3 + 2] = player.mesh.position.z + fwdV.z * 200 + (Math.random() - 0.5) * 260;
      }
    }
    dustGeo.attributes.position.needsUpdate = true;

    // Mirino: lerp verso centro + auto-aim (screen-space) + notifica UI a 60fps
    {
      const fac = Math.min(1, dt * 3.6);
      mirRef.current.x += (0 - mirRef.current.x) * fac;
      mirRef.current.y += (0 - mirRef.current.y) * fac;
      camera.updateMatrixWorld();
      const CW = W(), CH = H();
      const aimFwdX = -Math.sin(player.yaw), aimFwdZ = -Math.cos(player.yaw);
      const pPos = getPos(player);
      let bestD = 60, bestX = mirRef.current.x, bestY = mirRef.current.y, aimLocked = false;
      let nextLocked = null;
      if (player.alive) {
        for (const r of racers) {
          if (!r.alive || r.isPlayer) continue;
          const rPos = getPos(r);
          const ex = rPos.x - pPos.x, ey = rPos.y - pPos.y, ez = rPos.z - pPos.z;
          if (ex * ex + ey * ey + ez * ez > 320 * 320) continue;
          const exzLen = Math.sqrt(ex * ex + ez * ez);
          if (exzLen > 0.001 && (ex / exzLen * aimFwdX + ez / exzLen * aimFwdZ) < 0.82) continue;
          projV.copy(rPos).project(camera);
          if (projV.z >= 1) continue;
          const sx = projV.x * (CW / 2), sy = -projV.y * (CH / 2);
          const d = Math.sqrt((sx - mirRef.current.x) ** 2 + (sy - mirRef.current.y) ** 2);
          if (d < bestD) { bestD = d; bestX = sx; bestY = sy; nextLocked = r; }
        }
      }
      lockedTarget = nextLocked;
      if (nextLocked) {
        mirRef.current.x += (bestX - mirRef.current.x) * 0.42;
        mirRef.current.y += (bestY - mirRef.current.y) * 0.42;
        aimLocked = true;
      }
      mirRef.current.x = Math.max(-120, Math.min(120, mirRef.current.x));
      mirRef.current.y = Math.max(-80, Math.min(80, mirRef.current.y));
      ui.onMirPos(mirRef.current.x, mirRef.current.y, aimLocked);
    }

    audio.engine(player.speed, player.alive && racing, !!player.boosting, player.yawVel);
  }

  function pushHud() {
    const dots = racers.filter(r => r.alive).map(r => {
      const [x, y] = nrm(getPos(r));
      return { x, y, c: "#" + r.color.toString(16).padStart(6, "0"), p: !!r.isPlayer };
    });
    ui.onHud({
      count: phase === "count" ? Math.max(0, Math.ceil(cT)) : 0,
      paused,
      racemode: RACEMODE, timed: TIMED, arena: ARENA,
      pos: posOf(player), total: racers.length,
      lap: Math.min(player.lapsDone + 1, MD.laps || 1), laps: MD.laps,
      timer: Math.ceil(timer),
      alive: racers.filter(r => r.alive).length,
      shields: player.shields, hull: player.hull,
      boost: player.boost, heat: player.heat, hot: player.hot,
      nitro: player.nitro > 0,
      speed: Math.round(player.speed * 9),
      boosting: !!player.boosting,
      kills: player.kills,
      dots,
    });
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!paused && !ended) update(dt);
    hudAcc += dt;
    if (hudAcc > 0.1) { hudAcc = 0; pushHud(); }
    renderer.render(scene, camera);
  }
  pushHud();
  loop();

  /* ------ cleanup ------ */
  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", onResize);
    audio.dispose();
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material.dispose(); }
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  };
}

/* ============================ UI REACT ============================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@500;600;700&display=swap');
.wr-root{position:fixed;inset:0;background:#04050c;color:#cfe7ff;font-family:'Rajdhani',ui-sans-serif,system-ui,sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none;}
.wr-disp{font-family:'Orbitron','Rajdhani',sans-serif;letter-spacing:.08em;}
.wr-screen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;overflow-y:auto;}
.wr-bgfx{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(45,90,200,.28),transparent 60%),radial-gradient(ellipse 60% 50% at 80% 110%,rgba(120,40,200,.18),transparent 60%);pointer-events:none;}
.wr-title{font-size:clamp(34px,7vw,76px);font-weight:900;background:linear-gradient(180deg,#eaf6ff 20%,#4fc3f7 65%,#1565c0);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 38px rgba(79,195,247,.45);margin:6px 0 0;text-align:center;}
.wr-sub{font-size:clamp(13px,2.2vw,19px);letter-spacing:.5em;color:#7fb6e8;text-transform:uppercase;margin:2px 0 0;text-align:center;}
.wr-btn{font-family:'Orbitron',sans-serif;font-weight:800;letter-spacing:.15em;font-size:17px;color:#04111f;background:linear-gradient(180deg,#9fe0ff,#4fc3f7);border:none;border-radius:8px;padding:14px 42px;cursor:pointer;box-shadow:0 0 24px rgba(79,195,247,.55),inset 0 1px 0 rgba(255,255,255,.6);transition:transform .12s, box-shadow .12s;}
.wr-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 0 36px rgba(79,195,247,.85);}
.wr-btn.sec{background:transparent;color:#9fd6ff;border:1px solid #2f6da8;box-shadow:none;}
.wr-cards{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:980px;}
.wr-card{flex:1 1 200px;max-width:230px;background:rgba(10,20,38,.85);border:1px solid #1d3a5c;border-radius:10px;padding:14px;cursor:pointer;transition:border-color .12s, box-shadow .12s, transform .12s;}
.wr-card:hover{transform:translateY(-2px);}
.wr-card.sel{border-color:#4fc3f7;box-shadow:0 0 18px rgba(79,195,247,.35), inset 0 0 24px rgba(79,195,247,.08);}
.wr-card h4{margin:0 0 6px;font-family:'Orbitron',sans-serif;font-size:14px;letter-spacing:.1em;color:#bfe6ff;}
.wr-card p{margin:0;font-size:13px;line-height:1.35;color:#8fb3d6;}
.wr-label{font-family:'Orbitron',sans-serif;font-size:12px;letter-spacing:.35em;color:#5d93c4;text-transform:uppercase;margin:22px 0 10px;}
.wr-hud{position:absolute;inset:0;pointer-events:none;font-weight:600;}
.wr-chip{background:rgba(5,12,24,.72);border:1px solid #1d3a5c;border-radius:8px;padding:8px 14px;backdrop-filter:blur(3px);}
.wr-big{font-family:'Orbitron',sans-serif;font-size:26px;font-weight:800;color:#eaf6ff;line-height:1;}
.wr-small{font-size:11px;letter-spacing:.25em;color:#6fa3cf;text-transform:uppercase;}
.wr-bar{height:9px;border-radius:5px;background:#0c1830;overflow:hidden;border:1px solid #1d3a5c;margin-top:3px;}
.wr-bar>div{height:100%;border-radius:5px;transition:width .12s linear;}
.wr-msg{position:absolute;top:21%;left:0;right:0;text-align:center;font-family:'Orbitron',sans-serif;font-size:clamp(18px,3.4vw,32px);font-weight:800;color:#fff;text-shadow:0 0 22px rgba(79,195,247,.9);animation:wrpop .25s ease-out;}
@keyframes wrpop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
.wr-count{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-size:clamp(80px,18vw,180px);font-weight:900;color:#eaf6ff;text-shadow:0 0 60px rgba(79,195,247,.9);}
.wr-touch{position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:space-between;padding:0 16px;pointer-events:none;}
.wr-tbtn{pointer-events:auto;width:62px;height:62px;border-radius:50%;border:1px solid #2f6da8;background:rgba(10,22,40,.6);color:#9fd6ff;font-size:22px;display:flex;align-items:center;justify-content:center;touch-action:none;}
.wr-tbtn.big{width:78px;height:78px;font-size:14px;font-family:'Orbitron',sans-serif;font-weight:800;}
.wr-table{border-collapse:collapse;width:min(620px,92vw);background:rgba(8,16,32,.85);border:1px solid #1d3a5c;border-radius:12px;overflow:hidden;}
.wr-table th{font-family:'Orbitron',sans-serif;font-size:11px;letter-spacing:.2em;color:#5d93c4;padding:10px 12px;border-bottom:1px solid #1d3a5c;text-align:left;}
.wr-table td{padding:9px 12px;border-bottom:1px solid #10233c;font-size:15px;}
.wr-table tr.me{background:rgba(79,195,247,.12);}
.wr-hint{font-size:13px;color:#6fa3cf;max-width:640px;text-align:center;line-height:1.5;}
.wr-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;align-items:center;}
.wr-mir{position:absolute;pointer-events:none;}
.wr-mir-lock svg{animation:mirpulse 0.26s ease-in-out infinite alternate;}
@keyframes mirpulse{from{transform:scale(1);opacity:0.85}to{transform:scale(1.16);opacity:1}}
`;

function ShipIcon({ size = 90, accent = "#4fc3f7" }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60">
      <path d="M50 4 L57 25 L96 49 L90 56 L59 40 L54 55 L50 49 L46 55 L41 40 L10 56 L4 49 L43 25 Z"
        fill="#262d38" stroke={accent} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="50" cy="46" r="3.4" fill={accent} />
      <circle cx="43" cy="48" r="2.1" fill={accent} opacity="0.8" />
      <circle cx="57" cy="48" r="2.1" fill={accent} opacity="0.8" />
    </svg>
  );
}

function Portrait({ expr = "idle", size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: 10, background: "#0a1220", border: "1px solid #1d3a5c", flex: "none" }}>
      <path d="M12 100 L19 72 Q50 61 81 72 L88 100 Z" fill="#3c434d" stroke="#262b33" strokeWidth="2" />
      <rect x="30" y="78" width="14" height="9" rx="2" fill="#39ff7a" opacity="0.85" />
      <circle cx="72" cy="80" r="5" fill="#22324a" stroke="#4fc3f7" strokeWidth="1.4" />
      <rect x="44" y="60" width="12" height="12" fill="#e8b39a" />
      <ellipse cx="50" cy="40" rx="19" ry="23" fill="#6fa8e0" />
      <path d="M30 34 Q33 16 50 14 Q68 15 70 33 L64 28 L58 33 L50 24 L43 32 L36 27 Z" fill="#15181d" />
      {expr === "hit" ? (
        <g stroke="#1c2a40" strokeWidth="2.6" strokeLinecap="round">
          <path d="M39 38 l7 6 M46 38 l-7 6" /><path d="M54 38 l7 6 M61 38 l-7 6" />
          <ellipse cx="50" cy="53" rx="5" ry="3.5" fill="#1c2a40" stroke="none" />
        </g>
      ) : expr === "grin" ? (
        <g>
          <ellipse cx="43" cy="40" rx="2.6" ry="3.4" fill="#1c2a40" />
          <ellipse cx="57" cy="40" rx="2.6" ry="3.4" fill="#1c2a40" />
          <path d="M41 50 Q50 58 59 50" stroke="#1c2a40" strokeWidth="2.4" fill="#fff" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <ellipse cx="43" cy="40" rx="2.4" ry="3.2" fill="#1c2a40" />
          <ellipse cx="57" cy="40" rx="2.4" ry="3.2" fill="#1c2a40" />
          <path d="M44 52 Q51 55 58 51" stroke="#1c2a40" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

function PilotFace({ expr = "idle", size = 64, photo }) {
  if (!photo) return <Portrait expr={expr} size={size} />;
  return (
    <img src={photo} alt="pilota" width={size} height={size}
      style={{
        borderRadius: 10, objectFit: "cover", border: "1px solid #1d3a5c", flex: "none",
        filter: expr === "hit" ? "saturate(2.2) hue-rotate(-45deg) brightness(1.35)"
          : expr === "grin" ? "brightness(1.18) drop-shadow(0 0 7px #4fc3f7)"
          : "none",
        transition: "filter .15s",
      }} />
  );
}

function processShipImage(img) {
  try {
    const S = 512;
    const c = document.createElement("canvas"); c.width = c.height = S;
    const g = c.getContext("2d");
    const m = Math.min(img.width, img.height);
    g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
    const id = g.getImageData(0, 0, S, S), d = id.data;
    let hasAlpha = false;
    for (let i = 3; i < d.length; i += 256) if (d[i] < 250) { hasAlpha = true; break; }
    if (!hasAlpha) {
      // PNG opaco: chroma-key sul colore di sfondo campionato ai 4 angoli
      const ck = k => [d[k], d[k + 1], d[k + 2]];
      const cs = [ck(0), ck((S - 1) * 4), ck(S * (S - 1) * 4), ck((S * S - 1) * 4)];
      const bg = [0, 1, 2].map(j => (cs[0][j] + cs[1][j] + cs[2][j] + cs[3][j]) / 4);
      for (let i = 0; i < d.length; i += 4) {
        const dist = Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
        if (dist < 70) d[i + 3] = 0;
        else if (dist < 150) d[i + 3] = Math.round(255 * (dist - 70) / 80);
      }
      g.putImageData(id, 0, 0);
    }
    return c.toDataURL("image/png");
  } catch (e) { return null; }
}

function VideoGate({ src, label, onDone }) {
  return (
    <div className="wr-screen" style={{ padding: 0, background: "#000" }}>
      <video src={src} autoPlay playsInline onEnded={onDone} onError={onDone}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {label ? <div className="wr-sub wr-disp" style={{ position: "absolute", top: 26, left: 0, right: 0, zIndex: 2 }}>{label}</div> : null}
      <button className="wr-btn sec" style={{ position: "absolute", bottom: 26, right: 26, zIndex: 2 }} onClick={onDone}>SALTA ▸</button>
    </div>
  );
}

function Bar({ v, max, color, danger }) {
  const pct = Math.max(0, Math.min(100, (v / max) * 100));
  return (
    <div className="wr-bar">
      <div style={{ width: pct + "%", background: danger && pct < 30 ? "#ff5252" : color, boxShadow: "0 0 8px " + color }} />
    </div>
  );
}

export default function WisiRacer() {
  const [screen, setScreen] = useState("title");
  const [modeKey, setModeKey] = useState("grand_prix");
  const [trackKey, setTrackKey] = useState("nebula");
  const [diffKey, setDiffKey] = useState("pilot");
  const [hud, setHud] = useState(null);
  const [msg, setMsg] = useState(null);
  const [results, setResults] = useState(null);
  const [trackMap, setTrackMap] = useState(null);
  const [expr, setExpr] = useState("idle");
  const [assets, setAssets] = useState({ ship: null, pilot: null, bgs: {} });
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  const [vids, setVids] = useState({});
  const mountRef = useRef(null);
  const mapRef = useRef(null);
  const keysRef = useRef({ left: 0, right: 0, up: 0, down: 0, boost: 0, fire: 0, brake: 0, gyroSteer: 0, gyroActive: false });
  const msgTimer = useRef(null);
  const exprTimer = useRef(null);
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;
  const gyroRef = useRef({ filteredBeta: null, betaRef: null, calibSamples: [], calibDone: false, calibStart: null });
  const gyroEnabledRef = useRef(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const hitFlashTimer = useRef(null);
  const [hitMsg, setHitMsg] = useState(null);
  const hitMsgTimer = useRef(null);
  const trackKeys = Object.keys(TRACKS);
  const [slideIdx, setSlideIdx] = useState(0);
  const slideRef = useRef(0);
  const mirRef = useRef({ x: 0, y: 0 });
  const crosshairElRef = useRef(null);

  // Preloader automatico: cerca gli asset in /assets e usa quelli che trova
  useEffect(() => {
    let dead = false;
    const probeImg = src => new Promise(res => {
      const im = new Image();
      im.onload = () => res(im); im.onerror = () => res(null);
      im.src = src;
    });
    (async () => {
      const [shipIm, pilotIm, bgN, bgR] = await Promise.all([
        probeImg(ASSET_PATHS.ship), probeImg(ASSET_PATHS.pilot),
        probeImg(TRACKS.nebula.bgImg), probeImg(TRACKS.ringworld.bgImg),
      ]);
      if (dead) return;
      setAssets({
        ship: shipIm ? processShipImage(shipIm) : null,
        pilot: pilotIm ? ASSET_PATHS.pilot : null,
        bgs: {
          nebula: bgN ? TRACKS.nebula.bgImg : null,
          ringworld: bgR ? TRACKS.ringworld.bgImg : null,
        },
      });
      setVids({
        nebula:    { intro: false, outro: false },
        ringworld: { intro: false, outro: false },
      });
    })();
    return () => { dead = true; };
  }, []);

  useEffect(() => {
    if (screen !== "race") return;
    Object.keys(keysRef.current).forEach(k => (keysRef.current[k] = 0));
    keysRef.current.gyroActive = false;
    keysRef.current.gyroSteer = 0;
    const ui = {
      onHud: h => setHud(h),
      onMsg: m => {
        setMsg(m);
        clearTimeout(msgTimer.current);
        msgTimer.current = setTimeout(() => setMsg(null), 1900);
      },
      onExpr: e => {
        setExpr(e);
        clearTimeout(exprTimer.current);
        exprTimer.current = setTimeout(() => setExpr("idle"), 800);
      },
      onHit: () => {
        setHitFlash(true);
        clearTimeout(hitFlashTimer.current);
        hitFlashTimer.current = setTimeout(() => setHitFlash(false), 220);
        if (navigator.vibrate) navigator.vibrate([80, 30, 80]);
      },
      onHitMsg: text => {
        setHitMsg(text);
        clearTimeout(hitMsgTimer.current);
        hitMsgTimer.current = setTimeout(() => setHitMsg(null), 600);
      },
      onTrackMap: pts => setTrackMap(pts),
      onEnd: rows => {
        setResults(rows);
        const v = vids[trackKey];
        setScreen(v && v.outro ? "outro" : "results");
      },
      onMirPos: (x, y, locked) => {
        const el = crosshairElRef.current;
        if (!el) return;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.color = locked ? "#ff4444" : "#4fc3f7";
        el.className = locked ? "wr-mir wr-mir-lock" : "wr-mir";
      },
    };
    mirRef.current = { x: 0, y: 0 };
    const cleanup = initGame(mountRef.current, {
      track: trackKey, mode: modeKey, diff: diffKey, keys: keysRef.current,
      assets: { ship: assetsRef.current.ship, bg: assetsRef.current.bgs ? assetsRef.current.bgs[trackKey] : null },
      mirRef,
    }, ui);

    // Mouse (desktop): mirino segue il cursore, click sinistro = fuoco
    const onMouseMove = e => {
      const rect = mountRef.current ? mountRef.current.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      mirRef.current.x = Math.max(-120, Math.min(120, e.clientX - (rect.left + rect.width / 2)));
      mirRef.current.y = Math.max(-80, Math.min(80, e.clientY - (rect.top + rect.height / 2)));
    };
    const onMouseDown = e => { if (e.button === 0) keysRef.current.fire = 1; };
    const onMouseUp   = e => { if (e.button === 0) keysRef.current.fire = 0; };
    if (!isTouch) {
      const el = mountRef.current;
      if (el) { el.addEventListener("mousemove", onMouseMove); el.addEventListener("mousedown", onMouseDown); el.addEventListener("mouseup", onMouseUp); }
    }

    // Touch (mobile): zona destra (x > 40%) = drag mirino
    let aimTouchId = null, aimBase = { x: 0, y: 0, mx: 0, my: 0 };
    const onTouchStart = e => {
      const W = window.innerWidth;
      for (const t of e.changedTouches) {
        if (t.clientX > W * 0.4 && aimTouchId === null) {
          aimTouchId = t.identifier;
          aimBase = { x: t.clientX, y: t.clientY, mx: mirRef.current.x, my: mirRef.current.y };
        }
      }
    };
    const onTouchMove = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === aimTouchId) {
          mirRef.current.x = Math.max(-120, Math.min(120, aimBase.mx + t.clientX - aimBase.x));
          mirRef.current.y = Math.max(-80, Math.min(80, aimBase.my + t.clientY - aimBase.y));
        }
      }
    };
    const onTouchEnd = e => { for (const t of e.changedTouches) { if (t.identifier === aimTouchId) aimTouchId = null; } };
    if (isTouch) {
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    }

    let gyroCleanup = null;
    if (isTouch && gyroEnabledRef.current) {
      const gyro = gyroRef.current;
      gyro.filteredBeta = null;
      gyro.betaRef = null;
      gyro.calibSamples = [];
      gyro.calibDone = false;
      gyro.calibStart = null;

      const onOrientation = (e) => {
        if (e.beta === null) return;
        const now = performance.now() / 1000;
        if (gyro.filteredBeta === null) gyro.filteredBeta = e.beta;
        gyro.filteredBeta = 0.75 * gyro.filteredBeta + 0.25 * e.beta;
        if (!gyro.calibDone) {
          if (gyro.calibStart === null) gyro.calibStart = now;
          gyro.calibSamples.push(gyro.filteredBeta);
          if (now - gyro.calibStart >= 2) {
            gyro.betaRef = gyro.calibSamples.reduce((a, b) => a + b, 0) / gyro.calibSamples.length;
            gyro.calibDone = true;
          }
        }
        const tilt = gyro.calibDone ? (gyro.filteredBeta - gyro.betaRef) : 0;
        const DEAD = 4, MAX = 26;
        let steer = 0;
        if (Math.abs(tilt) > DEAD) {
          steer = Math.max(-1, Math.min(1, (Math.abs(tilt) - DEAD) / (MAX - DEAD))) * Math.sign(tilt);
        }
        keysRef.current.gyroSteer = steer;
      };

      window.addEventListener("deviceorientation", onOrientation);
      keysRef.current.gyroActive = true;
      setGyroActive(true);

      gyroCleanup = () => {
        window.removeEventListener("deviceorientation", onOrientation);
        keysRef.current.gyroActive = false;
        keysRef.current.gyroSteer = 0;
        setGyroActive(false);
      };
    }

    return () => {
      cleanup();
      if (gyroCleanup) gyroCleanup();
      clearTimeout(msgTimer.current);
      clearTimeout(exprTimer.current);
      clearTimeout(hitFlashTimer.current);
      clearTimeout(hitMsgTimer.current);
      if (!isTouch) {
        const el = mountRef.current;
        if (el) { el.removeEventListener("mousemove", onMouseMove); el.removeEventListener("mousedown", onMouseDown); el.removeEventListener("mouseup", onMouseUp); }
      }
      if (isTouch) {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchEnd);
      }
    };
  }, [screen]);

  // minimappa
  useEffect(() => {
    const c = mapRef.current;
    if (!c || !trackMap || !hud || !hud.dots) return;
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    g.strokeStyle = "rgba(79,195,247,0.55)"; g.lineWidth = 2; g.beginPath();
    trackMap.forEach((p, i) => (i ? g.lineTo(p[0] * c.width, p[1] * c.height) : g.moveTo(p[0] * c.width, p[1] * c.height)));
    g.closePath(); g.stroke();
    hud.dots.forEach(d => {
      g.fillStyle = d.c; g.beginPath();
      g.arc(d.x * c.width, d.y * c.height, d.p ? 4.5 : 3, 0, 7); g.fill();
      if (d.p) { g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.stroke(); }
    });
  }, [hud, trackMap]);

  const touch = (k) => ({
    onPointerDown: e => { e.preventDefault(); keysRef.current[k] = 1; },
    onPointerUp: () => { keysRef.current[k] = 0; },
    onPointerLeave: () => { keysRef.current[k] = 0; },
    onContextMenu: e => e.preventDefault(),
  });

  const startRace = async () => {
    if (isTouch && typeof DeviceOrientationEvent !== "undefined") {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          gyroEnabledRef.current = perm === "granted";
        } catch (e) {
          gyroEnabledRef.current = false;
        }
      } else {
        gyroEnabledRef.current = true;
      }
    }
    setResults(null);
    const v = vids[trackKey];
    setScreen(v && v.intro ? "intro" : "race");
  };

  const playerRow = results && results.find(r => r.isPlayer);

  return (
    <div className="wr-root">
      <style>{CSS}</style>

      {screen === "title" && (
        <div className="wr-screen">
          <div className="wr-bgfx" />
          <ShipIcon size={150} />
          <h1 className="wr-title wr-disp">WISIRACER</h1>
          <p className="wr-sub wr-disp">Starfighter Grand Prix</p>
          <div style={{ height: 36 }} />
          <button className="wr-btn" onClick={() => setScreen("setup")}>INIZIA</button>
          <div style={{ height: 26 }} />
          <p className="wr-hint">Corri, spara, sopravvivi. Un gioco WiSiVERSE.</p>
        </div>
      )}

      {screen === "setup" && (
        <div className="wr-screen" style={{ justifyContent: "flex-start", paddingTop: 34 }}>
          <div className="wr-bgfx" />
          <div className="wr-row" style={{ gap: 18 }}>
            <PilotFace size={74} expr="idle" photo={assets.pilot} />
            <div>
              <div className="wr-disp" style={{ fontSize: 22, fontWeight: 800, color: "#eaf6ff" }}>Pilota "BLU"</div>
              <div style={{ fontSize: 13, color: "#7fb6e8" }}>W-Shaped Starfighter · Squadrone Aquila</div>
            </div>
            <ShipIcon size={104} />
          </div>

          <div className="wr-label wr-disp">Modalità</div>
          <div className="wr-cards">
            {Object.entries(MODES).map(([k, m]) => (
              <div key={k} className={"wr-card" + (modeKey === k ? " sel" : "")} onClick={() => setModeKey(k)}>
                <h4>{m.icon} {m.label}</h4>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="wr-label wr-disp">Circuito</div>
          <div style={{position:'relative',width:'100%',maxWidth:700,margin:'0 auto',borderRadius:14,overflow:'hidden',height:270,background:'#060e1a',border:'1px solid #1d3a5c',flexShrink:0}}
            onTouchStart={e => { slideRef.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const dx = e.changedTouches[0].clientX - (slideRef.current||0);
              if (dx < -50) { const i=(slideIdx+1)%trackKeys.length; setSlideIdx(i); setTrackKey(trackKeys[i]); }
              if (dx > 50)  { const i=(slideIdx-1+trackKeys.length)%trackKeys.length; setSlideIdx(i); setTrackKey(trackKeys[i]); }
            }}>
            {console.log('SLIDE BGImg:', TRACKS[trackKeys[slideIdx]].bgImg, 'assets.bgs:', assets.bgs[trackKeys[slideIdx]])||null}
            <img src={TRACKS[trackKeys[slideIdx]].bgImg} alt=""
              style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0}}
              onError={e=>console.log('IMG ERROR', e.target.src)} />
            <div style={{position:'absolute',inset:0,zIndex:1,background:`linear-gradient(135deg,#${TRACKS[trackKeys[slideIdx]].bg.toString(16).padStart(6,'0')},#${TRACKS[trackKeys[slideIdx]].fog.toString(16).padStart(6,'0')})`}} />
            <div style={{position:'absolute',inset:0,zIndex:2,background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.1) 55%)'}} />
            <div style={{position:'absolute',bottom:44,left:22,right:22,zIndex:3}}>
              <div style={{fontFamily:'Orbitron,sans-serif',fontSize:24,fontWeight:900,color:'#fff',marginBottom:5,textShadow:'0 2px 12px rgba(0,0,0,0.9)'}}>
                {TRACK_ICONS[trackKeys[slideIdx]]||'🚀'} {TRACKS[trackKeys[slideIdx]].label}
              </div>
              <div style={{fontSize:14,color:'#9fd6ff',textShadow:'0 1px 6px rgba(0,0,0,0.9)'}}>{TRACKS[trackKeys[slideIdx]].desc}</div>
            </div>
            <div style={{position:'absolute',bottom:14,left:0,right:0,display:'flex',justifyContent:'center',gap:7,zIndex:3}}>
              {trackKeys.map((k,i)=>(
                <div key={k} onClick={()=>{setSlideIdx(i);setTrackKey(trackKeys[i]);}}
                  style={{width:i===slideIdx?22:7,height:7,borderRadius:4,background:i===slideIdx?'#4fc3f7':'rgba(255,255,255,0.28)',cursor:'pointer',transition:'all 0.25s'}} />
              ))}
            </div>
            <button onClick={()=>{const i=(slideIdx-1+trackKeys.length)%trackKeys.length;setSlideIdx(i);setTrackKey(trackKeys[i]);}}
              style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:42,height:42,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.22)',background:'rgba(0,0,0,0.52)',color:'#fff',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:4}}>‹</button>
            <button onClick={()=>{const i=(slideIdx+1)%trackKeys.length;setSlideIdx(i);setTrackKey(trackKeys[i]);}}
              style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',width:42,height:42,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.22)',background:'rgba(0,0,0,0.52)',color:'#fff',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:4}}>›</button>
          </div>

          <div className="wr-label wr-disp">Asset grafici</div>
          <p className="wr-hint" style={{ marginTop: -2 }}>
            {assets.ship || assets.pilot || assets.bgs[trackKey]
              ? "📸 Foto trovate in /assets: " + [assets.ship && "navicella", assets.pilot && "pilota", assets.bgs[trackKey] && "sfondo circuito"].filter(Boolean).join(" · ")
              : "Nessuna foto in /assets — grafica procedurale attiva."}
            {" "}I file vanno in public/assets/ (ship.png trasparente, pilot.png, bg_nebula.png, bg_ringworld.png, video intro/outro .mp4) e si caricano da soli.
          </p>

          <div className="wr-label wr-disp">Difficoltà</div>
          <div className="wr-row">
            {Object.entries(DIFFS).map(([k, d]) => (
              <button key={k} className={"wr-btn sec"} onClick={() => setDiffKey(k)}
                style={diffKey === k ? { borderColor: "#4fc3f7", color: "#eaf6ff", boxShadow: "0 0 14px rgba(79,195,247,.4)" } : {}}>
                {d.label}
              </button>
            ))}
          </div>

          <div style={{ height: 26 }} />
          <button className="wr-btn" onClick={startRace}>VIA ALLA GARA 🚀</button>
          <div style={{ height: 18 }} />
          <p className="wr-hint">
            ⌨ Frecce / WASD: vira · SHIFT: boost · SPAZIO: laser · X: freno · ESC: pausa · M: audio on/off
            {isTouch ? " · 📱 Su touch trovi i comandi a schermo." : ""}
          </p>
        </div>
      )}

      {screen === "intro" && (
        <VideoGate src={TRACKS[trackKey].intro} label={MODES[modeKey].label + " · " + TRACKS[trackKey].label} onDone={() => setScreen("race")} />
      )}

      {screen === "outro" && (
        <VideoGate src={TRACKS[trackKey].outro} label="" onDone={() => setScreen("results")} />
      )}

      {screen === "race" && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
          <div className="wr-hud">
            {/* Hit flash overlay */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,0,0,0.45)", opacity: hitFlash ? 1 : 0, transition: "opacity 0.22s", pointerEvents: "none" }} />
            {/* Vignetta motion blur — intensità con la velocità */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: hud ? `inset 0 0 80px rgba(0,0,0,${Math.max(0, Math.min(0.7, (hud.speed / 9 - 120) / 75 * 0.7)).toFixed(3)})` : "none" }} />
            {/* Boost overlay blu */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: hud && hud.boosting ? "inset 0 0 120px rgba(79,195,247,0.25)" : "none", transition: "box-shadow 0.15s" }} />
            {/* Mirino mobile — posizionato via onMirPos direttamente sul DOM */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div ref={crosshairElRef} className="wr-mir" style={{ color: "#4fc3f7", transform: "translate(0px,0px)" }}>
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
                  <line x1="22" y1="2"  x2="22" y2="13" stroke="currentColor" strokeWidth="1.6" />
                  <line x1="22" y1="31" x2="22" y2="42" stroke="currentColor" strokeWidth="1.6" />
                  <line x1="2"  y1="22" x2="13" y2="22" stroke="currentColor" strokeWidth="1.6" />
                  <line x1="31" y1="22" x2="42" y2="22" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
            </div>
            {hud && hud.count > 0 && <div className="wr-count">{hud.count}</div>}
            {msg && <div className="wr-msg">{msg}</div>}
            {hitMsg && <div className="wr-msg" style={{ color: "#ff6644", textShadow: "0 0 18px rgba(255,80,0,.9)", top: "10%", bottom: "auto" }}>{hitMsg}</div>}
            {hud && hud.paused && (
              <div className="wr-count" style={{ fontSize: 42, flexDirection: "column", gap: 10 }}>
                PAUSA<div style={{ fontSize: 14, color: "#7fb6e8", fontFamily: "Rajdhani" }}>premi ESC per riprendere</div>
              </div>
            )}

            {hud && (
              <>
                <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 10 }}>
                  {hud.racemode ? (
                    <>
                      <div className="wr-chip"><div className="wr-small">Posizione</div><div className="wr-big">{hud.pos}<span style={{ fontSize: 14, color: "#6fa3cf" }}>/{hud.total}</span></div></div>
                      <div className="wr-chip"><div className="wr-small">Giro</div><div className="wr-big">{hud.lap}<span style={{ fontSize: 14, color: "#6fa3cf" }}>/{hud.laps}</span></div></div>
                    </>
                  ) : (
                    <>
                      <div className="wr-chip"><div className="wr-small">In volo</div><div className="wr-big">{hud.alive}</div></div>
                      {hud.timed && <div className="wr-chip"><div className="wr-small">Timer</div><div className="wr-big">{hud.timer}s</div></div>}
                      <div className="wr-chip"><div className="wr-small">Abbattuti</div><div className="wr-big">{hud.kills}</div></div>
                    </>
                  )}
                </div>

                <div style={{ position: "absolute", top: 14, right: 14 }} className="wr-chip">
                  <canvas ref={mapRef} width={150} height={120} style={{ display: "block" }} />
                </div>

                <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", gap: 10, alignItems: "flex-end" }}>
                  {!isTouch && <PilotFace expr={expr} size={66} photo={assets.pilot} />}
                  <div className="wr-chip" style={{ width: 170 }}>
                    <div className="wr-small">Scudi</div>
                    <Bar v={hud.shields} max={60} color="#39d2ff" />
                    <div className="wr-small" style={{ marginTop: 6 }}>Scafo</div>
                    <Bar v={hud.hull} max={100} color="#69f06e" danger />
                  </div>
                </div>

                <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div className="wr-chip" style={{ width: 150 }}>
                    <div className="wr-small">{hud.nitro ? "Boost · NITRO!" : "Boost"}</div>
                    <Bar v={hud.boost} max={100} color="#ffd23d" />
                    <div className="wr-small" style={{ marginTop: 6, color: hud.hot ? "#ff5252" : undefined }}>{hud.hot ? "Surriscaldato!" : "Calore arma"}</div>
                    <Bar v={hud.heat} max={100} color={hud.hot ? "#ff5252" : "#ff9b3d"} />
                  </div>
                  <div className="wr-chip" style={{ textAlign: "center" }}>
                    <div className="wr-small">Velocità</div>
                    <div className="wr-big">{hud.speed}</div>
                  </div>
                </div>
              </>
            )}

            {isTouch && (
              <div className="wr-touch" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", pointerEvents: "auto" }}>
                  {!gyroActive && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <div className="wr-tbtn" {...touch("left")}>◀</div>
                      <div className="wr-tbtn" {...touch("right")}>▶</div>
                    </div>
                  )}
                  <div className="wr-tbtn big" {...touch("fire")} style={{ borderColor: "#4fc3f7", color: "#eaf6ff", width: 90, height: 90 }}>FUOCO</div>
                </div>
                <PilotFace expr={expr} size={80} photo={assets.pilot} />
                <div className="wr-tbtn big" {...touch("boost")} style={{ pointerEvents: "auto" }}>BOOST</div>
              </div>
            )}
          </div>
        </div>
      )}

      {screen === "results" && results && (
        <div className="wr-screen">
          <div className="wr-bgfx" />
          <h2 className="wr-title wr-disp" style={{ fontSize: "clamp(26px,5vw,46px)" }}>
            {playerRow && playerRow.pos === 1 ? "🏆 VITTORIA!" : playerRow && playerRow.pos <= 3 ? "🥈 PODIO!" : "GARA CONCLUSA"}
          </h2>
          <p className="wr-sub wr-disp" style={{ letterSpacing: ".3em" }}>{MODES[modeKey].label} · {TRACKS[trackKey].label}</p>
          <div style={{ height: 22 }} />
          <table className="wr-table">
            <thead>
              <tr><th>POS</th><th>PILOTA</th><th>STATO</th><th>ABBATT.</th><th>PUNTI</th></tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.pos} className={r.isPlayer ? "me" : ""}>
                  <td className="wr-disp" style={{ fontWeight: 800 }}>{r.pos === 1 ? "🥇" : r.pos === 2 ? "🥈" : r.pos === 3 ? "🥉" : r.pos}</td>
                  <td><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: r.colorCss, marginRight: 8, boxShadow: "0 0 6px " + r.colorCss }} />{r.name}{r.isPlayer ? " (tu)" : ""}</td>
                  <td style={{ color: r.status === "Eliminato" || r.status === "Abbattuto" ? "#ff8a80" : "#9fd6ff" }}>{r.status}</td>
                  <td>{r.kills}</td>
                  <td className="wr-disp" style={{ fontWeight: 700 }}>{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ height: 26 }} />
          <div className="wr-row">
            <button className="wr-btn" onClick={() => { setResults(null); setScreen("race"); }}>RIGIOCA 🔁</button>
            <button className="wr-btn sec" onClick={() => { setResults(null); setScreen("setup"); }}>MENU</button>
          </div>
        </div>
      )}
    </div>
  );
}

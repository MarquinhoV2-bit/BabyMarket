import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// BabyMarket — primeira integração do cenário GLB (protótipo de teste).
const css = document.createElement("style");
css.textContent = `
  #game-canvas { position:fixed; inset:0; z-index:0; }
  #game-canvas canvas { display:block; width:100%; height:100%; }
  #ui-subtitle { color:#dbeafe; max-width:520px; margin:0 0 12px; padding:0 12px; text-align:center; line-height:1.45; }
  #ui-summary { display:none; max-width:min(460px, 92vw); margin:0 0 12px; padding:10px 14px; border:1px solid #ffffff2e; border-radius:12px; color:#e2e8f0; background:#ffffff12; font-size:14px; font-weight:800; line-height:1.45; box-shadow:0 8px 22px #0002; }
  #ui-screen.bm-result #ui-summary { display:block; animation:bm-summary-in .42s ease-out both; }
  #ui-screen.bm-win #ui-title { text-shadow:0 0 20px #86efac55, 0 3px 14px #0007; animation:bm-win-pop .62s cubic-bezier(.2,.8,.2,1) both; }
  #ui-screen.bm-gameover #ui-title { text-shadow:0 0 16px #f8717150, 0 3px 14px #0007; }
  @keyframes bm-win-pop { 0% { transform:scale(.78); opacity:0; } 72% { transform:scale(1.06); opacity:1; } 100% { transform:scale(1); opacity:1; } }
  @keyframes bm-summary-in { from { transform:translateY(8px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  @media (prefers-reduced-motion: reduce) { #ui-screen.bm-result #ui-summary, #ui-screen.bm-win #ui-title { animation:none; } }
  #bm-stats {
    display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px;
    width:min(520px,94vw); margin:0 0 4px;
  }
  .bm-stat {
    min-width:0; padding:11px 8px 10px; border:1px solid #ffffff26;
    border-radius:14px; background:linear-gradient(155deg,#ffffff17,#ffffff08);
    box-shadow:0 8px 22px #0002; text-align:center;
  }
  .bm-stat-icon { display:block; margin-bottom:4px; font-size:20px; line-height:1.1; }
  .bm-stat-value { display:block; color:#f8fafc; font-size:clamp(17px,3.7vw,25px); font-weight:950; font-variant-numeric:tabular-nums; line-height:1.2; }
  .bm-stat-label { display:block; margin-top:4px; color:#cbd5e1; font-size:clamp(9px,2.2vw,11px); font-weight:800; letter-spacing:.035em; text-transform:uppercase; }
  #bm-stats-caption { margin:0; color:#bfdbfe; font-size:12px; font-weight:750; text-align:center; }
  #ui-screen.bm-result #bm-stats { animation:bm-summary-in .42s ease-out both; }
  @media (orientation:landscape) and (max-height:500px) {
    #bm-stats { width:min(470px,90vw); gap:6px; }
    .bm-stat { padding:7px 6px; border-radius:10px; }
    .bm-stat-icon { font-size:16px; }
    .bm-stat-label { font-size:9px; }
  }
  #bm-medal {
    display:none; align-items:center; justify-content:center; gap:9px;
    width:min(420px,92vw); padding:11px 18px; margin:0 0 2px;
    border:1px solid #ffffff35; border-radius:16px;
    background:linear-gradient(135deg,#334155dd,#0f172add);
    box-shadow:0 8px 26px #0004; color:#f8fafc;
  }
  #bm-medal .bm-medal-icon { font-size:30px; line-height:1; filter:drop-shadow(0 3px 4px #0005); }
  #bm-medal .bm-medal-name { display:block; font-size:17px; font-weight:950; letter-spacing:.06em; }
  #bm-medal .bm-medal-detail { display:block; margin-top:2px; color:#cbd5e1; font-size:11px; font-weight:750; }
  #bm-medal.bm-gold { border-color:#facc15aa; background:linear-gradient(135deg,#713f12ee,#422006ee); }
  #bm-medal.bm-silver { border-color:#cbd5e1aa; background:linear-gradient(135deg,#475569ee,#1e293bee); }
  #bm-medal.bm-bronze { border-color:#d97706aa; background:linear-gradient(135deg,#78350fee,#431407ee); }
  #ui-screen.bm-win #bm-medal { animation:bm-win-pop .55s cubic-bezier(.2,.8,.2,1) both; }
  @media (orientation:landscape) and (max-height:500px) {
    #bm-medal { padding:6px 12px; gap:7px; }
    #bm-medal .bm-medal-icon { font-size:22px; }
    #bm-medal .bm-medal-name { font-size:14px; }
  }
  #load-error { display:none; color:#fecaca; max-width:520px; padding:0 16px; text-align:center; }
  #hud { display:none; position:fixed; inset:0; z-index:20; color:#fff; pointer-events:none; font-family:system-ui,sans-serif; }
  #hud-top { position:absolute; top:max(9px, env(safe-area-inset-top)); left:9px; right:9px; display:flex; align-items:flex-start; justify-content:space-between; gap:8px; pointer-events:auto; }
  .bm-panel { background:rgba(15,23,42,.91); border:1px solid rgba(255,255,255,.18); border-radius:12px; padding:10px 12px; box-shadow:0 4px 18px #0003; backdrop-filter:blur(6px); }
  #timer-card { font-variant-numeric:tabular-nums; font-weight:900; font-size:20px; min-width:84px; }
  #timer-card.urgent { color:#fecaca; border-color:#f87171; }
  #pause-btn { display:none; align-items:center; justify-content:center; gap:6px; min-height:43px; padding:10px 12px; color:#fff; background:rgba(15,23,42,.91); border:1px solid rgba(255,255,255,.2); border-radius:12px; font-size:13px; font-weight:850; cursor:pointer; touch-action:manipulation; }
  #pause-overlay { display:none; position:fixed; inset:0; z-index:80; align-items:center; justify-content:center; padding:18px; color:#fff; background:rgba(5,10,22,.78); backdrop-filter:blur(5px); font-family:system-ui,sans-serif; }
  #pause-card { display:flex; flex-direction:column; align-items:center; gap:10px; width:min(420px,94vw); padding:clamp(18px,4vh,30px); border:1px solid #ffffff35; border-radius:20px; background:linear-gradient(155deg,#1e293b,#0f172a); box-shadow:0 18px 52px #0007; text-align:center; }
  #pause-card h2 { margin:0; font-size:clamp(26px,5vw,36px); font-weight:950; letter-spacing:.02em; }
  #pause-card p { margin:0 0 6px; color:#cbd5e1; font-size:14px; line-height:1.45; }
  .pause-action { width:min(270px,100%); min-height:46px; padding:11px 16px; border:1px solid #ffffff25; border-radius:12px; font-size:14px; font-weight:900; cursor:pointer; touch-action:manipulation; }
  #resume-btn { color:#052e16; background:linear-gradient(#bbf7d0,#4ade80); border-color:#86efac; }
  #restart-pause-btn { color:#f8fafc; background:#334155; }
  #list-toggle, #interact-btn, .bm-dir { border:1px solid rgba(255,255,255,.2); border-radius:12px; font-weight:800; cursor:pointer; touch-action:none; }
  #list-toggle { color:white; background:rgba(15,23,42,.91); padding:11px 13px; min-height:43px; }
  #list-count { margin-left:5px; color:#bae6fd; }
  #list-panel { display:none; position:absolute; top:calc(max(9px, env(safe-area-inset-top)) + 54px); right:9px; width:min(310px, calc(100vw - 18px)); pointer-events:auto; }
  #list-panel.open { display:block; }
  #list-panel h2 { margin:0 0 8px; font-size:14px; color:#bae6fd; text-transform:uppercase; letter-spacing:.04em; }
  #shop-list { list-style:none; margin:0; padding:0; display:grid; gap:7px; }
  #shop-list li { display:flex; align-items:center; gap:8px; border-radius:7px; padding:7px 8px; background:#ffffff0e; font-size:14px; }
  #shop-list li.done { color:#86efac; text-decoration:line-through; }
  .bm-check { display:inline-grid; place-items:center; width:20px; height:20px; border:1px solid #64748b; border-radius:5px; flex:0 0 20px; }
  li.done .bm-check { color:#052e16; border-color:#86efac; background:#86efac; }
  #list-help { margin-top:8px; color:#cbd5e1; font-size:12px; }
  #interaction-message { position:absolute; left:50%; bottom:calc(126px + env(safe-area-inset-bottom)); transform:translateX(-50%); width:max-content; max-width:calc(100vw - 22px); padding:9px 12px; border-radius:11px; background:#0f172ae8; border:1px solid #ffffff26; text-align:center; font-size:13px; line-height:1.35; }
  #mobile-controls { display:flex; position:absolute; left:11px; right:11px; bottom:max(12px, env(safe-area-inset-bottom)); align-items:flex-end; justify-content:space-between; pointer-events:none; }
  #joystick { position:fixed; left:0; top:0; z-index:26; display:flex; flex-direction:column; align-items:center; gap:3px; pointer-events:none; touch-action:none; user-select:none; -webkit-user-select:none; opacity:0; visibility:hidden; }
  #joystick.active { opacity:1; visibility:visible; }
  #joystick.running #joystick-base { border-color:#fbbf24; box-shadow:0 4px 18px #0005, inset 0 0 0 7px #fbbf2425, 0 0 0 3px #fbbf2430; }
  #joystick.running #joystick-knob { background:linear-gradient(145deg,#fde68a,#f59e0b); }
  #joystick-base { pointer-events:none; }
  #joystick-base { position:relative; width:112px; height:112px; border:2px solid rgba(255,255,255,.58); border-radius:50%; background:radial-gradient(circle, rgba(148,163,184,.42), rgba(15,23,42,.76)); box-shadow:0 4px 18px #0005, inset 0 0 0 7px #ffffff0d; touch-action:none; }
  #joystick-knob { position:absolute; left:50%; top:50%; width:44px; height:44px; transform:translate(-50%,-50%); border:2px solid #fff; border-radius:50%; background:linear-gradient(145deg,#e2e8f0,#64748b); box-shadow:0 3px 10px #0007; pointer-events:none; }
  #joystick-label { color:#fff; font-size:10px; font-weight:900; letter-spacing:.08em; text-shadow:0 2px 5px #000; pointer-events:none; }
  #interact-btn { position:fixed; right:max(12px, env(safe-area-inset-right)); bottom:max(12px, env(safe-area-inset-bottom)); z-index:28; pointer-events:auto; width:min(118px, calc(50vw - 24px)); min-width:0; max-width:calc(50vw - 24px); min-height:51px; padding:9px 8px; background:linear-gradient(#fbbf24,#f59e0b); color:#422006; border-color:#fde68a; font-size:12px; line-height:1.15; white-space:normal; }
  #interact-btn:disabled { display:none; }
  #jump-btn { position:fixed; right:calc(max(12px, env(safe-area-inset-right)) + 126px); bottom:max(12px, env(safe-area-inset-bottom)); z-index:28; pointer-events:auto; width:76px; min-height:51px; padding:8px 6px; color:#082f49; background:linear-gradient(#bae6fd,#38bdf8); border:1px solid #e0f2fe; border-radius:12px; font-size:12px; font-weight:950; box-shadow:0 4px 0 #0369a1, 0 8px 18px #0004; cursor:pointer; touch-action:manipulation; }
  #jump-btn:active:not(:disabled) { transform:translateY(2px); box-shadow:0 2px 0 #0369a1, 0 4px 12px #0003; }
  #jump-btn:disabled { opacity:.55; filter:saturate(.55); }
  #controls-help { position:absolute; left:50%; bottom:12px; transform:translateX(-50%); font-size:11px; background:#0f172abf; padding:7px 10px; border-radius:8px; white-space:nowrap; }
  #fullscreen-btn, #camera-reset-btn { color:white; background:rgba(15,23,42,.91); padding:10px 12px; min-height:43px; white-space:nowrap; }
  #interact-btn { pointer-events:auto; }
  #camera-reset-btn { border:1px solid rgba(255,255,255,.2); border-radius:12px; font-weight:850; cursor:pointer; touch-action:manipulation; }
  #rotate-notice { display:none; position:fixed; inset:0; z-index:100; align-items:center; justify-content:center; text-align:center; padding:24px; color:#fff; background:#0f172af5; font-weight:900; font-size:clamp(22px,5vw,34px); }
  @media (orientation:portrait) and (max-width:900px) { body.bm-require-landscape #rotate-notice { display:flex; } }
  @media (orientation:landscape) and (max-height:500px) {
    #hud-top { top:max(5px, env(safe-area-inset-top)); left:6px; right:6px; }
    .bm-panel { padding:6px 9px; border-radius:9px; }
    #timer-card { font-size:16px; min-width:68px; }
    #pause-btn { min-height:34px; padding:7px 9px; font-size:11px; border-radius:8px; }
    #list-toggle, #fullscreen-btn { min-height:34px; padding:7px 9px; font-size:12px; }
    #list-panel { top:calc(max(5px, env(safe-area-inset-top)) + 40px); right:6px; }
    #mobile-controls { left:7px; right:7px; bottom:max(5px, env(safe-area-inset-bottom)); }
    #joystick-base { width:94px; height:94px; }
    #joystick-knob { width:38px; height:38px; }
    #joystick-label { font-size:9px; }
    #interact-btn { min-height:42px; padding:6px 7px; }
    #jump-btn { right:calc(max(7px, env(safe-area-inset-right)) + 126px); bottom:max(5px, env(safe-area-inset-bottom)); width:68px; min-height:42px; padding:6px 5px; font-size:11px; }
    #fullscreen-btn, #camera-reset-btn { min-height:34px; padding:7px 8px; font-size:11px; border-radius:8px; }
    #interaction-message { bottom:calc(88px + env(safe-area-inset-bottom)); font-size:11px; padding:6px 9px; }
    #controls-help { display:none; }
  }
  @media (pointer:fine) and (min-width:721px) { #mobile-controls { display:none; } #interaction-message { bottom:22px; } }
`;
document.head.appendChild(css);

const canvasHost = document.createElement("div");
canvasHost.id = "game-canvas";
document.body.prepend(canvasHost);
const uiScreen = document.getElementById("ui-screen");
const uiTitle = document.getElementById("ui-title");
const uiButton = document.getElementById("ui-btn");
const uiSubtitle = document.createElement("p");
uiSubtitle.id = "ui-subtitle";
uiSubtitle.textContent = "Preparando o cenário 3D do BabyMarket.";
uiScreen.insertBefore(uiSubtitle, uiButton);
const medalPanel = document.createElement("div");
medalPanel.id = "bm-medal";
medalPanel.setAttribute("aria-live", "polite");
medalPanel.innerHTML = '<span class="bm-medal-icon" id="bm-medal-icon">🏅</span><span><strong class="bm-medal-name" id="bm-medal-name">MEDALHA</strong><span class="bm-medal-detail" id="bm-medal-detail"></span></span>';
uiScreen.insertBefore(medalPanel, uiButton);
function setVictoryMedal(won, remainingSeconds) {
  medalPanel.classList.remove("bm-gold", "bm-silver", "bm-bronze");
  if (!won) {
    medalPanel.style.display = "none";
    return;
  }
  const medal = remainingSeconds >= 45
    ? { tier: "gold", icon: "🥇", name: "OURO", detail: "Excelente! Mais de 45 segundos sobrando." }
    : remainingSeconds >= 20
      ? { tier: "silver", icon: "🥈", name: "PRATA", detail: "Muito bem! Você terminou com tempo de sobra." }
      : { tier: "bronze", icon: "🥉", name: "BRONZE", detail: "Lista completa! Tente terminar ainda mais rápido." };
  medalPanel.classList.add("bm-" + medal.tier);
  medalPanel.querySelector("#bm-medal-icon").textContent = medal.icon;
  medalPanel.querySelector("#bm-medal-name").textContent = "MEDALHA DE " + medal.name;
  medalPanel.querySelector("#bm-medal-detail").textContent = medal.detail;
  medalPanel.style.display = "flex";
}

const statsPanel = document.createElement("section");
statsPanel.id = "bm-stats";
statsPanel.setAttribute("aria-label", "Estatísticas pessoais");
statsPanel.innerHTML = `
  <div class="bm-stat"><span class="bm-stat-icon">🏆</span><strong class="bm-stat-value" id="bm-stat-wins">0</strong><span class="bm-stat-label">Vitórias</span></div>
  <div class="bm-stat"><span class="bm-stat-icon">⚡</span><strong class="bm-stat-value" id="bm-stat-best">—</strong><span class="bm-stat-label">Melhor tempo</span></div>
  <div class="bm-stat"><span class="bm-stat-icon">⏱️</span><strong class="bm-stat-value" id="bm-stat-remaining">—</strong><span class="bm-stat-label">Folga no recorde</span></div>
`;
const statsCaption = document.createElement("p");
statsCaption.id = "bm-stats-caption";
statsCaption.textContent = "Complete a lista para criar seu primeiro recorde!";
uiScreen.insertBefore(statsPanel, uiButton);
uiScreen.insertBefore(statsCaption, uiButton);
function updateStatsPanel() {
  const records = readPersonalRecords();
  statsPanel.querySelector("#bm-stat-wins").textContent = String(records.wins);
  statsPanel.querySelector("#bm-stat-best").textContent =
    records.bestTimeSeconds === null ? "—" : formatTime(records.bestTimeSeconds);
  statsPanel.querySelector("#bm-stat-remaining").textContent =
    records.bestTimeSeconds === null ? "—" : formatTime(records.bestRemainingSeconds);
  statsCaption.textContent = records.bestTimeSeconds === null
    ? "Complete a lista para criar seu primeiro recorde!"
    : "Seu melhor resultado está salvo neste aparelho.";
}
updateStatsPanel();

const loadError = document.createElement("p");
loadError.id = "load-error";
uiScreen.insertBefore(loadError, uiButton);
const uiSummary = document.createElement("p");
uiSummary.id = "ui-summary";
uiSummary.setAttribute("aria-live", "polite");
uiScreen.insertBefore(uiSummary, uiButton);

const hud = document.createElement("div");
hud.id = "hud";
hud.innerHTML = `
  <div id="hud-top">
    <div style="display:flex;gap:6px;align-items:flex-start"><div id="timer-card" class="bm-panel">⏱️ <span id="timer-value">90</span></div><button id="pause-btn" type="button" aria-label="Pausar partida">Ⅱ PAUSAR</button></div>
    <div style="display:flex;gap:6px;align-items:flex-start"><button id="list-toggle">📝 LISTA <span id="list-count">0/3</span></button><button id="camera-reset-btn" class="bm-panel" type="button" aria-label="Recentralizar câmera">↻ VISÃO</button><button id="fullscreen-btn" class="bm-panel" type="button" aria-label="Ativar tela cheia">⛶ TELA CHEIA</button></div>
  </div>
  <section id="list-panel" class="bm-panel">
    <h2>Lista de compras</h2>
    <ul id="shop-list">
      <li data-item="Item_Banana"><span class="bm-check"></span><span>🍌 Banana</span></li>
      <li data-item="Item_Apple"><span class="bm-check"></span><span>🍎 Maçã</span></li>
      <li data-item="Item_Cereal"><span class="bm-check"></span><span>🥣 Cereal — prateleira alta</span></li>
    </ul>
    <div id="list-help">Colete os três produtos antes do tempo acabar.</div>
  </section>
  <div id="interaction-message">Explore o supermercado.</div>
  <div id="mobile-controls">
    <div id="joystick" aria-label="Analógico virtual para movimentação">
      <div id="joystick-base"><div id="joystick-knob"></div></div>
      <span id="joystick-label">MOVER</span>
    </div>
    <button id="jump-btn" type="button" aria-label="Pular" disabled>⬆ PULAR</button>
    <button id="interact-btn" disabled>INTERAGIR</button>
  </div>
  <div id="controls-help">Mover: WASD / setas · Pular: Espaço · Interagir: E</div>
`;
document.body.appendChild(hud);
const rotateNotice = document.createElement("div");
rotateNotice.id = "rotate-notice";
rotateNotice.innerHTML =
  '<div>📱 GIRE O CELULAR<br><span style="font-size:.58em;font-weight:600">O BabyMarket fica melhor na horizontal</span></div>';
document.body.appendChild(rotateNotice);

const pauseOverlay = document.createElement("div");
pauseOverlay.id = "pause-overlay";
pauseOverlay.setAttribute("role", "dialog");
pauseOverlay.setAttribute("aria-modal", "true");
pauseOverlay.setAttribute("aria-labelledby", "pause-title");
pauseOverlay.innerHTML = `
  <section id="pause-card">
    <div style="font-size:34px;line-height:1">Ⅱ</div>
    <h2 id="pause-title">JOGO PAUSADO</h2>
    <p>O tempo e os movimentos estão pausados.<br>Retome quando estiver pronto.</p>
    <button class="pause-action" id="resume-btn" type="button">▶ CONTINUAR</button>
    <button class="pause-action" id="restart-pause-btn" type="button">↻ REINICIAR PARTIDA</button>
  </section>
`;
document.body.appendChild(pauseOverlay);

const timerValue = hud.querySelector("#timer-value");
const timerCard = hud.querySelector("#timer-card");
const listToggle = hud.querySelector("#list-toggle");
const listPanel = hud.querySelector("#list-panel");
const listCount = hud.querySelector("#list-count");
const listHelp = hud.querySelector("#list-help");
const interactionMessage = hud.querySelector("#interaction-message");
const interactButton = hud.querySelector("#interact-btn");
const jumpButton = hud.querySelector("#jump-btn");
const fullscreenButton = hud.querySelector("#fullscreen-btn");
const pauseButton = hud.querySelector("#pause-btn");
const resumeButton = pauseOverlay.querySelector("#resume-btn");
const restartPauseButton = pauseOverlay.querySelector("#restart-pause-btn");
const cameraResetButton = hud.querySelector("#camera-reset-btn");
const joystick = hud.querySelector("#joystick");
const joystickBase = hud.querySelector("#joystick-base");
const joystickKnob = hud.querySelector("#joystick-knob");
let joystickPointerId = null;
let joystickOriginX = 0;
let joystickOriginY = 0;
function resetJoystick() {
  input.analogX = 0;
  input.analogY = 0;
  joystickPointerId = null;
  joystick.classList.remove("active", "running");
  joystickKnob.style.transform = "translate(-50%,-50%)";
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcdeafe);
const camera = new THREE.PerspectiveCamera(
  68,
  innerWidth / innerHeight,
  0.1,
  140
);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
canvasHost.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 1.8));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(-7, 16, 8);
scene.add(keyLight);

const ROUND_SECONDS = 90;
const PLAYER_HEIGHT = 1.12;
const HALF_X = 0.22;
const HALF_Z = 0.19;
const MOVE_SPEED = 3.35;
const LADDER_SPEED = 2.45;
const ITEM_REACH = 1.42;
const HIGH_REACH = 1.48;
const input = { up: false, down: false, left: false, right: false, analogX: 0, analogY: 0 };
let jumpActive = false;
let jumpVelocity = 0;
const JUMP_IMPULSE = 3.5;
const JUMP_GRAVITY = 10.5;
const targetCam = new THREE.Vector3();
const targetLook = new THREE.Vector3();
const CAMERA_DISTANCE = 3.25;
const INITIAL_CAMERA_PITCH = 0.52;
let cameraYaw = 0;
let cameraPitch = INITIAL_CAMERA_PITCH;
let cameraPointerId = null;
let lastCameraX = 0;
let lastCameraY = 0;

let environment = null;
let player = null;
let shoppingCart = null;
let cartPushing = false;
let cartYaw = Math.PI;
const cartWheelPivots = [];
const CART_PUSH_SPEED = 1.28;
const CART_PUSH_OFFSET = 0.84;
const CART_ALIGNMENT_MAX_OFFSET = 0.12;
const CART_BODY_HALF_X = 0.12;
const CART_BODY_HALF_Z = 0.16;
let cartVelocity = new THREE.Vector3();
let cartLastPushVelocity = new THREE.Vector3();
let cartPreviousPosition = new THREE.Vector3();
let cartHadPushMotion = false;
let portableLadder = null;
let ladderDropZone = null;
let startPosition = new THREE.Vector3(0, 0, 5.45);
let ladderStartPosition = new THREE.Vector3(0.45, 0, 3.6);
let ladderDropPosition = new THREE.Vector3(0.05, 0, -1.85);
let colliderBoxes = [];
let items = [];
let ladderCarried = false;
let ladderPlaced = false;
let climbing = false;
let climbTraversal = null;
let state = "LOADING";
let timeLeft = ROUND_SECONDS;
let lastTimerText = -1;
let lastMessage = "";
let countdownId = 0;
let lastFrame = performance.now();
let activeHighlightTarget = null;
let activeInteractionHighlight = null;
let activeHighlightColor = 0xfbbf24;
const collectEffects = [];

function worldPos(obj) {
  const p = new THREE.Vector3();
  obj.getWorldPosition(p);
  return p;
}
function distXZ(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
function message(text) {
  if (text !== lastMessage) {
    interactionMessage.textContent = text;
    lastMessage = text;
  }
}
function setInteractionHighlight(target, color = 0xfbbf24) {
  if (target === activeHighlightTarget && activeInteractionHighlight) {
    if (activeHighlightColor !== color) {
      activeHighlightColor = color;
      activeInteractionHighlight.material.color.setHex(color);
    }
    activeInteractionHighlight.update();
    return;
  }

  if (activeInteractionHighlight) {
    scene.remove(activeInteractionHighlight);
    activeInteractionHighlight.geometry.dispose();
    activeInteractionHighlight.material.dispose();
    activeInteractionHighlight = null;
  }
  activeHighlightTarget = target || null;
  activeHighlightColor = color;
  if (!target) return;

  // Contorno de baixo custo; só existe para o alvo da próxima ação.
  activeInteractionHighlight = new THREE.BoxHelper(target, color);
  activeInteractionHighlight.material.transparent = true;
  activeInteractionHighlight.material.opacity = 0.92;
  activeInteractionHighlight.material.depthWrite = false;
  scene.add(activeInteractionHighlight);
}

function spawnCollectEffect(position) {
  const group = new THREE.Group();
  group.name = "Collect_Sparkle_Effect";
  group.position.copy(position);

  const geometry = new THREE.SphereGeometry(0.035, 6, 6);
  const gold = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 1,
    depthWrite: false,
  });
  const green = new THREE.MeshBasicMaterial({
    color: 0x86efac,
    transparent: true,
    opacity: 1,
    depthWrite: false,
  });
  const particles = [];
  for (let i = 0; i < 8; i++) {
    const mesh = new THREE.Mesh(geometry, i % 3 === 0 ? green : gold);
    const angle = (Math.PI * 2 * i) / 8;
    mesh.position.set(Math.cos(angle) * 0.07, 0.03 + (i % 3) * 0.035, Math.sin(angle) * 0.07);
    group.add(mesh);
    particles.push({
      mesh,
      velocity: new THREE.Vector3(
        Math.cos(angle) * (0.34 + (i % 2) * 0.12),
        0.55 + (i % 3) * 0.12,
        Math.sin(angle) * (0.34 + (i % 2) * 0.12),
      ),
      material: mesh.material,
    });
  }
  scene.add(group);
  collectEffects.push({
    group,
    geometry,
    materials: [gold, green],
    particles,
    age: 0,
    duration: 0.62,
  });
}

function updateCollectEffects(dt) {
  for (let i = collectEffects.length - 1; i >= 0; i--) {
    const effect = collectEffects[i];
    effect.age += dt;
    const progress = Math.min(effect.age / effect.duration, 1);
    for (const particle of effect.particles) {
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      particle.velocity.y -= 1.35 * dt;
      const fade = 1 - progress;
      particle.material.opacity = fade;
      particle.mesh.scale.setScalar(Math.max(0.05, fade));
    }
    if (progress >= 1) {
      scene.remove(effect.group);
      effect.geometry.dispose();
      effect.materials.forEach((material) => material.dispose());
      collectEffects.splice(i, 1);
    }
  }
}

function showAction(label) {
  interactButton.textContent = label;
  interactButton.disabled = false;
}
function hideAction() {
  interactButton.disabled = true;
  interactButton.textContent = "INTERAGIR";
}


function addCartBar(parent,a,b,radius,material,segments=8){
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),dir=new THREE.Vector3().subVectors(end,start),length=dir.length();
 if(length<0.0001)return null;
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,segments),material);
 mesh.position.copy(start).add(end).multiplyScalar(0.5);
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function addCartAxialCylinder(parent,radius,depth,x,y,z,material,segments=20){
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,depth,segments),material);
 mesh.rotation.z=Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function createProceduralShoppingCart(){
 const root=new THREE.Group();root.name="BabyMarket_ShoppingCart";root.userData.isShoppingCart=true;
 root.scale.setScalar(0.30);
 root.userData.pushHandle={y:0.84,z:-0.57,halfWidth:0.29};
 const silver=new THREE.MeshStandardMaterial({color:0x9aa6b7,metalness:0.72,roughness:0.3});
 const brightSilver=new THREE.MeshStandardMaterial({color:0xd7e0eb,metalness:0.65,roughness:0.27});
 const red=new THREE.MeshStandardMaterial({color:0xf52f38,roughness:0.3});
 const yellow=new THREE.MeshStandardMaterial({color:0xffc928,roughness:0.35});
 const blue=new THREE.MeshStandardMaterial({color:0x1674f8,roughness:0.34});
 const rubber=new THREE.MeshStandardMaterial({color:0x202633,roughness:0.82});
 const darkRed=new THREE.MeshStandardMaterial({color:0xd91f31,roughness:0.38});
 const frame=[
 [[-.30,.22,-.39],[-.30,.22,.40]],[[.30,.22,-.39],[.30,.22,.40]],
 [[-.30,.22,-.39],[.30,.22,-.39]],[[-.30,.22,.40],[.30,.22,.40]],
 [[-.30,.22,-.39],[-.30,.08,-.48]],[[.30,.22,-.39],[.30,.08,-.48]],
 [[-.30,.08,-.48],[.30,.08,-.48]],[[-.30,.08,.43],[.30,.08,.43]]
 ];
 frame.forEach(([a,b])=>addCartBar(root,a,b,.018,brightSilver,10));
 const levels=[.72,.57,.43,.32];
 for(const y of levels){
  const taper=y===.72?1:.78+(y-.32)*.42,w=.285*taper;
  const zb=-.39+(.72-y)*.12,zf=.39-(.72-y)*.12,r=y===.72?.018:.012;
  addCartBar(root,[-w,y,zb],[w,y,zb],r,brightSilver,8);addCartBar(root,[-w,y,zf],[w,y,zf],r,brightSilver,8);
  addCartBar(root,[-w,y,zb],[-w,y,zf],r,brightSilver,8);addCartBar(root,[w,y,zb],[w,y,zf],r,brightSilver,8);
 }
 for(let i=0;i<9;i++){
  const x=-.225+i*.05625;
  addCartBar(root,[x,.32,-.34],[x,.72,-.39],.0085,silver,7);
  addCartBar(root,[x,.32,.34],[x,.72,.39],.0085,silver,7);
 }
 for(let i=0;i<9;i++){
  const z=-.32+i*.08;
  addCartBar(root,[-.23,.32,z],[-.285,.72,z],.0085,silver,7);
  addCartBar(root,[.23,.32,z],[.285,.72,z],.0085,silver,7);
 }
 for(const y of [.43,.57])for(let i=0;i<8;i++){const x=-.22+i*.063;addCartBar(root,[x,y,-.36],[x,y,.36],.008,silver,7);}
 const bumperGeo=new THREE.BoxGeometry(.105,.105,.105);
 for(const x of [-.29,.29])for(const z of [-.39,.39]){
  const bumper=new THREE.Mesh(bumperGeo,(x*z>0)?blue:yellow);bumper.position.set(x,.34,z);bumper.castShadow=true;root.add(bumper);
 }
 addCartBar(root,[-.24,.69,-.37],[-.31,.84,-.57],.022,brightSilver,10);
 addCartBar(root,[.24,.69,-.37],[.31,.84,-.57],.022,brightSilver,10);
 addCartBar(root,[-.31,.84,-.57],[.31,.84,-.57],.052,red,16);
 for(const x of [-.31,.31]){
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.064,14,10),red);cap.position.set(x,.84,-.57);cap.castShadow=true;root.add(cap);
  const button=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,.012,16),yellow);button.rotation.z=Math.PI/2;button.position.set(x+(x<0?-.058:.058),.84,-.57);root.add(button);
 }
 const seat=new THREE.Mesh(new THREE.BoxGeometry(.29,.17,.025),red);seat.position.set(0,.49,-.29);seat.rotation.x=-.08;seat.castShadow=true;root.add(seat);
 cartWheelPivots.length=0;
 const wheelDefs=[["WheelRoll_FrontLeft",-.31,.095,.34],["WheelRoll_FrontRight",.31,.095,.34],["WheelRoll_RearRight",.31,.095,-.35],["WheelRoll_RearLeft",-.31,.095,-.35]];
 for(const [name,x,y,z] of wheelDefs){
  const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x,y,z);pivot.userData.radius=.095;root.add(pivot);
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.075,24),rubber);tire.rotation.z=Math.PI/2;tire.castShadow=true;tire.receiveShadow=true;pivot.add(tire);
  for(const side of [-1,1]){
   addCartAxialCylinder(pivot,.062,.009,side*.041,0,0,darkRed,24);
   addCartAxialCylinder(pivot,.046,.012,side*.047,0,0,red,24);
   addCartAxialCylinder(pivot,.022,.014,side*.054,0,0,yellow,20);
  }
  addCartBar(root,[x,.18,z],[x,.115,z+.065],.018,silver,10);
  addCartBar(root,[x,.18,z],[x,.115,z-.065],.018,silver,10);
  const swivel=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.018,16),yellow);swivel.position.set(x,.205,z);root.add(swivel);
  cartWheelPivots.push(pivot);
 }
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 scene.add(root);shoppingCart=root;resetShoppingCart();return root;
}
function boundsRelativeTo(root, object) {
  root.updateWorldMatrix(true,true);
  object.updateWorldMatrix(true,false);
  const worldBox = new THREE.Box3().setFromObject(object);
  const result = new THREE.Box3();
  for (let ix=0; ix<2; ix++) for (let iy=0; iy<2; iy++) for (let iz=0; iz<2; iz++) {
    const point = new THREE.Vector3(
      ix ? worldBox.max.x : worldBox.min.x,
      iy ? worldBox.max.y : worldBox.min.y,
      iz ? worldBox.max.z : worldBox.min.z
    );
    root.worldToLocal(point);
    result.expandByPoint(point);
  }
  return result;
}

function detectCartPushHandle(model, modelBounds, modelSize) {
  // No GLB original da Tripo, tripo_part_3 é a barra vermelha horizontal
  // que funciona como alça. Não inferimos por cor/altura nem pela caixa global:
  // essas heurísticas selecionavam a borda superior do cesto.
  const handleObject = model.getObjectByName("tripo_part_3");
  if (handleObject) {
    const handleBox = boundsRelativeTo(model, handleObject);
    const handleSize = handleBox.getSize(new THREE.Vector3());
    const handleCenter = handleBox.getCenter(new THREE.Vector3());
    const anchor = {
      x: handleCenter.x,
      y: handleCenter.y,
      z: handleCenter.z,
      // As mãos miram a parte útil da barra, um pouco para dentro dos terminais.
      halfWidth: Math.min(handleSize.x * 0.36, modelSize.x * 0.30),
      sourceNode: "tripo_part_3"
    };
    console.info("[BabyMarket] Anchor real da alça (tripo_part_3):", {
      x: anchor.x.toFixed(3), y: anchor.y.toFixed(3),
      z: anchor.z.toFixed(3), halfWidth: anchor.halfWidth.toFixed(3)
    });
    return anchor;
  }

  // Reserva para exportações mescladas: usa as coordenadas conhecidas da alça
  // deste modelo, sem escolher outra barra como candidata.
  console.warn("[BabyMarket] tripo_part_3 não está presente; usando anchor de reserva da alça.");
  return {
    x: 0,
    y: modelBounds.min.y + modelSize.y * 0.924,
    z: modelBounds.min.z + modelSize.z * 0.071,
    halfWidth: Math.min(modelSize.x * 0.285, 0.235),
    sourceNode: "known-handle-fallback"
  };
}

function loadShoppingCartAsset() {
  return new Promise((resolve) => {
    const url = new URL("../assets/models/babymarket-cart.glb?v=1", import.meta.url).href;
    new GLTFLoader().load(
      url,
      (gltf) => {
        try {
          const model = gltf.scene;
          model.name = "CartRoot_OriginalTripo";
          const requiredWheelNames = ["tripo_part_1", "tripo_part_4", "tripo_part_5", "tripo_part_6"];
          const wheelNodes = requiredWheelNames.map((name) => model.getObjectByName(name));
          model.updateWorldMatrix(true,true);
          const modelBounds = new THREE.Box3().setFromObject(model);
          const modelSize = modelBounds.getSize(new THREE.Vector3());
          if (modelSize.x <= 0 || modelSize.y <= 0 || modelSize.z <= 0)
            throw new Error("O modelo do carrinho não possui dimensões válidas.");
          if (wheelNodes.some((node) => !node))
            throw new Error("O GLB não contém as quatro peças de roda esperadas.");

          // Mantemos o GLB original e suas peças separadas. Como cada peça de roda
          // também contém parte do suporte, não giramos a peça inteira para evitar deformação visual.
          const root = new THREE.Group();
          root.name = "BabyMarket_ShoppingCart";
          root.userData.isShoppingCart = true;
          root.userData.source = "Tripo original";
          root.userData.wheelNodeNames = requiredWheelNames.slice();
          // Redução leve (~5,5%) para melhorar proporção com o bebê.
          root.scale.setScalar(0.30);
          // As mãos miram o centro do cabo estimado a partir das dimensões reais do GLB.
          root.userData.pushHandle = detectCartPushHandle(model, modelBounds, modelSize);
          root.add(model);
          root.traverse((object) => {
            if (object.isMesh) {
              object.castShadow = true;
              object.receiveShadow = true;
              object.frustumCulled = true;
            }
          });
          cartWheelPivots.length = 0;
          scene.add(root);
          shoppingCart = root;
          resetShoppingCart();
          console.info("[BabyMarket] Carrinho original da Tripo carregado; 4 peças de roda identificadas.");
          resolve(true);
        } catch (error) {
          console.error("[BabyMarket] Falha ao preparar o carrinho original da Tripo.", error);
          createProceduralShoppingCart();
          resolve(false);
        }
      },
      undefined,
      (error) => {
        console.error("[BabyMarket] GLB do carrinho não encontrado; usando fallback provisório.", error);
        createProceduralShoppingCart();
        resolve(false);
      }
    );
  });
}

function resetShoppingCart(){
 if(!shoppingCart)return;
 if(shoppingCart.parent!==scene)scene.attach(shoppingCart);
 cartPushing=false;cartYaw=Math.PI;cartVelocity.set(0,0,0);cartLastPushVelocity.set(0,0,0);cartHadPushMotion=false;
 shoppingCart.userData.attachedToBaby=false;
 shoppingCart.rotation.set(0,cartYaw,0);
 shoppingCart.position.set(startPosition.x,0,startPosition.z-CART_PUSH_OFFSET);shoppingCart.visible=true;
 cartPreviousPosition.copy(worldPos(shoppingCart));
 cartWheelPivots.forEach(p=>p.rotation.set(0,0,0));
}
function cartWorldBox(position=shoppingCart?.position,yaw=shoppingCart?.rotation.y??cartYaw){
 const hx=CART_BODY_HALF_X,hz=CART_BODY_HALF_Z;
 const ex=Math.abs(Math.cos(yaw))*hx+Math.abs(Math.sin(yaw))*hz;
 const ez=Math.abs(Math.sin(yaw))*hx+Math.abs(Math.cos(yaw))*hz;
 return new THREE.Box3(new THREE.Vector3(position.x-ex,.015,position.z-ez),new THREE.Vector3(position.x+ex,.79,position.z+ez));
}
function cartCanStandForPlayer(x,z,yaw){
 if(!shoppingCart||!colliderBoxes.length)return true;
 const cx=x+Math.sin(yaw)*CART_PUSH_OFFSET,cz=z+Math.cos(yaw)*CART_PUSH_OFFSET;
 const box=cartWorldBox(new THREE.Vector3(cx,0,cz),yaw);
 return !colliderBoxes.some(entry=>box.intersectsBox(entry.box));
}
function cartBlockedAt(position,yaw){
 const box=cartWorldBox(position,yaw);
 return colliderBoxes.some(entry=>box.intersectsBox(entry.box));
}
function updateShoppingCart(dt,movedDistance=0){
 if(!shoppingCart||!player)return;
 if(cartPushing){
   if(shoppingCart.parent!==player) {
     player.attach(shoppingCart);
     shoppingCart.userData.attachedToBaby=true;
   }
   shoppingCart.updateWorldMatrix(true,true);
   const current=worldPos(shoppingCart);
   const delta=current.clone().sub(cartPreviousPosition);
   if(dt>0&&delta.lengthSq()>.000001) {
     cartVelocity.copy(delta).multiplyScalar(1/dt);cartVelocity.y=0;
     cartLastPushVelocity.copy(cartVelocity);cartHadPushMotion=true;
     for(const pivot of cartWheelPivots)pivot.rotation.x-=delta.length()/.095;
   } else if(dt>0)cartVelocity.set(0,0,0);
   // Não sobrescreve a rotação local: o parenting gira o carrinho junto com o bebê.
   // Atualiza apenas o yaw mundial para o impulso utilizado ao soltar.
   const cartForwardWorld = new THREE.Vector3(0,0,1).applyQuaternion(
     shoppingCart.getWorldQuaternion(new THREE.Quaternion())
   );
   cartYaw = Math.atan2(cartForwardWorld.x,cartForwardWorld.z);
 } else if(dt>0&&cartVelocity.lengthSq()>.0004) {
   const current=worldPos(shoppingCart),next=current.clone().addScaledVector(cartVelocity,dt);next.y=0;
   if(cartBlockedAt(next,shoppingCart.rotation.y))cartVelocity.set(0,0,0);
   else {
     shoppingCart.position.copy(next);
     for(const pivot of cartWheelPivots)pivot.rotation.x-=current.distanceTo(next)/.095;
     cartVelocity.multiplyScalar(Math.exp(-1.25*dt));
   }
   if(cartVelocity.lengthSq()<.0004)cartVelocity.set(0,0,0);
 }
 cartPreviousPosition.copy(worldPos(shoppingCart));
}

function createBaby() {
  const root = new THREE.Group();
  root.name = "Baby_Player_Prototype";

  // O grupo visual anima separadamente da posição de jogo, colisores e escada carregada.
  const visual = new THREE.Group();
  visual.name = "Baby_VisualRig";
  root.add(visual);

  const skin = new THREE.MeshStandardMaterial({
    color: 0xf4c7a5,
    roughness: 0.78,
  });
  const shirt = new THREE.MeshStandardMaterial({
    color: 0x2585e8,
    roughness: 0.62,
  });
  const diaper = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.8,
  });
  const hair = new THREE.MeshStandardMaterial({
    color: 0x6b4226,
    roughness: 0.95,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x172033,
    roughness: 0.5,
  });
  const shoes = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
  });

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.17, 0.24, 4, 8),
    shirt
  );
  torso.position.y = 0.47;
  visual.add(torso);

  const lower = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    diaper
  );
  lower.scale.set(1, 0.72, 0.95);
  lower.position.set(0, 0.28, 0.015);
  visual.add(lower);

  // Cabeça agrupada para conseguir inclinar junto com o cabelo e os olhos.
  const headPivot = new THREE.Group();
  headPivot.name = "Baby_HeadPivot";
  headPivot.position.set(0, 0.84, -0.025);
  visual.add(headPivot);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 16, 12),
    skin
  );
  headPivot.add(head);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.205, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.43),
    hair
  );
  cap.position.set(0, 0.07, 0.005);
  headPivot.add(cap);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.027, 8, 6),
      dark
    );
    eye.position.set(side * 0.078, 0.025, -0.213);
    headPivot.add(eye);
  }

  const arms = [];
  const legs = [];

  for (const side of [-1, 1]) {
    // Ombro articulado: os braços balançam em oposição às pernas durante a caminhada.
    const armPivot = new THREE.Group();
    armPivot.name = side < 0 ? "Baby_ArmPivot_L" : "Baby_ArmPivot_R";
    armPivot.position.set(side * 0.16, 0.58, -0.02);
    visual.add(armPivot);

    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.052, 0.17, 3, 6),
      skin
    );
    arm.position.set(side * 0.055, -0.10, 0);
    arm.rotation.z = side * 0.35;
    armPivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 8), skin);
    hand.name = side < 0 ? "Baby_Hand_L" : "Baby_Hand_R";
    hand.position.set(side * 0.055, -0.22, -0.015);
    hand.castShadow = false;
    armPivot.add(hand);
    arms.push({ pivot: armPivot, side, hand });

    // Quadril articulado para passos alternados, mantendo o ponto de colisão estável.
    const legPivot = new THREE.Group();
    legPivot.name = side < 0 ? "Baby_LegPivot_L" : "Baby_LegPivot_R";
    legPivot.position.set(side * 0.095, 0.23, 0.01);
    visual.add(legPivot);

    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.055, 0.12, 3, 6),
      skin
    );
    leg.position.set(0, -0.10, 0);
    legPivot.add(leg);

    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.075, 0.19),
      shoes
    );
    foot.position.set(0, -0.185, -0.035);
    legPivot.add(foot);

    legs.push({ pivot: legPivot, foot, side });
  }

  root.userData.babyRig = {
    visual,
    torso,
    headPivot,
    arms,
    legs,
    clock: 0,
    walkBlend: 0,
    actionType: "",
    actionTime: 0,
    actionDuration: 0,
  };

  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = true;
    }
  });

  return root;
}

function createBabyFromGLTF(gltf) {
  const root = new THREE.Group();
  root.name = "Baby_Player_GLTF";

  const visual = gltf.scene;
  visual.name = "Baby_VisualRig_GLTF";
  visual.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(visual);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < 0.05) {
    throw new Error("O modelo GLB do bebê não possui altura válida.");
  }

  // Normaliza a altura ao tamanho do personagem provisório e apoia os pés no chão.
  const targetHeight = 1.08;
  const modelScale = targetHeight / size.y;
  const center = bounds.getCenter(new THREE.Vector3());
  visual.scale.setScalar(modelScale);
  visual.position.set(
    -center.x * modelScale,
    -bounds.min.y * modelScale,
    -center.z * modelScale
  );
  root.add(visual);

  root.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = false;
      object.receiveShadow = true;
      object.frustumCulled = true;
    }
  });

  const hips = visual.getObjectByName("mixamorig:Hips");
  const bindHipsPosition = hips
    ? hips.position.clone()
    : new THREE.Vector3();
  const mixer = new THREE.AnimationMixer(visual);
  const actions = {};

  function animationKey(name) {
    const normalized = String(name || "").toLowerCase().replace(/\.\d+$/, "");
    if (normalized.includes("wait") || normalized.includes("idle")) return "idle";
    if (normalized.includes("walk")) return "walk";
    if (normalized.includes("run_upstairs") || normalized.includes("stair")) return "climb";
    if (normalized.includes("run")) return "run";
    if (normalized.includes("dance")) return "celebrate";
    if (normalized.includes("frustrat")) return "disappointed";
    if (normalized.includes("jump")) return "jump";
    return "";
  }

  for (const sourceClip of gltf.animations || []) {
    const clip = sourceClip.clone();

    // O deslocamento horizontal do quadril fica sob controle do código de movimento.
    // Mantemos a oscilação vertical do quadril, que dá peso à caminhada.
    if (hips) {
      for (const track of clip.tracks) {
        if (
          track.name.toLowerCase().includes("mixamorig:hips.position") &&
          track.values &&
          track.values.length >= 3
        ) {
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] = bindHipsPosition.x;
            track.values[i + 2] = bindHipsPosition.z;
          }
        }
      }
    }

    const key = animationKey(clip.name);
    if (key && !actions[key]) actions[key] = mixer.clipAction(clip);
  }

  if (!actions.idle || !actions.walk) {
    throw new Error("O personagem GLB precisa ter animações de espera e caminhada.");
  }

  const rig = {
    isGLTF: true,
    visual,
    mixer,
    actions,
    currentAction: null,
    currentKey: "",
    clock: 0,
    walkBlend: 0,
    actionType: "",
    actionTime: 0,
    actionDuration: 0,
  };
  root.userData.babyRig = rig;

  // Começa com a animação de espera em loop.
  switchBabyClip(rig, "idle");
  mixer.update(0);

  console.info(
    "[BabyMarket] Personagem 3D preparado; animações: " +
    Object.keys(actions).join(", ")
  );
  return root;
}

function switchBabyClip(rig, key, playbackDirection = 1) {
  const action = rig.actions[key] || rig.actions.idle;
  if (!action) return;

  const direction = playbackDirection < 0 ? -1 : 1;
  const isOneShot = key === "celebrate" || key === "disappointed" || key === "jump";
  if (rig.currentAction === action && rig.playbackDirection === direction) return;

  if (rig.currentAction === action) {
    // Reverse the existing climb clip from its end without switching clips.
    action.enabled = true;
    action.paused = false;
    action.time = direction < 0 ? action.getClip().duration : 0;
    action.setLoop(isOneShot ? THREE.LoopOnce : THREE.LoopRepeat, isOneShot ? 1 : Infinity);
    action.clampWhenFinished = isOneShot;
    action.setEffectiveTimeScale(direction);
    action.setEffectiveWeight(1);
  } else {
    action.reset();
    action.enabled = true;
    action.setLoop(isOneShot ? THREE.LoopOnce : THREE.LoopRepeat, isOneShot ? 1 : Infinity);
    action.clampWhenFinished = isOneShot;
    action.setEffectiveTimeScale(direction);
    if (direction < 0) action.time = action.getClip().duration;
    action.setEffectiveWeight(1);

    if (rig.currentAction) action.crossFadeFrom(rig.currentAction, 0.18, true);
    else action.fadeIn(0.18);
    action.play();
  }
  rig.currentAction = action;
  rig.currentKey = key;
  rig.playbackDirection = direction;
}

function updateGLTFBabyAnimation(dt, moved, rig) {
  rig.clock += dt;

  if (rig.actionType && rig.actionDuration > 0) {
    rig.actionTime += dt;
    if (rig.actionTime >= rig.actionDuration) {
      rig.actionType = "";
      rig.actionTime = 0;
      rig.actionDuration = 0;
    }
  }

  let desired = "idle";
  let playbackDirection = 1;
  const activelyTraversingLadder =
    state === "PLAYING" && climbing && !!climbTraversal;

  if (rig.actionType === "celebrate" && rig.actions.celebrate) {
    desired = "celebrate";
  } else if (rig.actionType === "disappointed" && rig.actions.disappointed) {
    desired = "disappointed";
  } else if (jumpActive && rig.actions.jump) {
    desired = "jump";
  } else if (activelyTraversingLadder && rig.actions.climb) {
    desired = "climb";
    playbackDirection = climbTraversal.direction === "down" ? -1 : 1;
  } else if (
    state === "PLAYING" &&
    !climbTraversal &&
    rig.actionType !== "climbStart" &&
    rig.actionType !== "climbDown" &&
    moved
  ) {
    const intensity = THREE.MathUtils.clamp(player.userData.moveIntensity ?? 1, 0.2, 1);
    desired = intensity >= 0.84 && rig.actions.run ? "run" : "walk";
  }

  if (cartPushing) desired = moved && rig.actions.walk ? "walk" : "idle";
  switchBabyClip(rig, desired, playbackDirection);
  if (rig.currentAction && rig.playbackDirection > 0) {
    const intensity = THREE.MathUtils.clamp(player.userData.moveIntensity ?? 0.5, 0.2, 1);
    if (rig.currentKey === "walk") rig.currentAction.setEffectiveTimeScale(0.58 + intensity * 0.22);
    else if (rig.currentKey === "run") rig.currentAction.setEffectiveTimeScale(0.82 + intensity * 0.28);
  }
  rig.mixer.update(dt);
  if(cartPushing)applyRealCartPushPose(rig);
}

// Anchor points da alça no espaço local do carrinho.
function cartHandleAnchorLocal(side) {
  const handle = shoppingCart?.userData?.pushHandle || { x: 0, y: 0.72, z: -0.5, halfWidth: 0.23 };
  return new THREE.Vector3((handle.x || 0) + side * Math.max(0.02, handle.halfWidth), handle.y, handle.z);
}

function getRealCartPushArmChains(visual) {
  const bones = [];
  visual.traverse((object) => {
    if (!object.isBone) return;
    bones.push({bone:object, name:String(object.name || "").toLowerCase().replace(/[^a-z0-9]/g,"")});
  });
  const onSide = (name, side) => name.includes(side) || (side==="left"
    ? /(?:upperarml|forearml|lowerarml|arml|handl)$/.test(name)
    : /(?:upperarmr|forearmr|lowerarmr|armr|handr)$/.test(name));
  const findBone = (side, role) => {
    const candidates=bones.filter(({name})=>onSide(name,side));
    const matcher=role==="upper"
      ? name => /(?:left|right|l|r)?arm$/.test(name) || /upperarm$/.test(name)
      : role==="forearm"
        ? name => /forearm$|lowerarm$/.test(name)
        : name => /hand$|wrist$/.test(name);
    return candidates.find(({name})=>matcher(name))?.bone || null;
  };
  return ["left","right"].map((side,index)=>({
    side:index===0?-1:1,
    upper:findBone(side,"upper"),
    forearm:findBone(side,"forearm"),
    hand:findBone(side,"hand")
  })).filter(chain=>chain.upper&&chain.forearm&&chain.hand);
}

function rotateArmJointToward(joint, handBone, targetWorld, maxStep=0.38) {
  if(!joint?.parent||!handBone)return;
  joint.updateWorldMatrix(true,true);handBone.updateWorldMatrix(true,true);
  const pivot=joint.getWorldPosition(new THREE.Vector3());
  const from=handBone.getWorldPosition(new THREE.Vector3()).sub(pivot);
  const to=targetWorld.clone().sub(pivot);
  if(from.lengthSq()<1e-8||to.lengthSq()<1e-8)return;
  from.normalize();to.normalize();
  const delta=new THREE.Quaternion().setFromUnitVectors(from,to);
  const angle=delta.angleTo(new THREE.Quaternion());
  if(angle>maxStep)delta.slerp(new THREE.Quaternion(),1-maxStep/angle);
  const worldRotation=joint.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
  const parentRotation=joint.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  joint.quaternion.copy(parentRotation.multiply(worldRotation));
  if(player)player.updateWorldMatrix(true,true);
}

function handWorldPosition(chain) {
  chain.hand.updateWorldMatrix(true,true);
  return chain.hand.getWorldPosition(new THREE.Vector3());
}

function applyRealCartPushPose(rig, iterations=10) {
  if(!rig?.visual||!shoppingCart)return;
  if(!rig.cartPushArmChains) {
    rig.cartPushArmChains=getRealCartPushArmChains(rig.visual);
    if(!rig.cartPushArmChains.length) {
      const names=[];
      rig.visual.traverse(o=>{if(o.isBone&&/arm|hand|wrist|forearm|shoulder/i.test(o.name))names.push(o.name);});
      console.warn("[BabyMarket] Cadeias de mãos não identificadas no rig:",names);
      return;
    }
    console.info("[BabyMarket] Ossos usados para a pegada:",rig.cartPushArmChains.map(c=>({
      side:c.side<0?"left":"right",upper:c.upper.name,forearm:c.forearm.name,hand:c.hand.name
    })));
  }
  shoppingCart.updateWorldMatrix(true,true);
  rig.visual.updateWorldMatrix(true,true);
  for(let pass=0;pass<iterations;pass++) {
    for(const chain of rig.cartPushArmChains) {
      const anchor=shoppingCart.localToWorld(cartHandleAnchorLocal(chain.side));
      rotateArmJointToward(chain.forearm,chain.hand,anchor);
      rotateArmJointToward(chain.upper,chain.hand,anchor);
    }
  }
}

function alignBabyToCartAnchorsAndParent() {
  if(!player||!shoppingCart)return false;
  const rig=player.userData.babyRig;
  if(!rig?.isGLTF) {
    player.attach(shoppingCart);
    shoppingCart.userData.attachedToBaby=true;
    return true;
  }
  rig.cartPushArmChains=getRealCartPushArmChains(rig.visual);
  if(!rig.cartPushArmChains.length) {
    console.warn("[BabyMarket] Não foi possível encontrar as mãos reais no esqueleto GLB.");
    return false;
  }

  // Offset horizontal inicial calculado pela diferença entre as mãos originais e os anchors.
  shoppingCart.updateWorldMatrix(true,true);
  rig.visual.updateWorldMatrix(true,true);
  const deltas=rig.cartPushArmChains.map(chain=>{
    const target=shoppingCart.localToWorld(cartHandleAnchorLocal(chain.side));
    return target.sub(handWorldPosition(chain));
  });
  const offset=deltas.reduce((sum,d)=>sum.add(d),new THREE.Vector3()).multiplyScalar(1/deltas.length);
  offset.y=0;
  // O alinhamento só corrige poucos centímetros, evitando puxar o tronco contra o carrinho.
  if(offset.length()>CART_ALIGNMENT_MAX_OFFSET)offset.setLength(CART_ALIGNMENT_MAX_OFFSET);
  const adjusted=player.position.clone().add(offset);
  if(canStand(adjusted.x,adjusted.z,player.position.y)) {
    player.position.x=adjusted.x;
    player.position.z=adjusted.z;
  }
  player.updateWorldMatrix(true,true);
  applyRealCartPushPose(rig,14);
  shoppingCart.updateWorldMatrix(true,true);

  // Preserve world transform, then parent the cart to the baby. The calculated local
  // transform is the attachment offset; from now on the cart follows player motion.
  player.attach(shoppingCart);
  shoppingCart.userData.attachedToBaby=true;
  cartPreviousPosition.copy(worldPos(shoppingCart));
  return true;
}

function releaseCartParent() {
  if(!shoppingCart||shoppingCart.parent===scene)return;
  scene.attach(shoppingCart);
  shoppingCart.userData.attachedToBaby=false;
  cartPreviousPosition.copy(worldPos(shoppingCart));
}

function makeBox(obj) {
  obj.updateWorldMatrix(true, false);
  return { name: obj.name, box: new THREE.Box3().setFromObject(obj) };
}
function canStand(x, z, y = player.position.y) {
  const pbox = new THREE.Box3(
    new THREE.Vector3(x - HALF_X, y, z - HALF_Z),
    new THREE.Vector3(x + HALF_X, y + PLAYER_HEIGHT, z + HALF_Z)
  );
  for (const entry of colliderBoxes) {
    const b = entry.box;
    if (pbox.max.y <= b.min.y + 0.001 || pbox.min.y >= b.max.y - 0.001)
      continue;
    if (pbox.intersectsBox(b)) return false;
  }
  if (shoppingCart && shoppingCart.visible && !cartPushing && y < 0.8 &&
      pbox.intersectsBox(cartWorldBox())) return false;
  if (ladderPlaced && portableLadder && !climbing) {
    portableLadder.updateWorldMatrix(true, true);
    if (pbox.intersectsBox(new THREE.Box3().setFromObject(portableLadder)))
      return false;
  }
  return true;
}

function updateList() {
  const count = items.filter((i) => i.collected).length;
  listCount.textContent = `${count}/${items.length}`;
  listHelp.textContent =
    count === items.length
      ? "Lista completa! Você conseguiu!"
      : `Produtos coletados: ${count} de ${items.length}.`;
}
function resetItems() {
  for (const item of items) {
    item.collected = false;
    item.object.visible = true;
    const li = hud.querySelector(`li[data-item="${item.name}"]`);
    if (li) {
      li.classList.remove("done");
      li.querySelector(".bm-check").textContent = "";
    }
  }
  updateList();
}
function resetLadder() {
  if (!environment || !portableLadder) return;
  environment.attach(portableLadder);
  portableLadder.position.copy(ladderStartPosition);
  portableLadder.rotation.set(0, 0, 0);
  portableLadder.scale.set(1, 1, 1);
  portableLadder.visible = true;
  ladderCarried = false;
  ladderPlaced = false;
  climbing = false;
  climbTraversal = null;
}
function formatTime(totalSeconds) {
  const total = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
const BABYMARKET_RECORD_KEY = "babymarket.personalRecords.v1";
function readPersonalRecords() {
  const empty = { wins: 0, bestTimeSeconds: null, bestRemainingSeconds: 0 };
  try {
    const raw = localStorage.getItem(BABYMARKET_RECORD_KEY);
    if (!raw) return { ...empty };
    const saved = JSON.parse(raw);
    return {
      wins: Number.isInteger(saved.wins) && saved.wins >= 0 ? saved.wins : 0,
      bestTimeSeconds:
        Number.isFinite(saved.bestTimeSeconds) && saved.bestTimeSeconds >= 0
          ? saved.bestTimeSeconds : null,
      bestRemainingSeconds:
        Number.isFinite(saved.bestRemainingSeconds) && saved.bestRemainingSeconds >= 0
          ? saved.bestRemainingSeconds : 0,
    };
  } catch {
    return { ...empty };
  }
}
function savePersonalRecords(records) {
  try {
    localStorage.setItem(BABYMARKET_RECORD_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
function recordMenuText() {
  const records = readPersonalRecords();
  const best = records.bestTimeSeconds === null
    ? "Ainda sem recorde"
    : `Melhor tempo: ${formatTime(records.bestTimeSeconds)}`;
  return `Vitórias: ${records.wins}  •  ${best}`;
}

function finish(won) {
  if (jumpActive) {
    jumpActive = false;
    jumpVelocity = 0;
    if (player && !climbing) player.position.y = 0;
  }
  document.body.classList.remove("bm-require-landscape");
  pauseOverlay.style.display = "none";
  pauseButton.style.display = "none";
  state = won ? "WIN" : "GAMEOVER";
  Object.keys(input).forEach((k) => (input[k] = false));
  resetJoystick();
  triggerBabyAction(won ? "celebrate" : "disappointed");
  if (won && player) {
    spawnCollectEffect(
      player.position.clone().add(new THREE.Vector3(0, 0.68, 0))
    );
  }
  uiScreen.classList.remove("bm-result", "bm-win", "bm-gameover");
  uiScreen.classList.add("bm-result", won ? "bm-win" : "bm-gameover");
  uiScreen.style.display = "flex";
  hud.style.display = "block";
  uiTitle.textContent = won ? "LISTA COMPLETA!" : "TEMPO ESGOTADO!";
  uiTitle.style.color = won ? "#86efac" : "#fecaca";

  const collectedCount = items.filter((item) => item.collected).length;
  const elapsed = Math.max(0, ROUND_SECONDS - timeLeft);
  const records = readPersonalRecords();
  let newPersonalBest = false;
  if (won) {
    records.wins += 1;
    if (records.bestTimeSeconds === null || elapsed < records.bestTimeSeconds) {
      records.bestTimeSeconds = elapsed;
      records.bestRemainingSeconds = Math.max(0, Math.floor(timeLeft));
      newPersonalBest = true;
    }
    savePersonalRecords(records);
  }
  uiSubtitle.textContent = won
    ? (newPersonalBest
        ? "NOVO RECORDE! Você completou a lista mais rápido."
        : "Parabéns! Você encontrou todos os produtos do mini supermercado.")
    : "O tempo acabou. Tente uma rota melhor e use a escada para pegar o cereal.";
  uiSummary.textContent = won
    ? `Produtos: ${collectedCount}/${items.length}  •  Tempo: ${formatTime(elapsed)}  •  Restante: ${formatTime(timeLeft)}\n${newPersonalBest ? "🏆 NOVO RECORDE PESSOAL!  •  " : ""}Vitórias: ${records.wins}  •  ${records.bestTimeSeconds === null ? "Melhor tempo: —" : "Recorde: " + formatTime(records.bestTimeSeconds)}`
    : `Produtos encontrados: ${collectedCount}/${items.length}  •  Tempo jogado: ${formatTime(elapsed)}\n${recordMenuText()}`;
  uiSummary.style.display = "block";
  setVictoryMedal(won, Math.max(0, Math.floor(timeLeft)));
  updateStatsPanel();
  statsPanel.style.display = "grid";
  statsCaption.style.display = "block";

  uiButton.textContent = "JOGAR NOVAMENTE";
  uiButton.style.display = "inline-block";
  uiButton.disabled = false;
  loadError.style.display = "none";
  message(won ? "Vitória!" : "Fim de jogo.");
  hideAction();
}
function collect(item) {
  if (!item || item.collected) return;
  triggerBabyAction("pickup");
  spawnCollectEffect(worldPos(item.object));
  item.collected = true;
  item.object.visible = false;
  if (activeHighlightTarget === item.object) setInteractionHighlight(null);
  const li = hud.querySelector(`li[data-item="${item.name}"]`);
  if (li) {
    li.classList.add("done");
    li.querySelector(".bm-check").textContent = "✓";
  }
  updateList();
  message(`${item.label} coletado!`);
  if (items.every((i) => i.collected)) finish(true);
}
function lowItemNear() {
  const candidates = items.filter(
    (i) => !i.collected && i.name !== "Item_Cereal"
  );
  candidates.sort(
    (a, b) =>
      distXZ(player.position, a.position) - distXZ(player.position, b.position)
  );
  return (
    candidates.find((i) => distXZ(player.position, i.position) <= ITEM_REACH) ||
    null
  );
}
function updatePrompt() {
  if (state !== "PLAYING" || !player || !portableLadder) {
    hideAction();
    setInteractionHighlight(null);
    return;
  }

  if (jumpActive) {
    hideAction();
    setInteractionHighlight(null);
    message("Pulando...");
    return;
  }

  if (climbing) {
    if (climbTraversal) {
      hideAction();
      message(climbTraversal.direction === "up" ? "Subindo a escada..." : "Descendo a escada...");
      return;
    }
    const cereal = items.find((i) => i.name === "Item_Cereal" && !i.collected);
    if (cereal && distXZ(player.position, cereal.position) <= HIGH_REACH) {
      setInteractionHighlight(cereal.object, 0x86efac);
      message("Você alcançou o cereal! Pegue-o.");
      showAction("PEGAR CEREAL");
    } else {
      setInteractionHighlight(portableLadder, 0x38bdf8);
      message("Você está na escada. Toque para descer.");
      showAction("DESCER");
    }
    return;
  }

  if (ladderCarried) {
    // A marca de apoio fica destacada mesmo um pouco distante para orientar o trajeto.
    setInteractionHighlight(ladderDropZone, 0x38bdf8);
    if (distXZ(player.position, ladderDropPosition) <= 1.22) {
      message("Chegou à marca âmbar. Apoie a escada aqui.");
      showAction("APOIAR ESCADA");
    } else {
      message("Leve a escada até a marca âmbar ao lado da prateleira alta.");
      hideAction();
    }
    return;
  }

  const ladderPos = worldPos(portableLadder);
  const dLadder = distXZ(player.position, ladderPos);
  if (!ladderPlaced && dLadder <= 1.25) {
    setInteractionHighlight(portableLadder, 0xfbbf24);
    message("Encontrei uma escada! Pegue-a para alcançar o cereal.");
    showAction("PEGAR ESCADA");
    return;
  }
  if (ladderPlaced && dLadder <= 1.45) {
    setInteractionHighlight(portableLadder, 0x38bdf8);
    message("A escada está apoiada. Toque para subir.");
    showAction("SUBIR ESCADA");
    return;
  }

  if (cartPushing) {
    setInteractionHighlight(shoppingCart, 0x38bdf8);
    message("Empurrando o carrinho. Solte-o para correr mais rápido.");
    showAction("LARGAR CARRINHO");
    return;
  }
  if (shoppingCart && distXZ(player.position, shoppingCart.position) <= 1.45) {
    setInteractionHighlight(shoppingCart, 0xfbbf24);
    message("Seu carrinho está aqui. Pegue-o para levar suas compras.");
    showAction("EMPURRAR CARRINHO");
    return;
  }
  const item = lowItemNear();
  if (item) {
    setInteractionHighlight(item.object, 0xfbbf24);
    message(`Produto próximo: ${item.label}. Toque para coletar.`);
    showAction(`PEGAR ${item.label.toUpperCase()}`);
    return;
  }

  const cereal = items.find((i) => i.name === "Item_Cereal" && !i.collected);
  if (
    cereal &&
    distXZ(player.position, cereal.position) <= 2.1 &&
    !ladderPlaced
  ) {
    setInteractionHighlight(cereal.object, 0x38bdf8);
    message("O cereal está alto! Pegue a escada portátil e apoie-a na marca âmbar.");
  } else {
    message("Explore os corredores e procure os produtos da lista.");
    setInteractionHighlight(null);
  }
  hideAction();
}
function detectLadderTreadSurfaces(root) {
  if (!root) return [];

  root.updateWorldMatrix(true, true);
  const inverseRoot = root.matrixWorld.clone().invert();
  const buckets = new Map();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const edgeA = new THREE.Vector3();
  const edgeB = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const center = new THREE.Vector3();

  root.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position;
    const indices = geometry.index;
    mesh.updateWorldMatrix(true, false);
    const meshToRoot = inverseRoot.clone().multiply(mesh.matrixWorld);
    const vertexCount = indices ? indices.count : positions.count;

    for (let i = 0; i + 2 < vertexCount; i += 3) {
      const ia = indices ? indices.getX(i) : i;
      const ib = indices ? indices.getX(i + 1) : i + 1;
      const ic = indices ? indices.getX(i + 2) : i + 2;
      a.fromBufferAttribute(positions, ia).applyMatrix4(meshToRoot);
      b.fromBufferAttribute(positions, ib).applyMatrix4(meshToRoot);
      c.fromBufferAttribute(positions, ic).applyMatrix4(meshToRoot);

      edgeA.subVectors(b, a);
      edgeB.subVectors(c, a);
      normal.crossVectors(edgeA, edgeB);
      const doubleArea = normal.length();
      if (doubleArea < 0.00001) continue;
      normal.multiplyScalar(1 / doubleArea);
      if (normal.y < 0.975) continue;

      const area = doubleArea * 0.5;
      if (area < 0.000002) continue;
      center.copy(a).add(b).add(c).multiplyScalar(1 / 3);
      const key = Math.round(center.y / 0.02);
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { y: key * 0.02, area: 0, x: 0, ySum: 0, z: 0 };
        buckets.set(key, bucket);
      }
      bucket.area += area;
      bucket.x += center.x * area;
      bucket.ySum += center.y * area;
      bucket.z += center.z * area;
    }
  });

  const rawLevels = [...buckets.values()]
    .map((bucket) => ({
      y: bucket.ySum / bucket.area,
      x: bucket.x / bucket.area,
      z: bucket.z / bucket.area,
      area: bucket.area,
    }))
    .sort((left, right) => left.y - right.y);

  const merged = [];
  for (const level of rawLevels) {
    const last = merged[merged.length - 1];
    if (last && level.y - last.lastY <= 0.031) {
      const totalArea = last.area + level.area;
      last.x = (last.x * last.area + level.x * level.area) / totalArea;
      last.y = (last.y * last.area + level.y * level.area) / totalArea;
      last.z = (last.z * last.area + level.z * level.area) / totalArea;
      last.area = totalArea;
      last.lastY = level.y;
    } else {
      merged.push({ ...level, lastY: level.y });
    }
  }

  let treads = merged
    .filter((level) => level.area >= 0.04 && level.y > 0.06)
    .map((level) => ({ point: new THREE.Vector3(level.x, level.y, level.z), area: level.area }));

  if (treads.length > 6) {
    treads = treads.sort((left, right) => right.area - left.area).slice(0, 6);
  }
  treads.sort((left, right) => left.point.y - right.point.y);

  return treads.map((tread) => tread.point);
}

function getLadderClimbPath() {
  if (!portableLadder) return null;
  portableLadder.updateWorldMatrix(true, true);

  let localSurfaces = portableLadder.userData.treadSurfacesLocal;
  if (!Array.isArray(localSurfaces) || localSurfaces.length < 4) {
    localSurfaces = detectLadderTreadSurfaces(portableLadder);
    if (localSurfaces.length < 4 && !portableLadder.userData.usesGLTFAsset) {
      // Fallback uses the original procedural staircase's actual local step layout.
      localSurfaces = [
        new THREE.Vector3(0.26, 0.30, 0),
        new THREE.Vector3(0.20, 0.60, 0),
        new THREE.Vector3(0.14, 0.90, 0),
        new THREE.Vector3(0.08, 1.20, 0),
        new THREE.Vector3(0, 1.48, 0),
      ];
    }
    portableLadder.userData.treadSurfacesLocal = localSurfaces;
  }
  if (!localSurfaces || localSurfaces.length < 4) return null;

  const treadWorld = localSurfaces
    .map((point) => portableLadder.localToWorld(point.clone()))
    .sort((a, b) => a.y - b.y);

  const bottom = treadWorld[0].clone();
  const top = treadWorld[treadWorld.length - 1].clone();
  const ascentDirection = top.clone().sub(bottom);
  ascentDirection.y = 0;
  if (ascentDirection.lengthSq() < 0.0001) return null;
  ascentDirection.normalize();

  // Use the ladder's current transformed bounding box to find its true base edge.
  // This works for any world position and Y-rotation, instead of assuming global X.
  const bounds = new THREE.Box3().setFromObject(portableLadder);
  let minProjection = Infinity;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        minProjection = Math.min(
          minProjection,
          new THREE.Vector3(x, y, z).dot(ascentDirection)
        );
      }
    }
  }

  const bottomProjection = bottom.dot(ascentDirection);
  const playerProjectionRadius =
    Math.abs(ascentDirection.x) * HALF_X +
    Math.abs(ascentDirection.z) * HALF_Z;
  const entry = bottom.clone().addScaledVector(
    ascentDirection,
    minProjection - playerProjectionRadius - 0.055 - bottomProjection
  );
  entry.y = 0;

  return {
    points: [entry, ...treadWorld],
    ascentDirection,
    bottom,
    top,
    entry,
  };
}

function ladderClimbWaypoints() {
  const path = getLadderClimbPath();
  return path ? path.points : [];
}

function faceLadderAlongAscent(ascentDirection) {
  if (!player || !ascentDirection) return;
  const usesGLTFCharacter = player.userData.babyRig?.isGLTF === true;
  // Fica voltado para cima da escada tanto na subida quanto na descida de costas.
  player.rotation.y = usesGLTFCharacter
    ? Math.atan2(ascentDirection.x, ascentDirection.z)
    : Math.atan2(-ascentDirection.x, -ascentDirection.z);
}

function placePlayerSafelyBesideLadder() {
  if (!player || !portableLadder) return;
  const path = getLadderClimbPath();
  if (path?.entry) {
    player.position.copy(path.entry);
    player.position.y = 0;
    faceLadderAlongAscent(path.ascentDirection);
    return;
  }

  // Fallback geometrically derived from the ladder bounding box.
  portableLadder.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(portableLadder);
  const center = bounds.getCenter(new THREE.Vector3());
  const direction = new THREE.Vector3(
    player.position.x - center.x, 0, player.position.z - center.z
  );
  if (direction.lengthSq() < 0.0001) direction.set(0, 0, 1);
  direction.normalize();
  const size = bounds.getSize(new THREE.Vector3());
  const ladderRadius =
    Math.abs(direction.x) * size.x * 0.5 +
    Math.abs(direction.z) * size.z * 0.5;
  const playerRadius =
    Math.abs(direction.x) * HALF_X +
    Math.abs(direction.z) * HALF_Z;
  player.position.set(
    center.x + direction.x * (ladderRadius + playerRadius + 0.12),
    0,
    center.z + direction.z * (ladderRadius + playerRadius + 0.12)
  );
  faceLadderAlongAscent(direction.clone().negate());
}

function startLadderTraversal(direction) {
  if (!player || climbTraversal) return false;
  const path = getLadderClimbPath();
  if (!path || path.points.length < 5) {
    message("Não consegui identificar os degraus. Reposicione a escada e tente novamente.");
    return false;
  }

  const points = path.points.map((point) => point.clone());
  if (direction === "down") points.reverse();

  // The actual tread centers determine the world climb direction.
  const facing = path.ascentDirection;
  faceLadderAlongAscent(facing);

  player.position.copy(points[0]);
  const distance = points.reduce((total, point, index) => {
    if (index === 0) return total;
    return total + point.distanceTo(points[index - 1]);
  }, 0);

  const segmentLengths = points.slice(1).map((point, index) =>
    point.distanceTo(points[index])
  );
  const cumulativeLengths = [0];
  for (const length of segmentLengths) {
    cumulativeLengths.push(cumulativeLengths[cumulativeLengths.length - 1] + length);
  }

  climbTraversal = {
    direction,
    points,
    segmentLengths,
    cumulativeLengths,
    totalDistance: distance,
    ascentDirection: path.ascentDirection.clone(),
    elapsed: 0,
    duration: THREE.MathUtils.clamp(distance / 0.80, 2.2, 3.0),
  };
  return true;
}

function updateClimbTraversal(dt) {
  if (!climbTraversal || state !== "PLAYING" || !player) return false;

  const traversal = climbTraversal;
  traversal.elapsed = Math.min(traversal.elapsed + dt, traversal.duration);
  const progress = THREE.MathUtils.clamp(
    traversal.elapsed / traversal.duration, 0, 1
  );
  const totalDistance = traversal.totalDistance || 1;
  const distanceAlong = progress * totalDistance;
  let segmentIndex = traversal.segmentLengths.length - 1;
  for (let i = 0; i < traversal.segmentLengths.length; i++) {
    if (distanceAlong <= traversal.cumulativeLengths[i + 1]) {
      segmentIndex = i;
      break;
    }
  }
  const segmentStart = traversal.cumulativeLengths[segmentIndex];
  const segmentLength = Math.max(traversal.segmentLengths[segmentIndex], 0.0001);
  const localT = progress >= 1
    ? 1
    : THREE.MathUtils.clamp((distanceAlong - segmentStart) / segmentLength, 0, 1);
  // Ease on/off at each footfall: less mechanical, more natural movement between treads.
  const easedT = localT * localT * (3 - 2 * localT);

  player.position.lerpVectors(
    traversal.points[segmentIndex],
    traversal.points[segmentIndex + 1],
    easedT
  );

  if (progress >= 1) {
    const direction = traversal.direction;
    const destination = traversal.points[traversal.points.length - 1].clone();
    climbTraversal = null;
    player.position.copy(destination);

    if (direction === "down") {
      // Ensure the player is under the scene root and clear of the ladder collision box.
      if (player.parent !== scene) scene.attach(player);
      player.position.copy(destination);
      player.position.y = 0;
      climbing = false;
      Object.keys(input).forEach((key) => { input[key] = false; });
      resetJoystick();

      faceLadderAlongAscent(traversal.ascentDirection);
      triggerBabyAction("");
      message("Você desceu da escada e já pode se movimentar.");
    } else {
      // Stop the climb clip precisely at the top landing.
      climbing = true;
      player.position.copy(destination);
      triggerBabyAction("");
      message("Você chegou ao topo. Pegue o cereal ou toque para descer.");
    }
    updatePrompt();
    return true;
  }
  return false;
}

function interact() {
  if (state !== "PLAYING" || !player || !portableLadder || jumpActive) return;
  if (climbing) {
    if (climbTraversal) return;
    const cereal = items.find((i) => i.name === "Item_Cereal" && !i.collected);
    if (cereal && distXZ(player.position, cereal.position) <= HIGH_REACH) {
      collect(cereal);
      return;
    }
    if (!startLadderTraversal("down")) return;
    triggerBabyAction("climbDown");
    message("Descendo a escada...");
    updatePrompt();
    return;
  }
  if (cartPushing) {
    releaseCartParent();
    // Soltar sem interromper o analógico: conserva a velocidade de empurrão.
    if (cartVelocity.length() < 0.12 && cartHadPushMotion) cartVelocity.copy(cartLastPushVelocity);
    if (cartVelocity.length() < 0.2) {
      cartVelocity.set(Math.sin(cartYaw),0,Math.cos(cartYaw)).multiplyScalar(CART_PUSH_SPEED * 0.72);
    }
    cartPushing=false;cartHadPushMotion=false;cartPreviousPosition.copy(shoppingCart.position);
    setInteractionHighlight(null);updateJumpButtonState();
    message("Carrinho solto! Ele continuará rolando e desacelerará aos poucos.");
    updatePrompt();return;
  }
  if (shoppingCart && distXZ(player.position, worldPos(shoppingCart)) <= 1.45 && !ladderCarried) {
    cartPushing=true;
    cartYaw=Math.PI;
    cartVelocity.set(0,0,0);
    cartLastPushVelocity.set(0,0,0);
    cartHadPushMotion=false;
    player.rotation.y=player.userData.babyRig?.isGLTF ? cartYaw : 0;
    if(shoppingCart.parent!==scene)scene.attach(shoppingCart);
    shoppingCart.rotation.set(0,cartYaw,0);
    shoppingCart.position.set(
      player.position.x+Math.sin(cartYaw)*CART_PUSH_OFFSET,
      0,
      player.position.z+Math.cos(cartYaw)*CART_PUSH_OFFSET
    );
    shoppingCart.updateWorldMatrix(true,true);
    if(!alignBabyToCartAnchorsAndParent()) {
      cartPushing=false;
      message("Não foi possível ligar as mãos originais à alça do carrinho.");
      updatePrompt();
      return;
    }
    cartPreviousPosition.copy(worldPos(shoppingCart));
    message("Mãos ancoradas à alça. O carrinho acompanhará seus movimentos.");
    updatePrompt();
    return;
  }
  if (ladderCarried) {
    if (distXZ(player.position, ladderDropPosition) <= 1.22) {
      environment.attach(portableLadder);
      portableLadder.position.set(
        ladderDropPosition.x,
        0,
        ladderDropPosition.z
      );
      portableLadder.rotation.set(0, 0, 0);
      portableLadder.scale.set(1, 1, 1);
      ladderCarried = false;
      ladderPlaced = true;
      climbTraversal = null;
      // A escada foi colocada sob/ao lado do jogador em algumas posições.
      // Saia para um ponto livre calculado pelo volume real da escada antes de
      // reativar a colisão, para não prender o personagem no lugar.
      placePlayerSafelyBesideLadder();
      triggerBabyAction("ladderPlace");
      message("Escada posicionada! Aproxime-se para subir.");
    } else {
      message("Chegue mais perto da marca âmbar para apoiar a escada.");
    }
    updatePrompt();
    return;
  }
  const ladderPos = worldPos(portableLadder);
  const dLadder = distXZ(player.position, ladderPos);
  if (!ladderPlaced && dLadder <= 1.25) {
    player.attach(portableLadder);
    portableLadder.position.set(0.36, 0.42, 0.08);
    portableLadder.rotation.set(0, 0, -0.05);
    ladderCarried = true;
    triggerBabyAction("ladderPickup");
    message("Escada na mão! Leve-a até a marca âmbar.");
    updatePrompt();
    return;
  }
  if (ladderPlaced && dLadder <= 1.45) {
    climbing = true;
    if (!startLadderTraversal("up")) {
      climbing = false;
      return;
    }
    triggerBabyAction("climbStart");
    message("Subindo a escada...");
    updatePrompt();
    return;
  }
  const item = lowItemNear();
  if (item) {
    collect(item);
    updatePrompt();
    return;
  }
  const cereal = items.find((i) => i.name === "Item_Cereal" && !i.collected);
  if (
    cereal &&
    distXZ(player.position, cereal.position) <= 2.1 &&
    !ladderPlaced
  )
    message("Você precisa buscar a escada portátil primeiro.");
  else message("Não há nada ao alcance. Aproxime-se de um produto ou objeto.");
}
async function startGame() {
  if (!environment || !player) return;
  statsPanel.style.display = "none";
  statsCaption.style.display = "none";
  medalPanel.style.display = "none";
  await requestImmersiveMode();
  pauseOverlay.style.display = "none";
  pauseButton.style.display = "none";
  const session = ++countdownId;
  resetLadder();
  resetItems();
  resetShoppingCart();
  jumpActive = false;
  jumpVelocity = 0;
  player.position.copy(startPosition);
  player.position.y = 0;
  player.rotation.set(0, 0, 0);
  triggerBabyAction("");
  cameraYaw = 0;
  cameraPitch = INITIAL_CAMERA_PITCH;
  resetJoystick();
  timeLeft = ROUND_SECONDS;
  lastTimerText = -1;
  Object.keys(input).forEach((k) => (input[k] = false));
  state = "COUNTDOWN";
  document.body.classList.add("bm-require-landscape");
  hud.style.display = "block";
  listPanel.classList.remove("open");
  uiScreen.classList.remove("bm-result", "bm-win", "bm-gameover");
  uiSummary.textContent = "";
  uiSummary.style.display = "none";
  uiScreen.style.display = "flex";
  uiButton.style.display = "none";
  loadError.style.display = "none";
  for (const t of ["3", "2", "1", "VAMOS ÀS COMPRAS!"]) {
    if (session !== countdownId) return;
    uiTitle.textContent = t;
    uiTitle.style.color = "#fff";
    uiSubtitle.textContent =
      t === "VAMOS ÀS COMPRAS!"
        ? "Encontre os três produtos antes do tempo acabar!"
        : "Prepare-se...";
    await new Promise((resolve) => setTimeout(resolve, 650));
  }
  if (session !== countdownId) return;
  uiScreen.style.display = "none";
  statsPanel.style.display = "none";
  statsCaption.style.display = "none";
  uiButton.style.display = "inline-block";
  state = "PLAYING";
  lastFrame = performance.now();
  updatePauseButtonVisibility();
  updateJumpButtonState();
  updatePrompt();
  updateCamera(1);
}
function updatePauseButtonVisibility() {
  const canPause = state === "PLAYING";
  pauseButton.style.display = canPause ? "inline-flex" : "none";
  pauseButton.disabled = !canPause;
}
function pauseGame() {
  if (state !== "PLAYING") return;
  state = "PAUSED";
  Object.keys(input).forEach((key) => (input[key] = false));
  resetJoystick();
  cameraPointerId = null;
  hideAction();
  listPanel.classList.remove("open");
  pauseOverlay.style.display = "flex";
  updatePauseButtonVisibility();
}
function resumeGame() {
  if (state !== "PAUSED") return;
  state = "PLAYING";
  pauseOverlay.style.display = "none";
  Object.keys(input).forEach((key) => (input[key] = false));
  resetJoystick();
  cameraPointerId = null;
  lastFrame = performance.now();
  updatePauseButtonVisibility();
  updatePrompt();
}

function updateCamera(alpha) {
  if (!player) return;
  const horizontalDistance = CAMERA_DISTANCE * Math.cos(cameraPitch);
  targetCam.set(
    player.position.x + Math.sin(cameraYaw) * horizontalDistance,
    player.position.y + 0.72 + CAMERA_DISTANCE * Math.sin(cameraPitch),
    player.position.z + Math.cos(cameraYaw) * horizontalDistance
  );
  targetLook.set(player.position.x, player.position.y + 0.83, player.position.z);
  if (alpha >= 1) camera.position.copy(targetCam);
  else camera.position.lerp(targetCam, alpha);
  camera.lookAt(targetLook);
}
function movePlayer(dt) {
  if (state !== "PLAYING" || !player || climbing) return;
  const keyboardX = Number(input.right) - Number(input.left);
  const keyboardY = Number(input.up) - Number(input.down);
  const analogX = input.analogX;
  const analogY = -input.analogY;
  const strafe = keyboardX + analogX;
  const forward = keyboardY + analogY;
  const inputMagnitude = Math.min(1, Math.hypot(strafe, forward));
  if (inputMagnitude < 0.045) {
    player.userData.moveIntensity = 0;
    return;
  }

  // Inclinação parcial do analógico = caminhada; inclinação total = corrida.
  // O teclado continua com velocidade total para manter os controles desktop familiares.
  const keyboardActive = keyboardX !== 0 || keyboardY !== 0;
  const moveIntensity = keyboardActive ? 1 : inputMagnitude;
  const len = Math.hypot(strafe, forward);
  const localX = strafe / len;
  const localForward = forward / len;
  const sinYaw = Math.sin(cameraYaw);
  const cosYaw = Math.cos(cameraYaw);
  const dx = localX * cosYaw - localForward * sinYaw;
  const dz = -localX * sinYaw - localForward * cosYaw;
  let speed;
  if (ladderCarried) {
    // Keep the existing speed while carrying the ladder.
    const minimumCarrySpeed = LADDER_SPEED * 0.7;
    speed = minimumCarrySpeed + (LADDER_SPEED - minimumCarrySpeed) * moveIntensity;
  } else if (cartPushing) {
    // Empurrar limita a velocidade; ao soltar, a corrida normal é restaurada.
    speed = Math.min(CART_PUSH_SPEED, 0.65 + moveIntensity * 0.63);
  } else if (moveIntensity >= 0.84) {
    // Full-tilt running keeps its previously approved speed.
    speed = MOVE_SPEED;
  } else {
    // Walking is intentionally much slower to match the baby's walk cycle.
    const walkProgress = THREE.MathUtils.clamp(moveIntensity / 0.84, 0, 1);
    speed = 0.45 + (0.95 - 0.45) * Math.pow(walkProgress, 1.15);
  }
  const nx = player.position.x + dx * speed * dt;
  const nz = player.position.z + dz * speed * dt;
  const desiredYaw = Math.atan2(dx, dz);
  if (canStand(nx, player.position.z) &&
      (!cartPushing || cartCanStandForPlayer(nx, player.position.z, desiredYaw)))
    player.position.x = nx;
  if (canStand(player.position.x, nz) &&
      (!cartPushing || cartCanStandForPlayer(player.position.x, nz, desiredYaw)))
    player.position.z = nz;
  player.userData.moveIntensity = moveIntensity;
  cartYaw = Math.atan2(dx, dz);
  if (!ladderCarried) {
    // O modelo GLB do bebê tem o rosto voltado para +Z; o protótipo antigo
    // olha para -Z. Calcular a rotação conforme a orientação de cada rig
    // evita que ele caminhe de costas quando o analógico aponta para frente.
    const usesGLTFCharacter = player.userData.babyRig?.isGLTF === true;
    player.rotation.y = usesGLTFCharacter
      ? Math.atan2(dx, dz)
      : Math.atan2(-dx, -dz);
  }
}
function updateJumpButtonState() {
  if (!jumpButton) return;
  jumpButton.disabled = !(
    state === "PLAYING" &&
    !!player &&
    !climbing &&
    !ladderCarried &&
    !cartPushing &&
    !jumpActive
  );
}

function startJump() {
  if (
    state !== "PLAYING" ||
    !player ||
    climbing ||
    climbTraversal ||
    ladderCarried ||
    cartPushing ||
    jumpActive ||
    player.position.y > 0.03
  ) return false;

  jumpActive = true;
  jumpVelocity = JUMP_IMPULSE;
  triggerBabyAction("jump");
  updateJumpButtonState();
  return true;
}

function updateJump(dt) {
  if (state !== "PLAYING" || !player || !jumpActive) return;

  const nextVelocity = jumpVelocity - JUMP_GRAVITY * dt;
  const nextY = player.position.y + nextVelocity * dt;

  // Verifica somente obstáculos acima da altura normal do personagem.
  // Isso evita que as caixas de colisão laterais cancelem o salto quando o bebê
  // está andando/correndo junto a uma prateleira ou outro objeto.
  if (nextY > player.position.y) {
    const currentTop = player.position.y + PLAYER_HEIGHT;
    const nextTop = nextY + PLAYER_HEIGHT;
    const upwardClearance = new THREE.Box3(
      new THREE.Vector3(
        player.position.x - HALF_X,
        currentTop - 0.005,
        player.position.z - HALF_Z
      ),
      new THREE.Vector3(
        player.position.x + HALF_X,
        nextTop + 0.005,
        player.position.z + HALF_Z
      )
    );
    const blocksHeadroom = (box) => {
      // Collisores que já sobem pela altura normal do corpo são tratados pelo
      // movimento horizontal (canStand); aqui só contam obstáculos suspensos.
      if (box.max.y <= currentTop + 0.001) return false;
      if (box.min.y < currentTop - 0.02) return false;
      return upwardClearance.intersectsBox(box);
    };
    const ladderBox = ladderPlaced && portableLadder && !climbing
      ? new THREE.Box3().setFromObject(portableLadder)
      : null;
    const headBlocked =
      colliderBoxes.some(({ box }) => blocksHeadroom(box)) ||
      (!!ladderBox && blocksHeadroom(ladderBox));
    if (headBlocked) {
      jumpVelocity = 0;
      return;
    }
  }

  jumpVelocity = nextVelocity;
  if (nextY <= 0) {
    player.position.y = 0;
    jumpVelocity = 0;
    jumpActive = false;
    const rig = player.userData.babyRig;
    if (rig?.actionType === "jump") {
      rig.actionType = "";
      rig.actionTime = 0;
      rig.actionDuration = 0;
    }
    updateJumpButtonState();
    return;
  }

  player.position.y = nextY;
}

function triggerBabyAction(type) {
  if (!player) return;
  const rig = player.userData.babyRig;
  if (!rig) return;

  const durations = rig.isGLTF
    ? {
        pickup: 0.48,
        ladderPickup: 0.58,
        ladderPlace: 0.58,
        climbStart: 0.42,
        climbDown: 0.42,
        celebrate: 2.9,
        disappointed: 3.58,
      }
    : {
        pickup: 0.48,
        ladderPickup: 0.58,
        ladderPlace: 0.58,
        climbStart: 0.42,
        climbDown: 0.42,
        celebrate: 1.28,
        disappointed: 0.82,
      };

  rig.actionType = type || "";
  rig.actionTime = 0;
  rig.actionDuration = durations[type] || 0;
}

function updateBabyAnimation(dt, moved) {
  if (!player) return;
  const rig = player.userData.babyRig;
  if (!rig) return;

  if (rig.isGLTF) {
    updateGLTFBabyAnimation(dt, moved, rig);
    return;
  }

  rig.clock += dt;
  const isWalking = moved && state === "PLAYING" && !climbing;
  const moveIntensity = isWalking
    ? THREE.MathUtils.clamp(player.userData.moveIntensity ?? 1, 0.2, 1)
    : 0;
  const targetBlend = isWalking ? moveIntensity : 0;
  rig.walkBlend +=
    (targetBlend - rig.walkBlend) * (1 - Math.exp(-12 * dt));

  let actionStrength = 0;
  if (rig.actionType && rig.actionDuration > 0) {
    rig.actionTime += dt;
    const t = THREE.MathUtils.clamp(rig.actionTime / rig.actionDuration, 0, 1);
    // Ease in/out: as ações são visuais e nunca bloqueiam a interação.
    actionStrength = Math.sin(Math.PI * t);
    if (t >= 1) {
      rig.actionType = "";
      rig.actionTime = 0;
      rig.actionDuration = 0;
      actionStrength = 0;
    }
  }

  const blend = rig.walkBlend;
  const climbBlend = climbing && state === "PLAYING" ? 1 : 0;
  const pushBlend = cartPushing ? 1 : 0;
  const baseStrideRate = ladderCarried ? 7.1 : 9.4;
  const strideRate = !isWalking
    ? baseStrideRate * 0.72
    : moveIntensity >= 0.84
      ? baseStrideRate * (0.62 + 0.58 * moveIntensity)
      : baseStrideRate * (0.40 + 0.38 * moveIntensity);
  const phase = rig.clock * strideRate;
  const step = Math.sin(phase);
  const climbPhase = rig.clock * 8.0;

  // A animação modifica apenas a malha visual; posição lógica e colisões não mudam.
  const idleBreath = Math.sin(rig.clock * 2.0) * 0.006;
  const walkingBounce = Math.abs(step) * 0.024 * blend;
  const climbingBounce = Math.abs(Math.sin(climbPhase)) * 0.009 * climbBlend;
  const actionDip = actionStrength *
    (rig.actionType === "pickup" || rig.actionType === "ladderPlace" ? 0.018 : 0.006);
  const celebrationStrength = rig.actionType === "celebrate" ? actionStrength : 0;
  rig.visual.position.y =
    idleBreath * (1 - blend) + walkingBounce + climbingBounce - actionDip + 0.10 * celebrationStrength;
  const forwardLean = rig.actionType === "pickup" ? 0.28 :
    rig.actionType === "ladderPlace" ? 0.22 :
    rig.actionType === "ladderPickup" ? 0.14 :
    rig.actionType === "climbStart" ? 0.10 :
    rig.actionType === "climbDown" ? 0.07 :
    rig.actionType === "disappointed" ? 0.18 : 0;

  rig.torso.rotation.x =
    -0.045 * blend - 0.10 * pushBlend +
    Math.sin(rig.clock * 1.4) * 0.012 * (1 - blend) -
    forwardLean * actionStrength - 0.10 * climbBlend;

  rig.headPivot.rotation.x =
    0.025 * Math.sin(rig.clock * 1.25) +
    0.025 * blend -
    forwardLean * 0.72 * actionStrength -
    0.04 * climbBlend +
    0.12 * celebrationStrength;
  rig.headPivot.rotation.z =
    0.022 * Math.sin(rig.clock * 0.82) +
    0.025 * step * blend;

  for (let i = 0; i < rig.legs.length; i++) {
    const leg = rig.legs[i];
    const phaseOffset = i === 0 ? 0 : Math.PI;
    const legStep = Math.sin(phase + phaseOffset);
    const climbStep = Math.sin(climbPhase + phaseOffset);
    const actionLegWeight = rig.actionType === "climbStart" ||
      rig.actionType === "climbDown" ? 0.2 : 0.06;
    leg.pivot.rotation.x =
      legStep * 0.58 * blend +
      Math.sin(rig.clock * 1.5 + phaseOffset) * 0.012 * (1 - blend) +
      climbStep * 0.34 * climbBlend +
      actionLegWeight * actionStrength * Math.max(0, climbStep);
    leg.pivot.rotation.z = leg.side * 0.018 * blend;
    leg.foot.rotation.x =
      -Math.max(0, legStep) * 0.18 * blend +
      -Math.max(0, climbStep) * 0.10 * climbBlend;
  }

  for (let i = 0; i < rig.arms.length; i++) {
    const arm = rig.arms[i];
    const phaseOffset = i === 0 ? 0 : Math.PI;
    const armStep = Math.sin(phase + phaseOffset);
    const climbStep = Math.sin(climbPhase + phaseOffset);
    const isPickup = rig.actionType === "pickup";
    const actionArmWeight = isPickup ? (i === 1 ? 1 : 0.18) : 1;
    const reach = rig.actionType === "pickup" ? 1.02 :
      rig.actionType === "ladderPickup" ? 0.78 :
      rig.actionType === "ladderPlace" ? 0.48 :
      rig.actionType === "climbStart" ? 0.72 :
      rig.actionType === "climbDown" ? 0.58 : 0;

    arm.pivot.rotation.x =
      -armStep * 0.38 * blend * (1-pushBlend) +
      Math.sin(rig.clock * 1.3 + phaseOffset) * 0.018 * (1 - blend) +
      2.05 * pushBlend - reach * actionStrength * actionArmWeight -
      climbStep * 0.66 * climbBlend;
    arm.pivot.rotation.z =
      arm.side * 0.015 * blend * (1-pushBlend) +
      arm.side * 0.14 * actionStrength * actionArmWeight -
      arm.side * 0.38 * pushBlend + arm.side * 1.05 * celebrationStrength;
  }
}

function updateTimer(dt) {
  if (state !== "PLAYING") return;
  timeLeft = Math.max(0, timeLeft - dt);
  const n = Math.ceil(timeLeft);
  if (n !== lastTimerText) {
    timerValue.textContent = String(n);
    timerCard.classList.toggle("urgent", n <= 15);
    lastTimerText = n;
  }
  if (timeLeft <= 0) finish(false);
}
async function requestImmersiveMode() {
  // Browsers only allow fullscreen/orientation lock after a user gesture.
  try {
    if (
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen
    ) {
      await document.documentElement.requestFullscreen({
        navigationUI: "hide",
      });
    }
  } catch (err) {
    console.info(
      "[BabyMarket] Tela cheia indisponível neste navegador/modo.",
      err
    );
  }
  try {
    if (screen.orientation && screen.orientation.lock)
      await screen.orientation.lock("landscape");
  } catch (err) {
    console.info(
      "[BabyMarket] Bloqueio horizontal não suportado; use a rotação automática do celular."
    );
  }
}
function setupControls() {
  const keyMap = {
    ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  };
  window.addEventListener("keydown", (e) => {
    if (keyMap[e.code]) {
      input[keyMap[e.code]] = true;
      e.preventDefault();
    }
    if (e.code === "KeyE" && !e.repeat) {
      e.preventDefault();
      interact();
    }
    if (e.code === "Space" && !e.repeat) {
      e.preventDefault();
      startJump();
    }
    if (e.code === "KeyC") {
      cameraYaw = 0;
      cameraPitch = INITIAL_CAMERA_PITCH;
      updateCamera(1);
    }
    if (e.code === "Escape") {
      if (state === "PAUSED") resumeGame();
      else listPanel.classList.remove("open");
    }
  });
  window.addEventListener("keyup", (e) => {
    if (keyMap[e.code]) {
      input[keyMap[e.code]] = false;
      e.preventDefault();
    }
  });
  window.addEventListener("blur", () => {
    Object.keys(input).forEach((k) => (input[k] = false));
    resetJoystick();
    cameraPointerId = null;
  });
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  function placeFloatingJoystick(e) {
    // O joystick só pode aparecer no quadrante inferior esquerdo; a faixa superior fica livre.
    const halfWidth = joystickBase.offsetWidth / 2;
    const halfHeight = joystickBase.offsetHeight / 2;
    const minX = halfWidth + 4;
    const maxX = Math.max(minX, innerWidth * 0.5 - halfWidth - 4);
    const minY = innerHeight * 0.5 + halfHeight + 4;
    const maxY = Math.max(minY, innerHeight - halfHeight - 20);
    const visualX = clamp(e.clientX, minX, maxX);
    const visualY = clamp(e.clientY, minY, maxY);
    joystick.style.left = (visualX - halfWidth) + "px";
    joystick.style.top = (visualY - halfHeight) + "px";
    joystick.classList.add("active");
    joystickOriginX = e.clientX;
    joystickOriginY = e.clientY;
  }
  function updateJoystick(e) {
    const maxDistance = (joystickBase.offsetWidth - joystickKnob.offsetWidth) * 0.48;
    let dx = e.clientX - joystickOriginX;
    let dy = e.clientY - joystickOriginY;
    const distance = Math.hypot(dx, dy);
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      dx *= scale;
      dy *= scale;
    }
    const x = dx / maxDistance;
    const y = dy / maxDistance;
    const deadZone = 0.09;
    input.analogX = Math.abs(x) < deadZone ? 0 : x;
    input.analogY = Math.abs(y) < deadZone ? 0 : y;
    const magnitude = Math.min(1, Math.hypot(input.analogX, input.analogY));
    joystick.classList.toggle("running", magnitude > 0.88);
    joystickKnob.style.transform = "translate(calc(-50% + " + dx + "px),calc(-50% + " + dy + "px))";
  }
  // Arraste o lado direito da tela para orbitar a câmera.
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (state !== "PLAYING") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.clientX < innerWidth * 0.5) {
      // A metade superior esquerda não aciona o joystick nem inicia a órbita da câmera.
      if (e.clientY < innerHeight * 0.5) return;
      if (joystickPointerId !== null) return;
      joystickPointerId = e.pointerId;
      placeFloatingJoystick(e);
      updateJoystick(e);
      if (renderer.domElement.setPointerCapture) renderer.domElement.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    cameraPointerId = e.pointerId;
    lastCameraX = e.clientX;
    lastCameraY = e.clientY;
    if (renderer.domElement.setPointerCapture) renderer.domElement.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (e.pointerId === joystickPointerId) {
      e.preventDefault();
      updateJoystick(e);
      return;
    }
    if (e.pointerId !== cameraPointerId) return;
    const deltaX = e.clientX - lastCameraX;
    const deltaY = e.clientY - lastCameraY;
    lastCameraX = e.clientX;
    lastCameraY = e.clientY;
    cameraYaw -= deltaX * 0.006;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch + deltaY * 0.0045, 0.10, 0.92);
    e.preventDefault();
  });
  const endCameraDrag = (e) => {
    if (e && e.pointerId !== cameraPointerId) return;
    cameraPointerId = null;
  };
  const endJoystickDrag = (e) => {
    if (e && e.pointerId !== joystickPointerId) return;
    resetJoystick();
  };
  renderer.domElement.addEventListener("pointerup", endJoystickDrag);
  renderer.domElement.addEventListener("pointercancel", endJoystickDrag);
  renderer.domElement.addEventListener("lostpointercapture", endJoystickDrag);
  renderer.domElement.addEventListener("pointerup", endCameraDrag);
  renderer.domElement.addEventListener("pointercancel", endCameraDrag);
  renderer.domElement.addEventListener("lostpointercapture", endCameraDrag);

  // Pointerdown não espera o click terminar; permite soltar enquanto outro dedo move o analógico.
  interactButton.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();e.stopPropagation();interact();
  });
  interactButton.addEventListener("click", (e) => {
    e.preventDefault();if (e.detail === 0) interact();
  });
  // Dispara no pointerdown para funcionar também com um dedo segurando o
  // analógico e outro tocando PULAR; não depende da síntese posterior de click.
  jumpButton.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    startJump();
  });
  // Mantém acessibilidade por teclado/leitor de tela, sem duplicar o toque.
  jumpButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.detail === 0) startJump();
  });
  listToggle.addEventListener("click", () => listPanel.classList.toggle("open"));
  cameraResetButton.addEventListener("click", (e) => {
    e.preventDefault();
    cameraYaw = 0;
    cameraPitch = INITIAL_CAMERA_PITCH;
    updateCamera(1);
  });
  fullscreenButton.addEventListener("click", async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch (e) {}
    } else await requestImmersiveMode();
  });
  pauseButton.addEventListener("click", pauseGame);
  resumeButton.addEventListener("click", resumeGame);
  restartPauseButton.addEventListener("click", () => {
    if (state !== "PAUSED") return;
    pauseOverlay.style.display = "none";
    startGame();
  });
  pauseOverlay.addEventListener("click", (e) => {
    if (e.target === pauseOverlay) resumeGame();
  });
  uiButton.addEventListener("click", startGame);
}
function showLoadError(error) {
  console.error("[BabyMarket] Erro ao carregar cenário:", error);
  document.body.classList.remove("bm-require-landscape");
  state = "LOAD_ERROR";
  uiTitle.textContent = "CENÁRIO NÃO CARREGADO";
  uiSubtitle.textContent =
    "Não foi possível abrir o arquivo GLB. Confira se BabyMarket_Cenario_v1.glb está na raiz publicada do repositório.";
  loadError.textContent = "Detalhes técnicos no console do navegador.";
  loadError.style.display = "block";
  uiButton.textContent = "AGUARDANDO CORREÇÃO";
  uiButton.disabled = true;
}
function loadPortableLadderAsset() {
  return new Promise((resolve) => {
    if (!portableLadder) {
      resolve(false);
      return;
    }

    const url = new URL("../assets/models/babymarket-ladder.glb?v=1", import.meta.url).href;
    new GLTFLoader().load(
      url,
      (gltf) => {
        try {
          const visual = gltf.scene;
          visual.name = "PortableLadder_Asset_GLTF";
          visual.position.set(0, 0, 0);
          visual.updateMatrixWorld(true);

          const rawBounds = new THREE.Box3().setFromObject(visual);
          const rawSize = rawBounds.getSize(new THREE.Vector3());
          if (
            rawSize.y < 1.2 || rawSize.y > 1.8 ||
            rawSize.x < 0.35 || rawSize.z < 0.35
          ) {
            throw new Error("As dimensões do GLB da escada estão fora do esperado.");
          }

          // O GLB tem os degraus no eixo Z local (base em +Z, plataforma em -Z).
          // O quarto de volta alinha a subida ao eixo X do cenário; as escalas mantêm
          // o volume final dentro de 0,70 m de profundidade × 1,50 m de altura × 0,90 m de largura.
          visual.rotation.set(0, Math.PI / 2, 0);
          visual.scale.set(0.90 / rawSize.x, 1.50 / rawSize.y, 0.70 / rawSize.z);

          visual.traverse((object) => {
            if (object.isMesh) {
              object.castShadow = true;
              object.receiveShadow = true;
              object.frustumCulled = true;
            }
          });

          // Analyze the candidate before removing the working ladder fallback.
          const candidateRoot = new THREE.Group();
          candidateRoot.add(visual);
          candidateRoot.updateMatrixWorld(true);
          const treadSurfaces = detectLadderTreadSurfaces(candidateRoot);
          candidateRoot.remove(visual);
          if (treadSurfaces.length < 4) {
            throw new Error("Não foi possível identificar as superfícies dos degraus na malha.");
          }

          // Preserve the existing interaction root and replace only its visual children.
          portableLadder.clear();
          portableLadder.add(visual);
          portableLadder.userData.usesGLTFAsset = true;
          portableLadder.userData.treadSurfacesLocal = treadSurfaces;
          portableLadder.updateMatrixWorld(true);

          console.info(
            "[BabyMarket] Superfícies dos degraus identificadas: " +
            treadSurfaces.length + "."
          );

          console.info(
            "[BabyMarket] Escada GLB carregada e orientada; dimensões base: " +
            rawSize.x.toFixed(2) + " × " + rawSize.y.toFixed(2) + " × " +
            rawSize.z.toFixed(2) + " m."
          );
          resolve(true);
        } catch (error) {
          console.warn("[BabyMarket] Não foi possível preparar a escada GLB; usando a escada provisória.", error);
          resolve(false);
        }
      },
      undefined,
      (error) => {
        console.info("[BabyMarket] Escada GLB não encontrada; usando a escada provisória.", error);
        resolve(false);
      }
    );
  });
}

function loadScenario() {
  const url = new URL("../BabyMarket_Cenario_v1.glb?v=1", import.meta.url).href;
  new GLTFLoader().load(
    url,
    (gltf) => {
      try {
        environment = gltf.scene;
        environment.name = "BabyMarket_Environment_Runtime";
        scene.add(environment);
        environment.updateMatrixWorld(true);
        const group = environment.getObjectByName("Colliders_Group");
        portableLadder = environment.getObjectByName("PortableLadder_Mesh");
        ladderDropZone = environment.getObjectByName("Shelf_B_LadderDropZone");
        const start = environment.getObjectByName("Start_Zone");
        const banana = environment.getObjectByName("Item_Banana");
        const apple = environment.getObjectByName("Item_Apple");
        const cereal = environment.getObjectByName("Item_Cereal");
        if (
          !group ||
          !portableLadder ||
          !ladderDropZone ||
          !start ||
          !banana ||
          !apple ||
          !cereal
        )
          throw new Error(
            "Faltam objetos obrigatórios no GLB. Verifique os nomes semânticos."
          );
        colliderBoxes = group.children
          .filter(
            (o) =>
              o.userData?.isCollider === true || o.name.startsWith("Collider_")
          )
          .map((o) => {
            const c = makeBox(o);
            o.visible = false;
            return c;
          });
        if (!colliderBoxes.length)
          throw new Error("Nenhum colisor foi encontrado no GLB.");
        startPosition = worldPos(start);
        startPosition.y = 0;
        ladderStartPosition = portableLadder.position.clone();
        ladderStartPosition.y = 0;
        ladderDropPosition = worldPos(ladderDropZone);
        ladderDropPosition.y = 0;
        // Small runtime correction: move banana onto the center of the east produce crate.
        banana.position.x = -7.35;
        environment.updateMatrixWorld(true);
        items = [
          {
            name: "Item_Banana",
            label: "Banana",
            object: banana,
            position: worldPos(banana),
            collected: false,
          },
          {
            name: "Item_Apple",
            label: "Maçã",
            object: apple,
            position: worldPos(apple),
            collected: false,
          },
          {
            name: "Item_Cereal",
            label: "Cereal",
            object: cereal,
            position: worldPos(cereal),
            collected: false,
          },
        ];
        // O fallback visual fica disponível caso o novo GLB não carregue.
        const ladderAssetReady = loadPortableLadderAsset();
        const cartAssetReady = loadShoppingCartAsset();
        const fallbackPlayer = createBaby();
        fallbackPlayer.visible = false;
        fallbackPlayer.position.copy(startPosition);
        player = fallbackPlayer;
        scene.add(fallbackPlayer);

        function finishScenarioReady(usingFallback) {
          Promise.all([ladderAssetReady, cartAssetReady]).then(([usingCustomLadder, usingOriginalCart]) => {
            camera.position.set(0, 5.5, 13);
            camera.lookAt(0, 0.7, 0);
            updateList();
            state = "MENU";
            uiTitle.textContent = "BABYMARKET";
            uiSubtitle.textContent = usingFallback
              ? "O cenário está pronto, mas o bebê 3D não carregou. Vamos usar o personagem provisório."
              : (!usingCustomLadder
                ? "O bebê 3D carregou, mas a escada otimizada não foi encontrada. Usando a escada provisória."
                : (!usingOriginalCart
                  ? "Cenário pronto. O carrinho original não carregou; usando a versão provisória."
                  : "O mini supermercado está pronto. Experimente o carrinho original e encontre os 3 produtos."));
            uiSummary.textContent = "";
            uiSummary.style.display = "none";
            updateStatsPanel();
            statsPanel.style.display = "grid";
            statsCaption.style.display = "block";
            uiButton.textContent = "INICIAR JOGO";
            uiButton.disabled = false;
            uiButton.style.display = "inline-block";
            loadError.style.display = "none";
            uiScreen.classList.remove("bm-result", "bm-win", "bm-gameover");
            console.info(
              "[BabyMarket] Cenário carregado: " + colliderBoxes.length +
              " colisores; " + items.length + " itens de teste; personagem " +
              (usingFallback ? "provisório." : "GLB ativo.") + "; escada " +
              (usingCustomLadder ? "GLB otimizada." : "provisória.") + "; carrinho " +
              (usingOriginalCart ? "Tripo original." : "provisório.")
            );
          });
        }

        state = "LOADING_CHARACTER";
        uiTitle.textContent = "CARREGANDO PERSONAGEM 3D...";
        uiSubtitle.textContent = "Preparando o bebê e suas animações.";
        uiButton.textContent = "CARREGANDO...";
        uiButton.disabled = true;
        uiButton.style.display = "inline-block";

        const babyUrl = new URL("../assets/models/baby-player.glb?v=1", import.meta.url).href;
        new GLTFLoader().load(
          babyUrl,
          (babyGltf) => {
            try {
              const importedPlayer = createBabyFromGLTF(babyGltf);
              importedPlayer.position.copy(startPosition);
              importedPlayer.rotation.copy(fallbackPlayer.rotation);
              scene.remove(fallbackPlayer);
              player = importedPlayer;
              scene.add(player);
              finishScenarioReady(false);
            } catch (characterError) {
              console.error("[BabyMarket] Falha ao preparar o personagem GLB; usando provisório.", characterError);
              fallbackPlayer.visible = true;
              finishScenarioReady(true);
            }
          },
          undefined,
          (characterError) => {
            console.error("[BabyMarket] Falha ao carregar o personagem GLB; usando provisório.", characterError);
            fallbackPlayer.visible = true;
            finishScenarioReady(true);
          }
        );
      } catch (e) {
        showLoadError(e);
      }
    },
    undefined,
    showLoadError
  );
}
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
  lastFrame = now;
  const beforeX = player ? player.position.x : 0;
  const beforeZ = player ? player.position.z : 0;
  // Atualiza primeiro o eixo vertical; assim, o primeiro quadro do salto
  // não é deslocado pelo analógico antes da verificação de espaço livre.
  updateJump(dt);
  movePlayer(dt);
  const climbTraversalFinished = updateClimbTraversal(dt);
  const movedDistance = player ? Math.hypot(player.position.x - beforeX, player.position.z - beforeZ) : 0;
  const actuallyMoved = movedDistance > 0.0005;
  updateShoppingCart(dt, movedDistance);
  if (state !== "PAUSED") {
    updateBabyAnimation(dt, actuallyMoved && !climbTraversalFinished);
    updateCollectEffects(dt);
  }
  if (activeInteractionHighlight) activeInteractionHighlight.update();
  updateTimer(dt);
  if (state === "PLAYING") updatePrompt();
  updateJumpButtonState();
  if (
    player &&
    (state === "PLAYING" ||
      state === "COUNTDOWN" ||
      state === "WIN" ||
      state === "GAMEOVER")
  )
    updateCamera(1 - Math.exp(-6 * dt));
  renderer.render(scene, camera);
}
setupControls();
loadScenario();
requestAnimationFrame(animate);
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setSize(innerWidth, innerHeight);
});

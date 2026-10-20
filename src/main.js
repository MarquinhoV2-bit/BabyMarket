import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// BabyMarket — primeira integração do cenário GLB (protótipo de teste).
const css = document.createElement("style");
css.textContent = `
  #game-canvas { position:fixed; inset:0; z-index:0; }
  #game-canvas canvas { display:block; width:100%; height:100%; }
  #ui-subtitle { color:#dbeafe; max-width:520px; margin:0 0 12px; padding:0 12px; text-align:center; line-height:1.45; }
  #load-error { display:none; color:#fecaca; max-width:520px; padding:0 16px; text-align:center; }
  #hud { display:none; position:fixed; inset:0; z-index:20; color:#fff; pointer-events:none; font-family:system-ui,sans-serif; }
  #hud-top { position:absolute; top:max(9px, env(safe-area-inset-top)); left:9px; right:9px; display:flex; align-items:flex-start; justify-content:space-between; gap:8px; pointer-events:auto; }
  .bm-panel { background:rgba(15,23,42,.91); border:1px solid rgba(255,255,255,.18); border-radius:12px; padding:10px 12px; box-shadow:0 4px 18px #0003; backdrop-filter:blur(6px); }
  #timer-card { font-variant-numeric:tabular-nums; font-weight:900; font-size:20px; min-width:84px; }
  #timer-card.urgent { color:#fecaca; border-color:#f87171; }
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
  #joystick-base { pointer-events:none; }
  #joystick-base { position:relative; width:112px; height:112px; border:2px solid rgba(255,255,255,.58); border-radius:50%; background:radial-gradient(circle, rgba(148,163,184,.42), rgba(15,23,42,.76)); box-shadow:0 4px 18px #0005, inset 0 0 0 7px #ffffff0d; touch-action:none; }
  #joystick-knob { position:absolute; left:50%; top:50%; width:44px; height:44px; transform:translate(-50%,-50%); border:2px solid #fff; border-radius:50%; background:linear-gradient(145deg,#e2e8f0,#64748b); box-shadow:0 3px 10px #0007; pointer-events:none; }
  #joystick-label { color:#fff; font-size:10px; font-weight:900; letter-spacing:.08em; text-shadow:0 2px 5px #000; pointer-events:none; }
  #interact-btn { position:fixed; right:max(12px, env(safe-area-inset-right)); bottom:max(12px, env(safe-area-inset-bottom)); z-index:28; pointer-events:auto; min-width:min(118px, calc(50vw - 24px)); max-width:calc(50vw - 24px); min-height:51px; padding:9px 12px; background:linear-gradient(#fbbf24,#f59e0b); color:#422006; border-color:#fde68a; font-size:12px; }
  #interact-btn:disabled { display:none; }
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
    #list-toggle, #fullscreen-btn { min-height:34px; padding:7px 9px; font-size:12px; }
    #list-panel { top:calc(max(5px, env(safe-area-inset-top)) + 40px); right:6px; }
    #mobile-controls { left:7px; right:7px; bottom:max(5px, env(safe-area-inset-bottom)); }
    #joystick-base { width:94px; height:94px; }
    #joystick-knob { width:38px; height:38px; }
    #joystick-label { font-size:9px; }
    #interact-btn { min-width:104px; min-height:42px; padding:6px 9px; }
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
const loadError = document.createElement("p");
loadError.id = "load-error";
uiScreen.insertBefore(loadError, uiButton);

const hud = document.createElement("div");
hud.id = "hud";
hud.innerHTML = `
  <div id="hud-top">
    <div id="timer-card" class="bm-panel">⏱️ <span id="timer-value">90</span></div>
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
    <button id="interact-btn" disabled>INTERAGIR</button>
  </div>
  <div id="controls-help">Mover: WASD / setas · Interagir: E ou Espaço</div>
`;
document.body.appendChild(hud);
const rotateNotice = document.createElement("div");
rotateNotice.id = "rotate-notice";
rotateNotice.innerHTML =
  '<div>📱 GIRE O CELULAR<br><span style="font-size:.58em;font-weight:600">O BabyMarket fica melhor na horizontal</span></div>';
document.body.appendChild(rotateNotice);

const timerValue = hud.querySelector("#timer-value");
const timerCard = hud.querySelector("#timer-card");
const listToggle = hud.querySelector("#list-toggle");
const listPanel = hud.querySelector("#list-panel");
const listCount = hud.querySelector("#list-count");
const listHelp = hud.querySelector("#list-help");
const interactionMessage = hud.querySelector("#interaction-message");
const interactButton = hud.querySelector("#interact-btn");
const fullscreenButton = hud.querySelector("#fullscreen-btn");
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
  joystick.classList.remove("active");
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
    arms.push({ pivot: armPivot, side });

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
}
function finish(won) {
  document.body.classList.remove("bm-require-landscape");
  state = won ? "WIN" : "GAMEOVER";
  Object.keys(input).forEach((k) => (input[k] = false));
  uiScreen.style.display = "flex";
  hud.style.display = "block";
  uiTitle.textContent = won ? "LISTA COMPLETA!" : "TEMPO ESGOTADO!";
  uiTitle.style.color = won ? "#86efac" : "#fecaca";
  uiSubtitle.textContent = won
    ? "Você encontrou todos os produtos do mini supermercado!"
    : "O tempo acabou. Tente uma rota melhor e use a escada para pegar o cereal.";
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

  if (climbing) {
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
function interact() {
  if (state !== "PLAYING" || !player || !portableLadder) return;
  if (climbing) {
    const cereal = items.find((i) => i.name === "Item_Cereal" && !i.collected);
    if (cereal && distXZ(player.position, cereal.position) <= HIGH_REACH) {
      collect(cereal);
      return;
    }
    player.position.set(
      ladderDropPosition.x + 0.72,
      0,
      ladderDropPosition.z + 0.12
    );
    player.rotation.y = 0;
    climbing = false;
    triggerBabyAction("climbDown");
    message("Você desceu da escada.");
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
    player.position.set(
      ladderDropPosition.x + 0.72,
      1.03,
      ladderDropPosition.z + 0.12
    );
    player.rotation.y = Math.PI / 2;
    triggerBabyAction("climbStart");
    message("Subiu na escada. Agora pegue o cereal!");
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
  await requestImmersiveMode();
  const session = ++countdownId;
  resetLadder();
  resetItems();
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
  uiButton.style.display = "inline-block";
  state = "PLAYING";
  lastFrame = performance.now();
  updatePrompt();
  updateCamera(1);
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
  const strafe = Number(input.right) - Number(input.left) + input.analogX;
  const forward = Number(input.up) - Number(input.down) - input.analogY;
  if (Math.abs(strafe) < 0.001 && Math.abs(forward) < 0.001) return;
  const len = Math.hypot(strafe, forward);
  const localX = strafe / len;
  const localForward = forward / len;
  const sinYaw = Math.sin(cameraYaw);
  const cosYaw = Math.cos(cameraYaw);
  const dx = localX * cosYaw - localForward * sinYaw;
  const dz = -localX * sinYaw - localForward * cosYaw;
  const speed = ladderCarried ? LADDER_SPEED : MOVE_SPEED;
  const nx = player.position.x + dx * speed * dt;
  const nz = player.position.z + dz * speed * dt;
  if (canStand(nx, player.position.z)) player.position.x = nx;
  if (canStand(player.position.x, nz)) player.position.z = nz;
  if (!ladderCarried) player.rotation.y = Math.atan2(-dx, -dz);
}
function triggerBabyAction(type) {
  if (!player) return;
  const rig = player.userData.babyRig;
  if (!rig) return;
  const durations = {
    pickup: 0.48,
    ladderPickup: 0.58,
    ladderPlace: 0.58,
    climbStart: 0.42,
    climbDown: 0.42,
  };
  rig.actionType = type || "";
  rig.actionTime = 0;
  rig.actionDuration = durations[type] || 0;
}

function updateBabyAnimation(dt, moved) {
  if (!player) return;
  const rig = player.userData.babyRig;
  if (!rig) return;

  rig.clock += dt;
  const isWalking = moved && state === "PLAYING" && !climbing;
  const targetBlend = isWalking ? 1 : 0;
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
  const strideRate = ladderCarried ? 7.1 : 9.4;
  const phase = rig.clock * strideRate;
  const step = Math.sin(phase);
  const climbPhase = rig.clock * 8.0;

  // A animação modifica apenas a malha visual; posição lógica e colisões não mudam.
  const idleBreath = Math.sin(rig.clock * 2.0) * 0.006;
  const walkingBounce = Math.abs(step) * 0.024 * blend;
  const climbingBounce = Math.abs(Math.sin(climbPhase)) * 0.009 * climbBlend;
  const actionDip = actionStrength *
    (rig.actionType === "pickup" || rig.actionType === "ladderPlace" ? 0.018 : 0.006);
  rig.visual.position.y =
    idleBreath * (1 - blend) + walkingBounce + climbingBounce - actionDip;

  const forwardLean = rig.actionType === "pickup" ? 0.28 :
    rig.actionType === "ladderPlace" ? 0.22 :
    rig.actionType === "ladderPickup" ? 0.14 :
    rig.actionType === "climbStart" ? 0.10 :
    rig.actionType === "climbDown" ? 0.07 : 0;

  rig.torso.rotation.x =
    -0.045 * blend +
    Math.sin(rig.clock * 1.4) * 0.012 * (1 - blend) -
    forwardLean * actionStrength -
    0.10 * climbBlend;

  rig.headPivot.rotation.x =
    0.025 * Math.sin(rig.clock * 1.25) +
    0.025 * blend -
    forwardLean * 0.72 * actionStrength -
    0.04 * climbBlend;
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
      -armStep * 0.38 * blend +
      Math.sin(rig.clock * 1.3 + phaseOffset) * 0.018 * (1 - blend) -
      reach * actionStrength * actionArmWeight -
      climbStep * 0.66 * climbBlend;
    arm.pivot.rotation.z =
      arm.side * 0.015 * blend +
      arm.side * 0.14 * actionStrength * actionArmWeight;
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
    if ((e.code === "KeyE" || e.code === "Space") && !e.repeat) {
      e.preventDefault();
      interact();
    }
    if (e.code === "KeyC") {
      cameraYaw = 0;
      cameraPitch = INITIAL_CAMERA_PITCH;
      updateCamera(1);
    }
    if (e.code === "Escape") listPanel.classList.remove("open");
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
    input.analogX = Math.abs(x) < 0.09 ? 0 : x;
    input.analogY = Math.abs(y) < 0.09 ? 0 : y;
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

  interactButton.addEventListener("click", (e) => { e.preventDefault(); interact(); });
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
        player = createBaby();
        player.position.copy(startPosition);
        scene.add(player);
        camera.position.set(0, 5.5, 13);
        camera.lookAt(0, 0.7, 0);
        updateList();
        state = "MENU";
        uiTitle.textContent = "BABYMARKET";
        uiSubtitle.textContent =
          "O mini supermercado está pronto. Encontre os 3 produtos e experimente a escada.";
        uiButton.textContent = "INICIAR JOGO";
        uiButton.disabled = false;
        uiButton.style.display = "inline-block";
        loadError.style.display = "none";
        console.info(
          `[BabyMarket] GLB carregado: ${colliderBoxes.length} colisores; ${items.length} itens de teste.`
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
  movePlayer(dt);
  const actuallyMoved = !!player &&
    Math.hypot(player.position.x - beforeX, player.position.z - beforeZ) > 0.0005;
  updateBabyAnimation(dt, actuallyMoved);
  updateCollectEffects(dt);
  if (activeInteractionHighlight) activeInteractionHighlight.update();
  updateTimer(dt);
  if (state === "PLAYING") updatePrompt();
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

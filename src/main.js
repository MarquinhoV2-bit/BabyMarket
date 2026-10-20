import * as THREE from 'three';

// 1. Configuração da Cena e Câmera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 2. Chão e Jogador
const floorGeometry = new THREE.PlaneGeometry(10, 60);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -25;
scene.add(floor);

const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
scene.add(player);

// Variáveis para gerir os múltiplos obstáculos e o objetivo
let enemies = [];
let goalMesh = null;
const goalBox = new THREE.Box3();
const playerBox = new THREE.Box3();

// 3. Sistema Dinâmico de Level Design (Lê o JSON)
async function loadLevel() {
    try {
        // Pede o ficheiro JSON ao servidor
        const response = await fetch('./assets/data/level_1.json?v=5');
        const levelData = await response.json();

        // Moldes para os obstáculos e objetivo
        const enemyGeom = new THREE.SphereGeometry(0.5, 16, 16);
        const enemyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const goalGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
        const goalMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

        // Gera os obstáculos baseados nas coordenadas do JSON
        levelData.obstacles.forEach(obs => {
            const enemy = new THREE.Mesh(enemyGeom, enemyMat);
            enemy.position.set(obs.x, 0.5, obs.z);
            scene.add(enemy);
            enemies.push({ mesh: enemy, box: new THREE.Box3() });
        });

        // Gera a linha de chegada
        goalMesh = new THREE.Mesh(goalGeom, goalMat);
        goalMesh.position.set(levelData.goal.x, 0.5, levelData.goal.z);
        scene.add(goalMesh);
        
        console.log("Fase carregada do JSON com sucesso!");
    } catch (error) {
        console.error("Erro ao carregar o nível:", error);
    }
}
loadLevel();

// 4. Interface de Usuário (HUD)
const uiScreen = document.getElementById('ui-screen');
const uiTitle = document.getElementById('ui-title');
const uiBtn = document.getElementById('ui-btn');

let gameState = 'MENU';
let playerSpeedX = 0;
const forwardSpeed = 0.15;

function resetGame() {
    player.position.set(0, 0.5, 0);
    playerSpeedX = 0;
    camera.position.set(0, 3, 5);
    uiScreen.style.display = 'none';
    gameState = 'PLAYING';
}
uiBtn.addEventListener('click', resetGame);

// 5. Controles Touch
window.addEventListener('touchstart', (event) => {
    if (gameState !== 'PLAYING') return;
    const touchX = event.touches[0].clientX;
    playerSpeedX = touchX < window.innerWidth / 2 ? -0.15 : 0.15;
});
window.addEventListener('touchend', () => { playerSpeedX = 0; });

// 6. Loop de Jogo e Colisões
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState === 'PLAYING') {
        player.position.z -= forwardSpeed;
        player.position.x += playerSpeedX;

        // Mantém o jogador dentro da pista
        if (player.position.x > 4.5) player.position.x = 4.5;
        if (player.position.x < -4.5) player.position.x = -4.5;

        // Câmera segue
        camera.position.z = player.position.z + 5;
        camera.position.x = player.position.x;

        playerBox.setFromObject(player);

        // Verifica colisão com CADA obstáculo carregado
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].box.setFromObject(enemies[i].mesh);
            if (playerBox.intersectsBox(enemies[i].box)) {
                gameState = 'GAMEOVER';
                uiTitle.innerText = "FIM DE JOGO";
                uiTitle.style.color = "#ff4444";
                uiBtn.innerText = "TENTAR NOVAMENTE";
                uiScreen.style.display = 'flex';
                return;
            }
        }
        
        // Verifica colisão com a meta
        if (goalMesh) {
            goalBox.setFromObject(goalMesh);
            if (playerBox.intersectsBox(goalBox)) {
                gameState = 'WIN';
                uiTitle.innerText = "VITÓRIA!";
                uiTitle.style.color = "#44ff44";
                uiBtn.innerText = "JOGAR NOVAMENTE";
                uiScreen.style.display = 'flex';
            }
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

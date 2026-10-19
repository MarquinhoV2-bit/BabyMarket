import * as THREE from 'three';

// 1. Configuração da Cena e Câmera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 3. Cenário
const floorGeometry = new THREE.PlaneGeometry(10, 60);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -25;
scene.add(floor);

// 4. Jogador
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
scene.add(player);

// 5. Inimigo e Objetivo
const enemyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
enemy.position.set(0, 0.5, -15);
scene.add(enemy);

const goalGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const goalMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const goal = new THREE.Mesh(goalGeometry, goalMaterial);
goal.position.set(0, 0.5, -45);
scene.add(goal);

// 6. Integração com a UI (Interface HTML)
const uiScreen = document.getElementById('ui-screen');
const uiTitle = document.getElementById('ui-title');
const uiBtn = document.getElementById('ui-btn');

let gameState = 'MENU'; // Estados: MENU, PLAYING, GAMEOVER, WIN
let playerSpeedX = 0;
const forwardSpeed = 0.15;

const playerBox = new THREE.Box3();
const enemyBox = new THREE.Box3();
const goalBox = new THREE.Box3();

// Função para iniciar/reiniciar a partida
function resetGame() {
    player.position.set(0, 0.5, 0);
    playerSpeedX = 0;
    camera.position.set(0, 3, 5);
    uiScreen.style.display = 'none'; // Esconde o menu
    gameState = 'PLAYING';
}

uiBtn.addEventListener('click', resetGame);

// 7. Controles Touch Refinados
window.addEventListener('touchstart', (event) => {
    if (gameState !== 'PLAYING') return;
    const touchX = event.touches[0].clientX;
    playerSpeedX = touchX < window.innerWidth / 2 ? -0.15 : 0.15;
});

window.addEventListener('touchend', () => {
    playerSpeedX = 0;
});

// 8. Loop Principal do Motor Gráfico
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState === 'PLAYING') {
        player.position.z -= forwardSpeed;
        player.position.x += playerSpeedX;

        // Limites da pista
        if (player.position.x > 4.5) player.position.x = 4.5;
        if (player.position.x < -4.5) player.position.x = -4.5;

        // Câmera segue o jogador
        camera.position.z = player.position.z + 5;
        camera.position.x = player.position.x;

        // Atualiza as caixas de colisão
        playerBox.setFromObject(player);
        enemyBox.setFromObject(enemy);
        goalBox.setFromObject(goal);

        // Verifica colisões
        if (playerBox.intersectsBox(enemyBox)) {
            gameState = 'GAMEOVER';
            uiTitle.innerText = "FIM DE JOGO";
            uiTitle.style.color = "#ff4444";
            uiBtn.innerText = "TENTAR NOVAMENTE";
            uiScreen.style.display = 'flex';
        }
        
        if (playerBox.intersectsBox(goalBox)) {
            gameState = 'WIN';
            uiTitle.innerText = "VITÓRIA!";
            uiTitle.style.color = "#44ff44";
            uiBtn.innerText = "JOGAR NOVAMENTE";
            uiScreen.style.display = 'flex';
        }
    }

    renderer.render(scene, camera);
}

// Lida com a rotação do telemóvel
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

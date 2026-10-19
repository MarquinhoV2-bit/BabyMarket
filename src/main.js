import * as THREE from 'three';

// 1. Configuração da Cena e Câmera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 5); // Câmera atrás e acima do jogador

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 3. Cenário: Pista Longa
const floorGeometry = new THREE.PlaneGeometry(10, 60);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -25; // Empurra a pista para frente
scene.add(floor);

// 4. Jogador (Cubo Azul)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
scene.add(player);

// 5. Inimigo/Obstáculo (Esfera Vermelha)
const enemyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
enemy.position.set(0, 0.5, -15); // Posicionado no meio do caminho
scene.add(enemy);

// 6. Objetivo (Cilindro Verde)
const goalGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const goalMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const goal = new THREE.Mesh(goalGeometry, goalMaterial);
goal.position.set(0, 0.5, -45); // Posicionado no final da pista
scene.add(goal);

// 7. Controles Touch Provisórios e Lógica
let isGameOver = false;
let playerSpeedX = 0;
const forwardSpeed = 0.15; // Velocidade que o jogador avança

// Detecta o toque na tela do celular
window.addEventListener('touchstart', (event) => {
    const touchX = event.touches[0].clientX;
    const screenWidth = window.innerWidth;
    // Se tocou na metade esquerda, move para esquerda. Senão, direita.
    if (touchX < screenWidth / 2) {
        playerSpeedX = -0.15;
    } else {
        playerSpeedX = 0.15;
    }
});

// Quando solta o dedo, o personagem para de ir para os lados
window.addEventListener('touchend', () => {
    playerSpeedX = 0;
});

// Caixas de colisão invisíveis (Hitboxes)
const playerBox = new THREE.Box3();
const enemyBox = new THREE.Box3();
const goalBox = new THREE.Box3();

// 8. Loop Principal do Jogo
function animate() {
    if (isGameOver) return; // Congela o jogo se bater ou vencer
    
    requestAnimationFrame(animate);
    
    // Movimenta o jogador para frente e para os lados
    player.position.z -= forwardSpeed;
    player.position.x += playerSpeedX;

    // Impede que o jogador caia para fora da pista
    if (player.position.x > 4.5) player.position.x = 4.5;
    if (player.position.x < -4.5) player.position.x = -4.5;

    // A câmera segue o jogador na mesma velocidade
    camera.position.z = player.position.z + 5;
    camera.position.x = player.position.x;

    // Atualiza a posição das caixas de colisão para acompanharem os objetos 3D
    playerBox.setFromObject(player);
    enemyBox.setFromObject(enemy);
    goalBox.setFromObject(goal);

    // Sistema de Colisão: Obstáculo (Derrota)
    if (playerBox.intersectsBox(enemyBox)) {
        isGameOver = true;
        setTimeout(() => alert("Bateu no obstáculo! Fim de Jogo. (Atualize a página para recomeçar)"), 50);
    }
    
    // Sistema de Colisão: Objetivo (Vitória)
    if (playerBox.intersectsBox(goalBox)) {
        isGameOver = true;
        setTimeout(() => alert("Chegou no objetivo final! Vitória! (Atualize a página para recomeçar)"), 50);
    }

    renderer.render(scene, camera);
}

// Lida com a rotação de tela do celular
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

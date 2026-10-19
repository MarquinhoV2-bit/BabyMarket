import * as THREE from 'three';

// 1. Configuração Básica (Cena, Câmera, Renderizador)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Cor do céu azul claro

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10); // Câmera posicionada um pouco atrás e acima
camera.lookAt(0, 0, 0); // Câmera a olhar para o centro

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiente
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Luz simulando o sol
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 3. O "Chão" (Placeholder: Plano Cinzento)
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Deitar o plano para servir de chão
scene.add(floor);

// 4. O "Personagem" Principal (Placeholder: Cubo Azul)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5; // Colocar o cubo em cima do chão
scene.add(player);

// 5. Loop do Jogo (O motor que atualiza o ecrã)
function animate() {
    requestAnimationFrame(animate);
    
    // Pequena animação de teste para provar que está vivo
    player.rotation.y += 0.02;
    
    renderer.render(scene, camera);
}

// Lidar com a rotação do telemóvel (redimensionamento do ecrã)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar o jogo
animate();
console.log("Fase 2 validada: Motor 3D a correr com Placeholders!");

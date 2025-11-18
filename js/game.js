// =============================================
// RPG MUNDO ABERTO - NOSSO JOGO
// =============================================

// Configurações do jogo
const config = {
    canvas: null,
    ctx: null,
    
    player: {
        x: 400,
        y: 300,
        size: 20,
        speed: 4,
        color: '#4ecca3',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        health: 100,
        maxHealth: 100
    },
    
    keys: {},
    camera: { x: 0, y: 0 },
    
    // Mundo do jogo
    world: {
        width: 2000,
        height: 2000,
        tiles: [],
        tileSize: 50
    },
    
    // Cores para diferentes tipos de terreno
    terrainColors: {
        grass: '#2d5a27',
        forest: '#1e3f1c',
        water: '#1a5d7e',
        sand: '#d2b55b',
        mountain: '#6d6d6d'
    }
};

// =============================================
// INICIALIZAÇÃO DO JOGO
// =============================================

function init() {
    console.log("🎮 Iniciando RPG Mundo Aberto...");
    
    // Configurar canvas
    config.canvas = document.getElementById('gameCanvas');
    config.ctx = config.canvas.getContext('2d');
    
    // Gerar mundo
    generateWorld();
    
    // Configurar controles
    setupControls();
    
    // Iniciar loop do jogo
    console.log("✅ Jogo iniciado! Use WASD ou setas para mover.");
    gameLoop();
}

function setupControls() {
    // Teclas pressionadas
    window.addEventListener('keydown', (e) => {
        config.keys[e.key.toLowerCase()] = true;
    });
    
    // Teclas soltas
    window.addEventListener('keyup', (e) => {
        config.keys[e.key.toLowerCase()] = false;
    });
    
    // Prevenir comportamento padrão das setas
    window.addEventListener('keydown', (e) => {
        if(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    });
}

// =============================================
// GERAÇÃO DO MUNDO
// =============================================

function generateWorld() {
    const { width, height, tileSize } = config.world;
    const tilesWide = width / tileSize;
    const tilesHigh = height / tileSize;
    
    console.log(`🌍 Gerando mundo: ${tilesWide}x${tilesHigh} tiles`);
    
    for (let y = 0; y < tilesHigh; y++) {
        config.world.tiles[y] = [];
        for (let x = 0; x < tilesWide; x++) {
            // Criar padrões de terreno
            let terrainType;
            const distanceFromCenter = Math.sqrt(
                Math.pow(x - tilesWide/2, 2) + Math.pow(y - tilesHigh/2, 2)
            );
            
            if (distanceFromCenter < 5) {
                terrainType = 'sand'; // Praia no centro
            } else if (Math.random() < 0.6) {
                terrainType = 'grass'; // Grama
            } else if (Math.random() < 0.3) {
                terrainType = 'forest'; // Floresta
            } else if (Math.random() < 0.1) {
                terrainType = 'water'; // Água
            } else {
                terrainType = 'mountain'; // Montanha
            }
            
            config.world.tiles[y][x] = terrainType;
        }
    }
}

// =============================================
// LOOP PRINCIPAL DO JOGO
// =============================================

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    movePlayer();
    updateCamera();
    updateUI();
    checkLevelUp();
}

function render() {
    clearCanvas();
    renderWorld();
    renderPlayer();
}

// =============================================
// SISTEMA DE MOVIMENTO
// =============================================

function movePlayer() {
    let moveX = 0, moveY = 0;
    
    // Controles WASD
    if (config.keys['w'] || config.keys['arrowup']) moveY -= config.player.speed;
    if (config.keys['s'] || config.keys['arrowdown']) moveY += config.player.speed;
    if (config.keys['a'] || config.keys['arrowleft']) moveX -= config.player.speed;
    if (config.keys['d'] || config.keys['arrowright']) moveX += config.player.speed;
    
    // Movimento diagonal (normalizar velocidade)
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707;
        moveY *= 0.707;
    }
    
    // Aplicar movimento
    config.player.x += moveX;
    config.player.y += moveY;
    
    // Manter dentro dos limites do mundo
    config.player.x = Math.max(config.player.size, Math.min(config.world.width - config.player.size, config.player.x));
    config.player.y = Math.max(config.player.size, Math.min(config.world.height - config.player.size, config.player.y));
    
    // Ganhar XP por se mover (bem devagar)
    if (moveX !== 0 || moveY !== 0) {
        config.player.xp += 0.1;
    }
}

function updateCamera() {
    // Câmera que segue o jogador (centralizada)
    config.camera.x = config.player.x - config.canvas.width / 2;
    config.camera.y = config.player.y - config.canvas.height / 2;
    
    // Limites da câmera
    config.camera.x = Math.max(0, Math.min(config.world.width - config.canvas.width, config.camera.x));
    config.camera.y = Math.max(0, Math.min(config.world.height - config.canvas.height, config.camera.y));
}

// =============================================
// SISTEMA DE EVOLUÇÃO/NÍVEL
// =============================================

function checkLevelUp() {
    if (config.player.xp >= config.player.xpToNextLevel) {
        config.player.level++;
        config.player.xp -= config.player.xpToNextLevel;
        config.player.xpToNextLevel = Math.floor(config.player.xpToNextLevel * 1.5);
        config.player.maxHealth += 20;
        config.player.health = config.player.maxHealth;
        config.player.speed += 0.5;
        
        console.log(`🎉 LEVEL UP! Agora nível ${config.player.level}`);
    }
}

// =============================================
// RENDERIZAÇÃO
// =============================================

function clearCanvas() {
    config.ctx.fillStyle = '#0f3460';
    config.ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);
}

function renderWorld() {
    const { tiles, tileSize } = config.world;
    const { camera } = config;
    
    // Calcular quais tiles estão visíveis
    const startX = Math.floor(camera.x / tileSize);
    const startY = Math.floor(camera.y / tileSize);
    const endX = Math.ceil((camera.x + config.canvas.width) / tileSize);
    const endY = Math.ceil((camera.y + config.canvas.height) / tileSize);
    
    // Renderizar tiles visíveis
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            if (tiles[y] && tiles[y][x]) {
                const terrainType = tiles[y][x];
                const color = config.terrainColors[terrainType];
                
                config.ctx.fillStyle = color;
                config.ctx.fillRect(
                    x * tileSize - camera.x,
                    y * tileSize - camera.y,
                    tileSize,
                    tileSize
                );
                
                // Adicionar detalhes visuais
                if (terrainType === 'grass' && Math.random() < 0.1) {
                    config.ctx.fillStyle = '#3a7a2d';
                    config.ctx.fillRect(
                        x * tileSize - camera.x + 20,
                        y * tileSize - camera.y + 20,
                        10,
                        10
                    );
                }
            }
        }
    }
}

function renderPlayer() {
    const { player, camera } = config;
    
    // Calcular posição na tela
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;
    
    // Desenhar jogador
    config.ctx.fillStyle = player.color;
    config.ctx.beginPath();
    config.ctx.arc(screenX, screenY, player.size, 0, Math.PI * 2);
    config.ctx.fill();
    
    // Borda do jogador
    config.ctx.strokeStyle = '#eeeeee';
    config.ctx.lineWidth = 3;
    config.ctx.stroke();
    
    // Indicador de nível acima do jogador
    config.ctx.fillStyle = 'white';
    config.ctx.font = '14px Arial';
    config.ctx.textAlign = 'center';
    config.ctx.fillText(`Lv.${player.level}`, screenX, screenY - player.size - 10);
}

// =============================================
// INTERFACE DO USUÁRIO
// =============================================

function updateUI() {
    document.getElementById('level').textContent = config.player.level;
    document.getElementById('xp').textContent = Math.floor(config.player.xp);
    document.getElementById('health').textContent = Math.floor(config.player.health);
}

// =============================================
// INICIAR O JOGO
// =============================================

// Iniciar quando a página carregar
window.addEventListener('load', init);

// Também iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
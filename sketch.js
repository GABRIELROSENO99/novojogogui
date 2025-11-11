// =========================================================
// ROCKET RUN: FALHA NA DECOLAGEM - JOGO p5.js COMPLETO
// =========================================================

// Variáveis do Personagem (o "Foguete")
let rocketY; 
let rocketVelocidade = 0;
const rocketGravidade = 0.4; // Menor gravidade para parecer no espaço
const rocketImpulso = -7; // Força de propulsão

// Variáveis do Obstáculo (Asteroides)
let asteroides = [];
const asteroideAbertura = 120; // Espaço vertical entre os asteroides (Passagem)
const asteroideLargura = 50;
let score = 0;
let gameState = 'running'; // Estados: 'running', 'gameover'
const velocidadeJogo = 3; // Velocidade de movimento dos asteroides

// =========================================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// =========================================================

function setup() {
    // Tela do jogo, maior para parecer mais moderno
    createCanvas(800, 450);
    rocketY = height / 2; 
    
    // Configurações visuais
    textAlign(CENTER, CENTER);
    textFont('Arial'); 
    noStroke(); // Remove bordas padrão
    
    // Cria o primeiro obstáculo
    asteroides.push(new Asteroide());
    
    // Configura a velocidade de quadros por segundo
    frameRate(60); 
}

function draw() {
    // Cenário: Espaço Sideral
    background(0, 0, 30); // Azul escuro do espaço
    
    // Desenha estrelas de fundo para dar profundidade
    drawStars();
    
    if (gameState === 'running') {
        // 1. Atualiza o Foguete
        rocketVelocidade += rocketGravidade;
        rocketY += rocketVelocidade;
        
        rocketVelocidade = constrain(rocketVelocidade, -12, 8);

        // Desenha o Foguete (triângulo com rastro de fogo)
        desenharFoguete(50, rocketY, 30);
        
        // 2. Lógica dos Asteroides
        for (let i = asteroides.length - 1; i >= 0; i--) {
            asteroides[i].mover();
            asteroides[i].desenhar();

            // Checa Colisão
            if (asteroides[i].checkCollision(50, rocketY, 15)) { 
                endGame();
            }

            // Remoção e Pontuação
            if (asteroides[i].x < -asteroideLargura) {
                asteroides.splice(i, 1);
            }
            
            if (asteroides[i].passed && asteroides[i].x < 50 - asteroideLargura / 2) {
                score++;
                asteroides[i].passed = false; 
            }
        }

        // Gera novos asteroides
        if (frameCount % 80 === 0) { 
            asteroides.push(new Asteroide());
        }

        // Checa Colisão com os limites da tela (chão/teto)
        if (rocketY > height - 15 || rocketY < 15) { 
            endGame();
        }

        // Mostra a Pontuação (HUD)
        textSize(24);
        fill(255);
        text(`SCORE: ${score}`, width - 100, 30);

    } else {
        // Tela de Game Over
        textSize(60);
        fill(255, 50, 50); 
        text("MISSÃO FALHOU!", width / 2, height / 2 - 30);
        textSize(30);
        fill(255);
        text(`Pontuação Final: ${score}`, width / 2, height / 2 + 30);
        textSize(20);
        text("Clique/Toque ou Aperte ESPAÇO para TENTAR NOVO LANÇAMENTO", width / 2, height / 2 + 80);
    }
}

// =========================================================
// FUNÇÕES DE INPUT E LÓGICA DE JOGO
// =========================================================

// Função para Pulo (Propulsão) via Barra de Espaço
function keyPressed() {
    if (key === ' ' && gameState === 'running') {
        rocketVelocidade = rocketImpulso;
    }
}

// FUNÇÃO CRUCIAL PARA CORRIGIR DUPLO-CLIQUE/TOQUE NO CELULAR
function touchStarted() {
    // Se o jogo estiver rodando, trata o toque como PULO/PROPULSÃO
    if (gameState === 'running') {
        rocketVelocidade = rocketImpulso;
        // ESSENCIAL: Impede que o navegador dispare o evento de mouse logo depois.
        return false; 
    }
    
    // Se o jogo estiver em Game Over, trata o toque como REINÍCIO
    if (gameState === 'gameover') {
        restartGame();
        return false;
    }
}

// Função para Reiniciar o jogo no Game Over (desktop)
function mousePressed() {
    if (gameState === 'gameover') {
        restartGame();
    }
}

function endGame() {
    gameState = 'gameover';
    noLoop(); 
}

function restartGame() {
    rocketY = height / 2;
    rocketVelocidade = 0;
    asteroides = [];
    score = 0;
    gameState = 'running';
    asteroides.push(new Asteroide());
    loop(); 
}

// =========================================================
// FUNÇÕES DE DESENHO (ESTÉTICA)
// =========================================================

function drawStars() {
    // Gera um fundo simples de estrelas aleatórias
    for (let i = 0; i < 100; i++) {
        fill(255, 255, 255, random(50, 200)); // Estrelas com opacidade variável
        ellipse(random(width), random(height), random(1, 3), random(1, 3));
    }
}

function desenharFoguete(x, y, tamanho) {
    // Rastro de Fogo (Chama)
    fill(255, 100, 0, 150); 
    ellipse(x - tamanho/2 - 5, y, 10 + random(0, 5), 15 + random(0, 10)); 
    
    // Corpo do Foguete (Corpo principal)
    fill(180); 
    triangle(x - tamanho/2, y + tamanho/2, x - tamanho/2, y - tamanho/2, x + tamanho/2, y); 
    
    // Detalhe da Ponta
    fill(200, 50, 50); 
    triangle(x + tamanho/2, y, x + tamanho/2 - 5, y - 5, x + tamanho/2 - 5, y + 5); 
}

// =========================================================
// CLASSE ASTEROIDE
// =========================================================

class Asteroide {
    constructor() {
        this.x = width;
        // Ponto de abertura: Garante que o centro da passagem não esteja na borda
        this.centroAbertura = random(asteroideAbertura / 2 + 30, height - asteroideAbertura / 2 - 30);
        this.topo = this.centroAbertura - asteroideAbertura / 2;
        this.fundo = this.centroAbertura + asteroideAbertura / 2;
        this.velocidade = velocidadeJogo; 
        this.passed = true;
    }

    desenhar() {
        fill(100, 100, 100); 
        
        // Asteroide de Cima
        rect(this.x, 0, asteroideLargura, this.topo);
        // Asteroide de Baixo
        rect(this.x, this.fundo, asteroideLargura, height - this.fundo);
    }

    mover() {
        this.x -= this.velocidade;
    }

    // Checagem de Colisão
    checkCollision(px, py, pr) {
        if (px + pr > this.x && px - pr < this.x + asteroideLargura) {
            if (py - pr < this.topo || py + pr > this.fundo) {
                return true;
            }
        }
        return false;
    }
}

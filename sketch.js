// =========================================================
// ROCKET RUN PRO: APOCALIPSE DE ASTEROIDES - JOGO p5.js
// V2.2 - Correção de Bug Gráfico (push/pop) e Estilos Isolados
// =========================================================

// =======================
// VARIÁVEIS DE JOGO E RECURSOS
// =======================
let rocketY; 
let rocketVelocidade = 0;
const rocketGravidade = 0.4; 
const rocketImpulso = -7; 

// Combustível
let combustivel;
const MAX_COMBUSTIVEL = 100;
const CONSUMO_POR_FRAME = 0.15; 

// Obstáculos e Dificuldade
let asteroides = [];
let asteroideAbertura = 120; 
let asteroideLargura = 50;
let score = 0;
let gameState = 'running'; 
let velocidadeJogo = 3; 
let motivoFimDeJogo = "";

// Constantes de Dificuldade
const FASE_1_DURACAO = 10800; // 3 minutos * 60 FPS * 60 segundos
const VELOCIDADE_FASE_2 = 4.5; 
const ABERTURA_FASE_2 = 100; 

// Estética
let estrelas = [];

// =========================================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// =========================================================

function setup() {
    let canvas = createCanvas(800, 450);
    // CRUCIAL: Previne o menu de contexto do botão direito e o comportamento padrão no toque
    canvas.elt.addEventListener('contextmenu', e => e.preventDefault()); 

    rocketY = height / 2; 
    combustivel = MAX_COMBUSTIVEL;
    
    // Configurações de Texto e Estilo Base
    textAlign(CENTER, CENTER);
    textFont('Arial'); 
    noStroke(); // Estado base (sem contorno)
    frameRate(60); 
    
    // Inicializa Estrelas
    for(let i = 0; i < 150; i++) {
        estrelas.push({ x: random(width), y: random(height), size: random(1, 3), speed: random(0.5, 2) });
    }
    
    asteroides.push(new Asteroide());
}

function draw() {
    // 1. Fundo Gradiente e Estrelas (Visual Profissional)
    drawBackgroundGradient(); 
    drawStars(); 

    // Lógica de Dificuldade
    if (frameCount > FASE_1_DURACAO && gameState === 'running') {
        velocidadeJogo = VELOCIDADE_FASE_2;
        asteroideAbertura = ABERTURA_FASE_2;
    }
    
    if (gameState === 'running') {
        
        // 0. GESTÃO DO COMBUSTÍVEL
        combustivel -= CONSUMO_POR_FRAME;
        combustivel = constrain(combustivel, 0, MAX_COMBUSTIVEL); 
        
        if (combustivel <= 0) {
            endGame("ACABOU O COMBUSTÍVEL!");
            return; 
        }
        
        // 1. Atualiza o Foguete
        rocketVelocidade += rocketGravidade;
        rocketY += rocketVelocidade;
        rocketVelocidade = constrain(rocketVelocidade, -12, 8);
        desenharFoguete(50, rocketY, 30);
        
        // 2. Lógica dos Asteroides
        for (let i = asteroides.length - 1; i >= 0; i--) {
            asteroides[i].mover();
            asteroides[i].desenhar();

            if (asteroides[i].checkCollision(50, rocketY, 15)) { 
                endGame("COLISÃO COM ASTEROIDE!");
            }

            if (asteroides[i].x < -asteroideLargura) {
                asteroides.splice(i, 1);
            }
            
            // LÓGICA DE PONTUAÇÃO E REABASTECIMENTO
            if (asteroides[i].passed && asteroides[i].x < 50 - asteroideLargura / 2) {
                score++;
                combustivel = MAX_COMBUSTIVEL; 
                asteroides[i].passed = false; 
            }
        }

        // Gera novos asteroides
        if (frameCount % 80 === 0) { 
            asteroides.push(new Asteroide());
        }

        // Checa Colisão com os limites da tela
        if (rocketY > height - 15 || rocketY < 15) { 
            endGame("SAIU DA ROTA!");
        }

        // Mostra o HUD Principal
        drawHUD();

    } else {
        // Tela de Game Over
        drawGameOverScreen();
    }
}

// =========================================================
// FUNÇÕES DE INPUT (TOQUE, CLIQUE, TECLA)
// =========================================================

function keyPressed() {
    if (key === ' ' && gameState === 'running') {
        rocketVelocidade = rocketImpulso;
    }
}

function touchStarted() {
    if (gameState === 'running') {
        rocketVelocidade = rocketImpulso;
        return false; // IMPEDE O COMPORTAMENTO PADRÃO DO BROWSER
    }
    
    if (gameState === 'gameover') {
        restartGame();
        return false;
    }
}

function mousePressed() {
    if (gameState === 'running') {
        rocketVelocidade = rocketImpulso;
    }
    if (gameState === 'gameover') {
        restartGame();
    }
}

// ... (endGame e restartGame)

function endGame(motivo) {
    motivoFimDeJogo = motivo;
    gameState = 'gameover';
    noLoop(); 
}

function restartGame() {
    rocketY = height / 2;
    rocketVelocidade = 0;
    asteroides = [];
    score = 0;
    gameState = 'running';
    velocidadeJogo = 3; 
    asteroideAbertura = 120; 
    combustivel = MAX_COMBUSTIVEL;
    asteroides.push(new Asteroide());
    loop(); 
}

// =========================================================
// FUNÇÕES DE DESENHO PROFISSIONAIS (ESTÉTICA E ISOLAMENTO)
// =========================================================

function drawBackgroundGradient() {
    push(); // Inicia isolamento de estilo
    // Fundo com gradiente suave do espaço
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(color(10, 0, 20), color(50, 0, 0), inter); 
        stroke(c);
        line(0, y, width, y);
    }
    pop(); // Restaura o estado anterior (noStroke)
}

function drawStars() {
    push();
    fill(255);
    for (let i = 0; i < estrelas.length; i++) {
        let star = estrelas[i];
        
        star.x -= star.speed * velocidadeJogo * 0.5; 
        
        if (star.x < 0) {
            star.x = width;
            star.y = random(height);
        }
        
        let c = (i % 5 === 0) ? color(255, 255, 255) : color(255, 100, 0, 150);
        fill(c); 
        ellipse(star.x, star.y, star.size, star.size);
    }
    pop();
}

function drawHUD() {
    push();
    // 1. Frase no Topo do Jogo
    textSize(20);
    fill(255, 255, 255); 
    text("Ajude o Guilherme a chegar na casa da Luisa antes do apocalipse", width / 2, 25);
    
    // 2. Pontuação e Nível de Dificuldade
    textSize(24);
    fill(255, 200, 0); 
    text(`SCORE: ${score}`, width - 100, 60);

    let nivel = (frameCount > FASE_1_DURACAO) ? "NÍVEL MÉDIO" : "NÍVEL FÁCIL";
    let corNivel = (frameCount > FASE_1_DURACAO) ? color(255, 50, 50) : color(100, 255, 100);
    fill(corNivel);
    textSize(18);
    text(`STATUS: ${nivel}`, 100, 60);
    
    // 3. MEDIDOR DE COMBUSTÍVEL
    drawFuelGauge(40, 90, 15, 200); 
    pop();
}

function drawFuelGauge(x, y, h, w) {
    push();
    fill(255);
    textSize(14);
    text("COMBUSTÍVEL", x + w/2, y - 5);
    
    // Fundo da barra com borda
    fill(50);
    stroke(255); 
    strokeWeight(1);
    rect(x, y, w, h, 5); 
    
    let fuelWidth = map(combustivel, 0, MAX_COMBUSTIVEL, 0, w);
    
    let fuelColor;
    if (combustivel < 20) {
        fuelColor = color(255, 0, 0); 
    } else if (combustivel < 50) {
        fuelColor = color(255, 255, 0); 
    } else {
        fuelColor = color(0, 200, 0); 
    }
    
    // Desenha a barra de combustível
    noStroke(); 
    fill(fuelColor);
    rect(x + 1, y + 1, fuelWidth - 2, h - 2, 4); 
    
    pop(); 
}


function desenharFoguete(x, y, tamanho) {
    push();
    let rastroAlpha = map(combustivel, 0, MAX_COMBUSTIVEL, 50, 200); 
    
    // Rastro de Propulsão 
    fill(255, 100, 0, rastroAlpha); 
    ellipse(x - tamanho/2 - 5, y, 10 + random(0, 5), 15 + random(0, 10)); 
    
    // Corpo do Foguete com Sombra
    noStroke();
    fill(100); 
    // Cauda Sup, Cauda Inf, Ponta Nariz (Sombra)
    triangle(x - tamanho/2 + 2, y + tamanho/2 + 2, x - tamanho/2 + 2, y - tamanho/2 + 2, x + tamanho/2 + 2, y + 2); 
    
    fill(180); // Cor principal
    // Foguete apontando para a direita (CORRIGIDO)
    // Ponto 1: Cauda Superior, Ponto 2: Cauda Inferior, Ponto 3: Ponta do Nariz
    triangle(x - tamanho/2, y - tamanho/2, x - tamanho/2, y + tamanho/2, x + tamanho/2, y); 
    
    // Ponta Vermelha
    fill(200, 50, 50); 
    triangle(x + tamanho/2, y, x + tamanho/2 - 5, y - 5, x + tamanho/2 - 5, y + 5); 
    pop();
}

function drawGameOverScreen() {
    push();
    textSize(60);
    fill(255, 50, 50); 
    text("MISSÃO CRÍTICA FALHOU!", width / 2, height / 2 - 80);
    
    textSize(30);
    fill(255, 255, 0);
    text(`Motivo: ${motivoFimDeJogo}`, width / 2, height / 2 - 20);
    
    textSize(24);
    fill(255);
    text(`Pontuação Final: ${score}`, width / 2, height / 2 + 30);
    
    textSize(20);
    text("Toque/Clique ou ESPAÇO para Novo Lançamento", width / 2, height / 2 + 80);
    pop();
}

// =========================================================
// CLASSE ASTEROIDE (COM ISOLAMENTO DE ESTILO)
// =========================================================

class Asteroide {
    constructor() {
        this.x = width;
        this.centroAbertura = random(asteroideAbertura / 2 + 30, height - asteroideAbertura / 2 - 30);
        this.topo = this.centroAbertura - asteroideAbertura / 2;
        this.fundo = this.centroAbertura + asteroideAbertura / 2;
        this.velocidade = velocidadeJogo; 
        this.passed = true;
    }

    desenhar() {
        push(); // Isola os estilos de contorno e preenchimento
        // Usa textura de rocha/fogo
        stroke(200, 50, 50); // Borda de fogo
        strokeWeight(2);
        
        // Asteroide de Cima
        fill(100, 50, 50); 
        rect(this.x, 0, asteroideLargura, this.topo);
        
        // Asteroide de Baixo
        rect(this.x, this.fundo, asteroideLargura, height - this.fundo);
        pop(); // Restaura os estilos anteriores
    }

    mover() {
        this.x -= velocidadeJogo;
    }

    checkCollision(px, py, pr) {
        if (px + pr > this.x && px - pr < this.x + asteroideLargura) {
            if (py - pr < this.topo || py + pr > this.fundo) {
                return true;
            }
        }
        return false;
    }
}

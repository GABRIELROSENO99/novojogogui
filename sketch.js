// =========================================================
// ROCKET RUN PRO: APOCALIPSE DE ASTEROIDES - JOGO p5.js
// V4.0 - FINAL: Modo FÁCIL + Responsividade + Placar de Recordes
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
// MODO FÁCIL: CONSUMO REDUZIDO
const CONSUMO_POR_FRAME = 0.05; 

// Obstáculos e Dificuldade
let asteroides = [];
// MODO FÁCIL: ABERTURA MAIOR
let asteroideAbertura = 160; 
let asteroideLargura = 50;
let score = 0;
let gameState = 'running'; 
let velocidadeJogo = 3; 
let motivoFimDeJogo = "";

// Recordes
let highScore = 0; 

// Constantes de Dificuldade
const FASE_1_DURACAO = 10800; 
const VELOCIDADE_FASE_2 = 4.5; 
// MODO FÁCIL: ABERTURA NA FASE 2 MAIOR
const ABERTURA_FASE_2 = 140; 

// Estética
let estrelas = [];

// =========================================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// =========================================================

function setup() {
    // Responsividade: O canvas terá o tamanho máximo de 800x450, mas será reduzido para caber na janela.
    let w = min(800, windowWidth);
    let h = min(450, windowHeight);
    let canvas = createCanvas(w, h); 
    
    // Previne o menu de contexto do botão direito e o comportamento padrão no toque
    canvas.elt.addEventListener('contextmenu', e => e.preventDefault()); 

    rocketY = height / 2; 
    combustivel = MAX_COMBUSTIVEL;
    
    // NOVO CÓDIGO: Carrega o recorde salvo (localStorage)
    let savedScore = localStorage.getItem('rocketRunHighScore');
    if (savedScore !== null) {
        highScore = parseInt(savedScore);
    }
    
    // Configurações de Texto e Estilo Base
    textAlign(CENTER, CENTER);
    textFont('Arial'); 
    noStroke(); 
    frameRate(60); 
    
    // Inicializa Estrelas
    for(let i = 0; i < 150; i++) {
        estrelas.push({ x: random(width), y: random(height), size: random(1, 3), speed: random(0.5, 2) });
    }
    
    asteroides.push(new Asteroide());
}

function draw() {
    // Fundo Gradiente e Estrelas 
    drawBackgroundGradient(); 
    drawStars(); 

    // Lógica de Dificuldade
    if (frameCount > FASE_1_DURACAO && gameState === 'running') {
        velocidadeJogo = VELOCIDADE_FASE_2;
        asteroideAbertura = ABERTURA_FASE_2;
    }
    
    if (gameState === 'running') {
        
        // GESTÃO DO COMBUSTÍVEL
        combustivel -= CONSUMO_POR_FRAME;
        combustivel = constrain(combustivel, 0, MAX_COMBUSTIVEL); 
        
        if (combustivel <= 0) {
            endGame("ACABOU O COMBUSTÍVEL!");
            return; 
        }
        
        // Atualiza o Foguete
        rocketVelocidade += rocketGravidade;
        rocketY += rocketVelocidade;
        rocketVelocidade = constrain(rocketVelocidade, -12, 8);
        desenharFoguete(50, rocketY, 30);
        
        // Lógica dos Asteroides
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
// FUNÇÃO DE RESPONSIVIDADE
// =========================================================
function windowResized() {
    let w = min(800, windowWidth);
    let h = min(450, windowHeight);
    resizeCanvas(w, h);
}


// =========================================================
// FUNÇÕES DE INPUT
// =========================================================

function keyPressed() {
    if (key === ' ' && gameState === 'running') {
        rocketVelocidade = rocketImpulso;
    }
}

function touchStarted() {
    if (gameState === 'running') {
        rocketVelocidade = rocketImpulso;
        return false; 
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
    
    // NOVO CÓDIGO: Verifica e salva o novo recorde
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('rocketRunHighScore', highScore);
    }
    
    noLoop(); 
}

function restartGame() {
    rocketY = height / 2;
    rocketVelocidade = 0;
    asteroides = [];
    score = 0;
    gameState = 'running';
    velocidadeJogo = 3; 
    asteroideAbertura = 160; 
    combustivel = MAX_COMBUSTIVEL;
    asteroides.push(new Asteroide());
    loop(); 
}

// =========================================================
// FUNÇÕES DE DESENHO E ESTÉTICA
// =========================================================

function drawBackgroundGradient() {
    push(); 
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(color(10, 0, 20), color(50, 0, 0), inter); 
        stroke(c);
        line(0, y, width, y);
    }
    pop(); 
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
    // Ajusta o tamanho da fonte e a posição proporcionalmente
    
    textSize(20 * (width / 800)); 
    fill(255, 255, 255); 
    text("Ajude o Guilherme a chegar na casa da Luisa antes do apocalipse", width / 2, 25);
    
    // PONTUAÇÃO ATUAL
    textSize(24 * (width / 800)); 
    fill(255, 200, 0); 
    text(`SCORE: ${score}`, width - 100 * (width / 800), 60);

    // RECORDE
    textSize(18 * (width / 800));
    fill(255, 255, 255);
    text(`RECORD: ${highScore}`, width - 100 * (width / 800), 90); 

    // NÍVEL DE DIFICULDADE
    let nivel = (frameCount > FASE_1_DURACAO) ? "NÍVEL MÉDIO" : "NÍVEL FÁCIL";
    let corNivel = (frameCount > FASE_1_DURACAO) ? color(255, 50, 50) : color(100, 255, 100);
    fill(corNivel);
    textSize(18 * (width / 800)); 
    text(`STATUS: ${nivel}`, 100 * (width / 800), 60); 
    
    // MEDIDOR DE COMBUSTÍVEL
    drawFuelGauge(40 * (width / 800), 90, 15, 200 * (width / 800)); 
    pop();
}

function drawFuelGauge(x, y, h, w) {
    push();
    textSize(14 * (width / 800));
    fill(255);
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
    triangle(x - tamanho/2 + 2, y + tamanho/2 + 2, x - tamanho/2 + 2, y - tamanho/2 + 2, x + tamanho/2 + 2, y + 2); 
    
    fill(180); // Cor principal
    triangle(x - tamanho/2, y - tamanho/2, x - tamanho/2, y + tamanho/2, x + tamanho/2, y); 
    
    // Ponta Vermelha
    fill(200, 50, 50); 
    triangle(x + tamanho/2, y, x + tamanho/2 - 5, y - 5, x + tamanho/2 - 5, y + 5); 
    pop();
}

function drawGameOverScreen() {
    push();
    // Ajusta o tamanho da fonte proporcionalmente
    textSize(60 * (width / 800)); 
    fill(255, 50, 50); 
    text("MISSÃO CRÍTICA FALHOU!", width / 2, height / 2 - 80);
    
    textSize(30 * (width / 800));
    fill(255, 255, 0);
    text(`Motivo: ${motivoFimDeJogo}`, width / 2, height / 2 - 20);
    
    // Pontuação Final
    textSize(24 * (width / 800));
    fill(255);
    text(`Pontuação Final: ${score}`, width / 2, height / 2 + 30);
    
    // NOVO CÓDIGO: Recorde no Game Over
    textSize(24 * (width / 800));
    fill(255, 200, 0);
    text(`RECORDE: ${highScore}`, width / 2, height / 2 + 70);

    textSize(20 * (width / 800));
    text("Toque/Clique ou ESPAÇO para Novo Lançamento", width / 2, height / 2 + 120);
    pop();
}

// =========================================================
// CLASSE ASTEROIDE
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
        push(); 
        stroke(200, 50, 50); 
        strokeWeight(2);
        
        // Asteroide de Cima
        fill(100, 50, 50); 
        rect(this.x, 0, asteroideLargura, this.topo);
        
        // Asteroide de Baixo
        fill(100, 50, 50);
        rect(this.x, this.fundo, asteroideLargura, height - this.fundo);
        pop(); 
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

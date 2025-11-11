// =========================================================
// ROCKET RUN: APOCALIPSE DE ASTEROIDES - JOGO p5.js
// =========================================================

// =======================
// VARIÁVEIS DO JOGO E RECURSOS
// =======================
let rocketY; 
let rocketVelocidade = 0;
const rocketGravidade = 0.4; 
const rocketImpulso = -7; 

// Combustível
let combustivel;
const MAX_COMBUSTIVEL = 100; // Valor máximo da barra
const CONSUMO_POR_FRAME = 0.15; // Taxa de consumo por frame

// Obstáculos e Dificuldade
let asteroides = [];
let asteroideAbertura = 120; 
let asteroideLargura = 50;
let score = 0;
let gameState = 'running'; 
let velocidadeJogo = 3; 

// Constantes de Dificuldade
const FASE_1_DURACAO = 10800; // 3 minutos * 60 FPS * 60 segundos
const VELOCIDADE_FASE_2 = 4.5; 
const ABERTURA_FASE_2 = 100; 

// =========================================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// =========================================================

function setup() {
    createCanvas(800, 450);
    rocketY = height / 2; 
    combustivel = MAX_COMBUSTIVEL; // Inicia com tanque cheio
    
    textAlign(CENTER, CENTER);
    textFont('Arial'); 
    noStroke(); 
    frameRate(60); 
    
    asteroides.push(new Asteroide());
}

function draw() {
    background(30, 0, 0); 
    drawStars(frameCount); 

    // Lógica de Dificuldade
    if (frameCount > FASE_1_DURACAO && gameState === 'running') {
        velocidadeJogo = VELOCIDADE_FASE_2;
        asteroideAbertura = ABERTURA_FASE_2;
    }
    
    if (gameState === 'running') {
        
        // 0. GESTÃO DO COMBUSTÍVEL
        combustivel -= CONSUMO_POR_FRAME;
        combustivel = constrain(combustivel, 0, MAX_COMBUSTIVEL); // Limita entre 0 e 100
        
        if (combustivel <= 0) {
            endGame("ACABOU O COMBUSTÍVEL!");
            return; // Sai do loop para ir para a tela de Game Over
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
                // RESTABELECE O COMBUSTÍVEL AO MÁXIMO
                combustivel = MAX_COMBUSTIVEL; 
                asteroides[i].passed = false; 
            }
        }

        // Gera novos asteroides
        if (frameCount % 80 === 0) { 
            asteroides.push(new Asteroide());
        }

        // Checa Colisão com os limites da tela (Chão/Teto)
        if (rocketY > height - 15 || rocketY < 15) { 
            endGame("SAIU DA ROTA!");
        }

        // Mostra o HUD Principal e a Pontuação
        drawHUD();

    } else {
        // Tela de Game Over
        drawGameOverScreen();
    }
}

// =========================================================
// FUNÇÕES DE INPUT E LÓGICA DE JOGO
// =========================================================

function keyPressed() {
    if (key === ' ' && gameState === 'running') {
        rocketVelocidade = rocketImpulso;
    }
}

// CORREÇÃO PARA O DUPLO-TOQUE EM CELULAR
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
    if (gameState === 'gameover') {
        restartGame();
    }
}

let motivoFimDeJogo = "";
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
    combustivel = MAX_COMBUSTIVEL; // Tanque cheio no reinício
    asteroides.push(new Asteroide());
    loop(); 
}

// =========================================================
// FUNÇÕES DE DESENHO (ESTÉTICA E HUD)
// =========================================================

function drawHUD() {
    // 1. Frase no Topo do Jogo
    textSize(22);
    fill(255, 200, 0); 
    text("Ajude o Guilherme a chegar na casa da Luisa antes do apocalipse", width / 2, 25);
    
    // 2. Pontuação e Nível de Dificuldade (Mantidos)
    textSize(24);
    fill(255);
    text(`SCORE: ${score}`, width - 100, 60);

    let nivel = (frameCount > FASE_1_DURACAO) ? "MÉDIO" : "SIMPLES";
    let corNivel = (frameCount > FASE_1_DURACAO) ? color(255, 100, 100) : color(100, 255, 100);
    fill(corNivel);
    textSize(18);
    text(`Dificuldade: ${nivel}`, 100, 60);
    
    // 3. MEDIDOR DE COMBUSTÍVEL
    drawFuelGauge(40, 100, 10, 200);
}

function drawFuelGauge(x, y, h, w) {
    // Desenha o título
    fill(255);
    textSize(18);
    text("COMBUSTÍVEL", x + w/2, y - h - 5);
    
    // Desenha o fundo da barra (cinza)
    fill(50);
    rect(x, y, w, h);
    
    // Calcula a largura da barra de combustível
    let fuelWidth = map(combustivel, 0, MAX_COMBUSTIVEL, 0, w);
    
    // Define a cor da barra (verde -> amarelo -> vermelho)
    let fuelColor = color(0, 255, 0); // Verde (padrão)
    if (combustivel < 50) {
        fuelColor = lerpColor(color(255, 255, 0), color(0, 255, 0), combustivel / 50); // Amarelo
    }
    if (combustivel < 20) {
        fuelColor = color(255, 0, 0); // Vermelho
    }
    
    // Desenha a barra de combustível
    fill(fuelColor);
    rect(x, y, fuelWidth, h);
}


function drawStars(frame) {
    for (let i = 0; i < 150; i++) {
        let x = (i * 50 + frame) % (width + 100) - 50; 
        let y = (i * 30) % height;
        
        let c = (i % 5 === 0) ? color(255, 255, 255, 200) : color(255, 100, 0, 100);
        fill(c); 
        ellipse(x, y, 1 + (i % 3), 1 + (i % 3));
    }
}

function desenharFoguete(x, y, tamanho) {
    // O rastro de fogo pode ser ajustado com base no nível de combustível
    let rastroAlpha = map(combustivel, 0, MAX_COMBUSTIVEL, 50, 200); // Fica mais fraco se o combustível estiver baixo
    fill(255, 100, 0, rastroAlpha); 
    ellipse(x - tamanho/2 - 5, y, 10 + random(0, 5), 15 + random(0, 10)); 
    
    fill(180); 
    triangle(x - tamanho/2, y + tamanho/2, x - tamanho/2, y - tamanho/2, x + tamanho/2, y); 
    
    fill(200, 50, 50); 
    triangle(x + tamanho/2, y, x + tamanho/2 - 5, y - 5, x + tamanho/2 - 5, y + 5); 
}

function drawGameOverScreen() {
    textSize(60);
    fill(255, 50, 50); 
    text("GUILHERME FALHOU!", width / 2, height / 2 - 60);
    
    textSize(30);
    fill(255, 255, 0);
    text(motivoFimDeJogo, width / 2, height / 2 - 10);
    
    textSize(24);
    fill(255);
    text(`Pontuação Final: ${score}`, width / 2, height / 2 + 40);
    
    textSize(20);
    text("Clique/Toque ou Aperte ESPAÇO para TENTAR NOVO LANÇAMENTO", width / 2, height / 2 + 90);
}

// =========================================================
// CLASSE ASTEROIDE (SEM ALTERAÇÕES SIGNIFICATIVAS)
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
        fill(100, 50, 50); 
        rect(this.x, 0, asteroideLargura, this.topo);
        rect(this.x, this.fundo, asteroideLargura, height - this.fundo);
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

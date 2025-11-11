// Variáveis do Personagem (o "Foguete")
let rocketY; // Posição Y (vertical) do Foguete
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

function setup() {
    // Tela do jogo, maior para parecer mais moderno
    createCanvas(800, 450);
    rocketY = height / 2; // Começa no meio da tela
    
    // Configurações visuais iniciais
    textAlign(CENTER, CENTER);
    textFont('Arial'); // Tente usar uma fonte mais moderna se for possível
    
    // Cria o primeiro obstáculo
    asteroides.push(new Asteroide());
}

function draw() {
    // Cenário: Espaço Sideral
    background(0, 0, 30); // Azul escuro do espaço
    
    if (gameState === 'running') {
        // 1. Atualiza o Foguete (com propulsão falhando)
        rocketVelocidade += rocketGravidade;
        rocketY += rocketVelocidade;
        
        // Limita a velocidade
        rocketVelocidade = constrain(rocketVelocidade, -12, 8);

        // Desenha o Foguete (triângulo com rastro de fogo)
        desenharFoguete(50, rocketY, 30);
        
        // 2. Lógica dos Asteroides
        for (let i = asteroides.length - 1; i >= 0; i--) {
            asteroides[i].mover();
            asteroides[i].desenhar();

            // Checa Colisão
            if (asteroides[i].checkCollision(50, rocketY, 15)) { // Raio de 15 para colisão
                endGame();
            }

            // Remove asteroides que saem da tela
            if (asteroides[i].x < -asteroideLargura) {
                asteroides.splice(i, 1);
            }
            
            // Lógica de Pontuação
            if (asteroides[i].passed && asteroides[i].x < 50 - asteroideLargura / 2) {
                score++;
                asteroides[i].passed = false; // Garante que só pontua uma vez
            }
        }

        // Gera novos asteroides
        if (frameCount % 80 === 0) { // Gera mais rápido para aumentar a dificuldade
            asteroides.push(new Asteroide());
        }

        // Checa Colisão com os limites da tela (chão/teto)
        if (rocketY > height - 15 || rocketY < 15) { // 15 é a margem do foguete
            endGame();
        }

        // Mostra a Pontuação (HUD)
        textSize(24);
        fill(255);
        text(`SCORE: ${score}`, width - 100, 30);

    } else {
        // Tela de Game Over
        textSize(60);
        fill(255, 50, 50); // Vermelho de alerta
        text("MISSÃO FALHOU!", width / 2, height / 2 - 30);
        textSize(30);
        fill(255);
        text(`Pontuação Final: ${score}`, width / 2, height / 2 + 30);
        textSize(20);
        text("Clique ou Aperte ESPAÇO para TENTAR NOVO LANÇAMENTO", width / 2, height / 2 + 80);
    }
}

// Desenha o Foguete (triângulo + fogo)
function desenharFoguete(x, y, tamanho) {
    // Rastro de Fogo (Chama)
    fill(255, 100, 0, 150); // Laranja com transparência
    ellipse(x - tamanho/2 - 5, y, 10 + random(0, 5), 15 + random(0, 10)); 
    
    // Corpo do Foguete (Corpo principal)
    fill(180); // Cinza
    triangle(x - tamanho/2, y + tamanho/2, x - tamanho/2, y - tamanho/2, x + tamanho/2, y); 
    
    // Detalhe da Ponta
    fill(200, 50, 50); // Vermelho
    triangle(x + tamanho/2, y, x + tamanho/2 - 5, y - 5, x + tamanho/2 - 5, y + 5); 
}

// Ação de Propulsão (pressionar espaço ou clicar)
function keyPressed() {
    if (key === ' ' && gameState === 'running') {
        rocketVelocidade = rocketImpulso;
    }
}

function mousePressed() {
    if (gameState === 'running') {
        rocketVelocidade = rocketImpulso; // Propulsão ao clicar
    } else {
        restartGame();
    }
}

function endGame() {
    gameState = 'gameover';
    noLoop(); 
}

function restartGame() {
    // Resetar variáveis
    rocketY = height / 2;
    rocketVelocidade = 0;
    asteroides = [];
    score = 0;
    gameState = 'running';
    asteroides.push(new Asteroide());
    loop(); 
}

// Classe do Obstáculo (Asteroide)
class Asteroide {
    constructor() {
        this.x = width;
        // Ponto de abertura: Garante que o centro da abertura não esteja muito perto das bordas.
        this.centroAbertura = random(asteroideAbertura / 2 + 20, height - asteroideAbertura / 2 - 20);
        this.topo = this.centroAbertura - asteroideAbertura / 2;
        this.fundo = this.centroAbertura + asteroideAbertura / 2;
        this.velocidade = velocidadeJogo; 
        this.passed = true;
    }

    desenhar() {
        fill(100, 100, 100); // Cor de rocha (Cinza)
        stroke(50); // Borda mais escura
        strokeWeight(2);

        // Asteroide de Cima
        rect(this.x, 0, asteroideLargura, this.topo);
        // Asteroide de Baixo
        rect(this.x, this.fundo, asteroideLargura, height - this.fundo);
    }

    mover() {
        this.x -= this.velocidade;
    }

    // Checagem de Colisão (simples)
    checkCollision(px, py, pr) {
        // Verifica se o foguete está horizontalmente na linha do asteroide
        if (px + pr > this.x && px - pr < this.x + asteroideLargura) {
            // Verifica se o foguete está verticalmente acima do asteroide de cima OU abaixo do asteroide de baixo
            if (py - pr < this.topo || py + pr > this.fundo) {
                return true;
            }
        }
        return false;
    }
}

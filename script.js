// Cursor personalizzato
const cursor = document.querySelector('.custom-cursor');
const links = document.querySelectorAll('a, button, .nav-link');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX - 10 + 'px';
  cursor.style.top = e.clientY - 10 + 'px';
});

links.forEach(link => {
  link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Navigazione
const navLinks = document.querySelectorAll('.nav-link, [data-target]');
const sections = document.querySelectorAll('.section');

function showSection(targetId) {
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  const activeNavLink = document.querySelector(`[data-target="${targetId}"].nav-link`);
  if (activeNavLink) {
    activeNavLink.classList.add('active');
  }
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-target');
    if (target) {
      showSection(target);
    }
  });
});

// Animazione scroll header
let lastScrollY = window.scrollY;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    header.style.transform = 'translateY(-100%)';
  } else {
    header.style.transform = 'translateY(0)';
  }
  lastScrollY = window.scrollY;
});

// Parallax per background letters
document.addEventListener('mousemove', (e) => {
  const letters = document.querySelectorAll('.bg-letter');
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  letters.forEach((letter, index) => {
    const speed = (index + 1) * 0.02;
    const xPos = (x - 0.5) * 50 * speed;
    const yPos = (y - 0.5) * 50 * speed;
    letter.style.transform = `translate(${xPos}px, ${yPos}px)`;
  });
});

// Easter egg: click sulla Z per attivare glitch temporaneo
document.querySelector('.bg-letter.z').addEventListener('click', () => {
  document.querySelector('#home h2').style.animation = 'glitch-1 0.1s infinite';
  setTimeout(() => {
    document.querySelector('#home h2').style.animation = '';
  }, 1000);
});

// BREAK BRICK GAME
class BreakoutGame {
  constructor() {
    this.canvas = document.getElementById('breakout-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.startBtn = document.getElementById('start-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.scoreElement = document.getElementById('game-score');
    this.livesElement = document.getElementById('game-lives');
    
    // Game state
    this.gameRunning = false;
    this.gamePaused = false;
    this.score = 0;
    this.lives = 3;
    
    // Paddle
    this.paddleWidth = 80;
    this.paddleHeight = 10;
    this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
    this.paddleY = this.canvas.height - this.paddleHeight - 10;
    this.paddleSpeed = 7;
    
    // Ball
    this.ballRadius = 8;
    this.ballX = this.canvas.width / 2;
    this.ballY = this.paddleY - this.ballRadius;
    this.ballDX = 3;
    this.ballDY = -3;
    this.ballOnPaddle = true;
    
    // Bricks
    this.brickRowCount = 5;
    this.brickColumnCount = 8;
    this.brickWidth = 45;
    this.brickHeight = 20;
    this.brickPadding = 3;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 15;
    
    this.bricks = [];
    this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    
    // Input
    this.keys = {};
    
    this.init();
  }
  
  init() {
    this.createBricks();
    this.setupEventListeners();
    this.updateUI();
    this.gameLoop();
  }
  
  createBricks() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        this.bricks[c][r] = {
          x: 0,
          y: 0,
          status: 1,
          color: this.colors[r % this.colors.length]
        };
      }
    }
  }
  
  setupEventListeners() {
    this.startBtn.addEventListener('click', () => this.startGame());
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.gameRunning) this.startGame();
        else if (this.ballOnPaddle) this.launchBall();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }
  
  startGame() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.gamePaused = false;
      this.startBtn.textContent = 'Restart';
      this.pauseBtn.disabled = false;
    } else {
      this.resetGame();
    }
  }
  
  togglePause() {
    if (this.gameRunning) {
      this.gamePaused = !this.gamePaused;
      this.pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pausa';
    }
  }
  
  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.ballX = this.canvas.width / 2;
    this.ballY = this.paddleY - this.ballRadius;
    this.ballOnPaddle = true;
    this.createBricks();
    this.updateUI();
  }
  
  launchBall() {
    if (this.ballOnPaddle) {
      this.ballOnPaddle = false;
      this.ballDX = (Math.random() - 0.5) * 6;
      this.ballDY = -4;
    }
  }
  
  updatePaddle() {
    if (this.keys['ArrowLeft'] && this.paddleX > 0) {
      this.paddleX -= this.paddleSpeed;
    }
    if (this.keys['ArrowRight'] && this.paddleX < this.canvas.width - this.paddleWidth) {
      this.paddleX += this.paddleSpeed;
    }
    
    if (this.ballOnPaddle) {
      this.ballX = this.paddleX + this.paddleWidth / 2;
    }
  }
  
  updateBall() {
    if (this.ballOnPaddle) return;
    
    this.ballX += this.ballDX;
    this.ballY += this.ballDY;
    
    // Wall collision
    if (this.ballX + this.ballRadius > this.canvas.width || this.ballX - this.ballRadius < 0) {
      this.ballDX = -this.ballDX;
    }
    
    if (this.ballY - this.ballRadius < 0) {
      this.ballDY = -this.ballDY;
    }
    
    // Paddle collision
    if (this.ballY + this.ballRadius > this.paddleY &&
        this.ballX > this.paddleX &&
        this.ballX < this.paddleX + this.paddleWidth) {
      
      let hitPos = (this.ballX - this.paddleX) / this.paddleWidth;
      this.ballDX = (hitPos - 0.5) * 8;
      this.ballDY = -Math.abs(this.ballDY);
    }
    
    // Ball out of bounds
    if (this.ballY + this.ballRadius > this.canvas.height) {
      this.lives--;
      if (this.lives > 0) {
        this.resetBall();
      } else {
        this.gameOver();
      }
    }
  }
  
  resetBall() {
    this.ballX = this.paddle

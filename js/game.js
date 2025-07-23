class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.isPaused = false;
        this.isCountdown = false;
        this.score = 0;
        this.lives = 3;
        this.timeLeft = CONFIG.GAME_TIME;
        this.hero = null;
        this.enemies = [];
        this.bullets = [];
        this.rocks = [];
        this.cacti = [];
        this.gameInterval = null;
        this.timerInterval = null;
        this.soundManager = new SoundManager();
        this.lastScoreUpdate = Date.now();
        this.scoreHistory = [];
        this.maxScorePerSecond = 5; // Maximum points per second
        this.scoreHash = '';
        this.lastFrameTime = performance.now();

        this.setupEventListeners();
        this.setupCanvas();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.togglePause();
            // Используем код клавиши для WASD
            if (e.code === 'KeyW') this.keys['w'] = true;
            if (e.code === 'KeyS') this.keys['s'] = true;
            if (e.code === 'KeyA') this.keys['a'] = true;
            if (e.code === 'KeyD') this.keys['d'] = true;
            if (e.key === 'ArrowUp') this.keys['ArrowUp'] = true;
            if (e.key === 'ArrowDown') this.keys['ArrowDown'] = true;
            if (e.key === 'ArrowLeft') this.keys['ArrowLeft'] = true;
            if (e.key === 'ArrowRight') this.keys['ArrowRight'] = true;
        });

        window.addEventListener('keyup', (e) => {
            // Используем код клавиши для WASD
            if (e.code === 'KeyW') this.keys['w'] = false;
            if (e.code === 'KeyS') this.keys['s'] = false;
            if (e.code === 'KeyA') this.keys['a'] = false;
            if (e.code === 'KeyD') this.keys['d'] = false;
            if (e.key === 'ArrowUp') this.keys['ArrowUp'] = false;
            if (e.key === 'ArrowDown') this.keys['ArrowDown'] = false;
            if (e.key === 'ArrowLeft') this.keys['ArrowLeft'] = false;
            if (e.key === 'ArrowRight') this.keys['ArrowRight'] = false;
        });

        window.addEventListener('resize', () => this.setupCanvas());

        // Add sound button handler
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.soundManager.toggleMute();
        });
    }

    setupCanvas() {
        canvasWidth = window.innerWidth * CONFIG.CANVAS.WIDTH_RATIO;
        canvasHeight = window.innerHeight * CONFIG.CANVAS.HEIGHT_RATIO;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.updateScaleFactor();
    }

    updateScaleFactor() {
        const widthRatio = canvasWidth / CONFIG.BASE_SCREEN.WIDTH;
        const heightRatio = canvasHeight / CONFIG.BASE_SCREEN.HEIGHT;
        // Use the smaller ratio to maintain proportions
        // But not less than 0.5 to keep the game playable
        this.scaleFactor = Math.max(0.5, Math.min(widthRatio, heightRatio));
        
        // Show warning if screen is too small
        const warningElement = document.getElementById('screen-size-warning');
        if (this.scaleFactor === 0.5 && warningElement) {
            warningElement.classList.remove('hidden');
        } else if (warningElement) {
            warningElement.classList.add('hidden');
        }

        // Update object sizes if game has started
        if (this.hero) {
            this.updateObjectSizes();
        }
    }

    // Update hero size
    updateObjectSizes() {
        this.hero.size = CONFIG.HERO.SIZE * this.scaleFactor;
        
        // Update enemy sizes
        this.enemies.forEach(enemy => {
            enemy.size = CONFIG.ENEMY.SIZE * this.scaleFactor;
        });
        
        // Update bullet sizes
        this.bullets.forEach(bullet => {
            bullet.size = CONFIG.BULLET.SIZE * this.scaleFactor;
        });
        
        // Update decoration sizes
        this.rocks.forEach(rock => {
            rock.size = rock.originalSize * this.scaleFactor;
        });
        
        this.cacti.forEach(cactus => {
            cactus.size = CONFIG.DECORATIONS.CACTI.SIZE * this.scaleFactor;
        });
    }

    generateDecorations() {
        this.rocks = [];
        this.cacti = [];

        for (let i = 0; i < CONFIG.DECORATIONS.ROCKS.COUNT; i++) {
            const size = CONFIG.DECORATIONS.ROCKS.MIN_SIZE + 
                Math.random() * (CONFIG.DECORATIONS.ROCKS.MAX_SIZE - CONFIG.DECORATIONS.ROCKS.MIN_SIZE);
            const rock = new Rock(
                Math.random() * canvasWidth,
                Math.random() * canvasHeight,
                size
            );
            rock.originalSize = size; // Save original size
            rock.size = size * this.scaleFactor; // Set scaled size
            this.rocks.push(rock);
        }

        for (let i = 0; i < CONFIG.DECORATIONS.CACTI.COUNT; i++) {
            const cactus = new Cactus(
                Math.random() * canvasWidth,
                Math.random() * canvasHeight
            );
            cactus.size = CONFIG.DECORATIONS.CACTI.SIZE * this.scaleFactor; // Set scaled size
            this.cacti.push(cactus);
        }
    }

    startGame() {
        // Clear all intervals before starting a new game
        if (this.gameInterval) {
            cancelAnimationFrame(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.resetGame();
        this.soundManager.play('start');

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('end-screen').classList.add('hidden');

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.generateDecorations();

        document.getElementById('timer').textContent = `Time: ${CONFIG.GAME_TIME}`;

        const countdownElement = document.getElementById('countdown');
        countdownElement.classList.remove('hidden');
        let countdown = 3;

        // Show first number and instructions immediately
        countdownElement.innerHTML = `
            <div class="countdown-number">${countdown}</div>
            <div class="countdown-instructions">
                Catch enemies and dodge bullets!
            </div>
        `;
        this.soundManager.play('countdown');
        this.isCountdown = true;

        const countdownInterval = setInterval(() => {
            countdown--;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownElement.classList.add('hidden');
                this.isCountdown = false;
                this.startGameLoop();
            } else {
                countdownElement.innerHTML = `
                    <div class="countdown-number">${countdown}</div>
                    <div class="countdown-instructions">
                        Catch enemies and dodge bullets!
                    </div>
                `;
                this.soundManager.play('countdown');
            }
        }, 1000);
    }

    resetGame() {
        this.hero = new Hero(canvasWidth / 2, canvasHeight / 2);
        this.hero.size = CONFIG.HERO.SIZE * this.scaleFactor; // Set initial size with scale factor
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.timeLeft = CONFIG.GAME_TIME;
        this.generateDecorations();
        this.updateUI();
        document.getElementById('timer').textContent = `Time: ${this.timeLeft}`;
        this.spawnEnemies();
    }

    spawnEnemies() {
        while (this.enemies.length < CONFIG.MAX_ENEMIES) {
            const enemy = new Enemy(
                Math.random() * canvasWidth,
                Math.random() * canvasHeight
            );
            enemy.size = CONFIG.ENEMY.SIZE * this.scaleFactor; // Set size with scale factor
            this.enemies.push(enemy);
        }
    }

    startGameLoop() {
        // Clear existing intervals before creating new ones
        if (this.gameInterval) {
            cancelAnimationFrame(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.isPaused = false;
        this.timeLeft = CONFIG.GAME_TIME;
        this.lastFrameTime = performance.now();
        
        // Use requestAnimationFrame for more efficient animation
        const gameLoop = (currentTime) => {
            if (this.isPaused) {
                this.lastFrameTime = currentTime;
                if (this.gameInterval) {
                    this.gameInterval = requestAnimationFrame(gameLoop);
                }
                return;
            }

            // Protection against too large delta time when tab is inactive
            const deltaTime = Math.min(currentTime - this.lastFrameTime, 32); // Maximum 32ms (about 30 FPS)
            this.lastFrameTime = currentTime;

            this.updateGame(deltaTime / 16.667); // Normalize to 60 FPS
            
            if (this.gameInterval) {
                this.gameInterval = requestAnimationFrame(gameLoop);
            }
        };
        
        this.gameInterval = requestAnimationFrame(gameLoop);
        
        // Start timer
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.timeLeft > 0) {
                this.timeLeft--;
                document.getElementById('timer').textContent = `Time: ${this.timeLeft}`;
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    updateGame(deltaTime = 1) {
        if (this.isPaused) return;

        // Update positions with delta time
        this.hero.move(this.keys, this.scaleFactor * deltaTime);

        this.enemies.forEach(enemy => {
            enemy.move(this.hero, this.scaleFactor * deltaTime);
            const bullet = enemy.shoot(this.hero);
            if (bullet) {
                this.bullets.push(bullet);
            }
        });

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.move(deltaTime);
            return !bullet.isOutOfBounds();
        });

        this.checkCollisions();
        this.drawGame();
    }

    validateScore(newScore) {
        const now = Date.now();
        const timeSinceLastUpdate = now - this.lastScoreUpdate;
        
        // Check if score is increasing too quickly
        if (timeSinceLastUpdate < 1000 && this.scoreHistory.length >= this.maxScorePerSecond) {
            console.warn('Suspicious activity: score increasing too fast');
            return false;
        }

        // Check if new score exceeds previous by more than 1
        if (newScore - this.score > 1) {
            console.warn('Suspicious activity: invalid score increase');
            return false;
        }

        // Update score history
        this.scoreHistory.push(now);
        this.scoreHistory = this.scoreHistory.filter(time => now - time < 1000);
        
        this.lastScoreUpdate = now;
        return true;
    }

    encryptData(data) {
        // Simple encryption for demonstration
        // Use more secure encryption in production
        return btoa(JSON.stringify(data));
    }

    validateDataIntegrity() {
        // Check score validity only
        if (this.score < 0 || this.score > 1000) {
            console.warn('Invalid score value');
            return false;
        }
        return true;
    }

    checkCollisions() {
        this.enemies = this.enemies.filter(enemy => {
            if (this.hero.isColliding(enemy)) {
                const newScore = this.score + 1;
                if (this.validateScore(newScore)) {
                    this.score = newScore;
                    this.updateUI();
                    this.soundManager.play('hit');
                    return false;
                }
            }
            return true;
        });

        if (this.enemies.length < CONFIG.MAX_ENEMIES) {
            this.spawnEnemies();
        }

        this.bullets = this.bullets.filter(bullet => {
            if (this.hero.isColliding(bullet)) {
                this.lives--;
                this.updateUI();
                this.soundManager.play('shoot');
                // Запускаем мигание героя при столкновении с пулей
                this.hero.startBlinking();
                if (this.lives <= 0) this.endGame();
                return false;
            }
            return true;
        });

        // Check data integrity after each update
        if (!this.validateDataIntegrity()) {
            this.handleCheatAttempt();
        }
    }

    handleCheatAttempt() {
        console.warn('Cheat attempt detected');
        // Additional actions can be added:
        // - Reset score
        // - Block game
        // - Send data to server
    }

    drawGame() {
        this.ctx.fillStyle = CONFIG.COLORS.PRIMARY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        Animations.drawBorder(this.ctx);

        this.rocks.forEach(rock => Animations.drawRock(this.ctx, rock.x, rock.y, rock.size));
        this.cacti.forEach(cactus => Animations.drawCactus(this.ctx, cactus.x, cactus.y));

        Animations.drawHero(this.ctx, this.hero.x, this.hero.y, this.hero.size, this.hero.frame, this.hero.isBlinking, this.hero.blinkTimer);
        this.enemies.forEach(enemy => 
            Animations.drawEnemy(this.ctx, enemy.x, enemy.y, enemy.size, enemy.pulse)
        );
        this.bullets.forEach(bullet => 
            Animations.drawBullet(this.ctx, bullet.x, bullet.y, bullet.size)
        );
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    }

    togglePause() {
        if (this.isCountdown) return;

        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pause-menu').classList.remove('hidden');
            // When paused, save current time
            this.lastFrameTime = performance.now();
        } else {
            document.getElementById('pause-menu').classList.add('hidden');
        }
    }

    endGame() {
        // Clear game loop
        if (this.gameInterval) {
            cancelAnimationFrame(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.soundManager.play('gameOver');
        
        // Check final score before saving
        if (!this.validateDataIntegrity()) {
            console.warn('Final score modification attempt detected');
            this.score = 0; // Reset score if cheating detected
        }

        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('end-screen').classList.remove('hidden');
        document.getElementById('final-score').textContent = `Your Score: ${this.score}`;

        // Get current high score
        let highScore = 0;
        const storedHighScore = localStorage.getItem('highScore');
        if (storedHighScore) {
            try {
                const decryptedData = JSON.parse(atob(storedHighScore));
                highScore = decryptedData.score;
            } catch (e) {
                console.warn('Error reading high score:', e);
                highScore = 0;
            }
        }

        if (this.score > highScore) {
            // Encrypt data before saving
            const encryptedScore = this.encryptData({
                score: this.score,
                timestamp: Date.now()
            });
            localStorage.setItem('highScore', encryptedScore);
            document.getElementById('high-score').textContent = `High Score: ${this.score}`;
            document.getElementById('new-high-score').classList.remove('hidden');
            this.soundManager.play('highScore');
        } else {
            document.getElementById('new-high-score').classList.add('hidden');
        }

        // Clear game state
        this.isPaused = false;
        this.isCountdown = false;
        this.enemies = [];
        this.bullets = [];
    }

    returnToMainMenu() {
        // Clear game loop when returning to menu
        if (this.gameInterval) {
            cancelAnimationFrame(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        
        // Update high score display
        let highScore = 0;
        const storedHighScore = localStorage.getItem('highScore');
        if (storedHighScore) {
            try {
                const decryptedData = JSON.parse(atob(storedHighScore));
                highScore = decryptedData.score;
            } catch (e) {
                console.warn('Error reading high score:', e);
                highScore = 0;
            }
        }
        document.getElementById('high-score').textContent = `High Score: ${highScore}`;
        
        // Clear game state
        this.isPaused = false;
        this.isCountdown = false;
        this.enemies = [];
        this.bullets = [];
        this.resetGame();
    }
} 
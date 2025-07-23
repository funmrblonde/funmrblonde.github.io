class UI {
    constructor(game) {
        this.game = game;
        this.mainMenuCanvas = document.getElementById('main-menu-character');
        this.mainMenuCtx = this.mainMenuCanvas.getContext('2d');
        this.mainMenuFrame = 0;

        // Предзагружаем шрифт
        this.loadFont();

        this.setupMainMenuCanvas();
        this.setupEventListeners();
        this.animateMainMenuCharacter();
    }

    loadFont() {
        const font = new FontFace('Russo One', 'url(https://fonts.gstatic.com/s/russoone/v14/Z9XUDmZRWg6M1LvRYsHOy8mJrrg.woff2)');
        font.load().then(() => {
            document.fonts.add(font);
        });
    }

    setupMainMenuCanvas() {
        this.mainMenuCanvas.width = 200;
        this.mainMenuCanvas.height = 200;
    }

    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => {
            this.game.startGame();
        });

        document.getElementById('restart-button').addEventListener('click', () => {
            document.getElementById('end-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });

        document.getElementById('resume-button').addEventListener('click', () => {
            console.log('Resume button clicked');
            this.game.togglePause();
        });

        document.getElementById('main-menu-button').addEventListener('click', () => {
            this.game.returnToMainMenu();
        });
    }

    animateMainMenuCharacter() {
        this.mainMenuCtx.clearRect(0, 0, this.mainMenuCanvas.width, this.mainMenuCanvas.height);
        Animations.drawMainMenuCharacter(this.mainMenuCtx, this.mainMenuFrame);
        this.mainMenuFrame += 0.1;
        if (this.mainMenuFrame >= 2) this.mainMenuFrame = 0;
        requestAnimationFrame(() => this.animateMainMenuCharacter());
    }

    static async generateShareImage(score) {
        try {
            // Wait for font loading
            await document.fonts.load('bold 80px "Russo One"');

            // Create temporary canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1200;
            canvas.height = 630;
            const ctx = canvas.getContext('2d');

            // Fill background with game's primary color
            ctx.fillStyle = CONFIG.COLORS.PRIMARY;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add subtle pattern similar to game background
            ctx.save();
            ctx.fillStyle = CONFIG.COLORS.SECONDARY;
            ctx.globalAlpha = 0.1;
            const patternSize = 100;
            for (let x = 0; x < canvas.width; x += patternSize) {
                for (let y = 0; y < canvas.height; y += patternSize) {
                    ctx.fillRect(x, y, patternSize / 2, patternSize / 2);
                }
            }
            ctx.restore();

            // Add border like in the game
            ctx.strokeStyle = CONFIG.COLORS.SECONDARY;
            ctx.lineWidth = 20;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

            // Add inner border
            ctx.strokeStyle = CONFIG.COLORS.ACCENT;
            ctx.lineWidth = 10;
            ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

            // Draw hero
            const heroSize = 300;
            const heroX = 200;
            const heroY = canvas.height / 2 - heroSize / 2 + 50;
            
            // Add shadow to hero
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            Animations.drawHero(ctx, heroX, heroY, heroSize, 0);
            ctx.restore();

            // Add text content
            const contentX = canvas.width * 0.45;

            // Title
            ctx.textAlign = 'left';
            ctx.fillStyle = CONFIG.COLORS.ACCENT;
            ctx.font = 'bold 120px "Russo One"';
            
            // Add shadow to text
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillText('Mr.Blonde', contentX, canvas.height * 0.4);

            // Score
            ctx.font = 'bold 80px "Russo One"';
            ctx.fillStyle = CONFIG.COLORS.TEXT;
            ctx.fillText(`Score: ${score}`, contentX, canvas.height * 0.6);

            // Convert canvas to data URL
            const imageUrl = canvas.toDataURL('image/png');
            
            // Only return the URL, don't create download
            return imageUrl;
        } catch (error) {
            console.error('Error generating share image:', error);
            return null;
        }
    }

    static async updateShareMetaTags(score) {
        if (window.location.protocol === 'file:') {
            return; // Skip meta tags update for local file
        }

        try {
            const imageUrl = await this.generateShareImage(score);
            if (imageUrl) {
                // Update Open Graph meta tags
                let ogImage = document.querySelector('meta[property="og:image"]');
                if (!ogImage) {
                    ogImage = document.createElement('meta');
                    ogImage.setAttribute('property', 'og:image');
                    document.head.appendChild(ogImage);
                }
                ogImage.setAttribute('content', imageUrl);

                // Update Twitter meta tags
                let twitterImage = document.querySelector('meta[name="twitter:image"]');
                if (!twitterImage) {
                    twitterImage = document.createElement('meta');
                    twitterImage.setAttribute('name', 'twitter:image');
                    document.head.appendChild(twitterImage);
                }
                twitterImage.setAttribute('content', imageUrl);

                // Update other meta tags
                let ogTitle = document.querySelector('meta[property="og:title"]');
                if (!ogTitle) {
                    ogTitle = document.createElement('meta');
                    ogTitle.setAttribute('property', 'og:title');
                    document.head.appendChild(ogTitle);
                }
                ogTitle.setAttribute('content', `Mr.Blonde - Score: ${score}`);

                let ogDescription = document.querySelector('meta[property="og:description"]');
                if (!ogDescription) {
                    ogDescription = document.createElement('meta');
                    ogDescription.setAttribute('property', 'og:description');
                    document.head.appendChild(ogDescription);
                }
                ogDescription.setAttribute('content', `I scored ${score} points in Mr.Blonde! Try to beat my score!`);
            }
        } catch (error) {
            console.error('Error updating share meta tags:', error);
        }
    }

    static async shareOnFacebook() {
        const score = game.score;
        const imageUrl = await this.generateShareImage(score);
        await this.updateShareMetaTags(score);
        const text = `I scored ${score} points in Mr.Blonde! Try to beat my score!`;
        const url = window.location.protocol === 'file:' ? 
            'http://funmrblonde.github.io' : 
            window.location.href;
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    static async shareOnX() {
        const score = game.score;
        const imageUrl = await this.generateShareImage(score);
        await this.updateShareMetaTags(score);
        const text = `I scored ${score} points in Mr.Blonde! Try to beat my score!`;
        const url = window.location.protocol === 'file:' ? 
            'http://funmrblonde.github.io' : 
            window.location.href;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    static async shareOnTelegram() {
        const score = game.score;
        const imageUrl = await this.generateShareImage(score);
        await this.updateShareMetaTags(score);
        const text = `I scored ${score} points in Mr.Blonde! Try to beat my score!`;
        const url = window.location.protocol === 'file:' ? 
            'http://funmrblonde.github.io' : 
            window.location.href;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    static updateHighScore() {
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
    }
} 
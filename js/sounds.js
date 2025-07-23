class SoundManager {
    constructor() {
        this.isMuted = false;
        this.soundGenerator = new SoundGenerator();
        this.initialized = false;

        // Добавляем обработчик для инициализации звуков после первого взаимодействия пользователя
        document.addEventListener('click', () => {
            if (!this.initialized) {
                this.initialized = true;
                // Воспроизводим короткий звук для инициализации аудио контекста
                this.play('start');
            }
        }, { once: true });
    }

    play(soundName) {
        if (this.isMuted) return;

        switch (soundName) {
            case 'shoot':
                this.soundGenerator.generateShootSound();
                break;
            case 'hit':
                this.soundGenerator.generateHitSound();
                break;
            case 'gameOver':
                this.soundGenerator.generateGameOverSound();
                break;
            case 'start':
                this.soundGenerator.generateStartSound();
                break;
            case 'countdown':
                this.soundGenerator.generateCountdownSound();
                break;
            case 'highScore':
                this.soundGenerator.generateHighScoreSound();
                break;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const button = document.getElementById('sound-toggle');
        button.textContent = this.isMuted ? '🔈' : '🔊';
        button.classList.toggle('muted', this.isMuted);
    }
} 
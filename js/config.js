const CONFIG = {
    GAME_TIME: 60,
    MAX_ENEMIES: 5,
    BASE_SCREEN: {
        WIDTH: 1920,
        HEIGHT: 1080
    },
    HERO: {
        SIZE: 45,
        BASE_SPEED: 8,
        ANIMATION_SPEED: 0.15
    },
    ENEMY: {
        SIZE: 30,
        BASE_MIN_SPEED: 4,
        BASE_MAX_SPEED: 7,
        CHASE_DISTANCE: 250,
        SHOOT_COOLDOWN: {
            MIN: 800,
            MAX: 2000
        }
    },
    BULLET: {
        SIZE: 3,
        BASE_SPEED: 8
    },
    DECORATIONS: {
        ROCKS: {
            COUNT: 10,
            MIN_SIZE: 8,
            MAX_SIZE: 20
        },
        CACTI: {
            COUNT: 5,
            SIZE: 30
        }
    },
    CANVAS: {
        WIDTH_RATIO: 0.9,
        HEIGHT_RATIO: 0.8
    },
    COLORS: {
        PRIMARY: '#f4a460',
        SECONDARY: '#8B4513',
        ACCENT: '#FFD700',
        TEXT: 'white',
        SHADOW: 'rgba(0, 0, 0, 0.5)',
        ENEMY: 'rgba(255, 69, 0, 1)',
        BULLET: 'yellow'
    }
}; 
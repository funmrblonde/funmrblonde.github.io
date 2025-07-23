class Entity {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.size,
            top: this.y,
            bottom: this.y + this.size,
            centerX: this.x + this.size / 2,
            centerY: this.y + this.size / 2
        };
    }

    isColliding(other) {
        const bounds = this.getBounds();
        const otherBounds = other.getBounds();
        
        // For bullets, use rectangular collision
        if (other instanceof Bullet) {
            return !(bounds.right < otherBounds.left || 
                    bounds.left > otherBounds.right || 
                    bounds.bottom < otherBounds.top || 
                    bounds.top > otherBounds.bottom);
        }
        
        // For hero-enemy collisions, use more precise circular collision
        if ((this instanceof Hero && other instanceof Enemy) || 
            (this instanceof Enemy && other instanceof Hero)) {
            const distance = Math.hypot(
                bounds.centerX - otherBounds.centerX,
                bounds.centerY - otherBounds.centerY
            );
            // Reduce collision radius for more precise detection
            const collisionRadius = (this.size + other.size) * 0.45;
            return distance < collisionRadius;
        }
        
        // For other objects, use standard circular collision
        const distance = Math.hypot(
            bounds.centerX - otherBounds.centerX,
            bounds.centerY - otherBounds.centerY
        );
        return distance < (this.size + other.size) / 2;
    }
}

class Hero extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.HERO.SIZE);
        this.baseSpeed = CONFIG.HERO.BASE_SPEED;
        this.frame = 0;
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.blinkDuration = 60; // Длительность мигания в кадрах (1 секунда при 60 FPS)
    }

    move(keys, scaleFactor) {
        const speed = this.baseSpeed * scaleFactor;
        if (keys['ArrowUp'] || keys['w']) this.y = Math.max(this.y - speed, 0);
        if (keys['ArrowDown'] || keys['s']) this.y = Math.min(this.y + speed, canvasHeight - this.size);
        if (keys['ArrowLeft'] || keys['a']) this.x = Math.max(this.x - speed, 0);
        if (keys['ArrowRight'] || keys['d']) this.x = Math.min(this.x + speed, canvasWidth - this.size);

        // Обновляем анимацию с учетом дельта-времени
        this.frame += CONFIG.HERO.ANIMATION_SPEED * (scaleFactor / 1);
        if (this.frame >= 2) this.frame = 0;
        
        // Обновляем состояние мигания
        this.updateBlinking();
    }
    
    updateBlinking() {
        if (this.isBlinking) {
            this.blinkTimer--;
            if (this.blinkTimer <= 0) {
                this.isBlinking = false;
            }
        }
    }
    
    startBlinking() {
        this.isBlinking = true;
        this.blinkTimer = this.blinkDuration;
    }
}

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.ENEMY.SIZE);
        this.baseMinSpeed = CONFIG.ENEMY.BASE_MIN_SPEED;
        this.baseMaxSpeed = CONFIG.ENEMY.BASE_MAX_SPEED;
        this.dx = Math.random() > 0.5 ? 1 : -1;
        this.dy = Math.random() > 0.5 ? 1 : -1;
        this.shootCooldown = CONFIG.ENEMY.SHOOT_COOLDOWN.MIN + 
            Math.random() * (CONFIG.ENEMY.SHOOT_COOLDOWN.MAX - CONFIG.ENEMY.SHOOT_COOLDOWN.MIN);
        this.lastShot = 0;
        this.pulse = 1;
    }

    move(hero, scaleFactor) {
        const minSpeed = this.baseMinSpeed * scaleFactor;
        const maxSpeed = this.baseMaxSpeed * scaleFactor;
        
        // Рассчитываем расстояние до героя
        const distance = Math.hypot(hero.x - this.x, hero.y - this.y);
        
        // Если враг близко к герою, увеличиваем скорость
        if (distance < CONFIG.ENEMY.CHASE_DISTANCE) {
            // Чем ближе к герою, тем выше скорость (до 2.5 раз быстрее)
            const distanceFactor = 1 + 1.5 * (1 - distance / CONFIG.ENEMY.CHASE_DISTANCE);
            this.speed = maxSpeed * distanceFactor;
        } else {
            this.speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
            
            // 2% шанс изменить направление при обычном движении
            if (Math.random() < 0.02) {
                this.dx = Math.random() > 0.5 ? 1 : -1;
                this.dy = Math.random() > 0.5 ? 1 : -1;
            }
        }

        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Отражение от границ
        if (this.x <= 0 || this.x >= canvasWidth - this.size) this.dx *= -1;
        if (this.y <= 0 || this.y >= canvasHeight - this.size) this.dy *= -1;

        this.pulse += 0.05;
        if (this.pulse > 1.2) this.pulse = 0.8;
    }

    canShoot() {
        return Date.now() - this.lastShot > this.shootCooldown;
    }

    shoot(hero) {
        if (this.canShoot()) {
            const distance = Math.hypot(hero.x - this.x, hero.y - this.y);
            this.lastShot = Date.now();
            return new Bullet(
                this.x + this.size / 2,
                this.y + this.size / 2,
                hero.x + hero.size / 2,
                hero.y + hero.size / 2,
                distance,
                game.scaleFactor
            );
        }
        return null;
    }
}

class Bullet extends Entity {
    constructor(x, y, targetX, targetY, distance, scaleFactor) {
        super(x, y, CONFIG.BULLET.SIZE);
        this.baseSpeed = CONFIG.BULLET.BASE_SPEED;
        this.speed = this.baseSpeed * scaleFactor;
        this.dx = (targetX - x) / distance;
        this.dy = (targetY - y) / distance;
    }

    move(deltaTime = 1) {
        // Применяем дельта-время к движению пули
        const adjustedSpeed = this.speed * deltaTime;
        this.x += this.dx * adjustedSpeed;
        this.y += this.dy * adjustedSpeed;
    }

    isOutOfBounds() {
        return this.x < 0 || this.x > canvasWidth || 
               this.y < 0 || this.y > canvasHeight;
    }
}

class Decoration {
    constructor(x, y, size = null) {
        this.x = x;
        this.y = y;
        this.size = size;
    }
}

class Rock extends Decoration {
    constructor(x, y, size) {
        super(x, y, size);
    }
}

class Cactus extends Decoration {
    constructor(x, y) {
        super(x, y);
    }
} 
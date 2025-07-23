class Animations {
    static drawBorder(ctx) {
        // Основная стена
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, canvasWidth, 20); // Верхняя стена
        ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20); // Нижняя стена
        ctx.fillRect(0, 0, 20, canvasHeight); // Левая стена
        ctx.fillRect(canvasWidth - 20, 0, 20, canvasHeight); // Правая стена

        // Текстура стены
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < canvasWidth; i += 40) {
            for (let j = 0; j < canvasHeight; j += 40) {
                if (i < 20 || i > canvasWidth - 20 || j < 20 || j > canvasHeight - 20) {
                    ctx.fillRect(i, j, 20, 20);
                }
            }
        }

        // Колючая проволока
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        
        // Верхняя проволока
        for (let i = 0; i < canvasWidth; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 15, 10);
            ctx.lineTo(i + 30, 0);
            ctx.stroke();
        }

        // Нижняя проволока
        for (let i = 0; i < canvasWidth; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, canvasHeight);
            ctx.lineTo(i + 15, canvasHeight - 10);
            ctx.lineTo(i + 30, canvasHeight);
            ctx.stroke();
        }

        // Левая проволока
        for (let i = 0; i < canvasHeight; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(10, i + 15);
            ctx.lineTo(0, i + 30);
            ctx.stroke();
        }

        // Правая проволока
        for (let i = 0; i < canvasHeight; i += 30) {
            ctx.beginPath();
            ctx.moveTo(canvasWidth, i);
            ctx.lineTo(canvasWidth - 10, i + 15);
            ctx.lineTo(canvasWidth, i + 30);
            ctx.stroke();
        }
    }

    static drawRock(ctx, x, y, size) {
        ctx.fillStyle = CONFIG.COLORS.SECONDARY;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    static drawCactus(ctx, x, y) {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x, y, 10, 30);
        ctx.fillRect(x - 5, y + 10, 20, 10);
        ctx.fillRect(x - 5, y + 25, 20, 10);
    }

    static drawHero(ctx, x, y, size, frame, isBlinking = false, blinkTimer = 0) {
        // Если герой мигает, создаем эффект прозрачности
        if (isBlinking) {
            // Частота мигания - каждые 5 кадров
            const blinkFrequency = 5;
            const shouldShow = Math.floor(blinkTimer / blinkFrequency) % 2 === 0;
            
            if (!shouldShow) {
                // Делаем героя полупрозрачным во время мигания
                ctx.globalAlpha = 0.3;
            }
        }
        // Face color (Trump's tan)
        ctx.fillStyle = '#ffa07a';
        ctx.fillRect(x, y, size * 0.9, size * 0.9); // Уменьшаем высоту лица

        // Lighter area around eyes
        ctx.fillStyle = '#f9c29f';
        ctx.beginPath();
        ctx.ellipse(x + size * 0.45, y + size * 0.25, size * 0.35, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trump Hair
        ctx.fillStyle = CONFIG.COLORS.ACCENT;
        
        // Основная масса волос сзади
        ctx.beginPath();
        ctx.moveTo(x - size/8, y);
        ctx.lineTo(x + size * 0.9 + size/8, y);
        ctx.lineTo(x + size * 0.9 + size/8, y - size/4);
        ctx.lineTo(x - size/8, y - size/4);
        ctx.fill();

        // Начес сверху
        ctx.beginPath();
        ctx.moveTo(x - size/8, y - size/4);
        ctx.bezierCurveTo(
            x + size/3, y - size/2,
            x + size/2, y - size/1.8,
            x + size * 0.9 + size/8, y - size/4
        );
        ctx.bezierCurveTo(
            x + size * 0.9/1.2, y - size/2.2,
            x + size/2, y - size/2.5,
            x - size/8, y - size/4
        );
        ctx.fill();

        // Передняя прядь (чёлка)
        ctx.beginPath();
        ctx.moveTo(x - size/8, y - size/4);
        ctx.bezierCurveTo(
            x + size/4, y - size/3,
            x + size/2, y - size/6,
            x + size * 0.9 + size/8, y - size/5
        );
        ctx.lineTo(x + size * 0.9 + size/8, y - size/4);
        ctx.bezierCurveTo(
            x + size * 0.9/1.5, y - size/3,
            x + size/3, y - size/2.5,
            x - size/8, y - size/4
        );
        ctx.fill();

        // Боковой начес слева
        ctx.beginPath();
        ctx.moveTo(x - size/8, y);
        ctx.quadraticCurveTo(
            x - size/4, y - size/3,
            x - size/8, y - size/2
        );
        ctx.quadraticCurveTo(
            x, y - size/3,
            x - size/8, y
        );
        ctx.fill();

        // Eyes (уменьшенные, прищуренные)
        ctx.fillStyle = 'white';
        ctx.fillRect(x + size * 0.25 + (frame > 1 ? 2 : 0), y + size * 0.22, size / 10, size / 12);
        ctx.fillRect(x + size * 0.55 + (frame > 1 ? 2 : 0), y + size * 0.22, size / 10, size / 12);

        ctx.fillStyle = 'black';
        ctx.fillRect(x + size * 0.25 + size / 16 + (frame > 1 ? 2 : 0), y + size * 0.22 + size / 24, size / 20, size / 20);
        ctx.fillRect(x + size * 0.55 + size / 16 + (frame > 1 ? 2 : 0), y + size * 0.22 + size / 24, size / 20, size / 20);

        // Характерные брови
        ctx.fillStyle = CONFIG.COLORS.ACCENT;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25, y + size * 0.22 - size / 12);
        ctx.lineTo(x + size * 0.25 + size / 6, y + size * 0.22 - size / 8);
        ctx.lineTo(x + size * 0.25 + size / 6, y + size * 0.22 - size / 12);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + size * 0.55, y + size * 0.22 - size / 12);
        ctx.lineTo(x + size * 0.55 + size / 6, y + size * 0.22 - size / 8);
        ctx.lineTo(x + size * 0.55 + size / 6, y + size * 0.22 - size / 12);
        ctx.fill();

        // Mouth (характерная гримаса)
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25, y + size * 0.45);
        ctx.quadraticCurveTo(x + size * 0.45, y + size * 0.45 + size / 8, x + size * 0.65, y + size * 0.45);
        ctx.quadraticCurveTo(x + size * 0.45, y + size * 0.45 - size / 16, x + size * 0.25, y + size * 0.45);
        ctx.fill();
        
        // Сбрасываем прозрачность
        ctx.globalAlpha = 1.0;
    }

    static drawEnemy(ctx, x, y, size, pulse) {
        // Сомбреро
        ctx.fillStyle = `rgba(255, 69, 0, ${pulse})`;
        
        // Широкие поля шляпы
        ctx.beginPath();
        ctx.ellipse(x, y - size / 4, size * 0.9, size / 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Верхняя часть шляпы
        ctx.beginPath();
        ctx.moveTo(x - size / 3, y - size / 4);
        ctx.quadraticCurveTo(x, y - size * 0.8, x + size / 3, y - size / 4);
        ctx.fill();

        // Украшение на шляпе (орнамент)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        
        // Круговой орнамент
        for (let i = 0; i < Math.PI * 2; i += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(i) * size * 0.4, y - size / 4 + Math.sin(i) * size / 7);
            ctx.lineTo(x + Math.cos(i) * size * 0.8, y - size / 4 + Math.sin(i) * size / 4);
            ctx.stroke();
        }

        // Зигзагообразный орнамент
        ctx.beginPath();
        for (let i = -size * 0.8; i <= size * 0.8; i += size / 8) {
            ctx.lineTo(x + i, y - size / 4 + Math.sin(i * 0.2) * size / 10);
        }
        ctx.stroke();

        // Тело врага (смуглая кожа)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - size / 2, y, size, size);

        // Глаза
        ctx.fillStyle = 'white';
        ctx.fillRect(x - size / 4, y + size / 4, size / 8, size / 8);
        ctx.fillRect(x + size / 4, y + size / 4, size / 8, size / 8);

        ctx.fillStyle = 'black';
        ctx.fillRect(x - size / 4 + size / 16, y + size / 4 + size / 16, size / 16, size / 16);
        ctx.fillRect(x + size / 4 + size / 16, y + size / 4 + size / 16, size / 16, size / 16);

        // Усы
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // Левый ус
        ctx.beginPath();
        ctx.moveTo(x - size / 4, y + size / 2);
        ctx.quadraticCurveTo(
            x - size / 2.5, y + size / 2 - size / 16,
            x - size / 2, y + size / 2 - size / 8
        );
        ctx.stroke();

        // Правый ус
        ctx.beginPath();
        ctx.moveTo(x + size / 4, y + size / 2);
        ctx.quadraticCurveTo(
            x + size / 2.5, y + size / 2 - size / 16,
            x + size / 2, y + size / 2 - size / 8
        );
        ctx.stroke();

        // Рот (улыбка)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - size / 4, y + size / 2);
        ctx.quadraticCurveTo(
            x, y + size / 2 + size / 8,
            x + size / 4, y + size / 2
        );
        ctx.stroke();
    }

    static drawBullet(ctx, x, y, size) {
        ctx.fillStyle = CONFIG.COLORS.BULLET;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    static drawMainMenuCharacter(ctx, frame) {
        const size = 80;
        const x = 60;
        const y = 60;

        // Face color (Trump's tan)
        ctx.fillStyle = '#ffa07a';
        ctx.fillRect(x, y, size * 0.9, size * 0.9);

        // Lighter area around eyes
        ctx.fillStyle = '#f9c29f';
        ctx.beginPath();
        ctx.ellipse(x + size * 0.45, y + size * 0.25, size * 0.35, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trump Hair
        ctx.fillStyle = CONFIG.COLORS.ACCENT;
        
        // Основная масса волос сзади
        ctx.beginPath();
        ctx.moveTo(x - size/8, y);
        ctx.lineTo(x + size * 0.9 + size/8, y);
        ctx.lineTo(x + size * 0.9 + size/8, y - size/4);
        ctx.lineTo(x - size/8, y - size/4);
        ctx.fill();

        // Начес сверху
        ctx.beginPath();
        ctx.moveTo(x - size/8, y - size/4);
        ctx.bezierCurveTo(
            x + size/3, y - size/2,
            x + size/2, y - size/1.8,
            x + size * 0.9 + size/8, y - size/4
        );
        ctx.bezierCurveTo(
            x + size * 0.9/1.2, y - size/2.2,
            x + size/2, y - size/2.5,
            x - size/8, y - size/4
        );
        ctx.fill();

        // Передняя прядь (чёлка)
        ctx.beginPath();
        ctx.moveTo(x - size/8, y - size/4);
        ctx.bezierCurveTo(
            x + size/4, y - size/3,
            x + size/2, y - size/6,
            x + size * 0.9 + size/8, y - size/5
        );
        ctx.lineTo(x + size * 0.9 + size/8, y - size/4);
        ctx.bezierCurveTo(
            x + size * 0.9/1.5, y - size/3,
            x + size/3, y - size/2.5,
            x - size/8, y - size/4
        );
        ctx.fill();

        // Боковой начес слева
        ctx.beginPath();
        ctx.moveTo(x - size/8, y);
        ctx.quadraticCurveTo(
            x - size/4, y - size/3,
            x - size/8, y - size/2
        );
        ctx.quadraticCurveTo(
            x, y - size/3,
            x - size/8, y
        );
        ctx.fill();

        // Eyes (уменьшенные, прищуренные)
        ctx.fillStyle = 'white';
        ctx.fillRect(x + size * 0.25 + (frame > 1 ? 2 : 0), y + size * 0.22, size / 10, size / 12);
        ctx.fillRect(x + size * 0.55 + (frame > 1 ? 2 : 0), y + size * 0.22, size / 10, size / 12);

        ctx.fillStyle = 'black';
        ctx.fillRect(x + size * 0.25 + size / 16 + (frame > 1 ? 2 : 0), y + size * 0.22 + size / 24, size / 20, size / 20);
        ctx.fillRect(x + size * 0.55 + size / 16 + (frame > 1 ? 2 : 0), y + size * 0.22 + size / 24, size / 20, size / 20);

        // Характерные брови
        ctx.fillStyle = CONFIG.COLORS.ACCENT;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25, y + size * 0.22 - size / 12);
        ctx.lineTo(x + size * 0.25 + size / 6, y + size * 0.22 - size / 8);
        ctx.lineTo(x + size * 0.25 + size / 6, y + size * 0.22 - size / 12);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + size * 0.55, y + size * 0.22 - size / 12);
        ctx.lineTo(x + size * 0.55 + size / 6, y + size * 0.22 - size / 8);
        ctx.lineTo(x + size * 0.55 + size / 6, y + size * 0.22 - size / 12);
        ctx.fill();

        // Mouth (характерная гримаса)
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25, y + size * 0.45);
        ctx.quadraticCurveTo(x + size * 0.45, y + size * 0.45 + size / 8, x + size * 0.65, y + size * 0.45);
        ctx.quadraticCurveTo(x + size * 0.45, y + size * 0.45 - size / 16, x + size * 0.25, y + size * 0.45);
        ctx.fill();

        // Анимация движения
        const offset = Math.sin(frame * Math.PI) * 5;
        ctx.save();
        ctx.translate(0, offset);
        ctx.restore();
    }
} 
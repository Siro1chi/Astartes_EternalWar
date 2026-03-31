// ============================================
// МИНЫ-ЛОВУШКИ
// ============================================

import { CONFIG } from '../skills/skillsData.js';
import { distSq } from '../core/utils.js';

// ============================================
// Класс Mine
// ============================================
export class Mine {
    constructor(x, y, radius, damage, lifetime = 1.5) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.damage = damage;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.markedForRemoval = false;
    }

    update(dt, enemies, player) {
        this.lifetime -= dt;

        // Проверка столкновений с врагами
        for (const e of enemies) {
            if (!e.markedForRemoval && distSq(this.x, this.y, e.x, e.y) < this.radius ** 2) {
                e.takeDamage(this.damage, player);
            }
        }

        if (this.lifetime <= 0) {
            // Взрыв в конце времени жизни
            this.explode(enemies, player);
            this.markedForRemoval = true;
        }
    }

    explode(enemies, player) {
        // Урон всем врагам в радиусе
        for (const e of enemies) {
            if (!e.markedForRemoval && distSq(this.x, this.y, e.x, e.y) < this.radius ** 2) {
                e.takeDamage(this.damage, player);
            }
        }

        // Визуальный эффект
        window.gameManager?.spawnParticle(this.x, this.y, 'ring', '#ff5500', this.radius);
        window.gameManager?.spawnParticles(this.x, this.y, '#ffaa00', 10);
    }

    render(ctx) {
        // Мигание перед взрывом
        const alpha = this.lifetime < 0.5 ? (Math.floor(this.lifetime * 10) % 2) : 1;
        
        ctx.globalAlpha = alpha;
        
        // Радиус действия
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Сама мина
        ctx.fillStyle = '#556b2f';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Индикатор
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}

// ============================================
// MineSystem — управляет всеми минами
// ============================================
export class MineSystem {
    constructor() {
        this.mines = [];
    }

    place(x, y, radius, damage, lifetime = 1.5) {
        if (this.mines.length >= CONFIG.maxMines) {
            // Удаляем старую мину
            this.mines.shift();
        }
        this.mines.push(new Mine(x, y, radius, damage, lifetime));
    }

    update(dt, enemies, player) {
        for (let i = this.mines.length - 1; i >= 0; i--) {
            this.mines[i].update(dt, enemies, player);
            if (this.mines[i].markedForRemoval) {
                this.mines.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.mines.forEach(m => m.render(ctx));
    }

    clear() {
        this.mines = [];
    }
}

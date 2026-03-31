// ============================================
// ЧАСТИЦЫ И ЭФФЕКТЫ
// ============================================

import { CONFIG } from '../skills/skillsData.js';

// ============================================
// Класс Particle
// ============================================
export class Particle {
    constructor(x, y, type, color, r, vx = 0, vy = 0, angle = 0, len = 0) {
        this.x = x;
        this.y = y;
        this.type = type; // 'dot', 'ring', 'beam'
        this.color = color;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.life = 0.3 + Math.random() * 0.3;
        this.maxLife = this.life;
        this.angle = angle;
        this.len = len;
        this.markedForRemoval = false;
    }

    update(dt) {
        this.life -= dt;

        if (this.type === 'ring') {
            this.r += 300 * dt;
        } else if (this.type === 'beam') {
            // Луч исчезает быстрее
            this.life -= dt * 4;
        } else {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        if (this.life <= 0) {
            this.markedForRemoval = true;
        }
    }

    render(ctx) {
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;

        if (this.type === 'ring') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'beam') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + Math.cos(this.angle) * this.len, this.y + Math.sin(this.angle) * this.len);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }
}

// ============================================
// Класс FloatingText (всплывающий текст)
// ============================================
export class FloatingText {
    constructor(x, y, text, color, life = 0.5) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.markedForRemoval = false;
    }

    update(dt) {
        this.life -= dt;
        this.y -= 40 * dt; // Всплывает вверх

        if (this.life <= 0) {
            this.markedForRemoval = true;
        }
    }

    render(ctx) {
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.font = 'bold 16px Teko';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

// ============================================
// ParticleSystem — управляет всеми частицами
// ============================================
export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.texts = [];
    }

    spawn(x, y, type, color, r, vx = 0, vy = 0, angle = 0, len = 0) {
        if (this.particles.length >= CONFIG.maxParticles) return;
        this.particles.push(new Particle(x, y, type, color, r, vx, vy, angle, len));
    }

    spawnMany(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= CONFIG.maxParticles) break;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new Particle(x, y, 'dot', color, 3, vx, vy));
        }
    }

    addText(x, y, text, color, life = 0.5) {
        if (this.texts.length >= CONFIG.maxFloatingTexts) return;
        this.texts.push(new FloatingText(x, y, text, color, life));
    }

    update(dt) {
        // Обновление частиц
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].markedForRemoval) {
                this.particles.splice(i, 1);
            }
        }

        // Обновление текста
        for (let i = this.texts.length - 1; i >= 0; i--) {
            this.texts[i].update(dt);
            if (this.texts[i].markedForRemoval) {
                this.texts.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(p => p.render(ctx));
        this.texts.forEach(t => t.render(ctx));
    }

    clear() {
        this.particles = [];
        this.texts = [];
    }
}

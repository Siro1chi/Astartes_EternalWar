// ============================================
// СНАРЯДЫ И ТУРЕЛИ
// ============================================

import { WEAPONS_DATA } from '../weapons/weaponsData.js';
import { distSq } from '../core/utils.js';

// ============================================
// Класс Projectile
// ============================================
export class Projectile {
    constructor(type, x, y, angle, speed, dmg, level, extra = {}) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.r = extra.r || 4;
        this.dmg = dmg;
        this.level = level;
        this.color = WEAPONS_DATA[type]?.color || '#fff';
        this.pierce = extra.pierce || 0;
        this.lifespan = extra.lifespan || null;
        this.isBoomerang = extra.isBoomerang || false;
        this.bounces = extra.bounces || 0;
        this.explosive = extra.explosive || false;
        this.blastRadius = extra.blastRadius || 100;
        this.markedForRemoval = false;
    }

    update(dt, player, enemies) {
        // Движение
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Thunder hammer (бумеранг)
        if (this.type === 'thunder' && this.isBoomerang) {
            const distToPlayer = Math.hypot(this.x - player.x, this.y - player.y);
            if (distToPlayer > 250) {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                this.vx = Math.cos(angle) * 400;
                this.vy = Math.sin(angle) * 400;
            }
        }

        // Crozius (рикошет от стен)
        if (this.bounces > 0 && this.type === 'crozius') {
            if (this.x < 0 || this.x > window.gameManager?.width) this.vx *= -1;
            if (this.y < 0 || this.y > window.gameManager?.height) this.vy *= -1;
        }

        // Проверка выхода за границы
        if (this.x < -100 || this.x > window.gameManager.width + 100 ||
            this.y < -100 || this.y > window.gameManager.height + 100) {
            this.markedForRemoval = true;
        }

        // Проверка времени жизни
        if (this.lifespan !== null) {
            this.lifespan -= dt;
            if (this.lifespan <= 0) {
                this.markedForRemoval = true;
            }
        }

        // Столкновения с врагами
        for (const e of enemies) {
            if (distSq(this.x, this.y, e.x, e.y) < (this.r + e.r) ** 2) {
                this.onHit(e, player, enemies);
                break;
            }
        }
    }

    onHit(enemy, player, enemies) {
        enemy.takeDamage(this.dmg, player);

        // Взрыв
        if (this.explosive) {
            window.gameManager?.spawnParticles(this.x, this.y, '#ff4500', 20);
            for (const e2 of enemies) {
                if (e2 !== enemy && distSq(e2.x, e2.y, this.x, this.y) < this.blastRadius ** 2) {
                    e2.takeDamage(this.dmg * 0.5, player);
                }
            }
            this.markedForRemoval = true;
            return;
        }

        // Пробитие
        if (this.pierce > 0) {
            this.pierce--;
        } else {
            this.markedForRemoval = true;
        }
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// Класс Turret (турель)
// ============================================
export class Turret {
    constructor(x, y, life, level, cooldown, projSpeed, baseDmg) {
        this.x = x;
        this.y = y;
        this.life = life;
        this.level = level;
        this.timer = 0;
        this.cooldown = cooldown;
        this.projSpeed = projSpeed;
        this.baseDmg = baseDmg;
        this.markedForRemoval = false;
    }

    update(dt, player, enemies, projectiles) {
        this.life -= dt;
        if (this.life <= 0) {
            this.markedForRemoval = true;
            return;
        }

        this.timer -= dt;
        if (this.timer <= 0) {
            this.fire(player, enemies, projectiles);
            this.timer = this.cooldown;
        }
    }

    fire(player, enemies, projectiles) {
        if (enemies.length === 0) return;

        // Найти ближайшего врага
        let nearest = null;
        let minDist = Infinity;
        for (const e of enemies) {
            const d = distSq(this.x, this.y, e.x, e.y);
            if (d < minDist) {
                minDist = d;
                nearest = e;
            }
        }

        if (nearest) {
            const angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
            projectiles.push(new Projectile(
                'skulls',
                this.x, this.y,
                angle,
                this.projSpeed,
                this.baseDmg * player.dmgMult,
                this.level
            ));
        }
    }

    render(ctx) {
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('💀', this.x, this.y + 6);
    }
}

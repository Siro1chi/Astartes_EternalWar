// ============================================
// ИГРОК — ДРЕДНОУТ
// ============================================

import { distSq } from '../core/utils.js';

// ============================================
// Класс Player (Дредноут)
// ============================================
export class Player {
    constructor(x, y, classData) {
        // Позиция
        this.x = x;
        this.y = y;
        this.r = 18;
        this.color = classData.color || '#3366cc';
        this.ultType = classData.ultType || 'default';

        // Характеристики класса
        this.hp = classData.hp;
        this.maxHp = classData.hp;
        this.speed = classData.speed;
        this.baseDmgMult = classData.dmg;

        // Статы
        this.dmgMult = classData.dmg;
        this.magnetRadius = 60;
        this.regen = 0;
        this.armor = 0;
        this.luck = 0.05;
        this.projSpeed = 1;
        this.cdReduction = 0;
        this.areaMult = 1;
        
        // Пассивные способности
        this.lifesteal = 0;
        this.dodge = 0;
        this.executeThreshold = 0;
        this.deathBlast = 0;
        this.critDmg = 0.5;
        this.rageMode = 0;
        this.xpMult = 1;
        this.globalPierce = 0;
        this.magnetStrength = 0;
        this.bounces = 0;
        this.burnDmg = 0;
        this.thorns = 0;
        this.ultChargeRate = 1;

        // Состояние
        this.invTime = 0;
        
        // Эффекты ульт
        this.ultEffect = null;
        this.ultEffectTimer = 0;

        // Прогресс
        this.xp = 0;
        this.level = 1;
        this.xpNeeded = 10;

        this.markedForDeath = false;
    }

    takeDamage(amount) {
        // Уклонение
        if (Math.random() < this.dodge) {
            window.gameManager?.addFloatingText(this.x, this.y, "УКЛОНЕНИЕ!", '#00ff00', 0.5);
            return false;
        }

        // Броня
        const actualDmg = Math.max(1, amount - this.armor);
        this.hp -= actualDmg;
        this.invTime = 1.0;

        window.gameManager?.addFloatingText(this.x, this.y, `-${actualDmg}`, '#ff0000', 0.5);

        if (this.hp <= 0) {
            this.onDeath();
        }
        return true;
    }

    onDeath() {
        // Дредноут не умирает сразу — душа в Императоре
        this.markedForDeath = true;
    }

    addXP(amount) {
        this.xp += amount * this.xpMult;
        
        // Ульта копится только со временем (в GameManager.update)
        // window.gameManager?.addUltCharge(amount * 0.5); // УБРАНО

        if (this.xp >= this.xpNeeded) {
            this.xp -= this.xpNeeded;
            this.level++;
            this.xpNeeded = Math.floor(this.xpNeeded * 1.3);
            window.gameManager?.onLevelUp();
        }
    }

    update(dt, input) {
        // Движение
        const { dx, dy } = input.getMovementDirection();
        
        if (dx !== 0 || dy !== 0) {
            this.x += dx * this.speed * dt;
            this.y += dy * this.speed * dt;
        }

        // Ограничение границами
        const width = window.gameManager?.width || 800;
        const height = window.gameManager?.height || 600;
        this.x = Math.max(this.r, Math.min(width - this.r, this.x));
        this.y = Math.max(this.r, Math.min(height - this.r, this.y));

        // Таймеры
        if (this.invTime > 0) this.invTime -= dt;
        if (this.regen > 0) {
            this.hp = Math.min(this.maxHp, this.hp + this.regen * dt);
        }
    }

    render(ctx, frameCount) {
        // Мерцание при неуязвимости
        const flash = this.invTime > 0 && Math.floor(this.invTime * 10) % 2;

        // Корпус дредноута
        ctx.fillStyle = flash ? '#fff' : this.color;
        
        // Основная форма — саркофаг
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.r + 4, this.r, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Детали — сервоприводы
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x - 22, this.y - 12, 8, 24);
        ctx.fillRect(this.x + 14, this.y - 12, 8, 24);
        
        // "Глаза" — сенсоры
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(this.x - 8, this.y - 4, 6, 4);
        ctx.fillRect(this.x + 2, this.y - 4, 6, 4);
        
        // Оружие на манипуляторах
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x - 25, this.y - 8, 10, 16);
        ctx.fillRect(this.x + 15, this.y - 8, 10, 16);
    }

    getHealthPercent() {
        return Math.max(0, this.hp / this.maxHp);
    }

    getXPPercent() {
        return this.xp / this.xpNeeded;
    }
}

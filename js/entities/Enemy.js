// ============================================
// ВРАГИ
// ============================================

import { ENEMY_TYPES } from '../skills/skillsData.js';
import { distSq, randomChoice } from '../core/utils.js';

// ============================================
// Базовый класс Enemy
// ============================================
export class Enemy {
    constructor(typeData, x, y, difficulty) {
        this.type = typeData.type;
        this.id = typeData.id || '';
        this.color = typeData.color;
        this.r = typeData.r;
        this.baseDmg = typeData.dmg;
        this.baseSpd = typeData.spd;
        this.baseXp = typeData.xp;
        this.swears = typeData.swears || [];

        this.x = x;
        this.y = y;

        // Скалирование от сложности (+2% HP за каждыe 10 сек)
        this.maxHp = typeData.hp * (1 + difficulty * 0.02);
        this.hp = this.maxHp;
        this.spd = typeData.spd;
        this.xpValue = typeData.xp;

        // Флаги
        this.isVeteran = false;
        this.isTank = typeData.isTank || false;
        this.canShoot = typeData.canShoot || false;
        this.shootCd = typeData.shootCd || 0;
        this.shootDmg = typeData.shootDmg || 0;
        this.shootTimer = this.shootCd;
        this.armor = this.isTank ? 5 : 0; // Нурглиты имеют броню

        this.burnTimer = 0;
        this.swear = null;
        this.swearTimer = 0;

        this.markedForRemoval = false;
        this.lastHitTime = 0;

        // Шанс сказать фразу
        if (Math.random() < 0.3 && this.swears.length > 0) {
            this.swear = randomChoice(this.swears);
            this.swearTimer = 2.0;
        }
    }

    makeVeteran() {
        this.isVeteran = true;
        this.hp *= 2.5;
        this.maxHp *= 2.5;
        this.color = '#ffd700';
        this.spd *= 0.8;
        this.xpValue *= 5;
    }

    takeDamage(amount, player, isCrit = false) {
        // Модификатор ярости игрока
        if (player.hp / player.maxHp < 0.3 && player.rageMode > 0) {
            amount *= (1 + player.rageMode);
        }

        // Критический удар
        if (!isCrit && Math.random() < player.luck) {
            amount *= (1.5 + player.critDmg);
            isCrit = true;
        }

        // Казнь
        if (this.hp / this.maxHp < player.executeThreshold) {
            amount = this.hp;
            window.gameManager?.addFloatingText(this.x, this.y, "КАЗНЕН", '#ff00ff', 0.8);
        }

        this.hp -= amount;

        // Вампиризм
        if (player.lifesteal > 0) {
            const heal = amount * player.lifesteal;
            player.hp = Math.min(player.maxHp, player.hp + heal);
            if (heal > 1) {
                window.gameManager?.addFloatingText(player.x, player.y, `+${Math.floor(heal)}`, '#00ff00', 0.4);
            }
        }

        // Поджигание
        if (player.burnDmg > 0) {
            this.burnTimer = 2.0;
        }

        // Визуализация урона
        if (isCrit) {
            window.gameManager?.addFloatingText(
                this.x + Math.random() * 20,
                this.y - Math.random() * 20,
                Math.floor(amount) + "!",
                '#ffd700',
                0.6
            );
        } else {
            window.gameManager?.addFloatingText(this.x, this.y, Math.floor(amount), '#fff', 0.3);
        }

        // Смерть
        if (this.hp <= 0) {
            this.onDeath(player);
        }
    }

    onDeath(player) {
        this.markedForRemoval = true;
        window.gameManager?.onEnemyDeath(this, player);
    }

    update(dt, player) {
        // Замороженные враги не двигаются
        if (this.frozen) return;
        
        // Урон от горения
        if (this.burnTimer > 0) {
            this.burnTimer -= dt;
            this.hp -= player.burnDmg * dt;
            if (this.hp <= 0) {
                this.onDeath(player);
                return;
            }
        }

        // Движение к игроку
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d > 0) {
            // Магнит притягивает врагов
            let magnetPull = 0;
            if (d < player.magnetStrength) {
                magnetPull = 30;
            }

            // Тзинчит движется по синусоиде и держит дистанцию
            let moveX = dx;
            let moveY = dy;
            if (this.id === 'tzeentch') {
                const frame = window.gameManager?.frameCount || 0;
                moveX = Math.sin(frame * 0.1 + this.x) * 100;
                moveY = Math.cos(frame * 0.1 + this.y) * 100;
                
                // Держим дистанцию для стрельбы
                const desiredDist = 200;
                if (d > desiredDist) {
                    moveX = dx;
                    moveY = dy;
                } else if (d < desiredDist * 0.5) {
                    moveX = -dx;
                    moveY = -dy;
                }
            }

            this.x += (moveX / d) * (this.spd + magnetPull) * dt;
            this.y += (moveY / d) * (this.spd + magnetPull) * dt;
        }

        // Стрельба тзинчита
        if (this.canShoot) {
            this.shootTimer -= dt;
            if (this.shootTimer <= 0 && d < 400) {
                this.shoot(player);
                this.shootTimer = this.shootCd;
            }
        }

        // Таймер фразы
        if (this.swearTimer > 0) {
            this.swearTimer -= dt;
            if (this.swearTimer <= 0) {
                this.swear = null;
            }
        }
    }

    shoot(player) {
        // Снаряд тзинчита
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const speed = 200;
        window.gameManager?.addEnemyProjectile({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 6,
            dmg: this.shootDmg * (1 + window.gameManager?.difficulty * 0.02) || 10,
            color: '#00aaff',
            type: 'enemy'
        });
    }

    checkCollision(player) {
        if (player.invTime > 0) return;

        if (distSq(player.x, player.y, this.x, this.y) < (player.r + this.r) ** 2) {
            // Уклонение
            if (Math.random() < player.dodge) {
                window.gameManager?.addFloatingText(player.x, player.y, "УКЛОНЕНИЕ", '#00ff00', 0.5);
                return;
            }

            // Урон с учётом брони
            const dmg = Math.max(1, this.baseDmg - player.armor);
            player.takeDamage(dmg);
            
            window.gameManager?.spawnParticles(player.x, player.y, '#ff0000', 5);
            window.gameManager?.addFloatingText(player.x, player.y, `-${dmg}`, '#ff0000', 0.5);

            // Шипы
            if (player.thorns > 0) {
                this.takeDamage(player.thorns, player);
            }
        }
    }

    render(ctx) {
        // Тело
        ctx.fillStyle = this.frozen ? '#6699cc' : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();

        // Ветеран — аура
        if (this.isVeteran) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Замороженный — ледяная аура
        if (this.frozen) {
            ctx.strokeStyle = '#6699cc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r + 3, 0, Math.PI * 2);
            ctx.stroke();
            
            // Ледяные частицы
            ctx.fillStyle = '#aaccff';
            for (let i = 0; i < 3; i++) {
                const angle = (Date.now() * 0.005 + i * 2) % (Math.PI * 2);
                const px = this.x + Math.cos(angle) * (this.r + 5);
                const py = this.y + Math.sin(angle) * (this.r + 5);
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Босс — большая аура и полоска HP
        if (this.isTank || this.type.includes('Великий') || this.type.includes('Лорд') || this.type.includes('Вестник')) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Полоска здоровья
        const healthPercent = this.hp / this.maxHp;
        if (healthPercent < 1) {
            const w = this.r * 2;
            const barY = this.isTank ? this.y - this.r - 15 : this.y - this.r - 8;
            const barH = this.isTank ? 8 : 4;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - w / 2, barY, w, barH);
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.x - w / 2, barY, w * healthPercent, barH);
            
            // Для боссов — текст HP
            if (this.isTank && this.maxHp > 500) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Teko';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.floor(this.hp)}/${this.maxHp}`, this.x, barY - 4);
            }
        }

        // Фраза
        if (this.swearTimer > 0 && this.swear) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            const textWidth = ctx.measureText(this.swear).width + 10;
            ctx.fillRect(this.x - textWidth / 2, this.y - this.r - 25, textWidth, 16);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Teko';
            ctx.fillText(this.swear, this.x, this.y - this.r - 12);
        }
    }
}

// ============================================
// Фабрика врагов
// ============================================
export class EnemyFactory {
    constructor() {
        this.pool = [];
    }

    getAvailableTypes(difficulty) {
        return ENEMY_TYPES.filter(t => {
            if (t.type === 'Кровопускатель') return difficulty > 4;
            return difficulty >= t.minDifficulty;
        });
    }

    spawn(difficulty, width, height) {
        const available = this.getAvailableTypes(difficulty);
        if (available.length === 0) return null;

        const typeData = randomChoice(available);
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: x = -30; y = Math.random() * height; break;
            case 1: x = width + 30; y = Math.random() * height; break;
            case 2: x = Math.random() * width; y = -30; break;
            case 3: x = Math.random() * width; y = height + 30; break;
        }

        const enemy = new Enemy(typeData, x, y, difficulty);

        // Шанс на ветерана
        if (Math.random() < 0.1 * difficulty) {
            enemy.makeVeteran();
        }

        return enemy;
    }
}

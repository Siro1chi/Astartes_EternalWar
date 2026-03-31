// ============================================
// GAME MANAGER — Управление игрой
// ============================================

import { CONFIG, ENEMY_TYPES, BOSSES } from '../skills/skillsData.js';
import { Player } from '../entities/Player.js';
import { Enemy, EnemyFactory } from '../entities/Enemy.js';
import { WeaponSystem } from '../weapons/WeaponSystem.js';
import { SkillSystem } from '../skills/SkillSystem.js';
import { ParticleSystem } from '../entities/Particle.js';
import { MineSystem } from '../entities/Mine.js';
import { InputHandler } from './InputHandler.js';
import { formatTime, distSq } from './utils.js';
import { CLASSES } from '../weapons/weaponsData.js';
import { Pool, createProjectilePool, createParticlePool, createEnemyPool } from './Pool.js';

// ============================================
// Класс GameManager
// ============================================
export class GameManager {
    constructor(canvas, bgCanvas) {
        this.canvas = canvas;
        this.bgCanvas = bgCanvas;
        this.ctx = canvas.getContext('2d');
        this.bgCtx = bgCanvas.getContext('2d');
        
        this.width = 800;
        this.height = 600;
        
        this.state = 'menu';
        
        this.input = new InputHandler();
        this.weaponSystem = new WeaponSystem();
        this.skillSystem = new SkillSystem();
        this.particleSystem = new ParticleSystem();
        this.mineSystem = new MineSystem();
        this.enemyFactory = new EnemyFactory();
        
        // Пулы объектов
        this.projectilePool = createProjectilePool();
        this.particlePool = createParticlePool();
        this.enemyPool = createEnemyPool();
        
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.turrets = [];
        this.enemyProjectiles = []; // Снаряды врагов
        
        this.gameTime = 0;
        this.kills = 0;
        this.difficulty = 1;
        this.spawnTimer = 0;
        this.frameCount = 0;
        this.ultCharge = 0;
        
        this.ultTimers = [];
        this.bossSpawned = false;
        this.lastBossTime = 0;
        
        this.resize();
        this.drawBackground();
    }

    resize() {
        const container = document.getElementById('game-container');
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        
        this.drawBackground();
    }

    drawBackground() {
        this.bgCtx.fillStyle = '#050505';
        this.bgCtx.fillRect(0, 0, this.width, this.height);
        
        this.bgCtx.strokeStyle = 'rgba(60, 60, 60, 0.2)';
        this.bgCtx.lineWidth = 2;
        const gridSize = 100;
        
        for (let x = 0; x < this.width; x += gridSize) {
            this.bgCtx.beginPath();
            this.bgCtx.moveTo(x, 0);
            this.bgCtx.lineTo(x, this.height);
            this.bgCtx.stroke();
        }
        
        for (let y = 0; y < this.height; y += gridSize) {
            this.bgCtx.beginPath();
            this.bgCtx.moveTo(0, y);
            this.bgCtx.lineTo(this.width, y);
            this.bgCtx.stroke();
        }
    }

    startGame(classType) {
        const classData = CLASSES[classType];
        if (!classData) {
            console.error(`Class ${classType} not found`);
            return;
        }

        this.state = 'play';
        this.hideAllScreens();
        
        this.player = new Player(this.width / 2, this.height / 2, classData);
        
        this.weaponSystem = new WeaponSystem();
        this.weaponSystem.addWeapon(classData.weapon, 1);
        
        this.skillSystem = new SkillSystem();
        this.particleSystem.clear();
        this.mineSystem.clear();
        this.enemies = [];
        this.projectiles = [];
        this.turrets = [];
        
        this.gameTime = 0;
        this.kills = 0;
        this.difficulty = 1;
        this.spawnTimer = 0;
        this.frameCount = 0;
        this.ultCharge = 0;
        this.ultTimers.forEach(t => clearTimeout(t));
        this.ultTimers = [];
        this.bossSpawned = false;
        this.lastBossTime = 0;
        
        this.updateUI();
    }

    hideAllScreens() {
        document.querySelectorAll('.screen-overlay').forEach(s => {
            s.classList.remove('active');
        });
    }

    showScreen(id) {
        document.getElementById(id)?.classList.add('active');
    }

    hideScreen(id) {
        document.getElementById(id)?.classList.remove('active');
    }

    // ==================== UPDATE ====================

    update(dt) {
        if (this.state !== 'play') return;
        
        this.frameCount++;
        this.gameTime += dt;
        
        // Спавн босса каждые 5 минут
        const bossInterval = 300; // 5 минут в секундах
        if (this.gameTime > this.lastBossTime + bossInterval && !this.bossSpawned) {
            this.spawnBoss();
            this.bossSpawned = true;
            this.lastBossTime = this.gameTime;
        }
        
        this.difficulty = 1 + Math.floor(this.gameTime / 10);
        
        // Ульта копится со временем (скорость зависит от класса)
        const chargeRate = this.player.ultChargeRate || 1.0;
        this.ultCharge += dt * chargeRate;
        if (this.ultCharge > 100) this.ultCharge = 100;
        
        const spawnRate = Math.max(0.2, CONFIG.baseSpawnRate - this.difficulty * 0.08);
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnEnemy();
            this.spawnTimer = spawnRate;
        }
        
        if (this.player) {
            this.player.update(dt, this.input);
        }

        this.weaponSystem.update(dt, this.player, this.projectiles, this.turrets, this.mineSystem);
        this.weaponSystem.applyZoneDamage(dt, this.player, this.enemies);
        this.weaponSystem.applyOrbitDamage(this.frameCount, this.player, this.enemies);
        this.mineSystem.update(dt, this.enemies, this.player);
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(dt, this.player);
            e.checkCollision(this.player);
            if (e.markedForRemoval) {
                this.enemies.splice(i, 1);
            }
        }
        
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (p.type === 'gem') {
                const collected = p.update(dt, this.player);
                if (collected) {
                    this.projectiles.splice(i, 1);
                }
            } else {
                p.update(dt, this.player, this.enemies);
                if (p.markedForRemoval) {
                    this.projectiles.splice(i, 1);
                }
            }
        }
        
        for (let i = this.turrets.length - 1; i >= 0; i--) {
            const t = this.turrets[i];
            t.update(dt, this.player, this.enemies, this.projectiles);
            if (t.markedForRemoval) {
                this.turrets.splice(i, 1);
            }
        }

        // Снаряды врагов
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const p = this.enemyProjectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Границы
            if (p.x < -50 || p.x > this.width + 50 || p.y < -50 || p.y > this.height + 50) {
                p.markedForRemoval = true;
            }

            // Попадание в игрока
            if (this.player && !this.player.markedForDeath) {
                const dx = p.x - this.player.x;
                const dy = p.y - this.player.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < (p.r + this.player.r) ** 2) {
                    this.player.takeDamage(p.dmg);
                    p.markedForRemoval = true;
                    this.spawnParticles(p.x, p.y, '#ff0000', 5);
                }
            }

            if (p.markedForRemoval) {
                this.enemyProjectiles.splice(i, 1);
            }
        }

        this.particleSystem.update(dt);
        
        if (this.player?.markedForDeath) {
            this.gameOver();
        }
        
        if (this.player?.regen > 0) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.regen * dt);
        }

        // Обновление эффектов ульты
        if (this.player?.ultEffectTimer > 0) {
            this.player.ultEffectTimer -= dt;
            
            // Стена (Имперский кулак)
            if (this.player.ultEffect === 'wall') {
                // Враги не проходят через стену
                this.enemies.forEach(e => {
                    const d = distSq(this.player.x, this.player.y, e.x, e.y);
                    if (d < 22500) { // 150^2
                        const angle = Math.atan2(e.y - this.player.y, e.x - this.player.x);
                        e.x += Math.cos(angle) * 50 * dt;
                        e.y += Math.sin(angle) * 50 * dt;
                    }
                });
            }
            
            if (this.player.ultEffectTimer <= 0) {
                this.endUltEffect(this.player);
            }
        }

        this.updateUI();
    }

    endUltEffect(player) {
        const effect = player.ultEffect;
        player.ultEffect = null;
        
        // Сброс эффектов
        if (effect === 'haste') {
            player.speed /= 1.8;
            player.dmgMult /= 1.5;
        } else if (effect === 'taunt') {
            player.dmgMult /= 2;
        } else if (effect === 'frenzy') {
            player.attackSpeedMult = 1;
        } else if (effect === 'heal') {
            player.regen -= 15;
        } else if (effect === 'stealth') {
            player.invTime = 0;
        }
        
        this.addFloatingText(player.x, player.y, "ЭФФЕКТ УЛЬТЫ ЗАВЕРШЁН", '#888', 1.0);
    }

    spawnEnemy() {
        if (this.enemies.length >= CONFIG.maxEnemies) return;
        
        const enemy = this.enemyFactory.spawn(this.difficulty, this.width, this.height);
        if (enemy) {
            this.enemies.push(enemy);
        }
    }

    spawnBoss() {
        // Выбираем случайного босса
        const bossData = BOSSES[Math.floor(Math.random() * BOSSES.length)];
        
        // Спавн с края экрана
        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { x = -60; y = Math.random() * this.height; }
        else if (side === 1) { x = this.width + 60; y = Math.random() * this.height; }
        else if (side === 2) { x = Math.random() * this.width; y = -60; }
        else { x = Math.random() * this.width; y = this.height + 60; }

        const boss = new Enemy(bossData, x, y, this.difficulty);
        this.enemies.push(boss);
        
        // Уведомление
        this.addFloatingText(this.width / 2, this.height / 2, `БОСС: ${bossData.type}`, '#ff0000', 3.0);
        this.addKillFeed(`⚠ ${bossData.type} приближается!`);
    }

    // ==================== COMBAT ====================

    onEnemyDeath(enemy, player) {
        this.kills++;
        this.addKillFeed(enemy.type);
        this.spawnParticles(enemy.x, enemy.y, enemy.isVeteran ? '#ffd700' : enemy.color, 8);
        
        if (player.deathBlast > 0) {
            this.spawnParticle(enemy.x, enemy.y, 'ring', '#ff4500', 20);
            for (const e2 of this.enemies) {
                if (e2 !== enemy && distSq(enemy.x, enemy.y, e2.x, e2.y) < 15000) {
                    e2.takeDamage(player.deathBlast, player);
                }
            }
        }
        
        const xpVal = Math.ceil(enemy.xpValue * player.xpMult * (1 + player.luck));
        for (let k = 0; k < xpVal; k++) {
            this.projectiles.push({
                type: 'gem',
                x: enemy.x + (Math.random() - 0.5) * 20,
                y: enemy.y + (Math.random() - 0.5) * 20,
                r: 4,
                value: 1,
                update: function(dt, player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dSq = dx * dx + dy * dy;
                    if (dSq < player.magnetRadius ** 2) {
                        const d = Math.sqrt(dSq);
                        if (d > 0) {
                            this.x += (dx / d) * 600 * dt;
                            this.y += (dy / d) * 600 * dt;
                        }
                    }
                    if (dSq < (player.r + this.r) ** 2) {
                        player.addXP(this.value);
                        return true;
                    }
                    return false;
                },
                render: function(ctx) {
                    ctx.fillStyle = '#d4af37';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }

    // ==================== ULT ====================

    triggerUlt() {
        if (this.ultCharge < 100 || !this.player) return;

        this.ultCharge = 0;
        const player = this.player;
        const ultType = player.ultType;

        switch (ultType) {
            case 'xp': // Ультрамарин - опыт
                this.ultXP(player);
                break;
            case 'frenzy': // Кровавый ангел - ярость
                this.ultFrenzy(player);
                break;
            case 'wall': // Имперский кулак - стена
                this.ultWall(player);
                break;
            case 'sacrifice': // Серый рыцарь - жертва
                this.ultSacrifice(player);
                break;
            case 'push': // Тёмный ангел - толчок
                this.ultPush(player);
                break;
            case 'haste': // Белый шрам - ускорение
                this.ultHaste(player);
                break;
            case 'taunt': // Космический волк - насмешка
                this.ultTaunt(player);
                break;
            case 'heal': // Саламандр - лечение
                this.ultHeal(player);
                break;
            case 'stealth': // Гвардеец ворона - невидимость
                this.ultStealth(player);
                break;
            case 'freeze': // Железные Руки - заморозка
                this.ultFreeze(player);
                break;
            default: // Стандартная ульта
                this.ultDefault();
        }
    }

    ultXP(player) {
        // Даёт опыт до следующего уровня
        const xpNeeded = player.xpNeeded - player.xp;
        const xpGain = Math.floor(xpNeeded * 0.8); // 80% до уровня
        
        player.xp += xpGain;
        this.addFloatingText(player.x, player.y, `+${xpGain} ОПЫТА`, '#00ff00', 2.0);
        this.spawnParticle(player.x, player.y, 'ring', '#00ff00', 80);
        
        // Визуальный эффект
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const angle = (i / 20) * Math.PI * 2;
                const x = player.x + Math.cos(angle) * 60;
                const y = player.y + Math.sin(angle) * 60;
                this.spawnParticle(x, y, 'dot', '#00ff00', 5);
            }, i * 50);
        }
    }

    ultFrenzy(player) {
        // +50% скорости атаки на 10 сек
        player.ultEffect = 'frenzy';
        player.ultEffectTimer = 10;
        player.attackSpeedMult = 1.5;
        
        this.addFloatingText(player.x, player.y, "ЯРОСТЬ!", '#ff0000', 2.0);
        this.spawnParticle(player.x, player.y, 'ring', '#ff0000', 60);
        
        // Красная аура
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const x = player.x + Math.cos(angle) * 50;
                const y = player.y + Math.sin(angle) * 50;
                this.spawnParticle(x, y, 'dot', '#ff0000', 4);
            }, i * 30);
        }
    }

    ultWall(player) {
        // Стена на 5 сек
        player.ultEffect = 'wall';
        player.ultEffectTimer = 5;
        
        this.addFloatingText(player.x, player.y, "СТЕНА!", '#ffd700', 2.0);
        
        // Визуализация стены
        const wallRadius = 150;
        this.spawnParticle(player.x, player.y, 'ring', '#ffd700', wallRadius);
        
        // Отталкивание врагов
        this.enemies.forEach(e => {
            const d = distSq(player.x, player.y, e.x, e.y);
            if (d < (wallRadius + e.r) ** 2) {
                const angle = Math.atan2(e.y - player.y, e.x - player.x);
                e.x += Math.cos(angle) * 100;
                e.y += Math.sin(angle) * 100;
            }
        });
    }

    ultSacrifice(player) {
        // Урон 50% HP всем врагам, тратит своё HP
        const damagePercent = 0.5;
        const hpCost = Math.floor(player.maxHp * 0.3); // 30% HP
        
        player.hp = Math.max(1, player.hp - hpCost);
        
        let hitCount = 0;
        this.enemies.forEach(e => {
            const dmg = e.maxHp * damagePercent;
            e.takeDamage(dmg, player);
            hitCount++;
        });
        
        this.addFloatingText(player.x, player.y, `-${hpCost} HP`, '#ff0000', 1.0);
        this.addFloatingText(player.x, player.y - 30, `УБИТО: ${hitCount}`, '#800080', 1.5);
        
        // Фиолетовый взрыв
        this.spawnParticle(player.x, player.y, 'ring', '#800080', 200);
        this.spawnParticles(player.x, player.y, '#800080', 30);
    }

    ultPush(player) {
        // Отталкивание всех врагов
        this.addFloatingText(player.x, player.y, "РЫК ЛЬВА!", '#fff', 1.5);
        
        const pushRadius = 400;
        this.spawnParticle(player.x, player.y, 'ring', '#1e4e2e', pushRadius);
        
        this.enemies.forEach(e => {
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < pushRadius) {
                const force = (pushRadius - d) / pushRadius * 200;
                e.x += (dx / d) * force;
                e.y += (dy / d) * force;
                e.takeDamage(20, player);
            }
        });
        
        this.spawnParticles(player.x, player.y, '#1e4e2e', 20);
    }

    ultHaste(player) {
        // Ускорение + атака на 8 сек
        player.ultEffect = 'haste';
        player.ultEffectTimer = 8;
        player.speed *= 1.8;
        player.dmgMult *= 1.5;
        
        this.addFloatingText(player.x, player.y, "СКОРОСТЬ!", '#00ffff', 2.0);
        this.spawnParticle(player.x, player.y, 'ring', '#00ffff', 70);
        
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const x = player.x + Math.cos(angle) * 60;
                const y = player.y + Math.sin(angle) * 60;
                this.spawnParticle(x, y, 'dot', '#00ffff', 4);
            }, i * 25);
        }
    }

    ultTaunt(player) {
        // Враги притягиваются + урон x2 на 6 сек
        player.ultEffect = 'taunt';
        player.ultEffectTimer = 6;
        player.dmgMult *= 2;
        
        this.addFloatingText(player.x, player.y, "ФЕНРИС!", '#aaa', 2.0);
        
        // Притягивание
        this.enemies.forEach(e => {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * 150;
            e.y += Math.sin(angle) * 150;
        });
        
        this.spawnParticle(player.x, player.y, 'ring', '#4a4a5e', 100);
        this.spawnParticles(player.x, player.y, '#4a4a5e', 25);
    }

    ultHeal(player) {
        // Зона лечения на 15 сек
        player.ultEffect = 'heal';
        player.ultEffectTimer = 15;
        player.regen += 15;
        
        this.addFloatingText(player.x, player.y, "МИЛОСЕРДИЕ", '#00ff00', 2.0);
        this.spawnParticle(player.x, player.y, 'ring', '#00ff00', 120);
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const angle = (i / 20) * Math.PI * 2;
                const x = player.x + Math.cos(angle) * 100;
                const y = player.y + Math.sin(angle) * 100;
                this.spawnParticle(x, y, 'dot', '#00ff00', 6);
            }, i * 100);
        }
    }

    ultStealth(player) {
        // Невидимость 5 сек
        player.ultEffect = 'stealth';
        player.ultEffectTimer = 5;
        player.invTime = 5; // Неуязвимость
        
        this.addFloatingText(player.x, player.y, "ПРИЗРАК", '#888', 2.0);
        
        // Исчезновение
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const x = player.x + Math.cos(angle) * 40;
                const y = player.y + Math.sin(angle) * 40;
                this.spawnParticle(x, y, 'dot', '#666', 5);
            }, i * 50);
        }
    }

    ultFreeze(player) {
        // Волна, замораживающая врагов навсегда
        const freezeRadius = 250;
        
        this.addFloatingText(player.x, player.y, "СТАЛЬНАЯ ПЛОТЬ!", '#aaa', 2.0);
        
        // Визуализация волны
        this.spawnParticle(player.x, player.y, 'ring', '#6699cc', freezeRadius);
        
        let frozenCount = 0;
        this.enemies.forEach(e => {
            const d = distSq(player.x, player.y, e.x, e.y);
            if (d < freezeRadius * freezeRadius) {
                // Замораживаем врага навсегда
                e.frozen = true;
                e.spd = 0;
                e.color = '#6699cc'; // Стальной цвет
                frozenCount++;
                
                // Визуальный эффект
                this.spawnParticle(e.x, e.y, 'ring', '#6699cc', e.r * 2);
            }
        });
        
        this.addFloatingText(player.x, player.y - 30, `ЗАМОРОЖЕНО: ${frozenCount}`, '#6699cc', 1.5);
        this.spawnParticles(player.x, player.y, '#6699cc', 20);
    }

    ultDefault() {
        // Стандартная ульта - урон по области
        for (let i = 0; i < 15; i++) {
            const timer = setTimeout(() => {
                if (this.state !== 'play') return;

                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                this.spawnParticle(x, y, 'ring', '#ff0000', 50);

                for (const e of this.enemies) {
                    if (distSq(e.x, e.y, x, y) < 20000) {
                        e.takeDamage(500, this.player);
                    }
                }
                this.spawnParticles(x, y, '#ff0000', 20);
            }, i * 80);
            
            this.ultTimers.push(timer);
        }
    }

    addUltCharge(amount) {
        this.ultCharge = Math.min(100, this.ultCharge + amount);
    }

    // ==================== ENEMY PROJECTILES ====================

    addEnemyProjectile(proj) {
        this.enemyProjectiles.push({
            x: proj.x,
            y: proj.y,
            vx: proj.vx,
            vy: proj.vy,
            r: proj.r || 6,
            dmg: proj.dmg || 10,
            color: proj.color || '#f00',
            type: 'enemy',
            markedForRemoval: false
        });
    }

    // ==================== LEVEL UP ====================

    onLevelUp() {
        this.state = 'upgrade';
        this.showScreen('upgrade-screen');
        
        const opts = document.getElementById('upgrade-options');
        opts.innerHTML = '';
        
        const options = [];
        
        if (this.player.level % 5 === 0) {
            const weaponOptions = this.weaponSystem.getNewWeaponOptions();
            options.push(...weaponOptions);
        } else {
            const weaponUpgrades = this.weaponSystem.getUpgradeOptions();
            options.push(...weaponUpgrades);
            
            const skillOptions = this.skillSystem.getRandomOptions();
            options.push(...skillOptions);
        }
        
        options.sort(() => Math.random() - 0.5);
        const choices = options.slice(0, 3);
        
        choices.forEach(o => {
            const btn = document.createElement('div');
            btn.className = 'upgrade-card';
            btn.innerHTML = `
                <span class="upgrade-icon">${o.icon}</span>
                <div class="upgrade-name">${o.name}</div>
                <div class="upgrade-desc">${o.desc}</div>
            `;
            btn.onclick = () => {
                o.action();
                this.hideScreen('upgrade-screen');
                this.state = 'play';
            };
            opts.appendChild(btn);
        });
    }

    // ==================== GAME OVER ====================

    gameOver() {
        this.state = 'dead';
        this.showScreen('game-over-screen');
        
        document.getElementById('final-time').textContent = formatTime(this.gameTime);
        document.getElementById('final-kills').textContent = this.kills;
    }

    // ==================== PARTICLES ====================

    spawnParticle(x, y, type, color, r, angle = 0, len = 0) {
        this.particleSystem.spawn(x, y, type, color, r, 0, 0, angle, len);
    }

    spawnParticles(x, y, color, count) {
        this.particleSystem.spawnMany(x, y, color, count);
    }

    addFloatingText(x, y, text, color, life = 0.5) {
        this.particleSystem.addText(x, y, text, color, life);
    }

    // ==================== UI ====================

    updateUI() {
        if (!this.player) return;

        document.getElementById('time-display').textContent = formatTime(this.gameTime);
        document.getElementById('kill-display').textContent = this.kills;

        const hpP = this.player.getHealthPercent() * 100;
        document.getElementById('health-fill').style.width = `${hpP}%`;

        const xpP = this.player.getXPPercent() * 100;
        document.getElementById('xp-fill').style.width = `${xpP}%`;
        document.getElementById('level-display').textContent = `Ранг ${this.player.level}`;

        document.getElementById('ult-fill').style.width = `${this.ultCharge}%`;
        
        // Визуальный индикатор готовой ульты
        const ultBtn = document.getElementById('ult-button');
        if (ultBtn) {
            if (this.ultCharge >= 100) {
                ultBtn.classList.add('ready');
                ultBtn.innerText = '⚡';
            } else {
                ultBtn.classList.remove('ready');
                ultBtn.innerText = '';
            }
        }
    }

    addKillFeed(enemyType) {
        const feed = document.getElementById('kill-feed');
        
        while (feed.children.length > 10) {
            feed.removeChild(feed.firstChild);
        }
        
        const div = document.createElement('div');
        div.className = 'kill-msg';
        div.innerText = `${enemyType} уничтожен!`;
        feed.appendChild(div);
        
        setTimeout(() => div.remove(), 3000);
    }

    // ==================== RENDER ====================

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (!this.player) return;
        
        this.weaponSystem.renderZones(this.ctx, this.player);
        this.mineSystem.render(this.ctx);
        
        this.projectiles.forEach(p => {
            if (p.type === 'gem') p.render(this.ctx);
        });
        
        this.enemies.forEach(e => e.render(this.ctx));
        
        this.projectiles.forEach(p => {
            if (p.type !== 'gem') p.render(this.ctx);
        });
        
        this.turrets.forEach(t => t.render(this.ctx));

        // Эффекты ульты
        if (this.player.ultEffect === 'wall') {
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, 150, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        if (this.player.ultEffect === 'heal') {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, 120, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        if (this.player.ultEffect === 'stealth') {
            this.ctx.globalAlpha = 0.3;
        }

        // Снаряды врагов
        this.enemyProjectiles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.player.render(this.ctx, this.frameCount);

        this.weaponSystem.renderOrbits(this.ctx, this.player, this.frameCount);

        this.particleSystem.render(this.ctx);
        
        // Сброс прозрачности
        this.ctx.globalAlpha = 1;
    }

    // ==================== GAME LOOP ====================

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;
        
        this.update(dt);
        this.render();
        
        requestAnimationFrame(t => this.loop(t));
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        
        // Pause by ESC
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.state === 'play') {
                this.togglePause();
            } else if (e.code === 'Escape' && this.state === 'paused') {
                this.togglePause();
            }
        });
        
        document.getElementById('restart-btn').onclick = () => {
            this.hideScreen('game-over-screen');
            this.showScreen('start-screen');
            this.state = 'menu';
        };

        document.getElementById('resume-btn')?.addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('quit-btn')?.addEventListener('click', () => {
            this.hideScreen('pause-screen');
            this.showScreen('start-screen');
            this.state = 'menu';
        });
        
        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', () => {
                const classType = card.getAttribute('data-class');
                console.log('Selected class:', classType);
                console.log('Available classes:', Object.keys(CLASSES));
                this.startGame(classType);
            });
        });
        
        this.lastTime = performance.now();
        this.loop(performance.now());
    }

    togglePause() {
        if (this.state === 'play') {
            this.state = 'paused';
            this.showScreen('pause-screen');
        } else if (this.state === 'paused') {
            this.state = 'play';
            this.hideScreen('pause-screen');
            this.lastTime = performance.now(); // Reset timer to prevent jump
        }
    }
}

// ============================================
// СИСТЕМА ОРУЖИЯ — 7 уровней
// ============================================

import { WEAPONS_DATA } from './weaponsData.js';
import { Projectile } from '../entities/Projectile.js';
import { Turret } from '../entities/Projectile.js';
import { MineSystem } from '../entities/Mine.js';
import { distSq, findNearestEnemy } from '../core/utils.js';

// ============================================
// Класс Weapon
// ============================================
export class Weapon {
    constructor(id, level = 1) {
        this.id = id;
        this.level = level; // 1-7
        this.timer = 0;
        this.data = WEAPONS_DATA[id];
    }

    get cooldown() {
        let cd = this.data.baseCd;
        if (this.id === 'bolter' && this.level >= 3) cd *= 0.5;
        if (this.id === 'shotgun' && this.level >= 3) cd *= 0.6;
        return cd;
    }

    update(dt, player, projectiles, turrets, mineSystem) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.fire(player, projectiles, turrets, mineSystem);
            let cd = this.cooldown * (1 - player.cdReduction);
            // Ярость кровавого ангела
            if (player.attackSpeedMult) {
                cd /= player.attackSpeedMult;
            }
            this.timer = cd;
        }
    }

    fire(player, projectiles, turrets, mineSystem) {
        const { x, y, dmgMult, projSpeed, areaMult, globalPierce, bounces } = player;
        const lvl = Math.min(this.level, 7);
        const L = lvl - 1; // Индекс для массивов
        const data = this.data;

        let dmg = data.baseDmg * dmgMult * (1 + L * 0.3);
        let spd = (data.projSpeed || 400) * projSpeed;

        switch (data.type) {
            case 'projectile':
                this.fireProjectile(x, y, dmg, spd, L, player, projectiles, globalPierce);
                break;
            case 'mine':
                this.fireMine(x, y, dmg, L, player, mineSystem);
                break;
            case 'lightning':
                this.fireLightning(x, y, dmg, L, player);
                break;
            case 'turret':
                this.fireTurret(x, y, turrets, L, player);
                break;
            case 'beam':
                this.fireBeam(x, y, dmg, L, player);
                break;
            case 'sniper':
                this.fireSniper(x, y, dmg, L, player, projectiles, globalPierce);
                break;
        }
    }

    fireProjectile(x, y, dmg, spd, L, player, projectiles, pierce) {
        const data = this.data;
        const levels = data.levels;

        switch (data.behavior) {
            case 'aim': {
                const cnt = levels.sCnt[L] || 1;
                const isExpl = levels.sExpl && levels.sExpl[L] > 0;
                const extraPierce = levels.sPierce ? levels.sPierce[L] : 0;
                
                const target = findNearestEnemy(player);
                if (!target && cnt === 1) return;
                
                const baseAngle = target ? Math.atan2(target.y - y, target.x - x) : player.orbAngle || 0;
                
                for (let i = 0; i < cnt; i++) {
                    const angle = baseAngle + (cnt > 1 ? (i - (cnt - 1) / 2) * 0.15 : 0);
                    const extra = isExpl ? { explosive: true, blastRadius: levels.sExpl[L] } : {};
                    projectiles.push(new Projectile(
                        this.id, x, y, angle, spd, dmg, this.level,
                        { pierce: pierce + extraPierce, ...extra }
                    ));
                }
                break;
            }
            case 'spread': {
                const cnt = levels.sCnt[L] || 3;
                const extraPierce = levels.sPierce ? levels.sPierce[L] : 0;
                const dmgMult = levels.sDmg ? levels.sDmg[L] : 1;

                const target = findNearestEnemy(player);
                if (!target) return;

                const baseAngle = Math.atan2(target.y - y, target.x - x);

                for (let i = 0; i < cnt; i++) {
                    const angle = baseAngle + (i - (cnt - 1) / 2) * 0.15;
                    projectiles.push(new Projectile(
                        this.id, x, y, angle, spd, dmg * dmgMult, this.level,
                        { pierce: pierce + extraPierce }
                    ));
                }
                break;
            }
            case 'rocket': {
                const cnt = levels.sCnt[L] || 1;
                const explR = levels.sExpl[L] || 40;
                const spdMul = levels.sSpd ? levels.sSpd[L] : 1;

                const target = findNearestEnemy(player);
                const baseAngle = target ? Math.atan2(target.y - y, target.x - x) : 0;

                for (let i = 0; i < cnt; i++) {
                    const angle = baseAngle + (cnt > 1 ? (i - (cnt - 1) / 2) * 0.2 : 0);
                    projectiles.push(new Projectile(
                        this.id, x, y, angle, spd * spdMul, dmg, this.level,
                        { explosive: true, blastRadius: explR, r: 6 }
                    ));
                }
                break;
            }
            case 'bounce': {
                const cnt = levels.sCnt[L] || 1;
                const bounces = levels.sBounce[L] || 3;
                
                const target = findNearestEnemy(player);
                const angle = target ? Math.atan2(target.y - y, target.x - x) : Math.random() * Math.PI * 2;
                
                for (let i = 0; i < cnt; i++) {
                    projectiles.push(new Projectile(
                        this.id, x, y, angle, spd, dmg, this.level,
                        { bounces: bounces, r: 6 }
                    ));
                }
                break;
            }
            case 'boomerang': {
                const cnt = levels.sCnt[L] || 1;
                const explR = levels.sExpl[L] || 60;
                const dmgMult = levels.sDmg ? levels.sDmg[L] : 1;

                const target = findNearestEnemy(player);
                const angle = target ? Math.atan2(target.y - y, target.x - x) : 0;

                for (let i = 0; i < cnt; i++) {
                    projectiles.push(new Projectile(
                        this.id, x, y, angle, spd * 0.5, dmg * dmgMult, this.level,
                        { isBoomerang: true, explosive: true, blastRadius: explR, r: 10 }
                    ));
                }
                break;
            }
            case 'spiral': {
                const cnt = levels.sCnt[L] || 1;
                const pr = levels.sSize ? levels.sSize[L] : 4;
                const spdMul = levels.sSpd ? levels.sSpd[L] : 1;
                
                const frameCount = window.gameManager?.frameCount || 0;
                
                for (let i = 0; i < cnt; i++) {
                    const angle = frameCount * 0.3 * spdMul + (i * Math.PI * 2 / cnt);
                    projectiles.push(new Projectile(
                        this.id, x, y, angle, spd * spdMul, dmg, this.level,
                        { r: pr }
                    ));
                }
                break;
            }
        }
    }

    fireMine(x, y, dmg, L, player, mineSystem) {
        const data = this.data;
        const levels = data.levels;
        const cnt = levels.sCnt[L] || 1;
        const rad = (levels.sRad[L] || 50) * player.areaMult;
        const dmgMult = levels.sDmg ? levels.sDmg[L] : 1;

        for (let i = 0; i < cnt; i++) {
            mineSystem.place(x + (i - Math.floor(cnt / 2)) * 20, y, rad, dmg * dmgMult, 1.5);
        }
    }

    fireLightning(x, y, dmg, L, player) {
        const data = this.data;
        const levels = data.levels;
        const cnt = levels.sCnt[L] || 1;
        const isChain = levels.sChain ? levels.sChain[L] === 1 : false;

        const enemies = window.gameManager?.enemies || [];
        if (enemies.length === 0) return;

        for (let i = 0; i < cnt; i++) {
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            if (target && !target.markedForRemoval) {
                window.gameManager?.spawnParticle(target.x, target.y, 'ring', '#aabbff', 30);
                target.takeDamage(dmg, player, true);
                
                if (isChain) {
                    // Цепная молния
                    const nearTarget = findNearestEnemy({ x: target.x, y: target.y }, enemies.filter(e => e !== target));
                    if (nearTarget) {
                        nearTarget.takeDamage(dmg * 0.5, player, true);
                    }
                }
            }
        }
    }

    fireTurret(x, y, turrets, L, player) {
        const data = this.data;
        const levels = data.levels;
        const cnt = levels.sCnt[L] || 1;
        const life = levels.sLife[L] || data.duration;

        for (let i = 0; i < cnt; i++) {
            turrets.push(new Turret(
                x + (Math.random() - 0.5) * 60,
                y + (Math.random() - 0.5) * 60,
                life,
                this.level,
                0.4,
                350,
                data.baseDmg * player.dmgMult
            ));
        }
    }

    fireBeam(x, y, dmg, L, player) {
        const data = this.data;
        const levels = data.levels;
        const cnt = levels.sCnt[L] || 1;
        const beamWidth = levels.sWidth ? levels.sWidth[L] : 15;
        const dmgMult = levels.sDmg ? levels.sDmg[L] : 1;
        const beamLength = data.beamLength || 2000;
        const beamDuration = data.beamDuration || 2.0;

        const target = findNearestEnemy(player);
        if (!target) return;

        const baseAngle = Math.atan2(target.y - y, target.x - x);
        const enemies = window.gameManager?.enemies || [];

        // Сохраняем ссылку на луч для обновления
        const beamData = {
            angle: baseAngle,
            duration: beamDuration,
            tickCount: 10,
            currentTick: 0,
            cnt: cnt,
            spread: (cnt > 1 ? 0.15 : 0),
            beamWidth: beamWidth,
            beamLength: beamLength,
            dmg: (dmg * dmgMult * 0.15) / 10,
            player: player
        };

        // Запускаем цикл обновления луча
        const beamInterval = setInterval(() => {
            if (window.gameManager?.state !== 'play' || beamData.currentTick >= beamData.tickCount) {
                clearInterval(beamInterval);
                return;
            }

            // Обновляем угол на текущую позицию врага
            const newTarget = findNearestEnemy(player);
            if (newTarget) {
                beamData.angle = Math.atan2(newTarget.y - player.y, newTarget.x - player.x);
            }

            // Визуализация ВСЕХ лучей
            for (let i = 0; i < beamData.cnt; i++) {
                const spread = (beamData.cnt > 1 ? (i - (beamData.cnt - 1) / 2) * beamData.spread : 0);
                const angle = beamData.angle + spread;
                window.gameManager?.spawnParticle(player.x, player.y, 'beam', data.color, 0, angle, beamLength);
            }

            // Урон
            for (let i = 0; i < beamData.cnt; i++) {
                const spread = (beamData.cnt > 1 ? (i - (beamData.cnt - 1) / 2) * beamData.spread : 0);
                const angle = beamData.angle + spread;

                enemies.forEach(e => {
                    if (!e.markedForRemoval) {
                        const ex = e.x - player.x;
                        const ey = e.y - player.y;
                        const len = Math.sqrt(ex * ex + ey * ey);
                        const dot = (ex * Math.cos(angle)) + (ey * Math.sin(angle));
                        if (dot > 0 && dot < beamLength) {
                            const closestX = player.x + Math.cos(angle) * dot;
                            const closestY = player.y + Math.sin(angle) * dot;
                            if (distSq(e.x, e.y, closestX, closestY) < beamData.beamWidth * beamData.beamWidth) {
                                e.takeDamage(beamData.dmg, player);
                            }
                        }
                    }
                });
            }

            beamData.currentTick++;
        }, (beamDuration / beamData.tickCount) * 1000);

        // Финальный всплеск
        setTimeout(() => {
            if (window.gameManager?.state !== 'play') return;

            for (let i = 0; i < cnt; i++) {
                const spread = (cnt > 1 ? (i - (cnt - 1) / 2) * 0.15 : 0);
                const angle = baseAngle + spread;
                window.gameManager?.spawnParticle(player.x, player.y, 'ring', '#ff0000', beamWidth * 2);
            }
        }, beamDuration * 1000);
    }

    fireSniper(x, y, dmg, L, player, projectiles, pierce) {
        const data = this.data;
        const levels = data.levels;
        const dmgMult = levels.sDmg ? levels.sDmg[L] : 1;
        const cdMult = levels.sCd ? levels.sCd[L] : 1;
        const extraPierce = levels.sPierce ? levels.sPierce[L] : 0;
        const chargeTime = data.chargeTime * cdMult;

        const target = findNearestEnemy(player);
        if (!target) return;

        // Сохраняем данные для обновления
        const sniperData = {
            angle: Math.atan2(target.y - y, target.x - x),
            startTime: Date.now(),
            chargeTime: chargeTime,
            dmg: dmg * dmgMult,
            level: this.level,
            pierce: pierce + extraPierce,
            active: true
        };

        // Запускаем цикл зарядки
        const chargeInterval = setInterval(() => {
            if (window.gameManager?.state !== 'play' || !sniperData.active) {
                clearInterval(chargeInterval);
                return;
            }

            const elapsed = (Date.now() - sniperData.startTime) / 1000;
            const chargePercent = Math.min(1, elapsed / sniperData.chargeTime);

            // Обновляем угол на текущую позицию врага
            const newTarget = findNearestEnemy(player);
            if (newTarget) {
                sniperData.angle = Math.atan2(newTarget.y - player.y, newTarget.x - player.x);
            }

            // Цвет меняется от белого к красному
            const r = Math.floor(255 * chargePercent);
            const g = Math.floor(255 * (1 - chargePercent));
            const b = Math.floor(255 * (1 - chargePercent));
            const color = `rgb(${r},${g},${b})`;

            // Визуализация луча прицеливания (от текущей позиции игрока)
            window.gameManager?.spawnParticle(player.x, player.y, 'beam', color, 0, sniperData.angle, 2000);

            // Когда зарядка завершена — выстрел
            if (chargePercent >= 1) {
                clearInterval(chargeInterval);
                sniperData.active = false;
                
                // Выстрел из текущей позиции игрока
                projectiles.push(new Projectile(
                    this.id, player.x, player.y, sniperData.angle, 800, sniperData.dmg, sniperData.level,
                    { pierce: sniperData.pierce, r: 5, sniper: true }
                ));
                
                // Визуальный эффект выстрела
                window.gameManager?.spawnParticles(player.x, player.y, '#fff', 10);
            }
        }, 50); // Обновление каждые 50мс
    }

    // Для ауры (щит, огнемет, грав-пушка)
    applyZoneDamage(dt, player, enemies) {
        if (this.data.type !== 'aura') return;

        const data = this.data;
        const L = Math.min(this.level - 1, 6);
        const levels = data.levels;
        const dmgMult = levels.sDmg ? levels.sDmg[L] : 1;
        const r = (data.radius || 100) * player.areaMult * (levels.sRad ? levels.sRad[L] : 1);
        // Урон в секунду
        const dps = data.baseDmg * player.dmgMult;
        // Урон за кадр (при 60 FPS)
        const dmgPerFrame = dps * dt;
        const push = levels.sPush ? levels.sPush[L] : 0;
        const frameCount = window.gameManager?.frameCount || 0;

        enemies.forEach(e => {
            if (distSq(player.x, player.y, e.x, e.y) < r * r) {
                // Кулдаун на урон (каждые 0.3 сек = ~18 кадров при 60 FPS)
                if (!e.lastHitTime || frameCount - e.lastHitTime > 18) {
                    e.takeDamage(dmgPerFrame * 18, player);
                    e.lastHitTime = frameCount;

                    // Визуализация попадания
                    window.gameManager?.spawnParticles(e.x, e.y, data.color, 2);

                    if (push > 0) {
                        const angle = Math.atan2(e.y - player.y, e.x - player.x);
                        e.x += Math.cos(angle) * push * dt;
                        e.y += Math.sin(angle) * push * dt;
                    }
                }
            }
        });
    }

    // Для orbit (цепной меч)
    applyOrbitDamage(frameCount, player, enemies) {
        if (this.data.type !== 'orbit') return;

        const data = this.data;
        const L = Math.min(this.level - 1, 6);
        const levels = data.levels;
        const count = (levels.sCnt[L] || data.baseCount || 1);
        const r = (data.radius || 80) * player.areaMult * (levels.sRad ? levels.sRad[L] : 1);
        const spd = (levels.sSpd ? levels.sSpd[L] : 1) * (this.level >= 5 ? 1.5 : 1);
        // Базовый урон за тик (сбалансированный)
        const dmgPerTick = data.baseDmg * player.dmgMult * 0.5;

        for (let i = 0; i < count; i++) {
            const angle = (frameCount * 0.05 * spd) + (i * Math.PI * 2 / count);
            const ox = player.x + Math.cos(angle) * r;
            const oy = player.y + Math.sin(angle) * r;

            enemies.forEach(e => {
                // Проверка кулдауна на урон (каждые 0.25 сек = ~15 кадров при 60 FPS)
                if (!e.lastHitTime || frameCount - e.lastHitTime > 15) {
                    if (distSq(ox, oy, e.x, e.y) < 800) {
                        e.takeDamage(dmgPerTick, player);
                        e.lastHitTime = frameCount;
                    }
                }
            });
        }
    }

    // Отрисовка зон
    renderZone(ctx, player) {
        if (this.data.type !== 'aura') return;

        const data = this.data;
        const L = Math.min(this.level - 1, 6);
        const levels = data.levels;
        const r = (data.radius || 100) * player.areaMult * (levels.sRad ? levels.sRad[L] : 1);

        ctx.beginPath();
        ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
        ctx.fillStyle = this.id === 'shield' ? 'rgba(51, 102, 255, 0.15)' : 'rgba(255, 69, 0, 0.15)';
        ctx.fill();
        ctx.strokeStyle = data.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Отрисовка orbit (меч)
    renderOrbit(ctx, player, frameCount) {
        if (this.data.type !== 'orbit') return;

        const data = this.data;
        const L = Math.min(this.level - 1, 6);
        const levels = data.levels;
        const count = (levels.sCnt[L] || data.baseCount || 1);
        const r = (data.radius || 80) * player.areaMult * (levels.sRad ? levels.sRad[L] : 1);
        const spd = (levels.sSpd ? levels.sSpd[L] : 1) * (this.level >= 5 ? 1.5 : 1);

        ctx.fillStyle = '#aaa';
        for (let i = 0; i < count; i++) {
            const angle = (frameCount * 0.05 * spd) + (i * Math.PI * 2 / count);
            const ox = player.x + Math.cos(angle) * r;
            const oy = player.y + Math.sin(angle) * r;

            ctx.save();
            ctx.translate(ox, oy);
            ctx.rotate(angle);
            ctx.fillStyle = '#888';
            ctx.fillRect(-12, -3, 24, 6);
            ctx.restore();
        }
    }

    // Получить описание текущего уровня
    getLevelDesc() {
        const L = Math.min(this.level - 1, 6);
        return this.data.levelDesc[L] || '';
    }
}

// ============================================
// WeaponSystem
// ============================================
export class WeaponSystem {
    constructor() {
        this.weapons = [];
    }

    addWeapon(id, level = 1) {
        const weapon = new Weapon(id, level);
        this.weapons.push(weapon);
        return weapon;
    }

    hasWeapon(id) {
        return this.weapons.some(w => w.id === id);
    }

    update(dt, player, projectiles, turrets, mineSystem) {
        this.weapons.forEach(w => w.update(dt, player, projectiles, turrets, mineSystem));
    }

    applyZoneDamage(dt, player, enemies) {
        this.weapons.forEach(w => w.applyZoneDamage(dt, player, enemies));
    }

    applyOrbitDamage(frameCount, player, enemies) {
        this.weapons.forEach(w => w.applyOrbitDamage(frameCount, player, enemies));
    }

    renderZones(ctx, player) {
        this.weapons.forEach(w => w.renderZone(ctx, player));
    }

    renderOrbits(ctx, player, frameCount) {
        this.weapons.forEach(w => w.renderOrbit(ctx, player, frameCount));
    }

    getUpgradeOptions() {
        const options = [];
        this.weapons.forEach(w => {
            if (w.level < 7) {
                const nextLevel = w.level + 1;
                const nextDesc = w.data.levelDesc[nextLevel - 1] || '';
                options.push({
                    type: 'weaponUpgrade',
                    weaponId: w.id,
                    name: `${WEAPONS_DATA[w.id].name} Ур.${nextLevel}`,
                    desc: nextDesc,
                    icon: WEAPONS_DATA[w.id].icon,
                    action: () => w.level++
                });
            }
        });
        return options;
    }

    getNewWeaponOptions() {
        const ownedIds = this.weapons.map(w => w.id);
        const available = Object.keys(WEAPONS_DATA).filter(id => !ownedIds.includes(id));
        
        if (available.length === 0) return [];

        available.sort(() => Math.random() - 0.5);
        return available.slice(0, 3).map(id => ({
            type: 'newWeapon',
            weaponId: id,
            name: WEAPONS_DATA[id].name,
            desc: WEAPONS_DATA[id].desc,
            icon: WEAPONS_DATA[id].icon,
            action: () => this.addWeapon(id, 1)
        }));
    }
}

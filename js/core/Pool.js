// ============================================
// ПУЛ ОБЪЕКТОВ — Оптимизация
// ============================================

// ============================================
// Класс Pool — переиспользование объектов
// ============================================
export class Pool {
    constructor(createFn, resetFn, initialSize = 100) {
        this.createFn = createFn;   // Функция создания объекта
        this.resetFn = resetFn;     // Функция сброса объекта
        this.objects = [];
        this.active = [];
        
        // Предварительное создание объектов
        for (let i = 0; i < initialSize; i++) {
            this.objects.push(this.createFn());
        }
    }

    // Получить объект из пула
    get() {
        let obj;
        if (this.objects.length > 0) {
            obj = this.objects.pop();
        } else {
            // Создаём новый, если пул пуст
            obj = this.createFn();
        }
        this.active.push(obj);
        return obj;
    }

    // Освободить объект
    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx > -1) {
            this.active.splice(idx, 1);
            this.resetFn(obj);
            this.objects.push(obj);
        }
    }

    // Освободить все объекты
    clear() {
        while (this.active.length > 0) {
            const obj = this.active.pop();
            this.resetFn(obj);
            this.objects.push(obj);
        }
    }

    // Получить все активные объекты
    getActive() {
        return this.active;
    }

    // Размер пула
    getSize() {
        return this.objects.length + this.active.length;
    }

    // Активных объектов
    getActiveCount() {
        return this.active.length;
    }
}

// ============================================
// Фабрики для разных типов объектов
// ============================================

// Пул снарядов
export function createProjectilePool() {
    return new Pool(
        // Create
        () => ({
            type: 'projectile',
            x: 0, y: 0,
            vx: 0, vy: 0,
            r: 6,
            dmg: 0,
            color: '#fff',
            pierce: 0,
            level: 1,
            explosive: false,
            blastRadius: 0,
            isBoomerang: false,
            bounces: 0,
            lifespan: null,
            markedForRemoval: false,
            // Методы
            init: function(type, x, y, vx, vy, dmg, color, level, extra = {}) {
                this.type = type;
                this.x = x; this.y = y;
                this.vx = vx; this.vy = vy;
                this.dmg = dmg;
                this.color = color;
                this.level = level;
                this.r = extra.r || 6;
                this.pierce = extra.pierce || 0;
                this.explosive = extra.explosive || false;
                this.blastRadius = extra.blastRadius || 0;
                this.isBoomerang = extra.isBoomerang || false;
                this.bounces = extra.bounces || 0;
                this.lifespan = extra.lifespan || null;
                this.markedForRemoval = false;
                return this;
            },
            update: function(dt, player, enemies) {
                // Движение
                this.x += this.vx * dt;
                this.y += this.vy * dt;

                // Thunder hammer (бумеранг)
                if (this.isBoomerang) {
                    const dist = Math.hypot(this.x - player.x, this.y - player.y);
                    if (dist > 250) {
                        const angle = Math.atan2(player.y - this.y, player.x - this.x);
                        this.vx = Math.cos(angle) * 400;
                        this.vy = Math.sin(angle) * 400;
                    }
                }

                // Bounce (рикошет)
                if (this.bounces > 0) {
                    const width = window.gameManager?.width || 800;
                    const height = window.gameManager?.height || 600;
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;
                }

                // Границы
                if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
                    this.markedForRemoval = true;
                }

                // Время жизни
                if (this.lifespan !== null) {
                    this.lifespan -= dt;
                    if (this.lifespan <= 0) {
                        this.markedForRemoval = true;
                    }
                }

                // Столкновения
                for (const e of enemies) {
                    if (!e.markedForRemoval) {
                        const dx = this.x - e.x;
                        const dy = this.y - e.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < (this.r + e.r) ** 2) {
                            this.onHit(e, player, enemies);
                            break;
                        }
                    }
                }
            },
            onHit: function(enemy, player, enemies) {
                enemy.takeDamage(this.dmg, player);

                if (this.explosive) {
                    window.gameManager?.spawnParticles(this.x, this.y, '#ff4500', 20);
                    for (const e2 of enemies) {
                        if (e2 !== enemy && !e2.markedForRemoval) {
                            const dx = this.x - e2.x;
                            const dy = this.y - e2.y;
                            if (dx * dx + dy * dy < this.blastRadius ** 2) {
                                e2.takeDamage(this.dmg * 0.5, player);
                            }
                        }
                    }
                    this.markedForRemoval = true;
                    return;
                }

                if (this.pierce > 0) {
                    this.pierce--;
                } else {
                    this.markedForRemoval = true;
                }
            },
            render: function(ctx) {
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 5;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }),
        // Reset
        (obj) => {
            obj.markedForRemoval = false;
            obj.x = 0; y = 0;
            obj.vx = 0; vy = 0;
        },
        200 // Начальный размер
    );
}

// Пул частиц
export function createParticlePool() {
    return new Pool(
        () => ({
            x: 0, y: 0,
            vx: 0, vy: 0,
            type: 'dot',
            color: '#fff',
            r: 3,
            life: 0.3,
            maxLife: 0.3,
            angle: 0,
            len: 0,
            markedForRemoval: false,
            init: function(x, y, type, color, r, vx, vy, angle, len) {
                this.x = x; this.y = y;
                this.type = type;
                this.color = color;
                this.r = r;
                this.vx = vx || 0;
                this.vy = vy || 0;
                this.angle = angle || 0;
                this.len = len || 0;
                this.life = 0.3 + Math.random() * 0.3;
                this.maxLife = this.life;
                this.markedForRemoval = false;
                return this;
            },
            update: function(dt) {
                this.life -= dt;
                if (this.type === 'ring') {
                    this.r += 300 * dt;
                } else if (this.type === 'beam') {
                    this.life -= dt * 4;
                } else {
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                }
                if (this.life <= 0) {
                    this.markedForRemoval = true;
                }
            },
            render: function(ctx) {
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
        }),
        (obj) => {
            obj.markedForRemoval = false;
        },
        300
    );
}

// Пул врагов
export function createEnemyPool() {
    return new Pool(
        () => ({
            type: '',
            id: '',
            color: '#fff',
            r: 10,
            hp: 0,
            maxHp: 0,
            spd: 0,
            baseDmg: 0,
            xpValue: 0,
            x: 0, y: 0,
            isVeteran: false,
            burnTimer: 0,
            swear: null,
            swearTimer: 0,
            markedForRemoval: false,
            lastHitTime: 0,
            init: function(data, x, y, difficulty) {
                this.type = data.type;
                this.id = data.id || '';
                this.color = data.color;
                this.r = data.r;
                this.baseDmg = data.dmg;
                this.spd = data.spd;
                this.xpValue = data.xp;
                this.swears = data.swears || [];
                this.x = x; this.y = y;
                this.maxHp = data.hp * (1 + difficulty * 0.15);
                this.hp = this.maxHp;
                this.isVeteran = Math.random() < 0.1 * difficulty;
                if (this.isVeteran) {
                    this.hp *= 2.5;
                    this.maxHp *= 2.5;
                    this.color = '#ffd700';
                    this.spd *= 0.8;
                    this.xpValue *= 5;
                }
                this.burnTimer = 0;
                this.swear = null;
                this.swearTimer = 0;
                this.markedForRemoval = false;
                this.lastHitTime = 0;
                if (Math.random() < 0.3 && this.swears.length > 0) {
                    this.swear = this.swears[Math.floor(Math.random() * this.swears.length)];
                    this.swearTimer = 2.0;
                }
                return this;
            }
        }),
        (obj) => {
            obj.markedForRemoval = false;
            obj.hp = 0;
        },
        150
    );
}

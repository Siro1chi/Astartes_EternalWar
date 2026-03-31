// ============================================
// ДАННЫЕ О НАВЫКАХ И ВРАГАХ
// ============================================

// 12 пассивных навыков
export const PASSIVE_SKILLS = [
    { id: 'dmg', name: 'Мощь Сервоприводов', desc: '+15% Урон', icon: '💪', maxStacks: 5, apply: (p) => p.dmgMult += 0.15 },
    { id: 'spd', name: 'Ускоритель', desc: '+10% Скорость', icon: '👟', maxStacks: 5, apply: (p) => p.speed *= 1.10 },
    { id: 'hp', name: 'Улучшенная Броня', desc: '+20 Макс. HP', icon: '❤', maxStacks: 5, apply: (p) => { p.maxHp += 20; p.hp += 20; } },
    { id: 'regen', name: 'Ремонтные Дроны', desc: '+1 HP/сек', icon: '💊', maxStacks: 5, apply: (p) => p.regen += 1 },
    { id: 'armor', name: 'Церамитная Плита', desc: '-3 Вход. Урон', icon: '🛡', maxStacks: 5, apply: (p) => p.armor += 3 },
    { id: 'luck', name: 'Мат. Сенсоры', desc: '+10% Крит. Шанс', icon: '🍀', maxStacks: 5, apply: (p) => p.luck += 0.1 },
    { id: 'cd', name: 'Спешка', desc: '-10% Перезарядка', icon: '⚙', maxStacks: 5, apply: (p) => p.cdReduction += 0.1 },
    { id: 'area', name: 'Расширитель', desc: '+15% Радиус умений', icon: '💥', maxStacks: 5, apply: (p) => p.areaMult += 0.15 },
    { id: 'vampire', name: 'Нартециум', desc: 'Лечит за убийство', icon: '🩸', maxStacks: 5, apply: (p) => p.lifesteal += 0.05 },
    { id: 'dodge', name: 'Гироскопы', desc: '10% Уклонение', icon: '💨', maxStacks: 5, apply: (p) => p.dodge += 0.1 },
    { id: 'pierce', name: 'Бронебойные', desc: '+1 Пробитие снарядов', icon: '➡', maxStacks: 5, apply: (p) => p.globalPierce++ },
    { id: 'mag', name: 'Магнитный Ловец', desc: '+30 Радиус лута', icon: '🧲', maxStacks: 5, apply: (p) => p.magnetRadius += 30 }
];

// 5 типов врагов Хаоса + Боссы
export const ENEMY_TYPES = [
    { 
        type: 'Нурглит', 
        id: 'nurgle',
        color: '#556b2f', 
        r: 28, 
        hp: 350, 
        spd: 20, 
        dmg: 15, 
        xp: 8, 
        swears: ["Гниение!", "Фуу!", "Нургл питает!"],
        minDifficulty: 1,
        isTank: true
    },
    { 
        type: 'Кхорнит', 
        id: 'khorne',
        color: '#8b0000', 
        r: 14, 
        hp: 50, 
        spd: 140, 
        dmg: 20, 
        xp: 4, 
        swears: ["Кровь!", "Черепа!", "Хаос!"],
        minDifficulty: 1 
    },
    { 
        type: 'Слаанешит', 
        id: 'slaanesh',
        color: '#da70d6', 
        r: 12, 
        hp: 40, 
        spd: 90, 
        dmg: 18, 
        xp: 5, 
        swears: ["Боль...", "Экстаз!", "Слаанеш!"],
        minDifficulty: 2 
    },
    { 
        type: 'Тзинчит', 
        id: 'tzeentch',
        color: '#0000aa', 
        r: 11, 
        hp: 35, 
        spd: 55, 
        dmg: 8, 
        xp: 4, 
        swears: ["Изменение!", "Варп!", "Тзинч!"],
        minDifficulty: 1,
        canShoot: true,
        shootCd: 2.0,
        shootDmg: 10
    },
    { 
        type: 'Чёрный Легион', 
        id: 'black',
        color: '#1a1a1a', 
        r: 16, 
        hp: 120, 
        spd: 75, 
        dmg: 25, 
        xp: 7, 
        swears: ["Абаддон!", "Ересь!", "Легион!"],
        minDifficulty: 3 
    }
];

// Боссы-демоны Хаоса
export const BOSSES = [
    {
        type: 'Великий Нечистый',
        id: 'great_unclean',
        color: '#6b8e23',
        r: 50,
        hp: 5000,
        spd: 15,
        dmg: 30,
        xp: 100,
        swears: ["Я... чума...", "Гниение... вечно..."],
        isBoss: true,
        isTank: true,
        canShoot: true,
        shootCd: 3.0,
        shootDmg: 25
    },
    {
        type: 'Лорд Кхорна',
        id: 'khorne_lord',
        color: '#8b0000',
        r: 45,
        hp: 4000,
        spd: 35,
        dmg: 40,
        xp: 100,
        swears: ["КРОВЬ ДЛЯ БОГА КРОВИ!", "ЧЕРЕПА ДЛЯ ТРОНА!"],
        isBoss: true,
        canShoot: false
    },
    {
        type: 'Вестник Слаанеш',
        id: 'slaanesh_herald',
        color: '#ff1493',
        r: 35,
        hp: 3000,
        spd: 80,
        dmg: 25,
        xp: 100,
        swears: ["Боль... наслаждение...", "Ещё..."],
        isBoss: true,
        canShoot: true,
        shootCd: 1.5,
        shootDmg: 15
    },
    {
        type: 'Вестник Тзинча',
        id: 'tzeentch_herald',
        color: '#4169e1',
        r: 35,
        hp: 2500,
        spd: 50,
        dmg: 20,
        xp: 100,
        swears: ["ПЛАНЫ... ПЕРЕМЕНЫ...", "СУДЬБА..."],
        isBoss: true,
        canShoot: true,
        shootCd: 1.0,
        shootDmg: 12
    }
];

// Конфигурация игры
export const CONFIG = {
    maxParticles: 100,
    maxEnemies: 120,
    maxProjectiles: 300,
    maxFloatingTexts: 50,
    maxMines: 20,
    baseSpawnRate: 1.5,
    invTime: 1.0
};

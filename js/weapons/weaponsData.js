// ============================================
// ДАННЫЕ ОБ ОРУЖИИ — 12 типов, 7 уровней
// ============================================

export const WEAPONS_DATA = {
    bolter: {
        id: 'bolter',
        name: "Болтер",
        icon: "🔫",
        color: "#ffcc00",
        baseCd: 0.6,
        baseDmg: 6,
        type: 'projectile',
        behavior: 'aim',
        desc: "Стандартный болтер Астартес.",
        projSpeed: 300,
        levels: {
            sCnt: [1, 2, 2, 3, 3, 3, 5],
            sExpl: [0, 0, 0, 0, 30, 30, 30],
            sPierce: [0, 0, 0, 0, 0, 2, 5]
        },
        levelDesc: [
            "Одиночный выстрел.",
            "Стрельба парой болтов.",
            "Ускорение темпа стрельбы.",
            "Веер из 3 болтов.",
            "Взрывные болты (урон по площади).",
            "Пробитие на 2 цели.",
            "Шквал: 5 болтов с пробитием."
        ]
    },
    shotgun: {
        id: 'shotgun',
        name: "Дробовик",
        icon: "🔫",
        color: "#ffaa00",
        baseCd: 1.0,
        baseDmg: 3,
        type: 'projectile',
        behavior: 'spread',
        desc: "Ближний бой.",
        projSpeed: 350,
        levels: {
            sCnt: [3, 5, 5, 7, 7, 7, 10],
            sPierce: [0, 0, 0, 0, 0, 1, 1],
            sDmg: [1, 1, 1, 1, 1.2, 1.3, 1.5]
        },
        levelDesc: [
            "3 дроби.",
            "5 дробин.",
            "Ускорение перезарядки.",
            "7 дробин.",
            "Зажигательные дроби.",
            "Дроби пробивают 1 цель.",
            "10 дробин с пробитием."
        ]
    },
    rocket: {
        id: 'rocket',
        name: "Циклич. Ракет.",
        icon: "🚀",
        color: "#aa0000",
        baseCd: 2.5,
        baseDmg: 40,
        type: 'projectile',
        behavior: 'rocket',
        desc: "Ракетная установка.",
        projSpeed: 250,
        levels: {
            sCnt: [1, 1, 1, 2, 2, 3, 3],
            sExpl: [40, 40, 70, 70, 100, 100, 150],
            sSpd: [0.6, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9]
        },
        levelDesc: [
            "Одна ракета.",
            "Увеличенная скорость.",
            "Увеличенный радиус взрыва.",
            "Две ракеты веером.",
            "Огромный взрыв.",
            "Три ракеты.",
            "Три ракеты с мощным взрывом."
        ]
    },
    gren: {
        id: 'gren',
        name: "Мины-Ловушки",
        icon: "💣",
        color: "#556b2f",
        baseCd: 2.0,
        baseDmg: 25,
        type: 'mine',
        desc: "Ставит мины.",
        levels: {
            sCnt: [1, 2, 2, 3, 3, 4, 5],
            sRad: [50, 50, 80, 80, 80, 80, 120],
            sDmg: [1, 1, 1, 1, 1.5, 1.5, 2]
        },
        levelDesc: [
            "1 мина под ноги.",
            "2 мины.",
            "Увеличенный радиус.",
            "3 мины.",
            "Увеличенный урон.",
            "4 мины.",
            "5 мин с огромным радиусом."
        ]
    },
    bounce: {
        id: 'bounce',
        name: "Крозиус Аркит",
        icon: "✝",
        color: "#ffd700",
        baseCd: 1.5,
        baseDmg: 15,
        type: 'projectile',
        behavior: 'bounce',
        desc: "Рикошет.",
        projSpeed: 400,
        levels: {
            sCnt: [1, 1, 2, 2, 2, 3, 3],
            sBounce: [3, 5, 5, 8, 8, 8, 10]
        },
        levelDesc: [
            "Отскакивает 3 раза.",
            "Отскакивает 5 раз.",
            "Два Крозиуса.",
            "Отскакивает 8 раз.",
            "Усиленный урон.",
            "Три Крозиуса.",
            "Мощный шторм из 3 крозиусов."
        ]
    },
    boom: {
        id: 'boom',
        name: "Молот Грома",
        icon: "🔨",
        color: "#0066ff",
        baseCd: 2.0,
        baseDmg: 30,
        type: 'projectile',
        behavior: 'boomerang',
        desc: "Бумеранг.",
        projSpeed: 200,
        levels: {
            sCnt: [1, 2, 2, 2, 3, 3, 5],
            sExpl: [60, 60, 100, 100, 100, 150, 200],
            sDmg: [1, 1, 1.2, 1.3, 1.5, 1.8, 2]
        },
        levelDesc: [
            "Молот летит и возвращается.",
            "Два молота.",
            "Увеличенный взрыв.",
            "Быстрый возврат.",
            "Три молота.",
            "Огромный взрыв.",
            "Пять молотов очищают экран."
        ]
    },
    sword: {
        id: 'sword',
        name: "Цепной Меч",
        icon: "⚔",
        color: "#aaaaaa",
        baseCd: 0,
        baseDmg: 8,
        type: 'orbit',
        radius: 80,
        desc: "Вращение.",
        baseCount: 2,
        orbitSpeed: 3,
        levels: {
            sCnt: [2, 3, 3, 4, 4, 5, 6],
            sRad: [1, 1, 1.3, 1.3, 1.3, 1.3, 1.5],
            sSpd: [1, 1, 1, 1, 1.5, 1.5, 1.5]
        },
        levelDesc: [
            "2 меча вращаются.",
            "3 меча.",
            "Увеличенный радиус.",
            "4 меча.",
            "Ускорение вращения.",
            "5 мечей.",
            "6 мечей, огромный радиус."
        ]
    },
    shield: {
        id: 'shield',
        name: "Щит Вексилла",
        icon: "🛡",
        color: "#3366ff",
        baseCd: 0,
        baseDmg: 12,
        type: 'aura',
        radius: 120,
        desc: "Силовое поле.",
        levels: {
            sRad: [1, 1.2, 1.2, 1.4, 1.4, 1.6, 1.8],
            sPush: [0, 0, 3, 3, 5, 5, 7]
        },
        levelDesc: [
            "Малое силовое поле.",
            "Увеличенный радиус.",
            "Поле отталкивает врагов.",
            "Большой радиус.",
            "Больше урона.",
            "Сильное отталкивание.",
            "Максимальный размер и урон."
        ]
    },
    flamer: {
        id: 'flamer',
        name: "Огнемет",
        icon: "🔥",
        color: "#ff5500",
        baseCd: 0.5,
        baseDmg: 12,
        type: 'aura',
        radius: 100,
        desc: "Зона урона.",
        levels: {
            sRad: [1, 1.2, 1.2, 1.4, 1.4, 1.6, 1.8],
            sDmg: [1, 1, 1.2, 1.2, 1.5, 1.5, 2]
        },
        levelDesc: [
            "Тонкая струя пламени.",
            "Широкий конус.",
            "Увеличенный радиус.",
            "Огненный шторм.",
            "Больше урона.",
            "Максимальный радиус.",
            "Испепеление (макс урон/радиус)."
        ]
    },
    smite: {
        id: 'smite',
        name: "Кара Императора",
        icon: "⚡",
        color: "#aabbff",
        baseCd: 1.0,
        baseDmg: 12,
        type: 'lightning',
        desc: "Молния.",
        levels: {
            sCnt: [1, 2, 3, 3, 4, 5, 8],
            sChain: [0, 0, 0, 1, 1, 1, 1]
        },
        levelDesc: [
            "Молния в одного врага.",
            "Две молнии.",
            "Три молнии.",
            "Цепная молния (бьет около цели).",
            "Четыре молнии.",
            "Пять молний.",
            "Восемь мощных цепных молний."
        ]
    },
    turret: {
        id: 'turret',
        name: "Сервочерепа",
        icon: "💀",
        color: "#888888",
        baseCd: 4.0,
        baseDmg: 10,
        type: 'turret',
        desc: "Турели.",
        duration: 6,
        levels: {
            sCnt: [1, 2, 2, 3, 3, 4, 5],
            sLife: [6, 6, 10, 10, 10, 10, 10]
        },
        levelDesc: [
            "1 череп.",
            "2 черепа.",
            "Увеличенное время жизни.",
            "3 черепа.",
            "Быстрая стрельба.",
            "4 черепа.",
            "5 черепов, шквальный огонь."
        ]
    },
    laser: {
        id: 'laser',
        name: "Лазпушка",
        icon: "🔴",
        color: "#ff0000",
        baseCd: 2.5,
        baseDmg: 50,
        type: 'beam',
        desc: "Луч.",
        beamLength: 2000,
        beamDuration: 2.0,
        levels: {
            sCnt: [1, 2, 2, 3, 3, 4, 5],
            sWidth: [15, 15, 30, 30, 50, 50, 80],
            sDmg: [1, 1, 1.2, 1.2, 1.5, 1.5, 2]
        },
        levelDesc: [
            "Тонкий луч (2 сек).",
            "Два луча.",
            "Утолщенный луч.",
            "Три луча.",
            "Широкий луч.",
            "Четыре луча.",
            "Пять широких лучей."
        ]
    },
    sniper: {
        id: 'sniper',
        name: "Винтовка",
        icon: "🎯",
        color: "#ffffff",
        baseCd: 1.8,
        baseDmg: 80,
        type: 'sniper',
        desc: "Снайперская винтовка.",
        chargeTime: 1.5,
        levels: {
            sDmg: [1, 1.3, 1.6, 2, 2.5, 3, 4],
            sCd: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
            sPierce: [0, 0, 0, 1, 1, 2, 3]
        },
        levelDesc: [
            "Зарядка 1.5 сек, белый луч.",
            "Увеличенный урон.",
            "Быстрее зарядка.",
            "Пробивает 1 цель.",
            "Ещё больше урона.",
            "Пробивает 2 цели.",
            "Смертельный выстрел (пробитие 3)."
        ]
    },
    plasma: {
        id: 'plasma',
        name: "Плазмаган",
        icon: "☀",
        color: "#00ffff",
        baseCd: 0.3,
        baseDmg: 6,
        type: 'projectile',
        behavior: 'spiral',
        desc: "Спираль.",
        projSpeed: 400,
        levels: {
            sCnt: [1, 2, 2, 3, 3, 4, 5],
            sSize: [4, 4, 4, 4, 6, 6, 8],
            sSpd: [1, 1, 1.5, 1.5, 1.5, 1.5, 1.5]
        },
        levelDesc: [
            "1 плазменный сгусток.",
            "2 сгустка по спирали.",
            "Быстрая стрельба.",
            "3 сгустка.",
            "Увеличенный размер.",
            "4 сгустка.",
            "5 огромных быстрых сгустков."
        ]
    },
    grav: {
        id: 'grav',
        name: "Грав-Пушка",
        icon: "🌀",
        color: "#6666ff",
        baseCd: 0,
        baseDmg: 6,
        type: 'aura',
        radius: 120,
        desc: "Воронка.",
        levels: {
            sRad: [1, 1.2, 1.2, 1.4, 1.4, 1.6, 1.8]
        },
        levelDesc: [
            "Слабая гравитация.",
            "Сильная гравитация.",
            "Замедляет врагов.",
            "Огромная область притяжения.",
            "Больше урона.",
            "Максимальное замедление.",
            "Воронка смерти (макс параметры)."
        ]
    }
};

const WEAPON_LEVELS = {
    bolter: ["Одиночный.", "Очередь (2).", "Взрывные."],
    stormbolter: ["Двойной.", "Скорострельный.", "Шквал (4)."],
    chainsword: ["Острый.", "Зубья (+2).", "Силовое поле."],
    flamer: ["Прометиум.", "Инферно.", "Святой огонь."],
    smite: ["Заряд.", "Крик (2).", "Шторм (3)."],
    grenades: ["Фраг (8).", "Крак (12).", "Вихрь."],
    thunder: ["Удар.", "Гром.", "Молот."],
    crozius: ["Вера.", "Ярость.", "Литании."],
    plasma: ["Малая.", "Высокая.", "Перегрузка."],
    skulls: ["Разведка (1).", "Боевой (2).", "Охотник."],
    shield: ["Энергия.", "Преломление.", "Ореол."],
    lascannon: ["Луч.", "Прожектор.", "Испепелитель."],
    gravgun: ["Гравитон.", "Сжатие.", "Давление."],
    missile: ["Ракета.", "Залп.", "Тактический."]
};

// Классы (шаблоны дредноута) — по номерам легионов
export const CLASSES = {
    da: { 
        name: "Тёмные Ангелы",
        desc: "I легион, Дробовик",
        hp: 150, 
        speed: 180, 
        weapon: 'shotgun', 
        dmg: 1.0, 
        icon: 'img/Dark_Angel.webp',
        scale: 0.1,
        color: '#1e4e2e',
        ultType: 'push',
        ultChargeRate: 1.1  // 90 сек
    },
    ws: { 
        name: "Белые Шрамы",
        desc: "V легион, Плазмаган",
        hp: 90, 
        speed: 280, 
        weapon: 'plasma', 
        dmg: 1.1, 
        icon: 'img/White_Scarm.webp',
        scale: 0.1,
        color: '#cc3333',
        ultType: 'haste',
        ultChargeRate: 1.4  // 70 сек
    },
    sw: { 
        name: "Космические Волки",
        desc: "VI легион, Молот",
        hp: 180, 
        speed: 160, 
        weapon: 'boom', 
        dmg: 1.3, 
        icon: 'img/Space_Wolf.webp',
        scale: 0.1,
        color: '#4a4a5e',
        ultType: 'taunt',
        ultChargeRate: 1.25  // 80 сек
    },
    term: { 
        name: "Имперские Кулаки",
        desc: "VII легион, Щит",
        hp: 200, 
        speed: 130, 
        weapon: 'shield', 
        dmg: 0.8, 
        icon: 'img/Imperial_Fist.webp',
        scale: 0.1,
        color: '#6e5e1e',
        ultType: 'wall',
        ultChargeRate: 1.0  // 100 сек
    },
    ass: { 
        name: "Кровавые Ангелы",
        desc: "IX легион, Меч",
        hp: 80, 
        speed: 260, 
        weapon: 'sword', 
        dmg: 1.2, 
        icon: 'img/Blood_Angel.webp',
        scale: 0.1,
        color: '#6e1e1e',
        ultType: 'frenzy',
        ultChargeRate: 4.0  // 70 сек
    },
    tac: { 
        name: "Ультрамарины",
        desc: "XIII легион, Болтер",
        hp: 100, 
        speed: 200, 
        weapon: 'bolter', 
        dmg: 1.0, 
        icon: 'img/Ultramarine.webp',
        scale: 0.1,
        color: '#1e3a6e',
        ultType: 'xp',
        ultChargeRate: 1.1  // 90 сек
    },
    ih: { 
        name: "Железные Руки",
        desc: "X легион, Сервочерепа",
        hp: 160, 
        speed: 150, 
        weapon: 'turret', 
        dmg: 0.9, 
        icon: 'img/Iron_Hand.webp',
        scale: 0.1,
        color: '#4a5e6e',
        ultType: 'freeze',
        ultChargeRate: 0.9  // 110 сек
    },
    salamander: { 
        name: "Саламандры",
        desc: "XVIII легион, Огнемет",
        hp: 140, 
        speed: 170, 
        weapon: 'flamer', 
        dmg: 1.0, 
        icon: 'img/Salamander.webp',
        scale: 0.1,
        color: '#2e5e2e',
        ultType: 'heal',
        ultChargeRate: 0.8  // 125 сек
    },
    raven: { 
        name: "Гвардия Ворона",
        desc: "XIX легион, Снайперка",
        hp: 100, 
        speed: 220, 
        weapon: 'sniper', 
        dmg: 1.2, 
        icon: 'img/Raven_Guard.webp',
        scale: 0.1,
        color: '#1a1a1a',
        ultType: 'stealth',
        ultChargeRate: 1.0  // 100 сек
    }
};

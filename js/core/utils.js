// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Квадрат расстояния (быстрее чем полное расстояние)
export function distSq(x1, y1, x2, y2) {
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
}

// Полное расстояние
export function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// Найти ближайшего врага
export function findNearestEnemy(player, enemies = window.gameManager?.enemies || []) {
    if (!player || enemies.length === 0) return null;
    
    let nearest = null;
    let minDist = Infinity;
    
    for (const e of enemies) {
        const d = distSq(player.x, player.y, e.x, e.y);
        if (d < minDist) {
            minDist = d;
            nearest = e;
        }
    }
    
    return nearest;
}

// Найти врагов в радиусе
export function findEnemiesInRadius(x, y, radius, enemies = window.gameManager?.enemies || []) {
    const radiusSq = radius * radius;
    return enemies.filter(e => distSq(x, y, e.x, e.y) < radiusSq);
}

// Форматирование времени
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Случайное число в диапазоне
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Случайный элемент массива
export function randomChoice(array) {
    return array.length > 0 ? array[Math.floor(Math.random() * array.length)] : null;
}

// Перемешать массив (Fisher-Yates)
export function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Ограничить значение в диапазоне
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Линейная интерполяция
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

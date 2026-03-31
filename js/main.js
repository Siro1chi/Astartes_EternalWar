// ============================================
// WARHAMMER 40K: ETERNAL WAR
// Точка входа
// ============================================

import { GameManager } from './core/GameManager.js';

// Глобальный менеджер
window.gameManager = null;

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const bgCanvas = document.getElementById('bg-canvas');
    
    // Создание менеджера
    window.gameManager = new GameManager(canvas, bgCanvas);
    window.gameManager.init();
});

// ============================================
// ОБРАБОТКА ВВОДА + Джойстик
// ============================================

export class InputHandler {
    constructor() {
        this.keys = new Set();
        
        // Джойстик
        this.joystick = {
            active: false,
            originX: 0,
            originY: 0,
            currentX: 0,
            currentY: 0,
            dx: 0,
            dy: 0
        };
        
        this.setupListeners();
        this.setupJoystick();
    }

    setupListeners() {
        window.addEventListener('keydown', e => {
            this.keys.add(e.code);
            // Обработка пробела для ульты
            if (e.code === 'Space' && window.gameManager?.state === 'play') {
                window.gameManager.triggerUlt();
            }
        });

        window.addEventListener('keyup', e => {
            this.keys.delete(e.code);
        });
    }

    setupJoystick() {
        const zone = document.getElementById('joystick-zone');
        const stick = document.getElementById('joystick-stick');
        const base = document.getElementById('joystick-base');
        
        if (!zone || !stick) return;

        const maxDist = 50; // Максимальное отклонение стика

        // Touch events
        zone.addEventListener('touchstart', e => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const rect = zone.getBoundingClientRect();
            
            this.joystick.active = true;
            this.joystick.originX = rect.left + rect.width / 2;
            this.joystick.originY = rect.top + rect.height / 2;
            
            this.updateJoystick(touch.clientX, touch.clientY, maxDist, stick);
        }, { passive: false });

        zone.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!this.joystick.active) return;
            
            const touch = e.changedTouches[0];
            this.updateJoystick(touch.clientX, touch.clientY, maxDist, stick);
        }, { passive: false });

        const endJoystick = (e) => {
            e.preventDefault();
            this.joystick.active = false;
            this.joystick.dx = 0;
            this.joystick.dy = 0;
            stick.style.transform = `translate(0px, 0px)`;
        };

        zone.addEventListener('touchend', endJoystick);
        zone.addEventListener('touchcancel', endJoystick);

        // Mouse events для тестирования на ПК
        let isDragging = false;

        zone.addEventListener('mousedown', e => {
            const rect = zone.getBoundingClientRect();
            this.joystick.active = true;
            this.joystick.originX = rect.left + rect.width / 2;
            this.joystick.originY = rect.top + rect.height / 2;
            isDragging = true;
            this.updateJoystick(e.clientX, e.clientY, maxDist, stick);
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging || !this.joystick.active) return;
            this.updateJoystick(e.clientX, e.clientY, maxDist, stick);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.joystick.active = false;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
                stick.style.transform = `translate(0px, 0px)`;
            }
        });

        // Кнопка ульты
        const ultBtn = document.getElementById('ult-button');
        if (ultBtn) {
            ultBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (window.gameManager?.state === 'play') {
                    window.gameManager.triggerUlt();
                }
            });
            
            ultBtn.addEventListener('click', () => {
                if (window.gameManager?.state === 'play') {
                    window.gameManager.triggerUlt();
                }
            });
        }
    }

    updateJoystick(clientX, clientY, maxDist, stick) {
        const dx = clientX - this.joystick.originX;
        const dy = clientY - this.joystick.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Нормализуем
        let normDx = dx;
        let normDy = dy;
        
        if (dist > maxDist) {
            normDx = (dx / dist) * maxDist;
            normDy = (dy / dist) * maxDist;
        }
        
        // Визуальное смещение стика
        stick.style.transform = `translate(${normDx}px, ${normDy}px)`;
        
        // Нормализованный вывод (-1 до 1)
        this.joystick.dx = normDx / maxDist;
        this.joystick.dy = normDy / maxDist;
    }

    isPressed(code) {
        return this.keys.has(code);
    }

    getMovementDirection() {
        let dx = 0, dy = 0;

        // Клавиатура
        if (this.isPressed('KeyW') || this.isPressed('ArrowUp')) dy = -1;
        if (this.isPressed('KeyS') || this.isPressed('ArrowDown')) dy = 1;
        if (this.isPressed('KeyA') || this.isPressed('ArrowLeft')) dx = -1;
        if (this.isPressed('KeyD') || this.isPressed('ArrowRight')) dx = 1;

        // Джойстик переопределяет клавиатуру
        if (this.joystick.active) {
            dx = this.joystick.dx;
            dy = this.joystick.dy;
        }

        // Нормализация диагонального движения (только для клавиатуры)
        const fromKeyboard = (this.isPressed('KeyW') || this.isPressed('KeyS') || 
                              this.isPressed('KeyA') || this.isPressed('KeyD'));
        
        if (!this.joystick.active && fromKeyboard && (dx !== 0 || dy !== 0)) {
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                dx /= len;
                dy /= len;
            }
        }

        return { dx, dy };
    }

    reset() {
        this.keys.clear();
        this.joystick.active = false;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
    }
}

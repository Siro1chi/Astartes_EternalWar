// ============================================
// СИСТЕМА НАВЫКОВ (PASSIVE SKILLS)
// ============================================

import { PASSIVE_SKILLS } from './skillsData.js';

// ============================================
// Класс Skill — представляет один навык
// ============================================
export class Skill {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.desc = data.desc;
        this.icon = data.icon;
        this.maxStacks = data.maxStacks || 1;
        this.stacks = 0;
        this.applyFn = data.apply;
    }

    apply(player) {
        this.stacks++;
        this.applyFn(player, this.stacks);
    }

    canUpgrade() {
        return this.stacks < this.maxStacks;
    }
}

// ============================================
// SkillSystem — управляет всеми навыками игрока
// ============================================
export class SkillSystem {
    constructor() {
        this.skills = new Map(); // Map<skillId, Skill>
    }

    addSkill(skillId) {
        const data = PASSIVE_SKILLS.find(s => s.id === skillId);
        if (!data) {
            console.warn(`Skill ${skillId} not found`);
            return null;
        }

        if (!this.skills.has(skillId)) {
            this.skills.set(skillId, new Skill(data));
        }

        const skill = this.skills.get(skillId);
        if (skill.canUpgrade()) {
            skill.apply(window.gameManager?.player);
            return skill;
        }

        return null; // Максимальный уровень
    }

    hasSkill(skillId) {
        return this.skills.has(skillId);
    }

    getSkill(skillId) {
        return this.skills.get(skillId);
    }

    getSkillLevel(skillId) {
        const skill = this.skills.get(skillId);
        return skill ? skill.stacks : 0;
    }

    // Получить случайные навыки для выбора (3 штуки)
    getRandomOptions() {
        const available = PASSIVE_SKILLS.filter(s => {
            const existing = this.skills.get(s.id);
            return !existing || existing.canUpgrade();
        });

        // Перемешать и взять 3
        available.sort(() => Math.random() - 0.5);
        
        return available.slice(0, 3).map(data => ({
            type: 'skill',
            skillId: data.id,
            name: data.name,
            desc: data.desc,
            icon: data.icon,
            action: () => this.addSkill(data.id)
        }));
    }

    // Получить все доступные опции улучшений (навыки + оружие)
    getAllUpgradeOptions() {
        const skillOptions = this.getRandomOptions();
        return skillOptions;
    }

    reset() {
        this.skills.clear();
    }
}

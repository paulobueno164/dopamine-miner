import { Skills } from '../config/Skills.js';

export class SkillSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.cooldowns = {}; // id -> remaining time
        this.activeBuffs = {}; // id -> remaining time
        this.gameRef = null; // Need access to game state for effects
    }

    setGame(game) {
        this.gameRef = game;
    }

    activate(skillId) {
        // Validation
        if (this.getCooldown(skillId) > 0) {
            this.eventBus.emit('system_message', { text: "MODULE COOLDOWN", type: 'error' });
            return false;
        }

        const skill = Skills.find(s => s.id === skillId);
        if (!skill) return false;

        // Apply
        if (skill.type === 'instant') {
            skill.effect(this.gameRef);
        } else if (skill.type === 'buff') {
            this.activeBuffs[skillId] = skill.duration;
            skill.effect(this.gameRef); // Trigger start message/effect
        }

        // Set Cooldown
        this.cooldowns[skillId] = skill.cooldown;

        // Notify UI
        this.eventBus.emit('skill_activated', skillId);
        return true;
    }

    update(dt) {
        // Cooldowns
        for (let id in this.cooldowns) {
            if (this.cooldowns[id] > 0) {
                this.cooldowns[id] -= dt;
                if (this.cooldowns[id] < 0) this.cooldowns[id] = 0;
            }
        }

        // Active Buffs
        for (let id in this.activeBuffs) {
            if (this.activeBuffs[id] > 0) {
                this.activeBuffs[id] -= dt;
                if (this.activeBuffs[id] <= 0) {
                    this.activeBuffs[id] = 0;
                    this.eventBus.emit('system_message', { text: `BUFF EXPIRED: ${id}`, type: 'warning' });
                }
            }
        }
    }

    getCooldown(id) {
        return this.cooldowns[id] || 0;
    }

    isBuffActive(id) {
        return (this.activeBuffs[id] || 0) > 0;
    }

    // Helper for ProgressionSystem to check global buffs
    getGlobalMultiplier() {
        let mult = 1.0;
        if (this.isBuffActive('overclock')) mult *= 2.0;
        return mult;
    }

    serialize() {
        return {
            cooldowns: this.cooldowns
        };
    }

    deserialize(data) {
        if (!data) return;
        this.cooldowns = data.cooldowns || {};
    }
}

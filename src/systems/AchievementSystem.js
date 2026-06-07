import { Achievements } from '../config/Achievements.js';

export class AchievementSystem {
    constructor(eventBus, economy, loot, progression) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.loot = loot;
        this.progression = progression;

        this.stats = {
            clicks: 0,
            totalItems: 0,
            ascensions: 0,
            fusionFailures: 0,
            playtime: 0,
            hacks: 0,
            logsRead: 0
        };

        this.unlocked = []; // List of IDs
    }

    update(dt) {
        this.stats.playtime += dt;
        // Check achievements periodically? Or event based?
        // Let's check on significant events via check() method
    }

    trackEvent(type, data) {
        switch (type) {
            case 'click': this.stats.clicks++; break;
            case 'item_gain': this.stats.totalItems++; break;
            case 'ascend': this.stats.ascensions++; break;
            case 'fusion_fail': this.stats.fusionFailures++; break;
            case 'hack': this.stats.hacks++; break;
            case 'lore_read': this.stats.logsRead++; break;
        }
        this.check();
    }

    check() {
        Achievements.forEach(ach => {
            if (this.unlocked.includes(ach.id)) return;

            if (ach.condition(this.stats)) {
                this.unlock(ach);
            }
        });
    }

    unlock(ach) {
        this.unlocked.push(ach.id);
        this.applyReward(ach, false);
    }

    applyReward(ach, silent = false) {
        // Apply Reward
        if (ach.reward.type === 'gems') {
            if (!silent) {
                this.economy.premium += ach.reward.value;
                this.eventBus.emit('premium_update', this.economy.premium);
            }
        } else if (ach.reward.type === 'luck') {
            this.loot.boostLuck(ach.reward.value);
        } else if (ach.reward.type === 'auto_dps_mult') {
            if (this.progression) {
                if (this.progression.multipliers.achievementMult === undefined) this.progression.multipliers.achievementMult = 1.0;
                this.progression.multipliers.achievementMult += ach.reward.value;
            }
            if (!silent) this.eventBus.emit('system_message', { text: "OS OPTIMIZED: +10% EFFICIENCY", type: 'success' });
        }

        if (!silent) {
            this.eventBus.emit('achievement_unlocked', ach);
            this.eventBus.emit('system_message', { text: `ACHIEVEMENT: ${ach.name}`, type: 'success' });
        }
    }

    serialize() {
        return {
            stats: this.stats,
            unlocked: this.unlocked
        };
    }

    deserialize(data) {
        if (!data) return;
        this.stats = data.stats || this.stats;
        this.unlocked = data.unlocked || [];

        // Re-apply rewards
        this.unlocked.forEach(id => {
            const ach = Achievements.find(a => a.id === id);
            if (ach) this.applyReward(ach, true);
        });
    }
}

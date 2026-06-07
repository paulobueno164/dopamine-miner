import { ChallengesConfig } from '../config/Challenges.js';

export class ChallengeSystem {
    constructor(eventBus, economy, progression, enemies, psychology) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        this.enemies = enemies;
        this.psychology = psychology;

        this.activeChallengeId = null;
        this.completedChallenges = [];
        this.rewards = {}; // Accumulate passive buffs
    }

    startChallenge(id) {
        if (this.activeChallengeId) return false;

        // Challenges require a "Soft Reset" usually.
        // For prototype simplicity, we will force a Prestige-like reset WITHOUT void matter gain.
        this.eventBus.emit('challenge_started', { id });

        this.activeChallengeId = id;

        // Trigger Reset
        this.economy.entropy = 0;
        this.progression.reset();
        this.enemies.level = 1;
        this.enemies.spawn();

        // Initial setup for specific challenges
        this.applyConstraints();

        return true;
    }

    abandonChallenge() {
        if (!this.activeChallengeId) return;
        this.activeChallengeId = null;
        // Reset again to clear constraints
        this.economy.entropy = 0;
        this.progression.reset();
        this.enemies.level = 1;
        this.enemies.spawn();
        this.eventBus.emit('system_message', { text: "CHALLENGE ABORTED", type: 'error' });
    }

    checkCompletion() {
        if (!this.activeChallengeId) return;

        const config = ChallengesConfig.find(c => c.id === this.activeChallengeId);
        let completed = false;

        if (config.goalType === 'level' && this.enemies.level >= config.goalValue) completed = true;
        if (config.goalType === 'entropy' && this.economy.entropy >= config.goalValue) completed = true;

        if (completed) {
            this.completeChallenge(config);
        }
    }

    completeChallenge(config) {
        this.completedChallenges.push(config.id);
        this.activeChallengeId = null;

        // Grant Reward
        this.eventBus.emit('system_message', { text: `CHALLENGE COMPLETE: ${config.name}`, type: 'success' });
        this.eventBus.emit('challenge_completed', config);

        // We usually don't reset immediately on complete, allowing user to bask in glory
        // But to return to "Normal Mode" they probably need to reset or button click.
        // For now, let's just clear the active flag so constraints lift immediately.
    }

    // Called by other systems to check modifiers
    getModifier(type) {
        if (!this.activeChallengeId) return 1.0;

        switch (this.activeChallengeId) {
            case 'manual_labor':
                if (type === 'auto_dps') return 0;
                if (type === 'click_damage') return 2.0;
                break;
            case 'stability_test':
                if (type === 'stability_decay') return 3.0;
                break;
            case 'poverty':
                if (type === 'entropy_gain') return 0.1;
                if (type === 'upgrade_cost') return 0.5;
                break;
        }
        return 1.0;
    }

    // Check global bonuses from completed challenges
    getGlobalBuffs() {
        // ... Logic to sum up completed rewards
        // This needs to be hooked into Progression
    }

    serialize() {
        return {
            completed: this.completedChallenges,
            active: this.activeChallengeId
        };
    }

    deserialize(data) {
        if (!data) return;
        this.completedChallenges = data.completed || [];
        this.activeChallengeId = data.active || null;
    }
}

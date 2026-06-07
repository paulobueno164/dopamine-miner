/**
 * Handles the exponential scaling and big number logic.
 * Designed to ensure the player hits "Soft Walls" regularly.
 */
export class EconomySystem {
    constructor() {
        this.entropy = 0; // Primary Currency
        this.premium = 0; // P2W Currency
        this.lifetimeEntropy = 0;
        this.prestigeMultiplier = 1.0;
        this.rewardMultiplier = 1.0;
        this.settings = null;
    }

    setSettings(settingsSystem) {
        this.settings = settingsSystem;
    }

    setChallengeSystem(challenges) {
        this.challenges = challenges;
    }

    setDroneSystem(drones) {
        this.drones = drones;
    }

    // ... (rest is same)

    formatNumber(num) {
        if (this.settings && this.settings.get('numberNotation') === 'scientific' && num > 1e6) {
            return num.toExponential(2);
        }

        // Standard (Fallback)
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
        return Math.floor(num).toString();
    }

    addEntropy(amount) {
        let effectiveAmount = amount * this.prestigeMultiplier * this.rewardMultiplier;

        if (this.challenges) {
            effectiveAmount *= this.challenges.getModifier('entropy_gain');
        }

        if (this.drones) {
            effectiveAmount *= (1 + this.drones.getBonuses().entropy_mult);
        }

        this.entropy += effectiveAmount;
        this.lifetimeEntropy += effectiveAmount;
        return effectiveAmount;
    }

    setRewardMultiplier(multiplier) {
        this.rewardMultiplier = multiplier;
    }

    spendEntropy(amount) {
        if (this.entropy >= amount) {
            this.entropy -= amount;
            return true;
        }
        return false;
    }

    // Standard exponential cost formula: Base * (Growth ^ Count)
    calculateCost(base, growth, count) {
        let cost = Math.floor(base * Math.pow(growth, count));

        if (this.challenges) {
            cost *= this.challenges.getModifier('upgrade_cost');
        }

        return Math.floor(cost);
    }

    // formatNumber removed (duplicate)

    serialize() {
        return {
            entropy: this.entropy,
            lifetime: this.lifetimeEntropy
        };
    }

    deserialize(data) {
        if (!data) return;
        this.entropy = data.entropy || 0;
        this.lifetimeEntropy = data.lifetime || 0;
    }
}

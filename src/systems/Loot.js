import { GameConfig } from '../config/GameConfig.js';

/**
 * SKINNER BOX IMPLEMENTATION (Variable Ratio)
 * 
 * Outcome is uncertain. Timing is uncertain.
 * This system decides purely WHAT drops, not WHEN (that's the click/kill trigger).
 */
export class LootSystem {
    constructor() {
        this.config = GameConfig.loot;
        this.luckMultiplier = 1.0;
    }

    boostLuck(amount) {
        this.luckMultiplier += amount;
    }

    rollForLoot() {
        // First check: Do we get anything at all?
        if (Math.random() > (this.config.baseDropChance * this.luckMultiplier)) {
            return null; // Frustration. "One more click..."
        }

        // We got a drop. Now determing rarity (Weighted Random).
        // Luck affects the roll slightly by shifting the random number? 
        // For now, let's just use raw randomness but maybe luck helps avoid "Common" later.
        const rand = Math.random() * 1000;
        let cumulative = 0;

        // Check Mythic
        if (rand < this.config.rarityWeights.mythic) return { type: 'MYTHIC', value: 1000, color: '#ffaa00' };

        // Check Legendary
        if (rand < this.config.rarityWeights.legendary) return { type: 'LEGENDARY', value: 500, color: '#bd00ff' };

        // Check Rare
        if (rand < this.config.rarityWeights.rare) return { type: 'RARE', value: 100, color: '#00aaff' };

        // Check Uncommon
        if (rand < this.config.rarityWeights.uncommon) return { type: 'UNCOMMON', value: 25, color: '#00ff9d' };

        // Common fallback
        return { type: 'COMMON', value: 5, color: '#ffffff' };
    }
}

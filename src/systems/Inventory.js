import { GameConfig } from '../config/GameConfig.js';

export class InventorySystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.items = {
            COMMON: 0,
            UNCOMMON: 0,
            RARE: 0,
            LEGENDARY: 0,
            MYTHIC: 0
        };

        this.fusionRates = {
            COMMON: { target: 'UNCOMMON', cost: 5, chance: 0.8 }, // 80% success
            UNCOMMON: { target: 'RARE', cost: 4, chance: 0.6 },   // 60% success
            RARE: { target: 'LEGENDARY', cost: 3, chance: 0.4 },  // 40% success
            LEGENDARY: { target: 'MYTHIC', cost: 2, chance: 0.1 } // 10% success (Huge choke point)
        };

        // Passive Effects provided by simply holding the matter
        this.itemBonuses = {
            COMMON: { stat: 'click_damage_pct', val: 0.01, desc: '+1% Click Power' },
            UNCOMMON: { stat: 'auto_dps_pct', val: 0.02, desc: '+2% Auto Efficiency' },
            RARE: { stat: 'luck_flat', val: 0.05, desc: '+0.05 Luck' },
            LEGENDARY: { stat: 'global_mult', val: 0.10, desc: '+10% PRODUCTION' },
            MYTHIC: { stat: 'global_mult', val: 0.50, desc: '+50% REALITY BENDING' }
        };
    }

    addItem(rarity) {
        if (!this.items[rarity] && this.items[rarity] !== 0) return;
        this.items[rarity]++;
        this.eventBus.emit('inventory_updated', this.items);
    }

    canFuse(currentRarity) {
        const recipe = this.fusionRates[currentRarity];
        if (!recipe) return false;
        return this.items[currentRarity] >= recipe.cost;
    }

    // THE GAMBLE
    fuse(currentRarity) {
        const recipe = this.fusionRates[currentRarity];
        if (!this.canFuse(currentRarity)) return { success: false, reason: 'cost' };

        // Pay the cost immediately (Sunk Cost)
        this.items[currentRarity] -= recipe.cost;

        // Roll
        const success = Math.random() < recipe.chance;

        if (success) {
            this.items[recipe.target]++;
            this.eventBus.emit('system_message', {
                text: `FUSION SUCCESS: OBTAINED ${recipe.target}`,
                type: 'success'
            });
        } else {
            // FAILURE - The items are gone.
            this.eventBus.emit('system_message', {
                text: `FUSION FAILED: MATTER DESTABILIZED`,
                type: 'error'
            });
            this.eventBus.emit('fusion_fail'); // For extra visual punishment
        }

        this.eventBus.emit('inventory_updated', this.items);
        return { success, target: recipe.target };
    }

    getBonuses() {
        const bonuses = {
            click_damage_pct: 0,
            auto_dps_pct: 0,
            luck_flat: 0,
            global_mult: 0
        };

        Object.keys(this.items).forEach(rarity => {
            const count = this.items[rarity];
            if (count > 0 && this.itemBonuses[rarity]) {
                const bonus = this.itemBonuses[rarity];
                bonuses[bonus.stat] += (bonus.val * count);
            }
        });

        return bonuses;
    }

    serialize() {
        return {
            items: this.items
        };
    }

    deserialize(data) {
        if (!data) return;
        this.items = data.items || this.items;
        this.eventBus.emit('inventory_updated', this.items);
    }
}

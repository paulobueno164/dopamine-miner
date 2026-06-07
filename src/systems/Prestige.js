import { GameConfig } from '../config/GameConfig.js';

export class PrestigeSystem {
    constructor(economy, inventory, progression, eventBus) {
        this.economy = economy;
        this.inventory = inventory; // Inventory persists
        this.progression = progression;
        this.eventBus = eventBus;

        this.voidMatter = 0; // The Prestige Currency
        this.ascensionCount = 0;
        this.advancedMultiplier = 1.0;
    }

    canAscend() {
        return this.economy.lifetimeEntropy >= 10000; // 10k Entropy required (Prototype Balance)
    }

    calculateVoidMatterGain() {
        if (this.economy.lifetimeEntropy < 10000) return 0;
        // Improved scaling formula
        const base = Math.floor(Math.sqrt(this.economy.lifetimeEntropy / 1000));
        const bonus = Math.floor(this.ascensionCount * 0.1); // Small bonus per previous ascension
        return base + bonus;
    }
    
    getAscensionInfo() {
        const gain = this.calculateVoidMatterGain();
        const newMultiplier = 1 + ((this.voidMatter + gain) * 0.1);
        return {
            canAscend: this.canAscend(),
            voidMatterGain: gain,
            currentVoidMatter: this.voidMatter,
            newVoidMatter: this.voidMatter + gain,
            currentMultiplier: this.economy.prestigeMultiplier,
            newMultiplier: newMultiplier,
            multiplierIncrease: newMultiplier - this.economy.prestigeMultiplier
        };
    }

    ascend() {
        if (!this.canAscend()) return false;

        const gain = this.calculateVoidMatterGain();
        this.voidMatter += gain;
        this.ascensionCount++;

        // PERSISTENCE CHECK: What do we keep?
        // We keep: Inventory, Achievements, Void Matter.
        // We lose: Entropy, Current Upgrades (Progression resets).

        // Check Prestige Tree Buffs (via accessing global game or passing tree? Tree depends on Main... circular.
        // We can just check via event but that's async.
        // Better: PrestigeSystem does not know about Tree directly in our current architecture.
        // BUT Main injects Tree. We can manually set a flag in PrestigeSystem or pass tree.
        // Let's rely on Main to handle 'ascension_performed' event to REFUND the entropy?
        // OR, just modify Economy directly here if we had access to Tree.
        // Since we don't have access, let's set it to 0. 
        // Main.js listener will Bump it if node exists. That's cleaner.

        this.economy.entropy = 0;
        this.economy.lifetimeEntropy = 0;

        // Reset Upgrades
        this.progression.reset();

        // Buff Global Multiplier
        this.economy.prestigeMultiplier = (1 + (this.voidMatter * 0.1)) * this.advancedMultiplier; // 10% bonus per Void Matter

        this.eventBus.emit('system_message', {
            text: `ASCENSION COMPLETE. REALITY REWRITTEN. +${gain} VOID MATTER.`,
            type: 'success'
        });

        this.eventBus.emit('ascension_performed', {
            totalMatter: this.voidMatter,
            newMultiplier: this.economy.prestigeMultiplier
        });

        return true;
    }

    serialize() {
        return {
            voidMatter: this.voidMatter,
            count: this.ascensionCount
        };
    }

    deserialize(data) {
        if (!data) return;
        this.voidMatter = data.voidMatter || 0;
        this.ascensionCount = data.count || 0;
        // Apply multiplier on load
        this.economy.prestigeMultiplier = (1 + (this.voidMatter * 0.1)) * (this.advancedMultiplier || 1.0);
    }

    setAdvancedMultiplier(multiplier) {
        this.advancedMultiplier = multiplier;
        // Update current multiplier
        this.economy.prestigeMultiplier = (1 + (this.voidMatter * 0.1)) * multiplier;
    }
}

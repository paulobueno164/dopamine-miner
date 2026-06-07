import { Upgrades } from '../config/Upgrades.js';
import { GameConfig } from '../config/GameConfig.js';

export class ProgressionSystem {
    constructor(economy, psychology, lootSystem, inventorySystem, eventBus) {
        this.economy = economy;
        this.psychology = psychology; // To buff stability
        this.lootSystem = lootSystem; // To buff luck
        this.inventorySystem = inventorySystem; // For equipment bonuses
        this.eventBus = eventBus;

        this.ownedUpgrades = {}; // id -> count
        this.damageMultiplier = 1; // Initialize damage multiplier
        this.defenseMultiplier = 1; // Initialize defense multiplier
        this.multipliers = {
            autoDamage: 0,
            clickDamage: 1,
            luck: 1.0,
            stabilityProtection: 1.0,
            achievementMult: 1.0
        };
    }

    getUpgradeCost(upgradeId) {
        const def = Upgrades.find(u => u.id === upgradeId);
        const count = this.ownedUpgrades[upgradeId] || 0;
        return this.economy.calculateCost(def.baseCost, def.costScaling, count);
    }

    buyUpgrade(upgradeId) {
        const cost = this.getUpgradeCost(upgradeId);

        // 1. Pay
        if (!this.economy.spendEntropy(cost)) {
            this.eventBus.emit('system_message', { text: "INSUFFICIENT ENTROPY", type: 'error' });
            return false;
        }

        // 2. Increment
        if (!this.ownedUpgrades[upgradeId]) this.ownedUpgrades[upgradeId] = 0;
        this.ownedUpgrades[upgradeId]++;

        // 3. Apply Effects (The "Build" Logic)
        this.applyUpgradeEffect(upgradeId);

        this.eventBus.emit('upgrade_purchased', { id: upgradeId, count: this.ownedUpgrades[upgradeId] });
        return true;
    }

    applyUpgradeEffect(id) {
        // Hardcoded mapping for now - in a real engine this would be data-driven
        switch (id) {
            case 'auto_miner_v1':
                this.multipliers.autoDamage += 5;
                break;
            case 'lucky_charm':
                this.multipliers.luck += 0.1;
                this.lootSystem.boostLuck(0.1);
                break;
            case 'loss_buffer':
                // Reduces decay by 10% compounding
                this.psychology.buffStabilityResistance(0.1);
                break;
        }
    }

    setSkillSystem(skillSystem) {
        this.skillSystem = skillSystem;
    }

    setTreeSystem(tree) {
        this.tree = tree;
    }

    setChallengeSystem(challenges) {
        this.challenges = challenges;
    }

    setDroneSystem(drones) {
        this.drones = drones;
    }

    getAutoDps() {
        let dps = this.multipliers.autoDamage * this.damageMultiplier;

        // Apply Achievement Multiplier
        dps = dps * this.multipliers.achievementMult;

        // Apply Drone Bonuses
        if (this.drones) {
            const droneBonuses = this.drones.getBonuses();
            dps = dps * (1 + droneBonuses.auto_dps);
        }

        // Apply Inventory Bonuses
        const bonuses = this.inventorySystem.getBonuses();
        dps = dps * (1 + bonuses.auto_dps_pct);

        // Global Multiplier (Legendary/Mythic + Prestige)
        dps = dps * (1 + bonuses.global_mult);

        // Active Skills Multiplier
        if (this.skillSystem) {
            dps = dps * this.skillSystem.getGlobalMultiplier();
        }

        if (this.tree && this.tree.hasNode('click_overflow')) {
            const clickDmg = this.getClickDamage();
            dps += (clickDmg * 0.1);
        }

        if (this.challenges) {
            dps *= this.challenges.getModifier('auto_dps');
        }

        return dps;
    }

    getLuck() {
        let luck = this.multipliers.luck;
        if (this.drones) {
            luck += this.drones.getBonuses().luck;
        }
        return luck;
    }

    setDamageMultiplier(multiplier) {
        this.damageMultiplier = multiplier;
    }

    setDefenseMultiplier(multiplier) {
        this.defenseMultiplier = multiplier;
    }

    getClickDamage() {
        let dmg = this.multipliers.clickDamage * this.damageMultiplier;
        const bonuses = this.inventorySystem.getBonuses();
        dmg = dmg * (1 + bonuses.click_damage_pct);
        dmg = dmg * (1 + bonuses.global_mult);

        if (this.challenges) {
            dmg *= this.challenges.getModifier('click_damage');
        }

        return Math.floor(dmg);
    }

    reset() {
        this.ownedUpgrades = {};
        this.damageMultiplier = 1; // Reset damage multiplier
        this.defenseMultiplier = 1; // Reset defense multiplier
        this.multipliers = {
            autoDamage: 0,
            clickDamage: 1,
            luck: 1.0,
            stabilityProtection: 1.0,
            achievementMult: 1.0
        };
    }

    serialize() {
        return {
            owned: this.ownedUpgrades
        };
    }

    deserialize(data) {
        if (!data) return;
        this.ownedUpgrades = data.owned || {};
        // Re-apply all effects
        for (let [id, count] of Object.entries(this.ownedUpgrades)) {
            for (let i = 0; i < count; i++) this.applyUpgradeEffect(id);
        }
    }
}

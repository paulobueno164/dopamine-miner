/**
 * MOD SYSTEM - Customizable Modifiers
 * 
 * Allows players to customize game mechanics.
 * Creates personal investment and replayability.
 */

export class ModSystem {
    constructor(eventBus, economy) {
        this.eventBus = eventBus;
        this.economy = economy;
        
        this.availableMods = [
            {
                id: 'fast_click',
                name: 'FAST CLICK',
                description: '+50% Click Speed, -20% Click Damage',
                cost: 1000,
                effect: {
                    clickSpeed: 1.5,
                    clickDamage: 0.8
                },
                category: 'combat'
            },
            {
                id: 'power_click',
                name: 'POWER CLICK',
                description: '+100% Click Damage, -30% Click Speed',
                cost: 1500,
                effect: {
                    clickSpeed: 0.7,
                    clickDamage: 2.0
                },
                category: 'combat'
            },
            {
                id: 'lucky_strike',
                name: 'LUCKY STRIKE',
                description: '+25% Crit Chance, -10% Base Damage',
                cost: 2000,
                effect: {
                    critChance: 0.25,
                    baseDamage: 0.9
                },
                category: 'combat'
            },
            {
                id: 'entropy_boost',
                name: 'ENTROPY BOOST',
                description: '+30% Entropy Gain, -15% Auto-DPS',
                cost: 2500,
                effect: {
                    entropyGain: 1.3,
                    autoDps: 0.85
                },
                category: 'economy'
            },
            {
                id: 'auto_focus',
                name: 'AUTO FOCUS',
                description: '+40% Auto-DPS, -20% Entropy Gain',
                cost: 3000,
                effect: {
                    autoDps: 1.4,
                    entropyGain: 0.8
                },
                category: 'economy'
            },
            {
                id: 'stability_plus',
                name: 'STABILITY PLUS',
                description: '-50% Stability Decay, -25% Kill Rewards',
                cost: 2000,
                effect: {
                    stabilityDecay: 0.5,
                    killRewards: 0.75
                },
                category: 'defense'
            },
            {
                id: 'loot_magnet',
                name: 'LOOT MAGNET',
                description: '+50% Loot Chance, -30% Loot Quality',
                cost: 3500,
                effect: {
                    lootChance: 1.5,
                    lootQuality: 0.7
                },
                category: 'loot'
            }
        ];
        
        this.activeMods = [];
        this.modSlots = 3; // Max 3 mods active at once
    }

    canEquip(modId) {
        const mod = this.availableMods.find(m => m.id === modId);
        if (!mod) return false;
        
        // Check if already equipped
        if (this.activeMods.includes(modId)) return false;
        
        // Check slots
        if (this.activeMods.length >= this.modSlots) return false;
        
        // Check cost (one-time purchase)
        if (this.economy.entropy < mod.cost) return false;
        
        return true;
    }

    equip(modId) {
        if (!this.canEquip(modId)) {
            this.eventBus.emit('system_message', {
                text: 'CANNOT EQUIP MOD',
                type: 'error'
            });
            return false;
        }
        
        const mod = this.availableMods.find(m => m.id === modId);
        this.economy.spendEntropy(mod.cost);
        this.activeMods.push(modId);
        
        this.eventBus.emit('mod_equipped', mod);
        this.eventBus.emit('mod_effect_applied', mod.effect);
        this.eventBus.emit('system_message', {
            text: `MOD EQUIPPED: ${mod.name}`,
            type: 'success'
        });
        
        return true;
    }

    unequip(modId) {
        const index = this.activeMods.indexOf(modId);
        if (index === -1) return false;
        
        const mod = this.availableMods.find(m => m.id === modId);
        this.activeMods.splice(index, 1);
        
        this.eventBus.emit('mod_unequipped', mod);
        this.eventBus.emit('mod_effect_removed', mod.effect);
        
        return true;
    }

    getActiveMods() {
        return this.activeMods.map(id => this.availableMods.find(m => m.id === id)).filter(m => m);
    }

    getActiveEffects() {
        const effects = {};
        this.getActiveMods().forEach(mod => {
            Object.keys(mod.effect).forEach(key => {
                if (!effects[key]) effects[key] = 1.0;
                effects[key] *= mod.effect[key];
            });
        });
        return effects;
    }

    getAvailableMods() {
        return this.availableMods.filter(m => !this.activeMods.includes(m.id));
    }

    serialize() {
        return {
            activeMods: this.activeMods,
            modSlots: this.modSlots
        };
    }

    deserialize(data) {
        if (data) {
            this.activeMods = data.activeMods || [];
            this.modSlots = data.modSlots || 3;
            
            // Re-apply effects
            this.getActiveMods().forEach(mod => {
                this.eventBus.emit('mod_effect_applied', mod.effect);
            });
        }
    }
}



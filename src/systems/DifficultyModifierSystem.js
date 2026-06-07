/**
 * DIFFICULTY MODIFIER SYSTEM - Challenge Modes
 * 
 * Allows players to increase difficulty for better rewards.
 * Creates risk/reward mechanics.
 */

export class DifficultyModifierSystem {
    constructor(eventBus, economy, progression, enemies) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        this.enemies = enemies;
        
        this.activeModifiers = [];
        this.availableModifiers = [
            {
                id: 'hardcore',
                name: 'HARDCORE',
                description: 'Enemies have 2x HP, 2x rewards',
                icon: '💀',
                enemyHpMultiplier: 2.0,
                rewardMultiplier: 2.0,
                cost: 0
            },
            {
                id: 'nightmare',
                name: 'NIGHTMARE',
                description: 'Enemies have 5x HP, 5x rewards',
                icon: '😈',
                enemyHpMultiplier: 5.0,
                rewardMultiplier: 5.0,
                cost: 1000
            },
            {
                id: 'hell',
                name: 'HELL',
                description: 'Enemies have 10x HP, 10x rewards',
                icon: '🔥',
                enemyHpMultiplier: 10.0,
                rewardMultiplier: 10.0,
                cost: 10000
            },
            {
                id: 'frenzy',
                name: 'FRENZY',
                description: 'Enemies spawn 2x faster, 1.5x rewards',
                icon: '⚡',
                enemyHpMultiplier: 1.0,
                rewardMultiplier: 1.5,
                spawnRateMultiplier: 2.0,
                cost: 5000
            },
            {
                id: 'glass_cannon',
                name: 'GLASS CANNON',
                description: 'Take 2x damage, deal 3x damage',
                icon: '💎',
                playerDamageMultiplier: 3.0,
                playerDefenseMultiplier: 0.5,
                rewardMultiplier: 1.5,
                cost: 2000
            }
        ];
    }

    activateModifier(modifierId) {
        const modifier = this.availableModifiers.find(m => m.id === modifierId);
        if (!modifier) return false;
        
        if (this.activeModifiers.find(m => m.id === modifierId)) {
            this.eventBus.emit('system_message', {
                text: 'MODIFIER ALREADY ACTIVE',
                type: 'error'
            });
            return false;
        }
        
        if (this.economy.entropy < modifier.cost) {
            this.eventBus.emit('system_message', {
                text: 'INSUFFICIENT ENTROPY',
                type: 'error'
            });
            return false;
        }
        
        this.economy.spendEntropy(modifier.cost);
        this.activeModifiers.push(modifier);
        
        this.applyModifiers();
        
        this.eventBus.emit('difficulty_modifier_activated', modifier);
        this.eventBus.emit('system_message', {
            text: `${modifier.icon} ${modifier.name} ACTIVATED`,
            type: 'success'
        });
        
        return true;
    }

    deactivateModifier(modifierId) {
        const index = this.activeModifiers.findIndex(m => m.id === modifierId);
        if (index === -1) return false;
        
        const modifier = this.activeModifiers[index];
        this.activeModifiers.splice(index, 1);
        
        this.applyModifiers();
        
        this.eventBus.emit('difficulty_modifier_deactivated', modifier);
        this.eventBus.emit('system_message', {
            text: `${modifier.icon} ${modifier.name} DEACTIVATED`,
            type: 'info'
        });
        
        return true;
    }

    applyModifiers() {
        // Calculate combined multipliers
        let enemyHpMultiplier = 1.0;
        let rewardMultiplier = 1.0;
        let playerDamageMultiplier = 1.0;
        let playerDefenseMultiplier = 1.0;
        let spawnRateMultiplier = 1.0;
        
        this.activeModifiers.forEach(modifier => {
            enemyHpMultiplier *= (modifier.enemyHpMultiplier || 1.0);
            rewardMultiplier *= (modifier.rewardMultiplier || 1.0);
            playerDamageMultiplier *= (modifier.playerDamageMultiplier || 1.0);
            playerDefenseMultiplier *= (modifier.playerDefenseMultiplier || 1.0);
            spawnRateMultiplier *= (modifier.spawnRateMultiplier || 1.0);
        });
        
        // Apply to systems
        this.enemies.setDifficultyMultiplier(enemyHpMultiplier);
        this.economy.setRewardMultiplier(rewardMultiplier);
        this.progression.setDamageMultiplier(playerDamageMultiplier);
        this.progression.setDefenseMultiplier(playerDefenseMultiplier);
        this.enemies.setSpawnRateMultiplier(spawnRateMultiplier);
        
        this.eventBus.emit('difficulty_modifiers_updated', {
            enemyHpMultiplier,
            rewardMultiplier,
            playerDamageMultiplier,
            playerDefenseMultiplier,
            spawnRateMultiplier
        });
    }

    getActiveModifiers() {
        return this.activeModifiers;
    }

    getAvailableModifiers() {
        return this.availableModifiers;
    }

    getTotalRewardMultiplier() {
        let multiplier = 1.0;
        this.activeModifiers.forEach(modifier => {
            multiplier *= (modifier.rewardMultiplier || 1.0);
        });
        return multiplier;
    }

    serialize() {
        return {
            activeModifiers: this.activeModifiers.map(m => m.id)
        };
    }

    deserialize(data) {
        if (data && data.activeModifiers) {
            this.activeModifiers = [];
            data.activeModifiers.forEach(modifierId => {
                const modifier = this.availableModifiers.find(m => m.id === modifierId);
                if (modifier) {
                    this.activeModifiers.push(modifier);
                }
            });
            
            this.applyModifiers();
        }
    }
}



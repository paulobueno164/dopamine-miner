/**
 * RESEARCH SYSTEM - Long-term Progression Tree
 * 
 * Provides permanent upgrades through research points.
 * Creates long-term goals and investment.
 */

export class ResearchSystem {
    constructor(eventBus, economy, progression) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        
        this.researchPoints = 0;
        this.unlockedResearches = [];
        this.researchQueue = [];
        
        this.researchTree = [
            {
                id: 'entropy_efficiency',
                name: 'ENTROPY EFFICIENCY',
                description: '+10% Entropy gain from all sources',
                cost: 100,
                category: 'economy',
                requirements: [],
                effect: { type: 'multiplier', stat: 'entropy_gain', value: 1.1 }
            },
            {
                id: 'auto_miner_boost',
                name: 'AUTO-MINER OPTIMIZATION',
                description: '+25% Auto-DPS',
                cost: 150,
                category: 'automation',
                requirements: [],
                effect: { type: 'multiplier', stat: 'auto_dps', value: 1.25 }
            },
            {
                id: 'click_power',
                name: 'MANUAL OVERRIDE BOOST',
                description: '+50% Click damage',
                cost: 200,
                category: 'combat',
                requirements: [],
                effect: { type: 'multiplier', stat: 'click_damage', value: 1.5 }
            },
            {
                id: 'loot_magnet',
                name: 'LOOT MAGNET',
                description: '+20% Loot drop chance',
                cost: 250,
                category: 'loot',
                requirements: ['entropy_efficiency'],
                effect: { type: 'multiplier', stat: 'loot_chance', value: 1.2 }
            },
            {
                id: 'stability_core',
                name: 'STABILITY CORE',
                description: '-30% Stability decay rate',
                cost: 300,
                category: 'defense',
                requirements: ['entropy_efficiency'],
                effect: { type: 'multiplier', stat: 'stability_decay', value: 0.7 }
            },
            {
                id: 'critical_strike',
                name: 'CRITICAL STRIKE',
                description: '10% chance for 3x damage',
                cost: 400,
                category: 'combat',
                requirements: ['click_power'],
                effect: { type: 'bonus', stat: 'crit_chance', value: 0.1, crit_mult: 3.0 }
            },
            {
                id: 'prestige_bonus',
                name: 'VOID EFFICIENCY',
                description: '+25% Void Matter gain on Prestige',
                cost: 500,
                category: 'prestige',
                requirements: ['stability_core'],
                effect: { type: 'multiplier', stat: 'void_matter_gain', value: 1.25 }
            },
            {
                id: 'combo_master',
                name: 'COMBO MASTER',
                description: 'Combo decay 50% slower',
                cost: 350,
                category: 'combat',
                requirements: ['click_power'],
                effect: { type: 'multiplier', stat: 'combo_decay', value: 0.5 }
            },
            {
                id: 'energy_efficiency',
                name: 'ENERGY EFFICIENCY',
                description: 'Skills cost 30% less energy',
                cost: 300,
                category: 'skills',
                requirements: ['auto_miner_boost'],
                effect: { type: 'multiplier', stat: 'skill_cost', value: 0.7 }
            },
            {
                id: 'drone_synergy',
                name: 'DRONE SYNERGY',
                description: 'Drones provide +50% bonus',
                cost: 450,
                category: 'automation',
                requirements: ['auto_miner_boost'],
                effect: { type: 'multiplier', stat: 'drone_bonus', value: 1.5 }
            }
        ];
        
        // Gain research points from prestige
        this.eventBus.on('ascension_performed', () => {
            this.researchPoints += 10; // Base points per prestige
            this.eventBus.emit('research_points_gained', 10);
        });
        
        // Gain from achievements
        this.eventBus.on('achievement_unlocked', () => {
            this.researchPoints += 5;
            this.eventBus.emit('research_points_gained', 5);
        });
    }

    canUnlock(researchId) {
        const research = this.researchTree.find(r => r.id === researchId);
        if (!research) return false;
        
        if (this.unlockedResearches.includes(researchId)) return false;
        if (this.researchPoints < research.cost) return false;
        
        // Check requirements
        for (const req of research.requirements) {
            if (!this.unlockedResearches.includes(req)) {
                return false;
            }
        }
        
        return true;
    }

    unlock(researchId) {
        if (!this.canUnlock(researchId)) {
            return false;
        }
        
        const research = this.researchTree.find(r => r.id === researchId);
        this.researchPoints -= research.cost;
        this.unlockedResearches.push(researchId);
        
        this.eventBus.emit('research_unlocked', research);
        this.eventBus.emit('research_effect_applied', research.effect);
        
        return true;
    }

    getResearchById(id) {
        return this.researchTree.find(r => r.id === id);
    }

    getAvailableResearches() {
        return this.researchTree.filter(r => this.canUnlock(r.id));
    }

    getUnlockedResearches() {
        return this.unlockedResearches.map(id => this.getResearchById(id)).filter(r => r);
    }

    getResearchPoints() {
        return this.researchPoints;
    }

    addResearchPoints(amount) {
        this.researchPoints += amount;
        this.eventBus.emit('research_points_gained', amount);
    }

    getActiveEffects() {
        return this.unlockedResearches
            .map(id => this.getResearchById(id))
            .filter(r => r)
            .map(r => r.effect);
    }

    serialize() {
        return {
            researchPoints: this.researchPoints,
            unlockedResearches: this.unlockedResearches
        };
    }

    deserialize(data) {
        if (data) {
            this.researchPoints = data.researchPoints || 0;
            this.unlockedResearches = data.unlockedResearches || [];
            
            // Re-apply effects
            this.unlockedResearches.forEach(id => {
                const research = this.getResearchById(id);
                if (research) {
                    this.eventBus.emit('research_effect_applied', research.effect);
                }
            });
        }
    }
}



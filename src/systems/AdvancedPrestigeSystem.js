/**
 * ADVANCED PRESTIGE SYSTEM - Multi-Layer Prestige
 * 
 * Adds multiple layers of prestige for long-term progression.
 * Creates exponential progression paths.
 */

export class AdvancedPrestigeSystem {
    constructor(eventBus, economy, prestige) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.prestige = prestige;
        
        this.layers = [
            {
                id: 'alpha',
                name: 'ALPHA PRESTIGE',
                description: 'First layer - Basic multipliers',
                unlocked: true,
                voidMatter: 0,
                multiplier: 1.0
            },
            {
                id: 'beta',
                name: 'BETA PRESTIGE',
                description: 'Second layer - Exponential growth',
                unlocked: false,
                voidMatter: 0,
                multiplier: 1.0,
                requirement: { alpha: 10 } // Requires 10 alpha prestiges
            },
            {
                id: 'gamma',
                name: 'GAMMA PRESTIGE',
                description: 'Third layer - Meta progression',
                unlocked: false,
                voidMatter: 0,
                multiplier: 1.0,
                requirement: { beta: 5 } // Requires 5 beta prestiges
            },
            {
                id: 'omega',
                name: 'OMEGA PRESTIGE',
                description: 'Final layer - Ultimate power',
                unlocked: false,
                voidMatter: 0,
                multiplier: 1.0,
                requirement: { gamma: 3 } // Requires 3 gamma prestiges
            }
        ];
        
        this.prestigeCounts = {
            alpha: 0,
            beta: 0,
            gamma: 0,
            omega: 0
        };
    }

    checkUnlocks() {
        this.layers.forEach(layer => {
            if (!layer.unlocked && layer.requirement) {
                let canUnlock = true;
                
                Object.keys(layer.requirement).forEach(reqLayer => {
                    if (this.prestigeCounts[reqLayer] < layer.requirement[reqLayer]) {
                        canUnlock = false;
                    }
                });
                
                if (canUnlock) {
                    layer.unlocked = true;
                    this.eventBus.emit('prestige_layer_unlocked', layer);
                    this.eventBus.emit('system_message', {
                        text: `${layer.name} UNLOCKED!`,
                        type: 'success'
                    });
                }
            }
        });
    }

    performPrestige(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer || !layer.unlocked) {
            this.eventBus.emit('system_message', {
                text: 'LAYER NOT UNLOCKED',
                type: 'error'
            });
            return false;
        }
        
        // Check if player has enough void matter
        const requiredVM = this.getRequiredVoidMatter(layerId);
        if (this.prestige.voidMatter < requiredVM) {
            this.eventBus.emit('system_message', {
                text: 'INSUFFICIENT VOID MATTER',
                type: 'error'
            });
            return false;
        }
        
        // Perform prestige
        this.prestige.voidMatter -= requiredVM;
        this.prestigeCounts[layerId]++;
        layer.voidMatter += requiredVM;
        
        // Calculate multiplier increase
        const multiplierIncrease = this.getMultiplierIncrease(layerId);
        layer.multiplier *= multiplierIncrease;
        
        // Apply global multiplier
        this.updateGlobalMultiplier();
        
        this.checkUnlocks();
        
        this.eventBus.emit('advanced_prestige_performed', {
            layer,
            count: this.prestigeCounts[layerId],
            multiplier: layer.multiplier
        });
        
        this.eventBus.emit('system_message', {
            text: `${layer.name} COMPLETE! (${this.prestigeCounts[layerId]}x)`,
            type: 'success'
        });
        
        return true;
    }

    getRequiredVoidMatter(layerId) {
        const count = this.prestigeCounts[layerId];
        const baseCosts = {
            alpha: 1,
            beta: 10,
            gamma: 100,
            omega: 1000
        };
        
        const baseCost = baseCosts[layerId] || 1;
        return baseCost * Math.pow(2, count); // Exponential cost
    }

    getMultiplierIncrease(layerId) {
        const multipliers = {
            alpha: 1.1, // 10% per prestige
            beta: 1.2,  // 20% per prestige
            gamma: 1.5, // 50% per prestige
            omega: 2.0   // 100% per prestige
        };
        
        return multipliers[layerId] || 1.0;
    }

    updateGlobalMultiplier() {
        // Combine all layer multipliers
        let totalMultiplier = 1.0;
        this.layers.forEach(layer => {
            totalMultiplier *= layer.multiplier;
        });
        
        // Apply to prestige system
        this.prestige.setAdvancedMultiplier(totalMultiplier);
    }

    getLayers() {
        return this.layers;
    }

    getPrestigeCounts() {
        return this.prestigeCounts;
    }

    getTotalMultiplier() {
        let total = 1.0;
        this.layers.forEach(layer => {
            total *= layer.multiplier;
        });
        return total;
    }

    serialize() {
        return {
            layers: this.layers,
            prestigeCounts: this.prestigeCounts
        };
    }

    deserialize(data) {
        if (data) {
            this.layers = data.layers || this.layers;
            this.prestigeCounts = data.prestigeCounts || this.prestigeCounts;
            this.checkUnlocks();
            this.updateGlobalMultiplier();
        }
    }
}



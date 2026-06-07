/**
 * AUTOMATION SYSTEM - AI Assistants
 * 
 * Automates repetitive tasks.
 * Creates progression through automation.
 */

export class AutomationSystem {
    constructor(eventBus, economy, progression) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        
        this.assistants = [
            {
                id: 'click_bot',
                name: 'CLICK BOT',
                description: 'Automatically clicks for you',
                cost: 1000,
                level: 0,
                maxLevel: 10,
                effect: (level) => ({
                    clickRate: level * 0.5, // Clicks per second
                    efficiency: 1 + (level * 0.05) // 5% efficiency per level
                })
            },
            {
                id: 'upgrade_manager',
                name: 'UPGRADE MANAGER',
                description: 'Auto-purchases optimal upgrades',
                cost: 5000,
                level: 0,
                maxLevel: 5,
                effect: (level) => ({
                    enabled: level > 0,
                    priority: level // Higher level = better priority algorithm
                })
            },
            {
                id: 'resource_optimizer',
                name: 'RESOURCE OPTIMIZER',
                description: 'Optimizes resource allocation',
                cost: 10000,
                level: 0,
                maxLevel: 5,
                effect: (level) => ({
                    efficiencyBonus: 1 + (level * 0.1) // 10% efficiency per level
                })
            },
            {
                id: 'prestige_advisor',
                name: 'PRESTIGE ADVISOR',
                description: 'Suggests optimal prestige timing',
                cost: 25000,
                level: 0,
                maxLevel: 3,
                effect: (level) => ({
                    enabled: level > 0,
                    accuracy: 0.5 + (level * 0.15) // Better suggestions
                })
            }
        ];
        
        this.autoClickInterval = null;
        this.autoUpgradeInterval = null;
        this.lastAutoClick = 0;
    }

    upgradeAssistant(assistantId) {
        const assistant = this.assistants.find(a => a.id === assistantId);
        if (!assistant) return false;
        
        if (assistant.level >= assistant.maxLevel) {
            this.eventBus.emit('system_message', {
                text: 'ASSISTANT AT MAX LEVEL',
                type: 'error'
            });
            return false;
        }
        
        const cost = assistant.cost * Math.pow(2, assistant.level);
        if (this.economy.entropy < cost) {
            this.eventBus.emit('system_message', {
                text: 'INSUFFICIENT ENTROPY',
                type: 'error'
            });
            return false;
        }
        
        this.economy.spendEntropy(cost);
        assistant.level++;
        
        this.updateAutomation();
        
        this.eventBus.emit('assistant_upgraded', { assistant, level: assistant.level });
        this.eventBus.emit('system_message', {
            text: `${assistant.name} UPGRADED TO LEVEL ${assistant.level}`,
            type: 'success'
        });
        
        return true;
    }

    updateAutomation() {
        // Update auto-click
        const clickBot = this.assistants.find(a => a.id === 'click_bot');
        if (clickBot && clickBot.level > 0) {
            if (this.autoClickInterval) {
                clearInterval(this.autoClickInterval);
            }
            
            const clickRate = clickBot.effect(clickBot.level).clickRate;
            const interval = 1000 / clickRate; // ms between clicks
            
            this.autoClickInterval = setInterval(() => {
                this.performAutoClick();
            }, interval);
        } else {
            if (this.autoClickInterval) {
                clearInterval(this.autoClickInterval);
                this.autoClickInterval = null;
            }
        }
        
        // Update auto-upgrade
        const upgradeManager = this.assistants.find(a => a.id === 'upgrade_manager');
        if (upgradeManager && upgradeManager.level > 0) {
            if (this.autoUpgradeInterval) {
                clearInterval(this.autoUpgradeInterval);
            }
            
            this.autoUpgradeInterval = setInterval(() => {
                this.performAutoUpgrade();
            }, 5000); // Check every 5 seconds
        } else {
            if (this.autoUpgradeInterval) {
                clearInterval(this.autoUpgradeInterval);
                this.autoUpgradeInterval = null;
            }
        }
    }

    performAutoClick() {
        const clickBot = this.assistants.find(a => a.id === 'click_bot');
        if (!clickBot || clickBot.level === 0) return;
        
        const effect = clickBot.effect(clickBot.level);
        const now = Date.now();
        
        // Throttle to prevent spam
        if (now - this.lastAutoClick < 100) return;
        this.lastAutoClick = now;
        
        // Emit click event with efficiency modifier
        this.eventBus.emit('auto_click', {
            efficiency: effect.efficiency
        });
    }

    performAutoUpgrade() {
        const upgradeManager = this.assistants.find(a => a.id === 'upgrade_manager');
        if (!upgradeManager || upgradeManager.level === 0) return;
        
        // Simple algorithm: buy cheapest available upgrade
        const availableUpgrades = this.progression.getAvailableUpgrades();
        if (availableUpgrades.length === 0) return;
        
        // Sort by cost
        availableUpgrades.sort((a, b) => a.cost - b.cost);
        
        // Try to buy the cheapest one
        const cheapest = availableUpgrades[0];
        if (this.economy.entropy >= cheapest.cost) {
            this.progression.purchaseUpgrade(cheapest.id);
            this.eventBus.emit('auto_upgrade_purchased', { upgrade: cheapest });
        }
    }

    getAssistants() {
        return this.assistants;
    }

    getAssistant(assistantId) {
        return this.assistants.find(a => a.id === assistantId);
    }

    getTotalEfficiencyBonus() {
        const optimizer = this.assistants.find(a => a.id === 'resource_optimizer');
        if (!optimizer || optimizer.level === 0) return 1.0;
        
        return optimizer.effect(optimizer.level).efficiencyBonus;
    }

    serialize() {
        return {
            assistants: this.assistants.map(a => ({
                id: a.id,
                level: a.level
            }))
        };
    }

    deserialize(data) {
        if (data && data.assistants) {
            data.assistants.forEach(saved => {
                const assistant = this.assistants.find(a => a.id === saved.id);
                if (assistant) {
                    assistant.level = saved.level || 0;
                }
            });
            
            this.updateAutomation();
        }
    }
}



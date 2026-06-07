/**
 * QUEST SYSTEM - Goal-Oriented Engagement
 * 
 * Provides clear objectives to drive player action.
 * Creates a sense of purpose and achievement.
 */

export class QuestSystem {
    constructor(eventBus, economy, progression, inventory, enemies) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        this.inventory = inventory;
        this.enemies = enemies;
        
        this.activeQuests = [];
        this.completedQuests = [];
        this.questIdCounter = 0;
        
        this.setupEventListeners();
        this.generateInitialQuests();
    }

    setupEventListeners() {
        // Track events for quest progress
        this.eventBus.on('click', () => {
            this.updateQuestProgress('click', 1);
        });
        
        this.eventBus.on('entropy_gained', (amount) => {
            this.updateQuestProgress('entropy_earn', amount);
        });
        
        this.eventBus.on('enemy_killed', (data) => {
            this.updateQuestProgress('kill_enemy', 1);
            if (data.isBoss) {
                this.updateQuestProgress('kill_boss', 1);
            }
        });
        
        this.eventBus.on('loot', (loot) => {
            this.updateQuestProgress('find_loot', 1);
            this.updateQuestProgress(`find_${loot.type.toLowerCase()}`, 1);
        });
        
        this.eventBus.on('upgrade_purchased', () => {
            this.updateQuestProgress('buy_upgrade', 1);
        });
        
        this.eventBus.on('item_fused', () => {
            this.updateQuestProgress('fuse_item', 1);
        });
    }

    generateInitialQuests() {
        // Generate 3 random quests
        const questTemplates = [
            {
                type: 'click',
                name: 'CLICK PROTOCOL',
                description: 'Perform 100 manual clicks',
                target: 100,
                reward: { type: 'entropy', amount: 500 }
            },
            {
                type: 'entropy_earn',
                name: 'ENTROPY HARVEST',
                description: 'Earn 10,000 Entropy',
                target: 10000,
                reward: { type: 'entropy', amount: 2000 }
            },
            {
                type: 'kill_enemy',
                name: 'TERMINATION ORDER',
                description: 'Kill 25 enemies',
                target: 25,
                reward: { type: 'premium', amount: 5 }
            },
            {
                type: 'find_loot',
                name: 'LOOT SCAN',
                description: 'Find 10 items',
                target: 10,
                reward: { type: 'entropy', amount: 1000 }
            },
            {
                type: 'buy_upgrade',
                name: 'SYSTEM UPGRADE',
                description: 'Purchase 5 upgrades',
                target: 5,
                reward: { type: 'entropy', amount: 5000 }
            },
            {
                type: 'kill_boss',
                name: 'BOSS ELIMINATION',
                description: 'Defeat 3 bosses',
                target: 3,
                reward: { type: 'premium', amount: 10 }
            },
            {
                type: 'fuse_item',
                name: 'FUSION EXPERIMENT',
                description: 'Fuse 5 items',
                target: 5,
                reward: { type: 'entropy', amount: 3000 }
            }
        ];
        
        // Select 3 random quests
        const shuffled = questTemplates.sort(() => 0.5 - Math.random());
        for (let i = 0; i < 3 && i < shuffled.length; i++) {
            this.addQuest(shuffled[i]);
        }
    }

    addQuest(template) {
        const quest = {
            id: this.questIdCounter++,
            type: template.type,
            name: template.name,
            description: template.description,
            target: template.target,
            current: 0,
            reward: template.reward,
            completed: false
        };
        
        this.activeQuests.push(quest);
        this.eventBus.emit('quest_added', quest);
        return quest;
    }

    updateQuestProgress(type, amount) {
        this.activeQuests.forEach(quest => {
            if (quest.type === type && !quest.completed) {
                quest.current += amount;
                
                if (quest.current >= quest.target) {
                    quest.current = quest.target;
                    this.completeQuest(quest);
                } else {
                    this.eventBus.emit('quest_progress', quest);
                }
            }
        });
    }

    completeQuest(quest) {
        quest.completed = true;
        
        // Give reward
        if (quest.reward.type === 'entropy') {
            this.economy.addEntropy(quest.reward.amount);
            this.eventBus.emit('entropy_gained', quest.reward.amount);
        } else if (quest.reward.type === 'premium') {
            this.economy.premium += quest.reward.amount;
        }
        
        // Move to completed
        const index = this.activeQuests.indexOf(quest);
        if (index > -1) {
            this.activeQuests.splice(index, 1);
        }
        this.completedQuests.push(quest);
        
        this.eventBus.emit('quest_completed', quest);
        
        // Generate new quest after a delay
        setTimeout(() => {
            this.generateNewQuest();
        }, 2000);
    }

    generateNewQuest() {
        const questTemplates = [
            {
                type: 'click',
                name: 'CLICK PROTOCOL',
                description: `Perform ${50 + Math.floor(Math.random() * 200)} manual clicks`,
                target: 50 + Math.floor(Math.random() * 200),
                reward: { type: 'entropy', amount: 500 + Math.floor(Math.random() * 2000) }
            },
            {
                type: 'entropy_earn',
                name: 'ENTROPY HARVEST',
                description: `Earn ${this.economy.entropy * 0.5} Entropy`,
                target: Math.floor(this.economy.entropy * 0.5),
                reward: { type: 'entropy', amount: Math.floor(this.economy.entropy * 0.1) }
            },
            {
                type: 'kill_enemy',
                name: 'TERMINATION ORDER',
                description: `Kill ${10 + Math.floor(Math.random() * 40)} enemies`,
                target: 10 + Math.floor(Math.random() * 40),
                reward: { type: 'premium', amount: 3 + Math.floor(Math.random() * 7) }
            },
            {
                type: 'find_loot',
                name: 'LOOT SCAN',
                description: `Find ${5 + Math.floor(Math.random() * 15)} items`,
                target: 5 + Math.floor(Math.random() * 15),
                reward: { type: 'entropy', amount: 1000 + Math.floor(Math.random() * 3000) }
            }
        ];
        
        const template = questTemplates[Math.floor(Math.random() * questTemplates.length)];
        this.addQuest(template);
    }

    getActiveQuests() {
        return this.activeQuests;
    }

    getCompletedQuests() {
        return this.completedQuests;
    }

    serialize() {
        return {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            questIdCounter: this.questIdCounter
        };
    }

    deserialize(data) {
        if (data) {
            this.activeQuests = data.activeQuests || [];
            this.completedQuests = data.completedQuests || [];
            this.questIdCounter = data.questIdCounter || 0;
        }
    }
}



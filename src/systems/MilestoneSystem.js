/**
 * MILESTONE SYSTEM - Progress Rewards
 * 
 * Rewards players for reaching significant milestones.
 * Creates long-term goals and celebration moments.
 */

export class MilestoneSystem {
    constructor(eventBus, economy, progression, statistics) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        this.statistics = statistics;
        
        this.claimedMilestones = [];
        
        this.milestones = [
            {
                id: 'first_1000',
                name: 'FIRST THOUSAND',
                description: 'Reach 1,000 Entropy',
                check: () => this.economy.entropy >= 1000,
                reward: { type: 'entropy', amount: 500 },
                category: 'entropy'
            },
            {
                id: 'first_10k',
                name: 'TEN THOUSAND',
                description: 'Reach 10,000 Entropy',
                check: () => this.economy.entropy >= 10000,
                reward: { type: 'entropy', amount: 5000 },
                category: 'entropy'
            },
            {
                id: 'first_100k',
                name: 'HUNDRED THOUSAND',
                description: 'Reach 100,000 Entropy',
                check: () => this.economy.entropy >= 100000,
                reward: { type: 'premium', amount: 10 },
                category: 'entropy'
            },
            {
                id: 'first_million',
                name: 'MILLIONAIRE',
                description: 'Reach 1,000,000 Entropy',
                check: () => this.economy.entropy >= 1000000,
                reward: { type: 'premium', amount: 25 },
                category: 'entropy'
            },
            {
                id: 'first_100_clicks',
                name: 'CLICK MASTER',
                description: 'Perform 100 clicks',
                check: () => this.statistics.stats.totalClicks >= 100,
                reward: { type: 'entropy', amount: 200 },
                category: 'action'
            },
            {
                id: 'first_1000_clicks',
                name: 'CLICK LEGEND',
                description: 'Perform 1,000 clicks',
                check: () => this.statistics.stats.totalClicks >= 1000,
                reward: { type: 'entropy', amount: 2000 },
                category: 'action'
            },
            {
                id: 'first_10k_clicks',
                name: 'CLICK GOD',
                description: 'Perform 10,000 clicks',
                check: () => this.statistics.stats.totalClicks >= 10000,
                reward: { type: 'premium', amount: 15 },
                category: 'action'
            },
            {
                id: 'first_10_kills',
                name: 'TERMINATOR',
                description: 'Kill 10 enemies',
                check: () => this.statistics.stats.enemiesKilled >= 10,
                reward: { type: 'entropy', amount: 500 },
                category: 'combat'
            },
            {
                id: 'first_100_kills',
                name: 'EXTERMINATOR',
                description: 'Kill 100 enemies',
                check: () => this.statistics.stats.enemiesKilled >= 100,
                reward: { type: 'entropy', amount: 5000 },
                category: 'combat'
            },
            {
                id: 'first_boss',
                name: 'BOSS SLAYER',
                description: 'Defeat your first boss',
                check: () => this.statistics.stats.bossesKilled >= 1,
                reward: { type: 'premium', amount: 5 },
                category: 'combat'
            },
            {
                id: 'first_legendary',
                name: 'LEGENDARY FIND',
                description: 'Find your first Legendary item',
                check: () => this.statistics.stats.legendaryItemsFound >= 1,
                reward: { type: 'premium', amount: 10 },
                category: 'loot'
            },
            {
                id: 'first_prestige',
                name: 'ASCENSION',
                description: 'Perform your first Prestige',
                check: () => this.statistics.stats.prestigeCount >= 1,
                reward: { type: 'premium', amount: 20 },
                category: 'progression'
            }
        ];
        
        // Check milestones periodically
        setInterval(() => this.checkMilestones(), 5000);
    }

    checkMilestones() {
        this.milestones.forEach(milestone => {
            if (!this.claimedMilestones.includes(milestone.id)) {
                if (milestone.check()) {
                    this.claimMilestone(milestone);
                }
            }
        });
    }

    claimMilestone(milestone) {
        this.claimedMilestones.push(milestone.id);
        
        // Give reward
        if (milestone.reward.type === 'entropy') {
            this.economy.addEntropy(milestone.reward.amount);
        } else if (milestone.reward.type === 'premium') {
            this.economy.premium += milestone.reward.amount;
        }
        
        this.eventBus.emit('milestone_claimed', milestone);
        this.eventBus.emit('system_message', {
            text: `MILESTONE: ${milestone.name} - REWARD CLAIMED!`,
            type: 'success'
        });
    }

    getMilestones() {
        return this.milestones;
    }

    getClaimedMilestones() {
        return this.claimedMilestones;
    }

    getAvailableMilestones() {
        return this.milestones.filter(m => 
            !this.claimedMilestones.includes(m.id) && 
            m.check()
        );
    }

    serialize() {
        return {
            claimedMilestones: this.claimedMilestones
        };
    }

    deserialize(data) {
        if (data) {
            this.claimedMilestones = data.claimedMilestones || [];
        }
    }
}



import { Upgrades } from '../config/Upgrades.js';

/**
 * ADVANCED ACHIEVEMENT SYSTEM - Categorized Achievements
 * 
 * Organizes achievements into categories.
 * Provides better progression tracking.
 */

export class AdvancedAchievementSystem {
    constructor(eventBus, statistics, economy, progression) {
        this.eventBus = eventBus;
        this.statistics = statistics;
        this.economy = economy;
        this.progression = progression;
        
        this.categories = {
            combat: {
                name: 'COMBAT',
                icon: '⚔️',
                achievements: []
            },
            economy: {
                name: 'ECONOMY',
                icon: '💰',
                achievements: []
            },
            progression: {
                name: 'PROGRESSION',
                icon: '📈',
                achievements: []
            },
            collection: {
                name: 'COLLECTION',
                icon: '🎒',
                achievements: []
            },
            mastery: {
                name: 'MASTERY',
                icon: '⭐',
                achievements: []
            }
        };
        
        this.initializeAchievements();
    }

    initializeAchievements() {
        // Combat Achievements
        this.categories.combat.achievements = [
            {
                id: 'kill_100',
                name: 'SLAYER',
                description: 'Kill 100 enemies',
                requirement: { enemiesKilled: 100 },
                reward: { entropy: 1000 },
                unlocked: false
            },
            {
                id: 'kill_1000',
                name: 'MASSACRE',
                description: 'Kill 1,000 enemies',
                requirement: { enemiesKilled: 1000 },
                reward: { entropy: 10000 },
                unlocked: false
            },
            {
                id: 'boss_kill',
                name: 'BOSS SLAYER',
                description: 'Defeat a boss enemy',
                requirement: { bossKills: 1 },
                reward: { entropy: 5000, premium: 1 },
                unlocked: false
            }
        ];
        
        // Economy Achievements
        this.categories.economy.achievements = [
            {
                id: 'entropy_1m',
                name: 'ENTROPY MILLIONAIRE',
                description: 'Accumulate 1M entropy',
                requirement: { totalEntropy: 1000000 },
                reward: { entropy: 50000 },
                unlocked: false
            },
            {
                id: 'entropy_1b',
                name: 'ENTROPY BILLIONAIRE',
                description: 'Accumulate 1B entropy',
                requirement: { totalEntropy: 1000000000 },
                reward: { entropy: 5000000, premium: 10 },
                unlocked: false
            },
            {
                id: 'spend_100k',
                name: 'BIG SPENDER',
                description: 'Spend 100K entropy',
                requirement: { entropySpent: 100000 },
                reward: { entropy: 10000 },
                unlocked: false
            }
        ];
        
        // Progression Achievements
        this.categories.progression.achievements = [
            {
                id: 'prestige_10',
                name: 'ASCENDED',
                description: 'Prestige 10 times',
                requirement: { prestigeCount: 10 },
                reward: { entropy: 20000, premium: 2 },
                unlocked: false
            },
            {
                id: 'upgrade_all',
                name: 'MAXED OUT',
                description: 'Purchase all upgrades',
                requirement: { upgradesOwned: 'all' },
                reward: { entropy: 50000, premium: 5 },
                unlocked: false
            },
            {
                id: 'level_100',
                name: 'CENTURION',
                description: 'Reach level 100',
                requirement: { level: 100 },
                reward: { entropy: 30000 },
                unlocked: false
            }
        ];
        
        // Collection Achievements
        this.categories.collection.achievements = [
            {
                id: 'items_100',
                name: 'COLLECTOR',
                description: 'Collect 100 items',
                requirement: { itemsCollected: 100 },
                reward: { entropy: 5000 },
                unlocked: false
            },
            {
                id: 'legendary_10',
                name: 'LEGENDARY HUNTER',
                description: 'Collect 10 legendary items',
                requirement: { legendaryItems: 10 },
                reward: { entropy: 50000, premium: 3 },
                unlocked: false
            }
        ];
        
        // Mastery Achievements
        this.categories.mastery.achievements = [
            {
                id: 'play_24h',
                name: 'DEDICATED',
                description: 'Play for 24 hours total',
                requirement: { playTime: 86400 }, // seconds
                reward: { entropy: 100000, premium: 10 },
                unlocked: false
            },
            {
                id: 'combo_100',
                name: 'COMBO MASTER',
                description: 'Reach 100x combo',
                requirement: { maxCombo: 100 },
                reward: { entropy: 20000 },
                unlocked: false
            }
        ];
    }

    checkAchievements() {
        const stats = this.statistics.getStats();
        
        Object.keys(this.categories).forEach(categoryKey => {
            const category = this.categories[categoryKey];
            
            category.achievements.forEach(achievement => {
                if (achievement.unlocked) return;
                
                let unlocked = true;
                
                Object.keys(achievement.requirement).forEach(key => {
                    const required = achievement.requirement[key];
                    const current = this.getStatValue(key, stats);
                    
                    if (key === 'upgradesOwned' && required === 'all') {
                        // Special case: check if all upgrades owned
                        const allUpgrades = Upgrades;
                        const ownedUpgrades = Object.keys(this.progression.ownedUpgrades || {}).length;
                        if (ownedUpgrades < allUpgrades.length) {
                            unlocked = false;
                        }
                    } else if (current < required) {
                        unlocked = false;
                    }
                });
                
                if (unlocked) {
                    this.unlockAchievement(achievement);
                }
            });
        });
    }

    getStatValue(key, stats) {
        const mapping = {
            enemiesKilled: stats.enemiesKilled || 0,
            bossKills: stats.bossKills || 0,
            totalEntropy: stats.totalEntropyEarned || 0,
            entropySpent: stats.entropySpent || 0,
            prestigeCount: stats.prestigeCount || 0,
            level: stats.level || 0,
            itemsCollected: stats.itemsCollected || 0,
            legendaryItems: stats.legendaryItems || 0,
            playTime: stats.totalPlayTime || 0,
            maxCombo: stats.maxCombo || 0
        };
        
        return mapping[key] || 0;
    }

    unlockAchievement(achievement) {
        achievement.unlocked = true;
        
        // Give rewards
        if (achievement.reward.entropy) {
            this.economy.addEntropy(achievement.reward.entropy);
        }
        
        if (achievement.reward.premium) {
            this.economy.premium += achievement.reward.premium;
        }
        
        this.eventBus.emit('achievement_unlocked', achievement);
        this.eventBus.emit('system_message', {
            text: `ACHIEVEMENT: ${achievement.name}`,
            type: 'success'
        });
    }

    getCategories() {
        return this.categories;
    }

    getUnlockedCount() {
        let count = 0;
        Object.keys(this.categories).forEach(key => {
            count += this.categories[key].achievements.filter(a => a.unlocked).length;
        });
        return count;
    }

    getTotalCount() {
        let count = 0;
        Object.keys(this.categories).forEach(key => {
            count += this.categories[key].achievements.length;
        });
        return count;
    }

    serialize() {
        const serialized = {};
        Object.keys(this.categories).forEach(key => {
            serialized[key] = this.categories[key].achievements.map(a => ({
                id: a.id,
                unlocked: a.unlocked
            }));
        });
        return serialized;
    }

    deserialize(data) {
        if (data) {
            Object.keys(data).forEach(key => {
                if (this.categories[key]) {
                    data[key].forEach(saved => {
                        const achievement = this.categories[key].achievements.find(a => a.id === saved.id);
                        if (achievement) {
                            achievement.unlocked = saved.unlocked || false;
                        }
                    });
                }
            });
        }
    }
}


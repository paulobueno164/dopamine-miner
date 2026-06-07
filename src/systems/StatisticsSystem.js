/**
 * STATISTICS SYSTEM - Player Analytics & Progress Tracking
 * 
 * Tracks player behavior for retention insights and personal milestones.
 */

export class StatisticsSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        this.stats = {
            // Time tracking
            totalPlayTime: 0,
            sessionStartTime: Date.now(),
            lastSaveTime: Date.now(),
            
            // Clicking stats
            totalClicks: 0,
            totalDamageDealt: 0,
            maxCombo: 0,
            totalLootFound: 0,
            
            // Progression stats
            totalEntropyEarned: 0,
            totalEntropySpent: 0,
            maxEntropyReached: 0,
            prestigeCount: 0,
            
            // Combat stats
            enemiesKilled: 0,
            bossesKilled: 0,
            maxLevelReached: 0,
            
            // Collection stats
            itemsFused: 0,
            dronesAcquired: 0,
            achievementsUnlocked: 0,
            
            // Special events
            legendaryItemsFound: 0,
            mythicItemsFound: 0,
            criticalHits: 0,
            skillsUsed: 0,
            hacksCompleted: 0,
            challengesCompleted: 0
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('click', () => {
            this.stats.totalClicks++;
        });
        
        this.eventBus.on('damage', (amount) => {
            this.stats.totalDamageDealt += amount;
        });
        
        this.eventBus.on('combo_update', (data) => {
            if (data.count > this.stats.maxCombo) {
                this.stats.maxCombo = data.count;
            }
        });
        
        this.eventBus.on('loot', (loot) => {
            this.stats.totalLootFound++;
            if (loot.type === 'LEGENDARY') this.stats.legendaryItemsFound++;
            if (loot.type === 'MYTHIC') this.stats.mythicItemsFound++;
        });
        
        this.eventBus.on('entropy_gained', (amount) => {
            this.stats.totalEntropyEarned += amount;
            if (this.stats.maxEntropyReached < amount) {
                this.stats.maxEntropyReached = amount;
            }
        });
        
        this.eventBus.on('entropy_spent', (amount) => {
            this.stats.totalEntropySpent += amount;
        });
        
        this.eventBus.on('enemy_killed', (data) => {
            this.stats.enemiesKilled++;
            if (data.isBoss) this.stats.bossesKilled++;
        });
        
        this.eventBus.on('level_up', (level) => {
            if (level > this.stats.maxLevelReached) {
                this.stats.maxLevelReached = level;
            }
        });
        
        this.eventBus.on('item_fused', () => {
            this.stats.itemsFused++;
        });
        
        this.eventBus.on('drone_acquired', () => {
            this.stats.dronesAcquired++;
        });
        
        this.eventBus.on('achievement_unlocked', () => {
            this.stats.achievementsUnlocked++;
        });
        
        this.eventBus.on('critical_hit', () => {
            this.stats.criticalHits++;
        });
        
        this.eventBus.on('active_skill', () => {
            this.stats.skillsUsed++;
        });
        
        this.eventBus.on('hack_complete', (data) => {
            if (data.success) this.stats.hacksCompleted++;
        });
        
        this.eventBus.on('challenge_completed', () => {
            this.stats.challengesCompleted++;
        });
        
        this.eventBus.on('ascension_performed', () => {
            this.stats.prestigeCount++;
        });
    }

    update(dt) {
        this.stats.totalPlayTime += dt;
    }

    getStats() {
        // Calculate session time
        const sessionTime = (Date.now() - this.stats.sessionStartTime) / 1000;
        
        return {
            ...this.stats,
            sessionTime: sessionTime,
            clicksPerSecond: this.stats.totalClicks / Math.max(this.stats.totalPlayTime, 1),
            efficiency: this.stats.totalEntropyEarned / Math.max(this.stats.totalPlayTime, 1)
        };
    }

    export() {
        return JSON.stringify(this.stats, null, 2);
    }

    import(data) {
        try {
            const imported = JSON.parse(data);
            this.stats = { ...this.stats, ...imported };
            this.stats.sessionStartTime = Date.now(); // Reset session time
        } catch (e) {
            console.error('Failed to import statistics:', e);
        }
    }

    reset() {
        const sessionStart = this.stats.sessionStartTime;
        this.stats = {
            totalPlayTime: 0,
            sessionStartTime: sessionStart,
            lastSaveTime: Date.now(),
            totalClicks: 0,
            totalDamageDealt: 0,
            maxCombo: 0,
            totalLootFound: 0,
            totalEntropyEarned: 0,
            totalEntropySpent: 0,
            maxEntropyReached: 0,
            prestigeCount: 0,
            enemiesKilled: 0,
            bossesKilled: 0,
            maxLevelReached: 0,
            itemsFused: 0,
            dronesAcquired: 0,
            achievementsUnlocked: 0,
            legendaryItemsFound: 0,
            mythicItemsFound: 0,
            criticalHits: 0,
            skillsUsed: 0,
            hacksCompleted: 0,
            challengesCompleted: 0
        };
    }
}



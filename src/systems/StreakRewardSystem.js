/**
 * STREAK REWARD SYSTEM - Daily Engagement
 * 
 * Rewards consistent daily play.
 * Creates habit formation through streak mechanics.
 */

export class StreakRewardSystem {
    constructor(eventBus, economy) {
        this.eventBus = eventBus;
        this.economy = economy;
        
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.lastClaimDate = null;
        
        this.streakRewards = [
            { days: 3, entropy: 500, premium: 0 },
            { days: 7, entropy: 2000, premium: 1 },
            { days: 14, entropy: 5000, premium: 2 },
            { days: 30, entropy: 15000, premium: 5 },
            { days: 60, entropy: 50000, premium: 10 },
            { days: 100, entropy: 200000, premium: 25 }
        ];
        
        this.checkStreak();
    }

    checkStreak() {
        const today = new Date().toDateString();
        const lastClaim = this.lastClaimDate ? new Date(this.lastClaimDate).toDateString() : null;
        
        if (lastClaim === today) {
            // Already claimed today
            return;
        }
        
        if (lastClaim) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (lastClaim === yesterdayStr) {
                // Continue streak
                this.currentStreak++;
            } else {
                // Streak broken
                if (this.currentStreak > this.longestStreak) {
                    this.longestStreak = this.currentStreak;
                }
                this.currentStreak = 1;
            }
        } else {
            // First time
            this.currentStreak = 1;
        }
        
        this.lastClaimDate = Date.now();
        this.checkStreakRewards();
    }

    checkStreakRewards() {
        this.streakRewards.forEach(reward => {
            if (this.currentStreak === reward.days) {
                this.claimStreakReward(reward);
            }
        });
    }

    claimStreakReward(reward) {
        if (reward.entropy) {
            this.economy.addEntropy(reward.entropy);
        }
        
        if (reward.premium) {
            this.economy.premium += reward.premium;
        }
        
        this.eventBus.emit('streak_reward_claimed', {
            days: reward.days,
            reward
        });
        
        this.eventBus.emit('system_message', {
            text: `${reward.days}-DAY STREAK REWARD CLAIMED!`,
            type: 'success'
        });
    }

    getCurrentStreak() {
        return this.currentStreak;
    }

    getLongestStreak() {
        return Math.max(this.currentStreak, this.longestStreak);
    }

    getNextStreakReward() {
        return this.streakRewards.find(r => r.days > this.currentStreak);
    }

    serialize() {
        return {
            currentStreak: this.currentStreak,
            longestStreak: this.longestStreak,
            lastClaimDate: this.lastClaimDate
        };
    }

    deserialize(data) {
        if (data) {
            this.currentStreak = data.currentStreak || 0;
            this.longestStreak = data.longestStreak || 0;
            this.lastClaimDate = data.lastClaimDate || null;
        }
    }
}


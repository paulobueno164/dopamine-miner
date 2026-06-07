/**
 * TIME REWARD SYSTEM - Playtime Rewards
 * 
 * Rewards players for extended play sessions.
 * Encourages longer engagement periods.
 */

export class TimeRewardSystem {
    constructor(eventBus, economy, statistics) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.statistics = statistics;
        
        this.sessionStartTime = Date.now();
        this.lastRewardTime = Date.now();
        this.rewardInterval = 5 * 60 * 1000; // 5 minutes
        this.rewardMultiplier = 1.0;
        
        this.rewardTiers = [
            { minutes: 5, entropy: 100, message: '5 MINUTES PLAYED' },
            { minutes: 15, entropy: 500, message: '15 MINUTES PLAYED' },
            { minutes: 30, entropy: 1500, message: '30 MINUTES PLAYED' },
            { minutes: 60, entropy: 5000, premium: 1, message: '1 HOUR PLAYED' },
            { minutes: 120, entropy: 15000, premium: 3, message: '2 HOURS PLAYED' },
            { minutes: 180, entropy: 30000, premium: 5, message: '3 HOURS PLAYED' }
        ];
        
        this.claimedTiers = [];
        
        // Check for rewards every minute
        setInterval(() => this.checkRewards(), 60000);
    }

    checkRewards() {
        const now = Date.now();
        const sessionTime = (now - this.sessionStartTime) / 1000 / 60; // minutes
        
        // Check milestone rewards
        this.rewardTiers.forEach(tier => {
            if (sessionTime >= tier.minutes && !this.claimedTiers.includes(tier.minutes)) {
                this.claimTier(tier);
            }
        });
        
        // Periodic rewards (every 5 minutes)
        if (now - this.lastRewardTime >= this.rewardInterval) {
            this.givePeriodicReward();
            this.lastRewardTime = now;
        }
    }

    claimTier(tier) {
        this.claimedTiers.push(tier.minutes);
        
        if (tier.entropy) {
            this.economy.addEntropy(tier.entropy * this.rewardMultiplier);
        }
        
        if (tier.premium) {
            this.economy.premium += tier.premium;
        }
        
        this.eventBus.emit('time_reward_claimed', tier);
        this.eventBus.emit('system_message', {
            text: `${tier.message}: REWARD CLAIMED!`,
            type: 'success'
        });
    }

    givePeriodicReward() {
        const baseReward = 50;
        const reward = baseReward * this.rewardMultiplier;
        
        this.economy.addEntropy(reward);
        this.eventBus.emit('periodic_reward', reward);
    }

    getSessionTime() {
        return (Date.now() - this.sessionStartTime) / 1000 / 60; // minutes
    }

    getNextTier() {
        const sessionTime = this.getSessionTime();
        return this.rewardTiers.find(tier => 
            tier.minutes > sessionTime && 
            !this.claimedTiers.includes(tier.minutes)
        );
    }

    serialize() {
        return {
            sessionStartTime: this.sessionStartTime,
            lastRewardTime: this.lastRewardTime,
            claimedTiers: this.claimedTiers
        };
    }

    deserialize(data) {
        if (data) {
            this.sessionStartTime = data.sessionStartTime || Date.now();
            this.lastRewardTime = data.lastRewardTime || Date.now();
            this.claimedTiers = data.claimedTiers || [];
        }
    }
}



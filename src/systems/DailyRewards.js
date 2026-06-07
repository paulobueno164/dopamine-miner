export const DailyRewardsConfig = [
    { day: 1, type: 'entropy', value: 100, label: '100 ENTROPY' },
    { day: 2, type: 'gems', value: 5, label: '5 GEMS' },
    { day: 3, type: 'item', rarity: 'COMMON', label: 'COMMON CACHE' },
    { day: 4, type: 'entropy_mult', value: 2.0, label: '2x ENTROPY (1H)' }, // Temp buff or instant? Let's do instant large amount based on DPS
    { day: 5, type: 'gems', value: 15, label: '15 GEMS' },
    { day: 6, type: 'item', rarity: 'RARE', label: 'RARE CACHE' },
    { day: 7, type: 'item', rarity: 'LEGENDARY', label: 'LEGENDARY ARTIFACT' }
];

export class DailyRewardSystem {
    constructor(eventBus, economy, inventory) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.inventory = inventory;

        this.streak = 0;
        this.lastClaimTime = 0;
    }

    canClaim() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        // Check if last claim was yesterday or before
        // Simple check: is New Day?
        const lastDate = new Date(this.lastClaimTime).toDateString();
        const todayDate = new Date(now).toDateString();

        return lastDate !== todayDate;
    }

    claim() {
        if (!this.canClaim()) return false;

        // Logic to handle broken streaks? 
        // For idle games, usually infinite streak or reset if missed?
        // Let's do: If missed > 48 hours, reset.
        const now = Date.now();
        const twoDays = 48 * 60 * 60 * 1000;
        if (now - this.lastClaimTime > twoDays && this.lastClaimTime !== 0) {
            this.streak = 0;
        }

        const rewardIndex = this.streak % DailyRewardsConfig.length;
        const reward = DailyRewardsConfig[rewardIndex];

        this.applyReward(reward);

        this.streak++;
        this.lastClaimTime = now;

        this.eventBus.emit('daily_claimed', { reward, streak: this.streak });
        return reward;
    }

    applyReward(reward) {
        switch (reward.type) {
            case 'entropy':
                this.economy.addEntropy(reward.value);
                break;
            case 'gems':
                this.economy.premium += reward.value;
                break;
            case 'item':
                this.inventory.addItem(reward.rarity);
                break;
            case 'entropy_mult':
                // Instant grant of 1 hour of *current* production or similar
                // We don't have access to DPS here easily unless passed.
                // Let's just give flat massive entropy for Prototype simplicity 
                // OR emit an event that Main handles.
                this.eventBus.emit('reward_entropy_boost', 3600);
                break;
        }
    }

    serialize() {
        return {
            streak: this.streak,
            lastClaimTime: this.lastClaimTime
        };
    }

    deserialize(data) {
        if (!data) return;
        this.streak = data.streak || 0;
        this.lastClaimTime = data.lastClaimTime || 0;
    }
}

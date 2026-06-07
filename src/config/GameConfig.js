/**
 * THE SKINNER BOX TUNING BOARD
 * 
 * This configuration file explicitly controls the psychological pressure points of the game.
 * All values are tuned to maximize retention, not necessarily "fun".
 */

export const GameConfig = {
    // 2.1 VARIABLE RATIO REINFORCEMENT
    loot: {
        baseDropChance: 0.15, // 15% chance to drop anything (Frustration threshold)
        critChance: 0.05,     // 5% chance for a "Pop" feel
        rarityWeights: {
            common: 700,
            uncommon: 250,
            rare: 45,         // The "Dopamine Hit" target
            legendary: 5,     // The "Jackpot" - incredibly rare to fuel addiction
            mythic: 0.1       // The "Myth" - virtually impossible, drives long term play
        }
    },

    // 2.2 FOMO (Fear of Missing Out)
    fomo: {
        eventDurationMinutes: 10,   // Short enough to demand immediate attention
        eventCooldownHours: 4,      // Long enough to create "absence anxiety"
        dailyResetHour: 0,          // UTC midnight reset for daily habits
        streakForgivenessMinutes: 60 // 1 hour grace period to prevent total churn from anger
    },

    // 2.3 LOSS AVERSION
    stability: {
        decayRatePerSecond: 0.05,   // Constant pressure. You are always losing.
        regainOnKill: 1.2,          // You must kill to stay alive.
        penaltyThreshold: 0,        // Hitting 0 triggers a "Reset"
        resetPenaltyFactor: 0.5     // Lose 50% of current mining efficiency on fail
    },

    // 2.4 SUNK COST
    progression: {
        costScalingFactor: 1.5,     // Hard exponential scaling to force stalls
        prestigeUnlockLevel: 100,   // Far enough that resetting feels painful
        softWallLevel: 25           // First major stall point to encourage shop viewing
    },

    // 2.5 SOCIAL COMPARISON
    social: {
        fakeLeaderboard: true,      // Simulate "just ahead" players to induce envy
        notificationFrequency: 300,  // Fake "X just got a Legendary" msg every 5 mins
        whaleMultiplier: 50         // Payers progress 50x faster (Visible inequality)
    }
};

export const Colors = {
    common: '#ffffff',
    uncommon: '#00ff9d',
    rare: '#00aaff',
    legendary: '#bd00ff',
    mythic: '#ffaa00'
};

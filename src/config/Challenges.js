export const ChallengesConfig = [
    {
        id: 'manual_labor',
        name: 'MANUAL LABOR',
        description: 'Auto-Miners are disabled. Click Damage is doubled.',
        goalType: 'level',
        goalValue: 10,
        reward: { type: 'buff', stat: 'click_crit_chance', val: 0.1, desc: '+10% CRIT CHANCE' }
    },
    {
        id: 'stability_test',
        name: 'STRESS TEST',
        description: 'Stability decays 3x faster. Enemies deal double mental damage.',
        goalType: 'level',
        goalValue: 20,
        reward: { type: 'buff', stat: 'stability_max', val: 50, desc: '+50 MAX STABILITY' }
    },
    {
        id: 'poverty',
        name: 'RESOURCE SCARCITY',
        description: 'Entropy gain is reduced by 90%. Upgrades are 50% cheaper.',
        goalType: 'entropy',
        goalValue: 1000000, // 1M
        reward: { type: 'buff', stat: 'upgrade_discount', val: 0.1, desc: '-10% UPGRADE COSTS' }
    }
];

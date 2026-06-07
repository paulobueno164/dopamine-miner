export const Upgrades = [
    {
        id: 'auto_miner_v1',
        name: 'AUTO-DRILL PROTOCOL',
        baseCost: 10,
        costScaling: 1.4,
        description: 'Automates the dopamine loop. Low efficiency.',
        trigger: 'SKINNER_BOX_AUTOMATION'
    },
    {
        id: 'lucky_charm',
        name: 'RNG MANIPULATOR',
        baseCost: 500,
        costScaling: 2.5,
        description: 'Increases Loot Chance. Feeds the gambling addiction.',
        trigger: 'VARIABLE_REWARD_BOOST'
    },
    {
        id: 'fomo_extender',
        name: 'TEMPORAL ANCHOR',
        baseCost: 5000,
        costScaling: 3.0,
        description: 'Extends limited-time events. Reduces anxiety slightly.',
        trigger: 'FOMO_MITIGATION'
    },
    {
        id: 'loss_buffer',
        name: 'STABILITY MATRIX',
        baseCost: 25000,
        costScaling: 5.0,
        description: 'Slows down the decay of progress. Pure Loss Aversion sale.',
        trigger: 'LOSS_AVERSION_REDUCTION'
    }
];

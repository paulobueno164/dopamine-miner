export const Achievements = [
    {
        id: 'clicker_novice',
        name: 'Neural Initiation',
        description: 'Manual Override 100 times.',
        condition: (stats) => stats.clicks >= 100,
        reward: { type: 'gems', value: 5 }
    },
    {
        id: 'clicker_expert',
        name: 'Carpal Tunnel',
        description: 'Manual Override 1,000 times.',
        condition: (stats) => stats.clicks >= 1000,
        reward: { type: 'gems', value: 25 }
    },
    {
        id: 'hoarder_I',
        name: 'Matter Collector',
        description: 'Hold 10 items in inventory.',
        condition: (stats) => stats.totalItems >= 10,
        reward: { type: 'luck', value: 0.05 }
    },
    {
        id: 'ascension_I',
        name: 'Beyond Form',
        description: 'Ascend for the first time.',
        condition: (stats) => stats.ascensions >= 1,
        reward: { type: 'auto_dps_mult', value: 0.1 } // +10% Auto DPS
    },
    {
        id: 'fusion_fail_I',
        name: 'Bad Luck?',
        description: 'Fail a fusion.',
        condition: (stats) => stats.fusionFailures >= 1,
        reward: { type: 'luck', value: 0.1 } // Pity Mechanic
    },
    {
        id: 'lore_hunter',
        name: 'Truth Seeker',
        description: 'Read a decrypted log.',
        condition: (stats) => stats.logsRead >= 1,
        reward: { type: 'gems', value: 10 }
    },
    {
        id: 'hacker_novice',
        name: 'Script Kiddie',
        description: 'Breach the system 3 times.',
        condition: (stats) => stats.hacks >= 3,
        reward: { type: 'gems', value: 15 }
    }
];

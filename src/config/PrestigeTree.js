export const PrestigeNodes = [
    {
        id: 'start_node',
        name: 'NEURAL PRESERVATION',
        description: 'Start new runs with 1,000 Entropy.',
        cost: 1,
        x: 0, y: 0,
        req: []
    },
    {
        id: 'click_overflow',
        name: 'KINETIC OVERFLOW',
        description: 'Click Damage converts 10% to Auto DPS.',
        cost: 3,
        x: -1, y: 1,
        req: ['start_node']
    },
    {
        id: 'lucky_start',
        name: 'BORN LUCKY',
        description: 'Start with +0.5 Luck.',
        cost: 3,
        x: 1, y: 1,
        req: ['start_node']
    },
    {
        id: 'auto_clicker',
        name: 'SUBROUTINE: CLICK',
        description: 'Automatically triggers a manual click every 5 seconds.',
        cost: 10,
        x: -2, y: 2,
        req: ['click_overflow']
    },
    {
        id: 'boss_slayer',
        name: 'GIANT KILLER',
        description: 'Deal 50% more damage to Bosses.',
        cost: 10,
        x: 0, y: 2,
        req: ['click_overflow', 'lucky_start']
    },
    {
        id: 'inventory_synergy',
        name: 'ITEM SYNERGY',
        description: 'Each item in inventory increases Global DPS by 1%.',
        cost: 15,
        x: 2, y: 2,
        req: ['lucky_start']
    }
];

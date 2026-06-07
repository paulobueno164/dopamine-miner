import { GameConfig } from '../config/GameConfig.js';
import { Upgrades } from '../config/Upgrades.js';
import { PrestigeNodes } from '../config/PrestigeTree.js';

export const EnemyAbilities = {
    SHIELD: {
        id: 'SHIELD',
        name: 'Kinetic Barrier',
        desc: 'Blocks 100% of Auto-Damage. Click to break.',
        icon: '🛡️'
    },
    REGEN: {
        id: 'REGEN',
        name: 'Void Regeneration',
        desc: 'Regenerates 5% HP per second.',
        icon: '❤️'
    },
    DRAIN: {
        id: 'DRAIN',
        name: 'Entropy Syphon',
        desc: 'Drains your Entropy on hit.',
        icon: '🌀'
    }
};

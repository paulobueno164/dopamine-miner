export const DroneTraits = {
    HARVESTER: {
        id: 'harvester',
        name: 'Entropy Harvester',
        bonus: { type: 'entropy_mult', value: 0.1 },
        desc: '+10% Entropy production'
    },
    STABILIZER: {
        id: 'stabilizer',
        name: 'Void Shield',
        bonus: { type: 'decay_res', value: 0.05 },
        desc: '-5% Stability decay'
    },
    TREASURE_HUNTER: {
        id: 'scavenger',
        name: 'Item Scavenger',
        bonus: { type: 'luck', value: 0.2 },
        desc: '+20% Luck multiplier'
    },
    OVERCLOCKER: {
        id: 'overclocker',
        name: 'Neural Accelerator',
        bonus: { type: 'auto_dps', value: 0.15 },
        desc: '+15% Auto Damage'
    }
};

export const DroneRarities = [
    { id: 'COMMON', weight: 70, mult: 1, color: '#888' },
    { id: 'UNCOMMON', weight: 20, mult: 1.5, color: '#00ff9d' },
    { id: 'RARE', weight: 8, mult: 2.5, color: '#00d4ff' },
    { id: 'LEGENDARY', weight: 1.8, mult: 5, color: '#ff0055' },
    { id: 'VOID-FORGED', weight: 0.2, mult: 15, color: '#bd00ff' }
];

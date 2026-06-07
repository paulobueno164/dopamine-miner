export const Skills = [
    {
        id: 'void_strike',
        name: 'VOID STRIKE',
        description: 'Deal 10% of Enemy Max HP instantly.',
        type: 'instant',
        cooldown: 60, // seconds
        effect: (game) => {
            const dmg = game.enemies.maxHp * 0.10;
            const actual = game.enemies.takeDamage(dmg);
            game.economy.addEntropy(actual);
            game.renderer.triggerShake();
            game.eventBus.emit('system_message', { text: `VOID STRIKE: ${game.economy.formatNumber(actual)} DMG`, type: 'success' });
        }
    },
    {
        id: 'overclock',
        name: 'OVERCLOCK',
        description: 'Double Auto-DPS for 30 seconds.',
        type: 'buff',
        duration: 30,
        cooldown: 300,
        effect: (game) => {
            // We need a way to apply temp buffs. 
            // For now, we can handle this in SkillSystem logic by modifying a multiplier there
            // that ProgressionSystem reads.
            game.eventBus.emit('system_message', { text: "SYSTEM OVERCLOCKED: 200% EFFICIENCY", type: 'success' });
        }
    },
    {
        id: 'stabilize',
        name: 'EMERGENCY STABILIZE',
        description: 'Restore 50% Stability immediately.',
        type: 'instant',
        cooldown: 120,
        effect: (game) => {
            game.psychology.stability = Math.min(100, game.psychology.stability + 50);
            game.eventBus.emit('stability_update', game.psychology.stability);
            game.eventBus.emit('system_message', { text: "CORE STABILIZED", type: 'success' });
        }
    },
    {
        id: 'emp_blast',
        name: 'KINETIC EMP',
        description: 'Instantly breaks Enemy Shields + 500 DMG.',
        type: 'instant',
        cooldown: 45,
        effect: (game) => {
            if (game.enemies.shieldIntegrity > 0) {
                game.enemies.shieldIntegrity = 0;
                game.eventBus.emit('system_message', { text: "SHIELD SHATTERED", type: 'success' });
            }
            const dmg = 500 * (1 + (game.enemies.level * 0.1)); // Scaling dmg
            game.enemies.takeDamage(dmg);
            game.renderer.spawnClickPulse({ x: game.renderer.centerX, y: game.renderer.centerY }); // Visual
        }
    },
    {
        id: 'null_field',
        name: 'NULL FIELD',
        description: 'Disables Enemy Regen/Drain for 15s.',
        type: 'buff',
        duration: 15,
        cooldown: 60,
        effect: (game) => {
            game.eventBus.emit('enemy_debuff', { type: 'null_field', duration: 15 });
            game.eventBus.emit('system_message', { text: "NULL FIELD GENERATED", type: 'success' });
        }
    },
    {
        id: 'time_dilation',
        name: 'CHRONO SURGE',
        description: 'Add +15s to Boss Timer.',
        type: 'instant',
        cooldown: 90,
        effect: (game) => {
            if (game.enemies.isBoss) {
                game.enemies.bossTimer += 15;
                game.eventBus.emit('system_message', { text: "TEMPORAL INJECTION: +15s", type: 'success' });
            } else {
                game.eventBus.emit('system_message', { text: "NO VALID TARGET", type: 'warning' });
            }
        }
    }
];

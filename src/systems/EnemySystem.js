import { EnemyConfig } from '../config/EnemyConfig.js';
import { EnemyAbilities } from '../config/EnemyAbilities.js';

export class EnemySystem {
    constructor(eventBus) {
        this.eventBus = eventBus;

        this.level = 1;
        this.currentHp = 0;
        this.maxHp = 0;
        this.isBoss = false;
        this.bossTimer = 0;
        this.bossTimeLimit = 30; // Seconds
        this.visuals = {}; // { shape, color, seed }
        this.hasNullField = false;
        this.nullFieldTimer = 0;
        this.difficultyMultiplier = 1.0;
        this.spawnRateMultiplier = 1.0;

        this.eventBus.on('enemy_debuff', (data) => {
            if (data.type === 'null_field') {
                this.hasNullField = true;
                this.nullFieldTimer = data.duration;
            }
        });

        this.spawn();
    }

    spawn() {
        this.isBoss = (this.level % EnemyConfig.bossInterval === 0);
        this.abilities = [];

        // Calculate HP (with difficulty multiplier)
        let hp = EnemyConfig.baseHp * Math.pow(EnemyConfig.hpGrowth, this.level - 1) * this.difficultyMultiplier;

        if (this.isBoss) {
            hp *= EnemyConfig.bossHpMultiplier;
            // Bosses get 1 random ability
            const keys = Object.keys(EnemyAbilities);
            const key = keys[Math.floor(Math.random() * keys.length)];
            this.abilities.push(EnemyAbilities[key]);

            // Initial Shield logic
            if (this.hasAbility('SHIELD')) {
                this.shieldIntegrity = 10; // 10 Clicks to break
                this.maxShield = 10;
            }
        }

        this.maxHp = Math.floor(hp);
        this.currentHp = this.maxHp;
        this.bossTimer = this.bossTimeLimit;

        // Procedural Visuals
        const shapes = ['square', 'triangle', 'pentagon', 'hex', 'glitch'];
        this.visuals = {
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            color: this.isBoss ? '#ffaa00' : `hsl(${Math.random() * 360}, 70%, 50%)`,
            sides: 3 + Math.floor(Math.random() * 5),
            rotateSpeed: (Math.random() - 0.5) * 5
        };

        this.eventBus.emit('enemy_spawned', {
            level: this.level,
            maxHp: this.maxHp,
            isBoss: this.isBoss,
            abilities: this.abilities
        });
    }

    hasAbility(id) {
        return this.abilities.find(a => a.id === id);
    }

    takeDamage(amount, source = 'auto') {
        if (this.currentHp <= 0) return 0; // Already dead

        // SHIELD Ability Logic
        if (this.hasAbility('SHIELD') && this.shieldIntegrity > 0) {
            if (source === 'click') {
                this.shieldIntegrity--;
                this.eventBus.emit('shield_hit', { current: this.shieldIntegrity, max: this.maxShield });
                if (this.shieldIntegrity <= 0) {
                    this.eventBus.emit('system_message', { text: "SHIELD BREACHED", type: 'success' });
                }
                return 0; // Click damages shield, not HP
            } else {
                // Auto Damage blocked completely
                return 0;
            }
        }

        this.currentHp -= amount;

        // Visual shake event is handled by renderer via 'damage' event usually, 
        // but we can emit specific enemy hit info if we want.

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.die();
            return amount + (Math.abs(this.currentHp)); // Return overflow? rarely needed
        }

        return amount;
    }

    die() {
        this.eventBus.emit('enemy_killed', {
            level: this.level,
            isBoss: this.isBoss
        });

        // Progress
        this.level++;
        this.spawn();
    }

    update(dt) {
        // Debuffs
        if (this.hasNullField) {
            this.nullFieldTimer -= dt;
            if (this.nullFieldTimer <= 0) {
                this.hasNullField = false;
                this.eventBus.emit('system_message', { text: "NULL FIELD EXPIRED", type: 'warning' });
            }
        }

        if (this.isBoss) {
            this.bossTimer -= dt;
            if (this.bossTimer <= 0) {
                this.bossTimer = 0;
                this.handleBossTimeout();
            }

            // REGEN Logic
            if (this.hasAbility('REGEN') && !this.hasNullField) {
                // Regen 5% per second
                const regen = (this.maxHp * 0.05) * dt;
                this.currentHp += regen;
                if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
            }

            // DRAIN Logic
            if (this.hasAbility('DRAIN') && !this.hasNullField) {
                this.eventBus.emit('entropy_drain', dt);
            }
        }
    }

    handleBossTimeout() {
        this.eventBus.emit('system_message', { text: "BOSS TIMEOUT: RETREATING...", type: 'error' });
        // Retreat logic: Go back 1 level (or to beginning of boss wave? Let's just go back 1)
        // Actually, if we are at Lvl 10 (Boss), we go back to Lvl 9.
        if (this.level > 1) this.level--;
        this.spawn();
    }

    getHpPercent() {
        return this.currentHp / this.maxHp;
    }

    setDifficultyMultiplier(multiplier) {
        this.difficultyMultiplier = multiplier;
    }

    setSpawnRateMultiplier(multiplier) {
        this.spawnRateMultiplier = multiplier;
    }

    serialize() {
        return {
            level: this.level,
            difficultyMultiplier: this.difficultyMultiplier,
            spawnRateMultiplier: this.spawnRateMultiplier
        };
    }

    deserialize(data) {
        if (!data) return;
        this.level = data.level || 1;
        this.difficultyMultiplier = data.difficultyMultiplier || 1.0;
        this.spawnRateMultiplier = data.spawnRateMultiplier || 1.0;
        this.spawn(); // Respawn at saved level
    }
}

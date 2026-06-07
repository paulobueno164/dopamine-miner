/**
 * MINIGAME SYSTEM - Break from Grind
 * 
 * Provides variety and skill-based rewards.
 * Creates engagement spikes through different gameplay.
 */

export class MiniGameSystem {
    constructor(eventBus, economy) {
        this.eventBus = eventBus;
        this.economy = economy;
        
        this.miniGames = [
            {
                id: 'memory_game',
                name: 'MEMORY MATRIX',
                description: 'Match the sequence. Higher score = better rewards.',
                cost: 100,
                rewardMultiplier: 1.0
            },
            {
                id: 'reaction_test',
                name: 'REACTION TEST',
                description: 'Click when the signal appears. Fast reactions = bonus.',
                cost: 50,
                rewardMultiplier: 0.5
            },
            {
                id: 'pattern_match',
                name: 'PATTERN MATCH',
                description: 'Identify the pattern. Complexity increases with score.',
                cost: 200,
                rewardMultiplier: 2.0
            }
        ];
        
        this.highScores = {};
        this.cooldowns = {};
    }

    canPlay(gameId) {
        const game = this.miniGames.find(g => g.id === gameId);
        if (!game) return false;
        
        if (this.economy.entropy < game.cost) return false;
        
        const cooldown = this.cooldowns[gameId] || 0;
        if (cooldown > Date.now()) return false;
        
        return true;
    }

    startGame(gameId) {
        if (!this.canPlay(gameId)) {
            this.eventBus.emit('system_message', {
                text: 'CANNOT START MINIGAME',
                type: 'error'
            });
            return null;
        }
        
        const game = this.miniGames.find(g => g.id === gameId);
        this.economy.spendEntropy(game.cost);
        
        // Set cooldown (5 minutes)
        this.cooldowns[gameId] = Date.now() + (5 * 60 * 1000);
        
        this.eventBus.emit('minigame_started', game);
        return game;
    }

    completeGame(gameId, score) {
        const game = this.miniGames.find(g => g.id === gameId);
        if (!game) return;
        
        // Update high score
        if (!this.highScores[gameId] || score > this.highScores[gameId]) {
            this.highScores[gameId] = score;
            this.eventBus.emit('minigame_high_score', { gameId, score });
        }
        
        // Calculate reward
        const baseReward = game.cost * game.rewardMultiplier;
        const scoreBonus = score * 10; // 10 entropy per point
        const totalReward = baseReward + scoreBonus;
        
        this.economy.addEntropy(totalReward);
        
        this.eventBus.emit('minigame_completed', {
            gameId,
            score,
            reward: totalReward
        });
        
        this.eventBus.emit('system_message', {
            text: `MINIGAME COMPLETE: +${this.economy.formatNumber(totalReward)} ENTROPY`,
            type: 'success'
        });
    }

    getHighScore(gameId) {
        return this.highScores[gameId] || 0;
    }

    getCooldownRemaining(gameId) {
        const cooldown = this.cooldowns[gameId] || 0;
        if (cooldown <= Date.now()) return 0;
        return Math.ceil((cooldown - Date.now()) / 1000);
    }

    getMiniGames() {
        return this.miniGames;
    }

    serialize() {
        return {
            highScores: this.highScores,
            cooldowns: Object.keys(this.cooldowns).reduce((acc, key) => {
                const remaining = this.cooldowns[key] - Date.now();
                if (remaining > 0) {
                    acc[key] = this.cooldowns[key];
                }
                return acc;
            }, {})
        };
    }

    deserialize(data) {
        if (data) {
            this.highScores = data.highScores || {};
            this.cooldowns = data.cooldowns || {};
        }
    }
}



/**
 * PVP SYSTEM - Competitive Battles
 * 
 * Simulates PvP battles for competitive engagement.
 * Creates urgency and skill-based rewards.
 */

export class PvPSystem {
    constructor(eventBus, economy, progression, enemies) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        this.enemies = enemies;
        
        this.rank = 1000; // ELO-style ranking
        this.wins = 0;
        this.losses = 0;
        this.streak = 0;
        this.lastBattleTime = 0;
        this.battleCooldown = 60; // 1 minute between battles
        
        this.opponents = [];
        this.generateOpponents();
    }

    generateOpponents() {
        // Generate opponents based on current rank
        this.opponents = [];
        
        for (let i = 0; i < 5; i++) {
            const rankDiff = (Math.random() - 0.5) * 200; // ±100 rank difference
            const opponentRank = Math.max(500, this.rank + rankDiff);
            
            this.opponents.push({
                id: `opponent_${i}`,
                name: this.generateOpponentName(),
                rank: Math.floor(opponentRank),
                power: this.calculatePower(opponentRank),
                winRate: 0.4 + Math.random() * 0.2 // 40-60% win rate
            });
        }
    }

    generateOpponentName() {
        const names = [
            'Void_Walker', 'Entropy_King', 'Neural_Hacker',
            'Quantum_Breaker', 'Reality_Slayer', 'Data_Destroyer'
        ];
        return names[Math.floor(Math.random() * names.length)] + '_' + 
               Math.floor(Math.random() * 1000);
    }

    calculatePower(rank) {
        // Power based on rank and player stats
        const basePower = this.progression.getClickDamage() + this.progression.getAutoDps();
        const rankMultiplier = rank / 1000;
        return basePower * (0.8 + rankMultiplier * 0.4); // 80-120% of player power
    }

    canBattle() {
        const now = Date.now();
        return (now - this.lastBattleTime) >= (this.battleCooldown * 1000);
    }

    startBattle(opponentId) {
        if (!this.canBattle()) {
            this.eventBus.emit('system_message', {
                text: `BATTLE COOLDOWN: ${Math.ceil((this.battleCooldown * 1000 - (Date.now() - this.lastBattleTime)) / 1000)}s`,
                type: 'error'
            });
            return null;
        }
        
        const opponent = this.opponents.find(o => o.id === opponentId);
        if (!opponent) return null;
        
        this.lastBattleTime = Date.now();
        
        // Simulate battle
        const playerPower = this.progression.getClickDamage() + this.progression.getAutoDps();
        const opponentPower = opponent.power;
        
        // Add some randomness
        const playerRoll = playerPower * (0.9 + Math.random() * 0.2);
        const opponentRoll = opponentPower * (0.9 + Math.random() * 0.2);
        
        const victory = playerRoll > opponentRoll;
        
        if (victory) {
            this.wins++;
            this.streak++;
            this.rank += Math.max(10, 50 - Math.floor((this.rank - opponent.rank) / 10));
            
            const reward = 100 + (opponent.rank / 10);
            this.economy.addEntropy(reward);
            
            this.eventBus.emit('pvp_victory', {
                opponent,
                reward,
                newRank: this.rank,
                streak: this.streak
            });
            
            this.eventBus.emit('system_message', {
                text: `VICTORY! +${this.economy.formatNumber(reward)} ENTROPY (Rank: ${this.rank})`,
                type: 'success'
            });
        } else {
            this.losses++;
            this.streak = 0;
            this.rank = Math.max(500, this.rank - Math.max(5, 20 - Math.floor((opponent.rank - this.rank) / 10)));
            
            this.eventBus.emit('pvp_defeat', {
                opponent,
                newRank: this.rank
            });
            
            this.eventBus.emit('system_message', {
                text: `DEFEAT! Rank: ${this.rank}`,
                type: 'error'
            });
        }
        
        // Regenerate opponents
        this.generateOpponents();
        
        return { victory, opponent };
    }

    getOpponents() {
        return this.opponents;
    }

    getStats() {
        return {
            rank: this.rank,
            wins: this.wins,
            losses: this.losses,
            streak: this.streak,
            winRate: this.wins / Math.max(1, this.wins + this.losses)
        };
    }

    serialize() {
        return {
            rank: this.rank,
            wins: this.wins,
            losses: this.losses,
            streak: this.streak,
            lastBattleTime: this.lastBattleTime
        };
    }

    deserialize(data) {
        if (data) {
            this.rank = data.rank || 1000;
            this.wins = data.wins || 0;
            this.losses = data.losses || 0;
            this.streak = data.streak || 0;
            this.lastBattleTime = data.lastBattleTime || 0;
            this.generateOpponents();
        }
    }
}



/**
 * LEADERBOARD SYSTEM - Competitive Rankings
 * 
 * Creates social comparison and competition.
 * Drives engagement through competitive pressure.
 */

export class LeaderboardSystem {
    constructor(eventBus, economy, statistics) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.statistics = statistics;
        
        this.leaderboards = {
            entropy: [],
            prestige: [],
            clicks: [],
            playtime: []
        };
        
        this.playerRank = {
            entropy: 999,
            prestige: 999,
            clicks: 999,
            playtime: 999
        };
        
        this.updateInterval = 30000; // Update every 30 seconds
        this.generateLeaderboard();
        
        setInterval(() => this.updateLeaderboard(), this.updateInterval);
    }

    generateLeaderboard() {
        // Generate fake competitive players
        const fakePlayers = [];
        const playerStats = this.statistics.getStats();
        
        // Generate players slightly ahead/behind
        for (let i = 0; i < 50; i++) {
            const baseEntropy = this.economy.lifetimeEntropy || 0;
            const variance = baseEntropy * (0.5 + Math.random());
            
            fakePlayers.push({
                id: `player_${i}`,
                name: this.generateFakeName(),
                entropy: Math.floor(baseEntropy * (0.3 + Math.random() * 1.4)),
                prestige: Math.floor((this.statistics.stats.prestigeCount || 0) * (0.2 + Math.random() * 1.6)),
                clicks: Math.floor((playerStats.totalClicks || 0) * (0.4 + Math.random() * 1.2)),
                playtime: Math.floor((playerStats.totalPlayTime || 0) * (0.5 + Math.random() * 1.0))
            });
        }
        
        // Add current player
        fakePlayers.push({
            id: 'current_player',
            name: 'YOU',
            entropy: this.economy.lifetimeEntropy || 0,
            prestige: this.statistics.stats.prestigeCount || 0,
            clicks: playerStats.totalClicks || 0,
            playtime: playerStats.totalPlayTime || 0,
            isPlayer: true
        });
        
        // Sort and rank
        this.leaderboards.entropy = [...fakePlayers].sort((a, b) => b.entropy - a.entropy);
        this.leaderboards.prestige = [...fakePlayers].sort((a, b) => b.prestige - a.prestige);
        this.leaderboards.clicks = [...fakePlayers].sort((a, b) => b.clicks - a.clicks);
        this.leaderboards.playtime = [...fakePlayers].sort((a, b) => b.playtime - a.playtime);
        
        // Calculate player ranks
        this.updatePlayerRanks();
    }

    generateFakeName() {
        const prefixes = ['Unit_', 'Null_', 'Void_', 'Core_', 'Data_', 'Byte_', 'Code_'];
        const suffixes = ['734', 'X99', 'Alpha', 'Beta', 'Prime', 'Zero', 'One'];
        return prefixes[Math.floor(Math.random() * prefixes.length)] + 
               suffixes[Math.floor(Math.random() * suffixes.length)];
    }

    updatePlayerRanks() {
        this.playerRank.entropy = this.leaderboards.entropy.findIndex(p => p.isPlayer) + 1;
        this.playerRank.prestige = this.leaderboards.prestige.findIndex(p => p.isPlayer) + 1;
        this.playerRank.clicks = this.leaderboards.clicks.findIndex(p => p.isPlayer) + 1;
        this.playerRank.playtime = this.leaderboards.playtime.findIndex(p => p.isPlayer) + 1;
    }

    updateLeaderboard() {
        this.generateLeaderboard();
        this.eventBus.emit('leaderboard_updated', this.leaderboards);
    }

    getLeaderboard(type = 'entropy', limit = 10) {
        return this.leaderboards[type].slice(0, limit);
    }

    getPlayerRank(type = 'entropy') {
        return this.playerRank[type];
    }

    getPlayerStats() {
        return {
            rank: this.playerRank,
            stats: {
                entropy: this.economy.lifetimeEntropy || 0,
                prestige: this.statistics.stats.prestigeCount || 0,
                clicks: this.statistics.stats.totalClicks || 0,
                playtime: this.statistics.stats.totalPlayTime || 0
            }
        };
    }
}



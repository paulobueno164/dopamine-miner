/**
 * ANALYTICS SYSTEM - Advanced Statistics
 * 
 * Provides detailed analytics and insights.
 * Helps players understand their progress.
 */

export class AnalyticsSystem {
    constructor(eventBus, statistics, economy, progression) {
        this.eventBus = eventBus;
        this.statistics = statistics;
        this.economy = economy;
        this.progression = progression;
        
        this.sessionData = {
            startTime: Date.now(),
            entropyGained: 0,
            entropySpent: 0,
            clicks: 0,
            upgrades: 0,
            enemiesKilled: 0
        };
        
        this.hourlyData = [];
        this.dailyData = [];
        
        // Track hourly progress
        setInterval(() => this.recordHourlyData(), 3600000); // Every hour
    }

    recordHourlyData() {
        const stats = this.statistics.getStats();
        const data = {
            timestamp: Date.now(),
            entropy: this.economy.entropy,
            totalEntropy: stats.totalEntropyEarned,
            clicks: stats.totalClicks,
            enemies: stats.enemiesKilled,
            prestige: stats.prestigeCount
        };
        
        this.hourlyData.push(data);
        
        // Keep last 24 hours
        if (this.hourlyData.length > 24) {
            this.hourlyData.shift();
        }
    }

    getSessionStats() {
        const sessionTime = (Date.now() - this.sessionData.startTime) / 1000 / 60; // minutes
        return {
            ...this.sessionData,
            sessionTime: sessionTime,
            entropyPerMinute: this.sessionData.entropyGained / Math.max(1, sessionTime),
            clicksPerMinute: this.sessionData.clicks / Math.max(1, sessionTime)
        };
    }

    getHourlyTrend() {
        return this.hourlyData;
    }

    getEfficiencyMetrics() {
        const stats = this.statistics.getStats();
        const totalTime = stats.totalPlayTime || 1;
        
        return {
            entropyPerHour: (stats.totalEntropyEarned / totalTime) * 3600,
            clicksPerHour: (stats.totalClicks / totalTime) * 3600,
            enemiesPerHour: (stats.enemiesKilled / totalTime) * 3600,
            efficiency: stats.totalEntropyEarned / Math.max(1, stats.totalClicks)
        };
    }

    getProgressRate() {
        const stats = this.statistics.getStats();
        const hourly = this.getHourlyTrend();
        
        if (hourly.length < 2) return null;
        
        const recent = hourly.slice(-3);
        const older = hourly.slice(-6, -3);
        
        if (older.length === 0) return null;
        
        const recentAvg = recent.reduce((sum, d) => sum + d.entropy, 0) / recent.length;
        const olderAvg = older.reduce((sum, d) => sum + d.entropy, 0) / older.length;
        
        return {
            rate: ((recentAvg - olderAvg) / Math.max(1, olderAvg)) * 100,
            improving: recentAvg > olderAvg
        };
    }

    getRecommendations() {
        const recommendations = [];
        const stats = this.statistics.getStats();
        const efficiency = this.getEfficiencyMetrics();
        
        if (efficiency.clicksPerHour < 100) {
            recommendations.push({
                type: 'action',
                text: 'Increase clicking activity for faster progress',
                priority: 'high'
            });
        }
        
        if (this.economy.entropy > 10000 && Object.keys(this.progression.ownedUpgrades).length === 0) {
            recommendations.push({
                type: 'upgrade',
                text: 'Purchase upgrades to boost efficiency',
                priority: 'high'
            });
        }
        
        if (stats.prestigeCount === 0 && this.economy.lifetimeEntropy > 100000) {
            recommendations.push({
                type: 'prestige',
                text: 'Consider Prestige for permanent multipliers',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    serialize() {
        return {
            sessionData: this.sessionData,
            hourlyData: this.hourlyData.slice(-24), // Last 24 hours
            dailyData: this.dailyData.slice(-7) // Last 7 days
        };
    }

    deserialize(data) {
        if (data) {
            this.sessionData = data.sessionData || {
                startTime: Date.now(),
                entropyGained: 0,
                entropySpent: 0,
                clicks: 0,
                upgrades: 0,
                enemiesKilled: 0
            };
            this.hourlyData = data.hourlyData || [];
            this.dailyData = data.dailyData || [];
        }
    }
}



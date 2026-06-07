/**
 * DATA EXPORT SYSTEM - Advanced Save Management
 * 
 * Provides advanced export/import functionality.
 * Allows players to backup and share saves.
 */

export class DataExportSystem {
    constructor(eventBus, saveSystem) {
        this.eventBus = eventBus;
        this.saveSystem = saveSystem;
    }

    exportFullData() {
        const data = {
            version: '1.0',
            timestamp: Date.now(),
            save: this.saveSystem.exportSave(),
            metadata: {
                playtime: this.getPlaytime(),
                version: 'VOID PROTOCOL v1.0'
            }
        };
        
        return btoa(JSON.stringify(data));
    }

    importFullData(base64Data) {
        try {
            const json = atob(base64Data);
            const data = JSON.parse(json);
            
            if (data.save) {
                return this.saveSystem.importSave(data.save);
            }
            
            return false;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }

    exportStatistics() {
        // Export only statistics for sharing
        const stats = {
            totalClicks: window.game?.statistics?.stats?.totalClicks || 0,
            totalEntropy: window.game?.statistics?.stats?.totalEntropyEarned || 0,
            prestigeCount: window.game?.statistics?.stats?.prestigeCount || 0,
            achievements: window.game?.statistics?.stats?.achievementsUnlocked || 0
        };
        
        return btoa(JSON.stringify(stats));
    }

    generateSaveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            entropy: window.game?.economy?.entropy || 0,
            premium: window.game?.economy?.premium || 0,
            level: window.game?.enemies?.level || 0,
            upgrades: Object.keys(window.game?.progression?.ownedUpgrades || {}).length,
            achievements: window.game?.achievements?.unlocked?.length || 0,
            playtime: this.getPlaytime()
        };
        
        return report;
    }

    getPlaytime() {
        if (window.game?.statistics) {
            const stats = window.game.statistics.getStats();
            return Math.floor(stats.totalPlayTime / 3600) + 'h ' + 
                   Math.floor((stats.totalPlayTime % 3600) / 60) + 'm';
        }
        return '0h 0m';
    }

    validateSaveData(data) {
        try {
            const json = atob(data);
            const parsed = JSON.parse(json);
            
            // Check required fields
            if (!parsed.timestamp || !parsed.economy) {
                return false;
            }
            
            return true;
        } catch (e) {
            return false;
        }
    }
}



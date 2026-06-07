/**
 * PERSISTENCE LAYER
 * 
 * "The golden handcuffs."
 * Ensures the player's investment is locked in. 
 * If they leave, they don't lose progress (which would be relief),
 * they lose *potential* progress (FOMO).
 */
export class SaveSystem {
    constructor(eventBus, systems) {
        this.eventBus = eventBus;
        this.systems = systems; // { economy, progression, inventory, psychology }
        this.saveKey = 'VOID_PROTOCOL_SAVE_V1';
        this.backupKey = 'VOID_PROTOCOL_SAVE_BACKUP';
        this.autoSaveInterval = null;
        this.backupInterval = null;
    }

    startAutoSave() {
        // Save every 30 seconds
        this.autoSaveInterval = setInterval(() => this.save(), 30000);
        
        // Create backup every 5 minutes
        this.backupInterval = setInterval(() => this.createBackup(), 300000);

        // Save on close
        window.addEventListener('beforeunload', () => {
            this.save();
            this.createBackup();
        });
    }
    
    createBackup() {
        try {
            const currentSave = localStorage.getItem(this.saveKey);
            if (currentSave) {
                localStorage.setItem(this.backupKey, currentSave);
                console.log('[SAVE] Backup created');
            }
        } catch (e) {
            console.error('Backup failed', e);
        }
    }
    
    restoreBackup() {
        try {
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                localStorage.setItem(this.saveKey, backup);
                this.eventBus.emit('system_message', { 
                    text: 'BACKUP RESTORED', 
                    type: 'success' 
                });
                return true;
            }
        } catch (e) {
            console.error('Restore failed', e);
        }
        return false;
    }

    save() {
        const data = {
            timestamp: Date.now(),
            economy: this.systems.economy.serialize(),
            progression: this.systems.progression.serialize(),
            inventory: this.systems.inventory.serialize(),
            psychology: this.systems.psychology.serialize(),
            prestige: this.systems.prestige.serialize(),
            achievements: this.systems.achievements.serialize(),
            enemies: this.systems.enemies.serialize(),
            story: this.systems.story.serialize(),
            daily: this.systems.daily.serialize(),
            tree: this.systems.tree.serialize(),
            challenges: this.systems.challenges.serialize(),
            drones: this.systems.drones ? this.systems.drones.serialize() : null,
            statistics: this.systems.statistics ? this.systems.statistics.export() : null,
            quests: this.systems.quests ? this.systems.quests.serialize() : null,
            events: this.systems.events ? this.systems.events.serialize() : null,
            research: this.systems.research ? this.systems.research.serialize() : null,
            buffs: this.systems.buffs ? this.systems.buffs.serialize() : null,
            crafting: this.systems.crafting ? this.systems.crafting.serialize() : null,
            milestones: this.systems.milestones ? this.systems.milestones.serialize() : null,
            timeRewards: this.systems.timeRewards ? this.systems.timeRewards.serialize() : null,
            mods: this.systems.mods ? this.systems.mods.serialize() : null,
            seasonal: this.systems.seasonal ? this.systems.seasonal.serialize() : null,
            guilds: this.systems.guilds ? this.systems.guilds.serialize() : null,
            miniGames: this.systems.miniGames ? this.systems.miniGames.serialize() : null,
            pvp: this.systems.pvp ? this.systems.pvp.serialize() : null,
            streakRewards: this.systems.streakRewards ? this.systems.streakRewards.serialize() : null,
            analytics: this.systems.analytics ? this.systems.analytics.serialize() : null,
            trading: this.systems.trading ? this.systems.trading.serialize() : null,
            automation: this.systems.automation ? this.systems.automation.serialize() : null,
            advancedPrestige: this.systems.advancedPrestige ? this.systems.advancedPrestige.serialize() : null,
            advancedAchievements: this.systems.advancedAchievements ? this.systems.advancedAchievements.serialize() : null,
            difficultyModifiers: this.systems.difficultyModifiers ? this.systems.difficultyModifiers.serialize() : null
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(data));
            // Only show notification on manual saves, not auto-saves
            if (this.showSaveNotification) {
                this.eventBus.emit('system_message', { text: "NEURAL LINK SYNCED", type: 'success' });
                this.showSaveNotification = false;
            }
            console.log('[SAVE] Game saved.');
        } catch (e) {
            console.error('Save failed', e);
            this.eventBus.emit('system_message', { text: "SAVE FAILED", type: 'error' });
        }
    }

    load() {
        const raw = localStorage.getItem(this.saveKey);
        if (!raw) return false;

        try {
            const data = JSON.parse(raw);

            // Calculate Offline Progress
            const now = Date.now();
            const diff = (now - data.timestamp) / 1000;
            if (diff > 60) {
                this.handleOfflineProgress(diff, data);
            }

            this.systems.economy.deserialize(data.economy);
            this.systems.progression.deserialize(data.progression);
            this.systems.inventory.deserialize(data.inventory);
            this.systems.psychology.deserialize(data.psychology);
            if (data.prestige) this.systems.prestige.deserialize(data.prestige);
            if (data.achievements) this.systems.achievements.deserialize(data.achievements);
            if (data.enemies) this.systems.enemies.deserialize(data.enemies);
            if (data.story) this.systems.story.deserialize(data.story);
            if (data.daily) this.systems.daily.deserialize(data.daily);
            if (data.tree) this.systems.tree.deserialize(data.tree);
            if (data.challenges) this.systems.challenges.deserialize(data.challenges);
            if (data.drones && this.systems.drones) this.systems.drones.deserialize(data.drones);
            if (data.statistics && this.systems.statistics) this.systems.statistics.import(data.statistics);
            if (data.quests && this.systems.quests) this.systems.quests.deserialize(data.quests);
            if (data.events && this.systems.events) this.systems.events.deserialize(data.events);
            if (data.research && this.systems.research) this.systems.research.deserialize(data.research);
            if (data.buffs && this.systems.buffs) this.systems.buffs.deserialize(data.buffs);
            if (data.crafting && this.systems.crafting) this.systems.crafting.deserialize(data.crafting);
            if (data.milestones && this.systems.milestones) this.systems.milestones.deserialize(data.milestones);
            if (data.timeRewards && this.systems.timeRewards) this.systems.timeRewards.deserialize(data.timeRewards);
            if (data.mods && this.systems.mods) this.systems.mods.deserialize(data.mods);
            if (data.seasonal && this.systems.seasonal) this.systems.seasonal.deserialize(data.seasonal);
            if (data.guilds && this.systems.guilds) this.systems.guilds.deserialize(data.guilds);
            if (data.miniGames && this.systems.miniGames) this.systems.miniGames.deserialize(data.miniGames);
            if (data.pvp && this.systems.pvp) this.systems.pvp.deserialize(data.pvp);
            if (data.streakRewards && this.systems.streakRewards) this.systems.streakRewards.deserialize(data.streakRewards);
            if (data.analytics && this.systems.analytics) this.systems.analytics.deserialize(data.analytics);
            if (data.trading && this.systems.trading) this.systems.trading.deserialize(data.trading);
            if (data.automation && this.systems.automation) this.systems.automation.deserialize(data.automation);
            if (data.advancedPrestige && this.systems.advancedPrestige) this.systems.advancedPrestige.deserialize(data.advancedPrestige);
            if (data.advancedAchievements && this.systems.advancedAchievements) this.systems.advancedAchievements.deserialize(data.advancedAchievements);
            if (data.difficultyModifiers && this.systems.difficultyModifiers) this.systems.difficultyModifiers.deserialize(data.difficultyModifiers);

            return true;
        } catch (e) {
            console.error('Load failed', e);
            return false;
        }
    }

    handleOfflineProgress(seconds, data) {
        this.eventBus.emit('offline_progress', seconds);
    }

    exportSave() {
        // Force a save before export
        this.save();
        // Reuse save logic or just read from localstorage for simplicity
        const raw = localStorage.getItem(this.saveKey);
        if (!raw) return "";
        return btoa(raw);
    }

    importSave(base64Str) {
        try {
            const raw = atob(base64Str);
            JSON.parse(raw); // Check validity
            localStorage.setItem(this.saveKey, raw);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    hardReset() {
        localStorage.removeItem(this.saveKey);
        localStorage.removeItem('TUTORIAL_COMPLETED');
        location.reload();
    }
}

/**
 * GUILD SYSTEM - Social Cooperation
 * 
 * Creates social bonds and group goals.
 * Encourages return visits through group activities.
 */

export class GuildSystem {
    constructor(eventBus, economy, statistics) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.statistics = statistics;
        
        this.playerGuild = null;
        this.guilds = [];
        this.guildIdCounter = 0;
        
        this.generateGuilds();
    }

    generateGuilds() {
        // Generate fake guilds for social comparison
        const guildNames = [
            'VOID HUNTERS', 'ENTROPY COLLECTORS', 'NEURAL NETWORK',
            'DIGITAL ASCENDANTS', 'QUANTUM MINERS', 'REALITY BREAKERS'
        ];
        
        guildNames.forEach(name => {
            this.guilds.push({
                id: this.guildIdCounter++,
                name: name,
                members: 5 + Math.floor(Math.random() * 20),
                totalEntropy: Math.floor(Math.random() * 1000000000),
                level: 1 + Math.floor(Math.random() * 10),
                description: 'Active mining guild',
                isPlayerGuild: false
            });
        });
    }

    createGuild(name, description) {
        if (this.playerGuild) {
            this.eventBus.emit('system_message', {
                text: 'ALREADY IN A GUILD',
                type: 'error'
            });
            return false;
        }
        
        const guild = {
            id: this.guildIdCounter++,
            name: name,
            members: 1,
            totalEntropy: 0,
            level: 1,
            description: description,
            isPlayerGuild: true,
            created: Date.now()
        };
        
        this.playerGuild = guild;
        this.guilds.push(guild);
        
        this.eventBus.emit('guild_created', guild);
        this.eventBus.emit('system_message', {
            text: `GUILD CREATED: ${name}`,
            type: 'success'
        });
        
        return true;
    }

    joinGuild(guildId) {
        if (this.playerGuild) {
            this.eventBus.emit('system_message', {
                text: 'ALREADY IN A GUILD',
                type: 'error'
            });
            return false;
        }
        
        const guild = this.guilds.find(g => g.id === guildId);
        if (!guild) return false;
        
        this.playerGuild = guild;
        guild.members++;
        
        this.eventBus.emit('guild_joined', guild);
        this.eventBus.emit('system_message', {
            text: `JOINED GUILD: ${guild.name}`,
            type: 'success'
        });
        
        return true;
    }

    contributeEntropy(amount) {
        if (!this.playerGuild || !this.playerGuild.isPlayerGuild) return false;
        
        if (this.economy.entropy < amount) {
            this.eventBus.emit('system_message', {
                text: 'INSUFFICIENT ENTROPY',
                type: 'error'
            });
            return false;
        }
        
        this.economy.spendEntropy(amount);
        this.playerGuild.totalEntropy += amount;
        
        // Check for level up
        const oldLevel = this.playerGuild.level;
        this.playerGuild.level = Math.floor(Math.sqrt(this.playerGuild.totalEntropy / 100000)) + 1;
        
        if (this.playerGuild.level > oldLevel) {
            this.eventBus.emit('guild_level_up', {
                guild: this.playerGuild,
                newLevel: this.playerGuild.level
            });
            this.eventBus.emit('system_message', {
                text: `GUILD LEVEL UP: ${this.playerGuild.level}`,
                type: 'success'
            });
        }
        
        this.eventBus.emit('guild_contributed', { amount, guild: this.playerGuild });
        return true;
    }

    getGuildBonus() {
        if (!this.playerGuild) return 1.0;
        
        // Guild level provides small bonus
        return 1 + (this.playerGuild.level * 0.01); // 1% per level
    }

    getGuilds() {
        return this.guilds;
    }

    getPlayerGuild() {
        return this.playerGuild;
    }

    serialize() {
        return {
            playerGuild: this.playerGuild,
            guilds: this.guilds.filter(g => g.isPlayerGuild),
            guildIdCounter: this.guildIdCounter
        };
    }

    deserialize(data) {
        if (data) {
            this.playerGuild = data.playerGuild || null;
            this.guilds = [...this.guilds.filter(g => !g.isPlayerGuild), ...(data.guilds || [])];
            this.guildIdCounter = data.guildIdCounter || this.guildIdCounter;
        }
    }
}



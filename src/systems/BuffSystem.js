/**
 * BUFF SYSTEM - Temporary Status Effects
 * 
 * Provides visual feedback for temporary bonuses/debuffs.
 * Creates urgency and engagement through time-limited effects.
 */

export class BuffSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.activeBuffs = [];
        this.buffIdCounter = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for skill activations that might create buffs
        this.eventBus.on('active_skill', (skillData) => {
            // Some skills might create buffs
            if (skillData.buff) {
                this.addBuff(skillData.buff);
            }
        });
    }

    addBuff(buffData) {
        const buff = {
            id: this.buffIdCounter++,
            name: buffData.name,
            description: buffData.description,
            icon: buffData.icon || '⚡',
            color: buffData.color || '#00ff9d',
            duration: buffData.duration || 10, // seconds
            remaining: buffData.duration || 10,
            effect: buffData.effect || {},
            type: buffData.type || 'buff' // 'buff' or 'debuff'
        };
        
        // Check if buff already exists (stack or replace)
        const existing = this.activeBuffs.find(b => b.name === buff.name);
        if (existing && buffData.stackable) {
            existing.remaining = Math.max(existing.remaining, buff.remaining);
            existing.stacks = (existing.stacks || 1) + 1;
        } else if (existing && !buffData.stackable) {
            // Replace existing
            const index = this.activeBuffs.indexOf(existing);
            this.activeBuffs[index] = buff;
        } else {
            this.activeBuffs.push(buff);
        }
        
        this.eventBus.emit('buff_added', buff);
        return buff;
    }

    update(dt) {
        this.activeBuffs = this.activeBuffs.filter(buff => {
            buff.remaining -= dt;
            
            if (buff.remaining <= 0) {
                this.eventBus.emit('buff_expired', buff);
                return false;
            }
            return true;
        });
    }

    removeBuff(buffId) {
        const index = this.activeBuffs.findIndex(b => b.id === buffId);
        if (index > -1) {
            const buff = this.activeBuffs[index];
            this.activeBuffs.splice(index, 1);
            this.eventBus.emit('buff_removed', buff);
            return true;
        }
        return false;
    }

    getActiveBuffs() {
        return this.activeBuffs;
    }

    getBuffEffect(statName) {
        let totalMultiplier = 1.0;
        let totalBonus = 0;
        
        this.activeBuffs.forEach(buff => {
            if (buff.effect.stat === statName) {
                if (buff.effect.type === 'multiplier') {
                    totalMultiplier *= buff.effect.value;
                } else if (buff.effect.type === 'bonus') {
                    totalBonus += buff.effect.value;
                }
            }
        });
        
        return { multiplier: totalMultiplier, bonus: totalBonus };
    }

    hasBuff(buffName) {
        return this.activeBuffs.some(b => b.name === buffName);
    }

    serialize() {
        return {
            activeBuffs: this.activeBuffs.map(b => ({
                ...b,
                effect: b.effect
            }))
        };
    }

    deserialize(data) {
        if (data && data.activeBuffs) {
            this.activeBuffs = data.activeBuffs;
            this.buffIdCounter = Math.max(...this.activeBuffs.map(b => b.id), 0) + 1;
        }
    }
}



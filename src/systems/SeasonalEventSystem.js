/**
 * SEASONAL EVENT SYSTEM - Limited Time Events
 * 
 * Creates urgency through time-limited seasonal content.
 * Drives engagement spikes during special periods.
 */

export class SeasonalEventSystem {
    constructor(eventBus, economy, progression) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        
        this.activeEvents = [];
        this.eventHistory = [];
        
        // Check for seasonal events
        this.checkSeasonalEvents();
        setInterval(() => this.checkSeasonalEvents(), 3600000); // Check every hour
    }

    checkSeasonalEvents() {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();
        
        // Clear expired events
        this.activeEvents = this.activeEvents.filter(e => e.endTime > Date.now());
        
        // Check for seasonal events
        // Halloween (October)
        if (month === 9) {
            this.startEvent('halloween');
        }
        
        // Christmas (December)
        if (month === 11) {
            this.startEvent('christmas');
        }
        
        // New Year (January 1st)
        if (month === 0 && day === 1) {
            this.startEvent('new_year');
        }
        
        // Summer Event (June-August)
        if (month >= 5 && month <= 7) {
            this.startEvent('summer');
        }
    }

    startEvent(eventId) {
        // Don't start if already active
        if (this.activeEvents.some(e => e.id === eventId)) return;
        
        const event = this.getEventTemplate(eventId);
        if (!event) return;
        
        const activeEvent = {
            ...event,
            startTime: Date.now(),
            endTime: Date.now() + event.duration,
            active: true
        };
        
        this.activeEvents.push(activeEvent);
        this.eventBus.emit('seasonal_event_started', activeEvent);
        this.applyEventEffects(activeEvent);
        
        // Auto-end after duration
        setTimeout(() => {
            if (this.activeEvents.includes(activeEvent)) {
                this.endEvent(activeEvent);
            }
        }, event.duration);
    }

    getEventTemplate(eventId) {
        const templates = {
            halloween: {
                id: 'halloween',
                name: 'HALLOWEEN NIGHT',
                description: 'Spooky rewards! 2x Loot, 1.5x Entropy',
                duration: 7 * 24 * 60 * 60 * 1000, // 7 days
                icon: '🎃',
                color: '#ff8800',
                effects: {
                    lootChance: 2.0,
                    entropyGain: 1.5
                }
            },
            christmas: {
                id: 'christmas',
                name: 'WINTER FESTIVAL',
                description: 'Holiday cheer! 1.5x All Gains, Bonus Gems',
                duration: 14 * 24 * 60 * 60 * 1000, // 14 days
                icon: '🎄',
                color: '#00ff00',
                effects: {
                    globalMultiplier: 1.5,
                    gemDropChance: 0.1
                }
            },
            new_year: {
                id: 'new_year',
                name: 'NEW YEAR CELEBRATION',
                description: 'Fresh start! 3x Prestige Bonus, Reset Bonuses',
                duration: 3 * 24 * 60 * 60 * 1000, // 3 days
                icon: '🎆',
                color: '#ffd700',
                effects: {
                    prestigeBonus: 3.0,
                    resetBonus: 1.5
                }
            },
            summer: {
                id: 'summer',
                name: 'SUMMER EVENT',
                description: 'Hot rewards! 1.3x Auto-DPS, Bonus Research Points',
                duration: 30 * 24 * 60 * 60 * 1000, // 30 days
                icon: '☀️',
                color: '#ffaa00',
                effects: {
                    autoDps: 1.3,
                    researchPointGain: 1.5
                }
            }
        };
        
        return templates[eventId];
    }

    applyEventEffects(event) {
        this.eventBus.emit('seasonal_effect_applied', event.effects);
    }

    endEvent(event) {
        const index = this.activeEvents.indexOf(event);
        if (index > -1) {
            this.activeEvents.splice(index, 1);
        }
        
        this.eventHistory.push({
            ...event,
            active: false,
            completedAt: Date.now()
        });
        
        this.eventBus.emit('seasonal_event_ended', event);
        this.eventBus.emit('seasonal_effect_removed', event.effects);
    }

    getActiveEvents() {
        return this.activeEvents;
    }

    getTimeRemaining(event) {
        const remaining = event.endTime - Date.now();
        if (remaining <= 0) return 0;
        
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return { days, hours, total: remaining };
    }

    serialize() {
        return {
            activeEvents: this.activeEvents.map(e => ({
                ...e,
                startTime: e.startTime,
                endTime: e.endTime
            })),
            eventHistory: this.eventHistory.slice(-10)
        };
    }

    deserialize(data) {
        if (data) {
            const now = Date.now();
            this.activeEvents = (data.activeEvents || []).filter(e => e.endTime > now);
            this.eventHistory = data.eventHistory || [];
            
            // Re-apply effects
            this.activeEvents.forEach(event => {
                this.applyEventEffects(event);
            });
        }
    }
}



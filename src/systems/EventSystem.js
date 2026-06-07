/**
 * EVENT SYSTEM - Limited Time Offers & FOMO
 * 
 * Creates urgency through time-limited events.
 * Drives engagement spikes and return visits.
 */

export class EventSystem {
    constructor(eventBus, economy, progression) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.progression = progression;
        
        this.activeEvents = [];
        this.eventHistory = [];
        this.nextEventTime = Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
        
        this.eventTemplates = [
            {
                id: 'double_entropy',
                name: 'ENTROPY SURGE',
                description: 'Double Entropy gain for 30 minutes',
                duration: 30 * 60 * 1000, // 30 minutes
                effect: {
                    type: 'multiplier',
                    stat: 'entropy_gain',
                    value: 2.0
                },
                icon: '⚡',
                color: '#00ff9d'
            },
            {
                id: 'lucky_hour',
                name: 'LUCKY HOUR',
                description: '3x Loot drop chance for 20 minutes',
                duration: 20 * 60 * 1000,
                effect: {
                    type: 'multiplier',
                    stat: 'loot_chance',
                    value: 3.0
                },
                icon: '🍀',
                color: '#ffd700'
            },
            {
                id: 'speed_boost',
                name: 'OVERCLOCK PROTOCOL',
                description: '2x Auto-DPS for 25 minutes',
                duration: 25 * 60 * 1000,
                effect: {
                    type: 'multiplier',
                    stat: 'auto_dps',
                    value: 2.0
                },
                icon: '🚀',
                color: '#bd00ff'
            },
            {
                id: 'stability_boost',
                name: 'STABILITY FIELD',
                description: 'Stability decay halved for 40 minutes',
                duration: 40 * 60 * 1000,
                effect: {
                    type: 'multiplier',
                    stat: 'stability_decay',
                    value: 0.5
                },
                icon: '🛡️',
                color: '#00aaff'
            },
            {
                id: 'premium_bonus',
                name: 'GEM RUSH',
                description: 'Chance to earn Gems from kills for 30 minutes',
                duration: 30 * 60 * 1000,
                effect: {
                    type: 'bonus',
                    stat: 'premium_drop',
                    value: 0.1 // 10% chance
                },
                icon: '💎',
                color: '#ffd700'
            }
        ];
        
        this.checkForNewEvents();
        setInterval(() => this.checkForNewEvents(), 60000); // Check every minute
    }

    checkForNewEvents() {
        const now = Date.now();
        
        // Remove expired events
        this.activeEvents = this.activeEvents.filter(event => {
            if (event.endTime <= now) {
                this.endEvent(event);
                return false;
            }
            return true;
        });
        
        // Start new event if it's time
        if (now >= this.nextEventTime && this.activeEvents.length < 2) {
            this.startRandomEvent();
        }
    }

    startRandomEvent() {
        const availableTemplates = this.eventTemplates.filter(t => 
            !this.activeEvents.some(e => e.id === t.id)
        );
        
        if (availableTemplates.length === 0) return;
        
        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        const event = {
            ...template,
            startTime: Date.now(),
            endTime: Date.now() + template.duration,
            active: true
        };
        
        this.activeEvents.push(event);
        this.nextEventTime = Date.now() + (2 * 60 * 60 * 1000) + (Math.random() * 60 * 60 * 1000); // 2-3 hours
        
        this.eventBus.emit('event_started', event);
        this.applyEventEffect(event);
        
        // Auto-end after duration
        setTimeout(() => {
            if (this.activeEvents.includes(event)) {
                this.endEvent(event);
            }
        }, event.duration);
    }

    applyEventEffect(event) {
        this.eventBus.emit('event_effect_applied', event.effect);
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
        
        this.eventBus.emit('event_ended', event);
        this.eventBus.emit('event_effect_removed', event.effect);
    }

    getActiveEvents() {
        return this.activeEvents;
    }

    getTimeRemaining(event) {
        const remaining = event.endTime - Date.now();
        if (remaining <= 0) return 0;
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return { minutes, seconds, total: remaining };
    }

    serialize() {
        return {
            activeEvents: this.activeEvents.map(e => ({
                ...e,
                startTime: e.startTime,
                endTime: e.endTime
            })),
            eventHistory: this.eventHistory.slice(-10), // Keep last 10
            nextEventTime: this.nextEventTime
        };
    }

    deserialize(data) {
        if (data) {
            const now = Date.now();
            this.activeEvents = (data.activeEvents || []).filter(e => e.endTime > now);
            this.eventHistory = data.eventHistory || [];
            this.nextEventTime = data.nextEventTime || (now + 2 * 60 * 60 * 1000);
        }
    }
}



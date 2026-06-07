import { LoreEntries } from '../config/Lore.js';

export class StorySystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.fragments = 0; // Currency for lore
        this.unlockedEntries = []; // IDs
    }

    addFragment(amount) {
        this.fragments += amount;
        this.eventBus.emit('system_message', { text: `DATA FRAGMENT RECOVERED`, type: 'success' });
        this.eventBus.emit('story_update');
    }

    canUnlock(id) {
        const entry = LoreEntries.find(e => e.id === id);
        if (!entry) return false;
        if (this.unlockedEntries.includes(id)) return false;
        return this.fragments >= entry.cost;
    }

    unlock(id) {
        if (!this.canUnlock(id)) return false;

        const entry = LoreEntries.find(e => e.id === id);
        this.fragments -= entry.cost;
        this.unlockedEntries.push(id);

        this.eventBus.emit('story_unlock', entry);
        this.eventBus.emit('story_update');
        this.eventBus.emit('system_message', { text: `LOG DECRYPTED: ${entry.title}`, type: 'success' }); // Fix: accessing entry

        return true;
    }

    serialize() {
        return {
            fragments: this.fragments,
            unlocked: this.unlockedEntries
        };
    }

    deserialize(data) {
        if (!data) return;
        this.fragments = data.fragments || 0;
        this.unlockedEntries = data.unlocked || [];
    }
}

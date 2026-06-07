export const DefaultSettings = {
    masterVolume: 0.5,
    sfxVolume: 1.0,
    crtEffect: true,
    particles: true,
    numberNotation: 'scientific' // scientific, standard (1k, 1M)
};

export class SettingsSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.settings = { ...DefaultSettings };
        this.load();
    }

    set(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.save();
            this.eventBus.emit('settings_changed', { key, value });
            // Immediate effect triggers
            if (key === 'masterVolume') this.eventBus.emit('volume_update', value);
        }
    }

    get(key) {
        return this.settings[key];
    }

    save() {
        localStorage.setItem('VOID_SETTINGS', JSON.stringify(this.settings));
    }

    load() {
        const raw = localStorage.getItem('VOID_SETTINGS');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                this.settings = { ...this.settings, ...parsed };
            } catch (e) { console.error(e); }
        }
    }
}

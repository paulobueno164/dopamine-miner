export class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.ctx.destination);
    }

    playTone(freq, type, duration, vol = 1.0) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime); // Fade out noise
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    // SFX PRESETS
    playClick() {
        // High pitched ping
        this.playTone(800 + Math.random() * 200, 'sine', 0.1, 0.5);
    }

    playLoot(rarity) {
        // Chord based on rarity
        const base = 440;
        if (rarity === 'COMMON') this.playTone(base, 'triangle', 0.2);
        if (rarity === 'UNCOMMON') { this.playTone(base, 'square', 0.3); this.playTone(base * 1.25, 'square', 0.3); } // Major 3rd
        if (rarity === 'RARE') { this.playTone(base, 'sawtooth', 0.4); this.playTone(base * 1.5, 'sawtooth', 0.4); } // Fifth
        if (rarity === 'LEGENDARY') {
            // Arpeggio
            setTimeout(() => this.playTone(base, 'square', 0.5), 0);
            setTimeout(() => this.playTone(base * 1.25, 'square', 0.5), 100);
            setTimeout(() => this.playTone(base * 1.5, 'square', 0.5), 200);
            setTimeout(() => this.playTone(base * 2, 'square', 0.8), 300);
        }
    }

    playLevelUp() {
        this.playTone(600, 'sine', 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.1), 100);
    }

    playError() {
        this.playTone(150, 'sawtooth', 0.3);
    }
    
    playSuccess() {
        // Ascending chord
        this.playTone(523, 'sine', 0.15, 0.4); // C
        setTimeout(() => this.playTone(659, 'sine', 0.15, 0.4), 50); // E
        setTimeout(() => this.playTone(784, 'sine', 0.2, 0.4), 100); // G
    }
    
    playPurchase() {
        // Money sound
        this.playTone(880, 'square', 0.1, 0.3);
        setTimeout(() => this.playTone(1100, 'square', 0.15, 0.3), 80);
    }
    
    playCombo(level) {
        // Different sound based on combo level
        const baseFreq = 400 + (level * 50);
        this.playTone(baseFreq, 'sine', 0.2, 0.5);
        if (level >= 50) {
            setTimeout(() => this.playTone(baseFreq * 1.5, 'sine', 0.2, 0.5), 100);
        }
    }
    
    playBossSpawn() {
        // Dramatic low tone
        this.playTone(100, 'sawtooth', 0.5, 0.6);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.3, 0.4), 200);
    }
    
    playQuestComplete() {
        // Victory fanfare
        this.playTone(523, 'square', 0.2, 0.5); // C
        setTimeout(() => this.playTone(659, 'square', 0.2, 0.5), 150); // E
        setTimeout(() => this.playTone(784, 'square', 0.2, 0.5), 300); // G
        setTimeout(() => this.playTone(1047, 'square', 0.4, 0.6), 450); // C (high)
    }
}

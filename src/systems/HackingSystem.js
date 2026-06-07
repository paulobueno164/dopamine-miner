export class HackingSystem {
    constructor(eventBus, economy, psychology) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.psychology = psychology;

        this.active = false;
        this.sequence = [];
        this.playerInput = [];
        this.level = 1;
        this.showingSequence = false;

        // Config
        this.baseTime = 1000; // time per flash
        this.maxLevel = 10;
        this.cooldown = 0;
        this.cooldownTime = 300; // 5 minutes (It's powerful)
    }

    startHack() {
        if (this.active || this.cooldown > 0) return false;

        this.active = true;
        this.level = 1;
        this.startLevel();
        this.eventBus.emit('hack_started');
        return true;
    }

    startLevel() {
        this.sequence = [];
        this.playerInput = [];
        this.showingSequence = true;

        // Generate sequence
        const length = 2 + this.level;
        for (let i = 0; i < length; i++) {
            this.sequence.push(Math.floor(Math.random() * 9)); // 0-8 (3x3 grid)
        }

        this.eventBus.emit('hack_sequence_ready', { sequence: this.sequence, level: this.level });
        
        // Auto-disable showingSequence after sequence is shown (handled by UI timing)
        // The UI will call setShowingSequence(false) after displaying the sequence
    }
    
    setShowingSequence(value) {
        this.showingSequence = value;
    }

    input(index) {
        if (!this.active || this.showingSequence) {
            return false;
        }

        // Add input
        this.playerInput.push(index);

        // Validate immediate (fail fast)
        const currentStep = this.playerInput.length - 1;
        if (this.playerInput[currentStep] !== this.sequence[currentStep]) {
            this.fail();
            return false;
        }

        this.eventBus.emit('hack_input_correct', index);

        // Check win level
        if (this.playerInput.length === this.sequence.length) {
            this.levelComplete();
            return true;
        }
        
        return true; // Input was correct but level not complete yet
    }

    levelComplete() {
        this.eventBus.emit('hack_level_complete', { level: this.level });
        
        if (this.level >= 5) { // Win after 5 levels for Prototype
            this.win();
        } else {
            this.level++;
            setTimeout(() => this.startLevel(), 1000);
        }
    }

    win() {
        this.active = false;
        this.cooldown = this.cooldownTime;

        // Rewards
        const gems = 5 + Math.floor(Math.random() * 5);
        this.economy.premium += gems;
        this.psychology.stability = 100; // Full sanity restore
        this.eventBus.emit('system_message', { text: `SYSTEM BREACHED: +${gems} GEMS`, type: 'success' });
        this.eventBus.emit('hack_complete', { success: true });

        // Cooldown timer logic needs to be handled via update loop in main or simple timestamp check
        this.cooldownStart = Date.now();
    }

    fail() {
        this.active = false;
        this.cooldown = 60; // Short punishment cooldown
        this.cooldownStart = Date.now();

        this.psychology.stability -= 20; // Mental damage
        this.eventBus.emit('system_message', { text: `BREACH DETECTED: NEURAL SHOCK`, type: 'error' });
        this.eventBus.emit('hack_complete', { success: false });
    }

    update(dt) {
        // Handle cooldown
        if (this.cooldown > 0) {
            this.cooldown -= dt;
            if (this.cooldown < 0) this.cooldown = 0;
        }
    }
}

/**
 * COMBO SYSTEM - Variable Ratio Reinforcement Amplifier
 * 
 * Rewards rapid clicking with temporary multipliers.
 * Creates "flow state" and encourages sustained engagement.
 */

export class ComboSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboDecayTime = 2.0; // Seconds before combo resets
        this.maxComboTime = 5.0; // Max combo duration
        this.currentMultiplier = 1.0;
        
        // Combo thresholds for visual feedback
        this.thresholds = [
            { count: 10, multiplier: 1.2, name: 'WARMING UP' },
            { count: 25, multiplier: 1.5, name: 'ON FIRE' },
            { count: 50, multiplier: 2.0, name: 'BLAZING' },
            { count: 100, multiplier: 3.0, name: 'LEGENDARY' },
            { count: 200, multiplier: 5.0, name: 'GODLIKE' }
        ];
    }

    update(dt) {
        if (this.comboCount > 0) {
            this.comboTimer -= dt;
            
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }

    addHit() {
        this.comboCount++;
        this.comboTimer = this.comboDecayTime;
        
        // Calculate current multiplier
        let multiplier = 1.0;
        let tierName = '';
        
        for (let i = this.thresholds.length - 1; i >= 0; i--) {
            if (this.comboCount >= this.thresholds[i].count) {
                multiplier = this.thresholds[i].multiplier;
                tierName = this.thresholds[i].name;
                break;
            }
        }
        
        this.currentMultiplier = multiplier;
        
        // Emit visual feedback for milestone combos
        if (this.thresholds.some(t => t.count === this.comboCount)) {
            this.eventBus.emit('combo_milestone', {
                count: this.comboCount,
                multiplier: multiplier,
                name: tierName
            });
        }
        
        // Emit combo update
        this.eventBus.emit('combo_update', {
            count: this.comboCount,
            multiplier: multiplier,
            timeRemaining: this.comboTimer
        });
    }

    resetCombo() {
        if (this.comboCount > 0) {
            this.eventBus.emit('combo_lost', { count: this.comboCount });
        }
        this.comboCount = 0;
        this.comboTimer = 0;
        this.currentMultiplier = 1.0;
    }

    getMultiplier() {
        return this.currentMultiplier;
    }

    getComboInfo() {
        return {
            count: this.comboCount,
            multiplier: this.currentMultiplier,
            timeRemaining: this.comboTimer,
            nextThreshold: this.getNextThreshold()
        };
    }

    getNextThreshold() {
        for (const threshold of this.thresholds) {
            if (this.comboCount < threshold.count) {
                return threshold;
            }
        }
        return null; // Max combo reached
    }
}



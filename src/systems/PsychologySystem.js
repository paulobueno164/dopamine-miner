import { GameConfig } from '../config/GameConfig.js';

/**
 * PSYCHOLOGYSYSTEM
 * 
 * The puppet master. This system manages the player's emotional state
 * by orchestrating FOMO events, Loss Aversion threats, and Social Pressure.
 */
export class PsychologySystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.stability = 100; // 0-100%
        this.fomoActive = false;
        this.fomoTimer = 0;

        // Social Pressure
        this.fakeUserNames = ['Whale_Killer99', 'Crypt0King', 'NoSleep', 'GrindLord', 'ElonTusk'];
        this.resistance = 0;
        this.resistance = 0;
        this.startSocialLoop();
    }

    setChallengeSystem(challenges) {
        this.challenges = challenges;
    }

    setDroneSystem(drones) {
        this.drones = drones;
    }

    buffStabilityResistance(amount) {
        this.resistance += amount;
        // Cap resistance at 80% to ensure they can still die
        if (this.resistance > 0.8) this.resistance = 0.8;
    }

    update(dt) {
        this.updateLossAversion(dt);
        this.updateFOMO(dt);
    }

    // 2.3 LOSS AVERSION Implementation
    // The player constantly loses "Stability". If it hits 0, they suffer a penalty.
    updateLossAversion(dt) {
        // Constant decay reduced by resistance
        let droneRes = 0;
        if (this.drones) {
            droneRes = this.drones.getBonuses().decay_res;
        }

        let effectiveDecay = GameConfig.stability.decayRatePerSecond * (1 - (this.resistance + droneRes));

        if (this.challenges) {
            effectiveDecay *= this.challenges.getModifier('stability_decay');
        }

        this.stability -= effectiveDecay * dt;

        if (this.stability <= 0) {
            this.stability = 0;
            this.triggerFailureState();
        } else if (this.stability > 100) {
            this.stability = 100;
        }

        // Notify UI of the threat
        this.eventBus.emit('stability_update', this.stability);
    }

    // 2.2 FOMO Implementation
    updateFOMO(dt) {
        // Simple cycler for the demo
        if (this.fomoActive) {
            this.fomoTimer -= dt;
            if (this.fomoTimer <= 0) {
                this.endFOMOEvent();
            }
        }
    }

    triggerFailureState() {
        // The punishment.
        this.eventBus.emit('system_message', {
            text: "STABILITY FAILURE - EFFICIENCY REDUCED",
            type: 'critical'
        });
        // We don't actually delete save data (too harsh), we debuff them.
    }

    startSocialLoop() {
        // 2.5 SOCIAL PRESSURE
        // Inject fake notifications about other players getting lucky.
        setInterval(() => {
            const user = this.fakeUserNames[Math.floor(Math.random() * this.fakeUserNames.length)];
            const item = "VOID SHARD (" + (Math.random() > 0.9 ? "LEGENDARY" : "RARE") + ")";

            this.eventBus.emit('social_ticker', `${user} just found ${item}!`);
        }, GameConfig.social.notificationFrequency * 100); // Fast for demo purposes
    }

    killConfirm() {
        // Relief from the pressure
        this.stability += GameConfig.stability.regainOnKill;
        this.eventBus.emit('stability_regain');
    }

    serialize() {
        return {
            stability: this.stability,
            resistance: this.resistance
        };
    }

    deserialize(data) {
        if (!data) return;
        this.stability = data.stability !== undefined ? data.stability : 100;
        this.resistance = data.resistance || 0;
    }
}

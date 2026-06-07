import { DroneTraits, DroneRarities } from '../config/DroneConfig.js';

export class DroneSystem {
    constructor(eventBus, economy) {
        this.eventBus = eventBus;
        this.economy = economy;

        this.drones = []; // { id, name, rarity, trait, level, experience, charge }
        this.activeDroneIds = []; // Up to 3 active slots
        this.maxSlots = 1;

        this.chargeDecayRate = 0.01; // % per second
        this.capsuleCost = 50; // Premium Currency (Gems)
        this.idCounter = 0;
    }

    update(dt) {
        // Handle charge decay for active drones
        this.activeDroneIds.forEach(id => {
            const drone = this.drones.find(d => d.id === id);
            if (drone && drone.charge > 0) {
                drone.charge -= this.chargeDecayRate * dt;
                if (drone.charge < 0) {
                    drone.charge = 0;
                    this.eventBus.emit('system_message', { text: `DRONE [${drone.name}] DEPLETED`, type: 'error' });
                }
            }
        });
    }

    gainExperience(amount) {
        this.activeDroneIds.forEach(id => {
            const drone = this.drones.find(d => d.id === id);
            if (drone && drone.charge > 0) {
                drone.experience += amount;
                const nextLevel = drone.level * 100 * Math.pow(1.5, drone.level - 1);
                if (drone.experience >= nextLevel) {
                    drone.level++;
                    drone.experience = 0;
                    // Buff bonus slightly on level up
                    drone.bonusValue *= 1.05;
                    this.eventBus.emit('drone_updated', drone);
                    this.eventBus.emit('system_message', { text: `DRONE ${drone.name} LEVEL UP: ${drone.level}`, type: 'success' });
                }
            }
        });
    }

    buyCapsule() {
        if (this.economy.premium < this.capsuleCost) {
            this.eventBus.emit('system_message', { text: "INSUFFICIENT GEMS", type: 'error' });
            return false;
        }

        this.economy.premium -= this.capsuleCost;
        this.eventBus.emit('premium_update', this.economy.premium);

        const drone = this.generateRandomDrone();
        this.drones.push(drone);

        this.eventBus.emit('drone_acquired', drone);
        this.eventBus.emit('system_message', { text: `ACQUIRED: ${drone.rarity} ${drone.name}`, type: 'success' });
        return drone;
    }

    generateRandomDrone() {
        // Roll rarity
        const totalWeight = DroneRarities.reduce((sum, r) => sum + r.weight, 0);
        let roll = Math.random() * totalWeight;
        let rarity = DroneRarities[0];
        for (const r of DroneRarities) {
            if (roll < r.weight) {
                rarity = r;
                break;
            }
            roll -= r.weight;
        }

        // Roll trait
        const traits = Object.values(DroneTraits);
        const trait = traits[Math.floor(Math.random() * traits.length)];

        return {
            id: ++this.idCounter,
            name: `Drone-${Math.floor(Math.random() * 9999)}`,
            rarity: rarity.id,
            rarityColor: rarity.color,
            trait: trait.id,
            traitName: trait.name,
            bonusType: trait.bonus.type,
            bonusValue: trait.bonus.value * rarity.mult,
            level: 1,
            experience: 0,
            charge: 100, // %
            maxCharge: 100
        };
    }

    setActive(id, active) {
        if (active) {
            if (this.activeDroneIds.includes(id)) return;
            if (this.activeDroneIds.length >= this.maxSlots) {
                this.eventBus.emit('system_message', { text: "SLOTS FULL", type: 'error' });
                return;
            }
            this.activeDroneIds.push(id);
        } else {
            this.activeDroneIds = this.activeDroneIds.filter(dId => dId !== id);
        }
        this.eventBus.emit('drone_slots_updated', this.activeDroneIds);
    }

    recharge(id) {
        const drone = this.drones.find(d => d.id === id);
        if (!drone) return;

        // Recharge cost: 1 Premium Currency or free with timer? 
        // For now, let's say it costs 1 Premium to instant charge, or small entropy?
        // Let's use it as a "Daily" mechanic or small Gem sink.
        const cost = 2;
        if (this.economy.premium < cost) {
            this.eventBus.emit('system_message', { text: "NOT ENOUGH GEMS", type: 'error' });
            return;
        }

        this.economy.premium -= cost;
        drone.charge = drone.maxCharge;
        this.eventBus.emit('premium_update', this.economy.premium);
        this.eventBus.emit('drone_updated', drone);
    }

    getBonuses() {
        const bonuses = {
            entropy_mult: 0,
            decay_res: 0,
            luck: 0,
            auto_dps: 0
        };

        this.activeDroneIds.forEach(id => {
            const drone = this.drones.find(d => d.id === id);
            if (drone && drone.charge > 0) {
                bonuses[drone.bonusType] += drone.bonusValue;
            }
        });

        return bonuses;
    }

    serialize() {
        return {
            drones: this.drones,
            activeIds: this.activeDroneIds,
            maxSlots: this.maxSlots,
            idCounter: this.idCounter
        };
    }

    deserialize(data) {
        if (!data) return;
        this.drones = data.drones || [];
        this.activeDroneIds = data.activeIds || [];
        this.maxSlots = data.maxSlots || 1;
        this.idCounter = data.idCounter || this.drones.length;
    }
}

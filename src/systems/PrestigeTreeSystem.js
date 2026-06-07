import { PrestigeNodes } from '../config/PrestigeTree.js';

export class PrestigeTreeSystem {
    constructor(eventBus, economy, prestigeSystem) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.prestigeSystem = prestigeSystem; // Needs access to spend Void Matter

        this.unlocked = []; // List of node IDs
    }

    canUnlock(nodeId) {
        if (this.unlocked.includes(nodeId)) return false;

        const node = PrestigeNodes.find(n => n.id === nodeId);
        if (!node) return false;

        // Check Cost
        if (this.prestigeSystem.voidMatter < node.cost) return false;

        // Check Dependencies
        if (node.req.length === 0) return true; // Start node

        // Just need ONE parent unlocked? Or ALL? Usually ONE path is enough in trees.
        // Let's go with "Need at least one parent unlocked" logic if purely visual, 
        // but traditionally it's "All requirements met".
        // Let's stick to: Must have ALL reqs unlocked.
        return node.req.every(r => this.unlocked.includes(r));
    }

    unlock(nodeId) {
        if (!this.canUnlock(nodeId)) return false;

        const node = PrestigeNodes.find(n => n.id === nodeId);
        this.prestigeSystem.voidMatter -= node.cost;
        this.unlocked.push(nodeId);

        this.eventBus.emit('node_unlocked', node);
        this.eventBus.emit('system_message', { text: `NEURAL UPGRADE: ${node.name}`, type: 'success' });
        this.applyEffect(node);
        return true;
    }

    applyEffect(node) {
        // Logic to apply buffs. 
        // Most buffs are passive checks done by other systems (Progression).
        // Some might be immediate (Start Entropy) - handled on reset.
    }

    // Checking buffs
    hasNode(id) {
        return this.unlocked.includes(id);
    }

    serialize() {
        return { unlocked: this.unlocked };
    }

    deserialize(data) {
        if (!data) return;
        this.unlocked = data.unlocked || [];
    }
}

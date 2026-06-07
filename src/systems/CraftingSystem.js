/**
 * CRAFTING SYSTEM - Item Enhancement & Creation
 * 
 * Allows players to combine and enhance items.
 * Creates long-term goals and resource management.
 */

export class CraftingSystem {
    constructor(eventBus, economy, inventory) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.inventory = inventory;
        
        this.craftingRecipes = [
            {
                id: 'enhance_common',
                name: 'ENHANCE COMMON',
                description: 'Upgrade 3 Common items to 1 Uncommon',
                input: { 'COMMON': 3 },
                output: { 'UNCOMMON': 1 },
                cost: 100,
                category: 'upgrade'
            },
            {
                id: 'enhance_uncommon',
                name: 'ENHANCE UNCOMMON',
                description: 'Upgrade 3 Uncommon items to 1 Rare',
                input: { 'UNCOMMON': 3 },
                output: { 'RARE': 1 },
                cost: 500,
                category: 'upgrade'
            },
            {
                id: 'enhance_rare',
                name: 'ENHANCE RARE',
                description: 'Upgrade 3 Rare items to 1 Legendary',
                input: { 'RARE': 3 },
                output: { 'LEGENDARY': 1 },
                cost: 2000,
                category: 'upgrade'
            },
            {
                id: 'craft_lucky_charm',
                name: 'CRAFT LUCKY CHARM',
                description: 'Create a permanent +5% loot chance boost',
                input: { 'LEGENDARY': 1, 'RARE': 2 },
                output: { 'PERMANENT_BOOST': { type: 'loot_chance', value: 0.05 } },
                cost: 5000,
                category: 'special'
            },
            {
                id: 'craft_damage_boost',
                name: 'CRAFT DAMAGE BOOST',
                description: 'Create a permanent +10% damage boost',
                input: { 'LEGENDARY': 2 },
                output: { 'PERMANENT_BOOST': { type: 'damage', value: 0.1 } },
                cost: 10000,
                category: 'special'
            },
            {
                id: 'craft_entropy_generator',
                name: 'CRAFT ENTROPY GENERATOR',
                description: 'Create a permanent +5% entropy gain boost',
                input: { 'RARE': 3, 'UNCOMMON': 5 },
                output: { 'PERMANENT_BOOST': { type: 'entropy_gain', value: 0.05 } },
                cost: 3000,
                category: 'special'
            }
        ];
        
        this.permanentBoosts = [];
    }

    canCraft(recipeId) {
        const recipe = this.craftingRecipes.find(r => r.id === recipeId);
        if (!recipe) return false;
        
        // Check cost
        if (this.economy.entropy < recipe.cost) return false;
        
        // Check input items
        for (const [itemType, required] of Object.entries(recipe.input)) {
            const current = this.inventory.items[itemType] || 0;
            if (current < required) return false;
        }
        
        return true;
    }

    craft(recipeId) {
        const recipe = this.craftingRecipes.find(r => r.id === recipeId);
        if (!recipe || !this.canCraft(recipeId)) {
            this.eventBus.emit('system_message', { 
                text: 'CANNOT CRAFT: INSUFFICIENT MATERIALS', 
                type: 'error' 
            });
            return false;
        }
        
        // Pay cost
        if (!this.economy.spendEntropy(recipe.cost)) {
            return false;
        }
        
        // Consume input items
        for (const [itemType, amount] of Object.entries(recipe.input)) {
            for (let i = 0; i < amount; i++) {
                this.inventory.removeItem(itemType);
            }
        }
        
        // Create output
        for (const [outputType, outputData] of Object.entries(recipe.output)) {
            if (outputType === 'PERMANENT_BOOST') {
                this.permanentBoosts.push(outputData);
                this.eventBus.emit('permanent_boost_applied', outputData);
            } else {
                this.inventory.addItem(outputType);
            }
        }
        
        this.eventBus.emit('item_crafted', { recipe, output: recipe.output });
        this.eventBus.emit('system_message', { 
            text: `CRAFTED: ${recipe.name}`, 
            type: 'success' 
        });
        
        return true;
    }

    getRecipes() {
        return this.craftingRecipes;
    }

    getAvailableRecipes() {
        return this.craftingRecipes.filter(r => this.canCraft(r.id));
    }

    getPermanentBoosts() {
        return this.permanentBoosts;
    }

    serialize() {
        return {
            permanentBoosts: this.permanentBoosts
        };
    }

    deserialize(data) {
        if (data) {
            this.permanentBoosts = data.permanentBoosts || [];
            
            // Re-apply permanent boosts
            this.permanentBoosts.forEach(boost => {
                this.eventBus.emit('permanent_boost_applied', boost);
            });
        }
    }
}



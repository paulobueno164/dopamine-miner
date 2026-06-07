/**
 * TRADING SYSTEM - Marketplace
 * 
 * Allows players to trade resources and items.
 * Creates economic depth and player agency.
 */

export class TradingSystem {
    constructor(eventBus, economy, inventory) {
        this.eventBus = eventBus;
        this.economy = economy;
        this.inventory = inventory;
        
        this.marketItems = [];
        this.playerListings = [];
        this.tradeHistory = [];
        this.marketFluctuation = 1.0;
        
        this.generateMarketItems();
        this.startMarketFluctuation();
    }

    generateMarketItems() {
        // Generate market items with fluctuating prices
        const itemTypes = [
            { type: 'COMMON_LOOT', basePrice: 10, volatility: 0.2 },
            { type: 'RARE_LOOT', basePrice: 100, volatility: 0.3 },
            { type: 'EPIC_LOOT', basePrice: 1000, volatility: 0.4 },
            { type: 'LEGENDARY_LOOT', basePrice: 10000, volatility: 0.5 },
            { type: 'PREMIUM', basePrice: 5000, volatility: 0.15 }
        ];
        
        itemTypes.forEach(item => {
            this.marketItems.push({
                id: item.type,
                name: item.type.replace('_', ' '),
                basePrice: item.basePrice,
                currentPrice: item.basePrice,
                volatility: item.volatility,
                demand: 0.5 + Math.random() * 0.5,
                supply: 0.5 + Math.random() * 0.5
            });
        });
    }

    startMarketFluctuation() {
        // Update market prices every 30 seconds
        setInterval(() => {
            this.updateMarketPrices();
        }, 30000);
    }

    updateMarketPrices() {
        this.marketItems.forEach(item => {
            // Price fluctuation based on supply/demand
            const change = (Math.random() - 0.5) * item.volatility;
            const supplyDemandFactor = (item.demand - item.supply) * 0.1;
            const newPrice = item.currentPrice * (1 + change + supplyDemandFactor);
            
            item.currentPrice = Math.max(item.basePrice * 0.5, Math.min(item.basePrice * 2, newPrice));
            
            // Update supply/demand
            item.demand = Math.max(0, Math.min(1, item.demand + (Math.random() - 0.5) * 0.1));
            item.supply = Math.max(0, Math.min(1, item.supply + (Math.random() - 0.5) * 0.1));
        });
        
        this.eventBus.emit('market_updated', this.marketItems);
    }

    buyItem(itemId, quantity = 1) {
        const item = this.marketItems.find(i => i.id === itemId);
        if (!item) return false;
        
        const totalCost = item.currentPrice * quantity;
        
        if (this.economy.entropy < totalCost) {
            this.eventBus.emit('system_message', {
                text: 'INSUFFICIENT ENTROPY',
                type: 'error'
            });
            return false;
        }
        
        this.economy.spendEntropy(totalCost);
        
        // Add to inventory
        for (let i = 0; i < quantity; i++) {
            this.inventory.addItem(itemId);
        }
        
        // Update market (increase demand)
        item.demand = Math.min(1, item.demand + 0.05 * quantity);
        
        this.tradeHistory.push({
            type: 'buy',
            item: itemId,
            quantity,
            price: item.currentPrice,
            timestamp: Date.now()
        });
        
        this.eventBus.emit('item_purchased', { item, quantity, totalCost });
        this.eventBus.emit('system_message', {
            text: `PURCHASED ${quantity}x ${item.name}`,
            type: 'success'
        });
        
        return true;
    }

    sellItem(itemId, quantity = 1) {
        // Check if player has items
        const itemCount = this.inventory.getItemCount(itemId);
        if (itemCount < quantity) {
            this.eventBus.emit('system_message', {
                text: 'INSUFFICIENT ITEMS',
                type: 'error'
            });
            return false;
        }
        
        const item = this.marketItems.find(i => i.id === itemId);
        if (!item) return false;
        
        const totalValue = item.currentPrice * quantity * 0.8; // 80% of market price
        
        // Remove from inventory
        for (let i = 0; i < quantity; i++) {
            this.inventory.removeItem(itemId);
        }
        
        this.economy.addEntropy(totalValue);
        
        // Update market (increase supply)
        item.supply = Math.min(1, item.supply + 0.05 * quantity);
        
        this.tradeHistory.push({
            type: 'sell',
            item: itemId,
            quantity,
            price: item.currentPrice,
            value: totalValue,
            timestamp: Date.now()
        });
        
        this.eventBus.emit('item_sold', { item, quantity, totalValue });
        this.eventBus.emit('system_message', {
            text: `SOLD ${quantity}x ${item.name} FOR ${this.economy.formatNumber(totalValue)} ENT`,
            type: 'success'
        });
        
        return true;
    }

    createListing(itemId, quantity, pricePerUnit) {
        const itemCount = this.inventory.getItemCount(itemId);
        if (itemCount < quantity) {
            this.eventBus.emit('system_message', {
                text: 'INSUFFICIENT ITEMS',
                type: 'error'
            });
            return false;
        }
        
        // Remove items from inventory (held in listing)
        for (let i = 0; i < quantity; i++) {
            this.inventory.removeItem(itemId);
        }
        
        const listing = {
            id: Date.now(),
            itemId,
            quantity,
            pricePerUnit,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        this.playerListings.push(listing);
        
        this.eventBus.emit('listing_created', listing);
        this.eventBus.emit('system_message', {
            text: `LISTING CREATED: ${quantity}x ${itemId} @ ${this.economy.formatNumber(pricePerUnit)}/unit`,
            type: 'success'
        });
        
        return true;
    }

    cancelListing(listingId) {
        const listing = this.playerListings.find(l => l.id === listingId);
        if (!listing) return false;
        
        // Return items to inventory
        for (let i = 0; i < listing.quantity; i++) {
            this.inventory.addItem(listing.itemId);
        }
        
        this.playerListings = this.playerListings.filter(l => l.id !== listingId);
        
        this.eventBus.emit('listing_cancelled', listing);
        return true;
    }

    getMarketItems() {
        return this.marketItems;
    }

    getPlayerListings() {
        // Remove expired listings
        const now = Date.now();
        this.playerListings = this.playerListings.filter(l => {
            if (l.expiresAt < now) {
                // Return items to inventory
                for (let i = 0; i < l.quantity; i++) {
                    this.inventory.addItem(l.itemId);
                }
                return false;
            }
            return true;
        });
        
        return this.playerListings;
    }

    getTradeHistory() {
        return this.tradeHistory.slice(-50); // Last 50 trades
    }

    serialize() {
        return {
            marketItems: this.marketItems,
            playerListings: this.playerListings,
            tradeHistory: this.tradeHistory.slice(-100) // Last 100 trades
        };
    }

    deserialize(data) {
        if (data) {
            this.marketItems = data.marketItems || this.marketItems;
            this.playerListings = data.playerListings || [];
            this.tradeHistory = data.tradeHistory || [];
        }
    }
}



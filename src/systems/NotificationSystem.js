/**
 * NOTIFICATION SYSTEM - Improved Message Queue
 * 
 * Manages notification display with queuing and priority.
 * Prevents notification spam and improves UX.
 */

export class NotificationSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.queue = [];
        this.currentNotification = null;
        this.maxQueueSize = 10;
        this.displayDuration = 3000; // 3 seconds default
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for system messages
        this.eventBus.on('system_message', (msg) => {
            this.addNotification(msg.text, msg.type || 'info', msg.duration);
        });
        
        // Listen for special events
        this.eventBus.on('quest_completed', (quest) => {
            this.addNotification(`QUEST COMPLETE: ${quest.name}`, 'success', 4000);
        });
        
        this.eventBus.on('achievement_unlocked', (achievement) => {
            this.addNotification(`ACHIEVEMENT: ${achievement.name}`, 'success', 5000);
        });
        
        this.eventBus.on('event_started', (event) => {
            this.addNotification(`${event.name} STARTED!`, 'success', 4000);
        });
        
        this.eventBus.on('research_unlocked', (research) => {
            this.addNotification(`RESEARCH: ${research.name}`, 'success', 4000);
        });
    }

    addNotification(text, type = 'info', duration = null) {
        const notification = {
            id: Date.now() + Math.random(),
            text: text,
            type: type,
            duration: duration || this.displayDuration,
            priority: this.getPriority(type),
            timestamp: Date.now()
        };
        
        // Remove duplicates if same text within 2 seconds
        const recent = this.queue.find(n => 
            n.text === text && 
            Date.now() - n.timestamp < 2000
        );
        if (recent) return;
        
        // Add to queue
        this.queue.push(notification);
        
        // Sort by priority
        this.queue.sort((a, b) => b.priority - a.priority);
        
        // Limit queue size
        if (this.queue.length > this.maxQueueSize) {
            this.queue = this.queue.slice(0, this.maxQueueSize);
        }
        
        // Show if no current notification
        if (!this.currentNotification) {
            this.showNext();
        }
    }

    getPriority(type) {
        const priorities = {
            'error': 100,
            'success': 80,
            'warning': 60,
            'info': 40
        };
        return priorities[type] || 40;
    }

    showNext() {
        if (this.queue.length === 0) {
            this.currentNotification = null;
            return;
        }
        
        const notification = this.queue.shift();
        this.currentNotification = notification;
        
        this.eventBus.emit('notification_show', notification);
        
        // Auto-hide after duration
        setTimeout(() => {
            this.hideCurrent();
        }, notification.duration);
    }

    hideCurrent() {
        if (this.currentNotification) {
            this.eventBus.emit('notification_hide', this.currentNotification);
            this.currentNotification = null;
            
            // Show next in queue
            setTimeout(() => this.showNext(), 300);
        }
    }

    clear() {
        this.queue = [];
        this.hideCurrent();
    }
}



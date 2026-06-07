/**
 * PERFORMANCE SYSTEM - Quality & Performance Settings
 * 
 * Manages performance settings and quality levels.
 * Allows players to optimize for their device.
 */

export class PerformanceSystem {
    constructor(eventBus, settings) {
        this.eventBus = eventBus;
        this.settings = settings;
        
        this.qualityLevels = {
            low: {
                particles: 5,
                maxParticles: 50,
                effects: false,
                shadows: false,
                animations: 'reduced'
            },
            medium: {
                particles: 15,
                maxParticles: 150,
                effects: true,
                shadows: true,
                animations: 'normal'
            },
            high: {
                particles: 30,
                maxParticles: 300,
                effects: true,
                shadows: true,
                animations: 'full'
            }
        };
        
        this.currentQuality = this.settings.get('quality') || 'medium';
        this.applyQuality(this.currentQuality);
    }

    applyQuality(level) {
        this.currentQuality = level;
        this.settings.set('quality', level);
        
        const config = this.qualityLevels[level];
        this.eventBus.emit('quality_changed', config);
        
        return config;
    }

    getQualityConfig() {
        return this.qualityLevels[this.currentQuality];
    }

    getCurrentQuality() {
        return this.currentQuality;
    }

    setQuality(level) {
        if (this.qualityLevels[level]) {
            this.applyQuality(level);
            return true;
        }
        return false;
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measure = () => {
            frameCount++;
            const now = performance.now();
            
            if (now - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = now;
                
                this.eventBus.emit('fps_update', fps);
                
                // Auto-adjust quality if FPS is too low
                if (fps < 30 && this.currentQuality !== 'low') {
                    this.eventBus.emit('performance_warning', { fps, suggestion: 'lower_quality' });
                }
            }
            
            requestAnimationFrame(measure);
        };
        
        requestAnimationFrame(measure);
    }
}



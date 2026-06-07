export class Renderer {
    constructor(canvasId, eventBus) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.eventBus = eventBus;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.particles = [];
        this.floatingTexts = [];
        this.ripples = [];
        this.particleCount = 5;
        this.maxParticles = 300;

        // Listen for dopamine triggers
        this.eventBus.on('damage', (data) => this.spawnDamageText(data));
        this.eventBus.on('loot', (data) => this.spawnLootEffect(data));
        this.eventBus.on('click_effect', (pos) => this.spawnClickPulse(pos));

        // Core visual
        this.coreScale = 1;
        this.corePulseDir = 1;
        this.shake = 0;
        this.currentEnemy = null;
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    render(dt) {
        // Clear
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Void Core
        this.updateCore(dt);
        this.drawCore();

        // Draw Enemy Overlay
        this.drawEnemy(dt);

        // Draw Particles
        this.updateAndDrawParticles(dt);
        this.updateAndDrawRipples(dt);
        this.updateAndDrawTexts(dt);
    }

    updateCore(dt) {
        // Heartbeat effect (Living system)
        this.coreScale += (0.5 * dt) * this.corePulseDir;
        if (this.coreScale > 1.1) this.corePulseDir = -1;
        if (this.coreScale < 0.9) this.corePulseDir = 1;

        // Shake dampening
        if (this.shake > 0) {
            this.shake -= dt * 5;
            if (this.shake < 0) this.shake = 0;
        }
    }

    drawEnemy(dt) {
        if (!this.currentEnemy) return;

        const x = this.centerX + (Math.random() - 0.5) * this.shake * 20;
        const y = this.centerY + (Math.random() - 0.5) * this.shake * 20;
        const size = 100 * this.coreScale; // Base size linked to core pulse

        this.ctx.save();
        this.ctx.translate(x, y);

        // SHIELD VISUAL
        if (this.currentEnemy.shieldIntegrity && this.currentEnemy.shieldIntegrity > 0) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 150, 255, ${0.3 + Math.sin(Date.now() / 200) * 0.2})`;
            this.ctx.strokeStyle = '#00aaff';
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();

            // Shield Text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px "JetBrains Mono"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`SHIELD: ${this.currentEnemy.shieldIntegrity}`, 0, -size / 2 - 5);
        }

        // Glitch Effect
        if (this.shake > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 85, ${0.5 + Math.random() * 0.5})`;
            this.ctx.fillRect(-size / 2 + Math.random() * 10, -size / 2, size, size);
        }

        // Procedural Geometry
        if (this.currentEnemy.visuals) {
            this.drawProceduralEnemy(size * 0.8, dt);
        }

        // HP Bar Background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(-60, size / 2 + 20, 120, 10);

        // HP Bar Fill
        const pct = this.currentEnemy.hpPercent;
        this.ctx.fillStyle = pct < 0.3 ? '#ff0055' : '#00ff9d';
        this.ctx.fillRect(-60, size / 2 + 20, 120 * pct, 10);

        // Level Text
        this.ctx.font = '12px "JetBrains Mono"';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`LVL ${this.currentEnemy.level}`, 0, -size / 2 - 20);

        if (this.currentEnemy.isBoss) {
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillText(`⚠️ BOSS ⚠️`, 0, -size / 2 - 40);

            // Timer Bar
            if (this.currentEnemy.bossTimer !== undefined) {
                const timerPct = this.currentEnemy.bossTimer / 30; // Hardcoded max logic for now, or pass max
                const barW = 120 * timerPct;
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(-60, size / 2 + 35, barW, 4);

                this.ctx.font = '10px "JetBrains Mono"';
                this.ctx.fillText(`${Math.ceil(this.currentEnemy.bossTimer)}s`, 0, size / 2 + 50);
            }
        }

        this.ctx.restore();
    }

    // Call this when enemy updates
    updateEnemyState(data) {
        this.currentEnemy = data;
        // In a real engine, we wouldn't just replace the object ref if we want interpolation,
        // but for this prototype, checking `data.shieldIntegrity` in draw loop is fine.
    }

    triggerShake() {
        this.shake = 1.0;
    }

    drawCore() {
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.scale(this.coreScale, this.coreScale);

        // Glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ff9d';

        // Shape
        this.ctx.fillStyle = '#000';
        this.ctx.strokeStyle = '#00ff9d';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -50);
        this.ctx.lineTo(43, -25);
        this.ctx.lineTo(43, 25);
        this.ctx.lineTo(0, 50);
        this.ctx.lineTo(-43, 25);
        this.ctx.lineTo(-43, -25);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }

    spawnClickPulse(pos) {
        // Immediate feedback with quality-based particle count
        const particleCount = this.particleCount || 5;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: pos.x || this.centerX,
                y: pos.y || this.centerY,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 0.5,
                color: '#fff',
                size: 2,
                type: 'click'
            });
        }
        
        // Add ripple effect
        this.ripples = this.ripples || [];
        this.ripples.push({
            x: pos.x || this.centerX,
            y: pos.y || this.centerY,
            radius: 0,
            maxRadius: 100,
            life: 0.3,
            color: 'rgba(0, 255, 157, 0.3)'
        });
    }
    
    setParticleCount(count) {
        this.particleCount = count;
    }
    
    setMaxParticles(max) {
        this.maxParticles = max || 300;
    }

    spawnDamageText(amount) {
        const x = this.centerX + (Math.random() - 0.5) * 50;
        const y = this.centerY - 50;

        // This is generic handling, but we prefer CSS for text to ensure crispness on mobile.
        // However, we manage the queue here if needed for canvas text. 
        // For this implementation, we will use the DOM overlay for text as it's easier to animate with CSS keyframes.
        // But let's add some spark particles here for the "Impact" feel.

        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: this.centerX,
                y: this.centerY,
                vx: (Math.random() - 0.5) * 500,
                vy: (Math.random() - 0.5) * 500,
                life: 0.3,
                color: '#ff0055', // Red sparks for damage
                size: 3
            });
        }
    }

    spawnLootEffect(loot) {
        // BIG EXPLOSION for loot with quality-based count
        const particleCount = Math.min(this.particleCount * 4, 30);
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.centerX,
                y: this.centerY,
                vx: (Math.random() - 0.5) * 800,
                vy: (Math.random() - 0.5) * 800,
                life: 1.5,
                color: loot.color,
                size: 4,
                type: 'loot'
            });
        }
        
        // Special ripple for legendary+
        if (loot.type === 'LEGENDARY' || loot.type === 'MYTHIC') {
            this.ripples.push({
                x: this.centerX,
                y: this.centerY,
                radius: 0,
                maxRadius: 200,
                life: 1.0,
                color: loot.color
            });
        }
    }

    updateAndDrawParticles(dt) {
        // Limit particles for performance
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            
            // Different rendering based on particle type
            if (p.type === 'click') {
                // Circular particles for clicks
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Square particles for damage/loot
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
        this.ctx.globalAlpha = 1;
    }
    
    updateAndDrawRipples(dt) {
        if (!this.ripples) return;
        
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            let r = this.ripples[i];
            r.radius += 200 * dt;
            r.life -= dt;

            if (r.life <= 0 || r.radius > r.maxRadius) {
                this.ripples.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = r.life * 0.5;
            this.ctx.strokeStyle = r.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
    }

    updateAndDrawTexts(dt) {
        // Placeholder if we move text to canvas
    }

    drawProceduralEnemy(size, dt) {
        const v = this.currentEnemy.visuals;

        // Rotation
        const rot = (Date.now() / 1000) * v.rotateSpeed;

        this.ctx.save();
        this.ctx.rotate(rot);
        this.ctx.strokeStyle = v.color;
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = v.color;
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';

        this.ctx.beginPath();
        const sides = v.sides;
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const r = size / 2;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Inner Pulse
        const scale = 0.5 + Math.sin(Date.now() / 200) * 0.1;
        this.ctx.scale(scale, scale);
        this.ctx.fillStyle = v.color;
        this.ctx.globalAlpha = 0.5;
        this.ctx.fill();

        this.ctx.restore();
    }
}

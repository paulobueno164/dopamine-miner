/**
 * ANIMATION SYSTEM - Smooth Transitions
 * 
 * Manages UI animations and transitions.
 * Improves visual polish and feel.
 */

export class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.init();
    }

    init() {
        // Add CSS animations dynamically
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes glow {
                0%, 100% {
                    box-shadow: 0 0 5px var(--accent-primary);
                }
                50% {
                    box-shadow: 0 0 20px var(--accent-primary), 0 0 30px var(--accent-primary);
                }
            }
            
            .animate-slide-down {
                animation: slideDown 0.3s ease-out;
            }
            
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out;
            }
            
            .animate-scale-in {
                animation: scaleIn 0.3s ease-out;
            }
            
            .animate-glow {
                animation: glow 2s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    animate(element, animation, duration = 300) {
        return new Promise((resolve) => {
            element.classList.add(`animate-${animation}`);
            setTimeout(() => {
                element.classList.remove(`animate-${animation}`);
                resolve();
            }, duration);
        });
    }

    fadeIn(element, duration = 300) {
        return this.animate(element, 'fade-in', duration);
    }

    slideDown(element, duration = 300) {
        return this.animate(element, 'slide-down', duration);
    }

    scaleIn(element, duration = 300) {
        return this.animate(element, 'scale-in', duration);
    }

    addGlow(element) {
        element.classList.add('animate-glow');
    }

    removeGlow(element) {
        element.classList.remove('animate-glow');
    }

    // Number counter animation
    animateNumber(element, from, to, duration = 1000) {
        const start = performance.now();
        const difference = to - from;
        
        const update = (current) => {
            const elapsed = current - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = from + (difference * easeOut);
            
            element.textContent = Math.floor(currentValue).toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = to.toLocaleString();
            }
        };
        
        requestAnimationFrame(update);
    }
}


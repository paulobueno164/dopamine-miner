export class TutorialSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.step = 0;
        this.active = false;
        this.currentOverlay = null;

        // Define steps
        this.steps = [
            {
                id: 'welcome',
                text: "INITIATING NEURAL LINK... \n\nWelcome to the VOID PROTOCOL, Unit 734.\nYour directive is to extract Entropy from the unstable geometry.",
                target: null
            },
            {
                id: 'click',
                text: "MANUAL OVERRIDE DETECTED.\n\nClick the UNSTABLE GEOMETRY in the center to destabilize it.",
                target: '#game-canvas', // Focus on canvas
                condition: 'click', // Handled by event listener logic usually, or we just utilize "Acknowledge" for now to keep it simple, 
                // BUT, forcing user to click the core is better.
                // For prototype speed, I will stick to "Next" buttons but position them near interest points.
                // Actually, let's make the canvas interactive.
                forceInteraction: true
            },
            {
                id: 'currency',
                text: "ENTROPY GENERATED.\n\nThis is your currency. Use it to automate the process.",
                target: '#dps-display'
            },
            {
                id: 'stability',
                text: "WARNING: PSYCHOSOMATIC STABILITY.\n\nIf this reaches 0%, you suffer a mental breakdown (Efficiency Loss). Keep mining to maintain focus.",
                target: '#stability-display'
            },
            {
                id: 'upgrades',
                text: "SYSTEMS TAB.\n\nAccess this tab to purchase Auto-Miners and improve yield.",
                target: '[data-tab="upgrades"]',
                forceInteraction: true
            }
        ];
    }

    start() {
        if (localStorage.getItem('TUTORIAL_COMPLETED')) return;

        this.active = true;
        this.step = 0;
        this.showStep();
    }

    showStep() {
        const data = this.steps[this.step];
        if (!data) {
            this.complete();
            return;
        }

        this.createOverlay(data);
    }

    createOverlay(data) {
        if (this.currentOverlay) this.currentOverlay.remove();

        const overlay = document.createElement('div');
        this.currentOverlay = overlay;

        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.zIndex = '99999';
        overlay.style.pointerEvents = data.forceInteraction ? 'none' : 'all'; // Allow clicking through if forced? No, that's complex.

        // If force interaction, we use a mask.
        // Simple approach: 4 divs to dim everything EXCEPT target.
        // OR: SVG mask.
        // Let's stick to "Spotlight" approach.

        // Background dimmer
        const dimmer = document.createElement('div');
        dimmer.style.position = 'absolute';
        dimmer.style.top = '0';
        dimmer.style.left = '0';
        dimmer.style.width = '100%';
        dimmer.style.height = '100%';
        dimmer.style.background = 'rgba(0,0,0,0.8)';
        // If we want to click through to a specific element, we need a "hole".

        let targetRect = { top: 0, left: 0, width: 0, height: 0 };
        if (data.target) {
            const el = document.querySelector(data.target);
            if (el) {
                targetRect = el.getBoundingClientRect();

                // MASK: clip-path is easiest
                // inset(top right bottom left)
                // We want the REVERSE of this... clip-path cuts things OUT (keeps them).
                // To make a HOLE, we usually use a huge border or SVG.
                // Let's use the "4 divs" technique or just box-shadow inset on a helper.

                // Better: Use `mask-image` or canvas cutout?
                // Simplest CSS: `box-shadow: 0 0 0 9999px rgba(0,0,0,0.8)` on the HIGHLIGHT element.

                dimmer.style.background = 'transparent'; // We use the highlight for the dimming
            }
        }

        overlay.appendChild(dimmer);

        // Highlight Box
        if (data.target) {
            const high = document.createElement('div');
            high.style.position = 'absolute';
            high.style.top = targetRect.top + 'px';
            high.style.left = targetRect.left + 'px';
            high.style.width = targetRect.width + 'px';
            high.style.height = targetRect.height + 'px';
            high.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.8), 0 0 20px var(--accent-primary)';
            high.style.borderRadius = '5px';
            high.style.pointerEvents = 'none'; // Let clicks pass through?
            // If we want user to CLICK the target, we need pointer-events: none on overlay/dimmer.
            // But we block everything else.

            // Actually, if we want them to click "Next" we block everything.
            // If we want them to click the TARGET, we leave the hole open.

            overlay.appendChild(high);
        }

        // Text Box
        const box = document.createElement('div');
        box.style.position = 'absolute';
        // Position relative to target
        if (data.target) {
            if (targetRect.top > window.innerHeight / 2) {
                box.style.bottom = (window.innerHeight - targetRect.top + 20) + 'px';
            } else {
                box.style.top = (targetRect.bottom + 20) + 'px';
            }
            box.style.left = '50%';
            box.style.transform = 'translate(-50%, 0)';
        } else {
            box.style.top = '50%';
            box.style.left = '50%';
            box.style.transform = 'translate(-50%, -50%)';
        }

        box.style.width = '300px';
        box.style.background = '#000';
        box.style.border = '1px solid var(--accent-primary)';
        box.style.padding = '20px';
        box.style.color = '#fff';
        box.style.textAlign = 'center';
        box.style.pointerEvents = 'auto'; // Ensure we can click buttons inside

        box.innerHTML = `<div style="margin-bottom:15px; font-family:'JetBrains Mono'; white-space:pre-wrap;">${data.text}</div>`;

        if (!data.forceInteraction) {
            const btn = document.createElement('button');
            btn.innerText = "ACKNOWLEDGE";
            btn.style.padding = '10px 20px';
            btn.style.background = 'var(--accent-primary)';
            btn.style.border = 'none';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = 'pointer';
            btn.onclick = () => this.next();
            box.appendChild(btn);
        } else {
            const hint = document.createElement('div');
            hint.innerText = "(Interact with highlighted element to continue)";
            hint.style.fontSize = '10px';
            hint.style.color = '#888';
            box.appendChild(hint);

            // Listen for interaction
            // This is hacky: we attach a one-time listener to the target?
            // OR we just wait for the specific event type on the Bus?
            const el = document.querySelector(data.target);
            if (el) {
                // If it's a button, click
                const oneTimeClick = () => {
                    this.next();
                    el.removeEventListener('click', oneTimeClick);
                };
                el.addEventListener('click', oneTimeClick);
            }
        }

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    next() {
        this.step++;
        this.showStep();
    }

    complete() {
        if (this.currentOverlay) this.currentOverlay.remove();
        this.active = false;
        localStorage.setItem('TUTORIAL_COMPLETED', 'true');
        this.eventBus.emit('system_message', { text: "TRAINING COMPLETE", type: 'success' });
    }
}

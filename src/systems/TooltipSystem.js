/**
 * TOOLTIP SYSTEM - Contextual Information
 * 
 * Provides helpful information on hover/click.
 * Improves UX and reduces confusion.
 */

export class TooltipSystem {
    constructor() {
        this.activeTooltip = null;
        this.tooltipElement = null;
        this.init();
    }

    init() {
        // Create tooltip element
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.id = 'game-tooltip';
        this.tooltipElement.style.position = 'fixed';
        this.tooltipElement.style.background = 'rgba(0, 0, 0, 0.95)';
        this.tooltipElement.style.border = '1px solid var(--accent-primary)';
        this.tooltipElement.style.padding = '8px 12px';
        this.tooltipElement.style.borderRadius = '4px';
        this.tooltipElement.style.fontFamily = 'var(--font-mono)';
        this.tooltipElement.style.fontSize = '11px';
        this.tooltipElement.style.color = '#fff';
        this.tooltipElement.style.zIndex = '100000';
        this.tooltipElement.style.pointerEvents = 'none';
        this.tooltipElement.style.opacity = '0';
        this.tooltipElement.style.transition = 'opacity 0.2s';
        this.tooltipElement.style.maxWidth = '300px';
        this.tooltipElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        document.body.appendChild(this.tooltipElement);
    }

    show(element, text, position = 'top') {
        if (!text) return;
        
        this.hide();
        this.activeTooltip = { element, text, position };
        
        this.tooltipElement.innerHTML = text.replace(/\n/g, '<br>');
        this.tooltipElement.style.opacity = '1';
        
        this.updatePosition();
        
        // Update position on scroll/resize
        const updateHandler = () => this.updatePosition();
        window.addEventListener('scroll', updateHandler, true);
        window.addEventListener('resize', updateHandler);
        
        this.updateHandler = updateHandler;
    }

    updatePosition() {
        if (!this.activeTooltip) return;
        
        const rect = this.activeTooltip.element.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        
        let x = 0;
        let y = 0;
        
        switch (this.activeTooltip.position) {
            case 'top':
                x = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                y = rect.top - tooltipRect.height - 10;
                break;
            case 'bottom':
                x = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                y = rect.bottom + 10;
                break;
            case 'left':
                x = rect.left - tooltipRect.width - 10;
                y = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                x = rect.right + 10;
                y = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
        }
        
        // Keep within viewport
        x = Math.max(10, Math.min(x, window.innerWidth - tooltipRect.width - 10));
        y = Math.max(10, Math.min(y, window.innerHeight - tooltipRect.height - 10));
        
        this.tooltipElement.style.left = x + 'px';
        this.tooltipElement.style.top = y + 'px';
    }

    hide() {
        if (this.activeTooltip) {
            if (this.updateHandler) {
                window.removeEventListener('scroll', this.updateHandler, true);
                window.removeEventListener('resize', this.updateHandler);
                this.updateHandler = null;
            }
            this.activeTooltip = null;
        }
        this.tooltipElement.style.opacity = '0';
    }

    attach(element, text, position = 'top') {
        element.addEventListener('mouseenter', () => {
            this.show(element, text, position);
        });
        element.addEventListener('mouseleave', () => {
            this.hide();
        });
    }
}



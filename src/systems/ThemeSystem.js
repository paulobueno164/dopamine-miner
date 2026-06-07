/**
 * THEME SYSTEM - Visual Customization
 * 
 * Allows players to customize the visual appearance.
 * Creates personal investment and attachment.
 */

export class ThemeSystem {
    constructor(eventBus, settings) {
        this.eventBus = eventBus;
        this.settings = settings;
        
        this.themes = {
            default: {
                name: 'VOID PROTOCOL',
                colors: {
                    primary: '#00ff9d',
                    secondary: '#ff0055',
                    gold: '#ffd700',
                    purple: '#bd00ff',
                    bg: '#050505',
                    panel: '#0a0a0f'
                }
            },
            neon: {
                name: 'NEON NIGHTS',
                colors: {
                    primary: '#ff00ff',
                    secondary: '#00ffff',
                    gold: '#ffff00',
                    purple: '#ff00ff',
                    bg: '#000011',
                    panel: '#001122'
                }
            },
            matrix: {
                name: 'MATRIX',
                colors: {
                    primary: '#00ff00',
                    secondary: '#ff0000',
                    gold: '#ffff00',
                    purple: '#00ffff',
                    bg: '#000000',
                    panel: '#001100'
                }
            },
            cyberpunk: {
                name: 'CYBERPUNK',
                colors: {
                    primary: '#ff0080',
                    secondary: '#00ff80',
                    gold: '#ffaa00',
                    purple: '#8000ff',
                    bg: '#0a0a1a',
                    panel: '#1a1a2a'
                }
            },
            dark: {
                name: 'DARK MODE',
                colors: {
                    primary: '#ffffff',
                    secondary: '#ff4444',
                    gold: '#ffaa00',
                    purple: '#aa44ff',
                    bg: '#000000',
                    panel: '#111111'
                }
            }
        };
        
        this.currentTheme = this.settings.get('theme') || 'default';
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) return false;
        
        this.currentTheme = themeName;
        this.settings.set('theme', themeName);
        
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // Apply CSS variables
        root.style.setProperty('--accent-primary', theme.colors.primary);
        root.style.setProperty('--accent-secondary', theme.colors.secondary);
        root.style.setProperty('--accent-gold', theme.colors.gold);
        root.style.setProperty('--accent-purple', theme.colors.purple);
        root.style.setProperty('--bg-dark', theme.colors.bg);
        root.style.setProperty('--bg-panel', theme.colors.panel);
        
        this.eventBus.emit('theme_changed', theme);
        return true;
    }

    getThemes() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            ...this.themes[key]
        }));
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    unlockTheme(themeId) {
        // Themes can be unlocked through achievements or purchases
        // For now, all themes are available
        return true;
    }
}



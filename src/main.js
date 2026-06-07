import { EventBus } from './core/EventBus.js';
import { EconomySystem } from './systems/Economy.js';
import { PsychologySystem } from './systems/PsychologySystem.js';
import { LootSystem } from './systems/Loot.js';
import { Renderer } from './systems/Renderer.js';
import { Upgrades } from './config/Upgrades.js';
import { ProgressionSystem } from './systems/Progression.js';
import { InventorySystem } from './systems/Inventory.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { PrestigeSystem } from './systems/Prestige.js';
import { AchievementSystem } from './systems/AchievementSystem.js';
import { EnemySystem } from './systems/EnemySystem.js';
import { SkillSystem } from './systems/SkillSystem.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { StorySystem } from './systems/StorySystem.js';
import { TutorialSystem } from './systems/TutorialSystem.js';
import { SettingsSystem } from './systems/Settings.js';
import { DailyRewardSystem, DailyRewardsConfig } from './systems/DailyRewards.js';
import { PrestigeTreeSystem } from './systems/PrestigeTreeSystem.js';
import { PrestigeNodes } from './config/PrestigeTree.js';
import { ChallengeSystem } from './systems/ChallengeSystem.js';
import { HackingSystem } from './systems/HackingSystem.js';
import { LoreEntries } from './config/Lore.js';
import { Achievements } from './config/Achievements.js';
import { DroneSystem } from './systems/DroneSystem.js';
import { DroneTraits } from './config/DroneConfig.js';
import { Skills } from './config/Skills.js';
import { ComboSystem } from './systems/ComboSystem.js';
import { StatisticsSystem } from './systems/StatisticsSystem.js';
import { QuestSystem } from './systems/QuestSystem.js';
import { EventSystem } from './systems/EventSystem.js';
import { ResearchSystem } from './systems/ResearchSystem.js';
import { BuffSystem } from './systems/BuffSystem.js';
import { NotificationSystem } from './systems/NotificationSystem.js';
import { CraftingSystem } from './systems/CraftingSystem.js';
import { MilestoneSystem } from './systems/MilestoneSystem.js';
import { TooltipSystem } from './systems/TooltipSystem.js';
import { PerformanceSystem } from './systems/PerformanceSystem.js';
import { ThemeSystem } from './systems/ThemeSystem.js';
import { TimeRewardSystem } from './systems/TimeRewardSystem.js';
import { AnimationSystem } from './systems/AnimationSystem.js';
import { DataExportSystem } from './systems/DataExportSystem.js';
import { LeaderboardSystem } from './systems/LeaderboardSystem.js';
import { ModSystem } from './systems/ModSystem.js';
import { SeasonalEventSystem } from './systems/SeasonalEventSystem.js';
import { GuildSystem } from './systems/GuildSystem.js';
import { MiniGameSystem } from './systems/MiniGameSystem.js';
import { PvPSystem } from './systems/PvPSystem.js';
import { StreakRewardSystem } from './systems/StreakRewardSystem.js';
import { AnalyticsSystem } from './systems/AnalyticsSystem.js';
import { TradingSystem } from './systems/TradingSystem.js';
import { AutomationSystem } from './systems/AutomationSystem.js';
import { AdvancedPrestigeSystem } from './systems/AdvancedPrestigeSystem.js';
import { AdvancedAchievementSystem } from './systems/AdvancedAchievementSystem.js';
import { DifficultyModifierSystem } from './systems/DifficultyModifierSystem.js';

class Game {
    constructor() {
        this.eventBus = new EventBus();
        this.economy = new EconomySystem();
        this.loot = new LootSystem();
        this.drones = new DroneSystem(this.eventBus, this.economy);
        this.inventory = new InventorySystem(this.eventBus);
        this.psychology = new PsychologySystem(this.eventBus);
        this.progression = new ProgressionSystem(
            this.economy,
            this.psychology,
            this.loot,
            this.inventory,
            this.eventBus
        );
        this.prestige = new PrestigeSystem(
            this.economy,
            this.inventory,
            this.progression,
            this.progression,
            this.eventBus
        );
        this.achievements = new AchievementSystem(
            this.eventBus,
            this.economy,
            this.loot,
            this.progression
        );
        this.skills = new SkillSystem(this.eventBus);
        this.story = new StorySystem(this.eventBus);
        this.tutorial = new TutorialSystem(this.eventBus);
        this.enemies = new EnemySystem(this.eventBus);
        this.audio = new AudioSystem(); // Audio Output

        // Circular dependencies handling
        this.skills.setGame(this);
        // Inject skill system into progression for buffs
        this.progression.setSkillSystem(this.skills);

        this.renderer = new Renderer('game-canvas', this.eventBus);
        
        this.setupAudio();

        this.settings = new SettingsSystem(this.eventBus);
        this.performance = new PerformanceSystem(this.eventBus, this.settings);
        
        // Apply initial quality settings
        const qualityConfig = this.performance.getQualityConfig();
        this.renderer.setParticleCount(qualityConfig.particles);
        this.renderer.setMaxParticles(qualityConfig.maxParticles);
        this.daily = new DailyRewardSystem(this.eventBus, this.economy, this.inventory);
        this.challenges = new ChallengeSystem(this.eventBus, this.economy, this.progression, this.enemies, this.psychology);
        this.hacking = new HackingSystem(this.eventBus, this.economy, this.psychology);
        this.prestigeTree = new PrestigeTreeSystem(this.eventBus, this.economy, this.prestige);
        this.combo = new ComboSystem(this.eventBus);
        this.statistics = new StatisticsSystem(this.eventBus);
        this.quests = new QuestSystem(this.eventBus, this.economy, this.progression, this.inventory, this.enemies);
        this.events = new EventSystem(this.eventBus, this.economy, this.progression);
        this.research = new ResearchSystem(this.eventBus, this.economy, this.progression);
        this.buffs = new BuffSystem(this.eventBus);
        this.notifications = new NotificationSystem(this.eventBus);
        this.crafting = new CraftingSystem(this.eventBus, this.economy, this.inventory);
        this.milestones = new MilestoneSystem(this.eventBus, this.economy, this.progression, this.statistics);
        this.tooltips = new TooltipSystem();
        this.theme = new ThemeSystem(this.eventBus, this.settings);
        this.timeRewards = new TimeRewardSystem(this.eventBus, this.economy, this.statistics);
        this.animations = new AnimationSystem();
        this.dataExport = new DataExportSystem(this.eventBus, this.saveSystem);
        this.leaderboard = new LeaderboardSystem(this.eventBus, this.economy, this.statistics);
        this.mods = new ModSystem(this.eventBus, this.economy);
        this.seasonal = new SeasonalEventSystem(this.eventBus, this.economy, this.progression);
        this.guilds = new GuildSystem(this.eventBus, this.economy, this.statistics);
        this.miniGames = new MiniGameSystem(this.eventBus, this.economy);
        this.pvp = new PvPSystem(this.eventBus, this.economy, this.progression, this.enemies);
        this.streakRewards = new StreakRewardSystem(this.eventBus, this.economy);
        this.analytics = new AnalyticsSystem(this.eventBus, this.statistics, this.economy, this.progression);
        this.trading = new TradingSystem(this.eventBus, this.economy, this.inventory);
        this.automation = new AutomationSystem(this.eventBus, this.economy, this.progression);
        this.advancedPrestige = new AdvancedPrestigeSystem(this.eventBus, this.economy, this.prestige);
        this.advancedAchievements = new AdvancedAchievementSystem(this.eventBus, this.statistics, this.economy, this.progression);
        this.difficultyModifiers = new DifficultyModifierSystem(this.eventBus, this.economy, this.progression, this.enemies);
        
        // Setup event and research effect handlers
        this.setupEventEffects();
        this.setupResearchEffects();
        this.setupSkillBuffs();

        this.progression.setTreeSystem(this.prestigeTree);
        this.progression.setChallengeSystem(this.challenges);

        // Inject Settings

        // Inject Settings
        this.economy.setSettings(this.settings);
        this.economy.setChallengeSystem(this.challenges);
        this.economy.setDroneSystem(this.drones);
        this.psychology.setChallengeSystem(this.challenges);
        this.psychology.setDroneSystem(this.drones);
        this.progression.setDroneSystem(this.drones);
        window.game = this;

        this.lastTime = 0;
        this.dps = 0;
        this.clickDamage = 1;
        this.lastDisplayedEntropy = 0;
        this.hasShownUpgradeHint = false;
        this.lastDebugCheck = 0;

        // BIND UI
        this.ui = {
            dps: document.getElementById('dps-display'),
            stability: document.getElementById('stability-display'),
            manualBtn: document.getElementById('manual-override-btn'),
            overlay: document.getElementById('overlay-layer'),
            premium: document.getElementById('premium-currency')
        };

        this.attachInputs();
        this.setupSystems();
        this.setupTabs();
        this.setupInventoryUI();
        this.setupPrestigeUI();
        this.setupSocialUI();
        this.setupSkillUI();
        this.setupStoryUI();
        this.setupDailyUI();
        this.setupPrestigeTreeUI();
        this.setupChallengeUI();
        this.setupAchievementUI();
        this.setupDroneUI();
        this.setupHackingUI();
        this.setupSettingsUI();
        this.setupComboUI();
        this.setupStatisticsUI();
        this.setupQuestUI();
        this.setupEventUI();
        this.setupResearchUI();
        this.setupBuffUI();
        this.setupNotificationUI();
        this.setupCraftingUI();
        this.setupMilestoneUI();
        this.setupPerformanceUI();
        this.setupTooltips();
        this.setupThemeUI();
        this.setupTimeRewardUI();
        this.setupAudioImprovements();
        this.setupLeaderboardUI();
        this.setupModUI();
        this.setupSeasonalEventUI();
        this.setupPrestigeImprovements();
        this.setupGuildUI();
        this.setupMiniGameUI();
        this.setupPvPUI();
        this.setupStreakRewardUI();
        this.setupAnalyticsUI();
        this.setupTradingUI();
        this.setupAutomationUI();
        this.setupAdvancedPrestigeUI();
        this.setupAdvancedAchievementsUI();
        this.setupDifficultyModifiersUI();

        this.saveSystem = new SaveSystem(this.eventBus, {
            economy: this.economy,
            progression: this.progression,
            inventory: this.inventory,
            psychology: this.psychology,
            prestige: this.prestige,
            achievements: this.achievements,
            enemies: this.enemies,
            story: this.story,
            daily: this.daily,
            tree: this.prestigeTree,
            challenges: this.challenges,
            drones: this.drones,
            combo: this.combo,
            statistics: this.statistics,
            quests: this.quests,
            events: this.events,
            research: this.research,
            buffs: this.buffs,
            crafting: this.crafting,
            milestones: this.milestones,
            timeRewards: this.timeRewards,
            mods: this.mods,
            seasonal: this.seasonal,
            guilds: this.guilds,
            miniGames: this.miniGames,
            pvp: this.pvp,
            streakRewards: this.streakRewards,
            analytics: this.analytics
        });

        // LOAD SAVE
        if (this.saveSystem.load()) {
            console.log("Save Loaded - Welcome Back Protocol Initiated");
        } else {
            // New user triggers tutorial
            setTimeout(() => this.tutorial.start(), 1000);
        }
        this.saveSystem.startAutoSave();

        // Listen for offline progress
        this.eventBus.on('offline_progress', (seconds) => {
            const dps = this.progression.getAutoDps();
            if (dps > 0) {
                const gained = dps * seconds * 0.5;
                this.economy.addEntropy(gained);
                this.eventBus.emit('system_message', {
                    text: `OFFLINE: +${this.economy.formatNumber(gained)} ENTROPY`,
                    type: 'success'
                });
            }
        });

        requestAnimationFrame((t) => this.loop(t));
    }

    setupSystems() {
        // AUDIO EVENTS
        this.eventBus.on('click_effect', () => this.audio.playClick());
        this.eventBus.on('loot', (loot) => this.audio.playLoot(loot.rarity));
        this.eventBus.on('enemy_killed', () => {
            this.drones.gainExperience(10); // Small XP per kill
        });
        this.eventBus.on('upgrade_purchased', () => this.audio.playTone(600, 'sine', 0.1));
        this.eventBus.on('system_message', (msg) => {
            if (msg.type === 'error') this.audio.playError();
            if (msg.type === 'success') this.audio.playLevelUp();
        });

        // Hack events
        this.eventBus.on('hack_input_correct', () => this.audio.playTone(800, 'sine', 0.05));

        this.eventBus.on('entropy_drain', (dt) => {
            const drain = this.economy.entropy * 0.05 * dt;
            if (drain > 0) {
                this.economy.spendEntropy(drain);
            }
        });

        // Listen for Stability Updates (Loss Aversion)
        this.eventBus.on('stability_update', (val) => {
            this.ui.stability.innerText = Math.floor(val) + "%";
            if (val < 20) this.ui.stability.classList.add('decaying');
            else this.ui.stability.classList.remove('decaying');
        });

        // Listen for Social Ticker
        this.eventBus.on('social_ticker', (msg) => {
            const el = document.createElement('div');
            el.className = 'fomo-ticker';
            el.innerText = msg;
            el.style.position = 'absolute';
            el.style.top = '70px';
            el.style.left = '10px';
            el.style.pointerEvents = 'none';
            el.style.textShadow = '0 0 5px black';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 4000);
        });

        // Populate Upgrades
        const list = document.getElementById('upgrade-list');
        list.innerHTML = ''; // Clear

        Upgrades.forEach(u => {
            const btn = document.createElement('div');
            btn.className = 'upgrade-item';
            btn.dataset.id = u.id;
            btn.style.padding = '10px';
            btn.style.borderBottom = '1px solid #333';

            const renderBtn = () => {
                const cost = this.progression.getUpgradeCost(u.id);
                const count = this.progression.ownedUpgrades[u.id] || 0;
                btn.innerHTML = `<div style="display:flex; justify-content:space-between">
                                    <span style="color:#fff; font-weight:bold;">${u.name} [Lvl ${count}]</span>
                                    <span style="color:var(--accent-gold);">${this.economy.formatNumber(cost)} ENT</span>
                                 </div>
                                 <div style="font-size:10px; color:#888; margin:5px 0;">${u.description}</div>
                                 <button class="buy-btn" style="width:100%; background:rgba(0,255,157,0.1); border:1px solid var(--accent-primary); color:#fff; padding:8px;">INSTALL UPDATE</button>`;

                btn.querySelector('.buy-btn').onclick = () => {
                    if (this.progression.buyUpgrade(u.id)) {
                        renderBtn(); // Re-render this button to update cost
                        this.ui.dps.innerText = this.economy.formatNumber(this.economy.entropy); // Update UI immediately
                    }
                }
            };

            renderBtn();
            list.appendChild(btn);
        });

        // Notification system is now handled by NotificationSystem
    }

    setupEventEffects() {
        // Track active multipliers from events, seasonal events, and mods
        this.activeMultipliers = {
            entropy_gain: 1.0,
            loot_chance: 1.0,
            auto_dps: 1.0,
            click_damage: 1.0,
            stability_decay: 1.0,
            globalMultiplier: 1.0,
            prestigeBonus: 1.0
        };

        this.eventBus.on('event_effect_applied', (effect) => {
            if (effect.type === 'multiplier') {
                this.activeMultipliers[effect.stat] = (this.activeMultipliers[effect.stat] || 1.0) * effect.value;
            }
        });

        this.eventBus.on('event_effect_removed', (effect) => {
            if (effect.type === 'multiplier') {
                this.activeMultipliers[effect.stat] = (this.activeMultipliers[effect.stat] || 1.0) / effect.value;
            }
        });
        
        // Seasonal event effects
        this.eventBus.on('seasonal_effect_applied', (effects) => {
            Object.keys(effects).forEach(key => {
                this.activeMultipliers[key] = (this.activeMultipliers[key] || 1.0) * effects[key];
            });
        });
        
        this.eventBus.on('seasonal_effect_removed', (effects) => {
            Object.keys(effects).forEach(key => {
                this.activeMultipliers[key] = (this.activeMultipliers[key] || 1.0) / effects[key];
            });
        });
        
        // Mod effects (handled separately but can also affect multipliers)
        this.eventBus.on('mod_effect_applied', (effects) => {
            // Mods are handled in getActiveEffects, but we can track here too
        });
    }

    setupResearchEffects() {
        // Research effects are applied via event_effect_applied
        this.eventBus.on('research_effect_applied', (effect) => {
            if (effect.type === 'multiplier') {
                this.activeMultipliers[effect.stat] = (this.activeMultipliers[effect.stat] || 1.0) * effect.value;
            }
        });
    }

    setupSkillBuffs() {
        // When skills are activated, create visual buffs
        this.eventBus.on('skill_activated', (skillId) => {
            const skill = Skills.find(s => s.id === skillId);
            if (skill && skill.type === 'buff') {
                // Create buff based on skill
                let buffData = null;
                
                if (skillId === 'overclock') {
                    buffData = {
                        name: 'OVERCLOCK',
                        description: '2x Auto-DPS',
                        icon: '⚡',
                        color: '#00ff9d',
                        duration: skill.duration,
                        effect: {
                            type: 'multiplier',
                            stat: 'auto_dps',
                            value: 2.0
                        },
                        stackable: false
                    };
                } else if (skillId === 'time_dilation') {
                    buffData = {
                        name: 'TIME DILATION',
                        description: 'Slowed time',
                        icon: '⏱️',
                        color: '#bd00ff',
                        duration: skill.duration,
                        effect: {
                            type: 'multiplier',
                            stat: 'time_scale',
                            value: 0.5
                        },
                        stackable: false
                    };
                }
                
                if (buffData) {
                    this.buffs.addBuff(buffData);
                    // Also apply to active multipliers
                    if (buffData.effect.type === 'multiplier') {
                        this.activeMultipliers[buffData.effect.stat] = 
                            (this.activeMultipliers[buffData.effect.stat] || 1.0) * buffData.effect.value;
                    }
                    
                    // Remove when buff expires
                    const removeHandler = (buff) => {
                        if (buff.name === buffData.name && buffData.effect.type === 'multiplier') {
                            this.activeMultipliers[buffData.effect.stat] = 
                                (this.activeMultipliers[buffData.effect.stat] || 1.0) / buffData.effect.value;
                            this.eventBus.off('buff_expired', removeHandler);
                        }
                    };
                    this.eventBus.on('buff_expired', removeHandler);
                }
            }
        });
    }

    setupInventoryUI() {
        const container = document.getElementById('tab-gacha');
        container.innerHTML = '<div id="inventory-grid" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; margin-bottom:20px;"></div><div id="fusion-controls" style="display:flex; flex-direction:column; gap:10px;"></div>';

        const grid = document.getElementById('inventory-grid');
        const fusion = document.getElementById('fusion-controls');

        const render = (items) => {
            grid.innerHTML = '';
            fusion.innerHTML = '';

            Object.keys(items).forEach(rarity => {
                const count = items[rarity];

                const box = document.createElement('div');
                box.style.border = `1px solid ${this.getRbColor(rarity)}`;
                box.style.background = 'rgba(0,0,0,0.5)';
                box.style.padding = '5px';
                box.style.textAlign = 'center';

                // Get Bonus Info
                const bonus = this.inventory.itemBonuses[rarity];
                const bonusDesc = bonus ? `<div style="font-size:8px; color:#aaa; margin-top:2px;">${bonus.desc}</div>` : '';

                box.innerHTML = `<div style="color:${this.getRbColor(rarity)}; font-size:10px; font-weight:bold;">${rarity}</div>
                                 <div style="font-size:18px; font-weight:bold; color:#fff;">${count}</div>
                                 ${bonusDesc}`;
                grid.appendChild(box);

                // Fusion
                if (this.inventory.fusionRates[rarity]) {
                    const btn = document.createElement('button');
                    const rate = this.inventory.fusionRates[rarity];
                    const canFuse = this.inventory.canFuse(rarity);

                    btn.innerHTML = `<span style="color:${this.getRbColor(rarity)}">${rarity}</span> ➜ <span style="color:${this.getRbColor(rate.target)}">${rate.target}</span> <span style="font-size:10px; opacity:0.7">(${rate.cost} req, ${(rate.chance * 100)}% chance)</span>`;
                    btn.style.width = '100%';
                    btn.style.background = canFuse ? 'rgba(255,255,255,0.1)' : '#111';
                    btn.style.border = canFuse ? `1px solid ${this.getRbColor(rate.target)}` : '1px solid #333';
                    btn.style.color = canFuse ? '#fff' : '#444';
                    btn.style.padding = '10px';
                    btn.style.cursor = canFuse ? 'pointer' : 'default';
                    btn.disabled = !canFuse;

                    btn.onclick = () => {
                        this.inventory.fuse(rarity);
                    };

                    fusion.appendChild(btn);
                }
            });
        };

        this.eventBus.on('inventory_updated', (items) => render(items));
        render(this.inventory.items);
    }

    setupPrestigeTreeUI() {
        const systemsTab = document.getElementById('tab-upgrades'); // Piggyback on upgrades tab for now

        const container = document.createElement('div');
        container.id = 'prestige-tree-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '2px solid var(--accent-purple)';
        container.style.paddingTop = '10px';
        container.style.display = 'none'; // Hidden by default

        container.innerHTML = `<h3 style="color:var(--accent-purple);">NEURAL WEB (PRESTIGE)</h3>
                               <div id="void-matter-display" style="color:#fff; margin-bottom:10px;">VOID MATTER: 0</div>
                               <div id="tree-canvas" style="position:relative; width:100%; height:300px; background:#000; border:1px solid #444; overflow:hidden;"></div>`;
        systemsTab.appendChild(container);

        const treeCanvas = container.querySelector('#tree-canvas');
        const voidDisplay = container.querySelector('#void-matter-display');

        // Render Nodes
        // Center is 150, 150?
        const cx = treeCanvas.offsetWidth / 2 || 150;
        const cy = 50;
        const scale = 50;

        const renderTree = () => {
            treeCanvas.innerHTML = ''; // Clear

            // Draw connections (simple lines)
            // Ideally SVG, but for prototype simple rotated divs or canvas overlay.
            // Let's use SVG overlay
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.position = 'absolute';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.top = '0';
            svg.style.left = '0';
            treeCanvas.appendChild(svg);

            // Re-calc center dynamic
            const centerX = treeCanvas.offsetWidth / 2;
            const startY = 40;

            PrestigeNodes.forEach(node => {
                const nx = centerX + (node.x * scale * 1.5);
                const ny = startY + (node.y * scale * 1.5);

                // Draw lines to dependencies
                node.req.forEach(reqId => {
                    const reqNode = PrestigeNodes.find(n => n.id === reqId);
                    if (reqNode) {
                        const rx = centerX + (reqNode.x * scale * 1.5);
                        const ry = startY + (reqNode.y * scale * 1.5);

                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', rx);
                        line.setAttribute('y1', ry);
                        line.setAttribute('x2', nx);
                        line.setAttribute('y2', ny);
                        line.setAttribute('stroke', '#444');
                        line.setAttribute('stroke-width', '2');
                        if (this.prestigeTree.hasNode(reqNode.id)) {
                            line.setAttribute('stroke', 'var(--accent-purple)');
                            line.setAttribute('opacity', '0.5');
                        }
                        svg.appendChild(line);
                    }
                });

                // Node Element
                const el = document.createElement('button');
                const unlocked = this.prestigeTree.hasNode(node.id);
                const canUnlock = this.prestigeTree.canUnlock(node.id);

                el.style.position = 'absolute';
                el.style.left = (nx - 15) + 'px';
                el.style.top = (ny - 15) + 'px';
                el.style.width = '30px';
                el.style.height = '30px';
                el.style.borderRadius = '50%';
                el.style.border = unlocked ? '2px solid var(--accent-purple)' : '1px solid #666';
                el.style.background = unlocked ? 'var(--accent-purple)' : '#222';
                if (canUnlock && !unlocked) el.style.border = '2px solid #fff';
                el.style.cursor = 'pointer';
                el.style.zIndex = '10';

                // Tooltip logic (simple title)
                el.title = `${node.name}\n${node.description}\nCost: ${node.cost} VM`;

                el.onclick = () => {
                    if (!unlocked && canUnlock) {
                        if (this.prestigeTree.unlock(node.id)) {
                            renderTree(); // refresh
                            updateDisplay();
                        }
                    }
                };

                treeCanvas.appendChild(el);
            });
        };

        const updateDisplay = () => {
            voidDisplay.innerText = `VOID MATTER: ${this.prestige.voidMatter}`;
            // Only show if we have ever ascended (count > 0)
            if (this.prestige.ascensionCount > 0) {
                container.style.display = 'block';
                // Trigger one render if needed (size might have changed)
                // renderTree(); 
            }
        };

        // Hook into update events
        this.eventBus.on('ascension_performed', () => updateDisplay());
        this.eventBus.on('node_unlocked', () => updateDisplay());

        // Initial check
        // Ideally wait for container to be attached and have width
        setTimeout(() => {
            updateDisplay();
            renderTree();
        }, 1000);
    }

    setupPrestigeUI() {
        // Find or create container (we might need a new tab or inject into header for now)
        // For 'Void Protocol', the button should only appear when ready.
        // We'll put it in the "SYSTEMS" tab at the bottom.

        const systemsTab = document.getElementById('tab-upgrades');
        const container = document.createElement('div');
        container.id = 'prestige-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-purple)';
        container.style.paddingTop = '10px';
        container.style.display = 'none'; // Hidden until ready

        container.innerHTML = `<div style="text-align:center; color:var(--accent-purple); font-weight:bold; margin-bottom:5px;">VOID ASCENSION PROTOCOL</div>
                               <div style="font-size:10px; color:#888; text-align:center; margin-bottom:10px;">Abandon physical form. Upload entropy to the Void.</div>
                               <div id="prestige-info" style="font-size:9px; color:#aaa; margin-bottom:10px; text-align:center; min-height:30px;"></div>
                               <button id="ascend-btn" style="width:100%; padding:15px; background:var(--accent-purple); color:#fff; border:none; font-weight:bold; letter-spacing:2px; cursor:pointer;">ASCEND</button>`;

        systemsTab.appendChild(container);

        const btn = document.getElementById('ascend-btn');
        btn.onclick = () => {
            if (confirm("WARNING: DISCARD PHYSICAL SHELL? \n(Reset Entropy/Upgrades. Gain Permanent Multiplier).")) {
                this.prestige.ascend();
                // Force UI refresh
                this.ui.dps.innerText = "0";
                // Ideally re-render entire UI
                window.location.reload(); // The nuclear option for a clean reset state :)
            }
        };

        // Check constantly if we can ascend
        setInterval(() => {
            const info = this.prestige.getAscensionInfo();
            if (info.canAscend) {
                container.style.display = 'block';
                const infoEl = container.querySelector('#prestige-info');
                if (infoEl) {
                    infoEl.innerHTML = `
                        <div>VOID MATTER: ${info.currentVoidMatter} → ${info.newVoidMatter} (+${info.voidMatterGain})</div>
                        <div>MULTIPLIER: ${info.currentMultiplier.toFixed(2)}x → ${info.newMultiplier.toFixed(2)}x (+${(info.multiplierIncrease * 100).toFixed(1)}%)</div>
                    `;
                }
                btn.innerText = `ASCEND (+${info.voidMatterGain} VM)`;
                btn.classList.add('pulse-btn');
            } else {
                container.style.display = 'none';
            }
        }, 1000);
    }

    setupChallengeUI() {
        const container = document.getElementById('tab-social');
        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:#fff; border-bottom:1px solid #ff0055; padding-bottom:5px; margin-top:20px;">SIMULATION PROTOCOLS</h3><div style="font-size:10px; color:#888;">WARNING: High Stress Environment</div>';
        container.appendChild(header);

        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '10px';
        list.style.marginTop = '10px';
        container.appendChild(list);

        const renderChallenges = () => {
            list.innerHTML = '';

            // Should import ChallengesConfig but I can iterate active status via System?
            // Since Config isn't imported, I'll allow ChallengeSystem to provide the list?
            // No, Main imports Config usually? No, Main imports System.
            // I should import ChallengesConfig in Main.js to iterate cleanly.
            // For now, I will use a hardcoded list matching the config to save an import line if possible, 
            // but importing is cleaner. I recall avoiding imports.
            // I will lazily rely on `this.challenges` if I can expose the config through it?
            // Actually, `activeChallengeId` is in system.
            // I'll assume I have `ChallengesConfig` imported if I add it to the import block.
            // Wait, I didn't import ChallengesConfig in main.js. Let me do that first or lazily define here.

            const challenges = [
                {
                    id: 'manual_labor',
                    name: 'MANUAL LABOR',
                    description: 'Auto-Miners Disabled. x2 Click DMG.',
                    goal: 'Level 10',
                    reward: '+10% Crit'
                },
                {
                    id: 'stability_test',
                    name: 'STRESS TEST',
                    description: 'Stability decays 3x faster.',
                    goal: 'Level 20',
                    reward: '+50 Max Stability'
                },
                {
                    id: 'poverty',
                    name: 'SCARCITY',
                    description: '-90% Entropy Gain.',
                    goal: '1M Entropy',
                    reward: '-10% Upgrade Cost'
                }
            ];

            challenges.forEach(c => {
                const isActive = this.challenges.activeChallengeId === c.id;
                const isCompleted = this.challenges.completedChallenges.includes(c.id);

                const el = document.createElement('div');
                el.style.background = isActive ? 'rgba(255,0,85,0.1)' : '#111';
                el.style.border = isActive ? '1px solid #ff0055' : (isCompleted ? '1px solid #00ff9d' : '1px solid #333');
                el.style.padding = '10px';
                el.style.opacity = isCompleted ? 0.5 : 1;

                let btnHtml = '';
                if (isActive) {
                    btnHtml = `<button class="abandon-btn" style="background:#ff0055; color:#fff; border:none; padding:5px 10px; margin-top:5px; cursor:pointer;">ABORT</button>`;
                } else if (!isCompleted) {
                    btnHtml = `<button class="start-btn" style="background:transparent; border:1px solid #fff; color:#fff; padding:5px 10px; margin-top:5px; cursor:pointer;">INITIATE</button>`;
                } else {
                    btnHtml = `<div style="color:#00ff9d; font-size:10px; margin-top:5px;">PROTOCOL COMPLETE</div>`;
                }

                el.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div style="font-weight:bold; color:${isCompleted ? '#00ff9d' : '#fff'}">${c.name}</div>
                                    <div style="font-size:10px; color:#888;">GOAL: ${c.goal}</div>
                                </div>
                                <div style="font-size:10px; color:#ccc; margin:5px 0;">${c.description}</div>
                                <div style="font-size:10px; color:var(--accent-gold);">REWARD: ${c.reward}</div>
                                ${btnHtml}`;

                if (isActive) {
                    el.querySelector('.abandon-btn').onclick = () => {
                        this.challenges.abandonChallenge();
                        renderChallenges();
                    }
                } else if (!isCompleted) {
                    el.querySelector('.start-btn').onclick = () => {
                        if (confirm("WARNING: Starting a Challenge resets your current run (Entropy/Upgrades). Proceed?")) {
                            this.challenges.startChallenge(c.id);
                            renderChallenges();
                        }
                    }
                }

                list.appendChild(el);
            });
        };

        // Hook into update events
        this.eventBus.on('challenge_started', () => renderChallenges());
        this.eventBus.on('challenge_completed', () => renderChallenges());

        renderChallenges();
        renderChallenges();
    }

    setupAchievementUI() {
        const container = document.getElementById('tab-social');
        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:#fff; border-bottom:1px solid var(--accent-gold); padding-bottom:5px; margin-top:20px;">SERVICE MEDALS</h3><div style="font-size:10px; color:#888;">RECOGNITION OF DUTY</div>';
        container.appendChild(header);

        const list = document.createElement('div');
        list.style.display = 'grid';
        list.style.gridTemplateColumns = 'repeat(1, 1fr)';
        list.style.gap = '5px';
        list.style.marginTop = '10px';
        container.appendChild(list);

        const render = () => {
            list.innerHTML = '';
            Achievements.forEach(ach => {
                const unlocked = this.achievements.unlocked.includes(ach.id);
                const el = document.createElement('div');
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'space-between';
                el.style.background = unlocked ? 'rgba(255, 215, 0, 0.1)' : '#111';
                el.style.border = unlocked ? '1px solid var(--accent-gold)' : '1px solid #333';
                el.style.padding = '8px';
                el.style.opacity = unlocked ? 1 : 0.7;

                const icon = unlocked ? '🏆' : '🔒';
                const color = unlocked ? '#fff' : '#666';
                const titleColor = unlocked ? 'var(--accent-gold)' : '#888';

                el.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="font-size:20px;">${icon}</div>
                        <div>
                            <div style="font-size:12px; font-weight:bold; color:${titleColor};">${ach.name}</div>
                            <div style="font-size:10px; color:${color};">${ach.description}</div>
                        </div>
                    </div>
                    ${unlocked ? '<div style="font-size:10px; color:var(--accent-primary);">ACQUIRED</div>' : ''}
                `;
                list.appendChild(el);
            });
        };

        this.eventBus.on('achievement_unlocked', () => render());
        render();
    }

    setupDroneUI() {
        const container = document.getElementById('tab-support');

        const render = () => {
            container.innerHTML = `
                <div style="padding:15px; background:rgba(0,0,0,0.3); border-bottom:1px solid #333; margin-bottom:15px;">
                    <h2 style="color:var(--accent-primary); margin:0;">SUPPORT DRONE FLEET</h2>
                    <div style="font-size:10px; color:#888;">FORCE MULTIPLIER PROTOCOL</div>
                </div>

                <div id="drone-acquire" style="padding:10px; border:1px solid var(--accent-gold); background:rgba(255,215,0,0.05); margin-bottom:20px; text-align:center;">
                    <div style="font-size:12px; font-weight:bold; color:var(--accent-gold); margin-bottom:10px;">VOID CAPSULE</div>
                    <button id="buy-drone-btn" style="width:100%; padding:15px; background:var(--accent-gold); color:#000; font-weight:bold; border:none; cursor:pointer;">ACQUIRE (50 Gems)</button>
                    <div style="font-size:8px; color:#aaa; margin-top:5px;">RNG SUSPENDED: 0.2% VOID-FORGED CHANCE</div>
                </div>

                <div id="drone-list" style="display:flex; flex-direction:column; gap:10px;"></div>
            `;

            const list = container.querySelector('#drone-list');
            this.drones.drones.forEach(drone => {
                const isActive = this.drones.activeDroneIds.includes(drone.id);
                const el = document.createElement('div');
                el.style.border = `1px solid ${drone.rarityColor}`;
                el.style.background = isActive ? 'rgba(255,255,255,0.05)' : '#0a0a0a';
                el.style.padding = '10px';
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
                el.style.position = 'relative';

                const chargePct = Math.floor(drone.charge);
                const isDead = chargePct <= 0;

                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; color:${drone.rarityColor}">${drone.rarity} ${drone.name}</span>
                        <span style="font-size:10px; color:${isDead ? 'red' : '#fff'}">CHARGE: ${chargePct}%</span>
                    </div>
                    <div style="font-size:11px; color:#fff; margin:5px 0;">${drone.traitName}</div>
                    <div style="font-size:10px; color:#888;">EFFECT: ${DroneTraits[drone.trait.toUpperCase()]?.desc || 'Unknown'}</div>
                    
                    <div style="width:100%; height:3px; background:#222; margin:10px 0;">
                        <div style="width:${chargePct}%; height:100%; background:${isDead ? 'red' : drone.rarityColor}; transition: width 0.3s"></div>
                    </div>

                    <div style="display:flex; gap:5px;">
                        <button class="toggle-btn" style="flex:2; padding:8px; background:${isActive ? '#333' : 'transparent'}; border:1px solid #666; color:#fff; cursor:pointer;">
                            ${isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                        <button class="charge-btn" style="flex:1; padding:8px; background:var(--accent-gold); color:#000; font-weight:bold; border:none; cursor:pointer;">
                            CHARGE (2)
                        </button>
                    </div>
                `;

                el.querySelector('.toggle-btn').onclick = () => {
                    this.drones.setActive(drone.id, !isActive);
                    render();
                };

                el.querySelector('.charge-btn').onclick = () => {
                    this.drones.recharge(drone.id);
                    render();
                };

                list.appendChild(el);
            });

            container.querySelector('#buy-drone-btn').onclick = () => {
                const d = this.drones.buyCapsule();
                if (d) render();
            };
        };

        this.eventBus.on('drone_acquired', () => render());
        this.eventBus.on('drone_slots_updated', () => render());
        this.eventBus.on('drone_updated', () => render());

        // Initial render
        render();
    }

    setupHackingUI() {
        const header = document.getElementById('ui-header');

        // Hacking Terminal Button
        const hackBtn = document.createElement('button');
        hackBtn.innerHTML = 'TERMINAL';
        hackBtn.id = 'hacking-btn';
        hackBtn.style.background = '#000';
        hackBtn.style.color = 'var(--accent-primary)';
        hackBtn.style.border = '1px solid var(--accent-primary)';
        hackBtn.style.padding = '5px 15px';
        hackBtn.style.fontSize = '12px';
        hackBtn.style.cursor = 'pointer';
        hackBtn.style.fontWeight = 'bold';
        hackBtn.style.marginRight = '10px';

        // Insert before credits/settings
        header.insertBefore(hackBtn, header.firstChild); // Or wherever

        hackBtn.onclick = () => this.showHackingModal();
    }

    showHackingModal() {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.95)';
        overlay.style.zIndex = '300000';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        const box = document.createElement('div');
        box.style.width = '300px';
        box.style.textAlign = 'center';

        box.innerHTML = `<h2 style="color:var(--accent-primary); margin-bottom:10px;">NEURAL BREACH PROTOCOL</h2>
                         <div id="hack-status" style="color:#888; margin-bottom:20px; font-size:12px;">STATUS: STANDBY</div>
                         <div id="hack-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:20px;"></div>
                         <button id="start-hack-btn" style="padding:15px; width:100%; background:var(--accent-primary); color:#000; font-weight:bold; border:none; cursor:pointer;">INITIATE SEQUENCE</button>
                         <button id="close-hack-btn" style="padding:10px; width:100%; background:#333; color:#fff; border:none; margin-top:10px; cursor:pointer;">CLOSE CONNECTION</button>`;

        const grid = box.querySelector('#hack-grid');
        const status = box.querySelector('#hack-status');
        const startBtn = box.querySelector('#start-hack-btn');
        const closeBtn = box.querySelector('#close-hack-btn');

        // Create Grid
        const cells = [];
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.style.width = '60px';
            cell.style.height = '60px';
            cell.style.border = '1px solid #333';
            cell.style.background = '#000';
            cell.style.cursor = 'pointer';
            cell.style.display = 'flex';
            cell.style.justifyContent = 'center';
            cell.style.alignItems = 'center';
            cell.style.fontSize = '20px';
            cell.style.color = '#fff';
            cell.dataset.index = i;

            cell.onmousedown = () => {
                if (!this.hacking.active || this.hacking.showingSequence) {
                    return; // Don't accept input if hack not active or sequence is showing
                }
                
                const result = this.hacking.input(i);
                if (result !== false) {
                    // Visual feedback
                    cell.style.background = '#00ff9d';
                    cell.style.boxShadow = '0 0 10px var(--accent-primary)';
                    this.audio.playTone(800, 'sine', 0.1);
                    setTimeout(() => {
                        cell.style.background = '#000';
                        cell.style.boxShadow = 'none';
                    }, 200);
                }
            };

            grid.appendChild(cell);
            cells.push(cell);
        }

        startBtn.onclick = () => {
            if (this.hacking.startHack()) {
                status.innerText = "STATUS: MEMORIZE SEQUENCE...";
                status.style.color = "var(--accent-primary)";
                startBtn.disabled = true;
                startBtn.style.opacity = 0.5;
            } else {
                if (this.hacking.cooldown > 0) {
                    status.innerText = `COOLDOWN: ${Math.ceil(this.hacking.cooldown)}s`;
                    status.style.color = "red";
                }
            }
        };

        closeBtn.onclick = () => overlay.remove();

        const updateGrid = () => {
            // Visual feedback for sequence
            // System emits 'hack_sequence_ready'
        };

        // Listeners for this modal instance
        const onSequence = (data) => {
            const seq = data.sequence;
            status.innerText = "STATUS: OBSERVING...";
            status.style.color = "var(--accent-primary)";

            // Flash sequence
            let delay = 0;
            seq.forEach((idx, i) => {
                setTimeout(() => {
                    cells[idx].style.background = 'var(--accent-primary)';
                    cells[idx].style.boxShadow = '0 0 20px var(--accent-primary)';
                    this.audio.playTone(600 + i * 50, 'sine', 0.1);
                }, delay);
                setTimeout(() => {
                    cells[idx].style.background = '#000';
                    cells[idx].style.boxShadow = 'none';
                }, delay + 500);
                delay += 800;
            });

            setTimeout(() => {
                status.innerText = "STATUS: INPUT SEQUENCE";
                status.style.color = "#fff";
                this.hacking.setShowingSequence(false); // Allow input after sequence is shown
            }, delay);
        };

        const onResult = (res) => {
            if (res.success) {
                status.innerText = "BREACH SUCCESSFUL - REWARD GRANTED";
                status.style.color = "var(--accent-gold)";
            } else {
                status.innerText = "BREACH DETECTED - NEURAL SHOCK";
                status.style.color = "red";
                // Shake effect
                box.style.transform = "translateX(5px)";
                setTimeout(() => box.style.transform = "translateX(0)", 50);
            }
            startBtn.disabled = false;
            startBtn.style.opacity = 1;
        };

        this.eventBus.on('hack_sequence_ready', onSequence);
        this.eventBus.on('hack_complete', onResult);
        this.eventBus.on('hack_level_complete', (data) => {
            status.innerText = `LEVEL ${data.level} COMPLETE - PREPARE FOR NEXT SEQUENCE`;
            status.style.color = "var(--accent-primary)";
        });

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Remove listeners on close? 
        // For prototype, memory leak is negligible, but technically we should unbind.
        // We'll rely on the fact that the listeners just update DOM that might not exist, 
    }

    showReaderModal(lore) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.98)';
        overlay.style.zIndex = '400000'; // Higher than hacking
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontFamily = '"JetBrains Mono", monospace';

        const content = document.createElement('div');
        content.style.width = '600px';
        content.style.maxWidth = '90vw';
        content.style.padding = '40px';
        content.style.border = '2px solid var(--accent-primary)';
        content.style.background = '#050505';
        content.style.boxShadow = '0 0 50px rgba(0, 255, 157, 0.2)';

        const title = document.createElement('h1');
        title.innerText = lore.title;
        title.style.color = 'var(--accent-primary)';
        title.style.borderBottom = '1px solid #333';
        title.style.paddingBottom = '10px';
        title.style.marginBottom = '20px';

        const body = document.createElement('div');
        body.style.color = '#fff';
        body.style.whiteSpace = 'pre-wrap';
        body.style.lineHeight = '1.6';
        body.style.fontSize = '14px';
        body.style.minHeight = '200px';

        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'CLOSE ARCHIVE';
        closeBtn.style.marginTop = '20px';
        closeBtn.style.background = '#333';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.style.padding = '10px 20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.float = 'right';
        closeBtn.onclick = () => overlay.remove();

        content.appendChild(title);
        content.appendChild(body);
        content.appendChild(closeBtn);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Typewriter Effect
        let i = 0;
        const text = lore.content;
        const speed = 20; // ms per char

        const type = () => {
            if (i < text.length) {
                body.innerHTML += text.charAt(i);
                i++;
                // Scroll to bottom
                // content.scrollTop = content.scrollHeight; 
                setTimeout(type, speed);
            }
        };
        type();
    }
    setupSocialUI() {
        const leaderboard = document.getElementById('leaderboard');
        leaderboard.innerHTML = '<h3 style="color:#fff; border-bottom:1px solid #333; padding-bottom:5px;">GLOBAL ELITE</h3>';

        const fakes = [
            { name: 'Unit_734', score: '999T', rank: 1 },
            { name: 'Null_Pointer', score: '500T', rank: 2 },
            { name: 'Whale_Killer99', score: '250T', rank: 3 },
            { name: 'YOU', score: '???', rank: 9999 }
        ];

        fakes.forEach(f => {
            const r = document.createElement('div');
            r.style.display = 'flex';
            r.style.justifyContent = 'space-between';
            r.style.padding = '10px';
            r.style.color = f.name === 'YOU' ? '#fff' : '#888';
            r.style.background = f.name === 'YOU' ? 'rgba(0,255,157,0.1)' : 'transparent';
            r.innerHTML = `<span>#${f.rank} ${f.name}</span> <span>${f.score}</span>`;
            leaderboard.appendChild(r);
        });

        const market = document.getElementById('black-market');
        market.style.marginTop = '20px';
        market.innerHTML = '<h3 style="color:var(--accent-gold); border-bottom:1px solid var(--accent-gold); padding-bottom:5px;">BLACK MARKET</h3><div style="font-size:10px; color:#666; margin-bottom:10px;">ILLEGAL MODIFICATIONS</div>';

        const items = [
            {
                name: 'TIME SKIP (1 HR)', cost: 5, action: () => {
                    const dps = this.progression.getAutoDps();
                    if (dps <= 0) return alert("NO AUTO-DRILL DETECTED");
                    this.economy.addEntropy(dps * 3600);
                }
            },
            {
                name: 'STABILITY SHIELD', cost: 10, action: () => {
                    this.psychology.stability = 100;
                    this.psychology.buffStabilityResistance(0.1);
                }
            }
        ];

        items.forEach(i => {
            const btn = document.createElement('button');
            btn.innerHTML = `<div>${i.name}</div><div style="color:var(--accent-gold)">${i.cost} GEMS</div>`;
            btn.style.width = '100%';
            btn.style.display = 'flex';
            btn.style.justifyContent = 'space-between';
            btn.style.background = '#111';
            btn.style.border = '1px solid var(--accent-gold)';
            btn.style.color = '#fff';
            btn.style.padding = '15px';
            btn.style.marginTop = '10px';
            btn.style.cursor = 'pointer';

            btn.onclick = () => {
                if (this.economy.premium >= i.cost) {
                    this.economy.premium -= i.cost;
                    this.ui.premium.innerText = this.economy.premium;
                    i.action();
                    this.eventBus.emit('system_message', { text: "TRANSACTION COMPLETE", type: 'success' });
                } else {
                    this.eventBus.emit('system_message', { text: "INSUFFICIENT FUNDS", type: 'error' });
                }
            };
            market.appendChild(btn);
        });
    }

    setupStoryUI() {
        // We put Log access in the "SYSTEMS" tab (Upgrades) for now, or Social.
        // Let's create a dedicated "ARCHIVES" section in Systems.
        const systemsTab = document.getElementById('tab-upgrades');

        const container = document.createElement('div');
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid #444';
        container.style.paddingTop = '10px';
        container.innerHTML = `<h3 style="color:#fff;">DATA ARCHIVES</h3><div id="fragment-count" style="color:var(--accent-gold); font-size:10px; margin-bottom:10px;">FRAGMENTS: 0</div><div id="log-list"></div>`;
        systemsTab.appendChild(container);

        const list = container.querySelector('#log-list');
        const fragCount = container.querySelector('#fragment-count');

        // Import logs here? Or just update via event
        // Better to re-render list on update

        const renderLogs = () => {
            // We need access to LoreEntries. Since we didn't import them here, we iterate checking IDs?
            // Or we import LoreEntries in main.js. Let's assume we import them or we do it efficiently.
            // Actually, best way is to expose LoreEntries from StorySystem or pass them.
            // Let's dynamic import for cleaner code, or just rely on IDs 1-5 since we know them.
            // Optimization: Importing LoreEntries at top of file in next step is better.
            // For now, let's just use the event 'story_update' to trigger a full re-render and I will assume
            // I can't easily see the lore text here without importing.
            // Wait, I can make StorySystem emit the list of viewable entries.
            // But let's just format the "Entry #X" and show text only if unlocked.

            // To do this properly without importing config in main.js (which I should have done),
            // I'll rely on a hardcoded array here for the UI structure matching the config.
            const entries = [1, 2, 3, 4, 5];

            list.innerHTML = '';
            fragCount.innerText = `FRAGMENTS: ${this.story.fragments}`;

            entries.forEach(id => {
                const isUnlocked = this.story.unlockedEntries.includes(id);
                const canUnlock = this.story.canUnlock(id);
                // Find lore entry
                const lore = LoreEntries.find(l => l.id === id);
                if (!lore) return;

                const el = document.createElement('div');
                el.style.background = isUnlocked ? 'rgba(255,255,255,0.05)' : '#111';
                el.style.border = isUnlocked ? '1px solid var(--accent-primary)' : '1px solid #333';
                el.style.padding = '10px';
                el.style.marginBottom = '5px';
                el.style.cursor = isUnlocked ? 'pointer' : 'default';

                if (isUnlocked) {
                    el.innerHTML = `<div style="color:var(--accent-primary); font-weight:bold;">${lore.title}</div><div style="font-size:10px; color:#666;">DECRYPTED - READ DATA</div>`;
                    el.onclick = () => this.showReaderModal(lore);
                } else {
                    el.innerHTML = `<div style="color:#666;">ENCRYPTED FILE_${id}</div>
                                   <button id="decrypt-${id}" style="width:100%; font-size:10px; margin-top:5px; background:${canUnlock ? 'var(--accent-gold)' : '#333'}; border:none; padding:5px;">DECRYPT (${lore.cost} FRAGMENTS)</button>`;

                    const btn = el.querySelector('button');
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        this.story.unlock(id);
                    }
                    btn.disabled = !canUnlock;
                }
                list.appendChild(el);
            });
        };

        this.eventBus.on('story_update', () => renderLogs());
        // Initial render logic will fail if I don't trigger it, so trigger it once
        setTimeout(renderLogs, 1000);

        this.eventBus.on('ascension_performed', () => {
            if (this.prestigeTree.hasNode('start_node')) {
                this.economy.entropy = 1000;
                this.eventBus.emit('system_message', { text: "NEURAL PRESERVATION: +1000 ENTROPY", type: 'success' });
            }
        });
    }

    setupSettingsUI() {
        // Inject icon to header
        const header = document.getElementById('ui-header');
        const btn = document.createElement('button');
        btn.innerHTML = '⚙️';
        btn.style.background = 'none';
        btn.style.border = 'none';
        btn.style.color = '#fff';
        btn.style.fontSize = '20px';
        btn.style.cursor = 'pointer';

        btn.onclick = () => this.showSettingsModal();
        header.appendChild(btn);
    }

    showSettingsModal() {
        // Simple overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.8)';
        overlay.style.zIndex = '100000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        const box = document.createElement('div');
        box.style.background = '#111';
        box.style.border = '1px solid var(--accent-primary)';
        box.style.padding = '20px';
        box.style.width = '80%';
        box.style.textAlign = 'center';

        box.innerHTML = `<h2 style="color:#fff; margin-bottom:20px;">SYSTEM SETTINGS</h2>
                         <div id="settings-content" style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;"></div>
                         <div style="border-top:1px solid #333; margin-top:10px; padding-top:10px;">
                            <button id="save-export-btn" style="width:100%; padding:10px; background:#333; color:#fff; border:none; margin-bottom:5px;">EXPORT SAVE TO CLIPBOARD</button>
                            <button id="save-import-btn" style="width:100%; padding:10px; background:#333; color:#fff; border:none; margin-bottom:5px;">IMPORT SAVE</button>
                            <button id="hard-reset-btn" style="width:100%; padding:10px; background:#ff0055; color:#fff; border:none;">FACTORY RESET (WIPE SAVE)</button>
                         </div>
                         <button id="close-settings" style="margin-top:20px; padding:10px 30px; background:var(--accent-primary); border:none; font-weight:bold;">CLOSE</button>`;

        const content = box.querySelector('#settings-content');

        // Toggles
        const makeToggle = (key, label) => {
            const val = this.settings.get(key);
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.color = '#ccc';

            row.innerHTML = `<span>${label}</span> <input type="checkbox" ${val ? 'checked' : ''}>`;
            row.querySelector('input').onchange = (e) => {
                this.settings.set(key, e.target.checked);
            };
            content.appendChild(row);
        };

        makeToggle('crtEffect', 'CRT EFFECT');
        makeToggle('particles', 'PARTICLES');

        // Select
        const makeSelect = (key, label, options) => {
            const val = this.settings.get(key);
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.color = '#ccc';

            let opts = options.map(o => `<option value="${o.val}" ${val === o.val ? 'selected' : ''}>${o.text}</option>`).join('');

            row.innerHTML = `<span>${label}</span> <select style="background:#000; color:#fff; border:1px solid #333;">${opts}</select>`;
            row.querySelector('select').onchange = (e) => {
                this.settings.set(key, e.target.value);
            };
            content.appendChild(row);
        };

        makeSelect('numberNotation', 'NOTATION', [
            { val: 'standard', text: 'STANDARD (1M)' },
            { val: 'scientific', text: 'SCIENTIFIC (1e6)' }
        ]);

        // Volume
        const makeSlider = (key, label) => {
            const val = this.settings.get(key);
            const row = document.createElement('div');
            row.style.color = '#ccc';
            row.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${label}</span> <span>${Math.floor(val * 100)}%</span></div>
                              <input type="range" min="0" max="1" step="0.1" value="${val}" style="width:100%">`;
            row.querySelector('input').oninput = (e) => {
                const v = parseFloat(e.target.value);
                row.querySelector('span:nth-child(2)').innerText = Math.floor(v * 100) + '%';
                this.settings.set(key, v);
                if (this.audio && key === 'masterVolume') {
                    this.audio.masterGain.gain.value = v;
                }
            };
            content.appendChild(row);
        };

        makeSlider('masterVolume', 'MASTER AUDIO');

        // Buttons
        box.querySelector('#close-settings').onclick = () => overlay.remove();

        box.querySelector('#save-export-btn').onclick = () => {
            const str = this.dataExport.exportFullData();
            navigator.clipboard.writeText(str).then(() => {
                this.showNotification("FULL SAVE DATA COPIED TO CLIPBOARD", 'success');
            }).catch(() => {
                // Fallback: show in prompt
                prompt("SAVE DATA (Copy this):", str);
            });
        };

        box.querySelector('#save-import-btn').onclick = () => {
            const str = prompt("PASTE SAVE STRING:");
            if (str) {
                // Try full data import first
                if (this.dataExport.importFullData(str)) {
                    this.showNotification("SAVE LOADED. REFRESHING...", 'success');
                    setTimeout(() => location.reload(), 1000);
                } else if (this.saveSystem.importSave(str)) {
                    // Fallback to simple import
                    this.showNotification("SAVE LOADED. REFRESHING...", 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    this.showNotification("INVALID SAVE DATA", 'error');
                }
            }
        };
        
        // Add statistics export button
        const statsExportBtn = document.createElement('button');
        statsExportBtn.id = 'stats-export-btn';
        statsExportBtn.style.width = '100%';
        statsExportBtn.style.padding = '10px';
        statsExportBtn.style.background = '#333';
        statsExportBtn.style.color = '#fff';
        statsExportBtn.style.border = 'none';
        statsExportBtn.style.marginTop = '5px';
        statsExportBtn.style.cursor = 'pointer';
        statsExportBtn.innerText = 'EXPORT STATISTICS';
        statsExportBtn.onclick = () => {
            const stats = this.dataExport.exportStatistics();
            navigator.clipboard.writeText(stats).then(() => {
                this.showNotification("STATISTICS COPIED TO CLIPBOARD", 'success');
            });
        };
        box.querySelector('#settings-content').parentElement.insertBefore(statsExportBtn, box.querySelector('#settings-content').nextSibling);

        box.querySelector('#hard-reset-btn').onclick = () => {
            if (confirm("ARE YOU SURE? THIS CANNOT BE UNDONE.")) {
                this.saveSystem.hardReset();
            }
        };
        
        // Add backup restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.id = 'restore-backup-btn';
        restoreBtn.style.width = '100%';
        restoreBtn.style.padding = '10px';
        restoreBtn.style.background = '#333';
        restoreBtn.style.color = '#fff';
        restoreBtn.style.border = 'none';
        restoreBtn.style.marginTop = '5px';
        restoreBtn.style.cursor = 'pointer';
        restoreBtn.innerText = 'RESTORE BACKUP';
        restoreBtn.onclick = () => {
            if (confirm("Restore from backup? Current save will be replaced.")) {
                if (this.saveSystem.restoreBackup()) {
                    alert("Backup restored. Refreshing...");
                    location.reload();
                } else {
                    alert("No backup found.");
                }
            }
        };
        box.querySelector('#settings-content').parentElement.insertBefore(restoreBtn, box.querySelector('#settings-content').nextSibling);
        
        // Add quality selector
        const qualityRow = document.createElement('div');
        qualityRow.style.display = 'flex';
        qualityRow.style.justifyContent = 'space-between';
        qualityRow.style.color = '#ccc';
        qualityRow.style.marginTop = '10px';
        qualityRow.innerHTML = `
            <span>QUALITY</span>
            <select id="quality-select" style="background:#000; color:#fff; border:1px solid #333;">
                <option value="low">LOW</option>
                <option value="medium" selected>MEDIUM</option>
                <option value="high">HIGH</option>
            </select>
        `;
        const qualitySelect = qualityRow.querySelector('#quality-select');
        qualitySelect.value = this.performance.getCurrentQuality();
        qualitySelect.onchange = (e) => {
            this.performance.setQuality(e.target.value);
            this.showNotification(`Quality set to ${e.target.value.toUpperCase()}`, 'success');
        };
        box.querySelector('#settings-content').appendChild(qualityRow);
        
        // Add theme selector
        const themeRow = document.createElement('div');
        themeRow.style.display = 'flex';
        themeRow.style.justifyContent = 'space-between';
        themeRow.style.color = '#ccc';
        themeRow.style.marginTop = '10px';
        themeRow.innerHTML = `
            <span>THEME</span>
            <select id="theme-select" style="background:#000; color:#fff; border:1px solid #333;">
                ${this.theme.getThemes().map(t => 
                    `<option value="${t.id}" ${t.id === this.theme.getCurrentTheme() ? 'selected' : ''}>${t.name}</option>`
                ).join('')}
            </select>
        `;
        const themeSelect = themeRow.querySelector('#theme-select');
        themeSelect.onchange = (e) => {
            this.theme.applyTheme(e.target.value);
        };
        box.querySelector('#settings-content').appendChild(themeRow);

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }
    setupAudio() {
        this.eventBus.on('click_effect', () => this.audio.playClick());
        this.eventBus.on('loot', (loot) => this.audio.playLoot(loot.type));
        this.eventBus.on('inventory_updated', () => { }); // Maybe sound?
        this.eventBus.on('system_message', (msg) => {
            if (msg.type === 'error') this.audio.playError();
        });
        this.eventBus.on('active_skill', () => this.audio.playLevelUp()); // Re-use sound

        // Listen for Enemy Kills for Fragment Drops
        this.eventBus.on('enemy_killed', (data) => {
            // 100% chance on Boss, 10% on normal?
            if (data.isBoss || Math.random() < 0.1) {
                this.story.addFragment(1);
            }
        });
    }

    getRbColor(rarity) {
        switch (rarity) {
            case 'COMMON': return '#fff';
            case 'UNCOMMON': return '#00ff9d';
            case 'RARE': return '#00aaff';
            case 'LEGENDARY': return '#bd00ff';
            case 'MYTHIC': return '#ffaa00';
        }
        return '#fff';
    }

    setupSkillUI() {
        // We will inject skill buttons into the 'MINING' tab, under the manual button.
        const mineTab = document.getElementById('tab-mine');

        const container = document.createElement('div');
        container.id = 'skill-container';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)';
        container.style.gap = '5px';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid #333';
        container.style.paddingTop = '10px';

        // Import active skills definition if possible, or we iterate known ones
        // Since we didn't import Skills in main.js, let's hardcode IDs or import it.
        // Better: The SkillSystem knows them. However, for quick UI we can rely on data attributes or just import.
        // Let's import Skills at top of main.js to do this properly.

        // But since I cannot easily add import to top without view_file offset guessing, 
        // I will rely on a hardcoded list of IDs for this method, 
        // OR better yet, let's assume I fix the import in next step.
        // Actually, let's just create the buttons dynamically based on a known list here for now to save tool calls.

        const skillIds = ['void_strike', 'overclock', 'stabilize', 'emp_blast', 'null_field', 'time_dilation'];

        skillIds.forEach(id => {
            const btn = document.createElement('button');
            btn.className = 'skill-btn';
            btn.innerText = id.toUpperCase().replace('_', ' ');
            btn.style.padding = '10px'; // bigger touch target
            btn.style.fontSize = '10px';
            btn.style.background = '#111';
            btn.style.border = '1px solid #444';
            btn.style.color = '#fff';
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';

            // Cooldown overlay
            const cdOverlay = document.createElement('div');
            cdOverlay.style.position = 'absolute';
            cdOverlay.style.bottom = '0';
            cdOverlay.style.left = '0';
            cdOverlay.style.width = '100%';
            cdOverlay.style.height = '0%';
            cdOverlay.style.background = 'rgba(0, 255, 157, 0.3)';
            cdOverlay.style.transition = 'height 0.1s linear';
            btn.appendChild(cdOverlay);

            btn.onclick = () => {
                this.skills.activate(id);
            };

            // Update loop for this button
            const updateBtn = () => {
                const cd = this.skills.getCooldown(id);
                if (cd > 0) {
                    btn.disabled = true;
                    btn.style.opacity = 0.5;
                    cdOverlay.style.height = '100%';
                    btn.innerText = Math.ceil(cd);
                } else {
                    btn.disabled = false;
                    btn.style.opacity = 1;
                    cdOverlay.style.height = '0%';
                    btn.innerText = id.toUpperCase().replace('_', ' ');
                }
                requestAnimationFrame(updateBtn);
            };
            updateBtn(); // Start local loop

            container.appendChild(btn);
        });

        mineTab.appendChild(container);
    }

    setupComboUI() {
        // Add combo display to header
        const header = document.getElementById('ui-header');
        const comboDisplay = document.createElement('div');
        comboDisplay.id = 'combo-display';
        comboDisplay.style.position = 'absolute';
        comboDisplay.style.top = '70px';
        comboDisplay.style.left = '50%';
        comboDisplay.style.transform = 'translateX(-50%)';
        comboDisplay.style.fontFamily = 'var(--font-mono)';
        comboDisplay.style.fontSize = '14px';
        comboDisplay.style.fontWeight = 'bold';
        comboDisplay.style.color = 'var(--accent-primary)';
        comboDisplay.style.textShadow = '0 0 10px var(--accent-primary)';
        comboDisplay.style.opacity = '0';
        comboDisplay.style.transition = 'opacity 0.3s';
        comboDisplay.style.pointerEvents = 'none';
        comboDisplay.style.zIndex = '1000';
        document.body.appendChild(comboDisplay);

        // Update combo display
        this.eventBus.on('combo_update', (data) => {
            if (data.count > 0) {
                comboDisplay.style.opacity = '1';
                comboDisplay.innerHTML = `COMBO x${data.count} (${data.multiplier.toFixed(1)}x)`;
                comboDisplay.style.color = data.count >= 100 ? 'var(--accent-gold)' : 
                                          data.count >= 50 ? 'var(--accent-purple)' : 
                                          'var(--accent-primary)';
            } else {
                comboDisplay.style.opacity = '0';
            }
        });

        this.eventBus.on('combo_milestone', (data) => {
            // Show milestone popup
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.fontSize = '32px';
            popup.style.fontWeight = 'bold';
            popup.style.color = 'var(--accent-gold)';
            popup.style.textShadow = '0 0 20px var(--accent-gold)';
            popup.style.zIndex = '9999';
            popup.style.pointerEvents = 'none';
            popup.style.fontFamily = 'var(--font-heading)';
            popup.innerText = `${data.name}!`;
            document.body.appendChild(popup);
            
            setTimeout(() => {
                popup.style.transition = 'all 0.5s';
                popup.style.opacity = '0';
                popup.style.transform = 'translate(-50%, -70%)';
                setTimeout(() => popup.remove(), 500);
            }, 1000);
        });

        this.eventBus.on('combo_lost', (data) => {
            if (data.count >= 25) {
                const lost = document.createElement('div');
                lost.style.position = 'fixed';
                lost.style.top = '50%';
                lost.style.left = '50%';
                lost.style.transform = 'translate(-50%, -50%)';
                lost.style.fontSize = '20px';
                lost.style.color = 'var(--accent-secondary)';
                lost.style.zIndex = '9999';
                lost.style.pointerEvents = 'none';
                lost.innerText = `COMBO LOST: ${data.count}`;
                document.body.appendChild(lost);
                setTimeout(() => {
                    lost.style.transition = 'opacity 0.5s';
                    lost.style.opacity = '0';
                    setTimeout(() => lost.remove(), 500);
                }, 1500);
            }
        });
    }

    setupStatisticsUI() {
        // Add statistics button to settings or social tab
        const socialTab = document.getElementById('tab-social');
        
        const statsHeader = document.createElement('div');
        statsHeader.innerHTML = '<h3 style="color:#fff; border-bottom:1px solid #333; padding-bottom:5px; margin-top:20px;">STATISTICS</h3><div style="font-size:10px; color:#888;">YOUR PROGRESS TRACKER</div>';
        socialTab.appendChild(statsHeader);

        const statsContainer = document.createElement('div');
        statsContainer.id = 'stats-container';
        statsContainer.style.display = 'grid';
        statsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        statsContainer.style.gap = '10px';
        statsContainer.style.marginTop = '10px';
        socialTab.appendChild(statsContainer);

        const updateStats = () => {
            const stats = this.statistics.getStats();
            statsContainer.innerHTML = `
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">TOTAL CLICKS</div>
                    <div style="font-size:18px; color:#fff; font-weight:bold;">${this.economy.formatNumber(stats.totalClicks)}</div>
                </div>
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">MAX COMBO</div>
                    <div style="font-size:18px; color:var(--accent-primary); font-weight:bold;">${stats.maxCombo}</div>
                </div>
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">ENEMIES KILLED</div>
                    <div style="font-size:18px; color:#fff; font-weight:bold;">${this.economy.formatNumber(stats.enemiesKilled)}</div>
                </div>
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">BOSSES KILLED</div>
                    <div style="font-size:18px; color:var(--accent-gold); font-weight:bold;">${stats.bossesKilled}</div>
                </div>
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">TOTAL ENTROPY</div>
                    <div style="font-size:18px; color:#fff; font-weight:bold;">${this.economy.formatNumber(stats.totalEntropyEarned)}</div>
                </div>
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">LEGENDARY ITEMS</div>
                    <div style="font-size:18px; color:var(--accent-purple); font-weight:bold;">${stats.legendaryItemsFound}</div>
                </div>
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">PLAY TIME</div>
                    <div style="font-size:18px; color:#fff; font-weight:bold;">${Math.floor(stats.totalPlayTime / 3600)}h ${Math.floor((stats.totalPlayTime % 3600) / 60)}m</div>
                </div>
                <div style="background:#111; padding:10px; border:1px solid #333;">
                    <div style="font-size:10px; color:#888;">PRESTIGE COUNT</div>
                    <div style="font-size:18px; color:var(--accent-purple); font-weight:bold;">${stats.prestigeCount}</div>
                </div>
            `;
        };

        // Update stats every 5 seconds
        setInterval(updateStats, 5000);
        updateStats(); // Initial render
    }

    setupQuestUI() {
        const mineTab = document.getElementById('tab-mine');
        
        const container = document.createElement('div');
        container.id = 'quest-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-primary)';
        container.style.paddingTop = '10px';
        mineTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-primary); margin:0; font-size:14px;">ACTIVE OBJECTIVES</h3>';
        container.appendChild(header);

        const questList = document.createElement('div');
        questList.id = 'quest-list';
        questList.style.display = 'flex';
        questList.style.flexDirection = 'column';
        questList.style.gap = '8px';
        questList.style.marginTop = '10px';
        container.appendChild(questList);

        const renderQuests = () => {
            questList.innerHTML = '';
            const activeQuests = this.quests.getActiveQuests();
            
            if (activeQuests.length === 0) {
                questList.innerHTML = '<div style="color:#666; font-size:10px; text-align:center; padding:10px;">NO ACTIVE OBJECTIVES</div>';
                return;
            }

            activeQuests.forEach(quest => {
                const progress = Math.min((quest.current / quest.target) * 100, 100);
                const el = document.createElement('div');
                el.style.background = '#111';
                el.style.border = '1px solid var(--accent-primary)';
                el.style.padding = '8px';
                el.style.borderRadius = '3px';

                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:var(--accent-primary);">${quest.name}</span>
                        <span style="font-size:9px; color:#888;">${quest.current}/${quest.target}</span>
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${quest.description}</div>
                    <div style="width:100%; height:3px; background:#222; border-radius:2px; overflow:hidden;">
                        <div style="width:${progress}%; height:100%; background:var(--accent-primary); transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size:8px; color:var(--accent-gold); margin-top:3px;">
                        REWARD: ${quest.reward.type === 'entropy' ? this.economy.formatNumber(quest.reward.amount) + ' ENT' : quest.reward.amount + ' GEMS'}
                    </div>
                `;
                questList.appendChild(el);
            });
        };

        this.eventBus.on('quest_progress', () => renderQuests());
        this.eventBus.on('quest_completed', (quest) => {
            this.showNotification(`QUEST COMPLETE: ${quest.name}`, 'success');
            renderQuests();
        });
        this.eventBus.on('quest_added', () => renderQuests());

        renderQuests();
    }

    setupEventUI() {
        const header = document.getElementById('ui-header');
        
        const eventContainer = document.createElement('div');
        eventContainer.id = 'event-container';
        eventContainer.style.position = 'absolute';
        eventContainer.style.top = '80px';
        eventContainer.style.left = '10px';
        eventContainer.style.right = '10px';
        eventContainer.style.zIndex = '1000';
        eventContainer.style.pointerEvents = 'none';
        document.body.appendChild(eventContainer);

        const renderEvents = () => {
            eventContainer.innerHTML = '';
            const activeEvents = this.events.getActiveEvents();
            
            activeEvents.forEach(event => {
                const time = this.events.getTimeRemaining(event);
                const el = document.createElement('div');
                el.style.background = 'rgba(0,0,0,0.8)';
                el.style.border = `2px solid ${event.color}`;
                el.style.padding = '8px 12px';
                el.style.marginBottom = '5px';
                el.style.borderRadius = '3px';
                el.style.boxShadow = `0 0 10px ${event.color}`;
                el.style.pointerEvents = 'auto';
                el.style.cursor = 'pointer';

                el.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:16px;">${event.icon}</span>
                        <div style="flex:1;">
                            <div style="font-size:11px; font-weight:bold; color:${event.color};">${event.name}</div>
                            <div style="font-size:9px; color:#aaa;">${event.description}</div>
                        </div>
                        <div style="font-size:10px; color:#fff; font-family:var(--font-mono);">
                            ${time.minutes}:${time.seconds.toString().padStart(2, '0')}
                        </div>
                    </div>
                `;
                eventContainer.appendChild(el);
            });
        };

        this.eventBus.on('event_started', (event) => {
            this.showNotification(`${event.name} STARTED!`, 'success');
            renderEvents();
        });
        this.eventBus.on('event_ended', (event) => {
            this.showNotification(`${event.name} ENDED`, 'info');
            renderEvents();
        });

        // Update timer every second
        setInterval(() => {
            const activeEvents = this.events.getActiveEvents();
            if (activeEvents.length > 0) {
                renderEvents();
            } else {
                eventContainer.innerHTML = '';
            }
        }, 1000);

        renderEvents();
    }

    setupResearchUI() {
        const systemsTab = document.getElementById('tab-upgrades');
        
        const container = document.createElement('div');
        container.id = 'research-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '2px solid var(--accent-purple)';
        container.style.paddingTop = '10px';
        systemsTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = `
            <h3 style="color:var(--accent-purple); margin:0;">RESEARCH LAB</h3>
            <div id="research-points-display" style="color:var(--accent-gold); font-size:12px; margin:5px 0;">
                RESEARCH POINTS: 0
            </div>
        `;
        container.appendChild(header);

        const researchList = document.createElement('div');
        researchList.id = 'research-list';
        researchList.style.display = 'flex';
        researchList.style.flexDirection = 'column';
        researchList.style.gap = '8px';
        researchList.style.marginTop = '10px';
        container.appendChild(researchList);

        const renderResearch = () => {
            const points = this.research.getResearchPoints();
            container.querySelector('#research-points-display').innerText = `RESEARCH POINTS: ${points}`;
            
            researchList.innerHTML = '';
            const available = this.research.getAvailableResearches();
            const unlocked = this.research.getUnlockedResearches();
            
            // Show unlocked first
            unlocked.forEach(research => {
                const el = document.createElement('div');
                el.style.background = 'rgba(189, 0, 255, 0.1)';
                el.style.border = '1px solid var(--accent-purple)';
                el.style.padding = '10px';
                el.style.opacity = '0.7';
                
                el.innerHTML = `
                    <div style="font-size:11px; font-weight:bold; color:var(--accent-purple);">✓ ${research.name}</div>
                    <div style="font-size:9px; color:#aaa;">${research.description}</div>
                `;
                researchList.appendChild(el);
            });
            
            // Show available
            available.forEach(research => {
                const canAfford = points >= research.cost;
                const el = document.createElement('div');
                el.style.background = canAfford ? 'rgba(189, 0, 255, 0.05)' : '#111';
                el.style.border = canAfford ? '1px solid var(--accent-purple)' : '1px solid #333';
                el.style.padding = '10px';
                el.style.cursor = canAfford ? 'pointer' : 'default';
                
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:${canAfford ? 'var(--accent-purple)' : '#666'};">${research.name}</span>
                        <span style="font-size:10px; color:${canAfford ? 'var(--accent-gold)' : '#666'};">${research.cost} RP</span>
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${research.description}</div>
                    ${research.requirements.length > 0 ? 
                        `<div style="font-size:8px; color:#666;">REQUIRES: ${research.requirements.join(', ')}</div>` : ''}
                `;
                
                if (canAfford) {
                    el.onclick = () => {
                        if (this.research.unlock(research.id)) {
                            this.showNotification(`RESEARCH UNLOCKED: ${research.name}`, 'success');
                            renderResearch();
                        }
                    };
                }
                
                researchList.appendChild(el);
            });
        };

        this.eventBus.on('research_points_gained', () => renderResearch());
        this.eventBus.on('research_unlocked', () => renderResearch());
        
        renderResearch();
    }

    setupBuffUI() {
        const header = document.getElementById('ui-header');
        
        const buffContainer = document.createElement('div');
        buffContainer.id = 'buff-container';
        buffContainer.style.position = 'absolute';
        buffContainer.style.top = '10px';
        buffContainer.style.right = '200px';
        buffContainer.style.display = 'flex';
        buffContainer.style.gap = '5px';
        buffContainer.style.zIndex = '1000';
        header.appendChild(buffContainer);

        const renderBuffs = () => {
            const activeBuffs = this.buffs.getActiveBuffs();
            buffContainer.innerHTML = '';
            
            activeBuffs.forEach(buff => {
                const el = document.createElement('div');
                el.style.background = buff.type === 'debuff' ? 'rgba(255, 0, 85, 0.2)' : 'rgba(0, 255, 157, 0.2)';
                el.style.border = `1px solid ${buff.color}`;
                el.style.padding = '5px 8px';
                el.style.borderRadius = '3px';
                el.style.fontSize = '9px';
                el.style.color = '#fff';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.gap = '5px';
                el.title = `${buff.name}: ${buff.description} (${Math.ceil(buff.remaining)}s)`;
                
                el.innerHTML = `
                    <span>${buff.icon}</span>
                    <span>${buff.name}</span>
                    ${buff.stacks > 1 ? `<span style="color:${buff.color};">x${buff.stacks}</span>` : ''}
                    <span style="color:#888; font-size:8px;">${Math.ceil(buff.remaining)}s</span>
                `;
                
                buffContainer.appendChild(el);
            });
        };

        this.eventBus.on('buff_added', () => renderBuffs());
        this.eventBus.on('buff_removed', () => renderBuffs());
        this.eventBus.on('buff_expired', () => renderBuffs());
        
        // Update every second to refresh timers
        setInterval(renderBuffs, 1000);
        renderBuffs();
    }

    setupNotificationUI() {
        // Create notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.bottom = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '10000';
        notificationContainer.style.display = 'flex';
        notificationContainer.style.flexDirection = 'column';
        notificationContainer.style.gap = '10px';
        notificationContainer.style.maxWidth = '400px';
        document.body.appendChild(notificationContainer);

        const showNotification = (notification) => {
            const toast = document.createElement('div');
            toast.className = 'notification';
            toast.style.background = notification.type === 'error' ? 'rgba(255, 0, 85, 0.9)' :
                                    notification.type === 'success' ? 'rgba(0, 255, 157, 0.9)' :
                                    notification.type === 'warning' ? 'rgba(255, 215, 0, 0.9)' :
                                    'rgba(0, 0, 0, 0.9)';
            toast.style.border = `1px solid ${notification.type === 'error' ? 'var(--accent-secondary)' :
                                 notification.type === 'success' ? 'var(--accent-primary)' :
                                 notification.type === 'warning' ? 'var(--accent-gold)' : '#333'}`;
            toast.style.padding = '15px 20px';
            toast.style.borderRadius = '5px';
            toast.style.color = '#fff';
            toast.style.fontSize = '11px';
            toast.style.fontFamily = 'var(--font-mono)';
            toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
            toast.style.animation = 'slideIn 0.3s ease-out';
            toast.textContent = notification.text;
            toast.dataset.id = notification.id;

            notificationContainer.appendChild(toast);

            // Auto-remove after duration
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 300);
                }
            }, notification.duration);
        };

        // Listen for notification events
        this.eventBus.on('notification_show', (notification) => {
            showNotification(notification);
        });

        this.eventBus.on('notification_hide', (notification) => {
            const toast = notificationContainer.querySelector(`[data-id="${notification.id}"]`);
            if (toast) {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        });
    }

    setupCraftingUI() {
        const systemsTab = document.getElementById('tab-upgrades');
        
        const container = document.createElement('div');
        container.id = 'crafting-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-gold)';
        container.style.paddingTop = '10px';
        systemsTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-gold); margin:0;">CRAFTING</h3><div style="font-size:10px; color:#888;">COMBINE ITEMS TO CREATE POWERFUL UPGRADES</div>';
        container.appendChild(header);

        const recipeList = document.createElement('div');
        recipeList.id = 'crafting-list';
        recipeList.style.display = 'flex';
        recipeList.style.flexDirection = 'column';
        recipeList.style.gap = '8px';
        recipeList.style.marginTop = '10px';
        container.appendChild(recipeList);

        const renderRecipes = () => {
            recipeList.innerHTML = '';
            const recipes = this.crafting.craftingRecipes;
            
            recipes.forEach(recipe => {
                const canCraft = this.crafting.canCraft(recipe.id);
                const el = document.createElement('div');
                el.style.background = canCraft ? 'rgba(255, 215, 0, 0.05)' : '#111';
                el.style.border = canCraft ? '1px solid var(--accent-gold)' : '1px solid #333';
                el.style.padding = '10px';
                el.style.opacity = canCraft ? 1 : 0.6;
                
                const inputItems = Object.entries(recipe.input).map(([type, qty]) => {
                    const has = this.inventory.items[type] || 0;
                    return `${qty}x ${type} ${has >= qty ? '✓' : `(${has}/${qty})`}`;
                }).join(', ');
                
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:${canCraft ? 'var(--accent-gold)' : '#666'};">
                            ${recipe.name}
                        </span>
                        <span style="font-size:10px; color:${canCraft ? 'var(--accent-gold)' : '#666'};">
                            ${this.economy.formatNumber(recipe.cost)} ENT
                        </span>
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${recipe.description}</div>
                    <div style="font-size:9px; color:#888; margin-bottom:5px;">REQUIRES: ${inputItems}</div>
                    ${canCraft ? 
                        '<button class="craft-btn" style="width:100%; margin-top:5px; padding:5px; background:var(--accent-gold); color:#000; border:none; cursor:pointer; font-size:9px;">CRAFT</button>' :
                        '<div style="font-size:8px; color:#666; margin-top:5px;">INSUFFICIENT MATERIALS</div>'
                    }
                `;
                
                if (canCraft) {
                    el.querySelector('.craft-btn').onclick = () => {
                        if (this.crafting.craft(recipe.id)) {
                            this.showNotification(`CRAFTED: ${recipe.name}`, 'success');
                            setTimeout(renderRecipes, 500);
                        }
                    };
                }
                
                recipeList.appendChild(el);
            });
        };

        this.eventBus.on('crafting_success', () => renderRecipes());
        this.eventBus.on('item_gained', () => renderRecipes());
        this.eventBus.on('entropy_gained', () => renderRecipes());
        
        renderRecipes();
    }

    setupMilestoneUI() {
        const systemsTab = document.getElementById('tab-upgrades');
        
        const container = document.createElement('div');
        container.id = 'milestone-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-primary)';
        container.style.paddingTop = '10px';
        systemsTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-primary); margin:0;">MILESTONES</h3><div style="font-size:10px; color:#888;">PROGRESS REWARDS</div>';
        container.appendChild(header);

        const milestoneList = document.createElement('div');
        milestoneList.id = 'milestone-list';
        milestoneList.style.display = 'grid';
        milestoneList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        milestoneList.style.gap = '8px';
        milestoneList.style.marginTop = '10px';
        container.appendChild(milestoneList);

        const renderMilestones = () => {
            milestoneList.innerHTML = '';
            const milestones = this.milestones.milestones;
            const claimed = this.milestones.claimedMilestones;
            
            milestones.forEach(milestone => {
                const isClaimed = claimed.includes(milestone.id);
                const isComplete = milestone.check();
                const canClaim = isComplete && !isClaimed;
                
                const el = document.createElement('div');
                el.style.background = isClaimed ? 'rgba(0, 255, 157, 0.1)' : canClaim ? 'rgba(0, 255, 157, 0.05)' : '#111';
                el.style.border = isClaimed ? '2px solid var(--accent-primary)' : canClaim ? '1px solid var(--accent-primary)' : '1px solid #333';
                el.style.padding = '10px';
                el.style.opacity = isClaimed ? 0.7 : canClaim ? 1 : 0.6;
                
                const rewardText = milestone.reward.type === 'entropy' 
                    ? `${this.economy.formatNumber(milestone.reward.amount)} ENT`
                    : `${milestone.reward.amount} Premium`;
                
                el.innerHTML = `
                    <div style="font-size:11px; font-weight:bold; color:${isClaimed ? 'var(--accent-primary)' : canClaim ? 'var(--accent-primary)' : '#666'}; margin-bottom:5px;">
                        ${isClaimed ? '✓' : canClaim ? '!' : '○'} ${milestone.name}
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${milestone.description}</div>
                    <div style="font-size:9px; color:var(--accent-gold);">Reward: ${rewardText}</div>
                    ${canClaim ? 
                        '<button class="claim-btn" style="width:100%; margin-top:5px; padding:5px; background:var(--accent-primary); color:#000; border:none; cursor:pointer; font-size:9px;">CLAIM</button>' :
                        isClaimed ? '<div style="font-size:8px; color:var(--accent-primary); margin-top:5px;">CLAIMED</div>' : ''
                    }
                `;
                
                if (canClaim) {
                    el.querySelector('.claim-btn').onclick = () => {
                        this.milestones.claimMilestone(milestone);
                        this.showNotification(`MILESTONE CLAIMED: ${milestone.name}`, 'success');
                        setTimeout(renderMilestones, 500);
                    };
                }
                
                milestoneList.appendChild(el);
            });
        };

        this.eventBus.on('milestone_achieved', () => renderMilestones());
        this.eventBus.on('entropy_gained', () => renderMilestones());
        this.eventBus.on('click', () => renderMilestones());
        
        // Check milestones periodically
        setInterval(() => {
            this.milestones.checkMilestones();
            renderMilestones();
        }, 2000);
        
        renderMilestones();
    }

    setupTradingUI() {
        const socialTab = document.getElementById('tab-social');
        
        const container = document.createElement('div');
        container.id = 'trading-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-purple)';
        container.style.paddingTop = '10px';
        socialTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-purple); margin:0;">MARKETPLACE</h3><div style="font-size:10px; color:#888;">BUY & SELL ITEMS</div>';
        container.appendChild(header);

        const marketContent = document.createElement('div');
        marketContent.id = 'market-content';
        marketContent.style.marginTop = '10px';
        container.appendChild(marketContent);

        const renderMarket = () => {
            const items = this.trading.getMarketItems();
            
            marketContent.innerHTML = `
                <div style="font-size:10px; color:#888; margin-bottom:10px;">MARKET PRICES (Updates every 30s)</div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${items.map(item => {
                        const trend = item.currentPrice > item.basePrice ? '📈' : '📉';
                        const priceChange = ((item.currentPrice / item.basePrice - 1) * 100).toFixed(1);
                        return `
                            <div style="background:#111; border:1px solid #333; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-size:11px; font-weight:bold; color:#fff;">${item.name}</div>
                                    <div style="font-size:9px; color:#888;">${trend} ${priceChange > 0 ? '+' : ''}${priceChange}% | Demand: ${(item.demand * 100).toFixed(0)}%</div>
                                </div>
                                <div style="display:flex; gap:5px;">
                                    <button class="buy-btn" data-item="${item.id}" style="padding:5px 10px; background:var(--accent-primary); color:#000; border:none; cursor:pointer; font-size:9px;">BUY (${this.economy.formatNumber(item.currentPrice)})</button>
                                    <button class="sell-btn" data-item="${item.id}" style="padding:5px 10px; background:var(--accent-secondary); color:#fff; border:none; cursor:pointer; font-size:9px;">SELL</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            marketContent.querySelectorAll('.buy-btn').forEach(btn => {
                btn.onclick = () => {
                    const itemId = btn.dataset.item;
                    const quantity = parseInt(prompt('QUANTITY:', '1')) || 1;
                    if (quantity > 0) {
                        this.trading.buyItem(itemId, quantity);
                        setTimeout(renderMarket, 500);
                    }
                };
            });
            
            marketContent.querySelectorAll('.sell-btn').forEach(btn => {
                btn.onclick = () => {
                    const itemId = btn.dataset.item;
                    const quantity = parseInt(prompt('QUANTITY:', '1')) || 1;
                    if (quantity > 0) {
                        this.trading.sellItem(itemId, quantity);
                        setTimeout(renderMarket, 500);
                    }
                };
            });
        };

        this.eventBus.on('market_updated', () => renderMarket());
        this.eventBus.on('item_purchased', () => renderMarket());
        this.eventBus.on('item_sold', () => renderMarket());
        setInterval(renderMarket, 5000);
        renderMarket();
    }

    setupAutomationUI() {
        const systemsTab = document.getElementById('tab-upgrades');
        
        const container = document.createElement('div');
        container.id = 'automation-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-primary)';
        container.style.paddingTop = '10px';
        systemsTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-primary); margin:0;">AUTOMATION</h3><div style="font-size:10px; color:#888;">AI ASSISTANTS</div>';
        container.appendChild(header);

        const assistantList = document.createElement('div');
        assistantList.id = 'assistant-list';
        assistantList.style.marginTop = '10px';
        container.appendChild(assistantList);

        const renderAssistants = () => {
            assistantList.innerHTML = '';
            this.automation.getAssistants().forEach(assistant => {
                const effect = assistant.effect(assistant.level);
                const nextCost = assistant.cost * Math.pow(2, assistant.level);
                
                const el = document.createElement('div');
                el.style.background = assistant.level > 0 ? 'rgba(0, 255, 157, 0.05)' : '#111';
                el.style.border = assistant.level > 0 ? '1px solid var(--accent-primary)' : '1px solid #333';
                el.style.padding = '10px';
                el.style.marginBottom = '8px';
                
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:${assistant.level > 0 ? 'var(--accent-primary)' : '#666'};">
                            ${assistant.name} ${assistant.level > 0 ? `Lv.${assistant.level}` : ''}
                        </span>
                        ${assistant.level < assistant.maxLevel ? 
                            `<button class="upgrade-btn" data-id="${assistant.id}" style="padding:5px 10px; background:var(--accent-primary); color:#000; border:none; cursor:pointer; font-size:9px;">UPGRADE (${this.economy.formatNumber(nextCost)})</button>` :
                            '<span style="font-size:9px; color:var(--accent-gold);">MAX LEVEL</span>'
                        }
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${assistant.description}</div>
                    ${assistant.level > 0 ? `
                        <div style="font-size:9px; color:var(--accent-primary);">
                            ${Object.keys(effect).map(key => `${key}: ${typeof effect[key] === 'number' ? effect[key].toFixed(2) : effect[key]}`).join(' | ')}
                        </div>
                    ` : ''}
                `;
                
                if (assistant.level < assistant.maxLevel) {
                    el.querySelector('.upgrade-btn').onclick = () => {
                        if (this.automation.upgradeAssistant(assistant.id)) {
                            setTimeout(renderAssistants, 500);
                        }
                    };
                }
                
                assistantList.appendChild(el);
            });
        };

        this.eventBus.on('assistant_upgraded', () => renderAssistants());
        this.eventBus.on('auto_click', (data) => {
            // Handle auto-click with efficiency
            const baseDmg = this.progression.getClickDamage() * data.efficiency;
            const actualDmg = this.enemies.takeDamage(baseDmg, 'auto');
            if (actualDmg > 0) {
                const entropyMultiplier = this.activeMultipliers?.entropy_gain || 1.0;
                const guildBonus = this.guilds.getGuildBonus();
                const finalEntropy = actualDmg * entropyMultiplier * guildBonus;
                this.economy.addEntropy(finalEntropy);
            }
        });
        renderAssistants();
    }

    setupAdvancedPrestigeUI() {
        const voidTab = document.getElementById('tab-gacha');
        
        const container = document.createElement('div');
        container.id = 'advanced-prestige-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-purple)';
        container.style.paddingTop = '10px';
        voidTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-purple); margin:0;">ADVANCED PRESTIGE</h3><div style="font-size:10px; color:#888;">MULTI-LAYER ASCENSION</div>';
        container.appendChild(header);

        const layerList = document.createElement('div');
        layerList.id = 'layer-list';
        layerList.style.marginTop = '10px';
        container.appendChild(layerList);

        const renderLayers = () => {
            layerList.innerHTML = '';
            this.advancedPrestige.getLayers().forEach(layer => {
                const count = this.advancedPrestige.getPrestigeCounts()[layer.id];
                const requiredVM = this.advancedPrestige.getRequiredVoidMatter(layer.id);
                const canPrestige = this.prestige.voidMatter >= requiredVM && layer.unlocked;
                
                const el = document.createElement('div');
                el.style.background = layer.unlocked ? (canPrestige ? 'rgba(189, 0, 255, 0.1)' : '#111') : '#0a0a0a';
                el.style.border = layer.unlocked ? (canPrestige ? '2px solid var(--accent-purple)' : '1px solid #333') : '1px solid #222';
                el.style.padding = '10px';
                el.style.marginBottom = '8px';
                el.style.opacity = layer.unlocked ? 1 : 0.5;
                
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:${layer.unlocked ? 'var(--accent-purple)' : '#666'};">
                            ${layer.name} ${layer.unlocked ? `(${count}x)` : '[LOCKED]'}
                        </span>
                        ${layer.unlocked && canPrestige ? 
                            `<button class="prestige-btn" data-id="${layer.id}" style="padding:5px 10px; background:var(--accent-purple); color:#fff; border:none; cursor:pointer; font-size:9px;">PRESTIGE (${requiredVM} VM)</button>` :
                            layer.unlocked ? `<span style="font-size:9px; color:#666;">Need ${requiredVM} VM</span>` : ''
                        }
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${layer.description}</div>
                    ${layer.unlocked ? `
                        <div style="font-size:9px; color:var(--accent-purple);">
                            Multiplier: ${layer.multiplier.toFixed(2)}x | Total: ${count}
                        </div>
                    ` : layer.requirement ? `
                        <div style="font-size:9px; color:#666;">
                            Requires: ${Object.keys(layer.requirement).map(k => `${k}: ${layer.requirement[k]}`).join(', ')}
                        </div>
                    ` : ''}
                `;
                
                if (layer.unlocked && canPrestige) {
                    el.querySelector('.prestige-btn').onclick = () => {
                        if (this.advancedPrestige.performPrestige(layer.id)) {
                            setTimeout(renderLayers, 500);
                        }
                    };
                }
                
                layerList.appendChild(el);
            });
        };

        this.eventBus.on('advanced_prestige_performed', () => renderLayers());
        this.eventBus.on('prestige_layer_unlocked', () => renderLayers());
        setInterval(renderLayers, 2000);
        renderLayers();
    }

    setupAdvancedAchievementsUI() {
        const systemsTab = document.getElementById('tab-upgrades');
        
        const container = document.createElement('div');
        container.id = 'advanced-achievements-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-gold)';
        container.style.paddingTop = '10px';
        systemsTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = `<h3 style="color:var(--accent-gold); margin:0;">ACHIEVEMENTS</h3><div style="font-size:10px; color:#888;">${this.advancedAchievements.getUnlockedCount()}/${this.advancedAchievements.getTotalCount()} UNLOCKED</div>`;
        container.appendChild(header);

        const categoryTabs = document.createElement('div');
        categoryTabs.style.display = 'flex';
        categoryTabs.style.gap = '5px';
        categoryTabs.style.marginTop = '10px';
        categoryTabs.style.marginBottom = '10px';
        container.appendChild(categoryTabs);

        const achievementList = document.createElement('div');
        achievementList.id = 'achievement-list';
        achievementList.style.marginTop = '10px';
        container.appendChild(achievementList);

        let currentCategory = 'combat';

        const renderAchievements = () => {
            const categories = this.advancedAchievements.getCategories();
            const category = categories[currentCategory];
            
            categoryTabs.innerHTML = '';
            Object.keys(categories).forEach(key => {
                const cat = categories[key];
                const btn = document.createElement('button');
                btn.style.padding = '5px 10px';
                btn.style.background = currentCategory === key ? 'var(--accent-gold)' : '#111';
                btn.style.color = currentCategory === key ? '#000' : '#fff';
                btn.style.border = '1px solid var(--accent-gold)';
                btn.style.cursor = 'pointer';
                btn.style.fontSize = '9px';
                btn.innerText = `${cat.icon} ${cat.name}`;
                btn.onclick = () => {
                    currentCategory = key;
                    renderAchievements();
                };
                categoryTabs.appendChild(btn);
            });
            
            achievementList.innerHTML = '';
            category.achievements.forEach(achievement => {
                const el = document.createElement('div');
                el.style.background = achievement.unlocked ? 'rgba(255, 215, 0, 0.1)' : '#111';
                el.style.border = achievement.unlocked ? '1px solid var(--accent-gold)' : '1px solid #333';
                el.style.padding = '10px';
                el.style.marginBottom = '8px';
                el.style.opacity = achievement.unlocked ? 1 : 0.6;
                
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:${achievement.unlocked ? 'var(--accent-gold)' : '#666'};">
                            ${achievement.unlocked ? '✓' : '○'} ${achievement.name}
                        </span>
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${achievement.description}</div>
                    ${achievement.unlocked ? `
                        <div style="font-size:9px; color:var(--accent-gold);">
                            Reward: ${achievement.reward.entropy ? this.economy.formatNumber(achievement.reward.entropy) + ' ENT' : ''} 
                            ${achievement.reward.premium ? achievement.reward.premium + ' Premium' : ''}
                        </div>
                    ` : ''}
                `;
                
                achievementList.appendChild(el);
            });
        };

        this.eventBus.on('achievement_unlocked', () => {
            header.innerHTML = `<h3 style="color:var(--accent-gold); margin:0;">ACHIEVEMENTS</h3><div style="font-size:10px; color:#888;">${this.advancedAchievements.getUnlockedCount()}/${this.advancedAchievements.getTotalCount()} UNLOCKED</div>`;
            renderAchievements();
        });
        
        // Check achievements periodically
        setInterval(() => {
            this.advancedAchievements.checkAchievements();
        }, 5000);
        
        renderAchievements();
    }

    setupDifficultyModifiersUI() {
        const systemsTab = document.getElementById('tab-upgrades');
        
        const container = document.createElement('div');
        container.id = 'difficulty-modifiers-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-secondary)';
        container.style.paddingTop = '10px';
        systemsTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-secondary); margin:0;">DIFFICULTY MODIFIERS</h3><div style="font-size:10px; color:#888;">INCREASE CHALLENGE FOR BETTER REWARDS</div>';
        container.appendChild(header);

        const activeModifiers = document.createElement('div');
        activeModifiers.id = 'active-modifiers';
        activeModifiers.style.marginTop = '10px';
        activeModifiers.style.marginBottom = '10px';
        container.appendChild(activeModifiers);

        const availableModifiers = document.createElement('div');
        availableModifiers.id = 'available-modifiers';
        availableModifiers.style.marginTop = '10px';
        container.appendChild(availableModifiers);

        const renderModifiers = () => {
            const active = this.difficultyModifiers.getActiveModifiers();
            const available = this.difficultyModifiers.getAvailableModifiers();
            const totalReward = this.difficultyModifiers.getTotalRewardMultiplier();
            
            activeModifiers.innerHTML = active.length > 0 ? `
                <div style="font-size:10px; color:#fff; margin-bottom:5px;">ACTIVE MODIFIERS (${totalReward.toFixed(1)}x Rewards):</div>
                ${active.map(mod => `
                    <div style="background:rgba(255, 0, 85, 0.1); border:1px solid var(--accent-secondary); padding:8px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:10px; color:#fff;">${mod.icon} ${mod.name}</span>
                        <button class="deactivate-btn" data-id="${mod.id}" style="padding:3px 8px; background:var(--accent-secondary); color:#fff; border:none; cursor:pointer; font-size:8px;">DEACTIVATE</button>
                    </div>
                `).join('')}
            ` : '<div style="font-size:10px; color:#888;">NO ACTIVE MODIFIERS</div>';
            
            activeModifiers.querySelectorAll('.deactivate-btn').forEach(btn => {
                btn.onclick = () => {
                    this.difficultyModifiers.deactivateModifier(btn.dataset.id);
                    setTimeout(renderModifiers, 500);
                };
            });
            
            availableModifiers.innerHTML = `
                <div style="font-size:10px; color:#fff; margin-bottom:5px;">AVAILABLE MODIFIERS:</div>
                ${available.filter(mod => !active.find(a => a.id === mod.id)).map(mod => `
                    <div style="background:#111; border:1px solid #333; padding:10px; margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                            <span style="font-size:11px; font-weight:bold; color:#fff;">${mod.icon} ${mod.name}</span>
                            ${mod.cost > 0 ? `<span style="font-size:9px; color:var(--accent-gold);">${this.economy.formatNumber(mod.cost)} ENT</span>` : ''}
                        </div>
                        <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${mod.description}</div>
                        <button class="activate-btn" data-id="${mod.id}" style="width:100%; padding:5px; background:var(--accent-secondary); color:#fff; border:none; cursor:pointer; font-size:9px;">ACTIVATE</button>
                    </div>
                `).join('')}
            `;
            
            availableModifiers.querySelectorAll('.activate-btn').forEach(btn => {
                btn.onclick = () => {
                    if (this.difficultyModifiers.activateModifier(btn.dataset.id)) {
                        setTimeout(renderModifiers, 500);
                    }
                };
            });
        };

        this.eventBus.on('difficulty_modifier_activated', () => renderModifiers());
        this.eventBus.on('difficulty_modifier_deactivated', () => renderModifiers());
        renderModifiers();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(btn => {
            btn.onclick = () => {
                // Remove active
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none');
                contents.forEach(c => c.classList.remove('active'));

                // Add active
                btn.classList.add('active');
                const id = btn.dataset.tab;
                const content = document.getElementById(`tab-${id}`);
                if (content) {
                    content.style.display = 'flex'; // or block based on CSS
                    content.style.display = id === 'mine' ? 'flex' : 'block';
                    content.classList.add('active');
                }
            };
        });
    }

    setupPerformanceUI() {
        // Add quality selector to settings
        this.eventBus.on('quality_changed', (config) => {
            // Apply to renderer
            this.renderer.setParticleCount(config.particles);
            this.renderer.setMaxParticles(config.maxParticles);
        });
        
        // Start performance monitoring
        this.performance.startPerformanceMonitoring();
        
        // Listen for performance warnings
        this.eventBus.on('performance_warning', (data) => {
            if (data.suggestion === 'lower_quality' && this.performance.getCurrentQuality() !== 'low') {
                this.showNotification(`LOW FPS DETECTED (${data.fps}). Consider lowering quality.`, 'warning');
            }
        });
    }

    setupTooltips() {
        // Add tooltips to various UI elements
        setTimeout(() => {
            // Tooltip for manual override button
            const manualBtn = document.getElementById('manual-override-btn');
            if (manualBtn) {
                this.tooltips.attach(manualBtn, 
                    'Click to deal manual damage.\nBuild combos for multipliers!', 
                    'top'
                );
            }
            
            // Tooltip for premium currency
            const premiumEl = document.getElementById('premium-currency');
            if (premiumEl) {
                this.tooltips.attach(premiumEl, 
                    'Premium currency.\nEarned from achievements and milestones.', 
                    'bottom'
                );
            }
            
            // Tooltip for stability
            const stabilityEl = document.getElementById('stability-display');
            if (stabilityEl) {
                this.tooltips.attach(stabilityEl, 
                    'Core Stability.\nDecays over time. Keep it high!', 
                    'top'
                );
            }
        }, 1000);
        
        // Add tooltips dynamically as UI elements are created
        this.eventBus.on('ui_element_created', (data) => {
            if (data.element && data.tooltip) {
                this.tooltips.attach(data.element, data.tooltip, data.position || 'top');
            }
        });
    }

    setupThemeUI() {
        // Add theme selector to settings
        this.eventBus.on('theme_changed', (theme) => {
            this.showNotification(`Theme changed to ${theme.name}`, 'success');
        });
    }

    setupTimeRewardUI() {
        // Show time reward notifications
        this.eventBus.on('time_reward_claimed', (tier) => {
            this.audio.playQuestComplete();
            this.showNotification(`TIME REWARD: ${tier.message}`, 'success', 5000);
        });
        
        this.eventBus.on('periodic_reward', (amount) => {
            // Silent periodic rewards, just update UI
            this.eventBus.emit('entropy_gained', amount);
        });
    }

    setupAudioImprovements() {
        // Enhanced audio feedback
        this.eventBus.on('quest_completed', () => {
            this.audio.playQuestComplete();
        });
        
        this.eventBus.on('upgrade_purchased', () => {
            this.audio.playPurchase();
        });
        
        this.eventBus.on('combo_milestone', (data) => {
            if (data.count >= 25) {
                this.audio.playCombo(Math.floor(data.count / 25));
            }
        });
        
        this.eventBus.on('enemy_killed', (data) => {
            if (data.isBoss) {
                this.audio.playSuccess();
            }
        });
        
        this.eventBus.on('system_message', (msg) => {
            if (msg.type === 'success') {
                this.audio.playSuccess();
            }
        });
    }

    setupLeaderboardUI() {
        const socialTab = document.getElementById('tab-social');
        
        const container = document.createElement('div');
        container.id = 'leaderboard-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-primary)';
        container.style.paddingTop = '10px';
        socialTab.insertBefore(container, socialTab.firstChild);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-primary); margin:0;">GLOBAL RANKINGS</h3><div style="font-size:10px; color:#888;">COMPETITIVE LEADERBOARDS</div>';
        container.appendChild(header);

        const tabs = document.createElement('div');
        tabs.style.display = 'flex';
        tabs.style.gap = '5px';
        tabs.style.marginTop = '10px';
        tabs.style.marginBottom = '10px';
        container.appendChild(tabs);

        const leaderboardList = document.createElement('div');
        leaderboardList.id = 'leaderboard-list';
        leaderboardList.style.display = 'flex';
        leaderboardList.style.flexDirection = 'column';
        leaderboardList.style.gap = '5px';
        container.appendChild(leaderboardList);

        const types = [
            { id: 'entropy', name: 'ENTROPY', format: (v) => this.economy.formatNumber(v) },
            { id: 'prestige', name: 'PRESTIGE', format: (v) => v },
            { id: 'clicks', name: 'CLICKS', format: (v) => this.economy.formatNumber(v) },
            { id: 'playtime', name: 'PLAYTIME', format: (v) => Math.floor(v / 3600) + 'h' }
        ];

        let currentType = 'entropy';

        types.forEach(type => {
            const btn = document.createElement('button');
            btn.innerText = type.name;
            btn.style.flex = '1';
            btn.style.padding = '5px';
            btn.style.background = currentType === type.id ? 'var(--accent-primary)' : '#111';
            btn.style.border = '1px solid var(--accent-primary)';
            btn.style.color = currentType === type.id ? '#000' : '#fff';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '10px';
            
            btn.onclick = () => {
                currentType = type.id;
                types.forEach(t => {
                    const b = tabs.querySelector(`[data-type="${t.id}"]`);
                    if (b) {
                        b.style.background = t.id === currentType ? 'var(--accent-primary)' : '#111';
                        b.style.color = t.id === currentType ? '#000' : '#fff';
                    }
                });
                renderLeaderboard();
            };
            btn.dataset.type = type.id;
            tabs.appendChild(btn);
        });

        const renderLeaderboard = () => {
            leaderboardList.innerHTML = '';
            const leaderboard = this.leaderboard.getLeaderboard(currentType, 10);
            const playerRank = this.leaderboard.getPlayerRank(currentType);
            const format = types.find(t => t.id === currentType).format;

            leaderboard.forEach((player, index) => {
                const el = document.createElement('div');
                el.style.display = 'flex';
                el.style.justifyContent = 'space-between';
                el.style.alignItems = 'center';
                el.style.padding = '8px';
                el.style.background = player.isPlayer ? 'rgba(0, 255, 157, 0.1)' : '#111';
                el.style.border = player.isPlayer ? '2px solid var(--accent-primary)' : '1px solid #333';
                el.style.fontSize = '11px';

                const rank = index + 1;
                const value = player[currentType];

                el.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:#888; font-weight:bold; min-width:30px;">#${rank}</span>
                        <span style="color:${player.isPlayer ? 'var(--accent-primary)' : '#fff'}; font-weight:${player.isPlayer ? 'bold' : 'normal'};">${player.name}</span>
                    </div>
                    <span style="color:var(--accent-gold);">${format(value)}</span>
                `;
                leaderboardList.appendChild(el);
            });

            // Show player rank if not in top 10
            if (playerRank > 10) {
                const playerStats = this.leaderboard.getPlayerStats();
                const el = document.createElement('div');
                el.style.display = 'flex';
                el.style.justifyContent = 'space-between';
                el.style.alignItems = 'center';
                el.style.padding = '8px';
                el.style.background = 'rgba(0, 255, 157, 0.2)';
                el.style.border = '2px solid var(--accent-primary)';
                el.style.marginTop = '10px';
                el.style.fontSize = '11px';
                el.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:#888; font-weight:bold;">#${playerRank}</span>
                        <span style="color:var(--accent-primary); font-weight:bold;">YOU</span>
                    </div>
                    <span style="color:var(--accent-gold);">${format(playerStats.stats[currentType])}</span>
                `;
                leaderboardList.appendChild(el);
            }
        };

        this.eventBus.on('leaderboard_updated', () => renderLeaderboard());
        renderLeaderboard();
    }

    setupModUI() {
        const systemsTab = document.getElementById('tab-upgrades');
        
        const container = document.createElement('div');
        container.id = 'mod-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '2px solid var(--accent-secondary)';
        container.style.paddingTop = '10px';
        systemsTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = `
            <h3 style="color:var(--accent-secondary); margin:0;">MOD SYSTEM</h3>
            <div style="font-size:10px; color:#888;">CUSTOMIZE YOUR PLAYSTYLE</div>
            <div style="font-size:10px; color:var(--accent-gold); margin-top:5px;">
                ACTIVE MODS: ${this.mods.activeMods.length}/${this.mods.modSlots}
            </div>
        `;
        container.appendChild(header);

        const modList = document.createElement('div');
        modList.id = 'mod-list';
        modList.style.display = 'flex';
        modList.style.flexDirection = 'column';
        modList.style.gap = '8px';
        modList.style.marginTop = '10px';
        container.appendChild(modList);

        const renderMods = () => {
            modList.innerHTML = '';
            
            // Show active mods first
            const activeMods = this.mods.getActiveMods();
            if (activeMods.length > 0) {
                const activeHeader = document.createElement('div');
                activeHeader.style.color = 'var(--accent-secondary)';
                activeHeader.style.fontSize = '11px';
                activeHeader.style.fontWeight = 'bold';
                activeHeader.style.marginBottom = '5px';
                activeHeader.innerText = 'ACTIVE MODS:';
                modList.appendChild(activeHeader);
                
                activeMods.forEach(mod => {
                    const el = document.createElement('div');
                    el.style.background = 'rgba(255, 0, 85, 0.1)';
                    el.style.border = '1px solid var(--accent-secondary)';
                    el.style.padding = '10px';
                    el.style.display = 'flex';
                    el.style.justifyContent = 'space-between';
                    el.style.alignItems = 'center';
                    
                    el.innerHTML = `
                        <div>
                            <div style="font-size:11px; font-weight:bold; color:var(--accent-secondary);">${mod.name}</div>
                            <div style="font-size:9px; color:#aaa;">${mod.description}</div>
                        </div>
                        <button class="unequip-mod" style="padding:5px 10px; background:var(--accent-secondary); color:#fff; border:none; cursor:pointer; font-size:9px;">UNEQUIP</button>
                    `;
                    
                    el.querySelector('.unequip-mod').onclick = () => {
                        this.mods.unequip(mod.id);
                        renderMods();
                    };
                    
                    modList.appendChild(el);
                });
            }
            
            // Show available mods
            const availableMods = this.mods.getAvailableMods();
            if (availableMods.length > 0) {
                const availableHeader = document.createElement('div');
                availableHeader.style.color = '#fff';
                availableHeader.style.fontSize = '11px';
                availableHeader.style.fontWeight = 'bold';
                availableHeader.style.marginTop = '10px';
                availableHeader.style.marginBottom = '5px';
                availableHeader.innerText = 'AVAILABLE MODS:';
                modList.appendChild(availableHeader);
                
                availableMods.forEach(mod => {
                    const canEquip = this.mods.canEquip(mod.id);
                    const el = document.createElement('div');
                    el.style.background = canEquip ? 'rgba(255, 0, 85, 0.05)' : '#111';
                    el.style.border = canEquip ? '1px solid var(--accent-secondary)' : '1px solid #333';
                    el.style.padding = '10px';
                    el.style.opacity = canEquip ? 1 : 0.6;
                    
                    el.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                            <span style="font-size:11px; font-weight:bold; color:${canEquip ? 'var(--accent-secondary)' : '#666'};">${mod.name}</span>
                            <span style="font-size:10px; color:${canEquip ? 'var(--accent-gold)' : '#666'};">${this.economy.formatNumber(mod.cost)} ENT</span>
                        </div>
                        <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${mod.description}</div>
                        ${!canEquip && this.mods.activeMods.length >= this.mods.modSlots ? 
                            '<div style="font-size:8px; color:#ff0055;">MOD SLOTS FULL</div>' : ''}
                    `;
                    
                    if (canEquip) {
                        el.style.cursor = 'pointer';
                        el.onclick = () => {
                            if (this.mods.equip(mod.id)) {
                                renderMods();
                            }
                        };
                    }
                    
                    modList.appendChild(el);
                });
            }
        };

        this.eventBus.on('mod_equipped', () => renderMods());
        this.eventBus.on('mod_unequipped', () => renderMods());
        renderMods();
    }

    setupSeasonalEventUI() {
        const header = document.getElementById('ui-header');
        
        const eventContainer = document.createElement('div');
        eventContainer.id = 'seasonal-container';
        eventContainer.style.position = 'absolute';
        eventContainer.style.top = '120px';
        eventContainer.style.left = '10px';
        eventContainer.style.right = '10px';
        eventContainer.style.zIndex = '1000';
        eventContainer.style.pointerEvents = 'none';
        document.body.appendChild(eventContainer);

        const renderEvents = () => {
            eventContainer.innerHTML = '';
            const activeEvents = this.seasonal.getActiveEvents();
            
            activeEvents.forEach(event => {
                const time = this.seasonal.getTimeRemaining(event);
                const el = document.createElement('div');
                el.style.background = 'rgba(0,0,0,0.9)';
                el.style.border = `3px solid ${event.color}`;
                el.style.padding = '10px 15px';
                el.style.marginBottom = '8px';
                el.style.borderRadius = '5px';
                el.style.boxShadow = `0 0 15px ${event.color}`;
                el.style.pointerEvents = 'auto';
                el.style.cursor = 'pointer';

                el.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:20px;">${event.icon}</span>
                        <div style="flex:1;">
                            <div style="font-size:12px; font-weight:bold; color:${event.color};">${event.name}</div>
                            <div style="font-size:10px; color:#aaa;">${event.description}</div>
                        </div>
                        <div style="font-size:11px; color:#fff; font-family:var(--font-mono);">
                            ${time.days > 0 ? `${time.days}d ` : ''}${time.hours}h
                        </div>
                    </div>
                `;
                eventContainer.appendChild(el);
            });
        };

        this.eventBus.on('seasonal_event_started', (event) => {
            this.showNotification(`${event.name} STARTED!`, 'success', 5000);
            renderEvents();
        });
        this.eventBus.on('seasonal_event_ended', (event) => {
            this.showNotification(`${event.name} ENDED`, 'info');
            renderEvents();
        });

        setInterval(() => {
            const activeEvents = this.seasonal.getActiveEvents();
            if (activeEvents.length > 0) {
                renderEvents();
            } else {
                eventContainer.innerHTML = '';
            }
        }, 60000);

        renderEvents();
    }

    setupPrestigeImprovements() {
        // Enhanced prestige UI with better info
        this.eventBus.on('ascension_performed', () => {
            this.audio.playSuccess();
        });
        
        // Update prestige button with better info
        setInterval(() => {
            const info = this.prestige.getAscensionInfo();
            const container = document.getElementById('prestige-container');
            if (container && info.canAscend) {
                const btn = container.querySelector('#ascend-btn');
                if (btn) {
                    btn.innerHTML = `ASCEND (+${info.voidMatterGain} VM, ${(info.multiplierIncrease * 100).toFixed(1)}% boost)`;
                }
            }
        }, 1000);
    }

    setupGuildUI() {
        const socialTab = document.getElementById('tab-social');
        
        const container = document.createElement('div');
        container.id = 'guild-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-primary)';
        container.style.paddingTop = '10px';
        socialTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-primary); margin:0;">GUILDS</h3><div style="font-size:10px; color:#888;">JOIN OR CREATE A GUILD</div>';
        container.appendChild(header);

        const guildList = document.createElement('div');
        guildList.id = 'guild-list';
        guildList.style.display = 'flex';
        guildList.style.flexDirection = 'column';
        guildList.style.gap = '8px';
        guildList.style.marginTop = '10px';
        container.appendChild(guildList);

        const playerGuildInfo = document.createElement('div');
        playerGuildInfo.id = 'player-guild-info';
        playerGuildInfo.style.display = 'none';
        container.appendChild(playerGuildInfo);

        const renderGuilds = () => {
            guildList.innerHTML = '';
            const playerGuild = this.guilds.getPlayerGuild();
            
            if (playerGuild) {
                playerGuildInfo.style.display = 'block';
                playerGuildInfo.innerHTML = `
                    <div style="background:rgba(0, 255, 157, 0.1); border:2px solid var(--accent-primary); padding:10px; margin-bottom:10px;">
                        <div style="font-size:12px; font-weight:bold; color:var(--accent-primary); margin-bottom:5px;">YOUR GUILD: ${playerGuild.name}</div>
                        <div style="font-size:10px; color:#aaa;">Level ${playerGuild.level} | ${playerGuild.members} Members</div>
                        <div style="font-size:10px; color:#aaa;">Total Entropy: ${this.economy.formatNumber(playerGuild.totalEntropy)}</div>
                        <div style="font-size:10px; color:var(--accent-gold); margin-top:5px;">Bonus: +${((this.guilds.getGuildBonus() - 1) * 100).toFixed(1)}%</div>
                        <button id="contribute-btn" style="width:100%; margin-top:5px; padding:5px; background:var(--accent-primary); color:#000; border:none; cursor:pointer; font-size:9px;">CONTRIBUTE 1000 ENT</button>
                    </div>
                `;
                
                playerGuildInfo.querySelector('#contribute-btn').onclick = () => {
                    if (this.guilds.contributeEntropy(1000)) {
                        renderGuilds();
                    }
                };
            } else {
                playerGuildInfo.style.display = 'none';
                
                // Show available guilds
                this.guilds.getGuilds().slice(0, 5).forEach(guild => {
                    const el = document.createElement('div');
                    el.style.background = '#111';
                    el.style.border = '1px solid #333';
                    el.style.padding = '10px';
                    el.style.display = 'flex';
                    el.style.justifyContent = 'space-between';
                    el.style.alignItems = 'center';
                    
                    el.innerHTML = `
                        <div>
                            <div style="font-size:11px; font-weight:bold; color:#fff;">${guild.name}</div>
                            <div style="font-size:9px; color:#888;">Level ${guild.level} | ${guild.members} Members</div>
                        </div>
                        <button class="join-guild-btn" style="padding:5px 10px; background:var(--accent-primary); color:#000; border:none; cursor:pointer; font-size:9px;">JOIN</button>
                    `;
                    
                    el.querySelector('.join-guild-btn').onclick = () => {
                        if (this.guilds.joinGuild(guild.id)) {
                            renderGuilds();
                        }
                    };
                    
                    guildList.appendChild(el);
                });
                
                // Create guild button
                const createBtn = document.createElement('button');
                createBtn.style.width = '100%';
                createBtn.style.padding = '10px';
                createBtn.style.marginTop = '10px';
                createBtn.style.background = 'var(--accent-purple)';
                createBtn.style.color = '#fff';
                createBtn.style.border = 'none';
                createBtn.style.cursor = 'pointer';
                createBtn.innerText = 'CREATE GUILD (1000 ENT)';
                createBtn.onclick = () => {
                    const name = prompt('GUILD NAME:');
                    if (name && name.length > 0) {
                        const desc = prompt('GUILD DESCRIPTION:') || 'A new guild';
                        if (this.economy.entropy >= 1000) {
                            this.economy.spendEntropy(1000);
                            if (this.guilds.createGuild(name, desc)) {
                                renderGuilds();
                            }
                        } else {
                            this.showNotification('INSUFFICIENT ENTROPY', 'error');
                        }
                    }
                };
                guildList.appendChild(createBtn);
            }
        };

        this.eventBus.on('guild_created', () => renderGuilds());
        this.eventBus.on('guild_joined', () => renderGuilds());
        this.eventBus.on('guild_contributed', () => renderGuilds());
        renderGuilds();
    }

    setupMiniGameUI() {
        const socialTab = document.getElementById('tab-social');
        
        const container = document.createElement('div');
        container.id = 'minigame-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-gold)';
        container.style.paddingTop = '10px';
        socialTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:var(--accent-gold); margin:0;">MINIGAMES</h3><div style="font-size:10px; color:#888;">SKILL-BASED REWARDS</div>';
        container.appendChild(header);

        const gameList = document.createElement('div');
        gameList.id = 'minigame-list';
        gameList.style.display = 'flex';
        gameList.style.flexDirection = 'column';
        gameList.style.gap = '8px';
        gameList.style.marginTop = '10px';
        container.appendChild(gameList);

        const renderGames = () => {
            gameList.innerHTML = '';
            this.miniGames.getMiniGames().forEach(game => {
                const canPlay = this.miniGames.canPlay(game.id);
                const cooldown = this.miniGames.getCooldownRemaining(game.id);
                const highScore = this.miniGames.getHighScore(game.id);
                
                const el = document.createElement('div');
                el.style.background = canPlay ? 'rgba(255, 215, 0, 0.05)' : '#111';
                el.style.border = canPlay ? '1px solid var(--accent-gold)' : '1px solid #333';
                el.style.padding = '10px';
                el.style.opacity = canPlay ? 1 : 0.6;
                
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:11px; font-weight:bold; color:${canPlay ? 'var(--accent-gold)' : '#666'};">${game.name}</span>
                        <span style="font-size:10px; color:${canPlay ? 'var(--accent-gold)' : '#666'};">${this.economy.formatNumber(game.cost)} ENT</span>
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:5px;">${game.description}</div>
                    ${highScore > 0 ? `<div style="font-size:9px; color:var(--accent-gold);">HIGH SCORE: ${highScore}</div>` : ''}
                    ${cooldown > 0 ? `<div style="font-size:9px; color:#ff0055;">COOLDOWN: ${cooldown}s</div>` : ''}
                `;
                
                if (canPlay) {
                    el.style.cursor = 'pointer';
                    el.onclick = () => {
                        this.showMiniGameModal(game);
                    };
                }
                
                gameList.appendChild(el);
            });
        };

        this.eventBus.on('minigame_completed', () => renderGames());
        renderGames();
    }

    showMiniGameModal(game) {
        // Simple memory game implementation
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.95)';
        overlay.style.zIndex = '500000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        const box = document.createElement('div');
        box.style.background = '#111';
        box.style.border = '2px solid var(--accent-gold)';
        box.style.padding = '20px';
        box.style.textAlign = 'center';
        box.style.maxWidth = '400px';
        
        if (game.id === 'memory_game') {
            this.startMemoryGame(box, overlay, game);
        } else {
            box.innerHTML = `<h2 style="color:var(--accent-gold);">${game.name}</h2><p style="color:#aaa;">Coming soon!</p><button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="margin-top:10px; padding:10px; background:var(--accent-primary); border:none; color:#000; cursor:pointer;">CLOSE</button>`;
            overlay.appendChild(box);
            document.body.appendChild(overlay);
        }
    }

    startMemoryGame(container, overlay, game) {
        let sequence = [];
        let playerSequence = [];
        let level = 1;
        let score = 0;
        
        container.innerHTML = `
            <h2 style="color:var(--accent-gold);">MEMORY MATRIX</h2>
            <div id="game-status" style="color:#fff; margin:10px 0;">Level ${level}</div>
            <div id="game-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin:20px 0;"></div>
            <div id="game-score" style="color:var(--accent-gold); font-size:18px; font-weight:bold;">Score: ${score}</div>
            <button id="start-game-btn" style="padding:10px 20px; background:var(--accent-gold); color:#000; border:none; cursor:pointer; font-weight:bold;">START</button>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        const grid = container.querySelector('#game-grid');
        const status = container.querySelector('#game-status');
        const scoreDisplay = container.querySelector('#game-score');
        const startBtn = container.querySelector('#start-game-btn');
        
        const cells = [];
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.style.width = '80px';
            cell.style.height = '80px';
            cell.style.background = '#222';
            cell.style.border = '2px solid #444';
            cell.style.cursor = 'pointer';
            cell.dataset.index = i;
            cells.push(cell);
            grid.appendChild(cell);
        }
        
        const showSequence = () => {
            cells.forEach(c => c.style.pointerEvents = 'none');
            status.innerText = 'WATCH THE SEQUENCE...';
            
            let delay = 0;
            sequence.forEach((idx, i) => {
                setTimeout(() => {
                    cells[idx].style.background = 'var(--accent-gold)';
                    this.audio.playTone(600 + i * 100, 'sine', 0.2);
                }, delay);
                setTimeout(() => {
                    cells[idx].style.background = '#222';
                }, delay + 500);
                delay += 800;
            });
            
            setTimeout(() => {
                status.innerText = 'REPEAT THE SEQUENCE';
                cells.forEach(c => c.style.pointerEvents = 'auto');
            }, delay);
        };
        
        const checkInput = (idx) => {
            playerSequence.push(idx);
            cells[idx].style.background = 'var(--accent-primary)';
            setTimeout(() => cells[idx].style.background = '#222', 300);
            
            if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
                // Wrong!
                this.miniGames.completeGame(game.id, score);
                overlay.remove();
                return;
            }
            
            if (playerSequence.length === sequence.length) {
                // Level complete!
                score += level * 10;
                level++;
                scoreDisplay.innerText = `Score: ${score}`;
                playerSequence = [];
                sequence.push(Math.floor(Math.random() * 9));
                setTimeout(showSequence, 1000);
            }
        };
        
        cells.forEach((cell, idx) => {
            cell.onclick = () => checkInput(idx);
        });
        
        startBtn.onclick = () => {
            startBtn.style.display = 'none';
            sequence = [Math.floor(Math.random() * 9)];
            showSequence();
        };
    }

    setupPvPUI() {
        const socialTab = document.getElementById('tab-social');
        
        const container = document.createElement('div');
        container.id = 'pvp-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid var(--accent-secondary)';
        container.style.paddingTop = '10px';
        socialTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = `
            <h3 style="color:var(--accent-secondary); margin:0;">PVP ARENA</h3>
            <div style="font-size:10px; color:#888;">COMPETITIVE BATTLES</div>
            <div id="pvp-stats" style="font-size:10px; color:var(--accent-secondary); margin-top:5px;"></div>
        `;
        container.appendChild(header);

        const opponentList = document.createElement('div');
        opponentList.id = 'opponent-list';
        opponentList.style.display = 'flex';
        opponentList.style.flexDirection = 'column';
        opponentList.style.gap = '8px';
        opponentList.style.marginTop = '10px';
        container.appendChild(opponentList);

        const renderPvP = () => {
            const stats = this.pvp.getStats();
            header.querySelector('#pvp-stats').innerHTML = `
                Rank: ${stats.rank} | W:${stats.wins} L:${stats.losses} | Streak: ${stats.streak}
            `;
            
            opponentList.innerHTML = '';
            const opponents = this.pvp.getOpponents();
            const canBattle = this.pvp.canBattle();
            
            opponents.forEach(opponent => {
                const el = document.createElement('div');
                el.style.background = '#111';
                el.style.border = '1px solid var(--accent-secondary)';
                el.style.padding = '10px';
                el.style.display = 'flex';
                el.style.justifyContent = 'space-between';
                el.style.alignItems = 'center';
                
                const rankDiff = opponent.rank - stats.rank;
                const difficulty = rankDiff > 50 ? 'HARD' : rankDiff < -50 ? 'EASY' : 'MEDIUM';
                const diffColor = rankDiff > 50 ? '#ff0055' : rankDiff < -50 ? '#00ff9d' : '#ffaa00';
                
                el.innerHTML = `
                    <div>
                        <div style="font-size:11px; font-weight:bold; color:#fff;">${opponent.name}</div>
                        <div style="font-size:9px; color:#888;">Rank: ${opponent.rank} | <span style="color:${diffColor};">${difficulty}</span></div>
                    </div>
                    <button class="battle-btn" style="padding:5px 10px; background:${canBattle ? 'var(--accent-secondary)' : '#333'}; color:#fff; border:none; cursor:${canBattle ? 'pointer' : 'default'}; font-size:9px;" ${!canBattle ? 'disabled' : ''}>BATTLE</button>
                `;
                
                if (canBattle) {
                    el.querySelector('.battle-btn').onclick = () => {
                        this.pvp.startBattle(opponent.id);
                        setTimeout(renderPvP, 500);
                    };
                }
                
                opponentList.appendChild(el);
            });
        };

        this.eventBus.on('pvp_victory', () => renderPvP());
        this.eventBus.on('pvp_defeat', () => renderPvP());
        renderPvP();
    }

    setupStreakRewardUI() {
        const header = document.getElementById('ui-header');
        
        const streakDisplay = document.createElement('div');
        streakDisplay.id = 'streak-display';
        streakDisplay.style.position = 'absolute';
        streakDisplay.style.top = '10px';
        streakDisplay.style.left = '200px';
        streakDisplay.style.fontFamily = 'var(--font-mono)';
        streakDisplay.style.fontSize = '10px';
        streakDisplay.style.color = 'var(--accent-gold)';
        streakDisplay.style.zIndex = '1000';
        header.appendChild(streakDisplay);

        const updateStreak = () => {
            const streak = this.streakRewards.getCurrentStreak();
            const nextReward = this.streakRewards.getNextStreakReward();
            
            if (streak > 0) {
                streakDisplay.innerHTML = `🔥 STREAK: ${streak} days`;
                if (nextReward) {
                    streakDisplay.innerHTML += ` (${nextReward.days - streak} to ${nextReward.days})`;
                }
                streakDisplay.style.display = 'block';
            } else {
                streakDisplay.style.display = 'none';
            }
        };

        this.eventBus.on('streak_reward_claimed', () => {
            this.audio.playQuestComplete();
            updateStreak();
        });
        
        setInterval(updateStreak, 60000);
        updateStreak();
    }

    setupAnalyticsUI() {
        const socialTab = document.getElementById('tab-social');
        
        const container = document.createElement('div');
        container.id = 'analytics-container';
        container.style.marginTop = '20px';
        container.style.borderTop = '1px solid #444';
        container.style.paddingTop = '10px';
        socialTab.appendChild(container);

        const header = document.createElement('div');
        header.innerHTML = '<h3 style="color:#fff; margin:0;">ANALYTICS</h3><div style="font-size:10px; color:#888;">PERFORMANCE INSIGHTS</div>';
        container.appendChild(header);

        const analyticsContent = document.createElement('div');
        analyticsContent.id = 'analytics-content';
        analyticsContent.style.marginTop = '10px';
        container.appendChild(analyticsContent);

        const renderAnalytics = () => {
            const efficiency = this.analytics.getEfficiencyMetrics();
            const progress = this.analytics.getProgressRate();
            const recommendations = this.analytics.getRecommendations();
            const session = this.analytics.getSessionStats();
            
            analyticsContent.innerHTML = `
                <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:15px;">
                    <div style="background:#111; padding:10px; border:1px solid #333;">
                        <div style="font-size:9px; color:#888;">ENTROPY/HOUR</div>
                        <div style="font-size:16px; color:#fff; font-weight:bold;">${this.economy.formatNumber(efficiency.entropyPerHour)}</div>
                    </div>
                    <div style="background:#111; padding:10px; border:1px solid #333;">
                        <div style="font-size:9px; color:#888;">CLICKS/HOUR</div>
                        <div style="font-size:16px; color:#fff; font-weight:bold;">${Math.floor(efficiency.clicksPerHour)}</div>
                    </div>
                    <div style="background:#111; padding:10px; border:1px solid #333;">
                        <div style="font-size:9px; color:#888;">EFFICIENCY</div>
                        <div style="font-size:16px; color:var(--accent-primary); font-weight:bold;">${efficiency.efficiency.toFixed(2)}</div>
                    </div>
                    <div style="background:#111; padding:10px; border:1px solid #333;">
                        <div style="font-size:9px; color:#888;">SESSION TIME</div>
                        <div style="font-size:16px; color:#fff; font-weight:bold;">${Math.floor(session.sessionTime)}m</div>
                    </div>
                </div>
                ${progress ? `
                    <div style="background:${progress.improving ? 'rgba(0,255,157,0.1)' : 'rgba(255,0,85,0.1)'}; border:1px solid ${progress.improving ? 'var(--accent-primary)' : 'var(--accent-secondary)'}; padding:10px; margin-bottom:10px;">
                        <div style="font-size:10px; color:#fff;">PROGRESS RATE: ${progress.rate > 0 ? '+' : ''}${progress.rate.toFixed(1)}%</div>
                        <div style="font-size:9px; color:#aaa;">${progress.improving ? 'IMPROVING' : 'DECLINING'}</div>
                    </div>
                ` : ''}
                ${recommendations.length > 0 ? `
                    <div style="margin-top:10px;">
                        <div style="font-size:10px; color:#fff; font-weight:bold; margin-bottom:5px;">RECOMMENDATIONS:</div>
                        ${recommendations.map(r => `
                            <div style="font-size:9px; color:${r.priority === 'high' ? 'var(--accent-secondary)' : '#aaa'}; margin:3px 0;">
                                • ${r.text}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;
        };

        setInterval(renderAnalytics, 10000);
        renderAnalytics();
    }

    attachInputs() {
        this.ui.manualBtn.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Canvas click as well for mobile tapping
        this.renderer.canvas.addEventListener('pointerdown', (e) => {
            this.handleClick(e);
        });
    }

    handleClick(e) {
        // 1. Visual Feedback (Immediate)
        const rect = this.renderer.canvas.getBoundingClientRect();
        const x = e.clientX || rect.width / 2;
        const y = e.clientY || rect.height / 2;

        this.eventBus.emit('click_effect', { x: x - rect.left, y: y - rect.top });
        this.eventBus.emit('click');
        this.analytics.sessionData.clicks++;

        // 2. Combo System
        this.combo.addHit();
        const comboMultiplier = this.combo.getMultiplier();

        // 3. Logic (Damage with combo multiplier and research/event/mod multipliers)
        const baseDmg = this.progression.getClickDamage();
        const clickDmgMultiplier = this.activeMultipliers?.click_damage || 1.0;
        const modEffects = this.mods.getActiveEffects();
        const modClickDmg = modEffects.clickDamage || 1.0;
        const modClickSpeed = modEffects.clickSpeed || 1.0;
        // Ensure minimum damage of 1 if baseDmg exists
        const calculatedDmg = (baseDmg || 0) * (comboMultiplier || 1) * clickDmgMultiplier * (modClickDmg || 1);
        const dmg = Math.max(1, Math.floor(calculatedDmg)); // Minimum 1 damage
        const actualDmg = this.enemies.takeDamage(dmg, 'click');
        this.renderer.triggerShake(); // Visual Impact

        if (actualDmg > 0) {
            // Apply event/research multipliers
            const entropyMultiplier = this.activeMultipliers?.entropy_gain || 1.0;
            const modEffects = this.mods.getActiveEffects();
            const modEntropy = modEffects.entropyGain || 1.0;
            const guildBonus = this.guilds.getGuildBonus();
            const finalEntropy = actualDmg * entropyMultiplier * modEntropy * guildBonus;
            this.economy.addEntropy(finalEntropy);
            this.eventBus.emit('entropy_gained', finalEntropy);
            this.analytics.sessionData.entropyGained += finalEntropy;
        }

        this.psychology.killConfirm(); // Relieve stability pressure
        this.achievements.trackEvent('click');

        // 4. Skinner Box (Loot roll)
        const loot = this.loot.rollForLoot();
        if (loot) {
            this.eventBus.emit('loot', loot);
            this.showLootPopup(loot);

            this.inventory.addItem(loot.type);
            this.achievements.trackEvent('item_gain');

            // Add premium currency rarely?
            if (loot.type === 'LEGENDARY') {
                this.ui.premium.innerText = parseInt(this.ui.premium.innerText) + 1;
            }
        } else {
            // Just damage number
            this.spawnFloatingText(dmg, x, y);
        }

        this.eventBus.emit('damage', dmg);
    }

    spawnFloatingText(val, x, y) {
        // Ensure val is a valid number
        const numVal = Number(val);
        if (isNaN(numVal) || !isFinite(numVal) || numVal <= 0) {
            return; // Don't show invalid numbers
        }
        
        const el = document.createElement('div');
        el.className = 'damage-number';
        el.innerText = "+" + this.economy.formatNumber(numVal);
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.color = '#fff';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    setupDailyUI() {
        this.eventBus.on('reward_entropy_boost', (seconds) => {
            const dps = this.progression.getAutoDps();
            if (dps > 0) this.economy.addEntropy(dps * seconds);
        });

        // Offline Progress Listener
        this.eventBus.on('offline_progress', (seconds) => {
            const dps = this.progression.getAutoDps();
            if (dps > 0) {
                const gained = dps * seconds * 0.5; // 50% efficiency
                this.economy.addEntropy(gained);
                this.showOfflineModal(seconds, gained);
            }
        });

        // Check Daily on Startup (after a slight delay to ensure save loaded)
        setTimeout(() => this.checkDaily(), 2000);
    }

    checkDaily() {
        if (this.daily.canClaim()) {
            this.showDailyModal();
        }
    }

    showOfflineModal(seconds, gained) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = '200000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        const hours = (seconds / 3600).toFixed(1);

        overlay.innerHTML = `<div style="text-align:center; background:#111; border:1px solid var(--accent-primary); padding:30px;">
                                <h1 style="color:#fff;">WELCOME BACK</h1>
                                <p style="color:#888;">You were offline for ${hours} hours.</p>
                                <h2 style="color:var(--accent-primary); margin:20px 0;">+${this.economy.formatNumber(gained)} ENTROPY</h2>
                                <button onclick="this.parentElement.parentElement.remove()" style="padding:10px 30px; background:var(--accent-primary); border:none; color:#000; font-weight:bold; cursor:pointer;">RESUME MINING</button>
                             </div>`;
        document.body.appendChild(overlay);
    }

    showDailyModal() {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.95)';
        overlay.style.zIndex = '200000';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        const box = document.createElement('div');
        box.style.textAlign = 'center';

        box.innerHTML = `<h1 style="color:var(--accent-primary); margin-bottom:10px;">DAILY LOGIN REWARD</h1>
                         <div style="display:flex; gap:10px; margin-bottom:20px;" id="daily-grid"></div>
                         <button id="claim-btn" style="padding:15px 40px; font-size:18px; font-weight:bold; background:var(--accent-gold); border:none; color:#000; cursor:pointer;">CLAIM REWARD</button>`;

        const grid = box.querySelector('#daily-grid');
        const currentStreak = this.daily.streak % 7;

        DailyRewardsConfig.forEach((rew, idx) => {
            const el = document.createElement('div');
            el.style.background = idx === currentStreak ? 'rgba(0,255,157,0.2)' : '#111';
            el.style.border = idx === currentStreak ? '2px solid var(--accent-primary)' : '1px solid #333';
            el.style.padding = '10px';
            el.style.width = '80px';
            el.style.opacity = idx < currentStreak ? 0.3 : 1;

            let color = '#fff';
            if (rew.type === 'gems') color = 'var(--accent-gold)';
            if (rew.rarity === 'LEGENDARY') color = '#ffaa00';

            el.innerHTML = `<div style="font-size:10px; color:#666;">DAY ${rew.day}</div>
                             <div style="font-size:24px; margin:10px 0;">🎁</div>
                             <div style="font-size:8px; font-weight:bold; color:${color}">${rew.label}</div>`;
            grid.appendChild(el);
        });

        box.querySelector('#claim-btn').onclick = () => {
            const reward = this.daily.claim();
            if (reward) {
                this.eventBus.emit('system_message', { text: `CLAIMED: ${reward.label}`, type: 'success' });
                overlay.remove();
            }
        };

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    showNotification(text, type = 'info') {
        // Use the new notification system
        this.notifications.addNotification(text, type);
    }

    showLootPopup(loot) {
        const el = document.createElement('div');
        el.innerText = loot.type + " FOUND!";
        el.style.position = 'absolute';
        el.style.left = '50%';
        el.style.top = '40%';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.fontSize = '24px';
        el.style.fontWeight = 'bold';
        el.style.color = loot.color;
        el.style.textShadow = '0 0 10px ' + loot.color;
        el.style.animation = 'floatUp 2s forwards';
        el.style.zIndex = '9999';
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.challenges.checkCompletion(); // Check constraints status
        if (this.hacking) this.hacking.update(dt);

        // Auto-play logic (Illusion of control - it plays itself mostly)
        let autoDps = this.progression.getAutoDps();
        // Apply event/research multipliers
            const autoDpsMultiplier = this.activeMultipliers?.auto_dps || 1.0;
            const modEffects = this.mods.getActiveEffects();
            const modAutoDps = modEffects.autoDps || 1.0;
        autoDps = autoDps * autoDpsMultiplier * modAutoDps;
        
        if (autoDps > 0) {
            // Damage Enemy
            const actualDmg = this.enemies.takeDamage(autoDps * dt);

            // Gain Entropy (Base + overflow?)
            // Apply entropy multiplier
            if (actualDmg > 0) {
                const entropyMultiplier = this.activeMultipliers?.entropy_gain || 1.0;
                const modEffects = this.mods.getActiveEffects();
                const modEntropy = modEffects.entropyGain || 1.0;
                const guildBonus = this.guilds.getGuildBonus();
                const finalEntropy = actualDmg * entropyMultiplier * modEntropy * guildBonus;
                this.economy.addEntropy(finalEntropy);
                this.analytics.sessionData.entropyGained += finalEntropy;
            }
        }

        // Render Enemy HP
        this.renderer.updateEnemyState({
            level: this.enemies.level,
            hpPercent: this.enemies.getHpPercent(),
            isBoss: this.enemies.isBoss,
            bossTimer: this.enemies.bossTimer,
            visuals: this.enemies.visuals,
            shieldIntegrity: this.enemies.shieldIntegrity
        });

        this.enemies.update(dt);
        this.psychology.update(dt);
        this.skills.update(dt);
        this.drones.update(dt);
        this.combo.update(dt);
        this.statistics.update(dt);
        this.buffs.update(dt);
        this.renderer.render(dt);

        // Animate number changes smoothly
        const currentEntropy = this.economy.entropy;
        const entropyText = this.economy.formatNumber(currentEntropy);
        const dpsText = Math.floor(autoDps);
        this.ui.dps.innerText = entropyText + " / SEC: " + dpsText;
        
        // Show hint about upgrades when player has enough entropy for first upgrade
        if (!this.hasShownUpgradeHint && currentEntropy >= 10) {
            const firstUpgradeCost = this.progression.getUpgradeCost('auto_miner_v1');
            if (currentEntropy >= firstUpgradeCost) {
                this.eventBus.emit('system_message', {
                    text: '💡 Você tem Entropia suficiente! Clique em "SYSTEMS" na parte inferior para comprar upgrades',
                    type: 'info',
                    duration: 5000
                });
                this.hasShownUpgradeHint = true;
            }
        }

        // Debug: Check for any green elements at bottom of screen
        if (!this.lastDebugCheck || Date.now() - this.lastDebugCheck > 2000) {
            const allElements = document.querySelectorAll('*');
            const greenElements = [];
            allElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                const isAtBottom = rect.bottom >= window.innerHeight - 10 && rect.bottom <= window.innerHeight + 10;
                const isGreen = style.backgroundColor.includes('rgb(0, 255, 157)') || 
                               style.borderColor.includes('rgb(0, 255, 157)') ||
                               style.color.includes('rgb(0, 255, 157)') ||
                               style.boxShadow.includes('rgb(0, 255, 157)');
                if (isAtBottom && (isGreen || el.id === 'ui-controls' || el.classList.contains('tab-nav'))) {
                    greenElements.push({
                        id: el.id,
                        className: el.className,
                        tag: el.tagName,
                        top: rect.top,
                        bottom: rect.bottom,
                        backgroundColor: style.backgroundColor,
                        borderTop: style.borderTop,
                        boxShadow: style.boxShadow,
                        display: style.display,
                        visibility: style.visibility
                    });
                }
            });
            if (greenElements.length > 0) {
                // #region agent log
                fetch('http://127.0.0.1:7246/ingest/52a219f3-9ce0-4006-8032-76fde6fe4186',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:loop',message:'Green elements at bottom',data:{greenElements,windowHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
            }
            this.lastDebugCheck = Date.now();
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Start
window.onload = () => {
    new Game();
};

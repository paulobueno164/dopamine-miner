# DOPAMINE MINER: VOID PROTOCOL

## 🧠 Psychological Architecture

This project is not a game; it is a behavioral retention engine.
Every system provides a specific pressure or relief.

### 1. Retention Loops

**Short-Term (The Skinner Box)**
- **Mechanic:** `LootSystem.js`
- **Trigger:** Variable Ratio Reinforcement.
- **Implementation:** Clicking has a 15% chance to drop loot. Rarity is weighted heavily towards Trash, but "Legendary" (0.5%) exists to drive the "Next Click" fallacy.
- **Visuals:** High-contrast particle explosions (`Renderer.js`) only on success.

**Mid-Term (FOMO & Social)**
- **Mechanic:** `PsychologySystem.js`
- **Trigger:** Fear of Missing Out / Social Comparison.
- **Implementation:** 
    - A constant ticker shows *fake* players finding loot your player doesn't have.
    - Global "Events" appear in the header with countdown timers.

**Long-Term (Loss Aversion)**
- **Mechanic:** Stability Decay.
- **Trigger:** Loss Aversion.
- **Implementation:** The "Stability" meter constantly drains. If it hits 0%, mining efficiency is halved. The player *must* return to "stabilize" the core.

### 2. Technical Stack

- **Core:** Vanilla ES6 JavaScript (No frameworks to reduce friction).
- **Rendering:** HTML5 Canvas (Performance for particle juice).
- **UI:** CSS Grid/Flexbox with Cyberpunk/Dark Mode aesthetic ("Premium Feel").
- **Architecture:** 
    - Data-Driven (`src/config/`) for live-ops tuning from a server.
    - Event-Driven (`EventBus`) to decouple logic from visuals.

### 3. How to Run

1. Open `index.html` in a modern browser.
2. OR use a local server:
   ```bash
   npx http-server .
   ```

### 4. Folder Structure

```
c:/projetos/idle/
├── index.html          # Entry / UI Layer
├── style.css           # Styling
├── manifest.json       # PWA Install Config
├── src/
│   ├── main.js         # Bootstrapper
│   ├── config/         # Tuning (Live-ops)
│   │   ├── GameConfig.js
│   │   └── Upgrades.js
│   ├── core/
│   │   └── EventBus.js
│   └── systems/
│       ├── Economy.js
│       ├── Loot.js
│       ├── PsychologySystem.js
│       └── Renderer.js
```

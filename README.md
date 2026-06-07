# ⛏️ Dopamine Miner: Void Protocol

> Jogo **idle/incremental** para navegador, escrito em **JavaScript puro (ES6)** com renderização em
> HTML5 Canvas — um estudo de **arquitetura de sistemas de jogo** e mecânicas de engajamento.

![JavaScript](https://img.shields.io/badge/JavaScript_ES6-F7DF1E?logo=javascript&logoColor=black)
![HTML5 Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)

**[Português](#-português) · [English](#-english)**

---

## 🇧🇷 Português

### Sobre

Um *idle game* de mineração com estética cyberpunk, feito **sem frameworks** para manter o bundle
mínimo. Além do jogo em si, é um estudo prático de **design de mecânicas de engajamento**
(loops de recompensa de curto, médio e longo prazo) e de como estruturar esses sistemas em código
desacoplado e ajustável.

### Destaques técnicos

- **Arquitetura event-driven** com um `EventBus` próprio que desacopla a lógica dos visuais.
- **Design data-driven**: balanceamento e upgrades vivem em `src/config/`, permitindo *tuning* sem
  tocar na lógica (pensado para *live-ops*).
- **Renderização em HTML5 Canvas** com sistema de partículas para feedback visual ("juice").
- **Sistemas modulares** desacoplados: economia, loot (reforço de razão variável), progressão,
  prestígio, conquistas, inimigos, áudio e save.
- **Persistência** via `SaveSystem` e instalável como **PWA** (`manifest.json`).
- **Vanilla ES6** — zero dependências, abre direto no navegador.

### Estrutura

```
index.html              # entrada / camada de UI
style.css               # estilo (dark / cyberpunk)
manifest.json           # configuração PWA
src/
  main.js               # bootstrap
  config/               # tuning (live-ops): GameConfig, Upgrades, EnemyAbilities
  core/EventBus.js      # barramento de eventos
  systems/              # Economy, Loot, Progression, Prestige, Renderer, Audio, Save, ...
```

### Stack

JavaScript (ES6, sem frameworks) · HTML5 Canvas · CSS Grid/Flexbox · PWA.

### Como rodar

```bash
# abra index.html no navegador, ou:
npx http-server .
```

---

## 🇺🇸 English

### About

A cyberpunk-themed mining *idle game* built **without frameworks** to keep the bundle minimal.
Beyond the game itself, it's a hands-on study of **engagement-mechanics design** (short-, mid- and
long-term reward loops) and how to structure those systems as decoupled, tunable code.

### Technical highlights

- **Event-driven architecture** with a custom `EventBus` that decouples logic from visuals.
- **Data-driven design**: balancing and upgrades live in `src/config/`, enabling tuning without
  touching logic (built with live-ops in mind).
- **HTML5 Canvas rendering** with a particle system for visual feedback ("juice").
- **Decoupled, modular systems**: economy, loot (variable-ratio reinforcement), progression,
  prestige, achievements, enemies, audio and save.
- **Persistence** via a `SaveSystem`, installable as a **PWA** (`manifest.json`).
- **Vanilla ES6** — zero dependencies, opens straight in the browser.

### Stack

JavaScript (ES6, no frameworks) · HTML5 Canvas · CSS Grid/Flexbox · PWA.

### Getting started

```bash
# open index.html in a browser, or:
npx http-server .
```

---

<sub>Autor / Author: **Paulo Bueno** · [github.com/paulobueno164](https://github.com/paulobueno164)</sub>

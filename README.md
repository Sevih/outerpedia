![Next.js](https://img.shields.io/badge/Next.js-15-blue?logo=nextdotjs)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Last Commit](https://img.shields.io/github/last-commit/Sevih/outerpedia)
![Stars](https://img.shields.io/github/stars/Sevih/outerpedia?style=social)

# 🌌 Outerpedia

**Outerpedia** is a companion site for **Outerplane**, a mobile turn-based RPG.  
It provides a clean and structured UI to browse characters, gear, builds, and tier lists.

> Built with [Next.js 15](https://nextjs.org), TypeScript, and Tailwind CSS.

🌐 Live: [https://outerpedia.com](https://outerpedia.com)  
💬 Community: [Join the EvaMains Discord](hhttps://discord.com/invite/keGhVQWsHv)  
🛠️ Current version: **1.27 – Demiurge Luna patch**

---

## 🚀 Features

- 🔥 Tier List (updated monthly)  
- 🧙‍♀️ Character pages with skills, buffs/debuffs, EE, and builds  
- 🛡️ Equipment Database: weapons, armor sets, talismans, amulets  
- 🎯 Advanced filters (class, element, buffs, etc.)  
- 📘 Guides for PvE, PvP, raids, and more  
- ⚙️ Tools: EE priority viewer, Item Stats Usage, gear solver  
- 🚀 Lightning fast (static site, CDN, PWA support)

---

## 🧰 Getting Started

Clone and install dependencies:

```bash
git clone https://github.com/Sevih/outerpedia.git
cd outerpedia
npm install
npm run dev
```

Run the dev server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Project Structure

```bash
outerpedia/
├── src/
│   ├── app/                # Next.js App Router (routes, pages, API)
│   ├── app/components/     # UI and logic components
│   └── data/               # JSON game data (characters, equipment, buffs, etc.)
├── public/                 # Static assets
├── scripts/                # Utility scripts (sitemap, SEO, parsing)
└── ...

```
---

## 🔧 Build & Deploy

For production build:

```bash
npm run build
npm run start
```

Deployment is handled via a custom Node.js server with automated GitHub-based deployment.

---

## 📜 License

Outerpedia is a fan project. All in-game assets belong to Smilegate Megaport.  
Code is MIT licensed.

---

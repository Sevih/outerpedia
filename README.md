![Next.js](https://img.shields.io/badge/Next.js-15-blue?logo=nextdotjs)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Last Commit](https://img.shields.io/github/last-commit/Sevih/outerpedia)
![Stars](https://img.shields.io/github/stars/Sevih/outerpedia?style=social)

# 🌌 Outerpedia

Outerpedia is a companion site for **Outerplane**, a mobile turn-based RPG. It provides a clean and structured UI to browse characters, gear, builds, and tier lists.

> Built with [Next.js 15](https://nextjs.org), TypeScript and Tailwind CSS.

---

## 🚀 Features

🔥 Tier List (updated monthly)
🧙‍♀️ Character pages with skills, buffs/debuffs, EE, and builds
🛡️ Equipment DB: weapons, armor sets, talismans, amulets
🎯 Advanced filters (class, element, buffs, etc.)
📘 Guides for PvE, PvP, raids, and more
⚙️ Tools: EE priority viewer, Item Stats Usage, gear solver
🚀 Lightning fast (static site, CDN, PWA support)
The site is live here: [https://outerpedia.com/](https://outerpedia.com/)
Want to suggest builds, contribute, or discuss strategies? Join the EvaMains Discord: https://discord.gg/keGhVQWsHv
Current version 1.27 : Demiurge Luna patc

---

## 🧰 Getting Started

Clone and install dependencies:

```bash
git clone https://github.com/Sevih/outerpedia.git
cd outerpedia
npm install
```

Run the dev server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Project Structure

- `src/data/` – JSON data (characters, equipment, buffs, etc.)
- `src/app/` – Next.js App Router (pages, routes, API)
- `src/app/components/` – UI and logic components
- `scripts/` – Utilities (e.g. sitemap, SEO check, scraping scripts)

---

## 🔧 Build & Deploy

For production build:

```bash
npm run build
npm run start
```

Deployment is handled via **Vercel** or can be self-hosted on any static-compatible platform.

---

## 📜 License

Outerpedia is a fan project. All in-game assets belong to Smilegate Megaport.  
Code is MIT licensed.

---

## 💬 Community

Join our Discord to report bugs, request features or suggest improvements:  
**[https://discord.gg/ESkqR8ta7y](https://discord.gg/ESkqR8ta7y)**

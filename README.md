# 🌌 Outerpedia

Outerpedia is a companion site for **Outerplane**, a mobile turn-based RPG. It provides a clean and structured UI to browse characters, gear, builds, and tier lists.

> Built with [Next.js 15](https://nextjs.org), TypeScript and Tailwind CSS.

---

## 🚀 Features

- 🧙‍♀️ **Character Database** with portraits, skills, passives, chain/dual effects and full JSON export.
- 🛡️ **Equipment Page** supporting filters for type, stats and gear notes.
- 🧪 **Recommended Builds** per character, including exclusive equipment and talismans.
- 🔎 **Buff/Debuff Filters** with AND/OR logic and icon-based UI.
- 📦 Full static export compatible (`force-static`, `dynamicParams = false`).
- 📈 Integrated **SEO metadata** and Open Graph preview (`og_home.jpg`).
- 🎨 Custom UI & homepage design (OG banner, pullable section, categories).

---

## 🧰 Getting Started

Clone and install dependencies:

```bash
git clone https://github.com/<your-username>/outerpedia.git
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
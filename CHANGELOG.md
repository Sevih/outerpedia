## 🎨 Homepage & Gear UI Enhancements (2025-04-22)

### ✅ Added
- Open Graph metadata for the homepage (`metadata` block in `page.tsx`).
- New banner image `og_home.jpg` (1200×630) for rich social previews (Discord, Twitter, etc.).
- Structured separation between `HomeClient.tsx` (client) and `page.tsx` (server) to support metadata export.
- Support for simplified `Note` format in gear JSON (e.g. `PvP:Assassin's Charm3Tactician Charm2`).

### 🛠 Changed
- Replaced star characters with image icons for gear note ratings (`CM_icon_star_y.png`, `CM_icon_star_w.png`).
- Improved layout and readability of gear notes, grouped by PvP and PvE.
- Adjusted regular expression to support charm names containing `'`, `-`, and other characters.
- Converted `.webp` Open Graph image to `.jpg` for maximum compatibility across platforms.

### 🧪 Verified
- Homepage link preview renders correctly on Discord with title, description and banner.
- Charm notes correctly parsed and displayed with ratings and item names preserved.
- Metadata export does not conflict with client components.


## 🧠 SEO Improvements (2025-04-22)
### ✅ Added
- JSON-LD metadata on characters and equipment pages.
- Sitemap generation script (`scripts/generate-sitemap.cjs`).
- SEO verification script (`scripts/seo-check.cjs`).
- `robots.txt` in `public/`.

### 🛠 Changed
- Updated `package.json` to include new `postbuild`, `sitemap`, and `seo-check` scripts.

### 🧪 Verified
- Sitemap generated successfully at `public/sitemap.xml`.
- All character JSONs passed SEO check.
- `robots.txt` accessible publicly.

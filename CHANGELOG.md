## 🚀 Updates (2025-04-26)

### 🛡 Exclusive Equipment Integration
- Generated dedicated WebP images for optimized display.

### 🖼️ SEO & Structured Data Enhancements
- Improved JSON-LD generation with automatic linking to character profiles.
- Complete OpenGraph and metadata integration for all pages (Home, Characters, etc.).
- Custom head.tsx implemented where needed.
- Added manifest.json and robots.txt clean setup.
- Sitemap.xml auto-generation on deployment.
- Fixed missing canonical links and meta consistency.

### 📱 PWA (Progressive Web App) Setup
- Created installable app manifest (manifest.json).
- Added mobile icons (maskable and standard).
- Set theme-color and viewport properties.
- Light PWA compatibility (without service worker).

### 📱 Mobile & Responsive Improvements
- Improved responsive layout for Home page (Currently Pullable, Discord, Categories).
- Fixed header navigation behavior on mobile.

### 🛠 Internal Improvements
- Standardized weapon and amulet card components for better consistency.
- Moved sitemap generation to `postbuild` hook.
- Added SEO-check script for local verifications.
- Brotli compression active on Apache server.
- Resolved critical SEO warnings related to structured data validation.

🛡 Exclusive Equipment Data Complete (2025-04-25)
✅ Added

Added all exclusive equipment data and images for all characters.
Added dual-stat support for weapons and amulets (forcedMainStat with /).
Displayed both icons and stat values properly in tooltips and summary cards.
Improved WeaponMiniCard and AmuletMiniCard components to support multiple main stats with fallback icons.
Implemented full VideoGame + CreativeWork schema.org JSON-LD structure on /equipments, including images for all weapons, accessories, sets, talismans, and exclusive equipment.
Varied set images dynamically (Helmet, Armor, Gloves, Shoes) for a more realistic representation.
Added automatic URL linking for Exclusive Equipment to character pages in structured data.

🧠 Improved

Code structure unified across weapon and amulet components for easier maintenance.
Search Console critical errors for Product schema resolved by switching to proper VideoGame structure.
Internal tools improved: added JSON-LD preview button for development validation.


## 🔥 Character Additions & Burn Visuals (2025-04-24)

### ✅ Added
- All characters from **A to B**, including **Charlotte** and **Caren**, are now fully integrated with portraits, skills, stats and gear.
- New skill icon (`CM_Skill_Icon_Burst.png`) displayed in the **top-left corner** of burn cards.
- Icons for **class** and **element** are now shown on the global character list.

### 🛠 Fixed
- Corrected **Charisma Bryn**'s build assignment (was misplaced).
- Adjusted **Luna** and **Hilde**'s **awakening alignment** on their character pages.

### 🧪 Verified
- Burn card visuals match in-game styling.
- All new characters load without errors and are SEO-ready.
- Character detail pages include complete structured metadata.

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

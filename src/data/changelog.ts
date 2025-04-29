export type ChangelogEntry = {
  date: string;
  title: string;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string[];
};

// Fonction de migration avec typage strict
function migrateChangelogEntries(
  entries: readonly {
    date: string;
    title: string;
    type: 'feature' | 'fix' | 'update' | 'balance';
    content: string | string[];
  }[]
): ChangelogEntry[] {
  return entries.map(entry => ({
    ...entry,
    content: Array.isArray(entry.content)
      ? entry.content
      : entry.content.trim().split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0),
  }));
}

// Ancienne version brute avec type explicite (const + types littéraux)
export const oldChangelog = [
  {
    date: "2025-04-29",
    title: "Filter debuff logic and 1-2 star tier list",
    type: "feature",
    content: `
  - added 1 and 2 star heroes in tier list
  - Add EE and Burst skill buff and debuff in logic when filtering heroes on https://outerpedia.com/characters page
  `
  },
  {
    date: "2025-04-28",
    title: "Website Officially Release",
    type: "update",
    content: `
  - 🎉 Outerpedia is now officially live!
  - Includes **complete Tier List**, **full character database**, and **exclusive equipment** data.
  - Optimized for **desktop and mobile** with full **PWA** support (installable as an app).
  - Fast static generation with optimized SEO, structured data, and dynamic Open Graph images.
  - Modern responsive UI powered by **Next.js 15** and **TailwindCSS**.
  - Dynamic routing for character pages, tier list tabs, and equipment listings.
  - Full CDN support for images (characters, equipment, icons) ensuring fast load times.
  - Built-in changelog page and homepage recent updates feed to track improvements.
  `
  },
  {
    date: "2025-04-28",
    title: "All character data, Tier List & SEO Improvements",
    type: "feature",
    content: `
  - Refactored Tier List page to support dynamic tabs (DPS, Support, Sustain) via URL routing (/tierlist/[tab]).
  - Implemented static _allCharacters.json generated at each build to avoid API fetch in production.
  - Improved Tier List SEO metadata dynamically per tab and globally.
  - Added dynamic OpenGraph and Twitter Card images for all character pages based on character ID.
  - Enhanced structured description on character pages combining element, class, and subclass information.
  - Added dynamic meta keywords per character for better indexing.
  - Improved SEO script (seo-check.cjs) to validate JSON integrity and image presence, executed only in development mode.
  - Improved loading and priority hints for critical images (Tier List portraits, character icons).
  `
  },
  {
    date: "2025-04-26",
    title: "SEO, Mobile & PWA Improvements",
    type: "update",
    content: `
  - Improved SEO and OpenGraph metadata across all pages.
  - Generated sitemap.xml automatically at each deployment.
  - Added manifest.json and mobile icons for PWA support.
  - Optimized mobile layouts for Home and Navigation.
  - Fixed structured data validation warnings (Search Console OK).
  `
  },
  {
    date: "2025-04-25",
    title: "Exclusive Equipment Data Complete",
    type: "update",
    content: `
  - Added all exclusive equipment **data and images** for all characters.
  - Each EE includes full metadata (name, main stat, +0/+10 effects).
  - Added **dual-stat support** for weapons and amulets (forcedMainStat with \`/\` separator).
  - Displayed **both icons and stat values** properly in tooltips and summary cards.
  - Improved **WeaponMiniCard** and **AmuletMiniCard** components to support multiple main stats with fallback icons.
  - Implemented full **VideoGame + CreativeWork** **schema.org JSON-LD** structure on /equipments.
  - Included images for all **weapons**, **amulets**, **armor sets**, **talismans**, and **exclusive equipment** in JSON-LD.
  - Varied set images dynamically (**Helmet**, **Armor**, **Gloves**, **Shoes**) for realistic representation.
  - Added **automatic URL linking** for Exclusive Equipment to character pages in structured data.
  - Unified code structure between **weapon** and **amulet** components for easier maintenance.
  - Resolved Search Console critical errors by switching to proper **VideoGame** schema.
  - Internal tools: added a **JSON-LD preview button** for development validation.
  `
  },
  {
    date: "2025-04-24",
    title: "Character Additions",
    type: "update",
    content: `
  - Added character from Christina to Ember (39 / 101).
  `
  },
  {
    date: "2025-04-24",
    title: "Character Additions & Burn Visuals",
    type: "feature",
    content: `
  - Added **Charlotte**, **Caren**, and all characters from A to B to the character database.
  - Added the skill icon (top-left corner) on burn cards to match in-game visuals.
  - Fixed misalignment in **Luna** and **Hilde** awakening displays.
  - Corrected **Charisma Bryn**'s skill placement.
  - Added Open Graph metadata for the Equipment page and icons to the Characters list.
  `
  },
  {
    date: "2025-04-23",
    title: "New Characters & Visual Enhancements",
    type: "feature",
    content: `
  - Added **Luna**, **Hilde** and **Adelie** to the character database.
  - Updated the homepage banner with a new visual and smooth CSS masking.
  - Refined the style of the "Currently Pullable" section for a cleaner layout.
  `
  },
  {
    date: "2025-04-22",
    title: "Cleanup & UI Polish for Changelog and Updates",
    type: "update",
    content: `
  - Unified visual style between homepage and /changelog for update entries.
  - Styled changelog cards with badge colors for each update type (FEATURE, FIX, UPDATE...).
  - Markdown rendering enabled for changelog entries to support lists, links and formatting.
  - Homepage "Recent Updates" section uses a timeline-style vertical layout with animated section titles.
  - Removed all STOVE news integration attempts for maintainability reasons.
  `
  },
  {
    date: "2025-04-22",
    title: "Homepage & SEO improvements, gear note rework",
    type: "update",
    content: `
  - Improved homepage SEO and added Open Graph banner for social previews.
  - Added JSON-LD metadata to character and equipment pages.
  - Simplified gear notes format and now shows icons instead of star text.
  - Fixed issues with special characters in charm names.
  - Added sitemap, robots.txt, and SEO check scripts.
  `
  },
  {
    date: "2025-04-20",
    title: "Major Data Pipeline Update",
    type: "feature",
    content: "Automated extraction and parsing of in-game data from `.bytes` files. Character JSONs are now generated with full skill info (enhancements, chain/dual effects, buffs/debuffs), exclusive equipment (`ee.json`), and recommended gear (`data/reco/`). Character data (excluding gear reco) will go live in a few days!"
  },
  {
    date: "2025-04-13",
    title: "Official Discord Server",
    type: "feature",
    content: "The official Outerpedia Discord server is now live! [Join the community](https://discord.gg/keGhVQWsHv) to discuss builds, report issues, suggest improvements, and receive update notifications."
  },
  {
    date: "2025-04-12",
    title: "Weapon MiniCard Tooltip",
    type: "feature",
    content: "Added a detailed tooltip on weapon hover in the Recommended Gear section of character pages."
  },
  {
    date: "2025-04-12",
    title: "Skills Disclaimer",
    type: "update",
    content: "Added a disclaimer: 'Skills are displayed here with maximum enhancements applied.'"
  },
  {
    date: "2025-04-12",
    title: "Exclusive Equipment Level Fix",
    type: "fix",
    content: "Corrected display of Exclusive Equipment levels: 'EE: Lv. 10', not 'rank 10'."
  },
  {
    date: "2025-04-11",
    title: "Initial Changelog Setup",
    type: "feature",
    content: "Created a visual changelog page and linked it in the footer. Last 10 updates are now shown on the homepage."
  },
  {
    date: "2025-04-10",
    title: "Character Page Enhancements",
    type: "update",
    content: "Added chain and dual attack effects with icons based on character element."
  },
  {
    date: "2025-04-10",
    title: "Buff/Debuff Filters",
    type: "feature",
    content: "Implemented filter interface for buffs and debuffs with AND/OR logic and icon support."
  },
  {
    date: "2025-04-09",
    title: "Basic Equipment Filters",
    type: "fix",
    content: "Filtered out exclusive gear and talismans from the Equipment page. Only basic gear is shown."
  },
  {
    date: "2025-04-08",
    title: "Armor Set Visual Cards",
    type: "feature",
    content: "Introduced visual cards for armor sets with hover effects and custom backgrounds."
  }
] as const satisfies readonly {
  date: string;
  title: string;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string | string[];
}[];

// Changelog migré, typé, prêt à utiliser
export const changelog: ChangelogEntry[] = migrateChangelogEntries(oldChangelog);

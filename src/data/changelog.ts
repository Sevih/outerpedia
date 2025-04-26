export type ChangelogEntry = {
  date: string;
  title: string;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string;
};

export const changelog: ChangelogEntry[] = [
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
    date: '2025-04-22',
    title: 'Homepage & SEO improvements, gear note rework',
    type: 'update',
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
];

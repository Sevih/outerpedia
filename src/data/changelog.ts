export type ChangelogEntry = {
  date: string;
  title: string;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string;
};

export const changelog: ChangelogEntry[] = [
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
    content: "The official Outerpedia Discord server is now live! [Join the community](https://discord.gg/ESkqR8ta7y) to discuss builds, report issues, suggest improvements, and receive update notifications."
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

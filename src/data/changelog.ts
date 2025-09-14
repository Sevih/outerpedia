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
    date: "2025-08-26",
    title: "Premium & Limited Guide",
    type: "feature",
    content: [
      "Added the [Premium & Limited Guide](/guides/general-guides/premium-limited) : Quick recommendations for Premium and Limited banners.",
    ]
  },
  {
    date: "2025-08-23",
    title: "Skyward Tower Guide, Tags & Roles Filters",
    type: "feature",
    content: [
      "Added the [Skyward Tower Guide](/guides/skyward-tower)",
      "Introduced tag filters on the character list",
      "Introduced role filters on the character list",
      "Improved character sorting and browsing with the new filters"
    ]
  },
  {
    date: "2025-08-20",
    title: "Sharable Character Filters",
    type: "feature",
    content: [
      "- Character page filters (element, class, rarity, buffs/debuffs, etc.) are now encoded in the URL.",
      "- You can copy and share the link to directly show your filtered characters to others.",
    ],
  },
  {
    date: "2025-08-20",
    title: "Shop Guide Release",
    type: "feature",
    content: [
      "- Outerplane shop guide with purchase priorities — best items to buy, what to skip, and how to spend currencies wisely. Learn more [here](/guides/general-guides/shop-purchase-priorities)",
    ],
  },

  {
    date: "2025-08-19",
    title: "Shichifuja Update",
    type: "update",
    content: [
      "- [Joint boss Shichifuja](/guides/joint-boss/shichifuja) has been updated for August 2025 version.",
    ],
  },
  {
    date: "2025-08-13",
    title: "Planetary Control Unit Guild Raid",
    type: "update",
    content: [
      "- Planetary Control Unit Guild Raid Guide release. learn more [here](/guides/guild-raid/planetary-control-unit)",
    ],
  },
  {
    date: "2025-08-09",
    title: "OUTERPLANE Service Transfer to VAGAMES",
    type: "update",
    content: [
      "-  📢 <strong>Service Transfer Incoming:</strong> OUTERPLANE will transfer to <strong>VAGAMES</strong> on <strong>September 23, 2025</strong>.",
      "- Make sure to complete the transfer process to keep your account and data.",
      "- [View Transfer Procedure](/guides/service-transfer)",
    ],
  },
  {
    date: "2025-07-31",
    title: "Timegated Resources Guide",
    type: "feature",
    content: [
      "- Complete guide to Outerplane’s timegated resources — skill books, transistones, special gear materials, and glunite sources. Learn More [here](/guides/general-guides/timegate-resource)",
    ],
  },
  {
    date: "2025-07-29",
    title: "Revenant Dragon Harshna update",
    type: "update",
    content: [
      "- Guide is up to date for july 2025 version. Learn More [here](/guides/world-boss/harshna)",
    ],
  },
  {
    date: "2025-07-29",
    title: "New Hero Fran",
    type: "update",
    content: [
      "- Fran, a genius gamer who grants Counterattack to all allies and reduces all of the Unique Resource count on the target.",
      "- Learn More [here](/characters/fran)",
    ],
  },
  {
    date: "2025-07-23",
    title: "Deep Sea Guardian Update",
    type: "update",
    content: [
      "- [Joint boss Deep Sea Guardian](/guides/joint-boss/deep-sea-guardian) has been updated for July 2025 version.",
    ],
  },
  {
    date: "2025-07-16",
    title: "Dignity of the Golden Kingdom Guild Raid",
    type: "update",
    content: [
      "- Dignity of the Golden Kingdom Guild Raid Guide release. learn more [here](/guides/guild-raid/dignity-of-the-golden-kingdom)",
    ],
  },
  {
    date: "2025-07-01",
    title: "Archdemon of Hubris Dahlia update",
    type: "update",
    content: [
      "- Guide is up to date for july 2025 version. Learn More [here](/guides/world-boss/dahlia)",
    ],
  },
  {
    date: "2025-06-24",
    title: "Tier List major change",
    type: "fix",
    content: [
      "- 1-2★ heroes were intended to be ranked separately from 3★. To improve readability and avoid confusion all 1-2★ heroes were demoted one tier to better reflect their actual performance.",
    ],
  },
  {
    date: "2025-06-24",
    title: "Annihilator Update",
    type: "update",
    content: [
      "- [Joint boss Annihilator](/guides/joint-boss/annihilator)  has been updated for June 2025 version.",
    ],
  },
  {
    date: "2025-06-19",
    title: "Prevent World Alteration Guild Raid",
    type: "update",
    content: [
      "- Prevent World Alteration Guild Raid Guide release. learn more [here](/guides/guild-raid/prevent-world-alteration)",
    ],
  },
  {
    date: "2025-06-17",
    title: "New Hero Liselotte",
    type: "update",
    content: [
      "- Liselotte, a genius magician who increases barrier and defense when an ally uses an attack that targets all enemies and fights by removing debuffs and reducing cooldowns.",
      "- Learn More [here](/characters/liselotte)",
    ],
  },
  {
    date: "2025-06-15",
    title: "Character Profiles",
    type: "feature",
    content: [
      "- Character pages now include detailed profile info: birthday, height, weight, and lore.",
    ],
  },
  {
    date: "2025-06-14",
    title: "Quirk guide",
    type: "feature",
    content: [
      "- Learn how to efficiently enhance your heroes with the Quirk system: upgrade paths, recommended priorities, and required materials. Learn More [here](/guides/general-guides/quirk)",
    ],
  },
  {
    date: "2025-06-11",
    title: "Added base stats, gift preferences, and promo code display",
    type: "feature",
    content: [
      "-Character pages now display base stats",
      "-Gift preferences are now shown on character pages and can be used as a filter in the character list",
      "-Promo codes are now visible on the homepage (only valid ones) and fully listed on the [/coupons](/coupons) page",
    ],
  },
  {
    date: "2025-06-09",
    title: "Statistics & Combat Basics and Promotion : Monad Eva guides now available",
    type: "update",
    content: [
      "- Statistics & Combat Basics : Fundamental systems, mechanics, and beginner-friendly guides that apply to the entire game. Learn More [here](/guides/general-guides/stats)",
      "- Promotion Monad Eva : Boss strategy guide. Learn More [here](/guides/adventure-license/prom-meva)",
    ],
  },
  {
    date: "2025-06-04",
    title: "Walking Fortress Venion update",
    type: "update",
    content: [
      "- Guide is up to date for june 2025 version. Learn More [here](/guides/world-boss/venion)",
    ],
  },
  {
    date: "2025-05-30",
    title: "Hero Growth & Gear guides",
    type: "update",
    content: [
      "- Hero Growth guide : A complete breakdown of how to power up your heroes efficiently. Learn More [here](/guides/general-guides/heroes-growth)",
      "- Gear guide : A guide to gear types, upgrades, and how to make your equipment stronger. Learn More [here](guides/general-guides/gear)",
    ],
  },
  {
    date: "2025-05-27",
    title: "Knight of Hope Meteos guide",
    type: "update",
    content: [
      "- Learn More [here](/guides/joint-boss/koh-meteos)",
    ],
  },
  {
    date: "2025-05-26",
    title: "Adventure Guide Release",
    type: "update",
    content: [
      "- Guides are grouped by season (S1, S2, S3...) and follow the in-game progression",
      "- Spoiler-Free mode is enabled by default",
      "- You can reveal boss names and details by disabling Spoiler-Free mode",
      "- Explore now: [Adventure Guides](/guides/adventure)",
    ],
  },
  {
    date: "2025-05-25",
    title: "Guides updated: New entries in the General section",
    type: "feature",
    content: [
      "- Banners & Mileage System guide : learn more [here](/guides/general-guides/banner-mileage)",
      "- Daily Stamina Burn guide : learn more [here](/guides/general-guides/daily-stamina)",
    ],
  },
  {
    date: "2025-05-22",
    title: "Skill Chain Filter & Fix",
    type: "feature",
    content: [
      "- Add Skill Chain type Filter on Character page",
      "- Add Notice on Tier List PvE & PvP",
      "- Frost Legion P2 skills overview",
    ],
  },
  {
    date: "2025-05-21",
    title: "Skill Upgrade Priority",
    type: "feature",
    content: [
      "- Add Skill Upgrade Priority section in character's pages",
    ],
  },
  {
    date: "2025-05-21",
    title: "D.luna gear reco & Frost Legion Phase 1 guide",
    type: "feature",
    content: [
      "- Add gear recommandation for Demiurge Luna",
      "- Add guide for current guild raid Frost Legion Phase 1",
    ],
  },
  {
    date: "2025-05-20",
    title: "Demiurge Luna",
    type: "update",
    content: [
      "- Demiurge Luna, a versatile Hero who deals heavy single-target damage to enemies and excels at multi-target damage is now live.",
      "- Learn More [here](/characters/demiurge-luna)",
    ],
  },
  {
    date: "2025-05-19",
    title: "Gear Usage Finder",
    type: "feature",
    content: [
      "- Unsure which character can use your gear? This tool helps you find the best match based on equipment.",
      "- This tool is still under development — results may be incomplete or imprecise. Use it as a guide, not as a final answer.",
      "- [Learn more](/gear-solver)",
    ],
  },
  {
    date: "2025-05-19",
    title: "Gear Usage Statistics",
    type: "feature",
    content: [
      "- Discover the most recommended weapons, amulets and sets in Outerplane builds.",
      "- [Learn more](/gear-usage-stats)",
    ],
  },
  {
    date: "2025-05-17",
    title: "New guide - Understanding Free Heroes & Starter Banners",
    type: "feature",
    content: [
      "- Learn which heroes you’ll get for free in Outerplane and how to make the best choices from the Start. [Read the guide here](/guides/general-guides/free-heroes-start-banner)",
    ],
  },
  {
    date: "2025-05-16",
    title: "5★ item support",
    type: "feature",
    content: [
      "- Add 5★ items from event shop from event shop",
      "- Name and Rarity filters has been added on the Equipments Page"
    ],
  },
  {
    date: "2025-05-14",
    title: "PvP Tier List",
    type: "feature",
    content: [
      "- PvP tier list add updated with O. Nadja",
    ],
  },
  {
    date: "2025-05-14",
    title: "Adventure License ,Gear Boss & Irregular Pursuit Guides",
    type: "feature",
    content: [
      "- All Gear Boss guides are now live",
      "- All Adventure License guides are now live",
      "- All Irregular Pursuit guides are now live",
      "- Agile Respond has been added to the filters on the Characters page",
    ],
  },
  {
    date: "2025-05-07",
    title: "New hero - Nadja",
    type: "update",
    content: [
      "- Omega Nadja, who removes enemy Detonation damage and Priority increase effects, plays an important role in various boss battles and will be joining us.",
    ],
  },
  {
    date: "2025-05-05",
    title: "Add guide",
    type: "update",
    content: [
      "- Some guide were add like world boss and RGB special request",
    ],
  },
  {
    date: "2025-05-01",
    title: "Multi Select",
    type: "feature",
    content: [
      "- Add the option to select multple element, class, rarity on tier list, ee priority and character page",
    ],
  },
  {
    date: "2025-04-30",
    title: "Exclusive Equipment Priority",
    type: "feature",
    content: [
      "- Add Exclusive Equipment Priority Tier List",
      "- Add filter by Element and Class on Tier list",
    ],
  },
  {
    date: "2025-04-30",
    title: "Legal compliance update",
    type: "fix",
    content: [
      "- Added global disclaimer about intellectual property and unofficial status.",
      "- Created a dedicated `/legal` page with hosting information and takedown policy.",
      "- Confirmed the site does not collect personal data or include monetization.",
    ],
  },
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

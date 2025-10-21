import type { TenantKey } from '@/tenants/config'


// --- types/helpers localisation (comme montré précédemment) ---
type LString = string | { en: string; jp?: string; kr?: string };
const resolveL = (s: LString, key: TenantKey) =>
  typeof s === 'string' ? s : (s[key] ?? s.en);
const toLines = (v: string | string[]) =>
  Array.isArray(v) ? v : v.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

export type ChangelogEntry = {
  date: string;
  title: string;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string[];
  url?: string;
};

type RawEntry = {
  date: string;
  title: LString;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string | string[] | LString[];
  url?: string;
};

// Ancienne version brute avec type explicite (const + types littéraux)
export const oldChangelog = [
  {
    date: "2025-10-21",
    title: {
      en: "Most Used Units in Guides",
      jp: "ガイドで最も使用されているユニット",
      kr: "가이드에서 가장 많이 사용되는 유닛",
    } as LString,
    type: "feature",
    url: "/most-used-unit",
    content: [
      {
        en: "🔍 **New Tool Available** – Discover which heroes are most frequently recommended across all Outerpedia guides.",
        jp: "🔍 **新ツール公開** – すべてのOuterpediaガイドで最も頻繁に推奨されているヒーローを発見しましょう。",
        kr: "🔍 **새로운 도구 출시** – 모든 Outerpedia 가이드에서 가장 자주 추천되는 영웅을 찾아보세요.",
      } as LString,
      {
        en: "🎯 Filter by category, element, class, rarity, and toggle limited units.",
        jp: "🎯 カテゴリー、属性、クラス、レアリティでフィルタリングし、限定ユニットを切り替えることができます。",
        kr: "🎯 카테고리, 속성, 클래스, 레어도로 필터링하고 한정 유닛을 전환할 수 있습니다.",
      } as LString,
      {
        en: "🆓 **Free Unit tag** now available on character pages and tier lists.",
        jp: "🆓 **無料ユニットタグ**がキャラクターページとティアリストで利用可能になりました。",
        kr: "🆓 **무료 유닛 태그**가 캐릭터 페이지와 티어 리스트에서 이용 가능합니다.",
      } as LString,
    ],
  },
  {
    date: "2025-10-15",
    title: {
      en: "Outerpedia Update – October 2025",
      jp: "Outerpediaアップデート – 2025年10月",
      kr: "Outerpedia 업데이트 – 2025년 10월",
    } as LString,
    type: "update",
    content: [
      {
        en: "A major update focused on **item pages** and **multilingual support**!",
        jp: "**アイテムページ**と**多言語対応**に焦点を当てた大型アップデート！",
        kr: "**아이템 페이지**와 **다국어 지원**에 초점을 맞춘 대형 업데이트!",
      } as LString,
      {
        en: "🌍 **Multilingual Expansion** – All item pages (Weapons, Accessories, Sets) are now fully available in **English, Japanese, and Korean**.",
        jp: "🌍 **多言語拡張** – すべてのアイテムページ（武器・アクセサリー・セット）が**英語・日本語・韓国語**に完全対応しました。",
        kr: "🌍 **다국어 확장** – 모든 아이템 페이지(무기, 액세서리, 세트)가 이제 **영어, 일본어, 한국어**로 완전히 제공됩니다.",
      } as LString,
      {
        en: "⚔️ **Equipment Overhaul** – Complete visual rework of the database pages for a cleaner, unified look.",
        jp: "⚔️ **装備リニューアル** – データベースページのデザインを全面的に一新し、より統一感のあるビジュアルに。",
        kr: "⚔️ **장비 개편** – 데이터베이스 페이지의 비주얼을 전면적으로 새롭게 개선했습니다.",
      } as LString,
    ],
  },
  {
    date: "2025-10-01",
    title: {
      en: "New Hero Summer Knight's Dream Ember",
      jp: "新ヒーロー Summer Knight's Dream Ember",
      kr: "신규 영웅 Summer Knight's Dream Ember",
    } as LString,
    type: "update",
    url: "/characters/summer-knight-s-dream-ember",
    content: [
      {
        en: "- The seasonal Limited Hero **Summer Knight's Dream Ember** has arrived in OUTERPLANE!",
        jp: "- 季節限定ヒーロー **Summer Knight's Dream Ember** がOUTERPLANEに登場！",
        kr: "- 시즌 한정 영웅 **Summer Knight's Dream Ember** 가 OUTERPLANE에 등장했습니다!",
      } as LString,
      {
        en: "- She inflicts **fixed damage on bosses** and grants **Penetration** and **Priority** buffs to her allies.",
        jp: "- ボスに**固定ダメージ**を与え、味方に**貫通**と**優先権**バフを付与します。",
        kr: "- 보스에게 **고정 피해**를 입히고 아군에게 **관통** 및 **우선권** 버프를 부여합니다.",
      } as LString,
    ],
  },
  {
    date: "2025-09-30",
    title: {
      en: "Multilingual support (WIP)",
      jp: "多言語対応（進行中）",
      kr: "다국어 지원(진행 중)",
    } as LString,
    type: "update",
    content: [
      {
        en: "- Started implementing multi-language support. A **Language** selector is now available in the header and keeps your current page when switching (en/jp/kr).",
        jp: "- 多言語対応の実装を開始しました。ヘッダーに**言語**セレクターを追加し、切り替えても現在のページを維持します（en/jp/kr）。",
        kr: "- 다국어 지원 구현을 시작했습니다. 헤더에 **언어** 선택기가 추가되었고 전환 시 현재 페이지를 유지합니다(en/jp/kr).",
      } as LString,
      {
        en: "- Initial localization is live for homepage SEO and the changelog. More pages will roll out progressively.",
        jp: "- まずはホームページのSEOと変更履歴でローカライズを公開しました。ほかのページも順次対応します。",
        kr: "- 첫 로컬라이제이션은 홈페이지 SEO와 변경 로그에 적용되었습니다. 다른 페이지도 순차적으로 적용됩니다.",
      } as LString,
      {
        en: "- Work in progress. Please report issues on Discord.",
        jp: "- 作業中のため、一部のテキストは英語のままです。問題があればDiscordでお知らせください。",
        kr: "- 작업 진행 중이므로 일부 텍스트는 아직 영어입니다. 문제는 Discord로 알려 주세요.",
      } as LString,
    ],
  },
  {
    date: "2025-09-27",
    title: "Gacha Pull Simulator & Utilities rename",
    type: "feature",
    url: "/pull-sim",
    content: [
      "- New **Gacha Pull Simulator**: simulate Rate Up, Premium, and Limited banners with the mileage system.",
      "- Renamed the **Tools** category to **Utilities** (URL stays `/tools`) and aligned page metadata for SEO."
    ],
  },
  {
    date: "2025-09-25",
    title: "Official Video",
    type: "feature",
    content: [
      "- Official YouTube videos are now embedded on character detail pages (when available).",
    ],
  },
  {
    date: "2025-09-24",
    title: "Ether Income Guide",
    type: "feature",
    url: "/guides/general-guides/ether-income",
    content: [
      "Added the **Ether Income Guide**: overview of all regular and variable sources of Ether in Outerplane, with daily, weekly, and monthly totals.",
    ]
  },
  {
    date: "2025-08-26",
    title: "Premium & Limited Guide",
    type: "feature",
    url: "/guides/general-guides/premium-limited",
    content: [
      "Added the **Premium & Limited Guide**: Quick recommendations for Premium and Limited banners.",
    ]
  },
  {
    date: "2025-08-23",
    title: "Skyward Tower Guide, Tags & Roles Filters",
    type: "feature",
    url: "/guides/skyward-tower",
    content: [
      "Added the **Skyward Tower Guide**",
      "Introduced tag filters on the character list",
      "Introduced role filters on the character list",
      "Improved character sorting and browsing with the new filters"
    ]
  },
  {
    date: "2025-08-20",
    title: "Sharable Character Filters",
    type: "feature",
    url: "/characters",
    content: [
      "- Character page filters (element, class, rarity, buffs/debuffs, etc.) are now encoded in the URL.",
      "- You can copy and share the link to directly show your filtered characters to others.",
    ],
  },
  {
    date: "2025-08-20",
    title: "Shop Guide Release",
    type: "feature",
    url: "/guides/general-guides/shop-purchase-priorities",
    content: [
      "- Outerplane **shop guide** with purchase priorities — best items to buy, what to skip, and how to spend currencies wisely.",
    ],
  },

  {
    date: "2025-08-19",
    title: "Shichifuja Update",
    type: "update",
     url: "/guides/joint-boss/shichifuja",
    content: [
      "- Joint boss Shichifuja has been updated for August 2025 version.",
    ],
  },
  {
    date: "2025-08-13",
    title: "Planetary Control Unit Guild Raid",
    type: "update",
     url: "/guides/guild-raid/planetary-control-unit",
    content: [
      "- Planetary Control Unit Guild Raid Guide release.",
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
    url: "/guides/general-guides/timegate-resource",
    content: [
      "- Complete guide to Outerplane’s timegated resources — skill books, transistones, special gear materials, and glunite sources.",
    ],
  },
  {
    date: "2025-07-29",
    title: "Revenant Dragon Harshna update",
    type: "update",
    url: "/guides/world-boss/harshna",
    content: [
      "- Guide is up to date for july 2025 version. Learn More",
    ],
  },
  {
    date: "2025-07-29",
    title: "New Hero Fran",
    type: "update",
    url: "/characters/fran",
    content: [
      "- Fran, a genius gamer who grants Counterattack to all allies and reduces all of the Unique Resource count on the target.",
    ],
  },
  {
    date: "2025-07-23",
    title: "Deep Sea Guardian Update",
    type: "update",
    url :"/guides/joint-boss/deep-sea-guardian",
    content: [
      "- Joint boss Deep Sea Guardian has been updated for July 2025 version.",
    ],
  },
  {
    date: "2025-07-16",
    title: "Dignity of the Golden Kingdom Guild Raid",
    type: "update",
    url:"/guides/guild-raid/dignity-of-the-golden-kingdom",
    content: [
      "- Dignity of the Golden Kingdom Guild Raid Guide release.",
    ],
  },
  {
    date: "2025-07-01",
    title: "Archdemon of Hubris Dahlia update",
    type: "update",
    url:"/guides/world-boss/dahlia",
    content: [
      "- Guide is up to date for july 2025 version.",
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
    url:"/guides/joint-boss/annihilator",
    content: [
      "- Joint boss Annihilator  has been updated for June 2025 version.",
    ],
  },
  {
    date: "2025-06-19",
    title: "Prevent World Alteration Guild Raid",
    type: "update",
    url:"/guides/guild-raid/prevent-world-alteration",
    content: [
      "- Prevent World Alteration Guild Raid Guide release.",
    ],
  },
  {
    date: "2025-06-17",
    title: "New Hero Liselotte",
    type: "update",
    url:"/characters/liselotte",
    content: [
      "- Liselotte, a genius magician who increases barrier and defense when an ally uses an attack that targets all enemies and fights by removing debuffs and reducing cooldowns.",
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
    url:"/guides/general-guides/quirk",
    content: [
      "- Learn how to efficiently enhance your heroes with the Quirk system: upgrade paths, recommended priorities, and required materials.",
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
      "- [Statistics & Combat Basics](/guides/general-guides/stats) : Fundamental systems, mechanics, and beginner-friendly guides that apply to the entire game.",
      "- [Promotion Monad Eva](/guides/adventure-license/prom-meva) : Boss strategy guide.",
    ],
  },
  {
    date: "2025-06-04",
    title: "Walking Fortress Venion update",
    type: "update",
    url:"/guides/world-boss/venion",
    content: [
      "- Guide is up to date for june 2025 version.",
    ],
  },
  {
    date: "2025-05-30",
    title: "Hero Growth & Gear guides",
    type: "update",
    content: [
      "- [Hero Growth guide](/guides/general-guides/heroes-growth) : A complete breakdown of how to power up your heroes efficiently.",
      "- [Gear guide](guides/general-guides/gear) : A guide to gear types, upgrades, and how to make your equipment stronger.",
    ],
  },
  {
    date: "2025-05-27",
    title: "Knight of Hope Meteos guide",
    type: "update",
    url:"/guides/joint-boss/koh-meteos",
    content: [
      "- Guide update for May 2025.",
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
      "- [Banners & Mileage System](/guides/general-guides/banner-mileage) guide release.",
      "- [Daily Stamina Burn](/guides/general-guides/daily-stamina) guide release.",
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
    url:"/characters/demiurge-luna",
    content: [
      "- Demiurge Luna, a versatile Hero who deals heavy single-target damage to enemies and excels at multi-target damage is now live.",
    ],
  },
  {
    date: "2025-05-19",
    title: "Gear Usage Finder",
    type: "feature",
    url:"/gear-solver",
    content: [
      "- Unsure which character can use your gear? This tool helps you find the best match based on equipment.",
      "- This tool is still under development — results may be incomplete or imprecise. Use it as a guide, not as a final answer.",
    ],
  },
  {
    date: "2025-05-19",
    title: "Gear Usage Statistics",
    type: "feature",
    url:"/gear-usage-stats",
    content: [
      "- Discover the most recommended weapons, amulets and sets in Outerplane builds.",
    ],
  },
  {
    date: "2025-05-17",
    title: "New guide - Understanding Free Heroes & Starter Banners",
    type: "feature",
    url:"/guides/general-guides/free-heroes-start-banner",
    content: [
      "- Learn which heroes you’ll get for free in Outerplane and how to make the best choices from the Start.",
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
    content: "The official Outerpedia Discord server is now live! [Join the community](https://discord.com/invite/keGhVQWsHv) to discuss builds, report issues, suggest improvements, and receive update notifications."
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
] as const satisfies readonly RawEntry[];

// Fonction unifiée pour accéder au changelog
export function getChangelog(lang: TenantKey, options?: { limit?: number }) {
  const entries = (oldChangelog as readonly RawEntry[]).map(e => {
    const title = resolveL(e.title, lang);
    const list = Array.isArray(e.content) ? e.content : toLines(e.content);
    const content = list.map(item => resolveL(item as LString, lang));
    return {
      date: e.date,
      title,
      type: e.type,
      content,
      url: e.url  // ✅ URL spécifique à l'entrée (optionnel)
    };
  });

  return options?.limit ? entries.slice(0, options.limit) : entries;
}

// Legacy function (deprecated - use getChangelog instead)
export function getChangelogFor(lang: TenantKey): ChangelogEntry[] {
  return getChangelog(lang);
}
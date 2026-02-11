![Next.js](https://img.shields.io/badge/Next.js-15.5.9-blue?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.4-38bdf8?logo=tailwindcss)

# Outerpedia

> A comprehensive, multilingual companion wiki and toolkit for Outerplane - built with Next.js 15 and TypeScript

**Outerpedia** is a fan-made, community-driven database for **Outerplane**, the turn-based mobile RPG developed by VA Games and published by Major9. It provides comprehensive information about characters, equipment, guides, tier lists, and various utility tools to help players optimize their gameplay experience.

### Live Sites

- **English**: [outerpedia.com](https://outerpedia.com)
- **Japanese**: [jp.outerpedia.com](https://jp.outerpedia.com)
- **Korean**: [kr.outerpedia.com](https://kr.outerpedia.com)
- **Chinese (Simplified)**: [zh.outerpedia.com](https://zh.outerpedia.com)

**Community:** [Join the EvaMains Discord](https://discord.com/invite/keGhVQWsHv)

---

## Features

### Character Database (114 Characters)
- Complete character information including stats, skills, and abilities
- Detailed skill descriptions with cooldowns and wave gain rates
- Exclusive Equipment (EE) data with effects and ranks
- Transcendence progression (levels 1-6 with multiplayer transcends at 4 & 5)
- Recommended gear sets for PvE and PvP
- Buffs/debuffs provided by each character
- Voice actor information (localized per language)
- Pro/Cons editorial analysis

### Equipment System
- Full catalog of weapons, armor, amulets, and accessories
- Advanced filtering by type, rarity, set bonuses
- Gear set recommendations per character
- Substat mapping and optimization data
- Set bonus information

### Tier Lists
- **PvE Tier List**: Character rankings for story/adventure content
- **PvP Tier List**: Character rankings for Arena/competitive modes
- Evaluation based on 6-star transcended characters with level 0 EE
- Filtering by element, class, and role

### Guides (90+ Guides)
- **Categories**: Adventure, Adventure License, General, Guild Raid, Irregular Extermination, Joint Boss, Monad Gate, Skyward Tower, Special Request, World Boss
- Comprehensive how-to-play guides
- Boss strategies and team compositions
- Event walkthroughs
- All guides support multi-language content

### Utility Tools (14 Tools)
1. **Pull Simulator** - Gacha/banner simulation
2. **Gear Solver** - Equipment optimization tool
3. **EE Priority Calculator** - Exclusive Equipment upgrade planning
4. **Gear Usage Stats** - Character gear popularity analysis
5. **Most Used Unit** - Meta analysis
6. **Interactive Tier Lists** - PvE & PvP rankings with filtering
7. **Coupon Codes** - Active coupon code manager with copy functionality
8. **Patch History** - Version changelog tracking
9. **Team Planner** - Team composition builder with chain logic and image export
10. **Progress Tracker** - Player progression tracking
11. **Event Calendar** - Upcoming and ongoing events
12. **OST Player** - In-game music player
13. **Wallpapers** - Character wallpaper gallery

### Technical Features
- Lightning Fast - Static generation with ISR, Cloudflare CDN with global edge network
- Fully Multilingual - Type-safe i18n support (EN, JP, KR, ZH) with subdomain-based routing
- PWA Support - Install as an app with offline capabilities
- Modern UI - Tailwind CSS 4.1 with custom animations (Framer Motion)
- SEO Optimized - Dynamic meta tags, JSON-LD, hreflang tags, multi-language sitemaps
- Accessible - ARIA labels, semantic HTML, keyboard navigation

---

## Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.5.9 | App Router, RSC, ISR |
| [React](https://react.dev/) | 19.0 | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type Safety (Strict Mode) |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.4 | Utility-First Styling (CSS-based config) |
| [Framer Motion](https://www.framer.com/motion/) | 12.18 | Animations |

### UI Components & Libraries
- **Radix UI** - Accessible primitives (Select, Popover, Tooltip, HoverCard)
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Keen Slider** - Touch slider component
- **Markdown-it** / **Marked** - Markdown rendering
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Linting with Next.js config
- **tsx** / **ts-node** - TypeScript execution
- **Sharp** - Image processing
- **Cheerio** / **JSDOM** - HTML parsing
- **Fast-glob** - File pattern matching

---

## Multi-Language Architecture

Outerpedia features a **type-safe, subdomain-based multi-tenant architecture** designed for scalability and minimal friction when adding new languages.

### Supported Languages
- **English** (`en`) - Default
- **Japanese** (`jp`)
- **Korean** (`kr`)
- **Chinese Simplified** (`zh`)

### How It Works

1. **Subdomain Detection**: Each language runs on its own subdomain (e.g., `jp.outerpedia.com`)
2. **Tenant Configuration**: Centralized config in [src/tenants/config.ts](src/tenants/config.ts)
3. **Translation Files**: Locale files in [src/i18n/locales/](src/i18n/locales/)
4. **Type Safety**: Fully typed translation keys with autocomplete
5. **Localized Data**: Data fields support `_jp`, `_kr`, `_zh` suffixes (e.g., `Fullname_jp`)

### Translation System

**Server-Side**:
```typescript
import { getServerI18n } from '@/lib/contexts/server-i18n'

const { t } = await getServerI18n(langKey)
t('nav.characters') // Returns translated string
t('template.{var}', { var: 'value' }) // With interpolation
```

**Client-Side**:
```typescript
import { useI18n } from '@/lib/contexts/I18nContext'

const { t, setLang } = useI18n()
t('chars.meta.title')
```

### Adding a New Language

Only **3 files** need to be modified:

1. Add language key to `TenantKey` type in [src/tenants/config.ts](src/tenants/config.ts)
2. Add tenant configuration object with domain, locale, and theme
3. Create translation file `src/i18n/locales/xx.ts`

All types and field names auto-generate!

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Sevih/outerpedia.git
cd outerpedia

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

The app will be available at:
- Local EN: `https://outerpedia.local/`
- Local JP: `https://jp.outerpedia.local/`
- Local KR: `https://kr.outerpedia.local/`
- Local ZH: `https://zh.outerpedia.local/`

### Development Scripts

```bash
# Core
npm run dev              # Start development server (with WebP watcher)
npm run build            # Full production build (prebuild + next build)
npm run start            # Start production server
npm run lint             # Run ESLint

# Data generation (run automatically via prebuild)
npm run generate:allchar       # Index all character files
npm run generate:slugToChar    # Create URL slug mappings
npm run generate:gear-stats    # Calculate gear usage statistics
npm run generate:gear-submap   # Generate substat mappings
npm run generate:guide-chars   # Extract recommended characters per guide
npm run gen:events             # Generate event registry
npm run gen:pool               # Generate banner/gacha pool data
npm run build:effects          # Build effect icon index
npm run gen:effect-types       # Generate effect type definitions
npm run gen:news-cache         # Generate news article cache

# Wallpapers (from datamine)
npm run gen:wallpapers         # Regenerate wallpaper JSON
npm run gen:wallpapers:full    # Extract + dedupe + copy wallpapers
npm run gen:wallpapers:scan    # Dry run (preview only)
npm run gen:wallpapers:check   # Find duplicates in public/

# Validation
npm run guide:check            # Analyze guide format and localization
npm run raid:validate          # Validate raid data
npm run validate:effects       # Validate effect references
npm run validate:build         # Check build output integrity

# SEO
npm run seo:audit              # Audit SEO configuration

# News
npm run check:news             # Scrape VA notices + optimize titles

# Boss / Raid
npm run boss:add-buff-debuff   # Add buff/debuff data to boss
npm run boss:copy-buff-debuff  # Copy buff/debuff between bosses

# BGM
npm run bgm:merge              # Merge BGM intro data

# Git
npm run commit                 # Git commit (no changelog)
npm run commit:fast            # Git commit (skip build)
npm run commit:dry             # Dry run (preview commit)
```

---

## Build Process

The production build runs a comprehensive pipeline:

```bash
npm run build
```

This executes:
1. Clean `.next` cache
2. Update app version
3. Generate event registry
4. Inject service worker version
5. Generate character index
6. Create URL slug mappings
7. Calculate gear statistics
8. Extract guide characters
9. Generate pool data
10. Build substat mapping
11. Build effect index
12. Generate effect types
13. Generate news cache
14. Validate effects
15. Generate boss index
16. Generate wallpaper metadata
17. Next.js production build

---

## API Endpoints

Base path: `/api`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/characters` | GET | Fetch all characters |
| `/characters-lite` | GET | Lightweight character list (no skills) |
| `/pull-sim` | GET/POST | Pull simulator gacha logic |
| `/pull-sim/chars` | GET | Characters available for pulling |
| `/reco/[name]` | GET | Character gear recommendations |
| `/tenant` | GET | Current tenant info (lang, domain) |
| `/team/save` | POST | Save team composition |
| `/team/[id]` | GET | Retrieve saved team |
| `/news/search` | GET | Search news articles |
| `/youtube-thumbnail/[videoId]` | GET | Proxy YouTube thumbnails |
| `/admin/status` | GET | Admin dashboard status |
| `/admin/assets/*` | POST | Asset management (verify, download, copy) |
| `/admin/run-script` | POST | Execute build scripts |
| `/admin/list-available` | GET | List available characters |
| `/admin/buffs-verify` | GET | Verify buff/debuff data |
| `/admin/raw-files` | GET | Access raw data files |
| `/admin/monad-route` | GET | Monad gate route data |

---

## SEO & Metadata

Outerpedia is optimized for search engines with:

- **Dynamic Meta Tags**: Per-page metadata with i18n support
- **JSON-LD Structured Data**: Rich search results
- **Breadcrumb Navigation**: Hierarchical structure
- **hreflang Tags**: Language/region alternates
- **Open Graph**: Social media previews
- **Twitter Cards**: Social sharing optimization
- **Sitemaps**: Dynamic, language-aware sitemaps for all supported languages

---

## Performance Optimizations

- **Cloudflare CDN**: Global content delivery network for reduced latency worldwide
- **ISR (Incremental Static Regeneration)**: For guides and character pages
- **React Server Components**: Reduced client-side JavaScript
- **Image Optimization**: WebP/AVIF formats
- **Code Splitting**: Automatic route-based splitting
- **Service Worker**: PWA support with offline capabilities
- **Font Loading**: Optimized Google Fonts with `display: swap`
- **HTTP/3 & Early Hints**: Modern protocol optimizations
- **Brotli Compression**: Automatic content compression via CDN

---

## Project Structure

```
outerpedia/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (tools)/             # Utility tools (14 total)
│   │   ├── admin/               # Administrative pages
│   │   ├── api/                 # API routes (19 endpoints)
│   │   ├── characters/          # Character pages
│   │   ├── equipments/          # Equipment pages
│   │   ├── guides/              # Guide system (90+ guides)
│   │   ├── tierlist/            # Tier list pages
│   │   ├── changelog/           # Update log
│   │   └── layout.tsx           # Root layout
│   │
│   ├── components/              # 179 React components
│   │   ├── layout/              # Header, Footer
│   │   ├── guides/              # Guide-specific components
│   │   ├── boss/                # Boss display components
│   │   ├── guild-raid/          # Guild raid components
│   │   └── ...
│   │
│   ├── data/                    # Game data (JSON)
│   │   ├── char/                # 114 character files
│   │   ├── boss/                # Boss data files
│   │   ├── raids/               # Guild raid data
│   │   ├── reco/                # Gear recommendations
│   │   ├── _allCharacters.json  # Generated character index
│   │   └── ...
│   │
│   ├── i18n/                    # Internationalization
│   │   ├── locales/             # Translation files (EN, JP, KR, ZH)
│   │   └── index.ts             # Message loader
│   │
│   ├── lib/                     # Utilities & helpers
│   │   ├── contexts/            # React contexts (i18n, tenant)
│   │   ├── localize.ts          # Localization helpers
│   │   ├── seo.ts               # SEO utilities
│   │   └── ...
│   │
│   ├── tenants/                 # Multi-tenant system
│   │   ├── config.ts            # Tenant definitions
│   │   └── tenant.server.ts     # Server detection
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── character.ts
│   │   ├── equipment.ts
│   │   ├── team-planner.ts
│   │   └── ...
│   │
│   └── utils/                   # Utility functions
│
├── scripts/                     # Build & maintenance scripts (38 files)
│   ├── prebuild.js              # Orchestrates all pre-build steps
│   ├── generateAllCharacters.ts
│   └── ...
│
├── public/                      # Static assets
│   ├── images/
│   ├── event/
│   └── manifest.json            # PWA manifest
│
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript strict config
├── tailwind.config.js           # Tailwind CSS config
└── package.json                 # Dependencies & scripts
```

---

## Contributing

Contributions are welcome! This is a community-driven project.

### How to Contribute

Join the [EvaMains Discord](https://discord.com/invite/keGhVQWsHv) to discuss contributions, report issues, or suggest features. All contributions are coordinated through the community Discord.

### Adding New Characters

1. Create a new JSON file in `src/data/char/`
2. Follow the structure of existing character files
3. Include localized fields (`_jp`, `_kr`, `_zh`)
4. Run `npm run generate:allchar` to update the index

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint rules (no warnings)
- Write semantic, accessible HTML
- Test on multiple screen sizes
- Ensure i18n keys are added for all languages

---

## Roadmap

### Completed
- 114 characters with full data
- 90+ guides across 10 categories
- 14 utility tools
- 4-language support with complete translations (EN, JP, KR, ZH)
- Type-safe i18n with subdomain-based routing
- SEO optimization (JSON-LD, hreflang, sitemaps)
- PWA capabilities
- Team planner with image export
- Guild raid system with Geas
- News aggregation system
- OST player and wallpaper gallery

---

## License

This project is a fan-made companion site and is not affiliated with or endorsed by VA Games or Major9. All game assets, character names, and related intellectual property belong to their respective owners.

---

## Acknowledgments

- **VA Games** - For developing Outerplane
- **Major9** - For publishing and supporting the game
- **Community Contributors** - For translations, guides, and feedback
- **EvaMains Discord** - For being an awesome community
- **Open Source Community** - For the amazing tools and libraries

---

Made with by the Outerpedia community

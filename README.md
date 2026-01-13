![Next.js](https://img.shields.io/badge/Next.js-15.5-blue?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss)

# Outerpedia

> A comprehensive, multilingual companion wiki and toolkit for Outerplane - built with Next.js 15 and TypeScript

**Outerpedia** is a fan-made, community-driven database for **Outerplane**, the turn-based mobile RPG developed by VA Games and published by Major9. It provides comprehensive information about characters, equipment, guides, tier lists, and various utility tools to help players optimize their gameplay experience.

### Live Sites

- **English**: [outerpedia.com](https://outerpedia.com)
- **Japanese**: [jp.outerpedia.com](https://jp.outerpedia.com)
- **Korean**: [kr.outerpedia.com](https://kr.outerpedia.com)
- **Chinese (Simplified)**: [zh.outerpedia.com](https://zh.outerpedia.com)

**Community:** [Join the EvaMains Discord](https://discord.com/invite/keGhVQWsHv)
**Current version:** `8.4.46 : Core Fusion Lisha release`

---

## Features

### Character Database (107+ Characters)
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

### Guides (70+ Guides)
- **Categories**: General, Adventure, World Boss, Guild Raid, Tower, Event, Conquest, and more
- Comprehensive how-to-play guides
- Boss strategies and team compositions
- Event walkthroughs
- Service transfer guides
- All guides support multi-language content

### Utility Tools (13 Tools)
1. **Pull Simulator** - Gacha/banner simulation
2. **Gear Solver** - Equipment optimization tool
3. **EE Priority Calculator** - Exclusive Equipment upgrade planning
4. **Gear Usage Stats** - Character gear popularity analysis
5. **Most Used Unit** - Meta analysis
6. **Interactive Tier Lists** - PvE & PvP rankings with filtering
7. **Coupon Codes** - Active coupon code manager with copy functionality
8. **Patch History** - Version changelog tracking


### Technical Features
- Lightning Fast - Static generation with ISR, CDN optimized
- Fully Multilingual - Type-safe i18n support (EN, JP, KR, ZH) with subdomain-based routing
- PWA Support - Install as an app with offline capabilities
- Modern UI - Tailwind CSS 4.1 with custom animations (Framer Motion 12.18)
- SEO Optimized - Dynamic meta tags, JSON-LD, hreflang tags, multi-language sitemaps
- Accessible - ARIA labels, semantic HTML, keyboard navigation

---

## Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.5.4 | App Router, RSC, ISR |
| [React](https://react.dev/) | 19.0 | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type Safety (Strict Mode) |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.4 | Utility-First Styling |
| [Framer Motion](https://www.framer.com/motion/) | 12.18 | Animations |

### UI Components & Libraries
- **Radix UI** - Accessible primitives (Select, Popover, Tooltip, HoverCard)
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Keen Slider** - Touch slider component
- **Markdown-it** / **Marked** - Markdown rendering

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
- **English** (`en`) - Default (Complete)
- **Japanese** (`jp`) - Work in Progress
- **Korean** (`kr`) - Work in Progress
- **Chinese Simplified** (`zh`) - Work in Progress

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
npm run dev              # Start development server
npm run build            # Full production build (includes all generation scripts)
npm run start            # Start production server
npm run lint             # Run ESLint

# Data generation
npm run generate:allchar       # Index all character files
npm run generate:slugToChar    # Create URL slug mappings
npm run generate:gear-stats    # Calculate gear usage statistics
npm run generate:guide-chars   # Extract recommended characters per guide
npm run gen:events             # Generate event registry
npm run gen:pool               # Generate banner/gacha pool data
npm run build:effects          # Build effect icon index

# Utilities
npm run sitemap                # Generate sitemap for all languages
npm run seo-check              # Audit SEO configuration
npm run commit                 # Git commit with changelog generation
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
12. Next.js production build

---

## API Endpoints

Base path: `/api`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/characters` | GET | Fetch all 107 characters |
| `/characters-lite` | GET | Lightweight character list (no skills) |
| `/pull-sim` | GET/POST | Pull simulator gacha logic |
| `/pull-sim/chars` | GET | Characters available for pulling |
| `/reco/[name]` | GET | Character recommendations (dynamic) |
| `/tenant` | GET | Current tenant info (lang, domain) |
| `/admin/status` | GET | Admin dashboard status |
| `/admin/assets/*` | POST | Asset management operations |
| `/admin/run-script` | POST | Execute build scripts |

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

- **ISR (Incremental Static Regeneration)**: For guides and character pages
- **React Server Components**: Reduced client-side JavaScript
- **Image Optimization**: WebP/AVIF formats
- **Code Splitting**: Automatic route-based splitting
- **Service Worker**: PWA support with offline capabilities
- **Font Loading**: Optimized Google Fonts with `display: swap`

---

## Project Structure

```
outerpedia/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (tools)/             # Utility tools (13 total)
│   │   ├── admin/               # Administrative pages
│   │   ├── api/                 # API routes (14 endpoints)
│   │   ├── characters/          # Character pages
│   │   ├── equipments/          # Equipment pages
│   │   ├── guides/              # Guide system
│   │   ├── tierlist/            # Tier list pages
│   │   ├── changelog/           # Update log
│   │   └── layout.tsx           # Root layout
│   │
│   ├── components/              # 121 React components
│   │   ├── layout/              # Header, Footer
│   │   ├── guides/              # Guide-specific components
│   │   └── ...
│   │
│   ├── data/                    # Game data (JSON)
│   │   ├── char/                # 107 character files
│   │   ├── guides/              # Guide categories
│   │   ├── _allCharacters.json  # Generated character index
│   │   ├── amulet.json          # Equipment data
│   │   └── ...
│   │
│   ├── i18n/                    # Internationalization
│   │   ├── locales/             # Translation files
│   │   │   ├── en.ts            # English (~42KB)
│   │   │   ├── jp.ts            # Japanese (~46KB)
│   │   │   ├── kr.ts            # Korean (~43KB)
│   │   │   └── zh.ts            # Chinese (in progress)
│   │   └── index.ts             # Message loader
│   │
│   ├── lib/                     # Utilities & helpers
│   │   ├── contexts/            # React contexts
│   │   │   ├── I18nContext.tsx  # Client i18n
│   │   │   └── server-i18n.ts   # Server i18n
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
│   │   └── ...
│   │
│   └── utils/                   # Utility functions
│
├── scripts/                     # Build & maintenance scripts
│   ├── generateAllCharacters.js
│   ├── generateEventRegistry.js
│   ├── generateSitemap.cjs
│   └── ...
│
├── public/                      # Static assets
│   ├── images/
│   ├── event/
│   └── manifest.json            # PWA manifest
│
├── .env.local                   # Development config
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
- 107 characters with full data
- 70+ guides across 10+ categories
- 13 utility tools
- 4-language support (EN, JP, KR, ZH)
- SEO optimization
- PWA capabilities
- Type-safe i18n system

### In Progress
- Japanese, Korean, and Chinese translations
- Clickable stats in guide text
- Project health dashboard

### Future Plans
- Additional language support
- Community voting system
- User-generated content moderation
- Real-time event notifications

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

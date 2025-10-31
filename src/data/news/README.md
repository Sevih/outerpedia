# Content Management - News & Updates

This directory contains all news articles in Markdown format, migrated from the legacy JSON bundled files.

## Structure

```
src/data/news/
├── legacy/              # Legacy content from Stove (pre-Vagames)
│   ├── patchnotes/          # Patch notes and game updates
│   ├── event/               # In-game events
│   ├── developer-notes/     # Developer communications
│   ├── compendium/          # Hero compendium entries
│   ├── world-introduction/  # Lore and world building
│   ├── official-4-cut-cartoon/  # Comics
│   ├── probabilities/       # Gacha rates and probabilities
│   └── media-archives/      # Media releases
└── README.md            # This file
```

**Images:** Located in `/public/` directories matching each category name (legacy Stove images).

## File Format

Each article is a Markdown file with YAML frontmatter:

```markdown
---
title: "Article Title"
date: "2025-10-31T00:00:00.000Z"
category: "patchnotes"
id: "unique-article-id"
images:
  - /path/to/image1.webp
  - /path/to/image2.webp
---

# Article content in Markdown

![Image](/path/to/image.webp)

Your content here...
```

## Usage

### Reading Articles

```typescript
import { getAllNews, getNewsByCategory, getNewsArticle } from '@/lib/news'

// Get all articles
const allNews = getAllNews()

// Get articles by category
const patches = getNewsByCategory('patchnotes')

// Get a specific article
const article = getNewsArticle('patchnotes', 'article-slug')
```

### Adding New Articles

1. Create a new `.md` file in the appropriate category folder
2. Add the YAML frontmatter with required fields
3. Write content in Markdown
4. Images should be placed in `/public` and referenced with absolute paths

### Migrating from JSON

If you need to re-run the migration or migrate new JSON files:

```bash
npm run migrate:news
```

## Routes

- `/news` - Main news listing with filters
- `/news?category=patchnotes` - Filter by category
- `/news?q=search` - Search articles
- `/news/[category]/[slug]` - Individual article page

## Benefits of Markdown Over JSON

✅ **Smaller bundle size** - No client-side JSON imports
✅ **Better SEO** - Server-side rendering with proper metadata
✅ **Easier editing** - Human-readable Markdown format
✅ **Static generation** - Pre-rendered pages for better performance
✅ **Type safety** - Proper TypeScript types
✅ **Better DX** - No HTML strings in JSON

## Legacy Files

The old JSON bundled files are preserved in `/data/*.bundled.json` for reference.
These files are no longer used by the application and can be archived or removed.

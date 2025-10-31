# VA Notices Scraper Documentation

## Overview

This directory contains scripts to scrape notices and patch notes from the Vanguard OUTERPLANE official website.

## Scripts

### `scrape-all-va-notices.mjs`

Comprehensive scraper that downloads all notices from the VA official boards for all languages.

**Features:**
- Scrapes notices from 3 language boards: EN, KR, JP
- Downloads all external images and saves them locally
- Converts base64-encoded images to local files
- Saves notices as Markdown files with frontmatter metadata
- Organizes files by language

**Usage:**

```bash
# Scrape all languages (max 10 pages each by default)
node scripts/scrape-all-va-notices.mjs

# Specify max pages
node scripts/scrape-all-va-notices.mjs 5

# Scrape specific languages only
node scripts/scrape-all-va-notices.mjs 10 en kr  # Only EN and KR
node scripts/scrape-all-va-notices.mjs 3 jp      # Only JP
```

**Output Structure:**

```
src/data/news/live/
├── en/
│   ├── 208-notice-1030-thu-sequential-rollout-patch-notice.md
│   ├── 205-monad-festival-fireworks-event-notice.md
│   └── ...
├── kr/
│   └── ...
└── jp/
    └── ...

public/images/news/live/
├── en/
│   ├── 208-70801020.png
│   ├── 205-base64-0-bd91cd52.png
│   └── ...
├── kr/
│   └── ...
└── jp/
    └── ...
```

**Markdown File Format:**

```markdown
---
title: "Notice Title"
date: "2025.10.30"
category: "Notice"
views: 39
url: "https://vagames.co.kr/noticewrite/notice_en/?uid=208"
uid: "208"
---

Content goes here...
![alt text](/images/news/live/en/208-image.png)
```

### `scrape-va-patchnotes.mjs`

Legacy scraper focused only on patch notes (English only).

**Usage:**

```bash
# Scrape first 3 pages of patch notes
node scripts/scrape-va-patchnotes.mjs 3
```

**Note:** This script is superseded by `scrape-all-va-notices.mjs` which handles all notice types and languages.

## Source URLs

- **English:** https://vagames.co.kr/noticewrite/notice_en/
- **Korean:** https://vagames.co.kr/noticewrite/notice_kr/
- **Japanese:** https://vagames.co.kr/noticewrite/notice_jp/

## Dependencies

- `cheerio`: HTML parsing
- `turndown`: HTML to Markdown conversion

These are already included in the project's `package.json`.

## Image Handling

The scraper handles two types of images:

1. **External URLs** - Downloaded and saved with format: `{uid}-{hash}.{ext}`
2. **Base64 embedded** - Converted to files with format: `{uid}-base64-{index}-{hash}.{ext}`

All images are:
- Saved to `public/images/news/live/{lang}/`
- Referenced in Markdown with paths like `/images/news/live/{lang}/{filename}`
- Cached to avoid duplicate downloads

## Rate Limiting

The scraper includes delays to be respectful to the server:
- 1 second between list pages
- 2 seconds between detail page requests

## Error Handling

- Failed image downloads are logged but don't stop the scraping process
- Pages that fail to load are logged and the scraper continues
- Invalid entries are skipped

## Monitoring Progress

When running the scraper, you'll see output like:

```
Page 1: https://vagames.co.kr/noticewrite/notice_en/
Found 21 entries on this page

[1/60] Processing: Notice Title
  Downloaded image: 208-70801020.png
  Saved base64 image: 205-base64-0-bd91cd52.png
Saved: 208-notice-title.md
```

## Re-running the Scraper

The scraper will overwrite existing files with the same UID. To do a clean re-scrape:

```bash
# Clean existing data
rm -rf src/data/news/live public/images/news/live

# Run scraper
node scripts/scrape-all-va-notices.mjs
```

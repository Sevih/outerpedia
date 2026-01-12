#!/usr/bin/env node

import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only scrape news after this date (inclusive)
const MIN_DATE = new Date('2025-11-05');

const BOARDS = {
  en: {
    url: 'https://annoucements.outerplane.vagames.co.kr/category/annoucements/',
    dataDir: path.join(__dirname, '..', 'src', 'data', 'news', 'live', 'en'),
    imageDir: path.join(__dirname, '..', 'public', 'images', 'news', 'live', 'en'),
  },
  kr: {
    url: 'https://annoucements.outerplane.vagames.co.kr/category/annoucements-kr/',
    dataDir: path.join(__dirname, '..', 'src', 'data', 'news', 'live', 'kr'),
    imageDir: path.join(__dirname, '..', 'public', 'images', 'news', 'live', 'kr'),
  },
  jp: {
    url: 'https://annoucements.outerplane.vagames.co.kr/category/announcements-jp/',
    dataDir: path.join(__dirname, '..', 'src', 'data', 'news', 'live', 'jp'),
    imageDir: path.join(__dirname, '..', 'public', 'images', 'news', 'live', 'jp'),
  },
};

// Track downloaded images to avoid duplicates
const imageCache = new Map();

// ANSI color codes for better log visibility
const COLORS = {
  en: '\x1b[36m', // Cyan
  jp: '\x1b[35m', // Magenta
  kr: '\x1b[33m', // Yellow
  reset: '\x1b[0m',
};

/**
 * Log with language prefix and color
 */
function logWithLang(lang, message) {
  const color = COLORS[lang] || COLORS.reset;
  const prefix = `[${lang.toUpperCase()}]`;
  console.log(`${color}${prefix}${COLORS.reset} ${message}`);
}

/**
 * Fetch a page with proper headers
 */
async function fetchPage(url, lang) {
  if (lang) {
    logWithLang(lang, `Fetching: ${url}`);
  } else {
    console.log(`Fetching: ${url}`);
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

/**
 * Get fallback image based on title patterns
 */
function getFallbackImage(title, lang, imageDir) {
  // EN: Patch Note pattern (mm/dd (day) Patch Note)
  if (lang === 'en' && /^\d{1,2}\/\d{1,2}\s+\([A-Za-z]+\)\s+Patch Note/i.test(title)) {
    // Look for any existing patch note image in the directory
    const files = fs.readdirSync(imageDir);
    const patchNoteImage = files.find(f => /^\d+-[a-f0-9]+\.(png|webp)$/i.test(f));
    if (patchNoteImage) {
      // Change extension to .webp
      const imageName = patchNoteImage.replace(/\.(png|webp)$/i, '.webp');
      return `/images/news/live/${lang}/${imageName}`;
    }
  }

  // KR: 접속 보상 이벤트 pattern
  if (lang === 'kr' && /접속\s*보상\s*이벤트/i.test(title)) {
    // Look for existing 접속 보상 event image (195-22b0a5b8)
    const files = fs.readdirSync(imageDir);
    const eventImage = files.find(f => /^195-[a-f0-9]+\.(png|webp)$/i.test(f));
    if (eventImage) {
      const imageName = eventImage.replace(/\.(png|webp)$/i, '.webp');
      return `/images/news/live/${lang}/${imageName}`;
    }
  }

  // KR: 엠버 event pattern (청운의 꿈 엠버, etc.)
  if (lang === 'kr' && /엠버.*이벤트|이벤트.*엠버/i.test(title)) {
    // Look for existing 엠버 event image (102-169728cd)
    const files = fs.readdirSync(imageDir);
    const amberImage = files.find(f => /^102-[a-f0-9]+\.(png|webp)$/i.test(f));
    if (amberImage) {
      const imageName = amberImage.replace(/\.(png|webp)$/i, '.webp');
      return `/images/news/live/${lang}/${imageName}`;
    }
  }

  return null;
}

/**
 * Download an image and save it locally
 */
async function downloadImage(imageUrl, imageDir, uid) {
  try {
    // Check cache first
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl);
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!response.ok) {
      console.warn(`Failed to download image: ${imageUrl}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Generate filename from URL or hash
    const urlObj = new URL(imageUrl);
    const originalFilename = path.basename(urlObj.pathname);
    const ext = path.extname(originalFilename) || '.png';
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
    const filename = `${uid}-${hash}${ext}`;

    // Ensure directory exists
    fs.mkdirSync(imageDir, { recursive: true });

    // Save image
    const filePath = path.join(imageDir, filename);
    fs.writeFileSync(filePath, uint8Array);

    // Return relative path with .webp extension (actual file stays .png for now)
    // Extract language from imageDir (en, kr, or jp)
    const lang = path.basename(imageDir);
    const webpFilename = filename.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const relativePath = `/images/news/live/${lang}/${webpFilename}`;

    // Cache the result
    imageCache.set(imageUrl, relativePath);

    return relativePath;

  } catch (error) {
    console.warn(`Error downloading image ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Convert base64 images to local files
 */
function saveBase64Image(base64Data, imageDir, uid, index) {
  try {
    // Extract the data and mime type
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return null;
    }

    const ext = matches[1];
    const data = matches[2];

    // Generate filename
    const hash = crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
    const filename = `${uid}-base64-${index}-${hash}.${ext}`;

    // Ensure directory exists
    fs.mkdirSync(imageDir, { recursive: true });

    // Save image
    const filePath = path.join(imageDir, filename);
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, buffer);

    // Return relative path with .webp extension (actual file stays as original)
    // Extract language from imageDir (en, kr, or jp)
    const lang = path.basename(imageDir);
    const webpFilename = filename.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const relativePath = `/images/news/live/${lang}/${webpFilename}`;

    return relativePath;

  } catch (error) {
    console.warn(`Error saving base64 image:`, error.message);
    return null;
  }
}

/**
 * Create Turndown service with custom image handler
 */
function createTurndownService(imageDir, uid) {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  let base64ImageIndex = 0;

  turndownService.addRule('images', {
    filter: 'img',
    replacement: function (content, node) {
      const alt = node.getAttribute('alt') || '';
      let src = node.getAttribute('src') || '';

      if (!src) return '';

      // Handle base64 images
      if (src.startsWith('data:image')) {
        const localPath = saveBase64Image(src, imageDir, uid, base64ImageIndex++);
        return localPath ? `![${alt}](${localPath})` : '';
      }

      // Convert relative URLs to absolute
      if (src && !src.startsWith('http')) {
        src = new URL(src, 'https://vagames.co.kr').href;
      }

      // Return the URL as-is for now, we'll download it later
      return src ? `![${alt}](${src})` : '';
    }
  });

  return turndownService;
}

/**
 * Download all external images from markdown and update paths
 */
async function processMarkdownImages(markdown, imageDir, uid, title, lang) {
  // Find all image references
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  const replacements = [];

  while ((match = imageRegex.exec(markdown)) !== null) {
    const alt = match[1];
    const url = match[2];

    // Skip if already a local path
    if (url.startsWith('/images/')) {
      continue;
    }

    // Download the image
    if (url.startsWith('http')) {
      const localPath = await downloadImage(url, imageDir, uid);
      if (localPath) {
        replacements.push({
          original: match[0],
          replacement: `![${alt}](${localPath})`
        });
      } else {
        // Download failed, try to find a fallback image
        const fallbackPath = getFallbackImage(title, lang, imageDir);
        if (fallbackPath) {
          replacements.push({
            original: match[0],
            replacement: `![${alt}](${fallbackPath})`
          });
        } else {
          // No fallback available, leave image empty
          replacements.push({
            original: match[0],
            replacement: `![${alt}]()`
          });
        }
      }
    }
  }

  // Apply all replacements
  let updatedMarkdown = markdown;
  for (const { original, replacement } of replacements) {
    updatedMarkdown = updatedMarkdown.replace(original, replacement);
  }

  return updatedMarkdown;
}

/**
 * Get list of notice entries from a list page
 */
function parseListPage(html) {
  const $ = cheerio.load(html);
  const entries = [];

  $('article.entry-card.post').each((_, article) => {
    const $article = $(article);

    // Extract title and link from .entry-title
    const $titleLink = $article.find('.entry-title a');
    let title = $titleLink.text().trim();
    const href = $titleLink.attr('href');

    // Skip if no link
    if (!href) return;

    // Extract category from WordPress classes (category-notice, category-update, etc.)
    const classes = $article.attr('class') || '';
    const categoryMatch = classes.match(/category-([a-z-]+)/);
    let category = categoryMatch ? categoryMatch[1] : '';

    // Also check for [Category] prefix in title
    const titleCategoryMatch = title.match(/^\[([^\]]+)\]/);
    if (titleCategoryMatch) {
      category = titleCategoryMatch[1];
    }

    // Extract date from time element
    const $time = $article.find('time');
    let date = $time.text().trim();

    // Convert Korean date format (11월 11, 2025) to YYYY.MM.DD
    const koreanDateMatch = date.match(/(\d+)월\s+(\d+),\s+(\d{4})/);
    if (koreanDateMatch) {
      const month = koreanDateMatch[1].padStart(2, '0');
      const day = koreanDateMatch[2].padStart(2, '0');
      const year = koreanDateMatch[3];
      date = `${year}.${month}.${day}`;
    }

    // Skip articles older than MIN_DATE
    if (date) {
      const [year, month, day] = date.split('.');
      const articleDate = new Date(`${year}-${month}-${day}`);
      if (articleDate < MIN_DATE) {
        return; // Skip this article
      }
    }

    // Extract featured image
    const $img = $article.find('img');
    const featuredImage = $img.attr('src') || '';

    // Extract UID from URL (WordPress post ID from classes like post-3933)
    const postIdMatch = classes.match(/post-(\d+)/);
    const uid = postIdMatch ? postIdMatch[1] : null;

    if (uid && href) {
      entries.push({
        uid,
        title,
        category,
        date,
        views: '0', // WordPress doesn't show view count on listing
        url: href,
        featuredImage
      });
    }
  });

  return entries;
}

/**
 * Check if there's a next page
 */
function hasNextPage(html, baseUrl) {
  const $ = cheerio.load(html);

  // Look for "next" link in pagination
  const $nextLink = $('.ct-pagination a.next.page-numbers');
  const nextHref = $nextLink.attr('href');

  if (nextHref) {
    return nextHref.startsWith('http') ? nextHref : new URL(nextHref, baseUrl).href;
  }

  return null;
}

/**
 * Extract notice content from detail page
 */
async function extractNoticeContent(url, metadata, imageDir, lang) {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  // Extract the main content area (WordPress structure)
  // Use .last() because there might be multiple .entry-content (navigation at top)
  const $content = $('.entry-content').last();

  if ($content.length === 0) {
    console.warn(`No content found for ${url}`);
    return null;
  }

  // Try to extract the title from the page if not already set
  const $pageTitle = $('.page-title, h1.entry-title');
  if ($pageTitle.length && !metadata.title) {
    metadata.title = $pageTitle.text().trim();
  }

  // Try to extract date from time element if available
  let realDate = metadata.date;
  const $time = $('time');
  if ($time.length) {
    const timeText = $time.text().trim();
    // Convert Korean date format if needed
    const koreanDateMatch = timeText.match(/(\d+)월\s+(\d+),\s+(\d{4})/);
    if (koreanDateMatch) {
      const month = koreanDateMatch[1].padStart(2, '0');
      const day = koreanDateMatch[2].padStart(2, '0');
      const year = koreanDateMatch[3];
      realDate = `${year}.${month}.${day}`;
    }
  }

  // Extract category from title if not already present
  let category = metadata.category;
  if (!category && metadata.title) {
    const categoryMatch = metadata.title.match(/^\[([^\]]+)\]/);
    if (categoryMatch) {
      category = categoryMatch[1];
    }
  }

  // Get HTML content
  let htmlContent = $content.html() || '';

  // Clean up the HTML
  htmlContent = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Convert to Markdown with image handling
  const turndownService = createTurndownService(imageDir, metadata.uid);
  let markdown = turndownService.turndown(htmlContent);

  // Download all external images and update markdown
  markdown = await processMarkdownImages(markdown, imageDir, metadata.uid, metadata.title, lang);

  return {
    ...metadata,
    date: realDate,
    category,
    content: markdown.trim()
  };
}

/**
 * Check if an article already exists with the same uid and title
 */
function shouldSkipArticle(uid, title, dataDir) {
  const filename = `${uid}.md`;
  const filePath = path.join(dataDir, filename);

  // If file doesn't exist, don't skip
  if (!fs.existsSync(filePath)) {
    return false;
  }

  // Read the file and check if the title matches
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/^title:\s*"(.+)"$/m);

    if (titleMatch) {
      const existingTitle = titleMatch[1];
      // If title matches, skip this article
      if (existingTitle === title) {
        return true;
      }
    }
  } catch (error) {
    console.warn(`Error reading ${filename}:`, error.message);
  }

  // If we couldn't read the title or it doesn't match, don't skip (re-scrape)
  return false;
}

/**
 * Save notice to Markdown file
 */
function saveNotice(notice, dataDir, lang) {
  // Use only UID for filename (WordPress UIDs are stable and unique)
  const filename = `${notice.uid}.md`;
  const filePath = path.join(dataDir, filename);

  // Ensure directory exists
  fs.mkdirSync(dataDir, { recursive: true });

  // Create frontmatter
  const frontmatter = `---
title: "${notice.title.replace(/"/g, '\\"')}"
date: "${notice.date}"
category: "${notice.category}"
views: ${notice.views}
url: "${notice.url}"
uid: "${notice.uid}"
---

`;

  const fileContent = frontmatter + notice.content;

  // Write file
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  return true;
}

/**
 * Scrape all notices for a specific language
 */
async function scrapeLanguage(lang) {
  const config = BOARDS[lang];

  logWithLang(lang, `${'='.repeat(50)}`);
  logWithLang(lang, `STARTING SCRAPING`);
  logWithLang(lang, `${'='.repeat(50)}`);

  let currentUrl = config.url;
  let pageCount = 0;
  const allEntries = [];

  // Step 1: Collect entries from list pages until we find a page with no new articles
  while (currentUrl) {
    pageCount++;
    logWithLang(lang, `Page ${pageCount}`);

    try {
      const html = await fetchPage(currentUrl, lang);
      const entries = parseListPage(html);

      logWithLang(lang, `Found ${entries.length} entries on page ${pageCount}`);

      // Check how many new articles we have on this page
      let newArticlesOnPage = 0;
      for (const entry of entries) {
        if (!shouldSkipArticle(entry.uid, entry.title, config.dataDir)) {
          newArticlesOnPage++;
        }
      }

      logWithLang(lang, `New articles on page ${pageCount}: ${newArticlesOnPage}/${entries.length}`);
      allEntries.push(...entries);

      // If this page has no new articles, stop crawling
      if (newArticlesOnPage === 0 && entries.length > 0) {
        logWithLang(lang, `⚡ No new articles on page ${pageCount}, stopping pagination`);
        break;
      }

      // Check for next page
      const nextUrl = hasNextPage(html, config.url);
      currentUrl = nextUrl;

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      logWithLang(lang, `❌ Error fetching page ${pageCount}: ${error.message}`);
      break;
    }
  }

  logWithLang(lang, `✓ Found ${allEntries.length} total entries across ${pageCount} pages`);

  // Step 2: Extract and save each notice
  let savedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];

    // Check if we should skip this article (uid + title match)
    if (shouldSkipArticle(entry.uid, entry.title, config.dataDir)) {
      skippedCount++;
      continue;
    }

    try {
      const notice = await extractNoticeContent(entry.url, entry, config.imageDir, lang);

      if (notice && notice.content) {
        saveNotice(notice, config.dataDir, lang);
        savedCount++;

        // Show progress every 10 articles
        if (savedCount % 10 === 0) {
          logWithLang(lang, `Progress: ${savedCount} saved, ${skippedCount} skipped (${i + 1}/${allEntries.length})`);
        }
      }

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      logWithLang(lang, `❌ Error processing ${entry.uid}: ${error.message}`);
    }
  }

  logWithLang(lang, `${'='.repeat(50)}`);
  logWithLang(lang, `✅ SCRAPING COMPLETE`);
  logWithLang(lang, `Saved: ${savedCount} | Skipped: ${skippedCount} | Total: ${allEntries.length}`);
  logWithLang(lang, `${'='.repeat(50)}`);

  return savedCount;
}

/**
 * Main function
 */
async function main() {
  console.log('VA NOTICES COMPREHENSIVE SCRAPER');
  console.log('================================\n');

  const args = process.argv.slice(2);
  const languages = args.length > 0 ? args : ['en', 'kr', 'jp'];

  console.log(`Languages to scrape: ${languages.join(', ')}`);
  console.log('Mode: Scraping ALL pages (no limit)\n');

  const stats = {};

  // Parallelize all languages using Promise.all
  const results = await Promise.allSettled(
    languages.map(async (lang) => {
      if (!BOARDS[lang]) {
        console.error(`Unknown language: ${lang}`);
        return { lang, count: 0 };
      }

      try {
        const count = await scrapeLanguage(lang);
        return { lang, count };
      } catch (error) {
        console.error(`Error scraping ${lang}:`, error.message);
        return { lang, count: 0 };
      }
    })
  );

  // Collect stats from results
  for (const result of results) {
    if (result.status === 'fulfilled') {
      stats[result.value.lang] = result.value.count;
    } else {
      console.error(`Failed to scrape a language:`, result.reason);
    }
  }

  // Final summary
  console.log('\n\n' + '='.repeat(60));
  console.log('SCRAPING SUMMARY');
  console.log('='.repeat(60));
  for (const [lang, count] of Object.entries(stats)) {
    console.log(`${lang.toUpperCase()}: ${count} notices`);
  }
  console.log('\nAll done!');
  console.log('\n💡 WebP conversion is handled automatically by the dev watcher (npm run dev).');
}

main().catch(console.error);

#!/usr/bin/env node

import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOARDS = {
  en: {
    url: 'https://vagames.co.kr/noticewrite/notice_en/',
    dataDir: path.join(__dirname, '..', 'src', 'data', 'news', 'live', 'en'),
    imageDir: path.join(__dirname, '..', 'public', 'images', 'news', 'live', 'en'),
  },
  kr: {
    url: 'https://vagames.co.kr/noticewrite/notice_kr/',
    dataDir: path.join(__dirname, '..', 'src', 'data', 'news', 'live', 'kr'),
    imageDir: path.join(__dirname, '..', 'public', 'images', 'news', 'live', 'kr'),
  },
  jp: {
    url: 'https://vagames.co.kr/noticewrite/notice_jp/',
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

  $('.kboard-list tbody tr').each((_, row) => {
    const $row = $(row);

    // Extract title and link
    const $titleCell = $row.find('td.kboard-list-title');
    const $link = $titleCell.find('a');
    const title = $link.text().trim();
    const href = $link.attr('href');

    // Skip if no link
    if (!href) return;

    // Extract category/badge
    const category = $titleCell.find('.kboard-category').text().trim();

    // Extract all columns
    const $cells = $row.find('td');

    // Find date column (look for the one with date format or time)
    let date = '';
    $cells.each((_, cell) => {
      const text = $(cell).text().trim();
      // Match YYYY.MM.DD or HH:mm format
      if (text.match(/^\d{4}\.\d{2}\.\d{2}$/) || text.match(/^\d{2}:\d{2}$/)) {
        date = text;
      }
    });

    // Extract view count (last numeric cell)
    const views = $row.find('td').last().text().trim();

    // Extract UID from URL
    const uidMatch = href.match(/uid=(\d+)/);
    const uid = uidMatch ? uidMatch[1] : null;

    if (uid) {
      entries.push({
        uid,
        title,
        category,
        date,
        views,
        url: href.startsWith('http') ? href : new URL(href, 'https://vagames.co.kr').href
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
  const nextLink = $('.kboard-pagination a').filter((_, el) => {
    return $(el).text().includes('»') || $(el).text().includes('다음');
  }).attr('href');

  return nextLink ? new URL(nextLink, baseUrl).href : null;
}

/**
 * Extract notice content from detail page
 */
async function extractNoticeContent(url, metadata, imageDir, lang) {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  // Extract the main content area
  const $content = $('.kboard-detail-content, .kboard-content, article.kboard-detail');

  if ($content.length === 0) {
    console.warn(`No content found for ${url}`);
    return null;
  }

  // Extract better metadata from detail page
  const $metaInfo = $('.kboard-detail-meta, .kboard-meta');

  // Try to extract the real date from the detail page
  let realDate = metadata.date;
  $metaInfo.find('span, div').each((_, elem) => {
    const text = $(elem).text().trim();
    // Look for date in YYYY.MM.DD format or YYYY-MM-DD
    const dateMatch = text.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
    if (dateMatch) {
      realDate = `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`;
    }
  });

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

  // Step 1: Collect all entries from list pages (no limit, scrape everything)
  while (currentUrl) {
    pageCount++;
    logWithLang(lang, `Page ${pageCount}`);

    try {
      const html = await fetchPage(currentUrl, lang);
      const entries = parseListPage(html);

      logWithLang(lang, `Found ${entries.length} entries on page ${pageCount}`);
      allEntries.push(...entries);

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

  logWithLang(lang, `✓ Found ${allEntries.length} total entries`);

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

  // Convert images to WebP
  console.log('\n\n' + '='.repeat(60));
  console.log('CONVERTING IMAGES TO WEBP');
  console.log('='.repeat(60));

  try {
    const convertScriptPath = path.join(__dirname, '..', 'convert_to_webp.bat');
    console.log(`Running: ${convertScriptPath}`);

    // Execute the batch file
    execSync(`"${convertScriptPath}"`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit', // Show output in console
      windowsHide: false
    });

    console.log('\nWebP conversion completed!');
  } catch (error) {
    console.error('\nError during WebP conversion:', error.message);
    console.error('You may need to run convert_to_webp.bat manually.');
  }
}

main().catch(console.error);

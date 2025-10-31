#!/usr/bin/env node

import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

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

/**
 * Fetch a page with proper headers
 */
async function fetchPage(url) {
  console.log(`Fetching: ${url}`);

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

    // Return relative path from public directory
    // Extract language from imageDir (en, kr, or jp)
    const lang = path.basename(imageDir);
    const relativePath = `/images/news/live/${lang}/${filename}`;

    // Cache the result
    imageCache.set(imageUrl, relativePath);

    console.log(`  Downloaded image: ${filename}`);
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

    // Return relative path from public directory
    // Extract language from imageDir (en, kr, or jp)
    const lang = path.basename(imageDir);
    const relativePath = `/images/news/live/${lang}/${filename}`;

    console.log(`  Saved base64 image: ${filename}`);
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
async function processMarkdownImages(markdown, imageDir, uid) {
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
async function extractNoticeContent(url, metadata, imageDir) {
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
  markdown = await processMarkdownImages(markdown, imageDir, metadata.uid);

  return {
    ...metadata,
    date: realDate,
    category,
    content: markdown.trim()
  };
}

/**
 * Save notice to Markdown file
 */
function saveNotice(notice, dataDir, skipIfExists = false) {
  // Create filename from UID and title
  // Keep Unicode characters (for KR/JP), only remove special chars that could cause filesystem issues
  const safeTitle = notice.title
    .toLowerCase()
    .replace(/[<>:"/\\|?*]/g, '') // Remove filesystem-unsafe characters
    .replace(/[\[\](){}]/g, '') // Remove brackets
    .replace(/[!@#$%^&+=~`]/g, '') // Remove other special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 80); // Allow longer filenames for Unicode

  const filename = `${notice.uid}-${safeTitle || 'notice'}.md`;
  const filePath = path.join(dataDir, filename);

  // Ensure directory exists
  fs.mkdirSync(dataDir, { recursive: true });

  // Skip if file already exists and skipIfExists is true
  if (skipIfExists && fs.existsSync(filePath)) {
    console.log(`Skipped (exists): ${filename}`);
    return false;
  }

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
  console.log(`Saved: ${filename}`);
  return true;
}

/**
 * Scrape all notices for a specific language
 */
async function scrapeLanguage(lang, maxPages = 10, skipIfExists = false) {
  const config = BOARDS[lang];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SCRAPING ${lang.toUpperCase()} NOTICES`);
  console.log(`${'='.repeat(60)}\n`);

  let currentUrl = config.url;
  let pageCount = 0;
  const allEntries = [];

  // Step 1: Collect all entries from list pages
  while (currentUrl && pageCount < maxPages) {
    pageCount++;
    console.log(`\nPage ${pageCount}: ${currentUrl}`);

    try {
      const html = await fetchPage(currentUrl);
      const entries = parseListPage(html);

      console.log(`Found ${entries.length} entries on this page`);
      allEntries.push(...entries);

      // Check for next page
      const nextUrl = hasNextPage(html, config.url);
      currentUrl = nextUrl;

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error fetching page ${pageCount}:`, error.message);
      break;
    }
  }

  console.log(`\n\nTotal entries found for ${lang}: ${allEntries.length}`);

  // Step 2: Extract and save each notice
  let savedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    console.log(`\n[${i + 1}/${allEntries.length}] Processing: ${entry.title}`);

    try {
      const notice = await extractNoticeContent(entry.url, entry, config.imageDir);

      if (notice && notice.content) {
        const wasSaved = saveNotice(notice, config.dataDir, skipIfExists);
        if (wasSaved) {
          savedCount++;
        } else {
          skippedCount++;
          continue; // Skip the delay if file already exists
        }
      }

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`Error processing ${entry.uid}:`, error.message);
    }
  }

  console.log(`\n${lang.toUpperCase()} scraping complete!`);
  console.log(`Saved: ${savedCount} | Skipped: ${skippedCount} | Total: ${allEntries.length}`);
  console.log(`Files in: ${config.dataDir}`);
  console.log(`Images in: ${config.imageDir}`);

  return savedCount;
}

/**
 * Main function
 */
async function main() {
  console.log('VA NOTICES COMPREHENSIVE SCRAPER');
  console.log('================================\n');

  const args = process.argv.slice(2);
  const maxPages = args.length > 0 ? parseInt(args[0]) : 10;
  const languages = args.length > 1 ? args.slice(1) : ['en', 'kr', 'jp'];

  console.log(`Max pages per language: ${maxPages}`);
  console.log(`Languages to scrape: ${languages.join(', ')}\n`);

  const stats = {};

  for (const lang of languages) {
    if (!BOARDS[lang]) {
      console.error(`Unknown language: ${lang}`);
      continue;
    }

    try {
      const count = await scrapeLanguage(lang, maxPages);
      stats[lang] = count;
    } catch (error) {
      console.error(`Error scraping ${lang}:`, error.message);
      stats[lang] = 0;
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
}

main().catch(console.error);

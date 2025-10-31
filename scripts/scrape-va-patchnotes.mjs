#!/usr/bin/env node

import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://vagames.co.kr/noticewrite/notice_en/';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'news', 'patch-notes');

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Add custom rules for better conversion
turndownService.addRule('images', {
  filter: 'img',
  replacement: function (content, node) {
    const alt = node.getAttribute('alt') || '';
    let src = node.getAttribute('src') || '';

    // Convert relative URLs to absolute
    if (src && !src.startsWith('http')) {
      src = new URL(src, BASE_URL).href;
    }

    return src ? `![${alt}](${src})` : '';
  }
});

/**
 * Fetch a page with proper headers
 */
async function fetchPage(url) {
  console.log(`Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
 * Get list of patch note entries from a list page
 */
function parseListPage(html) {
  const $ = cheerio.load(html);
  const entries = [];

  $('.kboard-list tbody tr').each((i, row) => {
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
    $cells.each((idx, cell) => {
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
        url: href.startsWith('http') ? href : new URL(href, BASE_URL).href
      });
    }
  });

  return entries;
}

/**
 * Check if there's a next page
 */
function hasNextPage(html) {
  const $ = cheerio.load(html);
  const nextLink = $('.kboard-pagination a').filter((i, el) => {
    return $(el).text().includes('»') || $(el).text().includes('다음');
  }).attr('href');

  return nextLink ? new URL(nextLink, BASE_URL).href : null;
}

/**
 * Extract patch note content from detail page
 */
async function extractPatchNoteContent(url, metadata) {
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

  // Convert to Markdown
  const markdown = turndownService.turndown(htmlContent);

  return {
    ...metadata,
    date: realDate,
    category,
    content: markdown.trim()
  };
}

/**
 * Save patch note to Markdown file
 */
function savePatchNote(patchNote) {
  // Create filename from UID and title
  const safeTitle = patchNote.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const filename = `${patchNote.uid}-${safeTitle}.md`;
  const filePath = path.join(OUTPUT_DIR, filename);

  // Create frontmatter
  const frontmatter = `---
title: "${patchNote.title.replace(/"/g, '\\"')}"
date: "${patchNote.date}"
category: "${patchNote.category}"
views: ${patchNote.views}
url: "${patchNote.url}"
uid: "${patchNote.uid}"
---

`;

  const fileContent = frontmatter + patchNote.content;

  // Ensure directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write file
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`Saved: ${filename}`);
}

/**
 * Main scraping function
 */
async function scrapeAllPatchNotes(maxPages = 5) {
  console.log('Starting VA Patch Notes scraping...\n');

  let currentUrl = BASE_URL;
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
      const nextUrl = hasNextPage(html);
      currentUrl = nextUrl;

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error fetching page ${pageCount}:`, error.message);
      break;
    }
  }

  console.log(`\n\nTotal entries found: ${allEntries.length}`);

  // Step 2: Filter for patch notes only (looking for update/patch keywords)
  const patchNotes = allEntries.filter(entry => {
    const titleLower = entry.title.toLowerCase();
    const categoryLower = entry.category.toLowerCase();

    return (
      titleLower.includes('update') ||
      titleLower.includes('patch') ||
      titleLower.includes('maintenance') ||
      categoryLower.includes('update') ||
      categoryLower.includes('patch')
    );
  });

  console.log(`Filtered to ${patchNotes.length} patch notes\n`);

  // Step 3: Extract and save each patch note
  for (let i = 0; i < patchNotes.length; i++) {
    const entry = patchNotes[i];
    console.log(`\n[${i + 1}/${patchNotes.length}] Processing: ${entry.title}`);

    try {
      const patchNote = await extractPatchNoteContent(entry.url, entry);

      if (patchNote && patchNote.content) {
        savePatchNote(patchNote);
      }

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`Error processing ${entry.uid}:`, error.message);
    }
  }

  console.log('\n\nScraping complete!');
  console.log(`Saved ${patchNotes.length} patch notes to ${OUTPUT_DIR}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const maxPages = args.length > 0 ? parseInt(args[0]) : 5;

// Run the scraper
scrapeAllPatchNotes(maxPages).catch(console.error);

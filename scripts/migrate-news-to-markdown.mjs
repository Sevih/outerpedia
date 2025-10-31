#!/usr/bin/env node
// scripts/migrate-news-to-markdown.mjs
// Migre les fichiers JSON bundled vers des fichiers Markdown individuels

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Configuration
const DATASETS = [
  'patchnotes',
  'compendium',
  'developer-notes',
  'official-4-cut-cartoon',
  'probabilities',
  'world-introduction',
  'event',
  'media-archives'
];

const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_DIR = path.join(ROOT, 'src', 'data', 'news', 'legacy');

// Initialiser le convertisseur HTML → Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

// Nettoyer le HTML avant conversion
function cleanHtml(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Supprimer les éléments vides
  doc.querySelectorAll('div:empty, p:empty, span:empty').forEach(el => el.remove());

  // Convertir les images avec chemins relatifs
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('/')) {
      // Garder le chemin tel quel - sera servi depuis /public
      img.setAttribute('src', src);
    }
  });

  return doc.body.innerHTML;
}

// Convertir HTML vers Markdown
function htmlToMarkdown(html) {
  if (!html || html === '<!---->') return '';
  const cleaned = cleanHtml(html);
  return turndownService.turndown(cleaned);
}

// Créer le frontmatter YAML
function createFrontmatter(item, category) {
  const frontmatter = {
    title: item.title,
    date: item.date_iso || item.date,
    category: category,
    id: item.id,
  };

  if (item.author) frontmatter.author = item.author;
  if (item.sourceUrl) frontmatter.sourceUrl = item.sourceUrl;
  if (item.coverImage) frontmatter.coverImage = item.coverImage;
  if (item.images && item.images.length > 0) {
    frontmatter.images = item.images;
  }

  return frontmatter;
}

// Générer le slug depuis l'ID
function generateSlug(item) {
  return item.id;
}

// Migrer un dataset
async function migrateDataset(datasetName) {
  const inputFile = path.join(DATA_DIR, `${datasetName}.bundled.json`);

  if (!fs.existsSync(inputFile)) {
    console.warn(`⚠️  ${datasetName}.bundled.json not found, skipping...`);
    return { success: 0, failed: 0 };
  }

  const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const items = data.items || [];

  const categoryDir = path.join(OUTPUT_DIR, datasetName);
  fs.mkdirSync(categoryDir, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const slug = generateSlug(item);
      const markdown = htmlToMarkdown(item.html || '');
      const frontmatter = createFrontmatter(item, datasetName);

      // Créer le contenu du fichier Markdown
      const content = `---
${Object.entries(frontmatter).map(([key, value]) => {
  if (Array.isArray(value)) {
    return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
  }
  return `${key}: ${JSON.stringify(value)}`;
}).join('\n')}
---

${markdown}
`;

      const outputFile = path.join(categoryDir, `${slug}.md`);
      fs.writeFileSync(outputFile, content, 'utf-8');
      success++;

      if (success % 10 === 0) {
        process.stdout.write(`\r  Processing ${datasetName}: ${success}/${items.length}`);
      }
    } catch (err) {
      console.error(`\n❌ Failed to migrate ${item.id}:`, err.message);
      failed++;
    }
  }

  console.log(`\r✅ ${datasetName}: ${success} migrated, ${failed} failed`);
  return { success, failed };
}

// Main
async function main() {
  console.log('🚀 Starting migration from JSON to Markdown...\n');

  // Créer le dossier de sortie
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const dataset of DATASETS) {
    const result = await migrateDataset(dataset);
    totalSuccess += result.success;
    totalFailed += result.failed;
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`   Total: ${totalSuccess} files created, ${totalFailed} failed`);
  console.log(`   Output: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

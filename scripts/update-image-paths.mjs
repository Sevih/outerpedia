#!/usr/bin/env node
// scripts/update-image-paths.mjs
// Met à jour les chemins d'images dans les fichiers Markdown

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'news', 'legacy');
const CATEGORIES = [
  'patchnotes',
  'compendium',
  'developer-notes',
  'official-4-cut-cartoon',
  'probabilities',
  'world-introduction',
  'event',
  'media-archives'
];

let totalUpdated = 0;
let totalFiles = 0;

function updateImagePathsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let updated = content;
  let hasChanges = false;

  // Mettre à jour les chemins dans le frontmatter (images: array)
  // Exemple: - /patchnotes/... → - /images/news/legacy/patchnotes/...
  CATEGORIES.forEach(category => {
    const frontmatterPattern = new RegExp(`- /(${category}/[^\\n]+)`, 'g');
    if (frontmatterPattern.test(updated)) {
      updated = updated.replace(frontmatterPattern, `- /images/news/legacy/$1`);
      hasChanges = true;
    }
  });

  // Mettre à jour les chemins dans le contenu Markdown
  // Exemple: ![](</patchnotes/...>) → ![](/images/news/legacy/patchnotes/...)
  CATEGORIES.forEach(category => {
    const markdownPattern = new RegExp(`!\\[([^\\]]*)\\]\\(/(${category}/[^)]+)\\)`, 'g');
    if (markdownPattern.test(updated)) {
      updated = updated.replace(markdownPattern, `![$1](/images/news/legacy/$2)`);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, updated, 'utf-8');
    return true;
  }
  return false;
}

function processCategory(category) {
  const categoryDir = path.join(CONTENT_DIR, category);

  if (!fs.existsSync(categoryDir)) {
    console.log(`⚠️  ${category} directory not found, skipping...`);
    return;
  }

  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'));
  let categoryUpdated = 0;

  for (const file of files) {
    const filePath = path.join(categoryDir, file);
    totalFiles++;

    if (updateImagePathsInFile(filePath)) {
      categoryUpdated++;
      totalUpdated++;
    }
  }

  console.log(`✅ ${category}: ${categoryUpdated}/${files.length} files updated`);
}

function main() {
  console.log('🔄 Updating image paths in Markdown files...\n');

  for (const category of CATEGORIES) {
    processCategory(category);
  }

  console.log(`\n✨ Done! ${totalUpdated}/${totalFiles} files updated`);
}

main();

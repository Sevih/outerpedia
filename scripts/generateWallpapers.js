#!/usr/bin/env node
/**
 * Generates wallpapers.json from public/images/download folder
 * Full folder is automatically split into Events, Scenario, and Others
 * Includes image dimensions for each file
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../public/images/download');
const outputPath = path.join(__dirname, '../src/data/wallpapers.json');

/**
 * Read PNG dimensions from file header (IHDR chunk)
 */
function getPngDimensions(filePath) {
  try {
    const buffer = Buffer.alloc(24);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);

    // PNG signature (8 bytes) + IHDR length (4 bytes) + IHDR type (4 bytes) + width (4 bytes) + height (4 bytes)
    if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      return null; // Not a valid PNG
    }

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  } catch {
    return null;
  }
}

/**
 * Process files in a directory and return array with dimensions
 */
function processFiles(dir, filenames) {
  return filenames.map(filename => {
    const dims = getPngDimensions(path.join(dir, `${filename}.png`));
    return {
      f: filename,
      w: dims?.width ?? 0,
      h: dims?.height ?? 0,
    };
  });
}

const result = {};
let totalCount = 0;

// Simple categories (direct mapping)
const simpleCategories = ['Art', 'Banner', 'HeroFullArt'];

for (const cat of simpleCategories) {
  const dir = path.join(baseDir, cat);

  if (!fs.existsSync(dir)) {
    result[cat] = [];
    continue;
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace('.png', ''))
    .sort();

  result[cat] = processFiles(dir, files);
  totalCount += files.length;
}

// Split Full folder into subcategories based on filename prefix
const fullDir = path.join(baseDir, 'Full');
if (fs.existsSync(fullDir)) {
  const allFiles = fs.readdirSync(fullDir)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace('.png', ''))
    .sort();

  const events = allFiles.filter(f => f.startsWith('T_Event'));
  const scenario = allFiles.filter(f => f.startsWith('T_Scenario'));
  const others = allFiles.filter(f => !f.startsWith('T_Event') && !f.startsWith('T_Scenario'));

  result['Full:Events'] = processFiles(fullDir, events);
  result['Full:Scenario'] = processFiles(fullDir, scenario);
  result['Full:Others'] = processFiles(fullDir, others);

  totalCount += allFiles.length;
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log(`Generated wallpapers.json with ${totalCount} images`);

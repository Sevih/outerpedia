#!/usr/bin/env node
/**
 * Unified wallpaper processing script
 * - Scans and filters images from datamine/extracted_astudio
 * - Detects duplicates using perceptual hashing
 * - Copies to public/images/download/ by category
 * - Generates wallpapers.json
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const readline = require('readline');

// ============================================================================
// CONFIGURATION
// ============================================================================

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.join(SCRIPT_DIR, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, 'datamine', 'extracted_astudio');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'download');
const JSON_OUTPUT = path.join(PROJECT_ROOT, 'src', 'data', 'wallpapers.json');

// Minimum width to include
const MIN_WIDTH = 500;

// Categories with their matching rules (order matters - first match wins)
const CATEGORIES = [
  { name: 'Full', match: (name, w, h) => w === 2048 && h === 1024 },
  { name: 'Banner', match: (name) => /_Banner_/.test(name) },
  { name: 'Cutin', match: (name) => /^T_CutIn_/i.test(name) },
  { name: 'Art', match: (name) => /^T_Demi_/.test(name) },
  { name: 'HeroFullArt', match: (name) => /^IMG_\d+/.test(name) },
];

// Filename patterns to EXCLUDE
const EXCLUDE_PATTERNS = [
  /#/,
  /^T_FX_/,
  /(?:^T_.+_(d|body|cloud|a))/i,
  /^FX_/,
  /^T_DL/,
  /^LOADING_/,
  /^T_\d+/,
  /^sactx/i,
  /^\d+_/,
  /^GUIDE_/,
  /^T_Scenario_/,
  /^TT_ImageBox_/,
  /(noise|planet|ring|moon|lava|rock)/i,
  /^Tex_/,
  /(star|space|throne|sun|magic|lobby)/i,
  /_UI/,
  /(leaves|ruins|room|package)/i,
  /^T_PopUP/,
  /^Day_/,
  /^T_Recruit_Normal\.png$/,
  /^T_Dialog_Title\.png$/,
  /^T_Event_World_/,
  /^Lightmap-/,
  /^Patch_Download_/,
  /^T_RaidBG_/,
  /^T_MC/,
  /^T_Intelligence/,
  /^T_Intro/,
  /^CLG_/,
  /^CM_/,
  /^IG_/,
  /^T_GuildRaidBG_/,
  /^T_MonadGate_/,
  /^T_ScenarioBG_\d+/,
  /^T_ScenarioBG_Ending/,
  /^T_(Water|Wind|Snow|Hologram|Emblem|Burn|Blood|Agit)/,
  /^T_Event_(Coin|Box)/,
  /^colormap_/,
  /^mask_/,
  /^PVP_/,
  /^S02/,
  /^SDF_/,
  /^T_Chase/,
  /^T_Core/,
  /^T_Light/,
  /^T_Nebula/,
];

// Path patterns to exclude
const EXCLUDE_PATH_PATTERNS = [
  /model[\\\/]textures/,
];

// Priority scoring for duplicate detection (higher = keep)
function getPriorityScore(filename) {
  let score = 0;
  if (filename.includes('T_ScenarioCG_')) score += 100;
  else if (filename.includes('T_ScenarioBG_')) score += 80;
  else if (filename.includes('T_Event_BG_')) score += 20;
  else if (filename.includes('T_Event_CG')) score += 10;
  if (filename.includes('_E2')) score += 50;
  if (filename.startsWith('IMG_')) {
    const match = filename.match(/IMG_(\d+)/);
    if (match) score -= parseInt(match[1], 10) / 1000;
  }
  return score;
}

// ============================================================================
// UTILITIES
// ============================================================================

async function getImageDimensions(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch {
    return null;
  }
}

/**
 * Compute a simple perceptual hash using average hash algorithm
 * Returns a hex string
 */
async function computePerceptualHash(filePath) {
  try {
    const { data } = await sharp(filePath)
      .resize(16, 16, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate average
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / data.length;

    // Build hash: 1 if pixel > average, 0 otherwise
    let hash = '';
    for (let i = 0; i < data.length; i++) {
      hash += data[i] > avg ? '1' : '0';
    }

    // Convert binary string to hex
    let hex = '';
    for (let i = 0; i < hash.length; i += 4) {
      hex += parseInt(hash.slice(i, i + 4), 2).toString(16);
    }
    return hex;
  } catch {
    return null;
  }
}

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (/\.(png|jpg|webp)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function shouldExclude(filePath, fileName) {
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(fileName)) return true;
  }
  for (const pattern of EXCLUDE_PATH_PATTERNS) {
    if (pattern.test(filePath)) return true;
  }
  return false;
}

function getCategory(fileName, width, height) {
  for (const cat of CATEGORIES) {
    if (cat.match(fileName, width, height)) return cat.name;
  }
  return null; // Uncategorized - will be skipped
}

async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

async function scanAndFilter() {
  console.log('Scanning source directory...');
  const allFiles = getAllFiles(SOURCE_DIR);
  console.log(`Found ${allFiles.length} image files`);

  const validFiles = [];
  let excluded = 0;
  let tooSmall = 0;

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);

    if (shouldExclude(filePath, fileName)) {
      excluded++;
      continue;
    }

    const dims = await getImageDimensions(filePath);
    if (!dims || dims.width < MIN_WIDTH) {
      tooSmall++;
      continue;
    }

    const category = getCategory(fileName, dims.width, dims.height);
    if (!category) {
      continue; // Uncategorized
    }

    validFiles.push({
      path: filePath,
      name: fileName,
      width: dims.width,
      height: dims.height,
      category,
    });
  }

  console.log(`Filtered: ${excluded} excluded by pattern, ${tooSmall} too small`);
  console.log(`Valid files: ${validFiles.length}`);

  return validFiles;
}

async function detectDuplicates(files) {
  console.log('\nComputing perceptual hashes...');
  const hashMap = new Map();

  for (const file of files) {
    const hash = await computePerceptualHash(file.path);
    if (hash) {
      file.hash = hash;
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash).push(file);
    }
  }

  const duplicates = [];
  for (const [hash, group] of hashMap) {
    if (group.length > 1) {
      // Sort by priority score descending
      group.sort((a, b) => getPriorityScore(b.name) - getPriorityScore(a.name));
      duplicates.push({
        keep: group[0],
        remove: group.slice(1),
      });
    }
  }

  return duplicates;
}

async function handleDuplicates(duplicates) {
  if (duplicates.length === 0) {
    console.log('No duplicates found.');
    return new Set();
  }

  console.log(`\nFound ${duplicates.length} groups of duplicates:`);
  let totalToRemove = 0;

  for (let i = 0; i < duplicates.length; i++) {
    const { keep, remove } = duplicates[i];
    console.log(`\nGroup ${i + 1}:`);
    console.log(`  [KEEP]   ${keep.category}/${keep.name} (score: ${getPriorityScore(keep.name).toFixed(1)})`);
    for (const f of remove) {
      console.log(`  [SKIP]   ${f.category}/${f.name} (score: ${getPriorityScore(f.name).toFixed(1)})`);
      totalToRemove++;
    }
  }

  console.log(`\nThis will skip ${totalToRemove} duplicate files.`);

  try {
    const confirmed = await askConfirmation('Proceed? [y/N] ');
    if (!confirmed) {
      console.log('Aborted.');
      process.exit(1);
    }
  } catch {
    // Non-interactive mode
    console.log('Non-interactive mode: proceeding with duplicate removal.');
  }

  // Return set of paths to skip
  const skipPaths = new Set();
  for (const { remove } of duplicates) {
    for (const f of remove) {
      skipPaths.add(f.path);
    }
  }
  return skipPaths;
}

/**
 * Build hash map of existing files in destination
 */
async function buildExistingHashMap() {
  console.log('\nScanning existing files in destination...');
  const hashMap = new Map();

  for (const cat of CATEGORIES) {
    const dir = path.join(OUTPUT_DIR, cat.name);
    if (!fs.existsSync(dir)) continue;

    const entries = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    for (const entry of entries) {
      const filePath = path.join(dir, entry);
      const hash = await computePerceptualHash(filePath);
      if (hash) {
        hashMap.set(hash, { path: filePath, name: entry, category: cat.name });
      }
    }
  }

  console.log(`Found ${hashMap.size} existing files with hashes`);
  return hashMap;
}

async function copyFiles(files, skipPaths, existingHashes) {
  console.log('\nCopying files...');

  // Ensure category directories exist
  for (const cat of CATEGORIES) {
    ensureDir(path.join(OUTPUT_DIR, cat.name));
  }

  let copied = 0;
  let skippedDupes = 0;
  const copiedNames = new Map(); // Track copied filenames per category

  for (const file of files) {
    if (skipPaths.has(file.path)) continue;

    // Check if this file already exists in destination (by hash)
    if (file.hash && existingHashes.has(file.hash)) {
      skippedDupes++;
      continue;
    }

    const destDir = path.join(OUTPUT_DIR, file.category);
    let destName = file.name;

    // Handle filename collisions within same category
    const key = `${file.category}/${file.name}`;
    if (copiedNames.has(key)) {
      const existing = copiedNames.get(key);
      if (existing.width === file.width && existing.height === file.height) {
        continue; // Same dimensions, skip
      }
      // Different dimensions, rename
      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext);
      let counter = 1;
      do {
        destName = `${base}_${counter}${ext}`;
        counter++;
      } while (copiedNames.has(`${file.category}/${destName}`));
    }

    const destPath = path.join(destDir, destName);
    fs.copyFileSync(file.path, destPath);
    copiedNames.set(`${file.category}/${destName}`, { width: file.width, height: file.height });
    copied++;
  }

  console.log(`Copied ${copied} files (skipped ${skippedDupes} duplicates already in destination)`);
}

function generateJson() {
  console.log('\nGenerating wallpapers.json...');

  const result = {};
  let totalCount = 0;

  // Simple categories
  const simpleCategories = CATEGORIES.map(c => c.name).filter(n => n !== 'Full');

  for (const cat of simpleCategories) {
    const dir = path.join(OUTPUT_DIR, cat);
    if (!fs.existsSync(dir)) {
      result[cat] = [];
      continue;
    }

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.png'))
      .map(f => f.replace('.png', ''))
      .sort();

    result[cat] = files.map(filename => {
      const dims = getPngDimensions(path.join(dir, `${filename}.png`));
      return { f: filename, w: dims?.width ?? 0, h: dims?.height ?? 0 };
    });
    totalCount += files.length;
  }

  // Split Full folder into subcategories
  const fullDir = path.join(OUTPUT_DIR, 'Full');
  if (fs.existsSync(fullDir)) {
    const allFiles = fs.readdirSync(fullDir)
      .filter(f => f.endsWith('.png'))
      .map(f => f.replace('.png', ''))
      .sort();

    const events = allFiles.filter(f => f.startsWith('T_Event'));
    const scenario = allFiles.filter(f => f.startsWith('T_Scenario'));
    const others = allFiles.filter(f => !f.startsWith('T_Event') && !f.startsWith('T_Scenario'));

    result['Full:Events'] = processFilesForJson(fullDir, events);
    result['Full:Scenario'] = processFilesForJson(fullDir, scenario);
    result['Full:Others'] = processFilesForJson(fullDir, others);

    totalCount += allFiles.length;
  }

  fs.writeFileSync(JSON_OUTPUT, JSON.stringify(result, null, 2));
  console.log(`Generated wallpapers.json with ${totalCount} images`);
}

function getPngDimensions(filePath) {
  try {
    const buffer = Buffer.alloc(24);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);

    if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      return null;
    }

    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  } catch {
    return null;
  }
}

function processFilesForJson(dir, filenames) {
  return filenames.map(filename => {
    const dims = getPngDimensions(path.join(dir, `${filename}.png`));
    return { f: filename, w: dims?.width ?? 0, h: dims?.height ?? 0 };
  });
}

// ============================================================================
// CHECK DUPLICATES IN EXISTING FILES
// ============================================================================

async function scanExistingFiles() {
  console.log('Scanning existing files in public/images/download...');
  const files = [];

  for (const cat of CATEGORIES) {
    const dir = path.join(OUTPUT_DIR, cat.name);
    if (!fs.existsSync(dir)) continue;

    const entries = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    for (const entry of entries) {
      const filePath = path.join(dir, entry);
      const dims = await getImageDimensions(filePath);
      files.push({
        path: filePath,
        name: entry,
        category: cat.name,
        width: dims?.width ?? 0,
        height: dims?.height ?? 0,
      });
    }
  }

  console.log(`Found ${files.length} existing files`);
  return files;
}

async function checkAndDeleteDuplicates(duplicates) {
  if (duplicates.length === 0) {
    console.log('No duplicates found.');
    return;
  }

  console.log(`\nFound ${duplicates.length} groups of duplicates:`);
  let totalToDelete = 0;

  for (let i = 0; i < duplicates.length; i++) {
    const { keep, remove } = duplicates[i];
    console.log(`\nGroup ${i + 1}:`);
    console.log(`  [KEEP]   ${keep.category}/${keep.name} (score: ${getPriorityScore(keep.name).toFixed(1)})`);
    for (const f of remove) {
      console.log(`  [DELETE] ${f.category}/${f.name} (score: ${getPriorityScore(f.name).toFixed(1)})`);
      totalToDelete++;
    }
  }

  console.log(`\nThis will delete ${totalToDelete} PNG files (+ their WebP versions).`);

  let confirmed = false;
  try {
    confirmed = await askConfirmation('Delete duplicates? [y/N] ');
  } catch {
    console.log('Non-interactive mode: skipping deletion.');
    return;
  }

  if (!confirmed) {
    console.log('Aborted.');
    return;
  }

  // Delete duplicates
  let deleted = 0;
  for (const { remove } of duplicates) {
    for (const f of remove) {
      // Delete PNG
      if (fs.existsSync(f.path)) {
        fs.unlinkSync(f.path);
        console.log(`  Deleted: ${f.category}/${f.name}`);
        deleted++;
      }
      // Delete WebP if exists
      const webpPath = f.path.replace(/\.png$/, '.webp');
      if (fs.existsSync(webpPath)) {
        fs.unlinkSync(webpPath);
        deleted++;
      }
    }
  }

  console.log(`\nDeleted ${deleted} files.`);
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';

  switch (command) {
    case 'full':
      // Full pipeline: scan, detect duplicates, copy, generate JSON
      console.log('=== Wallpaper Processing (Full) ===\n');
      // 1. Build hash map of existing files in destination
      const existingHashes = await buildExistingHashMap();
      // 2. Scan and filter source files
      const files = await scanAndFilter();
      // 3. Compute hashes for source files and detect duplicates among them
      const duplicates = await detectDuplicates(files);
      const skipPaths = await handleDuplicates(duplicates);
      // 4. Copy files, skipping those that already exist in destination
      await copyFiles(files, skipPaths, existingHashes);
      generateJson();
      console.log('\nDone!');
      break;

    case 'json':
      // Only regenerate JSON from existing files
      console.log('=== Generating wallpapers.json ===\n');
      generateJson();
      break;

    case 'scan':
      // Only scan and show what would be processed
      console.log('=== Scanning (dry run) ===\n');
      const scanFiles = await scanAndFilter();
      const counts = {};
      for (const f of scanFiles) {
        counts[f.category] = (counts[f.category] || 0) + 1;
      }
      console.log('\nBy category:');
      for (const [cat, count] of Object.entries(counts)) {
        console.log(`  ${cat}: ${count}`);
      }
      break;

    case 'check':
      // Check duplicates in existing files and optionally delete
      console.log('=== Checking Duplicates in Existing Files ===\n');
      const existingFiles = await scanExistingFiles();
      const existingDuplicates = await detectDuplicates(existingFiles);
      await checkAndDeleteDuplicates(existingDuplicates);
      break;

    default:
      console.log('Usage: node wallpapers.js [command]');
      console.log('Commands:');
      console.log('  full  - Full pipeline (default)');
      console.log('  json  - Only regenerate wallpapers.json');
      console.log('  scan  - Dry run, show what would be processed from source');
      console.log('  check - Check duplicates in existing files, optionally delete');
      break;
  }
}

main().catch(console.error);

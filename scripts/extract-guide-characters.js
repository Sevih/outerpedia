/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const guidesDir = path.join(__dirname, '../src/app/guides/_contents');
const guildRaidDir = path.join(__dirname, '../src/data/guides/guild-raid');
const skywardDataDir = path.join(__dirname, '../src/data');
const outputFile = path.join(__dirname, '../src/data/stats/guide-character-usage.json');
const allCharactersFile = path.join(__dirname, '../src/data/_allCharacters.json');

// Categories to exclude
const EXCLUDED_CATEGORIES = ['general-guides', 'monad-gate'];

// Load all characters
let allCharacters = [];
try {
  const charactersData = fs.readFileSync(allCharactersFile, 'utf8');
  allCharacters = JSON.parse(charactersData);
} catch (error) {
  console.error(`Error loading characters file: ${error.message}`);
  process.exit(1);
}

function extractCharactersFromTSX(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundCharacters = [];

    // Pour chaque personnage, vérifier s'il apparaît dans le fichier entre quotes
    for (const character of allCharacters) {
      const fullname = character.Fullname;

      // Échapper les caractères spéciaux pour regex
      const escapedName = fullname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Chercher le nom entouré de quotes simples ou doubles
      const regex = new RegExp(`['"]${escapedName}['"]`);

      if (regex.test(content)) {
        foundCharacters.push(fullname);
      }
    }

    return foundCharacters;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return [];
  }
}

function extractCharactersFromArray(arr) {
  const characters = new Set();

  function processValue(value) {
    if (typeof value === 'string') {
      characters.add(value);
    } else if (Array.isArray(value)) {
      value.forEach(processValue);
    }
  }

  if (Array.isArray(arr)) {
    arr.forEach(processValue);
  }

  return Array.from(characters);
}

function extractFromGuildRaidJSON(filePath, filename) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const characters = new Set();

    // Parcourir toutes les versions (v1, v2, etc.)
    Object.values(data).forEach(version => {
      // Phase 1: bosses avec leurs teams
      if (version.phase1 && version.phase1.bosses) {
        version.phase1.bosses.forEach(boss => {
          if (boss.team) {
            extractCharactersFromArray(boss.team).forEach(char => characters.add(char));
          }
          if (boss.recommended) {
            boss.recommended.forEach(rec => {
              if (rec.name) characters.add(rec.name);
            });
          }
        });
      }

      // Phase 2: teams avec setup
      if (version.phase2 && version.phase2.teams) {
        Object.values(version.phase2.teams).forEach(team => {
          if (team.setup) {
            extractCharactersFromArray(team.setup).forEach(char => characters.add(char));
          }
        });
      }
    });

    return Array.from(characters);
  } catch (error) {
    console.error(`Error reading guild raid JSON ${filePath}: ${error.message}`);
    return [];
  }
}

function extractFromSkywardJSON(filePath, difficulty) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const characters = new Set();

    // Le fichier est un array de floors
    if (Array.isArray(data)) {
      data.forEach(floor => {
        if (floor.teams) {
          Object.values(floor.teams).forEach(team => {
            if (team.setup) {
              extractCharactersFromArray(team.setup).forEach(char => characters.add(char));
            }
          });
        }
      });
    }

    return Array.from(characters);
  } catch (error) {
    console.error(`Error reading skyward JSON ${filePath}: ${error.message}`);
    return [];
  }
}

function walkTSXDirectory(dir, category = '', parentDirName = '') {
  const results = {};

  // Skip excluded categories
  if (EXCLUDED_CATEGORIES.includes(category)) {
    console.log(`⏭️  Skipping category: ${category}`);
    return results;
  }

  try {
    const files = fs.readdirSync(dir);

    // Detect if this is a multilingual guide folder (contains en.tsx, jp.tsx, kr.tsx)
    const hasEnFile = files.includes('en.tsx');
    const hasJpFile = files.includes('jp.tsx');
    const hasKrFile = files.includes('kr.tsx');
    const isMultilingualFolder = hasEnFile || hasJpFile || hasKrFile;

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Pass the directory name as parentDirName for nested guides
        const subResults = walkTSXDirectory(fullPath, category || file, file);
        Object.assign(results, subResults);
      } else if (file.endsWith('.tsx')) {
        const fileName = path.basename(file, '.tsx');

        // For multilingual folders, only process 'en.tsx' to avoid duplicates
        if (isMultilingualFolder && fileName !== 'en') {
          continue;
        }

        const characters = extractCharactersFromTSX(fullPath);

        if (characters.length > 0) {
          // If it's a multilingual guide (en.tsx/jp.tsx/kr.tsx), use parent directory name
          // Otherwise use the file name
          const guideId = isMultilingualFolder ? parentDirName : fileName;
          const key = `${category}/${guideId}`;

          results[key] = {
            category: category,
            guideId: guideId,
            characters: characters
          };
        }
      }
    }
  } catch (error) {
    console.error(`Error walking directory ${dir}: ${error.message}`);
  }

  return results;
}

function processGuildRaids() {
  const results = {};

  try {
    const files = fs.readdirSync(guildRaidDir);

    for (const file of files) {
      if (!file.endsWith('.json') || file === 'empty.json') continue;

      const fullPath = path.join(guildRaidDir, file);
      const guideId = path.basename(file, '.json');
      const characters = extractFromGuildRaidJSON(fullPath, file);

      if (characters.length > 0) {
        const key = `guild-raid/${guideId}`;
        results[key] = {
          category: 'guild-raid',
          guideId: guideId,
          characters: characters
        };
      }
    }
  } catch (error) {
    console.error(`Error processing guild raids: ${error.message}`);
  }

  return results;
}

function processSkywardTowers() {
  const results = {};
  const difficulties = [
    { file: 'skywardNormal.json', id: 'normal' },
    { file: 'skywardHard.json', id: 'hard' },
    { file: 'skywardVeryHard.json', id: 'very-hard' }
  ];

  for (const { file, id } of difficulties) {
    const fullPath = path.join(skywardDataDir, file);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Skyward file not found: ${file}`);
      continue;
    }

    const characters = extractFromSkywardJSON(fullPath, id);

    if (characters.length > 0) {
      const key = `skyward-tower/${id}`;
      results[key] = {
        category: 'skyward-tower',
        guideId: id,
        characters: characters
      };
    }
  }

  return results;
}

// Créer le dossier si nécessaire
const statsDir = path.dirname(outputFile);
if (!fs.existsSync(statsDir)) {
  fs.mkdirSync(statsDir, { recursive: true });
}

// Extraire les données
console.log('📊 Extracting character usage from guides...\n');

console.log('1️⃣  Processing TSX guides...');
const tsxData = walkTSXDirectory(guidesDir);
console.log(`   ✅ Found ${Object.keys(tsxData).length} TSX guides\n`);

console.log('2️⃣  Processing Guild Raid JSONs...');
const guildRaidData = processGuildRaids();
console.log(`   ✅ Found ${Object.keys(guildRaidData).length} guild raid guides\n`);

console.log('3️⃣  Processing Skyward Tower JSONs...');
const skywardData = processSkywardTowers();
console.log(`   ✅ Found ${Object.keys(skywardData).length} skyward tower difficulties\n`);

// Combiner toutes les données
const allData = {
  ...tsxData,
  ...guildRaidData,
  ...skywardData
};

// Sauvegarder
fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Total: ${Object.keys(allData).length} guides processed`);
console.log(`📁 Output: ${outputFile}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

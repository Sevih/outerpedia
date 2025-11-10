const fs = require('fs');
const path = require('path');

// Chemins
const BOSS_DATA_DIR = path.join(__dirname, '..', 'src', 'data', 'boss');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'boss', 'index.json');

/**
 * Extrait le numéro de stage depuis le nom du donjon
 * Ex: "Masterless Guardian (Stage 13)" -> 13
 */
function extractStageNumber(dungeonName) {
  const match = dungeonName.match(/Stage\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Génère une clé unique pour grouper les variations d'un même boss
 */
function generateBossKey(bossData) {
  const name = bossData.Name.en;
  const mode = bossData.location.mode.en;
  return `${name}|${mode}`;
}

/**
 * Crée un résumé du boss pour l'index
 */
function createBossSummary(bossData) {
  return {
    id: bossData.id,
    level: bossData.level,
    stage: extractStageNumber(bossData.location.dungeon.en),
    element: bossData.element,
    class: bossData.class
  };
}

/**
 * Génère l'index des boss
 */
function generateBossIndex() {
  console.log('🔍 Recherche des fichiers boss...');

  // Lire tous les fichiers JSON
  const files = fs.readdirSync(BOSS_DATA_DIR)
    .filter(file => file.endsWith('.json') && file !== 'index.json');

  console.log(`📁 ${files.length} fichiers trouvés`);

  // Structure: { "Nom du Boss": { "Nom du Mode": { "id": { "label": {...localized...} } } } }
  const index = {};

  for (const file of files) {
    const filePath = path.join(BOSS_DATA_DIR, file);
    const bossData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const bossName = bossData.Name.en;
    const modeName = bossData.location.mode.en;
    const bossId = bossData.id;
    const dungeonLabel = bossData.location.dungeon; // Objet localisé complet

    // Créer la structure si elle n'existe pas
    if (!index[bossName]) {
      index[bossName] = {};
    }
    if (!index[bossName][modeName]) {
      index[bossName][modeName] = {};
    }

    // Stocker l'ID avec son label localisé
    index[bossName][modeName][bossId] = {
      label: dungeonLabel
    };
  }

  console.log(`\n📊 Résumé de l'index:`);
  console.log(`   Total de boss: ${Object.keys(index).length}`);

  for (const [bossName, modes] of Object.entries(index)) {
    console.log(`\n   ${bossName}`);
    for (const [modeName, dungeons] of Object.entries(modes)) {
      const dungeonCount = Object.keys(dungeons).length;
      console.log(`   └─ ${modeName}: ${dungeonCount} donjon${dungeonCount > 1 ? 's' : ''}`);
    }
  }

  // Sauvegarder l'index
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`\n✅ Index généré: ${OUTPUT_FILE}`);

  return index;
}

// Exécuter le script
if (require.main === module) {
  try {
    generateBossIndex();
  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'index:', error);
    process.exit(1);
  }
}

module.exports = { generateBossIndex };

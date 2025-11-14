const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths
const BOSS_DIR = path.join(__dirname, '../src/data/boss');
const BUFFS_PATH = path.join(__dirname, '../src/data/buffs.json');
const DEBUFFS_PATH = path.join(__dirname, '../src/data/debuffs.json');
const INDEX_PATH = path.join(BOSS_DIR, 'index.json');
const PATTERNS_PATH = path.join(__dirname, 'buff-debuff-patterns.json');
const COMPLETED_PATH = path.join(__dirname, 'completed-bosses.json');

// Load data
let buffs = [];
let debuffs = [];
let bossIndex = {};
let patterns = [];
let completedBosses = [];

// Maps pour retrouver les labels rapidement
let buffLabels = new Map();
let debuffLabels = new Map();

function loadData() {
  try {
    buffs = JSON.parse(fs.readFileSync(BUFFS_PATH, 'utf8'));
    debuffs = JSON.parse(fs.readFileSync(DEBUFFS_PATH, 'utf8'));
    bossIndex = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));

    // Créer les maps de labels
    buffs.forEach(buff => {
      buffLabels.set(buff.name, buff.label);
    });
    debuffs.forEach(debuff => {
      debuffLabels.set(debuff.name, debuff.label);
    });

    // Load patterns
    if (fs.existsSync(PATTERNS_PATH)) {
      const patternsData = JSON.parse(fs.readFileSync(PATTERNS_PATH, 'utf8'));
      patterns = patternsData.patterns || [];
    }

    // Load completed bosses
    if (fs.existsSync(COMPLETED_PATH)) {
      const completedData = JSON.parse(fs.readFileSync(COMPLETED_PATH, 'utf8'));
      completedBosses = completedData.completed || [];
    }

    console.log('✓ Données chargées avec succès\n');
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error.message);
    process.exit(1);
  }
}

function getLabel(code, type) {
  const labelMap = type === 'buff' ? buffLabels : debuffLabels;
  return labelMap.get(code) || code;
}

function savePatterns() {
  try {
    // Trier les patterns par code avant de sauvegarder
    const sortedPatterns = [...patterns].sort((a, b) => {
      return a.code.localeCompare(b.code);
    });
    fs.writeFileSync(PATTERNS_PATH, JSON.stringify({ patterns: sortedPatterns }, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des patterns:', error.message);
  }
}

function saveCompletedBosses() {
  try {
    fs.writeFileSync(COMPLETED_PATH, JSON.stringify({ completed: completedBosses }, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des boss complétés:', error.message);
  }
}

function markBossAsCompleted(bossId) {
  if (!completedBosses.includes(bossId)) {
    completedBosses.push(bossId);
    saveCompletedBosses();
    console.log(`✓ Boss ${bossId} marqué comme complété`);
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function displayBossList(filterCompleted = false) {
  console.log('\n=== LISTE DES BOSS ===\n');
  let index = 1;
  const bossMap = new Map();

  for (const [bossName, modes] of Object.entries(bossIndex)) {
    let hasBosses = false;
    let bossOutput = `\n${bossName}:\n`;

    for (const [mode, stages] of Object.entries(modes)) {
      // stages is now an array of { id, label }
      for (const stage of stages) {
        // Skip completed bosses if filtering is enabled
        if (filterCompleted && completedBosses.includes(stage.id)) {
          continue;
        }

        const completedMark = completedBosses.includes(stage.id) ? ' ✓' : '';
        bossOutput += `  ${index}. ${stage.label.en} (ID: ${stage.id})${completedMark}\n`;
        bossMap.set(index, { id: stage.id, name: bossName, label: stage.label.en });
        index++;
        hasBosses = true;
      }
    }

    if (hasBosses) {
      console.log(bossOutput.trimEnd());
    }
  }

  return bossMap;
}

function loadBossFile(bossId) {
  const filePath = path.join(BOSS_DIR, `${bossId}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Le fichier boss ${bossId}.json n'existe pas`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveBossFile(bossId, data) {
  const filePath = path.join(BOSS_DIR, `${bossId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✓ Fichier sauvegardé: ${filePath}`);
}

async function addBuffDebuffToSkill(boss, skillIndex, buffDebuffCode, type) {
  const skill = boss.skills[skillIndex];
  const key = type; // 'buff' or 'debuff'

  if (!skill[key]) {
    skill[key] = [];
  }

  if (skill[key].includes(buffDebuffCode)) {
    console.log(`\n⚠ Ce ${type} existe déjà pour cette compétence`);
    return false;
  }

  skill[key].push(buffDebuffCode);
  console.log(`\n✓ ${type.charAt(0).toUpperCase() + type.slice(1)} ajouté: ${buffDebuffCode}`);
  return true;
}

async function smartMode() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║      MODE INTELLIGENT - AUTO-LEARNING     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  loadData();

  console.log(`📊 Boss complétés: ${completedBosses.length}`);

  // Sélection du boss (filtrer les complétés)
  const bossMap = displayBossList(true);
  const bossChoice = await question('\nChoisissez un boss (numéro): ');
  const selectedBoss = bossMap.get(parseInt(bossChoice));

  if (!selectedBoss) {
    console.log('❌ Choix invalide');
    rl.close();
    return;
  }

  console.log(`\n✓ Boss sélectionné: ${selectedBoss.label}`);

  // Charger les données du boss
  let bossData;
  try {
    bossData = loadBossFile(selectedBoss.id);
  } catch (error) {
    console.log(`❌ ${error.message}`);
    rl.close();
    return;
  }

  console.log(`\n📚 Patterns chargés: ${patterns.length}`);
  console.log('\n=== MODE INTELLIGENT ===');
  console.log('Le script va analyser chaque skill et:');
  console.log('  1. Détecter automatiquement les patterns connus');
  console.log('  2. Vous demander si vous voulez ajouter de nouveaux patterns\n');

  const modifications = [];

  // Parcourir chaque skill
  for (let i = 0; i < bossData.skills.length; i++) {
    const skill = bossData.skills[i];
    console.log('\n' + '='.repeat(60));
    console.log(`\n🎯 SKILL ${i + 1}: ${skill.name.en} (${skill.type})`);
    console.log('\nDescription (EN):');
    console.log(skill.description.en);

    if (skill.buff && skill.buff.length > 0) {
      console.log(`\n✓ Buffs actuels: ${skill.buff.join(', ')}`);
    }
    if (skill.debuff && skill.debuff.length > 0) {
      console.log(`\n✓ Debuffs actuels: ${skill.debuff.join(', ')}`);
    }

    // Chercher des patterns qui matchent
    const detectedPatterns = [];
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.pattern);
      if (regex.test(skill.description.en)) {
        detectedPatterns.push(pattern);
      }
    }

    // Appliquer les patterns détectés
    if (detectedPatterns.length > 0) {
      console.log('\n🔍 Patterns détectés:');
      for (const pattern of detectedPatterns) {
        // Split codes if they contain commas
        const codes = pattern.code.split(',').map(c => c.trim());

        // Afficher avec les labels
        const codesWithLabels = codes.map(code => {
          const label = getLabel(code, pattern.type);
          return `${label} (${code})`;
        }).join(', ');

        console.log(`  - Pattern: "${pattern.pattern}" → ${pattern.type}: ${codesWithLabels}`);

        modifications.push({
          skillIndex: i,
          type: pattern.type,
          codes: codes,
          auto: true,
          pattern: pattern.pattern
        });
      }
    } else {
      console.log('\n❌ Aucun pattern détecté');
    }

    // Boucle pour ajouter plusieurs patterns pour cette skill
    let continueAddingPatterns = true;
    while (continueAddingPatterns) {
      const addNew = await question('\nVoulez-vous ajouter un nouveau pattern pour cette skill? (y/n): ');

      if (addNew.toLowerCase() === 'y') {
        const patternStr = await question('Entrez le pattern à détecter (regex): ');
        const typeChoice = await question('Type: (b)uff ou (d)ebuff? [b/d]: ');
        const type = typeChoice.toLowerCase() === 'd' ? 'debuff' : 'buff';
        const code = await question(`Entrez le code du ${type}: `);

        // Ajouter le pattern à la base
        patterns.push({
          pattern: patternStr,
          type: type,
          code: code
        });

        // Sauvegarder immédiatement dans le fichier
        savePatterns();
        console.log(`✓ Pattern sauvegardé dans buff-debuff-patterns.json`);

        // Ajouter aux modifications (split codes if they contain commas)
        const codes = code.split(',').map(c => c.trim());
        modifications.push({
          skillIndex: i,
          type: type,
          codes: codes,
          auto: false,
          pattern: patternStr
        });

        console.log(`✓ Pattern ajouté et sera appliqué au boss`);
      } else {
        continueAddingPatterns = false;
      }
    }

  }

  if (modifications.length === 0) {
    console.log('\n⚠ Aucune modification à appliquer');
    rl.close();
    return;
  }

  // Afficher le récapitulatif
  console.log('\n' + '='.repeat(60));
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║           RÉCAPITULATIF                    ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const groupedMods = {};
  for (const mod of modifications) {
    const key = mod.skillIndex;
    if (!groupedMods[key]) {
      groupedMods[key] = { buffs: [], debuffs: [] };
    }
    if (mod.type === 'buff') {
      groupedMods[key].buffs.push(...mod.codes);
    } else {
      groupedMods[key].debuffs.push(...mod.codes);
    }
  }

  for (const [skillIndex, changes] of Object.entries(groupedMods)) {
    const skill = bossData.skills[parseInt(skillIndex)];
    console.log(`\n${skill.name.en} (${skill.type}):`);
    if (changes.buffs.length > 0) {
      console.log(`  Buffs actuels: ${skill.buff ? skill.buff.join(', ') : 'aucun'}`);
      console.log(`  → Ajouter buffs: ${changes.buffs.join(', ')}`);
    }
    if (changes.debuffs.length > 0) {
      console.log(`  Debuffs actuels: ${skill.debuff ? skill.debuff.join(', ') : 'aucun'}`);
      console.log(`  → Ajouter debuffs: ${changes.debuffs.join(', ')}`);
    }
  }

  // Demander confirmation
  const confirm = await question('\n\nConfirmer ces modifications ? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('\n✗ Modifications annulées');
    rl.close();
    return;
  }

  // Appliquer les modifications
  let successCount = 0;
  for (const mod of modifications) {
    for (const code of mod.codes) {
      const success = await addBuffDebuffToSkill(bossData, mod.skillIndex, code, mod.type);
      if (success) successCount++;
    }
  }

  console.log(`\n✓ ${successCount} modification(s) appliquée(s)`);

  // Sauvegarder le boss
  saveBossFile(selectedBoss.id, bossData);
  console.log('✓ Fichier boss sauvegardé !');

  // Sauvegarder les patterns
  savePatterns();
  console.log(`✓ Patterns sauvegardés (${patterns.length} patterns au total) !`);

  // Proposer de marquer le boss comme complété
  const markComplete = await question('\n❓ Marquer ce boss comme complété ? (y/n): ');
  if (markComplete.toLowerCase() === 'y') {
    markBossAsCompleted(selectedBoss.id);
  }

  rl.close();
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  SCRIPT D\'AJOUT DE BUFF/DEBUFF AUX BOSS  ║');
  console.log('║      MODE INTELLIGENT - AUTO-LEARNING     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  await smartMode();
}

main().catch(error => {
  console.error('❌ Erreur:', error);
  rl.close();
  process.exit(1);
});

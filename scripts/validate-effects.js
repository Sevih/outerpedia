const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const PARTNERS_PATH = path.join(__dirname, '../src/data/partners.json');
const HERO_PROS_CONS_PATH = path.join(__dirname, '../src/data/hero-pros-cons.json');
const BUFFS_PATH = path.join(__dirname, '../src/data/buffs.json');
const DEBUFFS_PATH = path.join(__dirname, '../src/data/debuffs.json');

// Couleurs pour la console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Fonction pour extraire toutes les références {B/XXX} et {D/XXX} d'une chaîne
function extractEffectReferences(text) {
  if (typeof text !== 'string') return [];

  const buffRegex = /\{B\/([^}]+)\}/g;
  const debuffRegex = /\{D\/([^}]+)\}/g;

  const buffs = [];
  const debuffs = [];

  let match;
  while ((match = buffRegex.exec(text)) !== null) {
    buffs.push({ type: 'buff', name: match[1], original: match[0] });
  }

  while ((match = debuffRegex.exec(text)) !== null) {
    debuffs.push({ type: 'debuff', name: match[1], original: match[0] });
  }

  return [...buffs, ...debuffs];
}

// Fonction pour extraire récursivement toutes les références d'un objet
function extractAllReferences(obj, path = '') {
  const references = [];

  if (typeof obj === 'string') {
    const refs = extractEffectReferences(obj);
    refs.forEach(ref => references.push({ ...ref, path }));
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      references.push(...extractAllReferences(item, `${path}[${index}]`));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      references.push(...extractAllReferences(obj[key], path ? `${path}.${key}` : key));
    });
  }

  return references;
}

// Fonction principale de validation
function validateEffects() {
  console.log('🔍 Validation des références buff/debuff...\n');

  // Charger les données
  let partners, heroProsCons, buffs, debuffs;

  try {
    partners = JSON.parse(fs.readFileSync(PARTNERS_PATH, 'utf8'));
    heroProsCons = JSON.parse(fs.readFileSync(HERO_PROS_CONS_PATH, 'utf8'));
    buffs = JSON.parse(fs.readFileSync(BUFFS_PATH, 'utf8'));
    debuffs = JSON.parse(fs.readFileSync(DEBUFFS_PATH, 'utf8'));
  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors du chargement des fichiers:${colors.reset}`, error.message);
    process.exit(1);
  }

  // Créer des sets de noms valides
  const validBuffNames = new Set(buffs.map(b => b.name));
  const validDebuffNames = new Set(debuffs.map(d => d.name));

  console.log(`📊 Buffs valides: ${validBuffNames.size}`);
  console.log(`📊 Debuffs valides: ${validDebuffNames.size}\n`);

  // Extraire toutes les références
  const partnersRefs = extractAllReferences(partners, 'partners.json');
  const heroProsConsRefs = extractAllReferences(heroProsCons, 'hero-pros-cons.json');
  const allRefs = [...partnersRefs, ...heroProsConsRefs];

  console.log(`📝 Références trouvées: ${allRefs.length}\n`);

  // Valider les références
  const errors = [];
  const validRefs = [];

  allRefs.forEach(ref => {
    const validNames = ref.type === 'buff' ? validBuffNames : validDebuffNames;

    if (!validNames.has(ref.name)) {
      errors.push(ref);
    } else {
      validRefs.push(ref);
    }
  });

  // Afficher les résultats
  if (errors.length === 0) {
    console.log(`${colors.green}✅ Toutes les références sont valides!${colors.reset}`);
    console.log(`${colors.green}   ${validRefs.length} références vérifiées avec succès.${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}❌ ${errors.length} référence(s) invalide(s) trouvée(s):${colors.reset}\n`);

    // Grouper les erreurs par fichier
    const errorsByFile = {};
    errors.forEach(error => {
      const fileName = error.path.split('.')[0];
      if (!errorsByFile[fileName]) {
        errorsByFile[fileName] = [];
      }
      errorsByFile[fileName].push(error);
    });

    // Afficher les erreurs groupées
    Object.keys(errorsByFile).forEach(fileName => {
      console.log(`${colors.yellow}📄 ${fileName}:${colors.reset}`);
      errorsByFile[fileName].forEach(error => {
        console.log(`   ${colors.red}✗${colors.reset} ${error.original} (${error.name})`);
        console.log(`     Chemin: ${error.path}`);
      });
      console.log('');
    });

    // Afficher les suggestions
    console.log(`${colors.yellow}💡 Suggestions:${colors.reset}`);
    errors.forEach(error => {
      const validNames = error.type === 'buff' ? Array.from(validBuffNames) : Array.from(validDebuffNames);
      const similar = validNames.filter(name =>
        name.toLowerCase().includes(error.name.toLowerCase()) ||
        error.name.toLowerCase().includes(name.toLowerCase())
      );

      if (similar.length > 0) {
        console.log(`   ${error.original} → Peut-être: ${similar.slice(0, 3).join(', ')}`);
      }
    });

    return false;
  }
}

// Exécuter la validation
const isValid = validateEffects();
process.exit(isValid ? 0 : 1);

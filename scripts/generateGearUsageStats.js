/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const recoDir = path.join(__dirname, '../src/data/reco');
const outputPath = path.join(__dirname, '../src/data/stats/gear-usage.json');

const weaponsPath = path.join(__dirname, '../src/data/weapon.json');
const amuletPath = path.join(__dirname, '../src/data/amulet.json');
const setsPath = path.join(__dirname, '../src/data/sets.json');
const charactersDir = path.join(__dirname, '../src/data/char');

/* ---------------- Helpers ---------------- */

function safeReadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function listFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.json'));
}

function loadCharNames() {
  const slugToName = {};
  const files = listFiles(charactersDir);
  for (const file of files) {
    const raw = fs.readFileSync(path.join(charactersDir, file), 'utf-8');
    const json = JSON.parse(raw);
    const en = json.Fullname || json.name || json.Name || '';
    slugToName[file.replace(/\.json$/, '')] = en;
  }
  return slugToName;
}

// normalisation (case/espaces) pour les clés d’index
function normKey(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// enlève un suffixe " set" (insensible à la casse/espaces)
function stripSetSuffix(enName) {
  return String(enName || '').replace(/\s*set\s*$/i, '').trim();
}

// stats internes indexées par nom EN canonique
const stats = {}; // keyEn -> { name: keyEn, type, class, users:Set<slug> }

function ensureEntry(nameEn, type, cls) {
  if (!stats[nameEn]) {
    stats[nameEn] = { name: nameEn, type, class: cls ?? null, users: new Set() };
  } else if (stats[nameEn].class == null && cls != null) {
    stats[nameEn].class = cls;
  }
}

function markUsed(rawName, fallbackType, charSlug, index) {
  const hit = index.get(normKey(rawName));
  const nameEn = hit?.keyEn || rawName; // si pas trouvé, on garde tel quel
  const type = hit?.type || fallbackType || 'Unknown';
  const cls = hit?.class ?? null;

  ensureEntry(nameEn, type, cls);
  stats[nameEn].users.add(charSlug);
}

/* ------------- Build item index (avec alias) ------------- */

function buildItemIndex() {
  // Map clé normalisée -> payload
  const index = new Map();
  // Liste complète des items pour garantir la complétude
  const all = [];

  // Weapons
  if (fs.existsSync(weaponsPath)) {
    const weapons = safeReadJSON(weaponsPath);
    for (const w of weapons) {
      const keyEn = w.name;
      const payload = { keyEn, type: 'Weapon', class: w.class ?? null };
      all.push(payload);
      index.set(normKey(keyEn), payload);
    }
  }

  // Amulets
  if (fs.existsSync(amuletPath)) {
    const amulets = safeReadJSON(amuletPath);
    for (const a of amulets) {
      const keyEn = a.name;
      const payload = { keyEn, type: 'Amulet', class: a.class ?? null };
      all.push(payload);
      index.set(normKey(keyEn), payload);
    }
  }

  // Sets : ajouter alias sans "Set" pour matcher les reco qui écrivent "Attack"
  if (fs.existsSync(setsPath)) {
    const sets = safeReadJSON(setsPath);
    for (const s of sets) {
      const keyEn = s.name; // ex: "Attack Set"
      const payload = { keyEn, type: 'Set', class: null };
      all.push(payload);

      // indexer version exacte
      index.set(normKey(keyEn), payload);

      // indexer alias sans suffixe "Set" (ex: "Attack")
      const without = stripSetSuffix(keyEn);
      if (without && without.toLowerCase() !== keyEn.toLowerCase()) {
        index.set(normKey(without), payload);
      }
    }
  }

  return { index, all };
}

function ensureAllItemsPresent(all) {
  for (const it of all) {
    ensureEntry(it.keyEn, it.type, it.class ?? null);
  }
}

/* -------------------- Main -------------------- */

async function main() {
  const slugToName = loadCharNames();
  const files = listFiles(recoDir);
  console.log(`📁 ${files.length} fichiers trouvés dans reco`);

  const { index: itemIndex, all: allItems } = buildItemIndex();

  for (const file of files) {
    const content = fs.readFileSync(path.join(recoDir, file), 'utf-8');
    if (!content.trim()) continue;

    const reco = JSON.parse(content);
    const charSlug = file.replace(/\.json$/, '');

    const used = {
      Weapon: new Set(),
      Amulet: new Set(),
      Set: new Set(),
    };

    for (const role of Object.keys(reco)) {
      const data = reco[role] || {};

      if (Array.isArray(data.Weapon)) {
        for (const weapon of data.Weapon) {
          const n = weapon?.name;
          if (n) used.Weapon.add(n);
        }
      }

      if (Array.isArray(data.Amulet)) {
        for (const amulet of data.Amulet) {
          const n = amulet?.name;
          if (n) used.Amulet.add(n);
        }
      }

      // Sets: combos de sets ; les reco peuvent écrire "Attack" ou "Attack Set"
      if (Array.isArray(data.Set)) {
        for (const combo of data.Set) {
          if (!Array.isArray(combo)) continue;
          for (const setObj of combo) {
            const n = setObj?.name;
            if (n) used.Set.add(n);
          }
        }
      }
    }

    for (const name of used.Weapon) markUsed(name, 'Weapon', charSlug, itemIndex);
    for (const name of used.Amulet) markUsed(name, 'Amulet', charSlug, itemIndex);
    for (const name of used.Set) markUsed(name, 'Set', charSlug, itemIndex);
  }

  // Assurer que tous les items existent dans la sortie, même non utilisés
  ensureAllItemsPresent(allItems);

  // Sortie strictement comme avant
  const result = Object.values(stats)
    .map(entry => ({
      name: entry.name,
      type: entry.type,
      class: entry.class ?? null,
      count: entry.users.size,
      characters: Array.from(entry.users)
        .map(slug => slugToName[slug] || slug)
        .sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`✅ gear-usage.json généré avec ${result.length} objets (fix alias Sets "Attack" ⇆ "Attack Set").`);
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

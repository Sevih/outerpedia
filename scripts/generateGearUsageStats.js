const fs = require('fs');
const path = require('path');

const recoDir = path.join(__dirname, '../src/data/reco');
const outputPath = path.join(__dirname, '../src/data/stats/gear-usage.json');

const weaponsPath = path.join(__dirname, '../src/data/weapon.json');
const amuletPath = path.join(__dirname, '../src/data/amulet.json');
const setsPath = path.join(__dirname, '../src/data/sets.json');
const charactersDir = path.join(__dirname, '../src/data/char');

function loadCharNames() {
  const slugToName = {};
  const files = fs.readdirSync(charactersDir);
  for (const file of files) {
    const raw = fs.readFileSync(path.join(charactersDir, file), 'utf-8');
    const json = JSON.parse(raw);
    slugToName[file.replace(/\.json$/, '')] = json.Fullname;
  }
  return slugToName;
}


const stats = {}; // { name: { name, type, users: Set<string> } }

function markUsed(name, type, char) {
  if (!stats[name]) {
    stats[name] = { name, type, users: new Set() };
  }
  stats[name].users.add(char);
}

function ensureAllItemsPresent() {
  const allItems = [];

  // Weapons
  const weapons = JSON.parse(fs.readFileSync(weaponsPath, 'utf-8'));
  for (const weapon of weapons) {
    allItems.push({ name: weapon.name, type: 'Weapon', class: weapon.class ?? null });
  }

  // Amulets
  const amulets = JSON.parse(fs.readFileSync(amuletPath, 'utf-8'));
  for (const amulet of amulets) {
    allItems.push({ name: amulet.name, type: 'Amulet', class: amulet.class ?? null });
  }

  // Sets (pas de classe)
  const sets = JSON.parse(fs.readFileSync(setsPath, 'utf-8'));
  for (const set of sets) {
    allItems.push({ name: set.name, type: 'Set', class: null });
  }

  // Assure chaque objet est dans stats
  for (const { name, type, class: itemClass } of allItems) {
    if (!stats[name]) {
      stats[name] = {
        name,
        type,
        class: itemClass,
        users: new Set()
      };
    } else {
      stats[name].class = itemClass; // au cas où on l'ajoute après
    }
  }
}


async function main() {
  const slugToName = loadCharNames();
  const files = fs.readdirSync(recoDir);
  console.log(`📁 ${files.length} fichiers trouvés dans reco`);

  for (const file of files) {
    const content = fs.readFileSync(path.join(recoDir, file), 'utf-8');
    const reco = JSON.parse(content);
    const charSlug = file.replace(/\.json$/, '');

    const used = {
      Weapon: new Set(),
      Amulet: new Set(),
      Set: new Set(),
    };

    for (const role of Object.keys(reco)) {
      const data = reco[role];

      if (Array.isArray(data.Weapon)) {
        for (const weapon of data.Weapon) {
          if (weapon.name) used.Weapon.add(weapon.name);
        }
      }

      if (Array.isArray(data.Amulet)) {
        for (const amulet of data.Amulet) {
          if (amulet.name) used.Amulet.add(amulet.name);
        }
      }

      if (Array.isArray(data.Set)) {
        for (const combo of data.Set) {
          for (const setObj of combo) {
            if (setObj.name) used.Set.add(setObj.name);
          }
        }
      }
    }

    for (const name of used.Weapon) markUsed(name, 'Weapon', charSlug);
    for (const name of used.Amulet) markUsed(name, 'Amulet', charSlug);
    for (const name of used.Set) markUsed(name, 'Set', charSlug);
  }

  // Ajouter tous les objets même non utilisés
  ensureAllItemsPresent();

  const result = Object.values(stats)
    .map(entry => ({
      name: entry.name,
      type: entry.type,
      class: entry.class ?? null,
      count: entry.users.size,
      characters: Array.from(entry.users).map(slug => slugToName[slug] || slug).sort()
    }))
    .sort((a, b) => b.count - a.count);


  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`✅ gear-usage.json généré avec ${result.length} objets (incluant liste de personnages).`);
}

main();

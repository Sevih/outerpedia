const fs = require("fs");
const path = require("path");

const buildsDir = path.join(__dirname, "../src/data/reco");
const outputFile = path.join(__dirname, "../src/data/substats-map.json");

const result = {};

fs.readdirSync(buildsDir).forEach(file => {
  if (!file.endsWith(".json")) return;

  const slug = file.replace(".json", "");
  const filepath = path.join(buildsDir, file);
  const content = JSON.parse(fs.readFileSync(filepath, "utf8"));

  const builds = content || {};
  const buildResult = {};

  for (const [buildName, buildData] of Object.entries(builds)) {
    // Weapon
    const weaponSub = Array.isArray(buildData.Weapon)
      ? buildData.Weapon.map(w => ({
        name: w.name,
        mainStat: w.mainStat
          ? w.mainStat.split("/").map(s => s.trim())
          : []
      }))
      : [];

    // Amulet
    const amuletSub = Array.isArray(buildData.Amulet)
      ? buildData.Amulet.map(a => ({
        name: a.name,
        mainStat: a.mainStat
          ? a.mainStat.split("/").map(s => s.trim())
          : []
      }))
      : [];

    // Armor sets
const armorSets = Array.isArray(buildData.Set)
  ? buildData.Set.flat().filter(s => s?.name).map(s => s.name)
  : [];


    // Substats prioritaires
    const subStatPrioRaw = buildData.SubstatPrio || "";
    const sub = subStatPrioRaw
      .split(/>|<|=/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    buildResult[buildName] = {
      weaponSub,
      amuletSub,
      sub,
      armorSets // 👈 ajouté ici
    };
  }

  result[slug] = buildResult;
});

// Sauvegarde
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf8");
console.log(`✅ substats-map.json généré avec ${Object.keys(result).length} personnages.`);

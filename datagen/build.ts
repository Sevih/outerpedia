/**
 * Couche 5 — ORCHESTRATEUR (`pnpm datagen:build`).
 *
 * Appelle tous les générateurs et écrit la PROPOSITION dans `data/extracted/`
 * (gitignoré). La donnée VALIDÉE, committée et servie par le site, vit dans
 * `data/generated/` et n'est modifiée QUE par `pnpm datagen:promote` (revue
 * explicite) ou l'intégration ciblée de l'admin — un pull de patch ne peut
 * donc jamais partir en prod par accident. Déterministe, 100 % TS.
 *
 * Rôle propre à l'orchestrateur (≠ générateurs) :
 *   - décide le LAYOUT sur disque (un fichier par entité / par slot) ;
 *   - FUSIONNE les glossaires transverses en un glossaire GLOBAL unique
 *     (classes/élément étaient produits par 2 générateurs → 1 seule source) ;
 *   - sépare les catalogues d'équipement des glossaires.
 *
 * Les types de sortie sont vérifiés contre les CONTRATS (couche 4).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  CharactersFile,
  EquipmentFiles,
  Glossaries,
  ItemsFile,
  GoodsFile,
  CostumesFile,
  SkillsFile,
  TranscendFile,
} from './contracts';
import { buildCharacters } from './extractor/specs/character';
import { buildTranscend } from './extractor/transcend';
import { buildSlugMap } from './lib/slug';
import { buildEquipment } from './generators/equipment';
import { buildBosses } from './generators/bosses';
import { buildItemSources } from './generators/sources';
import { buildEnhanceRules } from './generators/enhance';
import { buildProgression } from './generators/progression';
import { buildItems } from './generators/items';
import { buildGoods } from './generators/goods';
import { buildCostumes } from './generators/costumes';
import { buildSkills } from './generators/skills';
import { buildEffectGlossary, unknownFamilyTypes } from './lib/effects';
import {
  curatedBossIds,
  loadEquipmentCurated,
  validateEquipmentCurated,
} from './curated/equipment';

const OUT = resolve('data/extracted');

/** Écrit un JSON indenté (diff-friendly) + newline final. */
function writeJson(relPath: string, data: unknown): void {
  const full = resolve(OUT, relPath);
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n');
  const bytes = JSON.stringify(data).length;
  console.log(`  ${relPath.padEnd(28)} ${(bytes / 1024).toFixed(0).padStart(6)} Ko`);
}

function main(): void {
  mkdirSync(resolve(OUT, 'equipment'), { recursive: true });
  console.log(
    'datagen:build → data/extracted/ (proposition — `pnpm datagen:promote` pour valider)',
  );

  // 1) Entités.
  const characters = buildCharacters();
  const transcend = buildTranscend();
  const { skills } = buildSkills();
  const equipment = buildEquipment();
  const items = buildItems();
  const goods = buildGoods();
  const costumes = buildCostumes();
  const { effects, byTooltip, byLabel, byKey, tooltipKinds } = buildEffectGlossary();
  // Types de buff INCONNUS des règles de famille : à classer via
  // data/curated/effect-families.json (pas besoin de toucher au code).
  const unknown = unknownFamilyTypes();
  if (unknown.length) {
    console.warn(
      `⚠ ${unknown.length} type(s) de buff sans famille (→ special) : ${unknown.join(', ')}\n` +
        '  → classe-les dans data/curated/effect-families.json',
    );
  }

  // 2) Glossaire GLOBAL : fusion des glossaires transverses (source unique).
  const glossaries: Glossaries = {
    grades: equipment.grades,
    statNames: equipment.statNames,
    statDescs: equipment.statDescs,
    classes: { ...equipment.classes, ...characters.glossaries.classes },
    elements: characters.glossaries.elements,
    subClasses: characters.glossaries.subClasses,
    statScales: characters.glossaries.statScales,
    gifts: characters.glossaries.gifts,
    fusionTitle: characters.glossaries.fusionTitle,
    effects: Object.fromEntries(effects),
    effectByTooltip: Object.fromEntries(byTooltip),
    effectByLabel: Object.fromEntries(byLabel),
    effectByKey: {
      buff: Object.fromEntries(byKey.buff),
      debuff: Object.fromEntries(byKey.debuff),
    },
    tooltipKinds: Object.fromEntries(tooltipKinds),
  };

  // 3) Écriture (types vérifiés contre les contrats).
  const charactersFile: CharactersFile = characters.characters;
  const transcendFile: TranscendFile = transcend;
  const skillsFile: SkillsFile = skills;
  const itemsFile: ItemsFile = items;
  const goodsFile: GoodsFile = goods;
  const costumesFile: CostumesFile = costumes;

  writeJson('characters.json', charactersFile);
  writeJson('characters-slug-to-id.json', buildSlugMap(Object.values(charactersFile)));
  writeJson('transcend.json', transcendFile);
  writeJson('skills.json', skillsFile);
  writeJson('items.json', itemsFile);
  writeJson('goods.json', goodsFile);
  writeJson('costumes.json', costumesFile);
  writeJson('glossaries.json', glossaries);

  const equip: EquipmentFiles = equipment;
  const slots: (keyof EquipmentFiles)[] = [
    'weapon',
    'accessory',
    'helmet',
    'armor',
    'gloves',
    'shoes',
    'talisman',
    'ee',
    'families',
    'pools',
    'passives',
    'breakLimits',
    'sets',
  ];
  for (const key of slots) writeJson(`equipment/${key}.json`, equip[key]);

  // 4) Sources d'obtention : EXTRAITES (ExpectReward des donjons) + complément
  // curé (modes événementiels/boutiques, absents du client). Les boss résolus
  // couvrent l'union des deux.
  const { items: sources, bossTitleKeys } = buildItemSources();
  writeJson('equipment/sources.json', sources);
  writeJson('equipment/enhance.json', buildEnhanceRules());
  writeJson('progression.json', buildProgression());
  const equipCurated = loadEquipmentCurated();
  const curatedIssues = validateEquipmentCurated(equipCurated);
  if (curatedIssues.length) {
    console.warn(`⚠ data/curated/equipment.json invalide :\n  ${curatedIssues.join('\n  ')}`);
  }
  const bossIds = new Set(curatedBossIds(equipCurated));
  for (const s of Object.values(sources)) for (const b of s.bosses) bossIds.add(b);
  writeJson('equipment/bosses.json', buildBosses([...bossIds].sort(), bossTitleKeys));

  console.log(
    `\nOK — ${Object.keys(charactersFile).length} persos, ${Object.keys(skillsFile).length} skills, ` +
      `${Object.keys(itemsFile).length} items, ${effects.size} effets.`,
  );
}

main();

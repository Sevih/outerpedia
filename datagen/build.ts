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
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { formatJson } from './lib/json';
import type {
  CharactersFile,
  EncountersFile,
  EquipmentFiles,
  Glossaries,
  ItemsFile,
  MonsterSkillsFile,
  MonstersFile,
  SkillsFile,
  TranscendFile,
} from './contracts';
import { buildEncounters } from './generators/encounters';
import { buildSingularity } from './generators/singularity';
import { buildTowers } from './generators/towers';
import { buildMonad } from './generators/monad';
import { buildContentSchedule } from './generators/content-schedule';
import { buildCharacters } from './extractor/specs/character';
import { buildMonsters } from './extractor/specs/monster';
import { buildMonsterSkills } from './generators/monster-skills';
import { buildTranscend } from './extractor/transcend';
import { buildSlugMap } from './lib/slug';
import { buildEquipment } from './generators/equipment';
import { buildBosses } from './generators/bosses';
import { buildItemSources } from './generators/sources';
import { buildEnhanceRules } from './generators/enhance';
import { buildProgression } from './generators/progression';
import { buildItems } from './generators/items';
import { buildAssetTypes, buildGoods } from './generators/goods';
import { buildCostumes } from './generators/costumes';
import { buildItemCatalog } from './generators/item-catalog';
import { buildGameVersion } from './generators/game-version';
import { buildSkills } from './generators/skills';
import { buildUnlockContent } from './generators/unlock-content';
import { buildRecruitPools } from './generators/recruit-pools';
import { buildEffectGlossary, unknownFamilyTypes } from './lib/effects';
import {
  curatedBossIds,
  loadEquipmentCurated,
  validateEquipmentCurated,
} from './curated/equipment';

const OUT = resolve('data/extracted');

/**
 * Écrit un JSON au format CANONIQUE (cf. `lib/json`) — le même que celui des
 * fichiers committés dans `data/generated/`. La proposition est donc comparable
 * OCTET À OCTET à la donnée validée : `promote` ne voit que de vrais
 * changements de contenu, jamais du reformatage.
 */
async function writeJson(relPath: string, data: unknown): Promise<void> {
  const text = await formatJson(data);
  writeFileSync(resolve(OUT, relPath), text);
  // Taille RÉELLE écrite (le canonique est indenté) — pas celle d'un
  // `JSON.stringify` compact qui sous-estimait d'un facteur ~2.
  console.log(`  ${relPath.padEnd(28)} ${(text.length / 1024).toFixed(0).padStart(6)} Ko`);
}

async function main(): Promise<void> {
  mkdirSync(resolve(OUT, 'equipment'), { recursive: true });
  console.log(
    'datagen:build → data/extracted/ (proposition — `pnpm datagen:promote` pour valider)',
  );

  // 1) Entités. Les rencontres sont construites d'abord : la spec monstre
  // embarque spawns/summonedBy/linkedTo sur chaque entité (mémoïsé).
  const encounters = buildEncounters();
  const characters = buildCharacters();
  const monsters = buildMonsters();
  const transcend = buildTranscend();
  const { skills } = buildSkills();
  const { skills: monsterSkills } = buildMonsterSkills();
  const equipment = buildEquipment();
  // Catalogue d'items UNIFIÉ (items + monnaies + costumes + curé baked).
  const goods = buildGoods();
  const catalog = buildItemCatalog({
    items: buildItems(),
    goods,
    costumes: buildCostumes(),
  });
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
  // Le domaine monstre CONTRIBUE (slugs que les persos ne couvrent pas) mais
  // les libellés du domaine perso restent prioritaires (spread après).
  const glossaries: Glossaries = {
    grades: equipment.grades,
    statNames: equipment.statNames,
    statDescs: equipment.statDescs,
    classes: {
      ...equipment.classes,
      ...monsters.glossaries.classes,
      ...characters.glossaries.classes,
    },
    elements: { ...monsters.glossaries.elements, ...characters.glossaries.elements },
    subClasses: { ...monsters.glossaries.subClasses, ...characters.glossaries.subClasses },
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
    // Titres des modes de contenu (résolus sans mapping en dur) — glossaire
    // comme les éléments/classes ; les donjons vivent dans encounters.json.
    modes: encounters.modes,
    // Passifs de PALIER résolus (`DungeonRank.options` → buff) — le site
    // affiche les rangs (singularity…) sans lire les tables du jeu.
    rankOptions: encounters.rankOptions,
    // Tables de récompense résolues — référencées par `DungeonRef.reward`,
    // `rewardWin`, `rewardLose` (encounters.json).
    rewardTables: encounters.rewardTables,
    // Geas du guild raid (phase 2) — référencés par `DungeonRef.geasRewards`.
    geas: encounters.geas,
    // Monnaies par id numérique (lignes `asset` des rewardTables) — lu de
    // l'enum ASSET_TYPE du client, vérifié contre le catalogue goods.
    assetTypes: buildAssetTypes(goods),
    // Quirks de compte réduisant les stats affichées des boss (EFF/RES −10 %).
    bossQuirkMods: encounters.bossQuirkMods,
  };

  // 3) Écriture (types vérifiés contre les contrats).
  const charactersFile: CharactersFile = characters.characters;
  const monstersFile: MonstersFile = monsters.monsters;
  const transcendFile: TranscendFile = transcend;
  const skillsFile: SkillsFile = skills;
  const monsterSkillsFile: MonsterSkillsFile = monsterSkills;
  const itemsFile: ItemsFile = catalog;
  await writeJson('characters.json', charactersFile);
  await writeJson('characters-slug-to-id.json', buildSlugMap(Object.values(charactersFile)));
  await writeJson('monsters.json', monstersFile);
  await writeJson('transcend.json', transcendFile);
  await writeJson('skills.json', skillsFile);
  await writeJson('monster-skills.json', monsterSkillsFile);
  // Dictionnaire des donjons référencés par les `spawns` des monstres (la
  // localisation elle-même vit sur chaque entité monstre).
  const encountersFile: EncountersFile = encounters.dungeons;
  await writeJson('encounters.json', encountersFile);
  await writeJson('items.json', itemsFile);
  await writeJson('glossaries.json', glossaries);
  // Conditions de déblocage des contenus (guide « Unlocking Content »).
  await writeJson('unlock-content.json', buildUnlockContent());
  // Pool du Custom Recruit (guide « Free Heroes & Start Banner »).
  await writeJson('recruit-pools.json', buildRecruitPools());
  // Rotation Monad Gate (groupes + cadence ; ancre curée), compositions des
  // tours et calendrier des contenus saisonniers — cf. en-têtes des générateurs.
  await writeJson('singularity.json', buildSingularity());
  await writeJson('towers.json', buildTowers());
  await writeJson('content-schedule.json', buildContentSchedule());
  // Monad Gate : un thème partagé (récompenses, jauge, index des routes) + les
  // routes prêtes à rendre (libellés résolus au build — cf. header du
  // générateur), indexées par groupId dans UN fichier (lu côté serveur ; les
  // ~1,5 Mo ne partent jamais au client — cf. src/lib/data/monad.ts).
  const monad = buildMonad();
  mkdirSync(resolve(OUT, 'monad'), { recursive: true });
  // Nom STABLE (pas `theme-${id}`) : le lecteur l'importe statiquement — un nom
  // variable casserait l'import en silence au premier changement de thème ; le
  // `themeId` vit dans le fichier.
  await writeJson('monad/theme.json', monad.theme);
  await writeJson('monad/routes.json', Object.fromEntries(monad.routes.map((r) => [r.groupId, r])));
  const gameVersion = buildGameVersion();
  if (gameVersion) await writeJson('game-version.json', gameVersion);

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
  for (const key of slots) await writeJson(`equipment/${key}.json`, equip[key]);

  // 4) Sources d'obtention : EXTRAITES (ExpectReward des donjons) + complément
  // curé (modes événementiels/boutiques, absents du client). Les boss résolus
  // couvrent l'union des deux.
  const { items: sources, bossTitleKeys } = buildItemSources();
  await writeJson('equipment/sources.json', sources);
  await writeJson('equipment/enhance.json', buildEnhanceRules());
  await writeJson('progression.json', buildProgression());
  const equipCurated = loadEquipmentCurated();
  const curatedIssues = validateEquipmentCurated(equipCurated);
  if (curatedIssues.length) {
    console.warn(`⚠ data/curated/equipment.json invalide :\n  ${curatedIssues.join('\n  ')}`);
  }
  const bossIds = new Set(curatedBossIds(equipCurated));
  for (const s of Object.values(sources)) for (const b of s.bosses) bossIds.add(b);
  await writeJson('equipment/bosses.json', buildBosses([...bossIds].sort(), bossTitleKeys));

  console.log(
    `\nOK — ${Object.keys(charactersFile).length} persos, ${Object.keys(skillsFile).length} skills, ` +
      `${Object.keys(monstersFile).length} monstres (${Object.keys(monsterSkillsFile).length} skills), ` +
      `${Object.keys(itemsFile).length} items, ${effects.size} effets.`,
  );
}

main().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});

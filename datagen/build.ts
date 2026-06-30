/**
 * Couche 5 — ORCHESTRATEUR (`pnpm datagen:build`).
 *
 * Appelle tous les générateurs et écrit la donnée canonique committée dans
 * `data/generated/`. Déterministe, 100 % TS, AUCUN python.
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
  SkillsFile,
} from './contracts';
import { buildCharacters } from './extractor/specs/character';
import { buildEquipment } from './generators/equipment';
import { buildItems } from './generators/items';
import { buildSkills } from './generators/skills';
import { loadStatusGlossary } from './lib/effects';

const OUT = resolve('data/generated');

/** Écrit un JSON indenté (diff-friendly) + newline final. */
function writeJson(relPath: string, data: unknown): void {
  const full = resolve(OUT, relPath);
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n');
  const bytes = JSON.stringify(data).length;
  console.log(`  ${relPath.padEnd(28)} ${(bytes / 1024).toFixed(0).padStart(6)} Ko`);
}

function main(): void {
  mkdirSync(resolve(OUT, 'equipment'), { recursive: true });
  console.log('datagen:build → data/generated/');

  // 1) Entités.
  const characters = buildCharacters();
  const { skills } = buildSkills();
  const equipment = buildEquipment();
  const items = buildItems();
  const statusEffects = Object.fromEntries(loadStatusGlossary());

  // 2) Glossaire GLOBAL : fusion des glossaires transverses (source unique).
  const glossaries: Glossaries = {
    grades: equipment.grades,
    classes: { ...equipment.classes, ...characters.glossaries.classes },
    elements: characters.glossaries.elements,
    subClasses: characters.glossaries.subClasses,
    statScales: characters.glossaries.statScales,
    gifts: characters.glossaries.gifts,
    statusEffects,
  };

  // 3) Écriture (types vérifiés contre les contrats).
  const charactersFile: CharactersFile = characters.characters;
  const skillsFile: SkillsFile = skills;
  const itemsFile: ItemsFile = items;

  writeJson('characters.json', charactersFile);
  writeJson('skills.json', skillsFile);
  writeJson('items.json', itemsFile);
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
    'pools',
    'passives',
    'breakLimits',
    'sets',
  ];
  for (const key of slots) writeJson(`equipment/${key}.json`, equip[key]);

  console.log(
    `\nOK — ${Object.keys(charactersFile).length} persos, ${Object.keys(skillsFile).length} skills, ` +
      `${Object.keys(itemsFile).length} items, ${Object.keys(statusEffects).length} statuts.`,
  );
}

main();

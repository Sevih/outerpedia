/**
 * Orchestrateur DAMAGE (`pnpm damage:build`) — écrit `data/generated/damage/`.
 *
 * Pipeline SÉPARÉ de `datagen:build` (mapping § 9) : pas de couche
 * `data/extracted/` ni de `promote` — ces garde-fous protègent la donnée
 * d'AFFICHAGE contre un pull de patch accidentel ; ici la sortie est brute,
 * déterministe, et la REVUE est le diff git du commit qui l'embarque. Les
 * artefacts vivent dans leur propre dossier : une correction d'affichage ne
 * peut jamais changer un calcul, et réciproquement.
 *
 * Chaque fichier porte `resVersion` (version des RESSOURCES du manifeste,
 * celle qui bouge quand les tables changent) — c'est elle que le harnais de
 * debug compare aux fixtures (spec damage-debug-harness § 5).
 */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '../lib/json';
import { buildGameVersion } from '../generators/game-version';
import { buildDamageCharacters } from './characters';
import { buildDamageGrowth } from './growth';
import { buildDamageEquipment } from './equipment';
import { buildDamageTargets } from './targets';
import { buildDamageBuffs } from './buffs';
import { buildDamageConfig } from './config';

const OUT = resolve('data/generated/damage');

async function main(): Promise<void> {
  const version = buildGameVersion();
  if (!version) {
    throw new Error(
      '.gamedata/files/bundles/manifest.dat introuvable — lancer les extracteurs ' +
        'sur une machine où .gamedata est peuplé (datagen:pull / datagen:extract).',
    );
  }
  mkdirSync(OUT, { recursive: true });
  console.log(`damage:build → data/generated/damage/ (resVersion ${version.resVersion})`);

  const charactersData = buildDamageCharacters();
  const { characters, skills } = charactersData;
  const growth = buildDamageGrowth();
  const equipment = buildDamageEquipment();
  const targetsData = buildDamageTargets();
  const buffsData = buildDamageBuffs(charactersData, growth, equipment, targetsData);

  const write = async (name: string, data: unknown): Promise<void> => {
    const path = resolve(OUT, name);
    await writeJson(path, { resVersion: version.resVersion, ...(data as object) });
    console.log(`  ${name}`);
  };
  await write('characters.json', { characters, skills });
  await write('growth.json', growth);
  await write('equipment.json', equipment);
  await write('targets.json', targetsData);
  await write('buffs.json', buffsData);
  await write('config.json', { config: buildDamageConfig() });
  if (buffsData.unresolved.length) {
    console.warn(
      `⚠ ${buffsData.unresolved.length} BuffID référencés mais absents de BuffTemplet ` +
        `(réfs mortes du jeu, listées dans buffs.json .unresolved).`,
    );
  }

  const unresolved = Object.values(skills).filter((s) => s.hitsUnresolved).length;
  console.log(
    `\nOK — ${Object.keys(characters).length} persos, ${Object.keys(skills).length} skills ` +
      `(${unresolved} offensifs sans chaîne de hits — affectation AnimationEvents, spec § 12.4), ` +
      `${growth.awakening.length} nœuds d'éveil, ${growth.monad.length} nœuds monad, ` +
      `${Object.keys(equipment.pieces).length} pièces (${Object.keys(equipment.optionGroups).length} groupes d'options, ` +
      `${Object.keys(equipment.specialGroups).length} groupes spéciaux), ${equipment.artifacts.length} artefacts, ` +
      `${Object.keys(targetsData.targets).length} cibles (${Object.keys(targetsData.skills).length} skills de monstre), ` +
      `${Object.keys(buffsData.buffs).length} buffs atteignables.`,
  );
}

main().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});

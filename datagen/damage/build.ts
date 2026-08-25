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
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '../lib/json';
import { pythonToolingMissing } from '../lib/python';
import { buildGameVersion } from '../generators/game-version';
import { buildDamageCharacters } from './characters';
import { buildDamageGrowth } from './growth';
import { buildDamageEquipment } from './equipment';
import { buildDamageTargets } from './targets';
import { buildDamageBuffs } from './buffs';
import { buildDamageConfig } from './config';
import { buildSkillDescs } from './skill-descs';

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

  // AnimationEvents D'ABORD — l'entrée de clips.ts (§ 8.1), régénérée depuis
  // les bundles pullés AVANT de construire les chaînes de hits (intégrée ici
  // le 25/08/2026 : le patch 1.4.15 avait régénéré les listings ASM mais
  // laissé anim-events.json et les tables damage sur l'ancienne version).
  // Doctrine datagen/lib/python.ts : machine non outillée → étape SAUTÉE, le
  // JSON committé prend le relais ; un échec du script LUI-MÊME lève toujours.
  const pyMissing = pythonToolingMissing('UnityPy');
  if (pyMissing) {
    console.warn(
      `⚠ extract-anim-events SAUTÉ — ${pyMissing} ; anim-events.json committé pris tel quel.`,
    );
  } else {
    console.log('▶ extract-anim-events (clips + triggers → datagen/damage/anim-events.json)');
    execFileSync('python', [resolve('datagen/damage/extract-anim-events.py')], {
      stdio: 'inherit',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
  }

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
  // Projection UI (descs de popover) — dérivée des artefacts wiki committés
  // (cf. en-tête de skill-descs.ts : régénérer APRÈS datagen:build).
  await write('skill-descs.json', buildSkillDescs());
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

  // VALIDATION RÉELLE (25/08/2026) : rejouer toutes les fixtures dorées sur
  // les tables qu'on vient d'écrire — une dérive après patch saute aux yeux
  // ici, pas au prochain vitest. Processus séparé (mêmes flags tsx que la
  // chaîne refresh) : une régression moteur (exit 1) fait échouer le build.
  console.log('');
  execFileSync(
    process.execPath,
    [resolve('node_modules/tsx/dist/cli.mjs'), resolve('datagen/damage/check-fixtures.ts')],
    { stdio: 'inherit' },
  );
}

main().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});

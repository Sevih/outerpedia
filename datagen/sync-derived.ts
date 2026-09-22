/**
 * RE-DÉRIVATION des artefacts construits SUR `data/generated/` — le chaînon
 * qui manquait au flux « intégration délibérée » (constat du 22/09/2026 :
 * Titia intégrée et Eliza reworkée APRÈS le dernier `damage:build` /
 * `datagen:build` → `damage/skill-descs.json` résolvait l'ancien texte,
 * `solver/characters.json` n'avait pas de `bestSkill` pour la nouvelle —
 * trois tests rouges au moment de publier, à charge de s'en souvenir).
 *
 * Deux familles d'artefacts ne sont PAS de purs produits des tables du jeu :
 * elles lisent aussi la donnée INTÉGRÉE (`data/generated/`) —
 *   - `data/generated/damage/` : roster validé (`roster.ts`), projection des
 *     descs (`skill-descs.ts`), cibles (`targets.ts` ← monsters/encounters) ;
 *   - `data/generated/solver/` : `buildSolver` passe par
 *     `buildDamageCharacters()` (même filtre de roster).
 * Elles doivent donc être RE-DÉRIVÉES chaque fois que la donnée intégrée
 * change. Ce module est branché aux DEUX écritures de `data/generated/` :
 * `promote --apply` (datagen/promote.ts) et les intégrations ciblées de
 * l'admin (datagen/extractor/integrate.ts). Le flux patch (`refresh.ts`)
 * garde son étape damage COMPLÈTE (avec ré-extraction anim) après promote et
 * passe `--skip-sync` à ce dernier pour ne pas dériver deux fois.
 *
 * La ré-extraction des AnimationEvents est SAUTÉE ici : une intégration ne
 * change pas les bundles du jeu, `anim-events.json` committé fait foi.
 * Le solver est écrit dans `data/extracted/` ET `data/generated/` (même
 * contenu) : la promotion suivante le voit identique, la revue est le diff
 * git — même doctrine que `damage/` (cf. en-tête de damage/build.ts).
 */
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildDamageArtifacts } from './damage/build';
import { buildEquipment } from './generators/equipment';
import { buildSolver, type SolverSetsView } from './generators/solver';
import { gamedata } from './lib/paths';
import { isMain } from './lib/is-main';
import { writeJson } from './lib/json';

/** `true` si la synchro a tourné, `false` si sautée (machine sans gamedata). */
export async function syncDerived(): Promise<boolean> {
  if (!existsSync(gamedata('files/bundles/manifest.dat'))) {
    console.warn(
      '⚠ sync-derived SAUTÉ — racine gamedata absente (machine sans datamine) : ' +
        'data/generated/damage et data/generated/solver restent à re-dériver ' +
        '(`pnpm datagen:sync-derived` sur la machine outillée).',
    );
    return false;
  }
  console.log('\n▶ sync-derived : re-dérivation damage + solver sur data/generated/ à jour');
  await buildDamageArtifacts({ anim: false });

  // Solver : même vue des sets que datagen:build (source unique buildEquipment).
  const equipment = buildEquipment();
  const solver = buildSolver({ setsView: equipment.sets as unknown as SolverSetsView });
  for (const dir of ['data/generated/solver', 'data/extracted/solver']) {
    mkdirSync(resolve(dir), { recursive: true });
    for (const [name, data] of solver.files) await writeJson(resolve(dir, name), data);
    await writeJson(resolve(dir, 'version.json'), solver.version);
  }
  console.log(`  solver/ re-dérivé (${solver.files.length} fichiers, hash ${solver.version.hash})`);
  return true;
}

if (isMain(import.meta.url)) {
  syncDerived().catch((e) => {
    console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
    process.exit(1);
  });
}

/**
 * IMAGES — orchestrateur de `pnpm images` (collecte → regen éventuel → push R2).
 *
 * Remplace l'ancienne chaîne `&&` du script `images` de `package.json`, avec le
 * MÊME ordre d'étapes et les MÊMES commandes, arrêt à la première en échec :
 *   1. `assets:collect-wallpapers` — appelée EN PROCESSUS (`collectWallpapers`)
 *      pour lire ce qu'elle a archivé ; toujours AVANT `assets:collect` (cf.
 *      l'en-tête de collect-wallpapers.ts) ;
 *   2. `assets:collect`, `assets:collect-audio`, `assets:collect-comics` ;
 *   3. SEULEMENT si l'étape 1 a archivé une version `<stem>@<n>` (le jeu a
 *      remplacé un wallpaper en place) : `datagen:build` puis
 *      `datagen:promote --apply --only wallpapers.json`. Sans ça, l'archive
 *      partait sur R2 mais `wallpapers.json` — construit AVANT `pnpm images`
 *      dans le cycle d'un patch — ne la listait qu'au build suivant : l'onglet
 *      « Archivés » l'ignorait (Rhona, `T_ScenarioCG_RONA_01@1`, 07/11).
 *      `--only` : la collecte ne change QUE ce catalogue ; une promotion
 *      complète, au milieu d'une publication, validerait aussi les autres
 *      écarts de la proposition sans revue ;
 *   4. `editorial:push`, `assets:push`, `assets:sync-comics-seed` ;
 *   5. `assets:commit` — reçoit les arguments de `pnpm images` (`--no-commit`,
 *      posé par `pnpm commit`), comme le dernier maillon de l'ancienne chaîne.
 *
 * `wallpapers.json` régénéré reste au working tree : `assets:commit` ne committe
 * que ses deux états (`pushed.json`, `comics.json`) ; `pnpm commit` l'embarque
 * dans son `git add -A`, sinon il se committe à la main.
 */
import { execSync } from 'node:child_process';
import { isMain } from '../lib/is-main';
import { collectWallpapers, logCollectStats, type CollectStats } from './collect-wallpapers';

/** Un script pnpm et ses arguments. */
export type Step = readonly [script: string, ...args: string[]];

export interface ImagesDeps {
  collect: () => Promise<CollectStats>;
  /** Lance `pnpm <script> <args…>` ; lève en cas d'échec (arrêt de la chaîne). */
  run: (step: Step) => void;
  log: (msg: string) => void;
}

const COLLECT: Step[] = [['assets:collect'], ['assets:collect-audio'], ['assets:collect-comics']];
export const REGEN: Step[] = [
  ['datagen:build'],
  ['datagen:promote', '--apply', '--only', 'wallpapers.json'],
];
const PUSH: Step[] = [['editorial:push'], ['assets:push'], ['assets:sync-comics-seed']];

/** Déroule `pnpm images` ; `args` = arguments passés à `pnpm images`. */
export async function runImages(
  args: readonly string[],
  deps: ImagesDeps,
): Promise<{ regenerated: boolean }> {
  const stats = await deps.collect();
  logCollectStats(stats);
  for (const step of COLLECT) deps.run(step);
  const regenerated = stats.archived.length > 0;
  if (regenerated) {
    deps.log(
      `wallpapers → ${stats.archived.length} archive(s) nouvelle(s) : régénération de wallpapers.json (build + promote --only) avant le push`,
    );
    for (const step of REGEN) deps.run(step);
  }
  for (const step of PUSH) deps.run(step);
  deps.run(['assets:commit', ...args]);
  if (regenerated)
    deps.log('wallpapers.json régénéré : au working tree, à committer (`pnpm commit` l’embarque)');
  return { regenerated };
}

if (isMain(import.meta.url)) {
  runImages(process.argv.slice(2), {
    collect: collectWallpapers,
    // Par le shell, comme `scripts/commit.ts` : `pnpm` est un `.cmd` sous
    // Windows (le fixe), qu'`execFileSync` sans shell ne trouve pas. Les
    // arguments sont des jetons simples (scripts, flags, `wallpapers.json`).
    run: (step) => {
      execSync(`pnpm ${step.join(' ')}`, { stdio: 'inherit' });
    },
    log: (msg) => console.log(msg),
  }).catch((e: unknown) => {
    console.error(`\n\x1b[31mimages : ${e instanceof Error ? e.message : String(e)}\x1b[0m`);
    process.exit(1);
  });
}

/**
 * AUTO-COMMIT DES ÉTATS D'ASSETS (`pnpm assets:commit`, dernier maillon de
 * `pnpm images`).
 *
 * `pnpm images` ne produit que DEUX fichiers committés — le reste part sur R2
 * depuis le staging gitignoré :
 *   - `datagen/assets/pushed.json`  : ce que le bucket SERT réellement
 *     (`clé → sha1`), écrit par `scripts/assets-push.mjs` après upload ET purge ;
 *   - `data/generated/comics.json`  : le repli 4-comics, réaligné sur le
 *     manifeste EN LIGNE par `assets:sync-comics-seed`.
 *
 * Les oublier ne casse pas la prod (elle lit R2), mais les deux sont des
 * TÉMOINS HORS LIGNE dont dépendent des garde-fous : `collect-comics` compare le
 * pool local au seed committé et à `pushed.json` pour décider s'il peut publier
 * le manifeste sans amputer la galerie, et le repli est la SEULE source en dev
 * (`NEXT_PUBLIC_IMG_BASE` y est vide). Un état resté non committé sur une
 * machine, c'est l'autre machine qui publie à l'aveugle — exactement la dérive
 * du 2026-08-15 (repli à 27 BD contre 31 en ligne). D'où l'auto-commit, sur le
 * modèle de `pnpm getNews` (cf. `commitPatchNotes` dans `scripts/get-news.ts`).
 *
 * CHEMINS EXPLICITES, jamais `git add -A` (CONVENTIONS.md) : le checkout porte
 * du travail en cours qui ne doit pas être happé. `git commit -- <chemins>` ne
 * committe QUE ceux-là, même si d'autres changements sont indexés.
 *
 * BEST-EFFORT : les fichiers sont déjà sur disque et les assets déjà sur R2. Un
 * échec git (hors dépôt, hook, rebase en cours) est SIGNALÉ, jamais fatal — il
 * ne doit pas faire échouer un `pnpm images` qui, lui, a réussi.
 *
 *   pnpm assets:commit              committe ce qui a changé (silencieux sinon)
 *   pnpm images --no-commit         laisse les états au working tree
 *
 * `--no-commit` est posé par `pnpm commit` (publication guidée) : là, son
 * `git add -A` final embarque déjà ces états dans LE commit de la release, avec
 * le bump de version — un commit d'assets séparé le couperait en deux.
 */
import { execFileSync } from 'node:child_process';

/** Les seuls fichiers versionnés que `pnpm images` écrit, avec leur scope de commit. */
const TRACKED = [
  { path: 'datagen/assets/pushed.json', scope: 'assets', what: 'etat du push R2' },
  { path: 'data/generated/comics.json', scope: 'comics', what: 'repli realigne sur R2' },
] as const;

const git = (...args: string[]): string =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

/** Ceux de nos chemins que git voit MODIFIÉS (index ou working tree). */
function changed(): string[] {
  const out = git('status', '--porcelain', '--', ...TRACKED.map((t) => t.path));
  return TRACKED.filter((t) => out.includes(t.path)).map((t) => t.path);
}

/**
 * Message conventionnel (CONVENTIONS.md). Un seul fichier → son scope ; les
 * deux → `chore(assets)`, qui couvre le sujet commun (la publication R2).
 */
function message(paths: string[]): string {
  const hit = TRACKED.filter((t) => paths.includes(t.path));
  if (hit.length === 1) return `chore(${hit[0].scope}): ${hit[0].what}`;
  return 'chore(assets): etat du push R2 + repli 4-comics';
}

export function commitAssets(): void {
  if (process.argv.includes('--no-commit')) return;
  try {
    git('rev-parse', '--is-inside-work-tree');
    const paths = changed();
    if (!paths.length) return; // rien à publier : cas nominal et silencieux
    git('add', '--', ...paths);
    git('commit', '-m', message(paths), '--', ...paths);
    console.log(`états d'assets committés : ${paths.join(', ')}`);
  } catch (e) {
    console.warn(`⚠ auto-commit des états d'assets sauté (${e instanceof Error ? e.message : e})`);
    console.warn('  (les fichiers restent au working tree — à committer à la main)');
  }
}

commitAssets();

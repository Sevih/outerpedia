/**
 * dev-refresh — étape de données jouée en tête de `pnpm dev`.
 *
 * Le RÉSULTAT DU PULL pilote tout : on ne re-génère la donnée que si on a
 * réellement tiré du nouveau depuis le jeu. Sinon (LDPlayer éteint, ou déjà à
 * jour) on saute toute la chaîne — le dev démarre instantanément.
 *
 *   pull (si LDPlayer + diff)
 *     └─ si tiré : extract → convert → build → promote --apply → assets:collect
 *   getNews  ← TOUJOURS (indépendant du datamine, c'est un fetch web)
 *
 * `promote --apply` écrit dans `data/generated/` (servi par l'app) : le serveur
 * de dev voit donc la donnée fraîche immédiatement. La revue des diffs se fait
 * ensuite sur le `git diff` au moment de committer.
 *
 * Flags :
 *   --force   force le pull même si le dossier local semble à jour
 *             (utile si une extraction précédente a échoué)
 *   --no-pull saute le pull (travail purement offline sur la donnée committée)
 */
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pull } from '../datagen/extract/pull-gamedata';

const TSX_CLI = resolve('node_modules/tsx/dist/cli.mjs');

/** Lance un script TS via tsx, en héritant du terminal. Coupe le dev si échec. */
function step(label: string, file: string, args: string[] = []): void {
  console.log(`\n▶ ${label}`);
  execFileSync(process.execPath, [TSX_CLI, resolve(file), ...args], { stdio: 'inherit' });
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const force = argv.includes('--force');
  const noPull = argv.includes('--no-pull');

  // 1) Pull — ne tire que si LDPlayer est là ET que le distant diffère.
  let changed = false;
  if (noPull) {
    console.log('⏭  pull sauté (--no-pull).');
  } else {
    console.log('▶ pull (jeu → .gamedata)');
    const res = await pull();
    changed = res.changed;
  }

  // 2) Génération — UNIQUEMENT si on a tiré du nouveau (ou --force).
  if (changed || force) {
    if (force && !changed) console.log('\n⚙  --force : re-génération malgré un local à jour.');
    step('extract  (.bytes + images)', 'datagen/extract/extract.ts');
    step('convert  (.bytes → templates)', 'datagen/templates/convert.ts');
    step('build    (générateurs → data/extracted)', 'datagen/build.ts');
    step('promote  (extracted → generated)', 'datagen/promote.ts', ['--apply']);
    step('assets   (collecte images → staging)', 'datagen/assets/collect.ts');
  } else {
    console.log('\n✓ Donnée à jour — génération sautée.');
  }

  // 3) News — toujours (fetch web, indépendant du jeu).
  step('getNews', 'scripts/get-news.ts');

  console.log('\n✅ dev-refresh terminé.\n');
}

main().catch((e) => {
  console.error('\n✗ dev-refresh a échoué :', e?.message ?? e);
  process.exit(1);
});

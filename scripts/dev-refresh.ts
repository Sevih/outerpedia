/**
 * dev-refresh — étape de données jouée en tête de `pnpm dev`.
 *
 * Fin wrapper autour de `datagen/refresh.ts` (définition UNIQUE du flux) : en
 * dev on veut la donnée servie fraîche → promote --apply + collect + getNews.
 * La revue des diffs se fait ensuite sur le `git diff` au moment de committer.
 *
 * Flags : --force (re-génère même si local à jour) / --no-pull (offline).
 */
import { refresh } from '../datagen/refresh';

const argv = process.argv.slice(2);

refresh({
  force: argv.includes('--force'),
  noPull: argv.includes('--no-pull'),
  apply: true,
  collect: true,
  news: true,
})
  .then(() => console.log('\n✅ dev-refresh terminé.\n'))
  .catch((e) => {
    console.error('\n✗ dev-refresh a échoué :', e?.message ?? e);
    process.exit(1);
  });

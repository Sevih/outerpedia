/**
 * dev-refresh — étape de données jouée en tête de `pnpm dev`.
 *
 * Fin wrapper autour de `datagen/refresh.ts` (définition UNIQUE du flux). On
 * pull + build la PROPOSITION (`data/extracted`) + collect les images, mais on
 * NE PROMEUT PAS automatiquement (`apply: false` → promote en dry-run) : le site
 * sert la donnée INTÉGRÉE (`data/generated` committé), et les changements du jeu
 * s'intègrent DÉLIBÉRÉMENT — par entité depuis l'admin (bouton « Intégrer »/
 * « Valider l'extraction ») ou en lot via `pnpm datagen:promote --apply`. La
 * console affiche quand même le diff (dry) pour savoir ce qui a bougé.
 *
 * Flags : --force (re-génère même si local à jour) / --no-pull (offline).
 */
import { refresh } from '../datagen/refresh';

const argv = process.argv.slice(2);

refresh({
  force: argv.includes('--force'),
  noPull: argv.includes('--no-pull'),
  apply: false,
  collect: true,
  news: true,
})
  .then(() => console.log('\n✅ dev-refresh terminé.\n'))
  .catch((e) => {
    console.error('\n✗ dev-refresh a échoué :', e?.message ?? e);
    process.exit(1);
  });

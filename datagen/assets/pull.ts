/**
 * assets:pull — remplit `.assets-staging/images` depuis R2 (`pnpm assets:pull`).
 *
 * MIROIR de scripts/assets-push.mjs : le push envoie le staging (clés `images/…`)
 * vers le bucket ; on récupère ici la même arbo pour servir `/images/*` en DEV
 * (route src/app/images/[...path]/route.dev.ts, qui lit `.assets-staging/images`)
 * SANS relancer `assets:collect` sur les milliers d'images extraites.
 *
 * Ne supprime rien en local : c'est un remplissage, pas une synchro miroir.
 */
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { r2Copy } from '../lib/r2';

export function pullImages(): void {
  const dest = resolve('.assets-staging/images');
  console.log('↻ assets:pull — R2 (images/) → .assets-staging/images ...');
  r2Copy('images', dest);
  console.log('✅ staging images à jour.');
}

if (isMain(import.meta.url)) {
  try {
    pullImages();
  } catch (e) {
    console.error('\n✗ assets:pull a échoué :', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

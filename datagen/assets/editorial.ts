/**
 * SYNCHRO ÉDITORIALE — `pnpm editorial:pull` / `pnpm editorial:push`.
 *
 * `.editorial/` (BD 4-cut + wallpapers faits main) est du contenu ORIGINAL qui
 * n'existe nulle part ailleurs : ni dans les fichiers du jeu, ni dans git
 * (gitignoré — ce sont des binaires). Il ne vivait donc que sur la machine qui
 * l'avait, avec deux conséquences : aucune sauvegarde hors-machine, et deux PC
 * qui divergent en silence. Pire, `collect-comics` régénère le manifeste R2
 * depuis ce pool → publier depuis une machine au pool partiel amputait la
 * galerie (garde-fou ajouté là-bas, mais le fond du problème est ici).
 *
 * On donne donc au pool une source de vérité partagée : le bucket R2, déjà la
 * destination de tout le reste (préfixe `editorial/`, distinct de `images/` que
 * peuple `assets:push` — la synchro ne passe pas par le staging). Les ORIGINAUX
 * (png/jpg) y montent tels quels ; les webp dérivés restent l'affaire de
 * `assets:collect-comics`.
 *
 * `copy` dans les deux sens, JAMAIS `sync` : union des machines, aucun scénario
 * où un transfert mal placé détruit un pool (même doctrine qu'`assets:pull` —
 * « remplissage, pas synchro miroir »). Corollaire assumé : supprimer une BD
 * partout reste un geste manuel (`rclone delete`), cas rare.
 *
 * Geste sur une machine secondaire :
 *   pnpm editorial:pull   # récupérer le pool COMPLET
 *   …déposer les images…
 *   pnpm images           # manifeste complet → publication correcte
 *   pnpm editorial:push   # l'autre machine les aura à son prochain pull
 *
 * Prérequis : rclone + R2_* dans `.env.local` (cf. datagen/lib/r2.ts).
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { r2Copy, r2Upload } from '../lib/r2';

/** Pool éditorial local (gitignoré) — comics/<LANG>, wallpapers/Outerpedia. */
const EDITORIAL = resolve('.editorial');

/** Préfixe R2 des ORIGINAUX. Hors `images/`, que peuple le pipeline de collecte. */
const PREFIX = 'editorial';

/** Rapatrie le pool depuis R2 (crée `.editorial/` au besoin). */
export function pullEditorial(): void {
  mkdirSync(EDITORIAL, { recursive: true });
  console.log(`↻ editorial:pull — R2 (${PREFIX}/) → .editorial ...`);
  r2Copy(PREFIX, EDITORIAL);
  console.log('✅ pool éditorial à jour.');
}

/** Dépose le pool local sur R2. Pool absent = rien à envoyer (no-op explicite). */
export function pushEditorial(): void {
  if (!existsSync(EDITORIAL) || !readdirSync(EDITORIAL).length) {
    console.log('editorial:push — `.editorial/` absent ou vide, rien à envoyer.');
    return;
  }
  console.log(`↻ editorial:push — .editorial → R2 (${PREFIX}/) ...`);
  r2Upload(EDITORIAL, PREFIX);
  console.log('✅ pool éditorial sauvegardé sur R2.');
}

if (isMain(import.meta.url)) {
  const verb = process.argv[2];
  try {
    if (verb === 'pull') pullEditorial();
    else if (verb === 'push') pushEditorial();
    else {
      console.error('usage : tsx datagen/assets/editorial.ts <pull|push>');
      process.exit(1);
    }
  } catch (e) {
    console.error(`\n✗ editorial:${verb} a échoué :`, e instanceof Error ? e.message : e);
    // Cas le plus probable au tout premier pull : le préfixe n'existe pas encore
    // sur R2 (personne n'a jamais poussé) — l'amorçage vient de la machine qui
    // détient le pool.
    if (verb === 'pull') {
      console.error(
        '  Si le préfixe `editorial/` est encore absent du bucket : lance d’abord\n' +
          '  `pnpm editorial:push` depuis la machine qui détient le pool.',
      );
    }
    process.exit(1);
  }
}

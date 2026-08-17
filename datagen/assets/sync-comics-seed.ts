/**
 * SYNC DU REPLI 4-COMICS — réaligne `data/generated/comics.json` sur le
 * manifeste RÉELLEMENT EN LIGNE.
 *
 * La galerie `/4-comics` lit le manifeste R2 à la requête ; le fichier committé
 * n'est que le repli, servi quand R2 est injoignable — et SEULE source en dev,
 * où `NEXT_PUBLIC_IMG_BASE` est vide (cf. tools/_contents/4-comics). Rien ne le
 * régénérait : `buildComics` n'est pas câblé dans `build.ts` (délibérément, cf.
 * `promote.ts`), donc le repli dérivait à chaque BD ajoutée — 27 contre 31 le
 * 2026-08-15, invisible en prod et trompeur en dev, où Sevih ne voyait pas ses
 * BD apparaître alors que `pnpm images` avait tout fait correctement.
 *
 * INVARIANT TENU ICI : le repli est ce qui est EN LIGNE, jamais ce qui est en
 * local. On ne recopie donc pas le pool (il peut être partiel, ou en avance sur
 * R2 si le push a échoué) mais le manifeste du staging UNE FOIS SON SHA1
 * CONFIRMÉ dans `pushed.json` — c'est-à-dire réellement poussé. Tant que le
 * push n'a pas eu lieu, le repli ne bouge pas : mieux vaut un repli en retard
 * qu'un repli annonçant des BD que personne ne peut servir.
 *
 * Le garde-fou « pool partiel » de `collect-comics` reste donc intact en amont :
 * un pool amputé ne produit pas de manifeste, donc rien à pousser, donc rien à
 * synchroniser ici.
 *
 * Exécution : dernier maillon de `pnpm images`, APRÈS `assets:push` — le `&&`
 * de la chaîne garantit qu'on ne passe ici que si le push a réussi.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { STAGING_DIR } from './stage';

/** Clé bucket du manifeste runtime (même valeur que côté `collect-comics`). */
export const MANIFEST_KEY = 'images/4-comics/comics.json';

export interface SyncPaths {
  /** Manifeste produit par `assets:collect-comics` dans le staging. */
  manifest: string;
  /** État du push (`clé → sha1`) tenu par `scripts/assets-push.mjs`. */
  pushed: string;
  /** Repli committé, lu par la page quand R2 ne répond pas (et en dev). */
  seed: string;
}

const DEFAULTS: SyncPaths = {
  manifest: resolve(STAGING_DIR, MANIFEST_KEY),
  pushed: resolve('datagen/assets/pushed.json'),
  seed: resolve('data/generated/comics.json'),
};

/**
 * `absent`      — pas de manifeste dans le staging (aucune BD déposée, ou pool
 *                 partiel retenu par le garde-fou de `collect-comics`) ;
 * `non-poussé`  — manifeste présent mais pas (encore) confirmé sur R2 ;
 * `à jour`      — le repli reflète déjà le manifeste en ligne ;
 * `mis à jour`  — repli réécrit.
 */
export type SyncOutcome = 'absent' | 'non-poussé' | 'à jour' | 'mis à jour';

export function syncComicsSeed(paths: SyncPaths = DEFAULTS): SyncOutcome {
  if (!existsSync(paths.manifest)) return 'absent';
  const raw = readFileSync(paths.manifest);
  const sha = createHash('sha1').update(raw).digest('hex');

  const pushed: unknown = existsSync(paths.pushed)
    ? JSON.parse(readFileSync(paths.pushed, 'utf8'))
    : {};
  const live =
    pushed && typeof pushed === 'object'
      ? (pushed as Record<string, unknown>)[MANIFEST_KEY]
      : undefined;
  if (live !== sha) return 'non-poussé';

  // Copie OCTET POUR OCTET du manifeste confirmé : le repli et ce qui est servi
  // en ligne ne peuvent alors plus diverger d'une virgule. `collect-comics`
  // écrit déjà en 2 espaces + newline finale, donc prettier reste content.
  const text = raw.toString('utf8');
  if (existsSync(paths.seed) && readFileSync(paths.seed, 'utf8') === text) return 'à jour';
  writeFileSync(paths.seed, text);
  return 'mis à jour';
}

if (isMain(import.meta.url)) {
  const outcome = syncComicsSeed();
  if (outcome === 'mis à jour') {
    console.log('repli 4-comics → réaligné sur le manifeste en ligne (data/generated/comics.json)');
  } else if (outcome === 'non-poussé') {
    console.warn(
      '⚠ 4-comics : le manifeste du staging n’est pas confirmé sur R2 — repli committé INCHANGÉ.\n' +
        '  (push interrompu ? relance `pnpm assets:push`.)',
    );
  }
  // `absent` / `à jour` : cas nominaux et silencieux — ne pas bruiter `pnpm images`.
}

/**
 * COLLECTE AUDIO — peuple `.assets-staging/audio/bgm` avec les mp3 de l'OST,
 * pour que `assets:push` les envoie sur R2 (le push parcourt tout le staging).
 * Même étage que la collecte d'images : pool extrait du JEU → staging → push.
 *
 * Source = pool audio extrait NATIVEMENT en V3 (`pnpm datagen:extract-audio` →
 * `.gamedata/extracted/audio/bgm`, produit par la chaîne datamine côté worker).
 * Plus aucune dépendance au repo V2. Le pool est déjà l'ensemble BGM curé (la
 * regex de familles de l'extracteur filtre) : on copie TOUT, aucun orphelin.
 *
 * On copie tout (pas de filtrage par le mapping) pour que de NOUVELLES pistes
 * atterrissent en staging et soient découvertes par `pnpm datagen:bgm` ; le
 * mapping est DÉRIVÉ du pool, pas l'inverse.
 *
 * Idempotent : ne recopie qu'un fichier absent ou de taille différente. Si le
 * pool est absent (extraction pas encore lancée), on prévient et on sort sans
 * erreur — `pnpm images` ne doit pas casser pour autant.
 *
 * Exécution : `pnpm assets:collect-audio` (ou via `pnpm images`).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { STAGING_DIR } from './stage';

/** Pool audio extrait du jeu (miroir de `GAME_IMAGES_DIR` pour les images). */
const GAME_AUDIO_DIR = resolve('.gamedata/extracted/audio/bgm');
const DEST_DIR = resolve(STAGING_DIR, 'audio/bgm');

export function collectAudio(): { copied: number; skipped: number } {
  if (!existsSync(GAME_AUDIO_DIR)) {
    console.warn(
      `⚠ pool audio introuvable (${GAME_AUDIO_DIR}) — lance : pnpm datagen:extract-audio. Collecte sautée.`,
    );
    return { copied: 0, skipped: 0 };
  }

  const files = readdirSync(GAME_AUDIO_DIR).filter((f) => f.toLowerCase().endsWith('.mp3'));
  mkdirSync(DEST_DIR, { recursive: true });

  let copied = 0;
  let skipped = 0;
  for (const file of files) {
    const from = resolve(GAME_AUDIO_DIR, file);
    const to = resolve(DEST_DIR, file);
    // Recopie seulement si absent ou taille différente (idempotence bon marché).
    if (existsSync(to) && statSync(to).size === statSync(from).size) {
      skipped++;
      continue;
    }
    copyFileSync(from, to);
    copied++;
  }
  return { copied, skipped };
}

const { copied, skipped } = collectAudio();
if (copied || skipped) {
  console.log(`audio/bgm — ${copied} copiés, ${skipped} à jour`);
}

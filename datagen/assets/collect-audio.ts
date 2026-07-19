/**
 * COLLECTE AUDIO — peuple `.assets-staging/audio/bgm` avec les mp3 de l'OST,
 * pour que `assets:push` les envoie sur R2 (le push parcourt tout le staging).
 *
 * DATA-DRIVEN : on ne copie que les pistes réellement référencées par
 * `data/generated/bgm_mapping.json` (même doctrine que le manifest d'images —
 * jamais d'orphelin poussé). Source = pool audio V2 (`v2AudioBgmDir`), là où
 * vivent les mp3 déjà convertis par la chaîne datamine (hors scope V3).
 *
 * Idempotent : ne recopie qu'un fichier absent ou de taille différente. Si le
 * pool est absent (machine sans repo V2), on prévient et on sort sans erreur —
 * `pnpm images` ne doit pas casser pour autant.
 *
 * Exécution : `pnpm assets:collect-audio` (ou via `pnpm images`).
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { v2AudioBgmDir } from '../lib/env';
import { STAGING_DIR } from './stage';

interface BgmTrack {
  file: string;
}

const MAPPING = resolve('data/generated/bgm_mapping.json');
const DEST_DIR = resolve(STAGING_DIR, 'audio/bgm');

export function collectAudio(): { copied: number; skipped: number; missing: string[] } {
  const src = v2AudioBgmDir();
  if (!existsSync(src)) {
    console.warn(`⚠ pool audio introuvable (${src}) — collecte audio sautée.`);
    return { copied: 0, skipped: 0, missing: [] };
  }
  if (!existsSync(MAPPING)) {
    console.warn(`⚠ ${MAPPING} absent — lance d'abord : pnpm datagen:bgm`);
    return { copied: 0, skipped: 0, missing: [] };
  }

  const tracks = JSON.parse(readFileSync(MAPPING, 'utf8')) as BgmTrack[];
  mkdirSync(DEST_DIR, { recursive: true });

  let copied = 0;
  let skipped = 0;
  const missing: string[] = [];
  for (const { file } of tracks) {
    const from = resolve(src, `${file}.mp3`);
    const to = resolve(DEST_DIR, `${file}.mp3`);
    if (!existsSync(from)) {
      missing.push(file);
      continue;
    }
    // Recopie seulement si absent ou taille différente (idempotence bon marché).
    if (existsSync(to) && statSync(to).size === statSync(from).size) {
      skipped++;
      continue;
    }
    copyFileSync(from, to);
    copied++;
  }
  return { copied, skipped, missing };
}

const { copied, skipped, missing } = collectAudio();
if (copied || skipped) {
  console.log(
    `audio/bgm — ${copied} copiés, ${skipped} à jour${missing.length ? `, ${missing.length} absents du pool` : ''}`,
  );
}
if (missing.length) {
  console.warn(
    `⚠ mp3 référencés mais absents du pool : ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '…' : ''}`,
  );
}

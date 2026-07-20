/**
 * INDEX des images extraites du JEU (`.gamedata/extracted/images`, produit par
 * `pnpm datagen:extract images` via AssetStudio).
 *
 * Les sprites sortent rangés par container Unity mais leurs NOMS de fichiers
 * sont les clés stables du jeu (CT_2000001, IG_Buff_Dot_Burn…). On indexe donc
 * par basename. Un même nom peut exister dans plusieurs containers (common /
 * re_common…) : choix DÉTERMINISTE = premier chemin en ordre trié.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { walkFiles } from '../lib/fs';

export const GAME_IMAGES_DIR = resolve('.gamedata/extracted/images');

export type ImageIndex = Map<string, string>;

/** Construit l'index basename (sans extension, minuscule) → chemin absolu. */
export function buildImageIndex(dir = GAME_IMAGES_DIR): ImageIndex {
  const index: ImageIndex = new Map();
  if (!existsSync(dir)) return index;

  // Parcours partagé (lib/fs), TRIÉ : « premier trié gagne » — le tri rend
  // l'index déterministe quel que soit l'ordre du FS.
  walkFiles(
    dir,
    (full, rel) => {
      const name = rel.split('/').pop()!;
      if (!/\.png$/i.test(name)) return;
      const key = name.replace(/\.png$/i, '').toLowerCase();
      if (!index.has(key)) index.set(key, full); // premier trié gagne
    },
    { sorted: true },
  );
  return index;
}

/** Premier candidat présent dans l'index (basenames, insensible à la casse). */
export function findImage(index: ImageIndex, candidates: string[]): string | undefined {
  for (const c of candidates) {
    const hit = index.get(c.toLowerCase());
    if (hit) return hit;
  }
  return undefined;
}

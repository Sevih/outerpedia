/**
 * INDEX des images extraites du JEU (`.gamedata/extracted/images`, produit par
 * `pnpm datagen:extract images` via AssetStudio).
 *
 * Les sprites sortent rangés par container Unity mais leurs NOMS de fichiers
 * sont les clés stables du jeu (CT_2000001, IG_Buff_Dot_Burn…). On indexe donc
 * par basename. Un même nom peut exister dans plusieurs containers (common /
 * re_common…) : choix DÉTERMINISTE = premier chemin en ordre trié.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const GAME_IMAGES_DIR = resolve('.gamedata/extracted/images');

export type ImageIndex = Map<string, string>;

/** Construit l'index basename (sans extension, minuscule) → chemin absolu. */
export function buildImageIndex(dir = GAME_IMAGES_DIR): ImageIndex {
  const index: ImageIndex = new Map();
  if (!existsSync(dir)) return index;

  const walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const full = join(d, e.name);
      if (e.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.png$/i.test(e.name)) continue;
      const key = e.name.replace(/\.png$/i, '').toLowerCase();
      if (!index.has(key)) index.set(key, full); // premier trié gagne
    }
  };
  walk(dir);
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

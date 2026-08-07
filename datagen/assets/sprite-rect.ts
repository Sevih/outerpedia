/**
 * TAILLE LOGIQUE des sprites que Unity stocke ROGNÉS.
 *
 * Le packer d'atlas coupe les bords entièrement transparents. AssetStudio
 * n'exporte que ce qui reste : un fichier plus petit que le sprite, et rarement
 * rogné symétriquement (`MT_4031033` perd 30 px à gauche et 0 à droite). Tout
 * consommateur qui l'étire sur la taille attendue le déforme ET le décale — ce
 * qui déplaçait le portrait dans son fond sur 232 des 515 vignettes de monstres.
 *
 * On répare donc À LA SOURCE : le staging repose les marges, et l'asset servi a
 * la taille que le jeu lui donne. Les composants n'ont rien à savoir de tout ça.
 *
 * La table est produite par `datagen/assets/extract-sprite-rect.py` (UnityPy) et
 * COMMITTÉE — même montage que `face-icon-layout.json`.
 */
import { readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

/** Source du staging au même titre que l'image : un rognage corrigé doit refaire la cible. */
export const SPRITE_RECT = resolve('datagen/assets/sprite-rect.json');

interface Rect {
  /** Taille LOGIQUE du sprite. */
  w: number;
  h: number;
  /** Position du morceau stocké dans ce rect, origine en BAS À GAUCHE (Unity). */
  left: number;
  bottom: number;
}

let cache: Record<string, Rect> | null = null;
function table(): Record<string, Rect> {
  if (!cache) {
    try {
      cache = JSON.parse(readFileSync(SPRITE_RECT, 'utf8')) as Record<string, Rect>;
    } catch {
      // Table absente = rien à repadder (dépôt neuf, extraction pas encore jouée).
      cache = {};
    }
  }
  return cache;
}

/**
 * Clé = `<atlas>/<sprite>`, et pas le seul nom : 32 noms existent dans plusieurs
 * atlas avec des géométries DIFFÉRENTES (`CM_Element_Water` fait 42×42 dans
 * `common` et 46×46 dans `re_common`). L'atlas se lit dans le chemin extrait,
 * qui range les sprites par container Unity.
 */
function keyFor(src: string): string {
  return `${basename(dirname(src))}/${basename(src).replace(/\.png$/i, '')}`;
}

/**
 * Ce sprite est-il dans la table ? Sert à n'ajouter `sprite-rect.json` aux
 * SOURCES de fraîcheur que pour les sprites qu'il concerne : le lier à toutes
 * les images ferait re-produire les ~3 000 fichiers du staging à chaque
 * ré-extraction, dont l'immense majorité à l'octet près.
 */
export function hasRect(src: string): boolean {
  return keyFor(src) in table();
}

export interface Padding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Marges à reposer sur `src` (dont la taille réelle est `w`×`h`), ou undefined
 * si le sprite n'est pas rogné.
 *
 * Les dimensions du fichier sont RELUES plutôt que déduites de la table : les
 * `textureRect` de l'atlas sont fractionnaires (110,924) et l'export arrondit.
 * Un désaccord d'un pixel doit se voir ici, pas produire une image de travers —
 * d'où le `null` en cas d'incohérence, que l'appelant remonte au rapport.
 */
export function paddingFor(src: string, w: number, h: number): Padding | undefined | null {
  const rect = table()[keyFor(src)];
  if (!rect) return undefined;
  const pad = {
    left: rect.left,
    right: rect.w - rect.left - w,
    bottom: rect.bottom,
    top: rect.h - rect.bottom - h,
  };
  if (pad.left < 0 || pad.right < 0 || pad.top < 0 || pad.bottom < 0) return null;
  if (pad.left + pad.right + w !== rect.w || pad.top + pad.bottom + h !== rect.h) return null;
  return pad;
}

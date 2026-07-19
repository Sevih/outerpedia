/**
 * HERO FULL ART — énumération des illustrations de perso réutilisées par la
 * page `/wallpapers` (catégorie HeroFullArt) ET hébergées par le manifest.
 *
 * SOURCE UNIQUE partagée (manifest ⇄ wallpapers, sans cycle d'import). On
 * réplique l'INTENTION de la V2 (`pipeline/steps/wallpapers.ts`) — catégorie
 * HeroFullArt = tout sprite `IMG_<digits>` de la galerie d'illustrations, filtré
 * en largeur — mais SANS sa dédup par hash perceptuel (heuristique lossy qui
 * jetait de vrais arts alternatifs). Résultat : SUPERSET du set V2, natif,
 * auto-maintenu (un art ajouté par un patch arrive tout seul).
 *
 * Deux détails de robustesse :
 *   - un même `IMG_<id>` existe souvent dans plusieurs écrans UI (recruit,
 *     questpopup…) : on PRÉFÈRE la copie `ui/illust/` (pleine résolution) ;
 *   - on garde les variantes `IMG_<id>_NN` (arts alternatifs) que l'ancien
 *     filtre ancré `^IMG_\d+$` excluait, et les arts de PNJ (`IMG_3000032`,
 *     hors `illust/`) que seul ce conteneur porte.
 */
import { closeSync, existsSync, openSync, readdirSync, readSync } from 'node:fs';
import { join } from 'node:path';
import { GAME_IMAGES_DIR } from './source';

/** Largeur minimale d'un art affichable (même seuil que la V2 : exclut les vignettes). */
const MIN_WIDTH = 250;

export interface HeroArt {
  /** Nom de fichier sans extension (`IMG_<id>` ou `IMG_<id>_NN`). */
  f: string;
  /** Chemin absolu du PNG source (copie `illust` préférée). */
  path: string;
  w: number;
  h: number;
}

/** Dimensions d'un PNG via son en-tête (signature + IHDR) — `null` si illisible. */
function pngDims(path: string): { w: number; h: number } | null {
  try {
    const buf = Buffer.alloc(24);
    const fd = openSync(path, 'r');
    readSync(fd, buf, 0, 24, 0);
    closeSync(fd);
    if (buf.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

const isIllust = (p: string): boolean => /[\\/]ui[\\/]illust[\\/]/i.test(p);

/**
 * Liste les illustrations de perso (déterministe, triée par `f`). Un basename
 * vu dans plusieurs conteneurs garde la copie `illust` ; les sprites < 250 px
 * de large sont écartés (vignettes réutilisant le même nom).
 */
export function listHeroFullArt(dir = GAME_IMAGES_DIR): HeroArt[] {
  if (!existsSync(dir)) return [];
  const chosen = new Map<string, string>(); // basename minuscule → chemin retenu

  const walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      if (e.isDirectory()) {
        walk(full);
        continue;
      }
      const m = /^(IMG_\d+(?:_\d+)?)\.png$/i.exec(e.name);
      if (!m) continue;
      const key = m[1].toLowerCase();
      const prev = chosen.get(key);
      // Première vue, ou on remplace une copie non-illust par la copie illust.
      if (!prev || (!isIllust(prev) && isIllust(full))) chosen.set(key, full);
    }
  };
  walk(dir);

  const out: HeroArt[] = [];
  for (const path of chosen.values()) {
    const d = pngDims(path);
    if (!d || d.w < MIN_WIDTH) continue;
    const f = path
      .replace(/\.png$/i, '')
      .split(/[\\/]/)
      .pop()!;
    out.push({ f, path, w: d.w, h: d.h });
  }
  return out.sort((a, b) => (a.f < b.f ? -1 : a.f > b.f ? 1 : 0));
}

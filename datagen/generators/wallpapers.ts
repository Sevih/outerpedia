/**
 * Générateur — catalogue des WALLPAPERS (`/wallpapers`).
 *
 * Produit `wallpapers.json` : `{ catégorie: [{ f, w, h }] }`. Trois provenances,
 * jamais la V2 :
 *   - **HeroFullArt** : RÉUTILISE les full-arts perso déjà extraits/hébergés
 *     (`IMG_<id>`, cf. `img.full`) — on ne ré-héberge rien (décision Sevih). On
 *     énumère les `IMG_<id>` du pool d'images du jeu et on lit leurs dimensions.
 *   - **Cutin / Full / Banner / Art** : pool wallpaper extrait NATIVEMENT par le
 *     worker (`.gamedata/extracted/wallpapers/<cat>`, webp + png dédupliqués).
 *     `Full` est éclaté en `Full:Events` / `Full:Scenario` / `Full:Others`.
 *   - **Outerpedia** : 5 wallpapers ÉDITORIAUX faits main, ramenés en V3
 *     (`.editorial/wallpapers/Outerpedia`, gitignoré → R2).
 *
 * Dimensions : lues sur l'en-tête PNG (24 octets) — chaque entrée a un `.png`
 * (téléchargement), et webp/png partagent les mêmes dimensions.
 *
 * Écriture CANONIQUE : `pnpm datagen:build` (buildWallpapers via writeJson +
 * promote). L'exécution directe IMPRIME pour revue.
 */
import { closeSync, existsSync, openSync, readdirSync, readSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { buildImageIndex } from '../assets/source';

/** Une entrée wallpaper : nom de fichier (sans extension) + dimensions. */
export interface Wallpaper {
  f: string;
  w: number;
  h: number;
}
export type WallpapersData = Record<string, Wallpaper[]>;

/** Pool wallpaper extrait du jeu (worker) — catégories Cutin/Full/Banner/Art. */
const GAME_POOL = resolve('.gamedata/extracted/wallpapers');
/** Pool éditorial ramené en V3 (Outerpedia). */
const EDITORIAL = resolve('.editorial/wallpapers');

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

/** Comparateur déterministe par nom de fichier (ordre stable du JSON). */
function byF(a: Wallpaper, b: Wallpaper): number {
  return a.f < b.f ? -1 : a.f > b.f ? 1 : 0;
}

/** Scanne un dossier de catégorie : une entrée par `.png`, dimensions lues. */
function scanCategory(dir: string): Wallpaper[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .map((f) => {
      const stem = f.replace(/\.png$/i, '');
      const d = pngDims(join(dir, f));
      return { f: stem, w: d?.w ?? 0, h: d?.h ?? 0 };
    })
    .sort(byF);
}

/** Full-arts perso réutilisés (IMG_<id> du pool jeu) — aucune re-extraction. */
function heroFullArt(): Wallpaper[] {
  const index = buildImageIndex();
  const out: Wallpaper[] = [];
  for (const [key, path] of index) {
    if (!/^img_\d+$/.test(key)) continue;
    const d = pngDims(path);
    out.push({ f: basename(path).replace(/\.png$/i, ''), w: d?.w ?? 0, h: d?.h ?? 0 });
  }
  return out.sort(byF);
}

/** Construit le catalogue complet des wallpapers. */
export function buildWallpapers(): WallpapersData {
  const out: WallpapersData = {};

  // Éditorial + full-arts réutilisés (disponibles sans le pool worker).
  out.Outerpedia = scanCategory(join(EDITORIAL, 'Outerpedia'));
  out.HeroFullArt = heroFullArt();

  // Pool jeu (worker) — vide tant que l'extraction n'a pas tourné.
  out.Cutin = scanCategory(join(GAME_POOL, 'Cutin'));
  out.Banner = scanCategory(join(GAME_POOL, 'Banner'));
  out.Art = scanCategory(join(GAME_POOL, 'Art'));

  // Full éclaté par préfixe (mêmes règles que la V2).
  const full = scanCategory(join(GAME_POOL, 'Full'));
  out['Full:Events'] = full.filter((w) => w.f.startsWith('T_Event'));
  out['Full:Scenario'] = full.filter((w) => w.f.startsWith('T_Scenario'));
  out['Full:Others'] = full.filter(
    (w) => !w.f.startsWith('T_Event') && !w.f.startsWith('T_Scenario'),
  );

  return out;
}

// Exécution directe = REVUE (impression) ; writer canonique = `datagen:build`.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildWallpapers(), null, 2));
}

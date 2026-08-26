/**
 * Générateur — catalogue des WALLPAPERS (`/wallpapers`).
 *
 * Produit `wallpapers.json` : `{ catégorie: [{ f, w, h }] }`. Trois provenances,
 * aucune extérieure :
 *   - **HeroFullArt** : RÉUTILISE les full-arts perso déjà hébergés (`IMG_<id>`,
 *     cf. `img.full`) — on ne ré-héberge rien deux fois (décision Sevih). La
 *     liste vient de `listHeroFullArt` (source partagée avec le manifest, qui en
 *     garantit l'hébergement) : superset de l'ancien set (base + skins + arts
 *     alternatifs `_NN` + arts de PNJ), sans l'ancienne dédup perceptuelle lossy.
 *   - **Cutin / Full / Banner / Art** : pool wallpaper extrait NATIVEMENT par le
 *     worker (`.gamedata/extracted/wallpapers/<cat>`, webp + png dédupliqués).
 *     `Full` est éclaté en `Full:Events` / `Full:Scenario` / `Full:Others`.
 *   - **Outerpedia** : 5 wallpapers ÉDITORIAUX faits main, rapatriés
 *     (`.editorial/wallpapers/Outerpedia`, gitignoré → R2).
 *
 * Dimensions : lues sur l'en-tête PNG (24 octets) — chaque entrée a un `.png`
 * (téléchargement), et webp/png partagent les mêmes dimensions.
 *
 * Écriture CANONIQUE : `pnpm datagen:build` (buildWallpapers via writeJson +
 * promote). L'exécution directe IMPRIME pour revue.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { readPngSize } from '../lib/png';
import { isUnreleasedCharacterAsset } from '../lib/released';
import { listHeroFullArt } from '../assets/hero-full-art';
import { gamedata } from '../lib/paths';

/** Une entrée wallpaper : nom de fichier (sans extension) + dimensions. */
export interface Wallpaper {
  f: string;
  w: number;
  h: number;
}
export type WallpapersData = Record<string, Wallpaper[]>;

/** Pool wallpaper extrait du jeu (worker) — catégories Cutin/Full/Banner/Art. */
const GAME_POOL = gamedata('extracted/wallpapers');
/** Pool éditorial rapatrié (Outerpedia). */
const EDITORIAL = resolve('.editorial/wallpapers');

/** Comparateur déterministe par nom de fichier (ordre stable du JSON). */
function byF(a: Wallpaper, b: Wallpaper): number {
  return a.f < b.f ? -1 : a.f > b.f ? 1 : 0;
}

/** Scanne un dossier de catégorie : une entrée par `.png`, dimensions lues. */
function scanCategory(dir: string): Wallpaper[] {
  if (!existsSync(dir)) return [];
  return (
    readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.png'))
      .map((f) => f.replace(/\.png$/i, ''))
      // Cutin/Art sont nommés par id de perso : on n'annonce pas les illustrations
      // d'un perso que le wiki n'a pas encore intégré (cf. `released.ts`).
      .filter((stem) => !isUnreleasedCharacterAsset(stem))
      .map((stem) => {
        const d = readPngSize(join(dir, `${stem}.png`));
        return { f: stem, w: d?.w ?? 0, h: d?.h ?? 0 };
      })
      .sort(byF)
  );
}

/**
 * Full-arts perso réutilisés — aucune re-extraction. Set = `listHeroFullArt`
 * (source partagée avec le manifest qui les héberge sous `images/characters/
 * full/IMG_<id>.webp`). Superset de l'ancien set : base + skins + arts alternatifs
 * `_NN` + arts de PNJ, sans l'ancienne dédup perceptuelle lossy. Toute entrée est
 * donc garantie hébergée (le manifest en fait la demande), jamais de 404.
 */
function heroFullArt(): Wallpaper[] {
  return listHeroFullArt().map(({ f, w, h }) => ({ f, w, h }));
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

  // Full éclaté par préfixe (règles inchangées).
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

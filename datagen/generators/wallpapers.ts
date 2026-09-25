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
 *   - **Versions archivées** `<stem>@<n>` : un asset que le jeu a REMPLACÉ en
 *     place, dont l'ancienne version vit dans `.editorial/wallpapers/<cat>` (cf.
 *     assets/wallpaper-versions.ts). Émises `retired: true` en fin de leur
 *     catégorie (HeroFullArt compris) — l'onglet « Archivés » les sert.
 *
 * Dimensions : lues sur l'en-tête PNG (24 octets) — chaque entrée a un `.png`
 * (téléchargement), et webp/png partagent les mêmes dimensions. Une archive
 * HeroFullArt peut n'avoir qu'un webp (version publiée récupérée du staging) :
 * sharp lit alors ses dimensions.
 *
 * Écriture CANONIQUE : `pnpm datagen:build` (buildWallpapers via writeJson +
 * promote). L'exécution directe IMPRIME pour revue.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { isMain } from '../lib/is-main';
import { readPngSize } from '../lib/png';
import { isUnreleasedCharacterAsset } from '../lib/released';
import { listHeroFullArt } from '../assets/hero-full-art';
import { isArchivedVersion } from '../assets/wallpaper-versions';
import { gamedata } from '../lib/paths';

/** Une entrée wallpaper : nom de fichier (sans extension) + dimensions. */
export interface Wallpaper {
  f: string;
  w: number;
  h: number;
  /**
   * Retiré du jeu mais toujours servi par R2 — posé par la RÉTENTION de
   * catalogue de `promote` (`RETAIN_CATALOGS`), jamais par ce générateur, qui
   * ne voit que le pool courant. Le front le range sous l'onglet « Archivés ».
   */
  retired?: boolean;
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
      // Les archives `@n` ont leur propre scan (`scanArchived`), marquées retired.
      .filter((stem) => !isArchivedVersion(stem))
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

/**
 * Versions ARCHIVÉES d'une catégorie (`.editorial/wallpapers/<cat>/<stem>@<n>`) :
 * entrées `retired`, triées, après les vivantes. Même filtre perso que le reste
 * (l'id se lit en tête du stem, le suffixe n'y change rien).
 */
async function scanArchived(category: string): Promise<Wallpaper[]> {
  const dir = join(EDITORIAL, category);
  if (!existsSync(dir)) return [];
  const stems = [
    ...new Set(
      readdirSync(dir)
        .filter((f) => /\.(png|webp)$/i.test(f))
        .map((f) => f.replace(/\.(png|webp)$/i, '')),
    ),
  ]
    .filter(isArchivedVersion)
    .filter((stem) => !isUnreleasedCharacterAsset(stem));
  const out: Wallpaper[] = [];
  for (const stem of stems) {
    const png = join(dir, `${stem}.png`);
    let d = existsSync(png) ? readPngSize(png) : null;
    if (!d) {
      const m = await sharp(join(dir, `${stem}.webp`)).metadata();
      d = m.width && m.height ? { w: m.width, h: m.height } : null;
    }
    out.push({ f: stem, w: d?.w ?? 0, h: d?.h ?? 0, retired: true });
  }
  return out.sort(byF);
}

/** Construit le catalogue complet des wallpapers. */
export async function buildWallpapers(): Promise<WallpapersData> {
  const out: WallpapersData = {};

  // Éditorial + full-arts réutilisés (disponibles sans le pool worker).
  out.Outerpedia = scanCategory(join(EDITORIAL, 'Outerpedia'));
  out.HeroFullArt = [...heroFullArt(), ...(await scanArchived('HeroFullArt'))];

  // Pool jeu (worker) — vide tant que l'extraction n'a pas tourné — suivi des
  // versions archivées de la catégorie.
  for (const cat of ['Cutin', 'Banner', 'Art'] as const) {
    out[cat] = [...scanCategory(join(GAME_POOL, cat)), ...(await scanArchived(cat))];
  }

  // Full éclaté par préfixe (règles inchangées) — vivantes puis archivées, le
  // préfixe se lisant pareil sur un stem `@n`.
  const full = [...scanCategory(join(GAME_POOL, 'Full')), ...(await scanArchived('Full'))];
  out['Full:Events'] = full.filter((w) => w.f.startsWith('T_Event'));
  out['Full:Scenario'] = full.filter((w) => w.f.startsWith('T_Scenario'));
  out['Full:Others'] = full.filter(
    (w) => !w.f.startsWith('T_Event') && !w.f.startsWith('T_Scenario'),
  );

  return out;
}

// Exécution directe = REVUE (impression) ; writer canonique = `datagen:build`.
if (isMain(import.meta.url)) {
  buildWallpapers().then((data) => console.log(JSON.stringify(data, null, 2)));
}

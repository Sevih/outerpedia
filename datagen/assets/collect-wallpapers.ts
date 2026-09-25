/**
 * COLLECTE WALLPAPERS — peuple `.assets-staging/images/download/<cat>` pour que
 * `assets:push` envoie les wallpapers sur R2 (webp affichage + png download).
 * Même étage que la collecte d'images/audio : pools → staging → push.
 *
 * Deux sources, aucune extérieure :
 *   - **jeu** : pool extrait par le worker `.gamedata/extracted/wallpapers/<cat>`
 *     (Cutin/Full/Banner/Art) ;
 *   - **éditorial** : `.editorial/wallpapers/<cat>` — les 5 faits main
 *     (`Outerpedia`) ET les VERSIONS ARCHIVÉES `<stem>@<n>` des catégories jeu +
 *     `HeroFullArt` (cf. wallpaper-versions.ts). Pour HeroFullArt seul le webp
 *     part en staging (`images/download/HeroFullArt/`) : le png y est l'original
 *     conservé, pas un format servi (les full-arts vivants sont servis en webp).
 *
 * HeroFullArt VIVANT n'est pas collecté ici : il RÉUTILISE les full-arts perso
 * mis en staging par `assets:collect` (`images/characters/full/IMG_<id>`).
 *
 * REMPLACEMENT EN PLACE : avant d'écraser en staging un fichier du pool jeu (ou
 * un full-art perso) qui diffère VISUELLEMENT de la copie déjà en staging, cette
 * copie — la version publiée — part en archive `@<n>` dans le pool éditorial.
 * D'où l'ORDRE dans `pnpm images` : cette collecte passe AVANT `assets:collect`,
 * qui réécrit `images/characters/full/` et effacerait la trace de l'ancien art.
 *
 * Idempotent (recopie si absent/taille différente). Pools absents → no-op sans
 * erreur (extraction pas encore lancée), pour ne pas casser `pnpm images`.
 *
 * Exécution : `pnpm assets:collect-wallpapers` (ou via `pnpm images`).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isUnreleasedCharacterAsset } from '../lib/released';
import { STAGING_DIR } from './stage';
import { gamedata } from '../lib/paths';
import { isMain } from '../lib/is-main';
import { listHeroFullArt } from './hero-full-art';
import {
  EDITORIAL_WALLPAPERS,
  archiveSuperseded,
  isArchivedVersion,
  looksDifferent,
} from './wallpaper-versions';

const GAME_POOL = gamedata('extracted/wallpapers');
const DEST = resolve(STAGING_DIR, 'images/download');
/** Full-arts perso en staging (produits par `assets:collect`) : la version publiée. */
const STAGING_FULL = resolve(STAGING_DIR, 'images/characters/full');

/** Catégories jeu (worker) — chacune doublée de son dossier éditorial d'archives. */
const GAME_CATEGORIES = ['Cutin', 'Full', 'Banner', 'Art'] as const;

interface Source {
  root: string;
  category: string;
  /** Archiver la copie en staging quand le pool la remplace visuellement. */
  detectReplacement: boolean;
  /** Extensions collectées (HeroFullArt archivé : webp seul). */
  exts: RegExp;
}
const SOURCES: Source[] = [
  ...GAME_CATEGORIES.map((c) => ({
    root: GAME_POOL,
    category: c,
    detectReplacement: true,
    exts: /\.(webp|png)$/i,
  })),
  ...GAME_CATEGORIES.map((c) => ({
    root: EDITORIAL_WALLPAPERS,
    category: c,
    detectReplacement: false,
    exts: /\.(webp|png)$/i,
  })),
  {
    root: EDITORIAL_WALLPAPERS,
    category: 'Outerpedia',
    detectReplacement: false,
    exts: /\.(webp|png)$/i,
  },
  {
    root: EDITORIAL_WALLPAPERS,
    category: 'HeroFullArt',
    detectReplacement: false,
    exts: /\.webp$/i,
  },
];

export interface CollectStats {
  copied: number;
  skipped: number;
  pruned: number;
  /** Stems archivés (`<stem>@<n>`) parce que le jeu les a remplacés en place. */
  archived: string[];
}

/** Copie les webp/png d'un dossier de catégorie vers le staging (idempotent). */
async function copyCategory(src: Source): Promise<CollectStats> {
  const srcDir = join(src.root, src.category);
  const stats: CollectStats = { copied: 0, skipped: 0, pruned: 0, archived: [] };
  if (!existsSync(srcDir)) return stats;
  const destDir = resolve(DEST, src.category);
  mkdirSync(destDir, { recursive: true });
  // Le dossier éditorial d'une catégorie JEU ne porte que des archives `@n` ; un
  // fichier sans suffixe y serait une collision de nom avec le pool jeu.
  const onlyArchived = src.root === EDITORIAL_WALLPAPERS && src.category !== 'Outerpedia';
  // Tri : le png d'un stem précède son webp — la détection (sur le png) archive
  // les deux copies AVANT que l'une ou l'autre soit écrasée.
  for (const f of readdirSync(srcDir).sort()) {
    if (!src.exts.test(f)) continue;
    const stem = f.replace(/\.(webp|png)$/i, '');
    if (onlyArchived && !isArchivedVersion(stem)) continue;
    const from = join(srcDir, f);
    const to = join(destDir, f);
    // Perso pas encore intégré au wiki (Cutin/Art sont nommés par id) : on ne
    // le pousse pas sur R2 — et on RETIRE la copie qu'une collecte précédente
    // aurait déjà déposée, sinon le push continuerait de l'envoyer.
    if (isUnreleasedCharacterAsset(stem)) {
      if (existsSync(to)) {
        rmSync(to, { force: true });
        stats.pruned++;
      }
      continue;
    }
    if (existsSync(to) && statSync(to).size === statSync(from).size) {
      stats.skipped++;
      continue;
    }
    // Remplacement en place par le jeu : la version publiée (staging) part en
    // archive avant d'être écrasée — seulement si elle diffère VISUELLEMENT.
    if (
      src.detectReplacement &&
      /\.png$/i.test(f) &&
      existsSync(to) &&
      (await looksDifferent(to, from))
    ) {
      const prev = ['png', 'webp'].map((e) => join(destDir, `${stem}.${e}`)).filter(existsSync);
      stats.archived.push(`${src.category}/${archiveSuperseded(src.category, stem, prev)}`);
    }
    copyFileSync(from, to);
    stats.copied++;
  }
  return stats;
}

/**
 * Full-arts perso (HeroFullArt) : la version publiée est le webp en staging
 * (`images/characters/full/IMG_<id>.webp`, écrit par `assets:collect`) ; le
 * pool jeu porte le png courant. S'ils diffèrent visuellement, le webp part en
 * archive `@n` — d'où le passage AVANT `assets:collect` (cf. en-tête).
 */
async function archiveReplacedHeroFullArt(): Promise<string[]> {
  if (!existsSync(STAGING_FULL)) return [];
  const archived: string[] = [];
  for (const art of listHeroFullArt()) {
    const prev = join(STAGING_FULL, `${art.f}.webp`);
    if (!existsSync(prev)) continue;
    if (await looksDifferent(prev, art.path))
      archived.push(`HeroFullArt/${archiveSuperseded('HeroFullArt', art.f, [prev])}`);
  }
  return archived;
}

export async function collectWallpapers(): Promise<CollectStats> {
  const total: CollectStats = { copied: 0, skipped: 0, pruned: 0, archived: [] };
  // D'abord les archives de full-arts (lecture seule du staging perso), puis les
  // catégories — l'éditorial APRÈS le jeu, pour collecter une archive créée à
  // l'instant par la détection.
  total.archived.push(...(await archiveReplacedHeroFullArt()));
  for (const src of SOURCES) {
    const r = await copyCategory(src);
    total.copied += r.copied;
    total.skipped += r.skipped;
    total.pruned += r.pruned;
    total.archived.push(...r.archived);
  }
  return total;
}

if (isMain(import.meta.url)) {
  collectWallpapers().then(({ copied, skipped, pruned, archived }) => {
    if (archived.length)
      console.log(
        `wallpapers → ${archived.length} version(s) archivée(s) (remplacée(s) en place par le jeu) : ${archived.join(', ')}`,
      );
    if (copied || skipped || pruned) {
      const tail = pruned ? `, ${pruned} retirés (perso non intégré)` : '';
      console.log(`wallpapers → ${copied} copiés, ${skipped} à jour${tail}`);
    }
  });
}

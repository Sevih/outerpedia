/**
 * COLLECTE WALLPAPERS — peuple `.assets-staging/images/download/<cat>` pour que
 * `assets:push` envoie les wallpapers sur R2 (webp affichage + png download).
 * Même étage que la collecte d'images/audio : pools → staging → push.
 *
 * Deux sources, jamais la V2 :
 *   - **jeu** : pool extrait par le worker `.gamedata/extracted/wallpapers/<cat>`
 *     (Cutin/Full/Banner/Art) ;
 *   - **éditorial** : `.editorial/wallpapers/Outerpedia` (5 faits main, ramenés).
 *
 * HeroFullArt N'EST PAS collecté ici : il RÉUTILISE les full-arts perso déjà
 * mis en staging par `assets:collect` (`images/characters/full/IMG_<id>`).
 *
 * Idempotent (recopie si absent/taille différente). Pools absents → no-op sans
 * erreur (extraction pas encore lancée), pour ne pas casser `pnpm images`.
 *
 * Exécution : `pnpm assets:collect-wallpapers` (ou via `pnpm images`).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { STAGING_DIR } from './stage';

const GAME_POOL = resolve('.gamedata/extracted/wallpapers');
const EDITORIAL = resolve('.editorial/wallpapers');
const DEST = resolve(STAGING_DIR, 'images/download');

/** Catégories jeu (worker) + éditoriales (moi), rangées par [dossier source, cat]. */
const SOURCES: Array<[root: string, category: string]> = [
  [GAME_POOL, 'Cutin'],
  [GAME_POOL, 'Full'],
  [GAME_POOL, 'Banner'],
  [GAME_POOL, 'Art'],
  [EDITORIAL, 'Outerpedia'],
];

/** Copie les webp/png d'un dossier de catégorie vers le staging (idempotent). */
function copyCategory(srcDir: string, category: string): { copied: number; skipped: number } {
  if (!existsSync(srcDir)) return { copied: 0, skipped: 0 };
  const destDir = resolve(DEST, category);
  mkdirSync(destDir, { recursive: true });
  let copied = 0;
  let skipped = 0;
  for (const f of readdirSync(srcDir)) {
    if (!/\.(webp|png)$/i.test(f)) continue;
    const from = join(srcDir, f);
    const to = join(destDir, f);
    if (existsSync(to) && statSync(to).size === statSync(from).size) {
      skipped++;
      continue;
    }
    copyFileSync(from, to);
    copied++;
  }
  return { copied, skipped };
}

export function collectWallpapers(): { copied: number; skipped: number } {
  let copied = 0;
  let skipped = 0;
  for (const [root, category] of SOURCES) {
    const r = copyCategory(join(root, category), category);
    copied += r.copied;
    skipped += r.skipped;
  }
  return { copied, skipped };
}

const { copied, skipped } = collectWallpapers();
if (copied || skipped) {
  console.log(`wallpapers → ${copied} copiés, ${skipped} à jour`);
}

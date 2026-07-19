/**
 * Chemins des WALLPAPERS (page `/wallpapers`). Deux formats par entrée : webp
 * (affichage) et png (téléchargement), servis sous `/images/download/<folder>`
 * (base R2 en prod, staging en dev — même `BASE` que `img`).
 *
 * EXCEPTION HeroFullArt : on RÉUTILISE les full-arts perso déjà hébergés
 * (`images/characters/full/IMG_<id>.webp`, cf. `img.full`) — pas de copie dans
 * le namespace wallpaper, pas de variante png (le download sert le webp).
 */
import { img } from './images';

const BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

/** Dossier de service d'une catégorie (les `Full:*` partagent le dossier `Full`). */
export function wallpaperFolder(category: string): string {
  return category.startsWith('Full') ? 'Full' : category;
}

/** URL d'AFFICHAGE (webp) d'un wallpaper. */
export function wallpaperSrc(category: string, f: string): string {
  if (category === 'HeroFullArt') return img.full(f.replace(/^IMG_/, ''));
  return `${BASE}/images/download/${wallpaperFolder(category)}/${encodeURIComponent(f)}.webp`;
}

/** URL de TÉLÉCHARGEMENT (png ; webp pour HeroFullArt réutilisé). */
export function wallpaperDownload(category: string, f: string): string {
  if (category === 'HeroFullArt') return img.full(f.replace(/^IMG_/, ''));
  return `${BASE}/images/download/${wallpaperFolder(category)}/${encodeURIComponent(f)}.png`;
}

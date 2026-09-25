/**
 * Chemins des WALLPAPERS (page `/wallpapers`). Deux formats par entrée : webp
 * (affichage) et png (téléchargement), servis sous `/images/download/<folder>`
 * (base R2 en prod, staging en dev — même `BASE` que `img`).
 *
 * EXCEPTION HeroFullArt : on RÉUTILISE les full-arts perso déjà hébergés
 * (`images/characters/full/IMG_<id>.webp`, cf. `img.full`) — pas de copie dans
 * le namespace wallpaper, pas de variante png (le download sert le webp).
 * Sauf ses VERSIONS ARCHIVÉES (`IMG_<id>@<n>`, ancien art remplacé en place par
 * le jeu) : elles vivent dans le namespace wallpaper (`download/HeroFullArt/`),
 * en webp seul — la version publiée récupérée telle quelle.
 */
import { img } from './images';

const BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

/** `IMG_2000035@1` : version archivée (cf. datagen/assets/wallpaper-versions). */
const isArchivedVersion = (f: string): boolean => /@\d+$/.test(f);
/**
 * HeroFullArt VIVANT = full-art perso réutilisé ; archivé = namespace wallpaper.
 * Le vivant est servi SANS `Content-Disposition: attachment` (full-arts des
 * fiches, indexés par Google Images) : un `<a download>` cross-origin l'ouvre au
 * lieu de l'enregistrer, d'où le téléchargement par blob côté galerie.
 */
export const reusesHeroArt = (category: string, f: string): boolean =>
  category === 'HeroFullArt' && !isArchivedVersion(f);

/** Dossier de service d'une catégorie (les `Full:*` partagent le dossier `Full`). */
export function wallpaperFolder(category: string): string {
  return category.startsWith('Full') ? 'Full' : category;
}

/** URL d'AFFICHAGE (webp) d'un wallpaper. */
export function wallpaperSrc(category: string, f: string): string {
  if (reusesHeroArt(category, f)) return img.full(f.replace(/^IMG_/, ''));
  return `${BASE}/images/download/${wallpaperFolder(category)}/${encodeURIComponent(f)}.webp`;
}

/** URL de TÉLÉCHARGEMENT (png ; webp pour HeroFullArt, réutilisé ou archivé). */
export function wallpaperDownload(category: string, f: string): string {
  if (reusesHeroArt(category, f)) return img.full(f.replace(/^IMG_/, ''));
  const ext = category === 'HeroFullArt' ? 'webp' : 'png';
  return `${BASE}/images/download/${wallpaperFolder(category)}/${encodeURIComponent(f)}.${ext}`;
}

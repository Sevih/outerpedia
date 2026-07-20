/**
 * Chemin des 4-CUT COMICS (page `/4-comics`). Une image webp par BD, servie
 * sous `/images/4-comics/<LANG>/<stem>.webp` (base R2 en prod, staging en dev —
 * même `BASE` que `img`). Les BD sont faites main et RAMENÉES en V3 (source
 * `.editorial/comics/`, gitignorée → R2), jamais pointées sur la V2.
 */
const BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

/** URL d'affichage (webp pleine taille) d'une BD — lightbox. */
export function comicSrc(lang: string, stem: string): string {
  return `${BASE}/images/4-comics/${lang}/${encodeURIComponent(stem)}.webp`;
}

/** URL de la VIGNETTE (360 px, `collect-comics`) — grille de la galerie. */
export function comicThumbSrc(lang: string, stem: string): string {
  return `${BASE}/images/4-comics/${lang}/${encodeURIComponent(stem)}.thumb.webp`;
}

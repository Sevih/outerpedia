/**
 * Génération des ICÔNES DE VISAGE (FI_<id>) — porté de V2 (logique identique).
 *
 * Le jeu ne fournit pas d'image FI : elle se COMPOSE en appliquant au portrait
 * CT_<id> le layout RectTransform du prefab FaceIcon (variante « Thumbnail »).
 * Le layout vit dans `face-icon-layout.json` (718 entrées, extrait des bundles
 * via UnityPy — script à re-porter pour les futurs persos absents de la table).
 *
 * Convention Unity : position ancrée relative au centre du cadre, +Y vers le
 * haut → Y inversé pour les coordonnées image.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

interface FaceIconVariant {
  frame: { w: number; h: number };
  character: { x: number; y: number; w: number; h: number; scale: [number, number] };
}
type FaceIconLayout = Record<string, Record<string, FaceIconVariant>>;

let layoutCache: FaceIconLayout | null = null;
function layout(): FaceIconLayout {
  if (!layoutCache) {
    layoutCache = JSON.parse(
      readFileSync(resolve('datagen/assets/face-icon-layout.json'), 'utf8'),
    ) as FaceIconLayout;
  }
  return layoutCache;
}

/** Vrai si le layout connaît ce perso (sinon : re-porter l'extracteur UnityPy). */
export function hasFaceIconLayout(id: string): boolean {
  return Boolean(layout()[id]?.Thumbnail);
}

/** Compose l'icône de visage depuis le portrait. `null` si layout absent.
 * `png` = variante og:image (les aperçus Discord/OG préfèrent le PNG). */
export async function makeFaceIcon(
  id: string,
  portraitPath: string,
  format: 'webp' | 'png' = 'webp',
): Promise<Buffer | null> {
  const spec = layout()[id]?.Thumbnail;
  if (!spec) return null;

  const fw = Math.round(spec.frame.w);
  const fh = Math.round(spec.frame.h);
  const cw = Math.max(1, Math.round(spec.character.w * spec.character.scale[0]));
  const ch = Math.max(1, Math.round(spec.character.h * spec.character.scale[1]));
  // Centre du cadre + offset Unity, Y inversé pour l'image.
  const left = Math.round(fw / 2 + spec.character.x - cw / 2);
  const top = Math.round(fh / 2 - spec.character.y - ch / 2);

  // Fenêtre visible du portrait redimensionné dans le masque du cadre.
  const visLeft = Math.max(0, left);
  const visTop = Math.max(0, top);
  const visW = Math.min(fw, left + cw) - visLeft;
  const visH = Math.min(fh, top + ch) - visTop;
  if (visW <= 0 || visH <= 0) return null;

  const portraitClip = await sharp(portraitPath)
    .resize(cw, ch, { fit: 'fill', kernel: 'lanczos3' })
    .extract({ left: visLeft - left, top: visTop - top, width: visW, height: visH })
    .toBuffer();

  const composed = sharp({
    create: { width: fw, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: portraitClip, left: visLeft, top: visTop }]);
  return (format === 'png' ? composed.png() : composed.webp({ quality: 90 })).toBuffer();
}

/**
 * Génération des ICÔNES DE PIÈCE DE HÉROS (PI_<id>) — l'item « Pieces of {0} ».
 *
 * Le jeu ne fournit AUCUNE image de pièce : une pièce n'est même pas un item
 * (aucune ligne ItemTemplet — c'est une ressource par id de perso,
 * `WSCharacterPieceData`, au nom dynamique `SYS_CHARACTER_PIECE_NAME`). L'icône
 * se COMPOSE à l'affichage, et la recette vit dans deux prefabs lus aux bundles
 * (mêmes relevés UnityPy que Thumbnail.tsx pour la vignette) :
 *
 *   - `prefabs/ui/faceicon` → FI_<id>, variante « Piece » : une Image
 *     `CT_Mask_Piece` (112×115) portant un Mask `showMaskGraphic=0` — le
 *     pentagone n'est JAMAIS dessiné, il ne fait que DÉCOUPER — et un enfant
 *     `Character` = portrait CT_<id>, cadré par perso (le même
 *     `face-icon-layout.json` que les FI_, variante `Piece`) ;
 *   - `CUIItemThumbnailSlot` (relevé sur `prefabs/ui/cuipiecedungeonselectpopup`,
 *     où les tailles sont absolues) → `PieceImage` (120×120) reçoit la FaceIcon
 *     et superpose `PieceImageFront` = CM_Piece_Frame (116×118, natif) puis
 *     `Image_Fx` = TI_Piece_Fx (126×126) — le halo, `m_PieceRareObj`, éteint
 *     par défaut et allumé par le code pour les pièces « rares ».
 *
 * ORDRE DES CALQUES : portrait masqué PUIS cadre PUIS fx. Le prefab ne fige pas
 * la place de la FaceIcon (instanciée au runtime), mais le masque couvre tout
 * son rectangle (bbox alpha = 112×115 entier) : un cadre dessiné SOUS le
 * portrait serait invisible à 2 px près — l'anneau et son halo intérieur de
 * ~40 px n'existent qu'au-dessus. Le fx est le dernier enfant actif du prefab.
 *
 * Canvas 126×126 = l'emprise du fx (et du slot du jeu), tout centré. Le
 * décalage (+6) et l'échelle (0,8) que les slots appliquent à `PieceImage`
 * relèvent de la MISE EN PAGE du slot (caser la barre de quantité), pas de
 * l'icône — même partage que vignette/consommateur dans Thumbnail.tsx.
 */
import sharp, { type OverlayOptions } from 'sharp';
import { faceIconVariant } from './face-icon';
import { paddingFor } from './sprite-rect';

/** Côté du canvas : l'emprise de TI_Piece_Fx, seule boîte à 126 du prefab. */
const BOX = 126;
/** La variante Piece du prefab FaceIcon (cadre du masque). */
const MASK = { w: 112, h: 115 };
/** CM_Piece_Frame, posé à sa taille native. */
const FRAME = { w: 116, h: 118 };

/**
 * Marges transparentes de TI_Piece_Fx : le packer d'atlas rogne le sprite
 * (export 117×120 pour une taille logique de 126×126) et la table
 * `sprite-rect.json` est BORNÉE aux atlas monstre/perso — l'élargir à
 * `at_thumbnailitemruntime` re-découperait tous les icônes d'item déjà servis
 * (piège documenté dans le README datagen). Valeurs relevées une fois sur le
 * sprite (`m_RD.textureRectOffset` = 9;3, origine Unity EN BAS) ; le garde-fou
 * d'exécution vérifie qu'elles collent toujours à l'export courant.
 */
const FX = { native: { w: 117, h: 120 }, pad: { left: 9, top: 3, right: 0, bottom: 3 } };

const center = (w: number, h: number) => ({
  left: Math.round((BOX - w) / 2),
  top: Math.round((BOX - h) / 2),
});

/** Les sprites de chrome, résolus par l'appelant (index d'images du staging). */
export interface PieceChrome {
  /** CT_Mask_Piece — la découpe pentagonale. */
  mask: string;
  /** CM_Piece_Frame — le cadre. */
  frame: string;
  /** TI_Piece_Fx — le halo des pièces rares (variante `fx` uniquement). */
  fx?: string;
}

/**
 * Compose l'icône de pièce depuis le portrait. `null` si le prefab FaceIcon du
 * perso n'a pas de variante Piece. `fx: true` allume le halo (`m_PieceRareObj`).
 */
export async function makePieceIcon(
  id: string,
  portraitPath: string,
  chrome: PieceChrome,
  opts: { fx?: boolean; format?: 'webp' | 'png' } = {},
): Promise<Buffer | null> {
  const spec = faceIconVariant(id, 'Piece');
  if (!spec) return null;

  // --- Portrait cadré dans le masque — même géométrie que makeFaceIcon, dans
  // le cadre 112×115 de la variante Piece (position ancrée au centre, +Y en
  // haut → Y inversé pour l'image).
  const cw = Math.max(1, Math.round(spec.character.w * spec.character.scale[0]));
  const ch = Math.max(1, Math.round(spec.character.h * spec.character.scale[1]));
  const left = Math.round(MASK.w / 2 + spec.character.x - cw / 2);
  const top = Math.round(MASK.h / 2 - spec.character.y - ch / 2);
  const visLeft = Math.max(0, left);
  const visTop = Math.max(0, top);
  const visW = Math.min(MASK.w, left + cw) - visLeft;
  const visH = Math.min(MASK.h, top + ch) - visTop;
  if (visW <= 0 || visH <= 0) return null;

  // Le portrait sort de l'atlas ROGNÉ : reposer ses marges AVANT le resize
  // (passe séparée — sharp réordonne extend/resize dans une même chaîne).
  const meta = await sharp(portraitPath).metadata();
  const pad = meta.width && meta.height ? paddingFor(portraitPath, meta.width, meta.height) : null;
  const source = pad
    ? await sharp(portraitPath)
        .extend({ ...pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    : portraitPath;
  const portraitClip = await sharp(source)
    .resize(cw, ch, { fit: 'fill', kernel: 'lanczos3' })
    .extract({ left: visLeft - left, top: visTop - top, width: visW, height: visH })
    .toBuffer();

  // --- Découpe : le portrait posé dans le cadre du masque, puis l'alpha du
  // pentagone en `dest-in` (le sprite du masque n'est jamais dessiné).
  const masked = await sharp({
    create: {
      width: MASK.w,
      height: MASK.h,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: portraitClip, left: visLeft, top: visTop },
      { input: chrome.mask, blend: 'dest-in' },
    ])
    .png()
    .toBuffer();

  // --- Pile finale : portrait masqué, cadre, halo (cf. ordre en tête).
  const layers: OverlayOptions[] = [
    { input: masked, ...center(MASK.w, MASK.h) },
    { input: chrome.frame, ...center(FRAME.w, FRAME.h) },
  ];
  if (opts.fx) {
    if (!chrome.fx) throw new Error('variante fx demandée sans sprite TI_Piece_Fx');
    const fxMeta = await sharp(chrome.fx).metadata();
    if (fxMeta.width !== FX.native.w || fxMeta.height !== FX.native.h) {
      // L'export a changé de rognage : les marges figées ci-dessus sont fausses.
      throw new Error(
        `TI_Piece_Fx ${fxMeta.width}×${fxMeta.height} ≠ ${FX.native.w}×${FX.native.h} attendu — re-relever FX.pad`,
      );
    }
    const fx = await sharp(chrome.fx)
      .extend({ ...FX.pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    layers.push({ input: fx, left: 0, top: 0 });
  }

  const composed = sharp({
    create: { width: BOX, height: BOX, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite(layers);
  return (opts.format === 'png' ? composed.png() : composed.webp({ quality: 90 })).toBuffer();
}

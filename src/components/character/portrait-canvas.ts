/**
 * LE PORTRAIT DU JEU, PEINT SUR UN CANVAS — le jumeau de `Portrait.tsx`.
 *
 * Même transcription (`portrait-layout`), même géométrie, autre surface. Il existe
 * pour une seule raison : l'export PNG du tier-list-maker ne peut pas photographier
 * du DOM sans embarquer une bibliothèque de rasterisation, et le site tient à
 * quatre dépendances.
 *
 * CE QU'IL REMPLACE. L'export dessinait sa propre idée de la carte : les étoiles
 * empilées à la verticale sans rail ni creux, la classe à 26 % de la largeur et
 * l'élément à 24 % (le prefab dit 37 et 46 unités sur 180, soit 20,6 % et 25,6 %),
 * le nom sur un dégradé qui n'existe pas (`LowBg` est inactif dans le prefab), et
 * un cadre au ratio 120/231. Ces nombres n'étaient pas faux par négligence : ils
 * étaient posés à l'œil avant qu'on ait lu le prefab. Le mode « cartes » à l'écran
 * en portait une troisième variante, encore différente.
 *
 * LES DEUX ÉCARTS ASSUMÉS avec le rendu DOM, tous deux inhérents au canvas :
 *
 *   · le `drop-shadow` du creux d'étoile est une ombre de FORME (elle suit l'alpha
 *     du sprite) ; `shadowColor`/`shadowOffset` du canvas fait la même chose, et
 *     c'est bien celui-là qu'on emploie — pas de `filter`, qui n'est pas partout ;
 *   · le texte n'a pas de `text-shadow` : ses quatre copies d'`Outline` et sa copie
 *     de `Shadow` sont peintes à la main, dans l'ordre, sous le texte. C'est
 *     exactement ce que fait le CSS, écrit explicitement.
 *
 * LES POLICES. Le canvas ne résout pas une variable CSS : il faut lui donner un nom
 * de famille réel. `resolvePortraitFonts` lit la valeur des deux variables sur
 * `<html>` (posées par `next/font` dans `root-document`) et attend que les deux
 * soient chargées — sans ça `ctx.font` retombe silencieusement sur la police par
 * défaut et le PNG sort avec une typographie qui n'est pas celle du jeu.
 */
import {
  BADGE_BOX,
  bestFit,
  CLASS_BOX,
  CLASS_SLUGS,
  cap,
  DEMI_BOX,
  DEMI_FONT,
  DEMI_SIZE,
  DIM_ALPHA,
  effectOffsets,
  ELEMENT_BOX,
  FRAME_H,
  FRAME_W,
  NAME_BOX,
  NAME_FONT,
  NAME_FX,
  NAME_SIZE,
  STAR_OFF,
  STAR_OFF_ALPHA,
  STAR_OFF_SHADOW,
  STAR_ON,
  STAR_SLOT,
  STAR_SLOT_ALPHA,
  TEXT_COLOR,
  type GameFont,
  type Rect,
} from './portrait-layout';
import { img } from '@/lib/images';
import { transcendenceRow, type StarTone } from '@/components/ui/Thumbnail';

/** L'état d'un portrait à peindre — le sous-ensemble des props de `Portrait`. */
export interface PortraitPaint {
  id: string;
  name: string;
  rarity: number;
  transcendence?: number;
  element?: string;
  cls?: string;
  prefix?: string;
  hideName?: boolean;
  hideStars?: boolean;
  coreFusion?: boolean;
  synchro?: boolean;
  dim?: boolean;
}

/**
 * TOUTES les URL qu'un portrait peindra, dans l'état demandé.
 *
 * L'export doit précharger ses images avant de dessiner (un `drawImage` sur une
 * image non chargée ne peint rien, en silence). Cette liste est DÉRIVÉE du même
 * état que le rendu : impossible qu'un calque soit peint sans avoir été préchargé,
 * ce qui était le mode de panne naturel quand l'appelant listait les URL de son côté.
 */
export function portraitSources(p: PortraitPaint): string[] {
  const out = [img.portrait(p.id)];
  if (!p.hideStars) {
    const [show, tone, plus] = transcendenceRow(p.rarity, p.transcendence);
    out.push(img.starSlot(), img.starEmpty());
    for (let i = 0; i < show; i++) out.push(img.star(litTone(i, show, tone, plus)));
  }
  if (p.cls && CLASS_SLUGS.has(p.cls)) out.push(img.boss(`CT_Class_${cap(p.cls)}`));
  if (p.element) out.push(img.boss(`CT_Element_${cap(p.element)}`));
  if (p.coreFusion || p.synchro) out.push(p.coreFusion ? img.coreFusionTag() : img.syncIcon());
  if (p.dim) out.push(img.portraitDim());
  return out;
}

/** La teinte d'une étoile allumée — cf. le piège 4 de `Portrait.tsx`. */
function litTone(i: number, show: number, tone: StarTone, plus: number): StarTone {
  return plus > 0 && i === show - 1 ? tone : 'y';
}

/** Les deux familles de police résolues, telles que `ctx.font` les accepte. */
export interface PortraitFonts {
  name: string;
  demi: string;
}

/**
 * Résout les deux polices du portrait et ATTEND qu'elles soient chargées.
 *
 * `next/font` en `preload: false` ne télécharge rien tant qu'aucun texte ne les
 * demande : sur une page qui n'a peint aucun portrait, elles ne sont pas là au
 * moment de l'export. `document.fonts.load` force le chargement et rend la main
 * quand il est fini ; sans cette attente le canvas peint avec la police de repli
 * sans rien signaler.
 *
 * Rend `null` si les variables CSS sont absentes — l'appelant peut alors renoncer
 * au texte plutôt que d'écrire le nom dans une police qui n'est pas la bonne.
 */
export async function resolvePortraitFonts(): Promise<PortraitFonts | null> {
  if (typeof document === 'undefined') return null;
  const style = getComputedStyle(document.documentElement);
  const name = style.getPropertyValue(NAME_FONT.cssVar).trim();
  const demi = style.getPropertyValue(DEMI_FONT.cssVar).trim();
  if (!name || !demi) return null;
  const fonts = { name, demi };
  try {
    await Promise.all([
      document.fonts.load(`${NAME_FONT.weight} 22px ${name}`),
      document.fonts.load(`${DEMI_FONT.weight} 14px ${demi}`),
    ]);
  } catch {
    // Chargement refusé (police absente, réseau) : on peint quand même, le repli
    // du navigateur vaut mieux qu'un PNG sans nom.
  }
  return fonts;
}

/** Le cadre où peindre, en pixels du canvas. */
export interface PortraitBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Peint un portrait dans `box`, à l'identique du rendu DOM.
 *
 * `images` est le cache d'images déjà chargées de l'appelant (clé = URL) : ce
 * module ne charge rien lui-même, l'export en a des dizaines à charger en parallèle
 * et c'est son affaire. Une image manquante est SAUTÉE — on ne dessine pas un carré
 * vide à sa place.
 *
 * La hauteur de `box` est ignorée au profit du ratio du cadre : toute la géométrie
 * s'exprime en unités de 180×344, et un rectangle d'un autre ratio décalerait tout.
 * L'appelant doit donc lui donner la bonne hauteur — `portraitHeight` la calcule.
 */
export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  box: PortraitBox,
  p: PortraitPaint,
  images: Map<string, HTMLImageElement>,
  fonts: PortraitFonts | null,
): void {
  // L'échelle du cadre : une unité du prefab vaut `k` pixels de canvas.
  const k = box.w / FRAME_W;
  const at = (r: Rect) => ({
    x: box.x + r.left * k,
    y: box.y + r.top * k,
    w: r.w * k,
    h: r.h * k,
  });
  const put = (src: string, r: Rect, alpha = 1) => {
    const im = images.get(src);
    if (!im) return;
    const d = at(r);
    if (alpha !== 1) ctx.globalAlpha = alpha;
    ctx.drawImage(im, d.x, d.y, d.w, d.h);
    if (alpha !== 1) ctx.globalAlpha = 1;
  };

  // L'ART — plein cadre (cf. piège 2). Il est déjà au ratio du cadre : pas de
  // recadrage, sinon on rognerait l'art comme le faisait l'`object-cover`.
  const art = images.get(img.portrait(p.id));
  if (art) ctx.drawImage(art, box.x, box.y, box.w, box.w * (FRAME_H / FRAME_W));

  // LE RAIL D'ÉTOILES — slot, six creux, puis les allumées par le HAUT.
  if (!p.hideStars) {
    const [show, tone, plus] = transcendenceRow(p.rarity, p.transcendence);
    put(img.starSlot(), STAR_SLOT, STAR_SLOT_ALPHA);
    // Le `Shadow(2,−2)` du creux : une ombre de FORME, comme le `drop-shadow` du
    // DOM — `shadowBlur` reste à 0, le prefab n'écrit aucun flou.
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${STAR_OFF_SHADOW.a})`;
    ctx.shadowOffsetX = STAR_OFF_SHADOW.x * k;
    ctx.shadowOffsetY = STAR_OFF_SHADOW.y * k;
    for (const r of STAR_OFF) put(img.starEmpty(), r, STAR_OFF_ALPHA);
    ctx.restore();
    for (let i = 0; i < show; i++) put(img.star(litTone(i, show, tone, plus)), STAR_ON[i]);
  }

  // CLASSE puis ÉLÉMENT — non alignés, et c'est dans la donnée (cf. la table).
  if (p.cls && CLASS_SLUGS.has(p.cls)) put(img.boss(`CT_Class_${cap(p.cls)}`), CLASS_BOX);
  if (p.element) put(img.boss(`CT_Element_${cap(p.element)}`), ELEMENT_BOX);

  // LE BADGE d'état — un seul emplacement, un seul badge (le core l'emporte).
  if (p.coreFusion || p.synchro)
    put(p.coreFusion ? img.coreFusionTag() : img.syncIcon(), BADGE_BOX);

  // LE TITRE puis LE NOM. Aucun dégradé sous eux : `LowBg` est inactif.
  if (!p.hideName && fonts) {
    if (p.prefix) drawGameText(ctx, p.prefix, DEMI_BOX, DEMI_SIZE, DEMI_FONT, fonts.demi, box, k);
    drawGameText(ctx, p.name, NAME_BOX, NAME_SIZE, NAME_FONT, fonts.name, box, k);
  }

  // `SetDim(true)` — le voile de l'état grisé.
  if (p.dim) {
    const veil = images.get(img.portraitDim());
    if (veil) {
      ctx.globalAlpha = DIM_ALPHA;
      ctx.drawImage(veil, box.x, box.y, box.w, box.w * (FRAME_H / FRAME_W));
      ctx.globalAlpha = 1;
    }
  }
}

/**
 * Un texte du portrait : `m_BestFit`, `m_Alignment = 3` (MiddleLeft), et les deux
 * effets peints à la main sous le texte.
 */
function drawGameText(
  ctx: CanvasRenderingContext2D,
  text: string,
  rect: Rect,
  maxSize: number,
  metrics: GameFont,
  family: string,
  box: PortraitBox,
  k: number,
): void {
  const size = bestFit(text, rect.w, maxSize, metrics);
  ctx.save();
  ctx.font = `${metrics.weight} ${size * k}px ${family}`;
  // Le `Text` d'Unity n'applique pas le `GPOS` (cf. `bestFit`) : sans ça le canvas
  // crénerait et le texte ne tomberait plus où `m_BestFit` l'a calculé.
  ctx.fontKerning = 'none';
  ctx.textAlign = 'left';
  // `m_Alignment = 3` (MiddleLeft) : le texte est centré dans la hauteur de sa
  // boîte, pas posé sur son bord.
  ctx.textBaseline = 'middle';
  const x = box.x + rect.left * k;
  const y = box.y + (rect.top + rect.h / 2) * k;
  // Les copies d'effet d'abord, dans l'ordre de la table — le CSS empile pareil.
  for (const fx of NAME_FX) {
    ctx.fillStyle = `rgba(0,0,0,${fx.a})`;
    for (const [dx, dy] of effectOffsets(fx)) ctx.fillText(text, x + dx * k, y + dy * k);
  }
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** La hauteur d'un portrait large de `width` — le ratio du cadre, pas 1:2. */
export const portraitHeight = (width: number) => (width * FRAME_H) / FRAME_W;

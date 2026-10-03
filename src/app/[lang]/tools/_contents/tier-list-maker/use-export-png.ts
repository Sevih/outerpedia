'use client';

/**
 * Export PNG du Tier List Maker : la liste repeinte sur un canvas, selon les
 * réglages d'affichage à l'écran (vignettes carrées ou portraits du jeu), puis
 * téléchargée. Extrait du composant principal (découpage du 03/10/2026 —
 * déplacement mécanique, logique inchangée ; les valeurs lues dans la
 * fermeture du composant arrivent en paramètres, sous les mêmes noms).
 */
import { useCallback } from 'react';
import { img } from '@/lib/images';
import {
  drawPortrait,
  portraitHeight,
  portraitSources,
  resolvePortraitFonts,
  type PortraitPaint,
} from '@/components/character/portrait-canvas';
import type { Tier } from './share-codec';
import { safeFileStem, type TierItem, type TlmLabels } from './contracts';
import type { TlmSettings } from './stores';
import { CARD_PX, recruitBadge } from './ui';

/** Retour à la ligne glouton pour du texte canvas ; coupe au caractère un mot trop long. */
function wrapLabel(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  const addChars = (chunk: string) => {
    for (const ch of chunk) {
      if (line && ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else line += ch;
    }
  };
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .forEach((word, i) => {
      if (i > 0) {
        if (line && ctx.measureText(`${line} ${word}`).width > maxWidth) {
          lines.push(line);
          line = '';
        } else if (line) line += ' ';
      }
      addChars(word);
    });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export function useExportPng({
  tiers,
  title,
  itemMap,
  iconSize,
  showNames,
  showElement,
  showClass,
  showRarity,
  showCards,
  cardSize,
  showCardTags,
  showSkinNames,
  labelFor,
  shortFor,
  labels: L,
}: Pick<
  TlmSettings,
  | 'iconSize'
  | 'showNames'
  | 'showElement'
  | 'showClass'
  | 'showRarity'
  | 'showCards'
  | 'cardSize'
  | 'showCardTags'
  | 'showSkinNames'
> & {
  tiers: Tier[];
  title: string;
  itemMap: Map<string, TierItem>;
  labelFor: (it: TierItem) => string;
  shortFor: (it: TierItem) => string | undefined;
  labels: TlmLabels;
}) {
  // ── Export PNG (reflète les réglages d'affichage à l'écran) ──
  const exportPng = useCallback(async () => {
    // Géométrie : vignette carrée sans cartes, cadre du jeu sinon — le RATIO DU
    // PREFAB (180×344), pas le 120×231 que cet export supposait.
    const ICON = { s: 56, m: 76, l: 100 }[iconSize];
    const CARD_W = CARD_PX[cardSize];
    const cellW = showCards ? CARD_W : ICON;
    const cellH = showCards ? Math.round(portraitHeight(CARD_W)) : ICON;
    const PER_ROW = 12,
      PAD = 20,
      LABEL_W = 110;
    const LABEL_PAD = 8,
      LINE_H = 24,
      LABEL_FONT = '700 20px system-ui, sans-serif';
    const NAME_PX = Math.max(10, Math.round(cellW * 0.16));
    const NAME_LH = NAME_PX + 2;
    const NAME_FONT = `500 ${NAME_PX}px system-ui, sans-serif`;

    const load = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const im = new Image();
        im.crossOrigin = 'anonymous'; // canvas propre pour toBlob (assets R2)
        im.onload = () => resolve(im);
        im.onerror = () => resolve(null);
        im.src = src;
      });

    /**
     * L'ÉTAT DE PORTRAIT d'un item, dérivé UNE FOIS des réglages — la même valeur
     * sert à lister les images à précharger et à les peindre. Deux dérivations
     * séparées, c'était la panne naturelle de cet export : un calque dessiné sans
     * avoir été chargé ne peint rien, en silence.
     */
    const paintOf = (it: TierItem): PortraitPaint => ({
      id: it.cardId!,
      name: labelFor(it),
      prefix: it.prefix,
      rarity: it.rarity ?? 1,
      element: showElement ? it.element : undefined,
      cls: showClass ? it.cls : undefined,
      hideName: !showNames,
      hideStars: !showRarity,
    });
    const isCardItem = (it: TierItem) => !!(showCards && it.cardId);

    // Toutes les URLs : vignettes + les overlays que les réglages demandent.
    const urls = new Set<string>();
    for (const tr of tiers)
      for (const k of tr.items) {
        const it = itemMap.get(k);
        if (!it) continue;
        if (isCardItem(it)) {
          for (const u of portraitSources(paintOf(it))) urls.add(u);
          if (showCardTags) {
            const b = recruitBadge(it.tags);
            if (b) urls.add(b);
          }
          continue;
        }
        urls.add(it.img);
        if (showElement && it.element) urls.add(img.element(it.element));
        if (showClass && it.cls) urls.add(img.klass(it.cls));
        if (showRarity) urls.add(img.star());
      }
    const loaded = new Map<string, HTMLImageElement>();
    await Promise.all(
      [...urls].map(async (u) => {
        const im = await load(u);
        if (im) loaded.set(u, im);
      }),
    );
    // Les polices du jeu : le canvas ne résout pas une variable CSS, et
    // `next/font` en `preload: false` n'a rien téléchargé tant qu'aucun portrait
    // n'a été peint à l'écran (cf. `resolvePortraitFonts`).
    const gameFonts = showCards ? await resolvePortraitFonts() : null;

    const canvas = document.createElement('canvas');
    // willReadFrequently force un canvas CPU : readback plus rapide, et
    // contourne les drivers GPU cassés qui rendent une image vide.
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Pré-wrap des noms : la hauteur d'une ligne de tier s'adapte au plus long.
    // Deux lignes possibles sous une cellule — nom du PERSO (toggle « noms »)
    // et nom du COSTUME (toggle « noms de skin ») — même règle que l'écran,
    // tuiles comme cartes.
    //
    // Une carte n'écrit PAS son nom dessous : le portrait le porte DANS le cadre,
    // avec son titre, exactement comme à l'écran. Le nom du costume, lui, reste en
    // dessous dans les deux modes — le jeu n'a pas de champ pour lui.
    ctx.font = NAME_FONT;
    const baseNameLines = new Map<string, string[]>();
    const skinNameLines = new Map<string, string[]>();
    for (const tr of tiers)
      for (const k of tr.items) {
        const it = itemMap.get(k);
        if (!it) continue;
        if (showNames && !isCardItem(it))
          baseNameLines.set(k, wrapLabel(ctx, shortFor(it) ?? labelFor(it), cellW - 2));
        if (it.isSkin && showSkinNames)
          skinNameLines.set(k, wrapLabel(ctx, it.short ?? it.label, cellW - 2));
      }
    const cellTotalH = tiers.map((tr) => {
      const maxBase = Math.max(0, ...tr.items.map((k) => baseNameLines.get(k)?.length ?? 0));
      const maxSkin = Math.max(0, ...tr.items.map((k) => skinNameLines.get(k)?.length ?? 0));
      const extra = maxBase || maxSkin ? (maxBase + maxSkin) * NAME_LH + 4 : 0;
      return cellH + extra;
    });

    ctx.font = LABEL_FONT;
    const labelLines = tiers.map((tr) => wrapLabel(ctx, tr.label, LABEL_W - LABEL_PAD * 2));
    const rowHeights = tiers.map((tr, i) => {
      const itemsH = Math.max(1, Math.ceil(tr.items.length / PER_ROW)) * cellTotalH[i];
      const labelH = labelLines[i].length * LINE_H + LABEL_PAD * 2;
      return Math.max(itemsH, labelH);
    });

    const titleH = title.trim() ? 56 : 0;
    const contentW = LABEL_W + PER_ROW * cellW;
    const footerH = 30;
    const width = PAD * 2 + contentW;
    const height = PAD * 2 + titleH + rowHeights.reduce((a, b) => a + b, 0) + footerH;

    // Netteté sans dépasser la taille max d'un canvas (export silencieusement
    // vide au-delà).
    const MAX_SIDE = 8192;
    let scale = Math.min(window.devicePixelRatio || 1, 2);
    scale = Math.max(0.5, Math.min(scale, MAX_SIDE / width, MAX_SIDE / height));
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    const drawCover = (im: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
      const sc = Math.max(dw / im.width, dh / im.height);
      const sw = dw / sc,
        sh = dh / sc;
      ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, dx, dy, dw, dh);
    };
    const drawContain = (im: HTMLImageElement, dx: number, dy: number, d: number) => {
      const k = Math.min(d / im.width, d / im.height);
      const w = im.width * k,
        h = im.height * k;
      ctx.drawImage(im, dx + (d - w) / 2, dy + (d - h) / 2, w, h);
    };
    /** Les lignes de nom SOUS une cellule — nom du perso puis nom du costume. */
    const drawNamesBelow = (key: string, cellX: number, cellY: number) => {
      ctx.font = NAME_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      let ty = cellY + cellH + 2;
      const bn = baseNameLines.get(key) ?? [];
      if (bn.length) {
        ctx.fillStyle = '#d4d4d8';
        bn.forEach((ln, i) => ctx.fillText(ln, cellX + cellW / 2, ty + i * NAME_LH));
        ty += bn.length * NAME_LH;
      }
      const sn = skinNameLines.get(key) ?? [];
      if (sn.length) {
        ctx.fillStyle = '#a1a1aa';
        sn.forEach((ln, i) => ctx.fillText(ln, cellX + cellW / 2, ty + i * NAME_LH));
      }
    };

    let y = PAD;
    if (titleH) {
      ctx.fillStyle = '#fafafa';
      ctx.font = '700 30px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title.trim(), width / 2, y + titleH / 2);
      y += titleH;
    }

    tiers.forEach((tr, ti) => {
      const rh = rowHeights[ti];
      // Cellule de label — wrap, centrée verticalement
      ctx.fillStyle = tr.color;
      ctx.fillRect(PAD, y, LABEL_W, rh);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = LABEL_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = labelLines[ti];
      const startY = y + (rh - lines.length * LINE_H) / 2 + LINE_H / 2;
      lines.forEach((ln, i) => ctx.fillText(ln, PAD + LABEL_W / 2, startY + i * LINE_H));
      // Fond de la rangée d'items
      ctx.fillStyle = '#131c2e';
      ctx.fillRect(PAD + LABEL_W, y, PER_ROW * cellW, rh);
      // Items
      tr.items.forEach((k, idx) => {
        const it = itemMap.get(k);
        if (!it) return;
        const isCard = isCardItem(it);
        const cellX = PAD + LABEL_W + (idx % PER_ROW) * cellW;
        const cellY = y + Math.floor(idx / PER_ROW) * cellTotalH[ti];

        // ── Mode CARTES : le portrait du jeu, peint par le même relevé que le
        // rendu à l'écran (`portrait-canvas`). Aucune géométrie ici. ──
        if (isCard) {
          drawPortrait(
            ctx,
            { x: cellX, y: cellY, w: cellW, h: cellH },
            paintOf(it),
            loaded,
            gameFonts,
          );
          // Le badge de recrutement PAR-DESSUS — convention du site, pas du
          // prefab, exactement comme à l'écran.
          if (showCardTags) {
            const badgeSrc = recruitBadge(it.tags);
            const bd = badgeSrc ? loaded.get(badgeSrc) : null;
            if (bd) {
              const bw = cellW * 0.6;
              ctx.drawImage(bd, cellX, cellY, bw, (bw * bd.height) / bd.width);
            }
          }
          drawNamesBelow(k, cellX, cellY);
          return;
        }

        // ── Mode VIGNETTES : inchangé (la vignette carrée reste à porter). ──
        const im = loaded.get(it.img);
        if (!im) return;
        const pad = 3;
        const boxW = cellW - pad * 2;
        const boxH = cellH - pad * 2;
        const bx = cellX + pad,
          by = cellY + pad;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 6);
        ctx.clip();
        drawCover(im, bx, by, boxW, boxH);
        ctx.restore();
        {
          if (showElement && it.element) {
            const el = loaded.get(img.element(it.element));
            if (el) {
              const s = boxW * 0.4;
              drawContain(el, bx + boxW - s, by, s);
            }
          }
          if (showClass && it.cls) {
            const cl = loaded.get(img.klass(it.cls));
            if (cl) {
              const s = boxW * 0.28;
              drawContain(cl, bx + boxW - s, by + boxW * 0.4, s);
            }
          }
          if (showRarity && it.rarity) {
            const star = loaded.get(img.star());
            if (star) {
              const s = boxW * 0.2;
              let sx = bx + (boxW - it.rarity * s) / 2;
              const sy = by + boxW - s - 2;
              for (let r = 0; r < it.rarity; r++) {
                drawContain(star, sx, sy, s);
                sx += s;
              }
            }
          }
        }
        drawNamesBelow(k, cellX, cellY);
      });
      y += rh;
    });

    ctx.fillStyle = '#71717a';
    ctx.font = '500 15px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('outerpedia.com', width - PAD, y + footerH / 2);

    // Garde-fou : readback vide (canvas GPU cassé, navigateur anti-empreinte
    // qui neutralise le canvas, image R2 sans CORS) → message clair plutôt
    // qu'un PNG vide téléchargé en silence.
    try {
      if (ctx.getImageData(5, 5, 1, 1).data[3] === 0) {
        window.alert(L.exportBlocked);
        return;
      }
    } catch {
      window.alert(L.exportBlocked);
      return;
    }

    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          window.alert(L.exportBlocked);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeFileStem(title)}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch {
      // un canvas « taint » jette ici — le dire plutôt que d'échouer muet
      window.alert(L.exportBlocked);
    }
  }, [
    tiers,
    title,
    itemMap,
    iconSize,
    showNames,
    showElement,
    showClass,
    showRarity,
    showCards,
    cardSize,
    showCardTags,
    showSkinNames,
    labelFor,
    shortFor,
    L.exportBlocked,
  ]);

  return exportPng;
}

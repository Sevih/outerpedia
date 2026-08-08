import { describe, expect, it } from 'vitest';
import { LANGS } from '@/lib/i18n/config';
import { characterBaseName, characterNamePrefix, getAllCharacters } from '@/lib/data/characters';
import {
  BADGE_BOX,
  bestFit,
  CLASS_BOX,
  DEMI_BOX,
  DEMI_FONT,
  DEMI_SIZE,
  effectOffsets,
  ELEMENT_BOX,
  emWidth,
  FRAME_H,
  FRAME_W,
  NAME_BOX,
  NAME_FONT,
  NAME_SIZE,
  NAME_FX,
  STAR_OFF,
  STAR_ON,
  STAR_SLOT,
  type Rect,
} from './portrait-layout';

/**
 * LA TRANSCRIPTION DU PORTRAIT, TENUE PAR SES INVARIANTS.
 *
 * Ces nombres viennent du prefab et se relisent ligne à ligne — un test ne peut pas
 * dire s'ils sont FIDÈLES, seul le prefab le dit. Ce qu'il peut faire, et que l'œil
 * fait mal, c'est vérifier les propriétés dont dépendent les DEUX rendus qui les
 * consomment (`Portrait.tsx` en DOM, `portrait-canvas.ts` en canvas) : une table
 * éditée de travers casse ici plutôt qu'à l'écran, et surtout plutôt que dans un PNG
 * exporté que personne ne relit.
 *
 * Le morceau qui compte vraiment est le dernier : `m_BestFit` n'est pas un réglage
 * esthétique, c'est la garantie qu'aucun nom ne sort du cadre. Elle avait déjà lâché
 * une fois — une estimation de chasse par classe de caractère sous-évaluait « Ais
 * Wallenstein » de 10,6 % et le « n » final passait dehors. Depuis, les chasses sont
 * mesurées ; ce test rejoue les 620 noms du site pour que ça le reste.
 */

const inFrame = (r: Rect) =>
  r.left >= 0 && r.top >= 0 && r.left + r.w <= FRAME_W && r.top + r.h <= FRAME_H;

describe('géométrie du portrait', () => {
  it('tient dans le cadre de 180×344', () => {
    const boxes: [string, Rect][] = [
      ['star slot', STAR_SLOT],
      ['classe', CLASS_BOX],
      ['élément', ELEMENT_BOX],
      ['badge', BADGE_BOX],
      ['nom', NAME_BOX],
      ['titre', DEMI_BOX],
      ...STAR_OFF.map((r, i): [string, Rect] => [`creux ${i}`, r]),
      ...STAR_ON.map((r, i): [string, Rect] => [`étoile ${i}`, r]),
    ];
    expect(boxes.filter(([, r]) => !inFrame(r)).map(([n]) => n)).toEqual([]);
  });

  it('empile ses étoiles au pas de 15, allumées comme creuses', () => {
    const steps = (rs: readonly Rect[]) => rs.slice(1).map((r, i) => r.top - rs[i].top);
    // Les allumées sont posées en progression exacte — au flottant près, que
    // `31,21 + 15 i` traîne. Les creux, eux, portent le vrai flottement de pixel
    // du prefab (jusqu'à 0,1 unité), d'où la tolérance plus large sur eux.
    for (const s of steps(STAR_ON)) expect(s).toBeCloseTo(15, 6);
    for (const s of steps(STAR_OFF)) expect(s).toBeCloseTo(15, 0);
  });

  it('déborde les creux avec les allumées, et centre les unes sur les autres', () => {
    // 19 contre 15 : les pleines mordent de 2 unités de chaque côté (cf. la table).
    STAR_ON.forEach((on, i) => {
      const off = STAR_OFF[i];
      expect(on.w).toBeGreaterThan(off.w);
      expect(on.left + on.w / 2).toBeCloseTo(off.left + off.w / 2, 1);
      expect(on.top + on.h / 2).toBeCloseTo(off.top + off.h / 2, 0);
    });
  });

  it('pose le titre AU-DESSUS du nom, tous deux sur la même colonne', () => {
    expect(DEMI_BOX.top).toBeLessThan(NAME_BOX.top);
    expect(DEMI_BOX.left).toBe(NAME_BOX.left);
    expect(DEMI_BOX.w).toBe(NAME_BOX.w);
  });

  it('dessine quatre copies pour un contour, une seule pour une ombre', () => {
    // Ce que `m_ClassName` distingue, et la seule chose qui sépare Outline de
    // Shadow — leur typetree est identique.
    expect(effectOffsets({ kind: 'outline', x: 1, y: -1, a: 1 })).toHaveLength(4);
    expect(effectOffsets({ kind: 'shadow', x: 1, y: -1, a: 1 })).toHaveLength(1);
    // Le +Y d'Unity MONTE, celui de l'écran descend : un `y` négatif descend.
    expect(effectOffsets({ kind: 'shadow', x: 1, y: -1, a: 1 })[0]).toEqual([1, 1]);
  });

  it('rend les deux textes sur des effets identiques', () => {
    expect(NAME_FX.map((f) => f.a)).toEqual([0.5, 0.5]);
  });
});

describe('m_BestFit', () => {
  it('ne laisse AUCUN nom ni titre déborder sa boîte', () => {
    const overflow: string[] = [];
    for (const c of getAllCharacters()) {
      for (const lang of LANGS) {
        const name = characterBaseName(c, lang);
        const prefix = characterNamePrefix(c, lang);
        const check = (text: string, box: typeof NAME_BOX, max: number, font: typeof NAME_FONT) => {
          if (!text) return;
          const size = bestFit(text, box.w, max, font);
          const width = emWidth(text, font) * size;
          // Une demi-unité de marge sur 150 : la tolérance du flottant, pas un
          // rattrapage — la somme des chasses est exacte (crénage coupé).
          if (width > box.w + 0.5)
            overflow.push(`${c.id} [${lang}] « ${text} » → ${width.toFixed(1)} > ${box.w}`);
          expect(size).toBeLessThanOrEqual(max);
        };
        check(name, NAME_BOX, NAME_SIZE, NAME_FONT);
        if (prefix) check(prefix, DEMI_BOX, DEMI_SIZE, DEMI_FONT);
      }
    }
    expect(overflow).toEqual([]);
  });

  it('laisse un texte court à son corps maximum', () => {
    // « Eva » ne remplit pas 150 unités : rien à réduire.
    expect(bestFit('Eva', NAME_BOX.w, NAME_SIZE, NAME_FONT)).toBe(NAME_SIZE);
  });

  it('compte les idéogrammes en pleine chasse', () => {
    // Aucune des deux polices ne les couvre — une police système les peint, et
    // c'est le seul repli non mesuré de la table.
    expect(emWidth('玉藻前', NAME_FONT)).toBeCloseTo(3, 6);
  });
});

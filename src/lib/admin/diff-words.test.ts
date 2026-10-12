/**
 * Contrat de `diff-words` — la règle de `DiffHighlight.tsx`, en segments : les
 * mêmes mots marqués qu'avant (appariement glouton à courte fenêtre), les
 * balises `<color>` retirées pour comparer et rendues par segment.
 */
import { describe, expect, it } from 'vitest';
import {
  colorSegments,
  diffWords,
  markWords,
  segmentText,
  stripColorTags,
  type WordSegment,
} from './diff-words';

/** Les segments en une ligne lisible : `-mot` retiré, `+mot` ajouté, `#hex{…}` coloré. */
const flat = (segs: WordSegment[]): string =>
  segs
    .map((s) => {
      const mark = s.kind === 'removed' ? '-' : s.kind === 'added' ? '+' : '';
      return s.color ? `${s.color}{${mark}${s.text}}` : `${mark}${s.text}`;
    })
    .join('|');

describe('stripColorTags', () => {
  it('retire les balises ouvrantes et fermantes, garde le texte', () => {
    expect(stripColorTags('Deal <color=#ff0000>100%</color> damage')).toBe('Deal 100% damage');
    expect(stripColorTags('plain')).toBe('plain');
  });
});

describe('markWords — l’appariement glouton', () => {
  it('deux textes égaux : rien de marqué', () => {
    expect(markWords(['a', ' ', 'b'], ['a', ' ', 'b'])).toEqual([
      [false, false, false],
      [false, false, false],
    ]);
  });

  it('un mot remplacé : marqué des deux côtés, le reste intact', () => {
    const [a, b] = markWords('Deal 30% damage'.split(/(\s+)/), 'Deal 50% damage'.split(/(\s+)/));
    expect(a).toEqual([false, false, true, false, false]);
    expect(b).toEqual([false, false, true, false, false]);
  });

  it('un mot inséré : marqué côté extrait seulement, la suite réalignée', () => {
    const [a, b] = markWords('a b c'.split(/(\s+)/), 'a x b c'.split(/(\s+)/));
    expect(a).toEqual([false, false, false, false, false]);
    expect(b).toEqual([false, false, true, true, false, false, false]);
  });

  it('un mot retiré : marqué côté existant seulement', () => {
    const [a, b] = markWords('a x b'.split(/(\s+)/), 'a b'.split(/(\s+)/));
    expect(a).toEqual([false, false, true, true, false]);
    expect(b).toEqual([false, false, false]);
  });

  it('au-delà de la fenêtre de vingt mots, tout est tenu pour changé', () => {
    const far = Array.from({ length: 25 }, (_, i) => `w${i}`);
    const [a, b] = markWords(['z', ...far], [...far, 'z']);
    // « z » n'est pas retrouvé dans la fenêtre : il est changé, et chaque côté
    // avance d'un mot à la fois jusqu'à se réaligner.
    expect(a[0]).toBe(true);
    expect(b[b.length - 1]).toBe(true);
  });
});

describe('segmentText — les runs par état et par couleur', () => {
  it('découpe sur un changement d’état, sans balise dans le texte', () => {
    const words = 'Deal 30% damage'.split(/(\s+)/);
    const segs = segmentText(
      'Deal 30% damage',
      words,
      [false, false, true, false, false],
      'removed',
    );
    expect(flat(segs)).toBe('Deal |-30%| damage');
  });

  it('rend la couleur d’une balise par segment, sans la balise', () => {
    const original = 'Deal <color=#ff0000>30%</color> damage';
    const words = stripColorTags(original).split(/(\s+)/);
    const segs = segmentText(original, words, [false, false, true, false, false], 'added');
    expect(flat(segs)).toBe('Deal |#ff0000{+30%}| damage');
    expect(segs[1]).toEqual({ kind: 'added', text: '30%', color: '#ff0000' });
  });

  it('un run coloré inchangé reste `same`, coloré', () => {
    expect(flat(colorSegments('<color=#00ff00>Heal</color> 10%'))).toBe('#00ff00{Heal}| 10%');
  });

  it('une balise mal fermée ne casse rien : le `<` reste du texte', () => {
    expect(flat(colorSegments('a < b'))).toBe('a |< b');
  });
});

describe('diffWords — les deux côtés', () => {
  it('existant en retraits, extrait en ajouts', () => {
    const { existing, extracted } = diffWords(
      'Deal 30% damage to <color=#ff0000>one</color> enemy',
      'Deal 50% damage to <color=#ff0000>all</color> enemies',
    );
    expect(flat(existing)).toBe('Deal |-30%| damage to |#ff0000{-one}| |-enemy');
    expect(flat(extracted)).toBe('Deal |+50%| damage to |#ff0000{+all}| |+enemies');
  });

  it('deux textes identiques : un seul segment `same` de chaque côté', () => {
    expect(diffWords('same text', 'same text')).toEqual({
      existing: [{ kind: 'same', text: 'same text' }],
      extracted: [{ kind: 'same', text: 'same text' }],
    });
  });

  it('un texte vide d’un côté : l’autre entier marqué', () => {
    const { existing, extracted } = diffWords('', 'new text');
    expect(existing).toEqual([]);
    expect(flat(extracted)).toBe('+new text');
  });

  it('les retours à la ligne sont gardés dans les segments', () => {
    const { extracted } = diffWords('a\nb', 'a\nc');
    expect(extracted.map((s) => s.text).join('')).toBe('a\nc');
  });
});

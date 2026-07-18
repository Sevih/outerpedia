import { describe, expect, it } from 'vitest';
import {
  diffBuckets,
  diffEntity,
  diffRecords,
  isTypoEntity,
  isTypoField,
  normalizeTypo,
} from './changes';

describe('diffEntity — feuilles', () => {
  it('ne signale rien si identique (ordre de clés indifférent)', () => {
    expect(diffEntity({ a: 1, b: 2 }, { b: 2, a: 1 })).toEqual([]);
    expect(diffEntity([1, 2, 3], [1, 2, 3])).toEqual([]);
  });

  it('pointe la feuille changée avec son chemin', () => {
    expect(diffEntity({ rank: 'A' }, { rank: 'S' })).toEqual([
      { path: 'rank', existing: 'A', extracted: 'S' },
    ]);
  });

  it('descend dans les objets imbriqués', () => {
    const d = diffEntity({ profile: { height: 170 } }, { profile: { height: 172 } });
    expect(d).toEqual([{ path: 'profile.height', existing: 170, extracted: 172 }]);
  });

  it('descend dans les tableaux par index', () => {
    const d = diffEntity({ tags: ['dps', 'aoe'] }, { tags: ['dps', 'st'] });
    expect(d).toEqual([{ path: 'tags[1]', existing: 'aoe', extracted: 'st' }]);
  });

  it('gère un élément de tableau ajouté/retiré', () => {
    expect(diffEntity([1], [1, 2])).toEqual([{ path: '[1]', existing: undefined, extracted: 2 }]);
  });

  it('traite un changement de type comme une feuille', () => {
    const d = diffEntity({ x: { a: 1 } }, { x: 'str' });
    expect(d).toEqual([{ path: 'x', existing: { a: 1 }, extracted: 'str' }]);
  });
});

describe('diffRecords — dictionnaires', () => {
  it('classe ajouts / retraits / modifs / inchangés', () => {
    const existing = { a: { v: 1 }, b: { v: 2 }, c: { v: 3 } };
    const extracted = { a: { v: 1 }, b: { v: 9 }, d: { v: 4 } };
    const diff = diffRecords(existing, extracted);
    expect(diff.added).toEqual(['d']);
    expect(diff.removed).toEqual(['c']);
    expect(diff.changed).toEqual([
      { key: 'b', fields: [{ path: 'v', existing: 2, extracted: 9 }] },
    ]);
    expect(diff.unchanged).toBe(1);
  });

  it('renvoie un diff vide quand rien ne change', () => {
    const o = { a: { v: 1 } };
    expect(diffRecords(o, { a: { v: 1 } })).toEqual({
      added: [],
      removed: [],
      changed: [],
      unchanged: 1,
    });
  });
});

describe('classification typographique', () => {
  it('égalise blanc et ponctuation pleine largeur/courbe', () => {
    // guillemets courbes ↔ droits, virgule pleine largeur, espaces
    expect(normalizeTypo('C’est  fort，non')).toBe(normalizeTypo("C'est fort,non"));
    // points de suspension unicode ↔ trois points
    expect(normalizeTypo('Attends…')).toBe(normalizeTypo('Attends...'));
    // ponctuation CJK
    expect(normalizeTypo('攻撃力。')).toBe(normalizeTypo('攻撃力｡'));
  });

  it('ne confond pas un vrai changement de contenu', () => {
    expect(normalizeTypo('Attack Up')).not.toBe(normalizeTypo('Attack Down'));
    expect(isTypoField({ path: 'name.en', existing: 'Poison', extracted: 'Bleed' })).toBe(false);
  });

  it('isTypoField : true seulement si la seule différence est typo (guillemet SIMPLE, comme V2)', () => {
    // V2 ne replie QUE les guillemets simples courbes (’ → '), pas les doubles.
    expect(isTypoField({ path: 'desc.en', existing: 'It’s 50%.', extracted: "It's 50%." })).toBe(
      true,
    );
    expect(isTypoField({ path: 'desc.en', existing: 'Deals 50%.', extracted: 'Deals 60%.' })).toBe(
      false,
    );
  });

  it('isTypoEntity : true si TOUS les champs sont typo, false sinon', () => {
    expect(
      isTypoEntity({
        key: 'e1',
        fields: [
          { path: 'name.jp', existing: '攻撃、', extracted: '攻撃､' },
          { path: 'desc.en', existing: 'Hits…', extracted: 'Hits...' },
        ],
      }),
    ).toBe(true);
    expect(
      isTypoEntity({
        key: 'e2',
        fields: [
          { path: 'name.jp', existing: '攻撃、', extracted: '攻撃､' },
          { path: 'value', existing: 50, extracted: 60 },
        ],
      }),
    ).toBe(false);
  });

  it('diffBuckets : sépare new / diff / typo / removed', () => {
    const existing = {
      keep: { v: 1 },
      real: { name: 'Poison' },
      typo: { desc: 'It’s here…' },
      gone: { v: 9 },
    };
    const extracted = {
      keep: { v: 1 },
      real: { name: 'Bleed' },
      typo: { desc: "It's here..." },
      brandNew: { v: 2 },
    };
    expect(diffBuckets(diffRecords(existing, extracted))).toEqual({
      new: 1, // brandNew
      diff: 1, // real (name changé pour de vrai)
      typo: 1, // typo (guillemets seuls)
      removed: 1, // gone
    });
  });
});

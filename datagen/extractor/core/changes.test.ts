import { describe, expect, it } from 'vitest';
import { diffEntity, diffRecords } from './changes';

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

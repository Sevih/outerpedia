import { describe, expect, it } from 'vitest';
import {
  diffBuckets,
  diffEntity,
  diffRecords,
  isMinorEntity,
  isMinorField,
  isRewordField,
  isTypoEntity,
  isTypoField,
  normalizeTypo,
  numberSequence,
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

  it('aligne une liste d’objets à `id` par id, pas par index (insertion = UN ajout)', () => {
    const a = {
      costumes: [
        { id: '1', sort: 1 },
        { id: '2', sort: 2 },
      ],
    };
    const b = {
      costumes: [
        { id: '1', sort: 1 },
        { id: '9', sort: 2 },
        { id: '2', sort: 3 },
      ],
    };
    expect(diffEntity(a, b)).toEqual([
      { path: 'costumes[#2].sort', existing: 2, extracted: 3 },
      { path: 'costumes[#9]', existing: undefined, extracted: { id: '9', sort: 2 } },
    ]);
  });

  it('retombe sur l’index si un élément n’a pas d’id, ou si un id est doublé', () => {
    expect(diffEntity({ l: [{ id: '1' }, { v: 2 }] }, { l: [{ id: '1' }, { v: 3 }] })).toEqual([
      { path: 'l[1].v', existing: 2, extracted: 3 },
    ]);
    expect(
      diffEntity(
        {
          l: [
            { id: '1', v: 1 },
            { id: '1', v: 2 },
          ],
        },
        { l: [{ id: '1', v: 1 }] },
      ),
    ).toEqual([{ path: 'l[1]', existing: { id: '1', v: 2 }, extracted: undefined }]);
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

  it('isTypoField : true seulement si la seule différence est typo (guillemet SIMPLE)', () => {
    // On ne replie QUE les guillemets simples courbes (’ → '), pas les doubles.
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
      real: { value: 50 },
      typo: { desc: 'It’s here…' },
      gone: { v: 9 },
    };
    const extracted = {
      keep: { v: 1 },
      real: { value: 60 },
      typo: { desc: "It's here..." },
      brandNew: { v: 2 },
    };
    expect(diffBuckets(diffRecords(existing, extracted))).toEqual({
      new: 1, // brandNew
      diff: 1, // real (valeur changée pour de vrai)
      minor: 0,
      typo: 1, // typo (guillemets seuls)
      removed: 1, // gone
    });
  });
});

describe('classification MINEURE', () => {
  it('numberSequence : suites de chiffres dans l’ordre, %/./, intérieurs, pleine largeur', () => {
    expect(numberSequence('Deals 12.5% to 1,000 foes, 3 times')).toEqual(['12.5%', '1,000', '3']);
    expect(numberSequence('攻撃力が５０％UP')).toEqual(['50%']);
    expect(numberSequence('no digits')).toEqual([]);
  });

  it('texte reformulé sans nombre changé = mineur ; nombre changé = vrai écart', () => {
    expect(
      isRewordField({
        path: 'desc.en',
        existing: 'Deals 50% dmg.',
        extracted: 'Inflicts 50% damage!',
      }),
    ).toBe(true);
    expect(
      isRewordField({ path: 'desc.en', existing: 'Deals 50% dmg.', extracted: 'Deals 60% dmg.' }),
    ).toBe(false);
    // Langue par langue : le jp garde ses chiffres, l'en les change → écart.
    expect(
      isRewordField({
        path: 'desc',
        existing: { en: '50%', jp: '５０％' },
        extracted: { en: '55%', jp: '５０％' },
      }),
    ).toBe(false);
    expect(
      isRewordField({
        path: 'name',
        existing: undefined,
        extracted: { en: 'A new title', jp: '新しい称号' },
      }),
    ).toBe(true); // champ texte apparu, sans nombre
  });

  it('une clé qui n’est pas du texte reste un vrai écart, même si sa valeur ressemble à du texte', () => {
    expect(isMinorField({ path: 'element', existing: 'fire', extracted: 'water' })).toBe(false);
    expect(isMinorField({ path: 'stats.hp.max', existing: '3530', extracted: '3600' })).toBe(false);
    expect(
      isMinorField({ path: 'voiceActor.en', existing: 'A. Clark', extracted: 'Allegra Clark' }),
    ).toBe(false);
    expect(isMinorField({ path: 'immuneTooltips[0]', existing: '12', extracted: '13' })).toBe(
      false,
    );
    expect(isMinorField({ path: 'tiers[0].2p.value', existing: '30%', extracted: '30 %' })).toBe(
      true,
    ); // typo seule
    expect(isMinorField({ path: 'tiers[0].2p.value', existing: '30%', extracted: '35%' })).toBe(
      false,
    );
  });

  it('costumes : ajouté ou réordonné = mineur ; retiré = vrai écart', () => {
    const added = {
      key: 'c',
      fields: [
        {
          path: 'costumes[#9]',
          existing: undefined,
          extracted: { id: '9', model: '2049', name: { en: 'X' }, sort: 4 },
        },
      ],
    };
    expect(isMinorEntity(added)).toBe(true);
    expect(
      isMinorEntity({
        key: 'c',
        fields: [{ path: 'costumes[#2].sort', existing: 2, extracted: 3 }],
      }),
    ).toBe(true);
    expect(
      isMinorEntity({
        key: 'c',
        fields: [{ path: 'costumes[#2].name.fr', existing: 'Été 2025', extracted: 'Été 2026' }],
      }),
    ).toBe(true);
    expect(
      isMinorEntity({
        key: 'c',
        fields: [{ path: 'costumes', existing: undefined, extracted: [{ id: '1' }] }],
      }),
    ).toBe(true);
    expect(
      isMinorEntity({
        key: 'c',
        fields: [{ path: 'costumes[#9]', existing: { id: '9' }, extracted: undefined }],
      }),
    ).toBe(false);
    // Les autres champs d'un costume restent de vrais écarts.
    expect(
      isMinorEntity({
        key: 'c',
        fields: [{ path: 'costumes[#2].source', existing: 'package_shop', extracted: 'shop' }],
      }),
    ).toBe(false);
    expect(
      isMinorEntity({
        key: 'c',
        fields: [{ path: 'costumes[#2].art', existing: undefined, extracted: true }],
      }),
    ).toBe(false);
  });

  it('l’apparence d’un costume AJOUTÉ est mineure avec lui ; une apparence seule, non', () => {
    const costume = {
      path: 'costumes[#9]',
      existing: undefined,
      extracted: { id: '9', model: '2040084', name: { en: 'X' }, sort: 4 },
    };
    const appearance = { path: 'appearances[3]', existing: undefined, extracted: '2040084' };
    expect(isMinorEntity({ key: 'c', fields: [costume, appearance] })).toBe(true);
    expect(isMinorEntity({ key: 'c', fields: [appearance] })).toBe(false);
    // Première apparence d'un perso sans skin : la liste entière apparaît.
    const firstList = { path: 'appearances', existing: undefined, extracted: ['2040084'] };
    expect(isMinorEntity({ key: 'c', fields: [costume, firstList] })).toBe(true);
    expect(
      isMinorEntity({
        key: 'c',
        fields: [costume, { ...firstList, extracted: ['2040084', '2010120'] }],
      }),
    ).toBe(false);
    expect(
      isMinorEntity({ key: 'c', fields: [costume, { ...appearance, extracted: '2050084' }] }),
    ).toBe(false);
  });

  it('une entité n’est mineure que si TOUS ses champs le sont (une stat = diff)', () => {
    expect(
      isMinorEntity({
        key: 'e',
        fields: [
          { path: 'name.en', existing: 'Old', extracted: 'New' },
          { path: 'stats.atk.max', existing: 757, extracted: 800 },
        ],
      }),
    ).toBe(false);
    expect(isMinorEntity({ key: 'e', fields: [] })).toBe(false);
  });

  it('diffBuckets : sépare new / diff / minor / typo / removed', () => {
    const existing = {
      keep: { v: 1 },
      real: { name: { en: 'Poison' }, stats: { hp: { min: 1, max: 2 } } },
      reword: { desc: { en: 'Deals 50% damage.' } },
      typo: { desc: 'It’s here…' },
      gone: { v: 9 },
    };
    const extracted = {
      keep: { v: 1 },
      real: { name: { en: 'Poison' }, stats: { hp: { min: 1, max: 3 } } },
      reword: { desc: { en: 'Inflicts 50% damage!' } },
      typo: { desc: "It's here..." },
      brandNew: { v: 2 },
    };
    expect(diffBuckets(diffRecords(existing, extracted))).toEqual({
      new: 1,
      diff: 1,
      minor: 1,
      typo: 1,
      removed: 1,
    });
  });
});

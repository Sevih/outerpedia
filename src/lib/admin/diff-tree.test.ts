/**
 * Contrat de `diff-tree` — le diff d'une entité rendu lisible : groupé par
 * racine (et par élément identifié), une chaîne contre une chaîne en mots,
 * tout le reste en arbre, « (absent) » pour un côté vide, les ids résolus.
 */
import { describe, expect, it } from 'vitest';
import type { FieldDiff } from './review-types';
import { diffLabels } from './diff-labels';
import { ABSENT, diffTree, pathSegments, treeLines, type TreeLine } from './diff-tree';

/** Un arbre en lignes de texte : l'indentation, la clé, la valeur, le libellé. */
const lines = (tree: TreeLine[]): string[] =>
  tree.map(
    (l) =>
      `${'  '.repeat(l.depth)}${l.key ? `${l.key}${l.value ? ': ' : ''}` : ''}${
        l.value ? l.value.map((s) => s.text).join('') : `(${l.count})`
      }${l.label ? ` — ${l.label}` : ''}`,
  );

describe('pathSegments', () => {
  it('lit les points, les crochets et les ids', () => {
    expect(pathSegments('costumes[#17].name.en')).toEqual(['costumes', '#17', 'name', 'en']);
    expect(pathSegments('skills[3]')).toEqual(['skills', '3']);
    expect(pathSegments('name')).toEqual(['name']);
  });
});

describe('treeLines — une valeur en lignes', () => {
  it('un côté vide : « (absent) »', () => {
    expect(treeLines(undefined)).toEqual([
      { depth: 0, key: '', value: [{ kind: 'same', text: ABSENT }], absent: true },
    ]);
  });

  it('un scalaire : une ligne nue ; une chaîne garde ses couleurs du jeu', () => {
    expect(lines(treeLines(42))).toEqual(['42']);
    expect(lines(treeLines(true))).toEqual(['true']);
    expect(lines(treeLines(null))).toEqual(['null']);
    expect(lines(treeLines(''))).toEqual(['""']);
    expect(treeLines('<color=#ff0000>Hot</color> text')[0].value).toEqual([
      { kind: 'same', text: 'Hot', color: '#ff0000' },
      { kind: 'same', text: ' text' },
    ]);
  });

  it('un objet : une ligne par clé, les sous-objets en branches indentées', () => {
    expect(
      lines(treeLines({ id: '109', name: { en: 'Summer', fr: 'Été' }, sort: 2, art: true })),
    ).toEqual(['id: 109', 'name(2)', '  en: Summer', '  fr: Été', 'sort: 2', 'art: true']);
  });

  it('une liste : ses éléments par rang, ou par `#id` quand ils en portent un', () => {
    expect(lines(treeLines(['2010001', '2010002']))).toEqual(['[0]: 2010001', '[1]: 2010002']);
    expect(lines(treeLines([{ id: 5, value: 'x' }, { id: 6 }]))).toEqual([
      '#5(2)',
      '  id: 5',
      '  value: x',
      '#6(1)',
      '  id: 6',
    ]);
    expect(lines(treeLines({ tags: [], meta: {} }))).toEqual(['tags: []', 'meta: {}']);
  });

  it('résout les ids scalaires par le résolveur', () => {
    const resolve = (v: string) => ({ '102': 'Fire Strike · active' })[v];
    expect(lines(treeLines(['101', '102'], resolve))).toEqual([
      '[0]: 101',
      '[1]: 102 — Fire Strike · active',
    ]);
    expect(lines(treeLines('102', resolve))).toEqual(['102 — Fire Strike · active']);
  });
});

describe('diffTree — les feuilles groupées, lisibles', () => {
  const field = (path: string, existing: unknown, extracted: unknown): FieldDiff => ({
    path,
    existing,
    extracted,
  });

  it('un texte contre un texte : un diff de mots, sous sa racine', () => {
    const [group] = diffTree([field('desc.en', 'Deal 30% damage', 'Deal 50% damage')]);
    expect(group.key).toBe('desc');
    expect(group.title).toBe('desc');
    expect(group.fields).toHaveLength(1);
    const f = group.fields[0];
    expect(f.kind).toBe('text');
    expect(f.name).toBe('en');
    if (f.kind !== 'text') throw new Error('texte attendu');
    expect(f.existing.map((s) => `${s.kind === 'removed' ? '-' : ''}${s.text}`)).toEqual([
      'Deal ',
      '-30%',
      ' damage',
    ]);
    expect(f.extracted.map((s) => `${s.kind === 'added' ? '+' : ''}${s.text}`)).toEqual([
      'Deal ',
      '+50%',
      ' damage',
    ]);
  });

  it('un costume ajouté : « (absent) » à gauche, l’objet en arbre à droite, sous « costumes › #109 »', () => {
    const costume = {
      id: '109',
      model: '2010009',
      name: { en: 'Summer Rin', fr: 'Rin d’été' },
      grade: 'rare',
      sort: 3,
      source: 'shop',
    };
    const groups = diffTree([
      field('costumes[#109]', undefined, costume),
      field('appearances[1]', undefined, '2010009'),
    ]);
    expect(groups.map((g) => [g.key, g.title])).toEqual([
      ['costumes[#109]', 'costumes › #109'],
      ['appearances', 'appearances'],
    ]);
    const [whole] = groups[0].fields;
    expect(whole.name).toBe('(entier)');
    if (whole.kind !== 'tree') throw new Error('arbre attendu');
    expect(whole.existing).toEqual([
      { depth: 0, key: '', value: [{ kind: 'same', text: ABSENT }], absent: true },
    ]);
    expect(lines(whole.extracted)).toEqual([
      'id: 109',
      'model: 2010009',
      'name(2)',
      '  en: Summer Rin',
      '  fr: Rin d’été',
      'grade: rare',
      'sort: 3',
      'source: shop',
    ]);
    // Un modèle ajouté à la liste des apparences : une ligne nue de chaque côté.
    const [model] = groups[1].fields;
    expect(model.name).toBe('1');
    if (model.kind !== 'tree') throw new Error('arbre attendu');
    expect(lines(model.existing)).toEqual([ABSENT]);
    expect(lines(model.extracted)).toEqual(['2010009']);
  });

  it('une liste de skills : les ids résolus en libellés, jamais un mot à mot sur « 132 » contre « 130 »', () => {
    const fields = [
      field('skills[2]', '132', '130'),
      field('skills[5]', undefined, '140'),
      field('skills', undefined, ['101', '102']),
    ];
    const labels = diffLabels(fields, {
      skills: (id) =>
        ({ '132': 'Old Strike · active', '130': 'New Strike · active', '101': 'S1' })[id],
    });
    const [group] = diffTree(fields, labels);
    expect(group.title).toBe('skills');
    expect(group.fields.map((f) => [f.name, f.kind])).toEqual([
      ['2', 'tree'],
      ['5', 'tree'],
      ['(entier)', 'tree'],
    ]);
    const [changed, added, whole] = group.fields;
    if (changed.kind !== 'tree' || added.kind !== 'tree' || whole.kind !== 'tree')
      throw new Error('arbres attendus');
    expect(lines(changed.existing)).toEqual(['132 — Old Strike · active']);
    expect(lines(changed.extracted)).toEqual(['130 — New Strike · active']);
    expect(lines(added.existing)).toEqual([ABSENT]);
    expect(lines(added.extracted)).toEqual(['140']);
    expect(lines(whole.extracted)).toEqual(['[0]: 101 — S1', '[1]: 102']);
  });

  it('un élément identifié sous sa racine : le libellé résolu fait le titre, le reste du chemin le nom', () => {
    const fields = [
      field('skills[#102].desc.en', 'Hits once.', 'Hits twice.'),
      field('skills[#102].levels[0].cool', 3, 2),
      field('skills[#103].name.en', 'A', 'B'),
    ];
    const labels = { 'skills:102': 'Fire Strike · active' };
    const groups = diffTree(fields, labels);
    expect(groups.map((g) => [g.key, g.title, g.fields.map((f) => `${f.name}:${f.kind}`)])).toEqual(
      [
        [
          'skills[#102]',
          'skills › Fire Strike · active',
          ['desc › en:text', 'levels › 0 › cool:tree'],
        ],
        ['skills[#103]', 'skills › #103', ['name › en:text']],
      ],
    );
  });

  it('un scalaire contre un type différent : deux arbres', () => {
    const [group] = diffTree([field('stats.hp', { min: 1, max: 2 }, 3)]);
    const [f] = group.fields;
    expect(f.kind).toBe('tree');
    if (f.kind !== 'tree') throw new Error('arbre attendu');
    expect(lines(f.existing)).toEqual(['min: 1', 'max: 2']);
    expect(lines(f.extracted)).toEqual(['3']);
  });

  it('rien à montrer : aucun groupe', () => {
    expect(diffTree([])).toEqual([]);
  });
});

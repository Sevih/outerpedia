/**
 * Le plan d'un figeage (quick, lot F22) : la clé à venir, les guides rangés par
 * ce qui leur arrive, les motifs en français, les guides à re-dater, l'index
 * inverse des pins et le refus « working tree sale ». Tout est pur : les
 * guides, le plan de ré-épinglage et les fichiers sont donnés à la main.
 */
import { describe, expect, it } from 'vitest';
import type { RepinPlan, RepinResult } from './repin-guides';
import {
  MONSTER_FILES,
  freezeCommitMessage,
  freezePlanOf,
  freezeReportOf,
  guidesToStamp,
  keptReason,
  monsterDirtyFiles,
  nextArchive,
  pinIndex,
  plannedFiles,
  writtenFiles,
  type FreezeGuide,
} from './monster-freeze';

const CONTENTS = 'src/app/[lang]/guides/_contents';

/** Un plat qui nomme le boss, un plat qui l'atteint par un combat, un versionné à deux versions. */
const GUIDES: FreezeGuide[] = [
  { category: 'special-request', slug: 'flat-boss', bossId: '900', versions: [] },
  { category: 'adventure', slug: 'flat-group', versions: [] },
  {
    category: 'joint-challenge',
    slug: 'versioned',
    bossId: '900',
    versions: [{ key: '2026-10' }, { key: '2026-08' }],
  },
];

const REPIN: RepinPlan = {
  id: '900',
  key: '900@2',
  edits: [
    {
      guide: 'special-request/flat-boss',
      file: 'special-request/flat-boss/meta.json',
      field: 'meta.bossId',
      before: '900',
      after: '900@2',
    },
    {
      guide: 'special-request/flat-boss',
      file: 'special-request/flat-boss/meta.json',
      field: 'meta.monsters',
      before: ['900', '901'],
      after: ['900@2', '901'],
    },
  ],
  pending: [
    { guide: 'adventure/flat-group', origin: 'meta.group', group: 'g-flat' },
    {
      guide: 'joint-challenge/versioned',
      origin: 'version.config',
      version: '2026-10',
      group: 'g',
    },
  ],
  kept: [
    {
      guide: 'joint-challenge/versioned',
      field: 'meta.bossId',
      reason: 'a versioned guide’s meta.bossId carries its portrait and heading',
    },
    {
      guide: 'joint-challenge/versioned',
      field: 'version.pinned',
      version: '2026-08',
      reason: 'already frozen on this monster',
    },
  ],
};

const HEAD = { ref: 'abc1234', committedAt: '2026-10-12T09:00:00+02:00', gameVersion: '1.4.14' };

const plan = (over: Partial<Parameters<typeof freezePlanOf>[0]> = {}) =>
  freezePlanOf({
    id: '900',
    name: 'Annihilator',
    archives: [{ version: 1 }],
    head: HEAD,
    repin: REPIN,
    guides: GUIDES,
    dirty: [],
    ...over,
  });

describe('nextArchive — la clé que le prochain figeage créera', () => {
  it('max existant + 1, sans se fier à l’ordre ni à un trou', () => {
    expect(nextArchive('900', [])).toEqual({ key: '900@1', version: 1 });
    expect(nextArchive('900', [{ version: 1 }, { version: 4 }, { version: 2 }])).toEqual({
      key: '900@5',
      version: 5,
    });
  });
});

describe('freezePlanOf — ce que l’écran montre avant « Figer »', () => {
  it('la clé à venir, HEAD, le fichier, et les guides rangés par ce qui leur arrive', () => {
    const p = plan();
    expect(p).toMatchObject({
      id: '900',
      name: 'Annihilator',
      key: '900@2',
      version: 2,
      file: 'data/generated/monster-archive/900@2.json',
      head: HEAD,
      dirty: [],
    });
    // Les éditions directes : une liste est jointe pour l'œil.
    expect(p.edits).toEqual([
      {
        guide: 'special-request/flat-boss',
        field: 'meta.bossId',
        before: '900',
        after: '900@2',
      },
      {
        guide: 'special-request/flat-boss',
        field: 'meta.monsters',
        before: '900, 901',
        after: '900@2, 901',
      },
    ]);
    // Un combat dans une VERSION s'épingle ; celui d'un guide PLAT reste en attente, avec son lien.
    expect(p.pins).toEqual([
      { guide: 'joint-challenge/versioned', version: '2026-10', group: 'g' },
    ]);
    expect(p.pending).toEqual([
      { guide: 'adventure/flat-group', group: 'g-flat', go: 'guides/adventure/flat-group' },
    ]);
  });

  it('les `kept` en français : le bossId d’un versionné, la version déjà figée', () => {
    const p = plan();
    expect(p.kept.map((k) => [k.guide, k.field, k.version])).toEqual([
      ['joint-challenge/versioned', 'meta.bossId', undefined],
      ['joint-challenge/versioned', 'version.pinned', '2026-08'],
    ]);
    expect(p.kept[0].why).toMatch(/guide versionné .* jamais épinglé/);
    expect(p.kept[1].why).toMatch(/déjà figée .* garde l’archive/);
    // Un motif que ce module ne connaît pas est rendu tel quel, pas tu.
    expect(keptReason({ field: 'other' as 'meta.bossId', reason: 'some new reason' })).toBe(
      'some new reason',
    );
  });

  it('le compte des guides ré-épinglés est par GUIDE, et le message de commit le porte', () => {
    const p = plan();
    // Deux éditions sur le même guide plat, un pin sur le versionné : deux guides.
    expect(p.guides).toBe(2);
    expect(p.commit).toBe('chore(monsters): Annihilator (900) fige en v2, 2 guides re-epingles');
    expect(freezeCommitMessage('Slime', '1', 1, 1)).toBe(
      'chore(monsters): Slime (1) fige en v1, 1 guide re-epingle',
    );
    expect(freezeCommitMessage('Slime', '1', 1, 0)).toBe(
      'chore(monsters): Slime (1) fige en v1, 0 guide re-epingle',
    );
  });

  it('les guides à re-dater : un meta.json, ou le config.json de la version la plus récente', () => {
    expect(plan().stamps).toEqual(['special-request/flat-boss', 'joint-challenge/versioned']);
    // Le pin d'une ARCHIVE de version ne re-date pas le guide.
    const old: RepinPlan = {
      ...REPIN,
      edits: [],
      pending: [
        {
          guide: 'joint-challenge/versioned',
          origin: 'version.config',
          version: '2026-08',
          group: 'g',
        },
      ],
    };
    expect(plan({ repin: old }).stamps).toEqual([]);
  });

  it('`was` signe ce que l’écran montre : la clé, le commit figé, les guides', () => {
    const was = plan().was;
    expect(was).toMatch(/^[0-9a-f]{16}$/);
    expect(plan().was).toBe(was);
    // Une archive de plus (la CLI), un commit passé, un guide en moins : la signature bouge.
    expect(plan({ archives: [{ version: 1 }, { version: 2 }] }).was).not.toBe(was);
    expect(plan({ head: { ...HEAD, ref: 'def5678' } }).was).not.toBe(was);
    expect(plan({ repin: { ...REPIN, edits: REPIN.edits.slice(0, 1) } }).was).not.toBe(was);
    expect(plan({ repin: { ...REPIN, kept: [] } }).was).not.toBe(was);
    // Ni la date du commit ni les fichiers sales n'y entrent : le refus « sale » est dit à part.
    expect(plan({ dirty: [MONSTER_FILES.monsters] }).was).toBe(was);
  });

  it('un monstre que personne ne désigne : un plan vide, une archive qui naîtra orpheline', () => {
    const p = plan({ repin: { id: '900', key: '900@2', edits: [], pending: [], kept: [] } });
    expect([p.edits, p.pins, p.kept, p.pending, p.stamps]).toEqual([[], [], [], [], []]);
    expect(p.guides).toBe(0);
  });
});

describe('plannedFiles, writtenFiles, guidesToStamp — les fichiers d’un ré-épinglage', () => {
  it('le plan : un meta.json par guide édité, le config.json de chaque version épinglée', () => {
    expect(plannedFiles(REPIN)).toEqual([
      `${CONTENTS}/special-request/flat-boss/meta.json`,
      `${CONTENTS}/joint-challenge/versioned/versions/2026-10/config.json`,
    ]);
  });

  it('le résultat : ce qu’applyRepin a vraiment écrit, un slug à tiret compris', () => {
    const result: Pick<RepinResult, 'files' | 'pinnedVersions'> = {
      files: ['special-request/flat-boss/meta.json'],
      pinnedVersions: ['joint-challenge/versioned@2026-10', 'world-boss/a-b@2026-08'],
    };
    expect(writtenFiles(result)).toEqual([
      `${CONTENTS}/special-request/flat-boss/meta.json`,
      `${CONTENTS}/joint-challenge/versioned/versions/2026-10/config.json`,
      `${CONTENTS}/world-boss/a-b/versions/2026-08/config.json`,
    ]);
  });

  it('seuls les guides TOUCHÉS sont re-datés, et pas pour une archive de version', () => {
    const recent = `${CONTENTS}/joint-challenge/versioned/versions/2026-10/config.json`;
    const archive = `${CONTENTS}/joint-challenge/versioned/versions/2026-08/config.json`;
    expect(guidesToStamp([recent], GUIDES)).toEqual(['joint-challenge/versioned']);
    expect(guidesToStamp([archive], GUIDES)).toEqual([]);
    expect(guidesToStamp([], GUIDES)).toEqual([]);
    // Un slug préfixe d'un autre ne le re-date pas.
    const twins: FreezeGuide[] = [
      { category: 'adventure', slug: 'a', versions: [] },
      { category: 'adventure', slug: 'a-b', versions: [] },
    ];
    expect(guidesToStamp([`${CONTENTS}/adventure/a-b/meta.json`], twins)).toEqual([
      'adventure/a-b',
    ]);
  });
});

describe('freezeReportOf — ce que le geste a fait', () => {
  it('l’archive, les éditions écrites, les versions épinglées, le reste dit', () => {
    const result: RepinResult = {
      files: ['special-request/flat-boss/meta.json'],
      applied: REPIN.edits.slice(0, 1),
      skipped: ['adventure/gone'],
      pinnedVersions: ['joint-challenge/versioned@2026-10'],
      pending: [REPIN.pending[0]],
      kept: REPIN.kept,
    };
    const report = freezeReportOf(
      { key: '900@2', version: 2, file: 'data/generated/monster-archive/900@2.json', skills: 6 },
      result,
      ['joint-challenge/versioned'],
    );
    expect(report).toMatchObject({
      key: '900@2',
      version: 2,
      skills: 6,
      pinned: [{ guide: 'joint-challenge/versioned', version: '2026-10' }],
      skipped: ['adventure/gone'],
      stamped: ['joint-challenge/versioned'],
    });
    expect(report.edits).toEqual([
      { guide: 'special-request/flat-boss', field: 'meta.bossId', before: '900', after: '900@2' },
    ]);
    expect(report.pending).toEqual([
      { guide: 'adventure/flat-group', group: 'g-flat', go: 'guides/adventure/flat-group' },
    ]);
    expect(report.kept).toHaveLength(2);
  });
});

describe('pinIndex — qui épingle quelle archive', () => {
  const configs: Record<string, { pinned?: unknown }> = {
    'joint-challenge/versioned@2026-10': { pinned: ['900@2', '777@1'] },
    'joint-challenge/versioned@2026-08': { pinned: ['900@1'] },
    'world-boss/other@2026-09': { pinned: 'nope' },
  };
  const guides: FreezeGuide[] = [
    ...GUIDES,
    { category: 'world-boss', slug: 'other', versions: [{ key: '2026-09' }, { key: '2026-07' }] },
    {
      category: 'special-request',
      slug: 'pinned-flat',
      bossId: '900@1',
      monsters: ['900@1', '901'],
      versions: [],
    },
  ];
  const index = pinIndex(guides, (g, v) => configs[`${g.category}/${g.slug}@${v}`]);

  it('par clé : les versions qui la portent dans leur `pinned`, et les références directes', () => {
    expect(index.get('900@2')).toEqual([
      { guide: 'joint-challenge/versioned', field: 'version.pinned', version: '2026-10' },
    ]);
    expect(index.get('900@1')).toEqual([
      { guide: 'joint-challenge/versioned', field: 'version.pinned', version: '2026-08' },
      { guide: 'special-request/pinned-flat', field: 'meta.bossId' },
      { guide: 'special-request/pinned-flat', field: 'meta.monsters' },
    ]);
    expect(index.get('777@1')).toHaveLength(1);
  });

  it('un id vivant, un `pinned` qui n’est pas une liste, une version sans config : rien', () => {
    expect([...index.keys()].sort()).toEqual(['777@1', '900@1', '900@2']);
    // Une archive que personne n'épingle n'est pas dans l'index : orpheline.
    expect(index.has('900@3')).toBe(false);
  });
});

describe('monsterDirtyFiles — le monstre diffère-t-il de HEAD ?', () => {
  const head: Record<string, Record<string, unknown>> = {
    [MONSTER_FILES.monsters]: {
      '900': { id: '900', skills: ['s1', 's2'], spawns: [{ dungeon: 'd1', level: 90 }] },
      '901': { id: '901', skills: ['s9'] },
    },
    [MONSTER_FILES.skills]: { s1: { v: 1 }, s2: { v: 1 }, s9: { v: 1 } },
    [MONSTER_FILES.encounters]: { d1: { mode: 'jc' }, d9: { mode: 'x' } },
  };
  const read = (disk: Record<string, Record<string, unknown>>) => {
    const heads: string[] = [];
    return {
      heads,
      read: {
        head: (f: string) => {
          heads.push(f);
          return head[f];
        },
        disk: (f: string) => disk[f] ?? head[f],
      },
    };
  };

  it('rien de modifié : rien n’est lu, rien n’est sale', () => {
    const { heads, read: r } = read({});
    expect(monsterDirtyFiles('900', [], r)).toEqual([]);
    expect(heads).toEqual([]);
  });

  it('monsters.json modifié pour un AUTRE monstre : le nôtre est propre', () => {
    const { read: r } = read({
      [MONSTER_FILES.monsters]: {
        ...head[MONSTER_FILES.monsters],
        '901': { id: '901', skills: ['s9', 's10'] },
      },
    });
    expect(monsterDirtyFiles('900', [MONSTER_FILES.monsters], r)).toEqual([]);
    expect(monsterDirtyFiles('901', [MONSTER_FILES.monsters], r)).toEqual([MONSTER_FILES.monsters]);
  });

  it('un de ses skills modifié, ou un de ses donjons : le fichier est nommé', () => {
    const { heads, read: r } = read({
      [MONSTER_FILES.skills]: { ...head[MONSTER_FILES.skills], s2: { v: 2 } },
      [MONSTER_FILES.encounters]: { ...head[MONSTER_FILES.encounters], d1: { mode: 'jc', hp: 2 } },
    });
    expect(monsterDirtyFiles('900', [MONSTER_FILES.skills, MONSTER_FILES.encounters], r)).toEqual([
      MONSTER_FILES.skills,
      MONSTER_FILES.encounters,
    ]);
    // monsters.json est propre : il n'est pas relu de HEAD.
    expect(heads).toEqual([MONSTER_FILES.skills, MONSTER_FILES.encounters]);
    // Le skill et le donjon d'un autre monstre ne le salissent pas.
    expect(monsterDirtyFiles('901', [MONSTER_FILES.skills, MONSTER_FILES.encounters], r)).toEqual(
      [],
    );
  });

  it('un skill RETIRÉ du kit sur le disque compte : les skills des deux états sont comparés', () => {
    const { read: r } = read({
      [MONSTER_FILES.monsters]: {
        ...head[MONSTER_FILES.monsters],
        '900': { id: '900', skills: ['s1'], spawns: [{ dungeon: 'd1', level: 90 }] },
      },
      [MONSTER_FILES.skills]: { s1: { v: 1 }, s9: { v: 1 } },
    });
    expect(monsterDirtyFiles('900', [MONSTER_FILES.monsters, MONSTER_FILES.skills], r)).toEqual([
      MONSTER_FILES.monsters,
      MONSTER_FILES.skills,
    ]);
  });

  it('un monstre nouveau sur le disque, absent de HEAD : sale', () => {
    const { read: r } = read({
      [MONSTER_FILES.monsters]: { ...head[MONSTER_FILES.monsters], '950': { id: '950' } },
    });
    expect(monsterDirtyFiles('950', [MONSTER_FILES.monsters], r)).toEqual([MONSTER_FILES.monsters]);
  });
});

/**
 * Contrat de `monster-sheet` — la fiche d'un monstre pour l'extractor : ses
 * rencontres plafonnées, ses stats par rencontre en options d'un `select`
 * (le calcul de `MonsterStatsCard`), son contexte en lignes lisibles, ses
 * relations, le déclencheur d'enrage de ses skills.
 */
import { describe, expect, it } from 'vitest';
import type { DungeonRef, Monster } from '@contracts';
import {
  ENCOUNTERS_SHOWN,
  monsterEncounters,
  monsterRageLabel,
  monsterRelations,
  monsterStatContexts,
  monsterStatsSheet,
  type DungeonSources,
} from './monster-sheet';

const dungeon = (name: string, over: Partial<DungeonRef> & { mode: string }): DungeonRef =>
  ({ ...over, name: { en: name } }) as DungeonRef;

const SRC: DungeonSources = {
  dungeons: {
    d1: dungeon('Defeat the Annihilator Very Hard', { mode: 'joint_challenge', adv: { atk: 100 } }),
    d2: dungeon('Urd (dark)', {
      mode: 'singularity',
      area: { en: 'Singularity' } as DungeonRef['area'],
      ranks: [
        {
          name: 'E',
          level: 80,
          hp: 100_000,
          damage: { min: 0, max: 99_999 },
          options: ['o1', 'o1b'],
        },
        { name: 'SSS', level: 120, hp: 750_000, damage: { min: 4_250_001, max: 5_000_000 } },
      ],
    }),
  },
  modes: {
    joint_challenge: { en: 'Joint Challenge' } as never,
    singularity: { en: 'Singularity' } as never,
  },
  fallback: { old: dungeon('Gone event', { mode: 'event' }) },
};

const BOSS = {
  id: '4014002',
  name: { en: 'Annihilator' },
  spawns: [
    { dungeon: 'd2', level: 100 },
    { dungeon: 'd1', level: 90, hpLines: 3 },
    { dungeon: 'old', level: 50 },
    { dungeon: 'missing', level: 10 },
  ],
} as unknown as Monster;

describe('monsterEncounters — les rencontres, plafonnées', () => {
  it('résout les donjons (le committé en repli), trie par niveau, nomme le mode et la zone', () => {
    const enc = monsterEncounters(BOSS, SRC);
    expect(enc.total).toBe(3);
    expect(enc.more).toBe(0);
    expect(enc.rows).toEqual([
      { mode: 'event', name: 'Gone event', level: 50 },
      { mode: 'Joint Challenge', name: 'Defeat the Annihilator Very Hard', level: 90, hpLines: 3 },
      { mode: 'Singularity', name: 'Urd (dark)', area: 'Singularity', level: 100 },
    ]);
  });

  it('vingt-cinq au plus, puis « n de plus »', () => {
    const many = {
      spawns: Array.from({ length: 30 }, (_, i) => ({ dungeon: 'd1', level: i })),
    } as unknown as Monster;
    const enc = monsterEncounters(many, SRC);
    expect(ENCOUNTERS_SHOWN).toBe(25);
    expect(enc.rows).toHaveLength(25);
    expect(enc.more).toBe(5);
    expect(enc.total).toBe(30);
    expect(monsterEncounters(many, SRC, 10)).toMatchObject({ more: 20 });
  });

  it('sans spawn : rien', () => {
    expect(monsterEncounters({} as Monster, SRC)).toEqual({ rows: [], more: 0, total: 0 });
  });
});

describe('monsterStatContexts — une rencontre par spawn, dépliée par palier', () => {
  it('porte le libellé « Mode · Stage », les adv, les barres ; un palier redéfinit niveau et rang', () => {
    const ctx = monsterStatContexts(BOSS, SRC);
    expect(ctx.map((c) => [c.label, c.level, c.rank ?? null, c.hpLines ?? null])).toEqual([
      ['event · Gone event', 50, null, null],
      ['Joint Challenge · Defeat the Annihilator Very Hard', 90, null, 3],
      ['Singularity · Urd (dark)', 80, 'E', null],
      ['Singularity · Urd (dark)', 120, 'SSS', null],
    ]);
    expect(ctx[1].adv).toEqual({ atk: 100 });
    // Un mode à score : `hp` est une BARRE, pas des PV.
    expect(ctx[3]).toMatchObject({ bar: 750_000, damage: { min: 4_250_001, max: 5_000_000 } });
    expect(ctx[3].bossHp).toBeUndefined();
  });
});

describe('monsterStatsSheet — les stats à la rencontre, prêtes pour un select', () => {
  const STATS = {
    hp: { min: 1000, max: 10_900 },
    atk: { min: 100, max: 1090 },
    buff_resist: { min: 200, max: 200 },
  };
  const SCALES = { critical_rate: 'percent' };

  it('une option par rencontre dédoublonnée, les cellules dans l’ordre du jeu, la dernière choisie', () => {
    const sheet = monsterStatsSheet(
      STATS,
      monsterStatContexts(BOSS, SRC),
      SCALES,
      { buff_resist: -100 },
      { o1: 'DMG UP +30%', o1b: 'DMG UP +30%' },
    );
    expect(sheet.template).toBe(false);
    expect(sheet.selected).toBe(3);
    // Triées par niveau (la règle de `dedupSpawnContexts`) : le palier E avant le JC.
    expect(sheet.options.map((o) => o.label)).toEqual([
      'Lv 50',
      'E · Lv 80',
      'Lv 90',
      'SSS · Lv 120',
    ]);
    expect(sheet.options.map((o) => o.where)).toEqual([
      'event · Gone event',
      'Singularity · Urd (dark) (palier E)',
      'Joint Challenge · Defeat the Annihilator Very Hard',
      'Singularity · Urd (dark) (palier SSS)',
    ]);
    // Lv 90, ATK +10 % : 100 + floor(990 × 89 / 99) = 990 → × 1,1 = 1089 ; RES −10 % : 180.
    const jc = sheet.options[2];
    expect(jc.cells).toEqual([
      { slug: 'atk', abbr: 'ATK', value: '1089' },
      { slug: 'hp', abbr: 'HP', value: '9900', bars: 3 },
      { slug: 'buff_resist', abbr: 'RES', value: '180' },
    ]);
    expect(jc.context).toEqual([
      'Lv 90',
      'modificateurs du donjon : ATK +10 % · quirks de compte : RES −10 %',
    ]);
    expect(jc.passives).toEqual([]);
    // Le palier E : ses passifs dédoublonnés par libellé, sa tranche et sa barre.
    const e = sheet.options[1];
    expect(e.passives).toEqual(['DMG UP +30%']);
    expect(e.context).toEqual([
      'Lv 80',
      'quirks de compte : RES −10 %',
      'dégâts : 0 – 99\u202f999 · barre du palier : 100\u202f000',
    ]);
    // Le niveau 50, sans modificateur : le templet interpolé.
    expect(sheet.options[0].context).toEqual([
      'Lv 50',
      'quirks de compte : RES −10 % · valeurs du templet, interpolées',
    ]);
  });

  it('les PV du mode remplacent l’interpolation ; un palier à stage se nomme par son stage', () => {
    const sheet = monsterStatsSheet(
      STATS,
      [{ level: 100, label: 'Adventure · Mission', stage: 8, bossHp: 2_000_000, transLevel: 2 }],
      SCALES,
    );
    expect(sheet.options[0].label).toBe('stage 8 · Lv 100');
    expect(sheet.options[0].where).toBe('Adventure · Mission (stage 8)');
    expect(sheet.options[0].cells.find((c) => c.slug === 'hp')?.value).toBe('2000000');
    expect(sheet.options[0].context).toEqual([
      'Lv 100 · transcendance 2',
      'PV du mode : 2\u202f000\u202f000',
    ]);
  });

  it('sans rencontre : le templet au Lv 100, une seule option', () => {
    const sheet = monsterStatsSheet(STATS, [], SCALES);
    expect(sheet).toMatchObject({ template: true, selected: 0 });
    expect(sheet.options).toHaveLength(1);
    expect(sheet.options[0]).toMatchObject({
      label: 'Lv 100',
      where: 'templet',
      context: ['Aucune rencontre connue — valeurs du templet au Lv 100.'],
    });
    expect(sheet.options[0].cells.map((c) => c.value)).toEqual(['1090', '10900', '200']);
  });

  it('une stat en pour-mille s’affiche en pourcentage', () => {
    const sheet = monsterStatsSheet({ critical_rate: { min: 150, max: 150 } }, [], SCALES);
    expect(sheet.options[0].cells).toEqual([{ slug: 'critical_rate', abbr: 'CHC', value: '15%' }]);
  });
});

describe('monsterRageLabel — le déclencheur réel d’un rage_enter', () => {
  const m = {
    rage: { trigger: 'hp_rate', steps: [{ value: 700, duration: 2 }, { value: 300 }] },
  } as unknown as Monster;
  it('lit le palier du suffixe, et son type', () => {
    expect(monsterRageLabel(m, 'rage_enter')).toBe('à 70 % PV · 2 tours');
    expect(monsterRageLabel(m, 'rage_enter2')).toBe('à 30 % PV');
    expect(monsterRageLabel(m, 'rage_enter3')).toBeUndefined();
    expect(monsterRageLabel(m, 'first')).toBeUndefined();
    expect(monsterRageLabel({} as Monster, 'rage_enter')).toBeUndefined();
    expect(
      monsterRageLabel(
        { rage: { trigger: 'lose_hp_value', steps: [{ value: 50_000 }] } } as unknown as Monster,
        'rage_enter1',
      ),
    ).toBe('tous les 50\u202f000 PV perdus');
    expect(
      monsterRageLabel(
        { rage: { trigger: 'turn_count', steps: [{ value: 3 }] } } as unknown as Monster,
        'rage_enter',
      ),
    ).toBe('au tour 3');
  });
});

describe('monsterRelations — invocateurs, kit lié, invoqués', () => {
  it('nomme d’après le catalogue, l’id seul sinon', () => {
    const all = {
      a: { id: 'a', name: { en: 'Boss' } },
      b: { id: 'b', name: { en: 'Add' }, summonedBy: ['a'] },
      c: { id: 'c', name: { en: '' }, summonedBy: ['a', 'z'] },
    } as unknown as Record<string, Monster>;
    expect(monsterRelations({ id: 'a' } as Monster, all)).toEqual({
      summonedBy: [],
      linkedTo: [],
      summons: [
        { id: 'b', name: 'Add' },
        { id: 'c', name: 'c' },
      ],
    });
    expect(
      monsterRelations(
        { id: 'b', summonedBy: ['a', 'z'], linkedTo: ['c'] } as unknown as Monster,
        all,
      ),
    ).toEqual({
      summonedBy: [
        { id: 'a', name: 'Boss' },
        { id: 'z', name: 'z' },
      ],
      linkedTo: [{ id: 'c', name: 'c' }],
      summons: [],
    });
  });
});

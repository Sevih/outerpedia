/**
 * `resolveSkillClips` (clips.ts) sur un index FACTICE — sans `.gamedata`
 * (contrainte CI). Ce qu'on verrouille (spec damage-clips-joues § 5, lot F29) :
 * un index = une variante ; l'index 1 classé par le kit (`BT_SECOND_TRIGGER`
 * → variante, `BT_ADDITIVE_ATTACK_ON_EVENT` → suite sur la base, avec
 * l'`EventAdditiveAttack` du clip de base — sans lui, chaîne irrésolue) ;
 * skip aligné sur l'index ; Ame A → `second`, B → `third` ; les deux types
 * → irrésolu ; `selfMet` dérivé des tables (le clip de base crée le buff du
 * groupe de la condition).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AME_CHARACTER_ID,
  resolveSkillClips,
  type ClipIndex,
  type ClipKitBuff,
  type ClipSkill,
} from './clips';

type Entry = ClipIndex['chars'] extends Map<string, infer E> ? E : never;

function makeIndex(opts: {
  chars: Record<string, Entry>;
  templets: Record<string, { factor: number; count?: number; owned?: boolean }>;
  buffs?: Record<string, Partial<ClipKitBuff>>;
  groups?: Record<string, string[]>;
}): ClipIndex {
  return {
    chars: new Map(Object.entries(opts.chars)),
    templet: new Map(
      Object.entries(opts.templets).map(([id, t]) => [
        id,
        { factor: t.factor, count: t.count ?? 1, owned: t.owned ?? true },
      ]),
    ),
    buffs: new Map(
      Object.entries(opts.buffs ?? {}).map(([id, b]) => [
        id,
        {
          type: '',
          callers: [],
          createType: 'PASSIVE',
          callerDamageIds: [],
          targetType: 'ME',
          ...b,
        },
      ]),
    ),
    tooltipGroups: new Map(Object.entries(opts.groups ?? {})),
  };
}

const hitsOf = (chain: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `${chain}_${i + 1}`, chain }));
const carrier = { id: 'C', model: 'C' };
const skill = (over: Partial<ClipSkill>): ClipSkill => ({
  id: 'sk',
  type: 'SKT_FIRST',
  buffIds: [],
  ...over,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resolveSkillClips — variantes par index (F29)', () => {
  it('index 0 seul : une variante `base`, tous les events du clip', () => {
    const index = makeIndex({
      chars: {
        C: {
          clips: { C_Skill_1: ['C_Skill_1_1,45', 'C_Skill_1_1,0', 'X_Other_1,0'] },
          triggers: { Skill1: ['C_Skill_1'] },
        },
      },
      templets: { C_Skill_1_1: { factor: 300 }, X_Other_1: { factor: 400 } },
    });
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ triggerCsv: 'Skill1' }),
      [],
      hitsOf('C_Skill_1', 1),
    );
    expect(r).toEqual({
      variants: [
        {
          key: 'base',
          trigger: 'Skill1',
          clip: {
            name: 'C_Skill_1',
            events: [
              { id: 'C_Skill_1_1', factor: 300, count: 1 },
              { id: 'C_Skill_1_1', factor: 300, count: 1 },
              { id: 'X_Other_1', factor: 400, count: 1 },
            ],
          },
        },
      ],
      // Templet d'un autre skill joué par le clip : rattaché aux hits (A81).
      sharedTemplets: ['X_Other_1'],
    });
  });

  it('`Skill1,Skill1_1` sous BT_SECOND_TRIGGER du kit : variantes `base` et `second` avec la gate', () => {
    const index = makeIndex({
      chars: {
        C: {
          clips: { C_Skill_1: ['C_Skill_1_1,0'], C_Skill_Extra: ['C_Skill_extra_1,0'] },
          triggers: { Skill1: ['C_Skill_1'], Skill1_1: ['C_Skill_Extra'] },
        },
      },
      templets: { C_Skill_1_1: { factor: 1000 }, C_Skill_extra_1: { factor: 1300 } },
      buffs: {
        C_1_1: { type: 'BT_SECOND_TRIGGER', callers: ['SKT_FIRST'] },
        C_1_9: { type: 'BT_SECOND_TRIGGER', callers: ['SKT_ULTIMATE'] }, // autre lanceur : ignoré
      },
    });
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ triggerCsv: 'Skill1,Skill1_1' }),
      ['C_1_9', 'C_1_1'],
      [...hitsOf('C_Skill_1', 1), ...hitsOf('C_Skill_extra', 1)],
    );
    expect(r.clipsUnresolvedChains).toBeUndefined();
    expect(r.variants?.map((v) => [v.key, v.trigger, v.gate, v.clip.name])).toEqual([
      ['base', 'Skill1', undefined, 'C_Skill_1'],
      ['second', 'Skill1_1', { type: 'BT_SECOND_TRIGGER', buffIds: ['C_1_1'] }, 'C_Skill_Extra'],
    ]);
  });

  it('`Skill2,Skill2_2` sous BT_ADDITIVE_ATTACK_ON_EVENT avec l’EventAdditiveAttack : suite sur la base, `selfMet` prouvé par les tables', () => {
    // Francesca : le premier templet du clip de base crée le Saignement
    // (DAMAGE, tooltip 3) ; la condition du buff additif est le groupe 3.
    const index = makeIndex({
      chars: {
        C: {
          clips: {
            C_Skill_2_1: ['C_Skill_2_1,0', 'C_Skill_2_2,0'],
            C_Skill_2_2: ['C_Skill_2_3,0'],
          },
          triggers: { Skill2: ['C_Skill_2_1'], Skill2_2: ['C_Skill_2_2'] },
          additive: { C_Skill_2_1: [{ time: 1.5, after: 2 }] },
        },
      },
      templets: {
        C_Skill_2_1: { factor: 200 },
        C_Skill_2_2: { factor: 100, count: 5 },
        C_Skill_2_3: { factor: 150, count: 2 },
      },
      buffs: {
        C_2_1: {
          type: 'BT_DOT_BLEED',
          createType: 'DAMAGE',
          callerDamageIds: ['C_Skill_2_1'],
          targetType: 'ENEMY',
          tooltipId: '3',
        },
        C_2_2: {
          type: 'BT_ADDITIVE_ATTACK_ON_EVENT',
          callers: ['SKT_SECOND', 'SKT_BURST_1'],
          conditionType: 'TARGET_HAS_BUFF',
          conditionValue: '3',
        },
      },
      groups: { '3': ['3', '1003'] },
    });
    const sk = skill({
      type: 'SKT_SECOND',
      triggerCsv: 'Skill2,Skill2_2',
      buffIds: ['C_2_1', 'C_2_2'],
    });
    const r = resolveSkillClips(index, carrier, sk, ['C_2_1', 'C_2_2'], hitsOf('C_Skill_2', 3));
    expect(r.clipsUnresolvedChains).toBeUndefined();
    expect(r.variants).toHaveLength(1);
    expect(r.variants?.[0].key).toBe('base');
    expect(r.variants?.[0].additive).toEqual({
      clip: { name: 'C_Skill_2_2', events: [{ id: 'C_Skill_2_3', factor: 150, count: 2 }] },
      buffIds: ['C_2_2'],
      selfMet: true,
    });
    // Sans la preuve (le buff créé n'est pas dans le groupe de la condition) : suite DÉCLARÉE.
    const declared = makeIndex({
      chars: index.chars.get('C') ? { C: index.chars.get('C')! } : {},
      templets: {
        C_Skill_2_1: { factor: 200 },
        C_Skill_2_2: { factor: 100, count: 5 },
        C_Skill_2_3: { factor: 150, count: 2 },
      },
      buffs: {
        C_2_1: {
          type: 'BT_DOT_BLEED',
          createType: 'DAMAGE',
          callerDamageIds: ['C_Skill_2_1'],
          targetType: 'ENEMY',
          tooltipId: '7',
        },
        C_2_2: {
          type: 'BT_ADDITIVE_ATTACK_ON_EVENT',
          callers: ['SKT_SECOND'],
          conditionType: 'OWNER_HAS_BUFF',
          conditionValue: '9998',
        },
      },
      groups: { '9998': ['6', '7'] },
    });
    const d = resolveSkillClips(declared, carrier, sk, ['C_2_1', 'C_2_2'], hitsOf('C_Skill_2', 3));
    expect(d.variants?.[0].additive).toEqual({
      clip: { name: 'C_Skill_2_2', events: [{ id: 'C_Skill_2_3', factor: 150, count: 2 }] },
      buffIds: ['C_2_2'],
    });
  });

  it('suite sans EventAdditiveAttack dans le clip de base : PAS de suite, chaîne irrésolue, warn nommé', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const index = makeIndex({
      chars: {
        C: {
          clips: { C_Skill_2_1: ['C_Skill_2_1,0'], C_Skill_2_2: ['C_Skill_2_Add_1,0'] },
          triggers: { Skill2: ['C_Skill_2_1'], Skill2_2: ['C_Skill_2_2'] },
        },
      },
      templets: { C_Skill_2_1: { factor: 1000 }, C_Skill_2_Add_1: { factor: 300 } },
      buffs: { C_2_1: { type: 'BT_ADDITIVE_ATTACK_ON_EVENT', callers: ['SKT_SECOND'] } },
    });
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_SECOND', triggerCsv: 'Skill2,Skill2_2' }),
      ['C_2_1'],
      [...hitsOf('C_Skill_2', 1), ...hitsOf('C_Skill_2_Add', 1)],
    );
    expect(r.variants?.map((v) => [v.key, v.additive])).toEqual([['base', undefined]]);
    expect(r.clipsUnresolvedChains).toEqual(['C_Skill_2_Add']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('sans EventAdditiveAttack'));
  });

  it('skip aligné sur l’index : `Skill3` / `Skill3Skip` → `base` et `base-skip` ; un skip de templets communs est écarté', () => {
    const index = makeIndex({
      chars: {
        C: {
          clips: {
            C_Skill_3: ['C_Skill_3_1,45'],
            C_Skill_3_Skip: ['C_SKIP,0'],
            D_Skip: ['Skip_Finish_Fire ,0'],
          },
          triggers: {
            Skill3: ['C_Skill_3'],
            Skill3Skip: ['C_Skill_3_Skip'],
            Skill3Generic: ['D_Skip'],
          },
        },
      },
      templets: {
        C_Skill_3_1: { factor: 1000 },
        C_SKIP: { factor: 1000 },
        Skip_Finish_Fire: { factor: 1000, owned: false },
      },
    });
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_ULTIMATE', triggerCsv: 'Skill3', triggerSkipCsv: 'Skill3Skip' }),
      [],
      [...hitsOf('C_Skill_3', 1), { id: 'C_SKIP', chain: 'C_SKIP' }],
    );
    expect(r.variants?.map((v) => [v.key, v.trigger, v.clip.name])).toEqual([
      ['base', 'Skill3', 'C_Skill_3'],
      ['base-skip', 'Skill3Skip', 'C_Skill_3_Skip'],
    ]);
    const generic = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_ULTIMATE', triggerCsv: 'Skill3', triggerSkipCsv: 'Skill3Generic' }),
      [],
      hitsOf('C_Skill_3', 1),
    );
    expect(generic.variants?.map((v) => v.key)).toEqual(['base']);
  });

  it('Ame : A → `second`, B → `third`, par le type des buffs du kit (pas par leur lanceur)', () => {
    const index = makeIndex({
      chars: {
        [AME_CHARACTER_ID]: {
          clips: {
            A_Skill_1: ['A_Skill_1_1,0'],
            A_Skill_1_1: ['A_Skill_1_1,0'],
            A_Skill_1_2: ['A_Skill_1_1,0'],
          },
          triggers: { Skill1: ['A_Skill_1'], Skill1_2: ['A_Skill_1_1'], Skill1_3: ['A_Skill_1_2'] },
        },
      },
      templets: { A_Skill_1_1: { factor: 500 } },
      buffs: {
        A_3_1: { type: 'BT_2000065_A', callers: ['SKT_ULTIMATE'] },
        A_3_2: { type: 'BT_2000065_B', callers: ['SKT_ULTIMATE'] },
      },
    });
    const r = resolveSkillClips(
      index,
      { id: AME_CHARACTER_ID, model: AME_CHARACTER_ID },
      skill({ triggerCsv: 'Skill1,Skill1_2,Skill1_3' }),
      ['A_3_1', 'A_3_2'],
      hitsOf('A_Skill_1', 1),
    );
    expect(r.variants?.map((v) => [v.key, v.gate])).toEqual([
      ['base', undefined],
      ['second', { type: 'BT_2000065_A', buffIds: ['A_3_1'] }],
      ['third', { type: 'BT_2000065_B', buffIds: ['A_3_2'] }],
    ]);
  });

  it('les deux types sur un même skill, ou un index 1 sans buff du kit : irrésolu, jamais deviné', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const chars = {
      C: {
        clips: { C_Skill_1: ['C_Skill_1_1,0'], C_Skill_1_2: ['C_Skill_1_2,0'] },
        triggers: { Skill1: ['C_Skill_1'], Skill1_2: ['C_Skill_1_2'] },
        additive: { C_Skill_1: [{ time: 1, after: 1 }] },
      },
    };
    const templets = { C_Skill_1_1: { factor: 1000 }, C_Skill_1_2: { factor: 300 } };
    const hits = [
      { id: 'C_Skill_1_1', chain: 'C_Skill_1' },
      { id: 'C_Skill_1_2', chain: 'C_Skill_1' },
    ];
    const both = makeIndex({
      chars,
      templets,
      buffs: {
        C_a: { type: 'BT_SECOND_TRIGGER', callers: ['SKT_FIRST'] },
        C_b: { type: 'BT_ADDITIVE_ATTACK_ON_EVENT', callers: ['SKT_FIRST'] },
      },
    });
    const r = resolveSkillClips(
      both,
      carrier,
      skill({ triggerCsv: 'Skill1,Skill1_2' }),
      ['C_a', 'C_b'],
      hits,
    );
    // La chaîne est irrésolue (l'index 1 est marqué) : le clip de base, qui
    // la joue, n'est pas servi non plus — repli § 12.4 pour tout l'état.
    expect(r).toEqual({ clipsUnresolvedChains: ['C_Skill_1'] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('non tranché'));
    const none = makeIndex({ chars, templets });
    const n = resolveSkillClips(none, carrier, skill({ triggerCsv: 'Skill1,Skill1_2' }), [], hits);
    expect(n).toEqual({ clipsUnresolvedChains: ['C_Skill_1'] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aucun buff du kit'));
  });

  it('un clip atteint par un index du skill lui appartient même si ses templets sont rattachés ailleurs', () => {
    // Poolside Regina : le clip de la suite ne porte que des templets de 8505/8506.
    const index = makeIndex({
      chars: {
        C: {
          clips: { C_Skill_2: ['C_Skill_2_1,0'], C_Skill_2_2: ['C_Skill_2_2_1 ,0'] },
          triggers: { Skill2: ['C_Skill_2'], Skill2_2: ['C_Skill_2_2'] },
          additive: { C_Skill_2: [{ time: 3.5, after: 1 }] },
        },
      },
      templets: { C_Skill_2_1: { factor: 1000 }, C_Skill_2_2_1: { factor: 300 } },
      buffs: {
        C_2_2: {
          type: 'BT_ADDITIVE_ATTACK_ON_EVENT',
          callers: ['SKT_SECOND'],
          conditionType: 'TARGET_IS_BOSS',
          conditionValue: '1',
        },
      },
    });
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_SECOND', triggerCsv: 'Skill2,Skill2_2' }),
      ['C_2_2'],
      hitsOf('C_Skill_2', 1),
    );
    expect(r.variants?.[0].additive?.clip.name).toBe('C_Skill_2_2');
    expect(r.variants?.[0].additive?.selfMet).toBeUndefined();
  });
});

describe('resolveSkillClips — clip de base étranger à la jointure (F30)', () => {
  // H. Dianne S2b1 : `Burst1` joue 5 × 200 ‰ du templet du S2, la jointure
  // SkillID sert 4 × 250 ‰ de celui du S1.
  const index = makeIndex({
    chars: {
      C: {
        clips: {
          C_Skill_1: ['C_Skill_1_1 ,0'],
          C_Skill_2_Burst: ['C_Skill_2_1,0'],
          C_Skill_5: ['Skip_Finish_Fire ,0'],
        },
        triggers: { Skill1: ['C_Skill_1'], Burst1: ['C_Skill_2_Burst'], Skill5: ['C_Skill_5'] },
      },
    },
    templets: {
      C_Skill_1_1: { factor: 250, count: 4 },
      C_Skill_2_1: { factor: 200, count: 5 },
      Skip_Finish_Fire: { factor: 1000, owned: false },
    },
  });

  it('le clip de l’index 0 fait foi : variante `base`, et les hits du skill sont ses templets', () => {
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_BURST_1', triggerCsv: 'Burst1' }),
      [],
      hitsOf('C_Skill_1', 1),
    );
    expect(r).toEqual({
      variants: [
        {
          key: 'base',
          trigger: 'Burst1',
          clip: { name: 'C_Skill_2_Burst', events: [{ id: 'C_Skill_2_1', factor: 200, count: 5 }] },
        },
      ],
      clipHitTemplets: ['C_Skill_2_1'],
    });
  });

  it('un clip de base qui joue la jointure ne la remplace pas ; un clip de templets communs reste à personne', () => {
    const own = resolveSkillClips(
      index,
      carrier,
      skill({ triggerCsv: 'Skill1' }),
      [],
      hitsOf('C_Skill_1', 1),
    );
    expect(own.variants?.map((v) => v.clip.name)).toEqual(['C_Skill_1']);
    expect(own.clipHitTemplets).toBeUndefined();
    expect(own.unplayedChains).toBeUndefined();
    const common = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_STRIKE_AERIAL', triggerCsv: 'Skill5' }),
      [],
      hitsOf('C_Skill_5', 1),
    );
    expect(common).toEqual({});
  });
});

describe('resolveSkillClips — clip de base propre, chaîne de la jointure jouée nulle part (A76)', () => {
  // Valentine 1205 : `Skill5` joue `_Skill_4_1`, la jointure y ajoute
  // `_Skill_5` (joué par le clip d'un autre skill).
  const index = makeIndex({
    chars: {
      C: {
        clips: { C_Skill_5: ['C_Skill_4_1,0'], C_Skill_6: ['C_Skill_5_1,0'] },
        triggers: { Skill5: ['C_Skill_5'], Skill6: ['C_Skill_6'] },
      },
    },
    templets: { C_Skill_4_1: { factor: 333, count: 3 }, C_Skill_5_1: { factor: 300 } },
  });
  const hits = [...hitsOf('C_Skill_4', 1), ...hitsOf('C_Skill_5', 1)];

  it('clip de base propre + jointure étrangère → pas d’état fantôme : la chaîne sort', () => {
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_STRIKE_AERIAL', triggerCsv: 'Skill5' }),
      [],
      hits,
    );
    expect(r).toEqual({
      variants: [
        {
          key: 'base',
          trigger: 'Skill5',
          clip: { name: 'C_Skill_5', events: [{ id: 'C_Skill_4_1', factor: 333, count: 3 }] },
        },
      ],
      unplayedChains: ['C_Skill_5'],
    });
  });

  it('sans clip de base, ou une chaîne irrésolue, la jointure reste entière', () => {
    // Index 0 sans clip (S3 d'Ame) : la chaîne garde son repli (état SKIP).
    const noBase = resolveSkillClips(
      index,
      carrier,
      skill({ triggerCsv: 'Skill3' }),
      [],
      hitsOf('C_Skill_5', 1),
    );
    expect(noBase).toEqual({});
    // Deux clips à events sous `Skill5` : chaîne irrésolue, rien ne sort.
    const alt = makeIndex({
      chars: {
        C: {
          clips: { C_Skill_5: ['C_Skill_4_1,0'], C_Skill_5b: ['C_Skill_4_1,0'] },
          triggers: { Skill5: ['C_Skill_5', 'C_Skill_5b'] },
        },
      },
      templets: { C_Skill_4_1: { factor: 333 }, C_Skill_5_1: { factor: 300 } },
    });
    const r = resolveSkillClips(alt, carrier, skill({ triggerCsv: 'Skill5' }), [], hits);
    expect(r.clipsUnresolvedChains).toEqual(['C_Skill_4']);
    expect(r.unplayedChains).toBeUndefined();
  });
});

describe('resolveSkillClips — un clip sert plusieurs skills (A81)', () => {
  // Valentine 1206 : `Skill6` joue `_Skill_5_1` (rattaché à 1205/1209) puis
  // `_Skill_5_2` (sa jointure).
  const index = makeIndex({
    chars: {
      C: {
        clips: { C_Skill_6: ['C_Skill_5_1,0', 'C_Skill_5_2,0', 'Skip_Finish_Fire ,0'] },
        triggers: { Skill6: ['C_Skill_6'] },
      },
    },
    templets: {
      C_Skill_5_1: { factor: 300 },
      C_Skill_5_2: { factor: 100, count: 7 },
      Skip_Finish_Fire: { factor: 0, owned: false },
    },
  });

  it('clip de base propre : le templet d’un autre skill qu’il joue entre dans les hits, pas un commun', () => {
    const r = resolveSkillClips(
      index,
      carrier,
      skill({ type: 'SKT_STRIKE_GROUND', triggerCsv: 'Skill6' }),
      [],
      [{ id: 'C_Skill_5_2', chain: 'C_Skill_5' }],
    );
    expect(r.variants?.map((v) => v.clip.name)).toEqual(['C_Skill_6']);
    expect(r.sharedTemplets).toEqual(['C_Skill_5_1']);
    expect(r.unplayedChains).toBeUndefined();
  });
});

/**
 * Tests du générateur characters-list (agrégats de filtres de `/characters`) —
 * les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒURS PURS en synthétique : `buildCharactersList` end-to-end sur des deps
 *      construites à la main (résolution effet→id→clé, repli sur le `group`,
 *      ventilation par source, EE, ZÉRO faux positif sur un effet mécanique sans
 *      tooltip), plus `teamStatsFromDesc` (regex ally-stat, vocabulaire fermé),
 *      `invertKeys` (préférence base sur variante) et `effectId`. Aucune table.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/characters-list.json` : clés
 *      canoniques présentes dans `glossaries.effectFilters`, sources connues,
 *      effets par source ⊂ union, teamBonuses dans le vocabulaire STAT_ICON.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI).
 */
import { describe, expect, it } from 'vitest';
import charactersListData from '../../data/generated/characters-list.json';
import charactersData from '../../data/generated/characters.json';
import glossariesData from '../../data/generated/glossaries.json';
import {
  buildCharactersList,
  effectId,
  invertKeys,
  teamStatsFromDesc,
  type CharactersListData,
  type CharactersListDeps,
} from './characters-list';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('teamStatsFromDesc — stats d’équipe dans un texte de transcendance', () => {
  const stats = (desc: string) => {
    const s = new Set<string>();
    teamStatsFromDesc(desc, s);
    return [...s].sort();
  };

  it('capte le label ADJACENT au marqueur ally, insensible aux mots suivants', () => {
    expect(stats('+5% Ally Team Speed each turn')).toEqual(['SPD']);
    expect(stats('Increases Ally Resilience by 6%')).toEqual(['RES']);
    expect(stats("Allies' DMG Incr +10%")).toEqual(['DMG UP%']);
  });

  it('plusieurs stats dans un même texte (labels PLEINS, pas les abréviations)', () => {
    expect(stats('+5% Ally Team Speed and Allies Attack')).toEqual(['ATK', 'SPD']);
  });

  it('sans marqueur ally → rien (une montée de SPD en self ne compte pas)', () => {
    expect(stats('Increases own Speed by 10%')).toEqual([]);
  });
});

describe('invertKeys — id d’effet → clé de taxonomie', () => {
  it('préfère la clé de BASE à une variante groupée', () => {
    const byKey = {
      buff: new Map([
        ['BT_IMMUNE', 'e1'],
        ['BT_IMMUNE_IR', 'e1'],
      ]),
      debuff: new Map<string, string>(),
    };
    const filters = {
      buff: {
        BT_IMMUNE: { category: 'utility' },
        BT_IMMUNE_IR: { category: 'utility', group: 'BT_IMMUNE' },
      },
      debuff: {},
    } as unknown as CharactersListDeps['effectFilters'];
    expect(invertKeys(byKey, filters).buff.get('e1')).toBe('BT_IMMUNE');
  });

  it('ignore les clés absentes de la taxonomie', () => {
    const byKey = { buff: new Map([['UNKNOWN', 'e1']]), debuff: new Map<string, string>() };
    const filters = { buff: {}, debuff: {} } as unknown as CharactersListDeps['effectFilters'];
    expect(invertKeys(byKey, filters).buff.has('e1')).toBe(false);
  });
});

describe('effectId — effet → id de glossaire (tooltip puis label)', () => {
  const byTooltip = new Map([['tt', 'e_tt']]);
  const byLabel = new Map([['lb', 'e_lb']]);
  it('tooltip prioritaire, repli sur label, sinon undefined', () => {
    expect(effectId({ tooltip: 'tt' } as never, byTooltip, byLabel)).toBe('e_tt');
    expect(effectId({ label: 'lb' } as never, byTooltip, byLabel)).toBe('e_lb');
    expect(effectId({ tooltip: 'x', label: 'y' } as never, byTooltip, byLabel)).toBeUndefined();
  });
});

describe('buildCharactersList — agrégation end-to-end (synthétique)', () => {
  const deps = {
    characters: { C1: { id: 'C1', skills: ['S1', 'S2', 'UP', 'MECH'] } },
    skills: {
      S1: { type: 'first', effects: [{ tooltip: 'tt_atk' }] },
      S2: { type: 'second', effects: [{ tooltip: 'tt_poison' }] },
      UP: {
        type: 'unique_passive',
        levels: [{ level: 1, desc: { en: '+5% Ally Team Speed', jp: '', kr: '', zh: '' } }],
      },
      // Effet SANS tooltip/label → non résolu → JAMAIS compté (zéro faux positif).
      MECH: { type: 'ultimate', effects: [{ stat: 'ap' }] },
    },
    effects: new Map([
      ['e_atk', { isDebuff: false }],
      ['e_poison', { isDebuff: true }],
    ]),
    byTooltip: new Map([
      ['tt_atk', 'e_atk'],
      ['tt_poison', 'e_poison'],
    ]),
    byLabel: new Map<string, string>(),
    byKey: {
      buff: new Map([['BT_STAT|ST_ATK', 'e_atk']]),
      debuff: new Map([['BT_POISON', 'e_poison']]),
    },
    effectFilters: {
      buff: { 'BT_STAT|ST_ATK': { category: 'statBoosts' } },
      debuff: { BT_POISON: { category: 'dot' } },
    },
    // EE lié à C1 : son passif porte le même buff ATK → source exclusiveEquip.
    ee: { E1: { character: 'C1', passives: [{ id: 'p1', level: 1, isAdd: false }] } },
    passives: { p1: { effects: [{ tooltip: 'tt_atk' }] } },
  } as unknown as CharactersListDeps;

  it('résout les statuts nommés par source, ignore le mécanique, agrège le team bonus', () => {
    const out = buildCharactersList(deps);
    expect(out.C1).toEqual({
      buff: ['BT_STAT|ST_ATK'],
      debuff: ['BT_POISON'],
      effectsBySource: {
        s1: { buff: ['BT_STAT|ST_ATK'], debuff: [] },
        s2: { buff: [], debuff: ['BT_POISON'] },
        exclusiveEquip: { buff: ['BT_STAT|ST_ATK'], debuff: [] },
      },
      teamBonuses: ['SPD'],
    });
  });

  it('replie une clé variante sur son `group` canonique', () => {
    const d = {
      characters: { C1: { id: 'C1', skills: ['S'] } },
      skills: { S: { type: 'first', effects: [{ tooltip: 'tt' }] } },
      effects: new Map([['e', { isDebuff: false }]]),
      byTooltip: new Map([['tt', 'e']]),
      byLabel: new Map<string, string>(),
      byKey: { buff: new Map([['BT_IMMUNE_IR', 'e']]), debuff: new Map<string, string>() },
      effectFilters: {
        buff: {
          BT_IMMUNE: { category: 'utility' },
          BT_IMMUNE_IR: { category: 'utility', group: 'BT_IMMUNE' },
        },
        debuff: {},
      },
      ee: {},
      passives: {},
    } as unknown as CharactersListDeps;
    expect(buildCharactersList(d).C1.buff).toEqual(['BT_IMMUNE']); // variante → base
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const list = charactersListData as unknown as CharactersListData;
const characterIds = new Set(Object.keys(charactersData as Record<string, unknown>));
const ef = (
  glossariesData as unknown as {
    effectFilters: { buff: Record<string, unknown>; debuff: Record<string, unknown> };
  }
).effectFilters;
const VALID_SOURCES = new Set([
  's1',
  's2',
  'ultimate',
  'chainPassive',
  'dualAttack',
  'fusionPassive',
  'exclusiveEquip',
]);
const TEAM_KEYS = new Set([
  'SPD',
  'ATK',
  'HP',
  'DEF',
  'CHD',
  'CHC',
  'DMG UP%',
  'DMG RED%',
  'CDMG RED%',
  'PEN%',
  'EFF',
  'RES',
  'LS',
]);
const entries = Object.entries(list);

describe('characters-list.json — invariants', () => {
  it('chaque entrée est un perso réel', () => {
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.filter(([id]) => !characterIds.has(id)).map(([id]) => id)).toEqual([]);
  });

  it('clés canoniques présentes dans effectFilters, arrays triés', () => {
    const bad: string[] = [];
    for (const [id, c] of entries) {
      for (const k of c.buff) if (!ef.buff[k]) bad.push(`${id} buff ${k}`);
      for (const k of c.debuff) if (!ef.debuff[k]) bad.push(`${id} debuff ${k}`);
      if ([...c.buff].sort().join() !== c.buff.join()) bad.push(`${id} buff non trié`);
      if ([...c.debuff].sort().join() !== c.debuff.join()) bad.push(`${id} debuff non trié`);
    }
    expect(bad).toEqual([]);
  });

  it('effectsBySource : sources connues, effets ⊂ union du perso', () => {
    const bad: string[] = [];
    for (const [id, c] of entries) {
      const ub = new Set(c.buff);
      const ud = new Set(c.debuff);
      for (const [src, sides] of Object.entries(c.effectsBySource)) {
        if (!VALID_SOURCES.has(src)) bad.push(`${id} : source « ${src} »`);
        for (const k of sides.buff) if (!ub.has(k)) bad.push(`${id}/${src} buff ${k} hors union`);
        for (const k of sides.debuff)
          if (!ud.has(k)) bad.push(`${id}/${src} debuff ${k} hors union`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('teamBonuses dans le vocabulaire STAT_ICON', () => {
    const bad: string[] = [];
    for (const [id, c] of entries) {
      for (const t of c.teamBonuses) if (!TEAM_KEYS.has(t)) bad.push(`${id} : ${t}`);
    }
    expect(bad).toEqual([]);
  });
});

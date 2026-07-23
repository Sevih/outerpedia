/**
 * Tests du générateur equipment — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒURS PURS en synthétique : `usedValueKeys` (détecte les placeholders
 *      réellement présents dans un template — pilote quelles valeurs on garde),
 *      `optMode` (OAT_* → mode), `conditionalLabel` (bijection élément de
 *      condition `COND_ELEMENT` + clé `SYS_*` + aplatit les retours ligne) et
 *      `sortByNumericKey`. Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/equipment/` committé : chaque
 *      item pointe des pools/passifs/breakLimits/sets qui EXISTENT, chaque EE un
 *      perso réel, chaque famille des membres réels de son slot. Le catalogue
 *      d'équipement est un graphe de références par id — une dérive rend une
 *      carte trouée sans aucun symptôme.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildEquipment()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import weaponData from '../../data/generated/equipment/weapon.json';
import accessoryData from '../../data/generated/equipment/accessory.json';
import helmetData from '../../data/generated/equipment/helmet.json';
import armorData from '../../data/generated/equipment/armor.json';
import glovesData from '../../data/generated/equipment/gloves.json';
import shoesData from '../../data/generated/equipment/shoes.json';
import talismanData from '../../data/generated/equipment/talisman.json';
import eeData from '../../data/generated/equipment/ee.json';
import familiesData from '../../data/generated/equipment/families.json';
import poolsData from '../../data/generated/equipment/pools.json';
import passivesData from '../../data/generated/equipment/passives.json';
import breakLimitsData from '../../data/generated/equipment/breakLimits.json';
import setsData from '../../data/generated/equipment/sets.json';
import charactersData from '../../data/generated/characters.json';
import type { Row } from '../lib/tables';
import type { LangDict } from '../lib/lang';
import {
  conditionalLabel,
  optMode,
  sortByNumericKey,
  usedValueKeys,
  type ArmorItem,
  type BreakLimit,
  type ExclusiveItem,
  type Family,
  type GameSet,
  type GearItem,
  type Passive,
  type SpecialItem,
} from './equipment';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('optMode — ApplyingType → mode', () => {
  it('mappe OAT_RATE/OAT_ADD, tout le reste → none', () => {
    expect(optMode('OAT_RATE')).toBe('rate');
    expect(optMode('OAT_ADD')).toBe('flat');
    expect(optMode('OAT_NONE')).toBe('none');
    expect(optMode(undefined)).toBe('none');
    expect(optMode('OAT_WHAT')).toBe('none');
  });
});

describe('usedValueKeys — placeholders présents dans un template', () => {
  it('détecte les variantes de chaque clé (Rate1, Turn1, signes)', () => {
    expect(usedValueKeys('[Value]')).toEqual(['value']);
    expect(usedValueKeys('[+Value]')).toEqual(['value']);
    expect(usedValueKeys('[Rate]')).toEqual(['rate']);
    expect(usedValueKeys('[Rate1]')).toEqual(['rate']);
    expect(usedValueKeys('[Turn1]')).toEqual(['turn']);
    expect(usedValueKeys('[Value2]')).toEqual(['value2']);
    expect(usedValueKeys('[Turn2]')).toEqual(['turn2']);
    expect(usedValueKeys('[Value4]')).toEqual(['value4']);
    expect(usedValueKeys('[Value5]')).toEqual(['value5']);
  });

  it('plusieurs placeholders → ordre canonique (value, rate, turn…)', () => {
    expect(usedValueKeys('Deal [Turn] turns of [Value] at [Rate]')).toEqual([
      'value',
      'rate',
      'turn',
    ]);
  });

  it('template sans placeholder → aucune clé (`[Value2]` ne déclenche pas `value`)', () => {
    expect(usedValueKeys('A plain description.')).toEqual([]);
    expect(usedValueKeys('[Value2]')).not.toContain('value');
  });
});

describe('conditionalLabel — libellé de buff conditionnel par élément', () => {
  const sys = (o: Record<string, string>): Map<string, LangDict> =>
    new Map(Object.entries(o).map(([k, en]) => [k, { en, jp: '', kr: '', zh: '' }]));

  it('résout SYS_<Type>_<scope>_<élément> et aplatit les retours ligne', () => {
    const system = sys({ SYS_BT_DMG_REDUCE_TARGET_FIRE: 'Reduced DMG\\nTaken vs Fire' });
    const b: Row = {
      BuffConditionType: 'TARGET_ELEMENT',
      BuffConditionValue: '2',
      Type: 'BT_DMG_REDUCE',
    };
    expect(conditionalLabel(system, b, 'bid')?.en).toBe('Reduced DMG Taken vs Fire');
  });

  it('COND_ELEMENT : la valeur de condition mappe le bon élément (0→EARTH)', () => {
    const system = sys({ SYS_BT_DMG_REDUCE_OWNER_EARTH: 'Reduced DMG Taken vs Earth' });
    const b: Row = {
      BuffConditionType: 'OWNER_ELEMENT',
      BuffConditionValue: '0',
      Type: 'BT_DMG_REDUCE',
    };
    expect(conditionalLabel(system, b, 'bid')?.en).toBe('Reduced DMG Taken vs Earth');
  });

  it('buff absent ou condition non élémentaire → undefined', () => {
    expect(conditionalLabel(new Map(), undefined, 'bid')).toBeUndefined();
    const b: Row = { BuffConditionType: 'OWNER_HAS_BUFF', Type: 'BT_DMG_REDUCE' };
    expect(conditionalLabel(new Map(), b, 'bid')).toBeUndefined();
  });
});

describe('sortByNumericKey — tri numérique des clés', () => {
  it('ordonne par valeur numérique, pas lexicographiquement', () => {
    const sorted = sortByNumericKey({ '10': 'a', '2': 'b', '1': 'c' });
    expect(Object.keys(sorted)).toEqual(['1', '2', '10']);
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const pools = poolsData as unknown as Record<string, unknown>;
const passives = passivesData as unknown as Record<string, Passive>;
const breakLimits = breakLimitsData as unknown as Record<string, BreakLimit>;
const sets = setsData as unknown as Record<string, GameSet>;
const families = familiesData as unknown as Record<string, Family[]>;
const characterIds = new Set(Object.keys(charactersData as Record<string, unknown>));

const poolIds = new Set(Object.keys(pools));
const passiveIds = new Set(Object.keys(passives));
const breakLimitIds = new Set(Object.keys(breakLimits));
const setIds = new Set(Object.keys(sets));

type AnyItem = Partial<GearItem & ArmorItem & SpecialItem & ExclusiveItem>;
const SLOTS: Record<string, Record<string, AnyItem>> = {
  weapon: weaponData as unknown as Record<string, AnyItem>,
  accessory: accessoryData as unknown as Record<string, AnyItem>,
  helmet: helmetData as unknown as Record<string, AnyItem>,
  armor: armorData as unknown as Record<string, AnyItem>,
  gloves: glovesData as unknown as Record<string, AnyItem>,
  shoes: shoesData as unknown as Record<string, AnyItem>,
  talisman: talismanData as unknown as Record<string, AnyItem>,
  ee: eeData as unknown as Record<string, AnyItem>,
};

describe('equipment — catalogues transverses non vides', () => {
  it('pools et passives peuplés', () => {
    expect(poolIds.size).toBeGreaterThan(0);
    expect(passiveIds.size).toBeGreaterThan(0);
  });

  it('chaque passif : `values` parallèle à `levels`', () => {
    // NB : `buff` peut être VIDE — 3 Unique Options sont purement descriptives
    // (ex. « Fatal's Exclusive Equipment » = « +30% Critical Damage » en dur,
    // sans BuffTemplet) → values=levels=0. C'est le parallélisme values↔levels
    // qui doit tenir, pas la présence d'un buff.
    const bad: string[] = [];
    for (const [id, p] of Object.entries(passives)) {
      if (p.values.length !== p.levels.length)
        bad.push(`${id} : ${p.values.length} values ≠ ${p.levels.length} levels`);
    }
    expect(bad).toEqual([]);
  });

  it('chaque breakLimit : 4 facteurs et 4 prix', () => {
    const bad: string[] = [];
    for (const [id, b] of Object.entries(breakLimits)) {
      if (b.factors.length !== 4 || b.prices.length !== 4) bad.push(id);
    }
    expect(bad).toEqual([]);
  });
});

describe('equipment — références des items résolvent', () => {
  it('main/sub/options → pools ; passives → passives ; breakLimit → breakLimits ; set → sets', () => {
    const bad: string[] = [];
    for (const [slot, table] of Object.entries(SLOTS)) {
      for (const [id, it] of Object.entries(table)) {
        for (const g of [...(it.main ?? []), ...(it.options ?? []), it.sub].filter(
          (x): x is string => Boolean(x),
        )) {
          if (!poolIds.has(g)) bad.push(`${slot}/${id} : pool ${g} absent`);
        }
        for (const p of it.passives ?? []) {
          if (!passiveIds.has(p.id)) bad.push(`${slot}/${id} : passif ${p.id} absent`);
        }
        if (it.breakLimit && !breakLimitIds.has(it.breakLimit))
          bad.push(`${slot}/${id} : breakLimit ${it.breakLimit} absent`);
        if (it.set && !setIds.has(it.set)) bad.push(`${slot}/${id} : set ${it.set} absent`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('chaque EE cible un personnage réel', () => {
    const bad: string[] = [];
    for (const [id, it] of Object.entries(SLOTS.ee)) {
      if (it.character && !characterIds.has(it.character)) bad.push(`${id} → ${it.character}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('equipment — familles', () => {
  it('id = plus petit membre, topId ∈ membres, membres réels du slot, ids triés', () => {
    const bad: string[] = [];
    for (const [slot, fams] of Object.entries(families)) {
      const table = SLOTS[slot];
      const ids = new Set(Object.keys(table));
      for (const f of fams) {
        if (f.id !== f.ids[0]) bad.push(`${slot}/${f.id} : id ≠ ids[0]`);
        if (!f.ids.includes(f.topId)) bad.push(`${slot}/${f.id} : topId ${f.topId} hors membres`);
        const numeric = f.ids.map(Number);
        if ([...numeric].sort((a, b) => a - b).join() !== numeric.join())
          bad.push(`${slot}/${f.id} : membres non triés`);
        for (const id of f.ids) if (!ids.has(id)) bad.push(`${slot}/${f.id} : membre ${id} absent`);
      }
    }
    expect(bad).toEqual([]);
  });
});

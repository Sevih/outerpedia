/**
 * Invariants du générateur SOLVER sur `data/generated/solver/` committé — le
 * CONTRAT de l'app desktop gear-solver, qui télécharge ces fichiers tels quels.
 * Deux choses à ne jamais casser :
 *
 *   1. FORME : enums moteur BRUTS (`ST_*`, `OAT_*`, `CCT_*`), textes EN en
 *      string simple (pas de LangDict), slots `weapon…boots/exclusive/ooparts`.
 *      Aucun slug wiki — l'app parse ces valeurs, un slug la casserait.
 *   2. COHÉRENCE : les renvois inter-fichiers résolvent (gem → option, EE
 *      passive → groupe d'item, expCurves complets), et `version.json` reste
 *      une clé d'invalidation valide (12 hexa).
 *
 * Tourne SANS `.gamedata` (contrainte CI) : rien n'appelle `buildSolver()`.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../data/generated/solver/characters.json';
import eePassivesData from '../../data/generated/solver/ee-passives.json';
import enhanceData from '../../data/generated/solver/enhance.json';
import equipmentData from '../../data/generated/solver/equipment.json';
import expCharacterData from '../../data/generated/solver/exp-character.json';
import gemsData from '../../data/generated/solver/gems.json';
import optionsData from '../../data/generated/solver/options.json';
import setsData from '../../data/generated/solver/sets.json';
import subTicksData from '../../data/generated/solver/sub-ticks.json';
import trustCharacterData from '../../data/generated/solver/trust-character.json';
import versionData from '../../data/generated/solver/version.json';

const characters = charactersData as Record<
  string,
  { name: string | null; cls: string | null; star: number | null; ingredients: unknown }
>;
const equipment = equipmentData as Record<
  string,
  {
    slot: string;
    grade: string | null;
    star: number | null;
    classLimit: string | null;
    name: unknown;
  }
>;
const options = optionsData as Record<
  string,
  { st?: string; ap?: string; v?: number; buffId?: string }
>;
const gems = gemsData as Record<
  string,
  { type: string; level: number; st: string; ap: string; v: number }
>;
const enhance = enhanceData as {
  enhanceFactor: number;
  maxEnhanceLevel: number;
  singularity: { activation: number; steps: number[] };
  expCurves: Record<string, number[]>;
};
const sets = setsData as Record<
  string,
  {
    name: string | null;
    levels: { level: number; p2_desc: string | null; p4_desc: string | null }[];
  }
>;
const eePassives = eePassivesData as Record<string, { levelThreshold: number; v: number }[]>;

const SLOTS = new Set([
  'weapon',
  'helmet',
  'armor',
  'gloves',
  'boots',
  'accessory',
  'exclusive',
  'ooparts',
]);

describe('solver — contrat de FORME (enums bruts, EN simple)', () => {
  it('equipment : slots du contrat, grades bruts, classLimit CCT_* ou null', () => {
    const bad: string[] = [];
    for (const [id, e] of Object.entries(equipment)) {
      if (!SLOTS.has(e.slot)) bad.push(`${id} slot ${e.slot}`);
      if (e.grade && !['normal', 'magic', 'rare', 'unique'].includes(e.grade))
        bad.push(`${id} grade ${e.grade}`);
      if (e.classLimit && !e.classLimit.startsWith('CCT_'))
        bad.push(`${id} classLimit ${e.classLimit}`);
      if (e.name !== null && typeof e.name !== 'string')
        bad.push(`${id} name non-string (LangDict ?)`);
    }
    expect(bad).toEqual([]);
  });

  it('characters : name EN string simple, cls CCT_*, ingredients présents', () => {
    const bad: string[] = [];
    for (const [id, c] of Object.entries(characters)) {
      if (c.name !== null && typeof c.name !== 'string') bad.push(`${id} name non-string`);
      if (c.cls && !c.cls.startsWith('CCT_')) bad.push(`${id} cls ${c.cls}`);
      if (!c.ingredients) bad.push(`${id} sans ingredients`);
    }
    expect(bad).toEqual([]);
    expect(Object.keys(characters).length).toBeGreaterThanOrEqual(121);
  });

  it('options : IOT_STAT porte st ST_* + ap OAT_*, IOT_BUFF porte buffId', () => {
    const bad: string[] = [];
    for (const [id, o] of Object.entries(options)) {
      if (o.buffId) continue;
      if (!o.st?.startsWith('ST_')) bad.push(`${id} st ${o.st}`);
      else if (o.ap && !o.ap.startsWith('OAT_')) bad.push(`${id} ap ${o.ap}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('solver — cohérence inter-fichiers', () => {
  it('gems : 54 gemmes (9 stats × 6 niveaux), chacune alignée sur son option', () => {
    expect(Object.keys(gems)).toHaveLength(54);
    for (const [id, g] of Object.entries(gems)) {
      const opt = options[id];
      expect(opt?.st, id).toBe(g.st);
      expect(opt?.v, id).toBe(g.v);
      expect(g.level).toBeGreaterThanOrEqual(1);
      expect(g.level).toBeLessThanOrEqual(6);
    }
  });

  it('enhance : courbes d’XP complètes (11 crans, cumulées croissantes), 5 pas de Singularité', () => {
    expect(enhance.maxEnhanceLevel).toBe(10);
    expect(enhance.singularity.steps.length).toBeGreaterThanOrEqual(5);
    for (const [key, curve] of Object.entries(enhance.expCurves)) {
      expect(curve, key).toHaveLength(11);
      for (let i = 1; i < curve.length; i++)
        expect(curve[i], `${key}[${i}]`).toBeGreaterThanOrEqual(curve[i - 1]);
    }
  });

  it('ee-passives : chaque groupe est l’UO d’un item exclusive, seuils 1 ou 10', () => {
    const eeGroups = new Set(
      Object.values(equipment)
        .filter((e) => e.slot === 'exclusive')
        .flatMap((e) => String((e as { setId?: string }).setId ?? '').split(','))
        .filter(Boolean),
    );
    for (const [gid, tiers] of Object.entries(eePassives)) {
      expect(eeGroups.has(gid), `groupe ${gid}`).toBe(true);
      for (const t of tiers)
        expect([1, 10], `${gid} seuil ${t.levelThreshold}`).toContain(t.levelThreshold);
    }
  });

  it('sets : prose p2/p4 présente sur les paliers à bonus (les levels existent ×2 max)', () => {
    // Les sets d'ARMURE portent 2 paliers (4★/6★) avec prose ; les groupes
    // d'options uniques (armes/EE) coexistent dans la table avec levels sans prose.
    const armorSets = Object.entries(sets).filter(([, s]) =>
      s.levels.some((l) => l.p2_desc || l.p4_desc),
    );
    expect(armorSets.length).toBeGreaterThanOrEqual(20);
    for (const [id, s] of armorSets) {
      for (const l of s.levels) expect([1, 2], `${id} level ${l.level}`).toContain(l.level);
    }
  });

  it('courbes : exp-character 121 crans croissants, trust 101 plafonné à 850000', () => {
    const exp = expCharacterData as number[];
    expect(exp).toHaveLength(121);
    for (let i = 2; i < exp.length; i++) expect(exp[i], `lv${i}`).toBeGreaterThan(exp[i - 1]);
    const trust = trustCharacterData as number[];
    expect(trust).toHaveLength(101);
    expect(trust[100]).toBe(850000);
  });

  it('sub-ticks : paliers 5★ et 6★, chacun avec les 6 duals ATK/DEF/HP flat+%', () => {
    const st = subTicksData as Record<string, Record<string, { step: number; percent: boolean }>>;
    for (const star of ['5', '6']) {
      const row = st[star];
      expect(Object.keys(row ?? {}).sort()).toEqual([
        'atk',
        'atkPct',
        'def',
        'defPct',
        'hp',
        'hpPct',
      ]);
      expect(row.atkPct.percent).toBe(true);
      expect(row.atk.percent).toBe(false);
    }
  });

  it('version : hash 12 hexa + builtAt ISO — la clé d’invalidation de cache de l’app', () => {
    const v = versionData as { hash: string; builtAt: string };
    expect(v.hash).toMatch(/^[0-9a-f]{12}$/);
    expect(Number.isNaN(Date.parse(v.builtAt))).toBe(false);
  });
});

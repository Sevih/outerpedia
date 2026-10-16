/**
 * Invariants du générateur SOLVER sur `data/generated/solver/` committé — le
 * CONTRAT de l'app desktop gear-solver, qui télécharge ces fichiers tels quels.
 * Deux choses à ne jamais casser :
 *
 *   1. FORME : enums moteur BRUTS (`ST_*`, `OAT_*`, `CCT_*`), textes EN en
 *      string simple (pas de LangDict), slots `weapon…boots/exclusive/ooparts`.
 *      Aucun slug wiki — l'app parse ces valeurs, un slug la casserait.
 *   2. COHÉRENCE : les renvois inter-fichiers résolvent (gem → option, EE
 *      passive → groupe d'item, expCurves complets), et `version.json` porte
 *      `{schema, resVersion, hash, builtAt}` : `schema` = `SOLVER_SCHEMA`,
 *      `resVersion` = celle de `game-version.json`, `hash` une clé
 *      d'invalidation valide (12 hexa).
 *   3. CLÉS : `CONTRACT_SHAPE` décrit chaque fichier émis (clés obligatoires et
 *      facultatives d'une entrée et des blocs imbriqués connus) ; un fichier ou
 *      une clé en plus ou en moins casse le test. Règle (en-tête de `solver.ts`) :
 *      un AJOUT se déclare dans `CONTRACT_SHAPE`, `schema` inchangé ; un retrait,
 *      un renommage ou un changement de sens monte `SOLVER_SCHEMA` et attend
 *      qu'une version de gear-solver qui le lit soit publiée — (a) → (b) → (c).
 *
 * Tourne SANS `.gamedata` (contrainte CI) : rien n'appelle `buildSolver()`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import charactersData from '../../data/generated/solver/characters.json';
import eePassivesData from '../../data/generated/solver/ee-passives.json';
import equipmentPassivesData from '../../data/generated/solver/equipment-passives.json';
import enhanceData from '../../data/generated/solver/enhance.json';
import equipmentData from '../../data/generated/solver/equipment.json';
import expCharacterData from '../../data/generated/solver/exp-character.json';
import gemsData from '../../data/generated/solver/gems.json';
import optionsData from '../../data/generated/solver/options.json';
import setsData from '../../data/generated/solver/sets.json';
import subTicksData from '../../data/generated/solver/sub-ticks.json';
import trustCharacterData from '../../data/generated/solver/trust-character.json';
import versionData from '../../data/generated/solver/version.json';
import heroGrowthData from '../../data/generated/hero-growth.json';
import gameVersionData from '../../data/generated/game-version.json';
import buffsData from '../../data/generated/solver/buffs.json';
import poolsData from '../../data/generated/equipment/pools.json';
import { singleValue } from '../lib/tables';
import { SOLVER_SCHEMA } from './solver';

const characters = charactersData as Record<
  string,
  {
    name: string | null;
    cls: string | null;
    star: number | null;
    ingredients: unknown;
    bestSkill?: { slot: string; burst?: number; factor: number; unresolvedHits?: true };
  }
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
type StatEntry = { st: string; ap?: string; v: number };
type CombatEffect = {
  buffId: string;
  type: string;
  st?: string;
  ap?: string;
  v?: number;
  target: string;
  cond?: string;
};
const sets = setsData as Record<
  string,
  {
    name: string | null;
    levels: {
      level: number;
      p2: StatEntry | null;
      p4: StatEntry | null;
      p2_desc: string | null;
      p4_desc: string | null;
      breakLimitCounts: number[];
      ignoreLowSet: boolean;
      combatEffects: { p2: CombatEffect[] | null; p4: CombatEffect[] | null };
    }[];
  }
>;
const eePassives = eePassivesData as Record<
  string,
  { levelThreshold: number; st?: string; ap?: string; v: number }[]
>;
const equipmentPassives = equipmentPassivesData as Record<
  string,
  { name: string | null; textByTier: string[]; statsByTier?: StatEntry[][] }
>;
const heroGrowth = heroGrowthData as { xpCurve: number[]; affinityCurve: number[] };

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
  it('gems : une grille complète stats × niveaux, chacune alignée sur son option', () => {
    // 9 stats × 6 niveaux = 54 au 2026-07-16 : la grille est la règle, pas
    // ses dimensions.
    const all = Object.values(gems);
    const maxLevel = Math.max(...all.map((g) => g.level));
    const stats = new Set(all.map((g) => g.st));
    expect(all.length).toBeGreaterThan(0);
    expect(all).toHaveLength(stats.size * maxLevel);
    const cells = new Set(all.map((g) => `${g.st}|${g.level}`));
    expect(cells.size).toBe(all.length);
    for (const [id, g] of Object.entries(gems)) {
      const opt = options[id];
      expect(opt?.st, id).toBe(g.st);
      expect(opt?.v, id).toBe(g.v);
      expect(g.level).toBeGreaterThanOrEqual(1);
    }
  });

  it('enhance : courbes d’XP complètes (un cran par niveau, +0 compris, cumulées croissantes), 5 pas de Singularité', () => {
    // +10 max au 2026-07-16 : la courbe doit couvrir le max de la table, quel qu'il soit.
    expect(enhance.maxEnhanceLevel).toBeGreaterThan(0);
    expect(enhance.singularity.steps.length).toBeGreaterThanOrEqual(5);
    for (const [key, curve] of Object.entries(enhance.expCurves)) {
      expect(curve, key).toHaveLength(enhance.maxEnhanceLevel + 1);
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

  it('courbes : exp-character et trust croissants, mêmes crans que la fiche hero-growth', () => {
    // 121 et 101 crans au 2026-07-16 (index 0 = sentinelle) : la longueur suit
    // le niveau max et l'affinité max du jeu ; la règle est la parité avec la
    // même table lue par hero-growth.json, décalée d'un cran.
    const exp = expCharacterData as number[];
    for (let i = 2; i < exp.length; i++) expect(exp[i], `lv${i}`).toBeGreaterThan(exp[i - 1]);
    expect(exp.slice(1)).toEqual(heroGrowth.xpCurve);
    const trust = trustCharacterData as number[];
    expect(trust.slice(1)).toEqual(heroGrowth.affinityCurve);
    expect(trust.at(-1)).toBe(Math.max(...trust));
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

  it('version : schema + resVersion + hash 12 hexa + builtAt ISO — la clé d’invalidation de cache de l’app', () => {
    const v = versionData as { schema: number; resVersion: string; hash: string; builtAt: string };
    expect(Object.keys(v)).toEqual(['schema', 'resVersion', 'hash', 'builtAt']);
    expect(Number.isInteger(v.schema) && v.schema >= 1).toBe(true);
    expect(v.schema).toBe(SOLVER_SCHEMA);
    expect(v.resVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(v.resVersion).toBe(gameVersionData.resVersion);
    expect(v.hash).toMatch(/^[0-9a-f]{12}$/);
    expect(Number.isNaN(Date.parse(v.builtAt))).toBe(false);
  });
});

describe('solver — bestSkill (colonne Damage de gear-solver)', () => {
  it('chaque perso porte un bestSkill entier > 0 sur S1/S2/S3 (burst 1..3 optionnel)', () => {
    // Le repli 1000 ‰ vit côté gear-solver : ici la donnée doit être COMPLÈTE —
    // un perso sans kit offensif en S1/S2/S3 serait une régression de l'extracteur.
    const missing = Object.entries(characters)
      .filter(([, c]) => !c.bestSkill)
      .map(([id]) => id);
    expect(missing).toEqual([]);
    for (const [id, c] of Object.entries(characters)) {
      const b = c.bestSkill!;
      expect(['S1', 'S2', 'S3'], id).toContain(b.slot);
      expect(Number.isInteger(b.factor) && b.factor > 0, `${id} factor ${b.factor}`).toBe(true);
      if (b.burst !== undefined) expect([1, 2, 3], id).toContain(b.burst);
    }
  });

  it('ordre de grandeur : facteurs dans [500, 5000] ‰ (des % ou un ×10 seraient une unité fausse)', () => {
    for (const [id, c] of Object.entries(characters)) {
      expect(c.bestSkill!.factor, id).toBeGreaterThanOrEqual(500);
      expect(c.bestSkill!.factor, id).toBeLessThanOrEqual(5000);
    }
  });
});

describe('singleValue (constantes lues des tables)', () => {
  it('rend la valeur commune à toutes les lignes', () => {
    expect(singleValue([0.4, 0.4, 0.4], 'x')).toBe(0.4);
  });

  it('jette si un patch fait diverger la colonne (le contrat n’en porte qu’une)', () => {
    expect(() => singleValue([0.4, 0.5], 'x')).toThrow(/valeur unique/);
  });

  it('jette sur une colonne vide ou non numérique', () => {
    expect(() => singleValue([], 'x')).toThrow();
    expect(() => singleValue([Number.NaN], 'x')).toThrow();
  });
});

// ---- forme du contrat : chaque clé émise est déclarée ici -----------------------
/**
 * `'*'` = feuille non décrite (nombre, chaîne, booléen, null) ; `obj` = clés
 * fixes (`opt` : facultatives) ; `rec` = `Record<id, …>` ; `arr` = tableau.
 * `null` est accepté à toute place (`p2: null`, `ingredients: null`…).
 */
type Shape =
  | '*'
  | { obj: Record<string, Shape>; opt?: Record<string, Shape> }
  | { rec: Shape }
  | { arr: Shape };

const STAT: Shape = { obj: { st: '*', ap: '*', v: '*' } };
const COMBAT_EFFECT: Shape = {
  obj: { buffId: '*', type: '*', target: '*' },
  opt: { st: '*', ap: '*', v: '*', cond: '*' },
};
const CONTRACT_SHAPE: Record<string, Shape> = {
  'archive-bonus.json': { arr: { obj: { requiredCount: '*', level: '*' } } },
  'buffs.json': {
    rec: { arr: { obj: { st: '*', ap: '*', v: '*' }, opt: { combatOnly: '*', name: '*' } } },
  },
  'characters.json': {
    rec: {
      obj: {
        name: '*',
        nickname: '*',
        cls: '*',
        element: '*',
        star: '*',
        ingredients: {
          obj: {
            base: '*',
            evoByLevel: '*',
            transcendByStar: '*',
            classPassive: '*',
            skill8ByLevel: '*',
            geasByNode: '*',
            s1ByLevel: '*',
            s2ByLevel: '*',
            s3ByLevel: '*',
            corePassive: '*',
          },
        },
        recommendSetId: '*',
      },
      opt: {
        dmgStat: '*',
        dmgSec: '*',
        noCrit: '*',
        bestSkill: { obj: { slot: '*', factor: '*' }, opt: { burst: '*', unresolvedHits: '*' } },
      },
    },
  },
  'char-level-max.json': {
    rec: { obj: { requireLevel: '*', maxLevel: '*', statModifierAfter100: '*' } },
  },
  'codex-curve.json': { arr: { obj: { atkPct: '*', defPct: '*', hpPct: '*' } } },
  'ee-passives.json': { rec: { arr: { obj: { levelThreshold: '*', st: '*', ap: '*', v: '*' } } } },
  'enhance.json': {
    obj: {
      enhanceFactor: '*',
      tierFactor: '*',
      maxEnhanceLevel: '*',
      singularity: { obj: { activation: '*', steps: { arr: '*' } } },
      expCurves: { rec: { arr: '*' } },
    },
  },
  'equipment.json': {
    rec: {
      obj: {
        slot: '*',
        grade: '*',
        star: '*',
        classLimit: '*',
        setId: '*',
        armorSetId: '*',
        name: '*',
        mainGroup: '*',
        subGroup: '*',
        image: '*',
        effectIcon: '*',
        armorSetIcon: '*',
        class: '*',
      },
    },
  },
  'equipment-passives.json': {
    rec: {
      obj: { name: '*', textByTier: { arr: '*' } },
      opt: { statsByTier: { arr: { arr: STAT } } },
    },
  },
  'exp-character.json': { arr: '*' },
  'gems.json': { rec: { obj: { type: '*', level: '*', st: '*', ap: '*', v: '*' } } },
  'multi-tier-passives.json': {
    rec: {
      obj: { name: '*', tiers: { arr: { obj: { unlockLevel: '*', isAdd: '*', desc: '*' } } } },
    },
  },
  'options.json': { rec: { obj: {}, opt: { st: '*', ap: '*', v: '*', buffId: '*' } } },
  'sets.json': {
    rec: {
      obj: {
        name: '*',
        desc: '*',
        levels: {
          arr: {
            obj: {
              level: '*',
              p2: STAT,
              p4: STAT,
              p2_desc: '*',
              p4_desc: '*',
              breakLimitCounts: { arr: '*' },
              ignoreLowSet: '*',
              combatEffects: {
                obj: { p2: { arr: COMBAT_EFFECT }, p4: { arr: COMBAT_EFFECT } },
              },
            },
          },
        },
      },
    },
  },
  'singularity-options.json': {
    rec: { obj: { st: '*', ap: '*', v: '*', name: '*', desc: '*', combatOnly: '*' } },
  },
  'sub-ticks.json': {
    rec: {
      obj: {},
      opt: Object.fromEntries(
        ['atk', 'atkPct', 'def', 'defPct', 'hp', 'hpPct'].map((k) => [
          k,
          { obj: { step: '*', percent: '*' } },
        ]),
      ),
    },
  },
  'trust-buffs.json': {
    arr: { obj: { tier: '*', buffId: '*', stat: '*', apply: '*', value: '*' } },
  },
  'trust-character.json': { arr: '*' },
  'version.json': { obj: { schema: '*', resVersion: '*', hash: '*', builtAt: '*' } },
};

/** Écarts de forme, un par chemin générique (`*` = un id, `[]` = un élément). */
function shapeErrors(value: unknown, shape: Shape, path: string, out: Set<string>): void {
  if (shape === '*' || value === null) return;
  if ('arr' in shape) {
    if (!Array.isArray(value)) out.add(`${path} : tableau attendu`);
    else for (const v of value) shapeErrors(v, shape.arr, `${path}[]`, out);
    return;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    out.add(`${path} : objet attendu`);
    return;
  }
  const o = value as Record<string, unknown>;
  if ('rec' in shape) {
    for (const v of Object.values(o)) shapeErrors(v, shape.rec, `${path} › *`, out);
    return;
  }
  const opt = shape.opt ?? {};
  for (const k of Object.keys(shape.obj))
    if (!(k in o)) out.add(`${path} : clé obligatoire « ${k} » absente`);
  for (const [k, v] of Object.entries(o)) {
    const sub = shape.obj[k] ?? opt[k];
    if (sub === undefined) out.add(`${path} : clé « ${k} » non déclarée`);
    else shapeErrors(v, sub, `${path}.${k}`, out);
  }
}

const SHAPE_RULE =
  'Forme du contrat solver changée. Un AJOUT se déclare dans CONTRACT_SHAPE ' +
  '(solver.test.ts), `schema` inchangé. Un retrait, un renommage ou un changement ' +
  'de sens monte SOLVER_SCHEMA et attend la release de gear-solver qui le lit : ' +
  '(a) → (b) → (c), en-tête de datagen/generators/solver.ts.';

describe('solver — forme du contrat (clés déclarées, règle (a) → (b) → (c))', () => {
  const dir = resolve('data/generated/solver');

  it('les fichiers émis sont exactement ceux de CONTRACT_SHAPE', () => {
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort();
    expect(files, SHAPE_RULE).toEqual(Object.keys(CONTRACT_SHAPE).sort());
  });

  it.each(Object.keys(CONTRACT_SHAPE))('%s : ni clé en plus ni clé en moins', (file) => {
    const data: unknown = JSON.parse(readFileSync(resolve(dir, file), 'utf8'));
    const errors = new Set<string>();
    shapeErrors(data, CONTRACT_SHAPE[file], file, errors);
    expect([...errors], SHAPE_RULE).toEqual([]);
  });
});

// ---- C1 : un effet de combat de set (IOT_BUFF) n'est pas une stat de fiche -------
describe('solver — sets : p2 / p4 = stats de fiche seulement', () => {
  it('les neuf effets IOT_BUFF autrefois convertis en stat sont à null', () => {
    const at = (id: string, level: number) => sets[id].levels.find((l) => l.level === level)!;
    const nulls: [string, number, 'p2' | 'p4'][] = [
      ['17', 1, 'p2'],
      ['17', 1, 'p4'],
      ['17', 2, 'p2'],
      ['17', 2, 'p4'],
      ['20', 1, 'p2'],
      ['20', 2, 'p2'],
      ['21', 1, 'p2'],
      ['21', 2, 'p2'],
      ['18', 2, 'p4'],
    ];
    for (const [id, level, p] of nulls) expect(at(id, level)[p], `${id} L${level} ${p}`).toBeNull();
  });

  it('aucun p2 / p4 ne vient d’un IOT_BUFF : prose du jeu ⇒ null, et ni DMG ni réduction', () => {
    // La prose d'un palier `IOT_STAT` est la synthèse « <Libellé> +<valeur> » ;
    // celle d'un palier à buff est la description du jeu (cf. `setProse`).
    const SYNTH = /^[A-Za-z ]+ \+[\d.]+%?$/;
    const bad: string[] = [];
    for (const [id, s] of Object.entries(sets)) {
      for (const l of s.levels) {
        for (const p of ['p2', 'p4'] as const) {
          const e = l[p];
          const desc = l[`${p}_desc`];
          if (!e) continue;
          if (e.st === 'ST_DMG_BOOST' || e.st === 'ST_DMG_REDUCE_RATE')
            bad.push(`${id} L${l.level} ${p} ${e.st}`);
          if (desc && !SYNTH.test(desc))
            bad.push(`${id} L${l.level} ${p} prose du jeu « ${desc} »`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

// ---- B53 : effets de combat des sets (IOT_BUFF), pour l'affichage seulement ----
describe('solver — sets : combatEffects (affichage, jamais la fiche)', () => {
  const at = (id: string, level: number) => sets[id].levels.find((l) => l.level === level)!;

  it('Pulverization niveau 2 : 2P et 4P BT_DMG_TARGET_BREAK 700 sur ME', () => {
    for (const p of ['p2', 'p4'] as const) {
      expect(at('17', 2).combatEffects[p], p).toEqual([
        {
          buffId: 'BID_ITEM_UO_SET_17',
          type: 'BT_DMG_TARGET_BREAK',
          ap: 'OAT_RATE',
          v: 700,
          target: 'ME',
        },
      ]);
    }
  });

  it('Weakness niveau 2 : BT_DMG_REDUCE −350 sur ENEMY_TEAM (signe et cible bruts)', () => {
    expect(at('20', 2).combatEffects.p2).toEqual([
      {
        buffId: 'BID_ITEM_UO_SET_20',
        type: 'BT_DMG_REDUCE',
        ap: 'OAT_RATE',
        v: -350,
        target: 'ENEMY_TEAM',
        cond: 'OWNER_HAS_BUFF',
      },
    ]);
    expect(at('20', 2).combatEffects.p4).toBeNull();
  });

  it('Revenge niveau 2 : 4P BT_STAT_OWNER_LOST_HP_RATE_HALF', () => {
    expect(at('15', 2).combatEffects.p4?.map((e) => e.type)).toEqual([
      'BT_STAT_OWNER_LOST_HP_RATE_HALF',
    ]);
  });

  it('Immunity niveau 2 : 4P BID_ITEM_UO_SET_18_1 (ligne de niveau 2 seule) résolu', () => {
    expect(at('18', 2).combatEffects.p4).toEqual([
      {
        buffId: 'BID_ITEM_UO_SET_18_1',
        type: 'BT_DMG_REDUCE',
        ap: 'OAT_RATE',
        v: 300,
        target: 'ME',
      },
    ]);
  });

  it('Attack (stats pures) : combatEffects à null des deux côtés', () => {
    for (const l of sets['1'].levels) expect(l.combatEffects).toEqual({ p2: null, p4: null });
  });

  it('p2 / p4 et combatEffects ne se recouvrent jamais', () => {
    const both: string[] = [];
    for (const [id, s] of Object.entries(sets))
      for (const l of s.levels)
        for (const p of ['p2', 'p4'] as const)
          if (l[p] && l.combatEffects[p]) both.push(`${id} L${l.level} ${p}`);
    expect(both).toEqual([]);
  });
});

// ---- O5 : niveau par pièce et ignoreLowSet, rejoués comme l'en-tête de solver.ts --
/** Bonus de set sur `stat` (valeur brute) pour des pièces aux breakthroughs donnés. */
function setBonus(setId: string, breakthroughs: number[], stat: string): number {
  const levels = sets[setId].levels;
  const pieceLevel = (bt: number) => levels.find((l) => l.breakLimitCounts.includes(bt))!.level;
  const lv = breakthroughs.map(pieceLevel).sort((a, b) => b - a);
  const row = (n: number) => levels.find((l) => l.level === Math.min(...lv.slice(0, n)))!;
  const r2 = lv.length >= 2 ? row(2) : null;
  const r4 = lv.length >= 4 ? row(4) : null;
  const p2 = r2?.p2?.st === stat ? r2.p2 : null;
  const p4 = r4?.p4?.st === stat ? r4.p4 : null;
  return (p2 && !(p4 && r4!.ignoreLowSet) ? p2.v : 0) + (p4 ? p4.v : 0);
}

describe('solver — sets : paliers par pièce et ignoreLowSet (O5)', () => {
  it('chaque niveau d’un set d’armure porte ses breakthroughs, disjoints d’un niveau à l’autre', () => {
    for (const id of ['1', '13']) {
      const all = sets[id].levels.flatMap((l) => l.breakLimitCounts).sort();
      expect(all, id).toEqual([0, 1, 2, 3, 4]);
    }
  });

  it('Attack niveaux [2,2,1,1] → 55 % (35 + 20)', () => {
    expect(setBonus('1', [4, 4, 3, 3], 'ST_ATK')).toBe(550);
  });

  it('Speed : [2,2,1,1] → 25 %, [2,2,2,2] → 25 %, [2,2,1] → 13 %', () => {
    // [2,2,1,1] : le 2P de niveau 2 (13 %) est écarté par l'ignoreLowSet du 4P de niveau 1.
    expect(setBonus('13', [4, 4, 3, 3], 'ST_SPEED')).toBe(250);
    expect(setBonus('13', [4, 4, 4, 4], 'ST_SPEED')).toBe(250);
    expect(setBonus('13', [4, 4, 3], 'ST_SPEED')).toBe(130);
  });
});

// ---- M2 / M3 : uniques qui touchent la fiche ----------------------------------------
describe('solver — uniques de fiche (equipment-passives, ee-passives)', () => {
  const PHANTASM = [
    '24',
    '174',
    '324',
    '474',
    '624',
    '774',
    '92201',
    '92202',
    '92203',
    '93391',
    '93392',
    '93393',
  ];
  const BRIAREOS = ['1797', '93291', '93292', '93293'];

  it('statsByTier sur Phantasm Necrosis et Ambition de Briaréos, et nulle part ailleurs', () => {
    const withStats = Object.keys(equipmentPassives).filter(
      (id) => equipmentPassives[id].statsByTier,
    );
    expect(withStats.sort()).toEqual([...PHANTASM, ...BRIAREOS].sort());
  });

  it('Phantasm Necrosis : SPD −300 OAT_RATE aux cinq paliers ; Briaréos : RES 200 → 400', () => {
    for (const id of PHANTASM) {
      expect(equipmentPassives[id].statsByTier, id).toEqual(
        Array.from({ length: 5 }, () => [{ st: 'ST_SPEED', ap: 'OAT_RATE', v: -300 }]),
      );
    }
    for (const id of BRIAREOS) {
      expect(equipmentPassives[id].statsByTier, id).toEqual(
        [200, 250, 300, 350, 400].map((v) => [{ st: 'ST_BUFF_RESIST', ap: 'OAT_RATE', v }]),
      );
    }
  });

  it('statsByTier suit textByTier, palier par palier', () => {
    for (const [id, e] of Object.entries(equipmentPassives))
      if (e.statsByTier) expect(e.statsByTier.length, id).toBe(e.textByTier.length);
  });

  it('EE de Fatal (2000078) : l’option unique IOT_STAT CHD +300 OAT_ADD à +10', () => {
    expect(eePassives['2000078']).toEqual([
      { levelThreshold: 10, st: 'ST_CRITICAL_DMG_RATE', ap: 'OAT_ADD', v: 300 },
    ]);
  });
});

describe('solver — libellés des mains d’EE (R12)', () => {
  // Relation, pas une chaîne du jour : la fiche porte sur chaque option d'EE le
  // libellé de `conditionalLabel` (élément de `BuffConditionValue`), le contrat
  // doit dire le même.
  const buffs = buffsData as unknown as Record<string, ({ name?: string } | null)[]>;
  const pools = poolsData as unknown as Record<string, { buff?: string; label?: { en: string } }[]>;
  const fiche = new Map<string, string>();
  for (const rows of Object.values(pools))
    for (const o of rows) if (o.buff && o.label?.en) fiche.set(o.buff, o.label.en);

  it('BID_CEQUIP_MAIN_DMG_REDUCE_FIRE : le libellé du jeu, pas l’élément du suffixe', () => {
    const bid = 'BID_CEQUIP_MAIN_DMG_REDUCE_FIRE';
    expect(fiche.get(bid)).toBeTruthy();
    expect(buffs[bid].find(Boolean)?.name).toBe(fiche.get(bid));
    expect(fiche.get(bid)).not.toMatch(/Fire/);
  });

  it('chaque main d’EE conditionnée porte, à tous les niveaux, le libellé de la fiche', () => {
    expect(fiche.size).toBeGreaterThan(0);
    for (const [bid, label] of fiche)
      if (bid.startsWith('BID_CEQUIP_MAIN_'))
        for (const lv of buffs[bid] ?? []) if (lv) expect(lv.name, bid).toBe(label);
  });
});

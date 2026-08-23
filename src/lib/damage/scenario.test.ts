/**
 * Pont scénario (`?z=` → entrées de l'amont pur) — le chemin PARTAGÉ entre le
 * panneau Debug et le futur test des fixtures. Les attendus dérivent des
 * conventions de l'UI (percent → ‰, défauts 120/100 %, paliers d'affinité) —
 * jamais des nombres recopiés d'un rendu.
 */
import { describe, expect, it } from 'vitest';
import type { DamageReportResult } from './inputs';
import type { SkillReport } from './report';
import {
  buildInputsFromZ,
  flattenReport,
  parseStatInput,
  type CalculatorUrlState,
} from './scenario';

describe('parseStatInput', () => {
  it('plat : tel quel ; % : ×10 (la fiche affiche des %, le moteur veut des ‰)', () => {
    expect(parseStatInput('12345', false)).toBe(12345);
    expect(parseStatInput('50.5', true)).toBe(505);
    expect(parseStatInput('150', true)).toBe(1500);
  });

  it('vide, absent ou invalide → 0 (contribution nulle, jamais devinée)', () => {
    expect(parseStatInput('', false)).toBe(0);
    expect(parseStatInput(undefined, true)).toBe(0);
    expect(parseStatInput('abc', false)).toBe(0);
  });
});

describe('buildInputsFromZ — attaquant', () => {
  const z: CalculatorUrlState = {
    a: '2000001',
    af: 47, // niveau 0..100 → palier 2 (tous les 20)
    k: { S1: 5, S2: 7, S3: 6, chain: 4 }, // chain : slot UI hors moteur
    v: { atk: '10000', critical_rate: '50.5', dmg_boost: '', speed: 'abc' },
    h: '75',
    b: ['atk', 't_marked'],
  };

  it('défauts UI (niveau 120, palier 0), conversions ‰, slots filtrés', () => {
    const { attacker } = buildInputsFromZ(z);
    expect(attacker).toEqual({
      id: '2000001',
      level: 120,
      affinityTier: 2,
      codexLevel: 0,
      skillLevels: { S1: 5, S2: 7, S3: 6 },
      // Vide ('') omis ; invalide ('abc') saisi → 0 explicite.
      sheet: { atk: 10000, critical_rate: 505, speed: 0 },
      hpPct: 75,
      fx: ['atk', 't_marked'],
      // EE porté à +10 par défaut (miroir de l'UI) — sans effet pour un perso
      // sans EE (gear.ts ne trouve pas de pièce liée).
      gear: { ee: { enchant: 10 } },
    });
  });

  it('codexLevel/guildLevel/premiumHp viennent des options (HORS z — réglages de compte)', () => {
    const a = buildInputsFromZ(z, { codexLevel: 11, guildLevel: 7, premiumHp: true }).attacker;
    expect(a?.codexLevel).toBe(11);
    expect(a?.guildLevel).toBe(7);
    expect(a?.premiumHp).toBe(true);
    // Sans option : pas de champ — jamais un 0 déguisé en réglage.
    expect(buildInputsFromZ(z).attacker?.guildLevel).toBeUndefined();
    expect(buildInputsFromZ(z).attacker?.premiumHp).toBeUndefined();
  });

  it('sans attaquant : rien — pas de valeurs plausibles', () => {
    const r = buildInputsFromZ({});
    expect(r.attacker).toBeUndefined();
    expect(r.target).toBeUndefined();
    expect(r.ignored).toEqual([]);
  });
});

describe('buildInputsFromZ — cible', () => {
  it('manuelle : élément requis, percent → ‰, boss du flag', () => {
    const { target } = buildInputsFromZ({
      g: 1,
      te: 'water',
      tv: { hp: '500000', def: '2000', dmgRed: '10', cdmgRed: '' },
      tb: 1,
      th: '60',
      d: ['t_def_down'],
    });
    expect(target).toEqual({
      element: 'water',
      stats: { hp: 500000, def: 2000, dmgRed: 100 },
      boss: true,
      hpPct: 60,
      fx: ['t_def_down'],
    });
  });

  it('manuelle sans élément → pas de cible', () => {
    expect(buildInputsFromZ({ g: 1, tv: { def: '2000' } }).target).toBeUndefined();
  });

  it('preset : résolue par l’appelant, boss TOUJOURS, le MODE transite (§ 16.2)', () => {
    const { target } = buildInputsFromZ(
      { ti: 'dg:400101', si: 2 },
      {
        resolvePreset: (ti, si) =>
          ti === 'dg:400101' && si === 2
            ? { element: 'CET_DARK', stats: { hp: 91080, def: 1200 }, mode: 'raid_1' }
            : undefined,
      },
    );
    expect(target).toEqual({
      element: 'CET_DARK',
      stats: { hp: 91080, def: 1200 },
      boss: true,
      mode: 'raid_1',
    });
  });

  it('coches « guilde »/« titre » : cible MANUELLE seulement, jamais devinées', () => {
    const manual = buildInputsFromZ({ g: 1, te: 'water', gb: 1, pb: 1 });
    expect(manual.target?.guildBuffOn).toBe(true);
    expect(manual.target?.titleBuffOn).toBe(true);
    const bare = buildInputsFromZ({ g: 1, te: 'water' }).target;
    expect(bare?.guildBuffOn).toBeUndefined();
    expect(bare?.titleBuffOn).toBeUndefined();
  });

  it('preset sans resolver → pas de cible (jamais de stats plausibles)', () => {
    expect(buildInputsFromZ({ ti: 'dg:400101' }).target).toBeUndefined();
  });
});

describe('buildInputsFromZ — compteurs § 9.1 (ob/od/ot · db/dd)', () => {
  it('déclarés > 0 : transmis bornés ; 0 ou absents : OMIS (contribution 0 sans clé)', () => {
    const { attacker, target } = buildInputsFromZ({
      a: '2000001',
      ob: 2,
      od: 1,
      ot: 999, // hors borne → clampé (Σ équipe, plafond 40)
      g: 1,
      te: 'water',
      db: 4,
      dd: 25, // hors borne mono-entité → clampé à 20
    });
    expect(attacker?.buffCount).toBe(2);
    expect(attacker?.debuffCount).toBe(1);
    expect(attacker?.teamBuffCount).toBe(40);
    expect(target?.buffCount).toBe(4);
    expect(target?.debuffCount).toBe(20);
    // Absents (ou 0 explicite, la valeur par défaut des steppers) : aucun
    // champ — l'entrée moteur reste identique à l'ère pré-compteurs.
    const bare = buildInputsFromZ({ a: '2000001', ob: 0, g: 1, te: 'water', dd: 0 });
    expect(bare.attacker?.buffCount).toBeUndefined();
    expect(bare.target?.debuffCount).toBeUndefined();
  });

  it('les compteurs cible transitent AUSSI en preset (tgtCommon)', () => {
    const { target } = buildInputsFromZ(
      { ti: 'dg:400101', dd: 3 },
      {
        resolvePreset: () => ({ element: 'CET_DARK', stats: { hp: 91080, def: 1200 } }),
      },
    );
    expect(target?.debuffCount).toBe(3);
  });
});

describe('buildInputsFromZ — équipement § 15 et hors périmètre signalés', () => {
  const z: CalculatorUrlState = {
    a: '2000001',
    w: 'sword',
    y: 3,
    m: 'ring',
    s: [['17', 1]],
    t: 1,
    eo: 0,
    n: 3,
    al: [['2000002', 0, '', 10, 1, 1]],
  };

  it('sans resolver de gear : arme/accessoire/talisman SIGNALÉS, jamais tus', () => {
    const { ignored, attacker, targetsHit } = buildInputsFromZ(z);
    expect(ignored.filter((l) => l.includes('non résolu'))).toHaveLength(3);
    // Alliés : BRANCHÉS (lot « buffs d'alliés », 23/08/2026) — l'entrée moteur
    // porte l'allié (EE +10 déclaré par défaut), plus jamais « hors v1 ».
    // Reste signalée : la main stat de talisman, sans consommateur en donnée.
    expect(ignored.some((l) => l.includes('hors v1'))).toBe(false);
    expect(attacker?.allies).toEqual([{ id: '2000002', transcendIndex: 0, ee: { enchant: 10 } }]);
    expect(targetsHit).toBe(3);
    // Stacks déclarés (z `ab`) : indépendants de `al` (les procs du PROPRE
    // kit de l'attaquant se déclarent aussi) — entrées invalides filtrées
    // (le plafond StackCount est côté moteur).
    const withStacks = buildInputsFromZ({
      ...z,
      ab: [
        ['2000117_2_5', 2],
        ['', 3],
        ['x', 0],
      ],
    });
    expect(withStacks.attacker?.buffStacks).toEqual({ '2000117_2_5': 2 });
    const noAlly = buildInputsFromZ({ a: '2000117', ab: [['2000117_2_5', 2]] });
    expect(noAlly.attacker?.buffStacks).toEqual({ '2000117_2_5': 2 });
    // Les sets ne dépendent d'aucun resolver (GroupID = id de set, jointure
    // 1:1) ; un seul set choisi = 4 pièces enchantées ; `eo: 0` = pas d'EE.
    expect(attacker?.gear).toEqual({
      sets: [{ groupId: '17', enchanted: true, pieces: 4 }],
    });
  });

  it('avec resolver : slugs → groupes + breakthrough, talisman = interrupteur', () => {
    const { ignored, attacker } = buildInputsFromZ(z, {
      resolveGear: (kind, slug) =>
        kind === 'talisman' && slug === 'rogues-charm'
          ? { groups: ['3025'] }
          : kind === 'weapon' && slug === 'sword'
            ? { groups: ['1008'] }
            : undefined,
    });
    expect(attacker?.gear?.weapon).toEqual({ groups: ['1008'], tier: 3 });
    expect(attacker?.gear?.roguesCharm).toEqual({ groups: ['3025'] });
    // L'accessoire ne se résout pas → signalé.
    expect(ignored.some((l) => l.includes('accessoire ring'))).toBe(true);
  });

  it('deux sets choisis = 2P chacun ; cible en break transite (bk)', () => {
    const r = buildInputsFromZ({
      a: '2000001',
      s: [
        ['17', 0],
        ['21', 1],
      ],
      g: 1,
      te: 'water',
      bk: 1,
    });
    expect(r.attacker?.gear?.sets).toEqual([
      { groupId: '17', enchanted: false, pieces: 2 },
      { groupId: '21', enchanted: true, pieces: 2 },
    ]);
    expect(r.target?.broken).toBe(true);
  });
});

describe('flattenReport', () => {
  const report = (branches: { branch: 'normal' | 'critical' | 'miss'; totalDamage: number }[][]) =>
    ({
      states: branches.map((bs, i) => ({
        chain: i === 0 ? 'base' : `chain${i}`,
        totalFactor: 0,
        expectedDamage: 0,
        branches: bs.map((b) => ({ ...b, probability: 1, damageRate: 0, hits: [] })),
      })),
      weaknessGaugeDamage: 0,
      defenderInvincible: false,
    }) as SkillReport;

  it('clés stables : burst en suffixe, état non-base en #chaîne', () => {
    const result: DamageReportResult = {
      combatStats: {},
      unresolvedFx: [],
      attackerAmountStats: [],
      slots: [
        {
          slot: 'S1',
          skillId: 'a',
          skillLevel: 5,
          report: report([[{ branch: 'normal', totalDamage: 100 }]]),
        },
        {
          slot: 'S2',
          skillId: 'b',
          burst: 1,
          skillLevel: 7,
          report: report([
            [
              { branch: 'normal', totalDamage: 200 },
              { branch: 'critical', totalDamage: 300 },
            ],
            [{ branch: 'normal', totalDamage: 400 }],
          ]),
        },
      ],
    };
    expect(flattenReport(result)).toEqual([
      { slot: 'S1', branch: 'normal', damage: 100 },
      { slot: 'S2b1#base', branch: 'normal', damage: 200 },
      { slot: 'S2b1#base', branch: 'critical', damage: 300 },
      { slot: 'S2b1#chain1', branch: 'normal', damage: 400 },
    ]);
  });
});

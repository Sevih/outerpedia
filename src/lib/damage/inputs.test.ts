/**
 * Amont pur (contrat debugState → entrées moteur) — rejoué sur les VRAIS
 * artefacts committés (`data/generated/damage/*.json`), comme le fera le test
 * des fixtures (harnais § 4). Les attendus sont des PROPRIÉTÉS dérivées des
 * primitives du moteur (identité § 16.1, catalogue FX sourcé) — jamais des
 * nombres recopiés d'un rendu.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import equipmentData from '../../../data/generated/damage/equipment.json';
import targetsData from '../../../data/generated/damage/targets.json';
import { applyStatEnhance, collectStatChannels } from './aggregate';
import { staticBossPassives } from './passives';
import { bossQuirkRates } from './gear';
import { resolvePresetTarget } from './preset-target';
import { buildDotLine, resistProbability } from './report';
import { getMonster } from '@/lib/data/monsters';
import { calcBaseStat } from './formula';
import {
  buildCombatStats,
  buildDamageReport,
  distinctDots,
  FX_CATALOG,
  dungeonModeOf,
  elementOf,
  eventMaxHpRate,
  isIgnoreResist,
  modifierAfter100For,
  resolveFx,
  trustBuffs,
  type AttackerBuildInput,
  type DamageData,
} from './inputs';
import { Element } from './types';

const data = {
  characters: charactersData,
  growth: growthData,
  buffs: buffsData,
} as unknown as DamageData;

/** Témoin : premier perso du roster avec bursts (kit complet S1/S2/S3). */
const CHAR_ID = '2000001';
const char = data.characters.characters[CHAR_ID];

/** Valeur d'un buff de la table au niveau `level` : l'attendu se LIT dans
 * buffs.json, pour qu'un rééquilibrage ne casse pas un test dont le code est
 * juste (les valeurs du jour figurent en commentaire). */
const lv = (id: string, level = 1): number => {
  const v = data.buffs.buffs[id]?.find((l) => l.level === level)?.value;
  expect(v, `${id} niveau ${level} absent de buffs.json`).toBeDefined();
  return v!;
};

/** Somme des plats de la chaîne d'affinité d'un perso jusqu'au niveau `level`,
 * lue dans characters.json et buffs.json (+60 ATK / +40 DEF / +300 PV par
 * ligne au 15/10/2026). */
const trustSum = (charId: string, level: number): number =>
  (data.characters.characters[charId].trust ?? [])
    .filter((l) => l.level <= level)
    .reduce((s, l) => s + data.buffs.buffs[l.buffId]![0].value!, 0);

/** Stat de la chaîne d'affinité d'un perso (`ST_HP`, `ST_ATK`, `ST_DEF`). */
const trustStatOf = (charId: string): string | undefined => {
  const first = data.characters.characters[charId].trust?.[0];
  return first ? data.buffs.buffs[first.buffId]![0].stat : undefined;
};

/** Premier perso dont la chaîne d'affinité porte `stat`. */
const charWithTrust = (stat: string): string =>
  Object.keys(data.characters.characters).find((id) => trustStatOf(id) === stat)!;

const attackerBase = (): AttackerBuildInput => ({
  id: CHAR_ID,
  level: 120,
  affinityLevel: 0,
  codexLevel: 0,
  skillLevels: {},
  sheet: { atk: 10000, critical_dmg: 1500 },
});

describe('inputs — référentiels', () => {
  it('éléments CET_* et slugs UI → enum du moteur', () => {
    expect(elementOf('CET_FIRE')).toBe(Element.Fire);
    expect(elementOf('water')).toBe(Element.Water);
    expect(elementOf('CET_INCONNU')).toBeUndefined();
  });

  it('palier post-100 : lu dans maxLevelSteps pour (élément, étoiles, niveau)', () => {
    expect(modifierAfter100For(char, 100, data.growth)).toBe(0);
    const at120 = modifierAfter100For(char, 120, data.growth);
    expect(at120).toBeGreaterThan(0); // palier 3 réel du jeu (700 ‰ en 1.4.9)
    const at103 = modifierAfter100For(char, 103, data.growth);
    expect(at103).toBeGreaterThan(0);
    expect(at103).toBeLessThan(at120);
  });
});

describe('inputs — affinité et chips', () => {
  // Affinité (revue H1, 15/10/2026) : le client (`CreateTrustBuff`) ne pose
  // que la chaîne DU perso, lignes de niveau requis ≤ niveau d'affinité.
  const chars = data.characters.characters;
  const trustOf = (id: string, level: number, mode?: string) =>
    trustBuffs(level, chars[id], data.buffs, mode);

  it('trustBuffs : la chaîne du perso seule, une stat, plats RÉSOLUS depuis buffs.json', () => {
    // Rhona (2000008) : chaîne PV — ni ATK ni DEF.
    const rhona = trustOf('2000008', 100);
    expect(rhona.length).toBe(chars['2000008'].trust!.length);
    expect(new Set(rhona.map((b) => b.stat))).toEqual(new Set(['ST_HP']));
    expect(rhona.reduce((s, b) => s + (b.value ?? 0), 0)).toBe(trustSum('2000008', 100));
    expect(rhona.every((b) => b.applyingType === 'OAT_ADD')).toBe(true);
    expect(trustOf('2000008', 0)).toEqual([]);
  });

  it('trustBuffs : Snow PV, Snow fusionné ATK — chacun sa chaîne', () => {
    expect(trustStatOf('2000003')).toBe('ST_HP');
    expect(trustStatOf('2700003')).toBe('ST_ATK');
    expect(new Set(trustOf('2700003', 100).map((b) => b.stat))).toEqual(new Set(['ST_ATK']));
  });

  it('trustBuffs : un perso sans ligne d’affinité ne reçoit rien', () => {
    // Bell Cranel, Ais Wallenstein, Ryu Lion : aucune ligne au 15/10/2026.
    const none = Object.keys(chars).find((id) => !chars[id].trust?.length)!;
    expect(none).toBeDefined();
    expect(trustOf(none, 100)).toEqual([]);
  });

  it('trustBuffs : niveau requis comparé au NIVEAU saisi (59 = les lignes 20 et 40)', () => {
    const lines = chars['2000008'].trust!;
    expect(trustOf('2000008', 59)).toHaveLength(lines.filter((l) => l.level <= 59).length);
    expect(trustOf('2000008', 59)).toHaveLength(2);
    expect(trustOf('2000008', 19)).toHaveLength(0);
  });

  it('trustBuffs : rien en Monad Gate (monad_battle_1), la chaîne en Singularity', () => {
    expect(trustOf('2000008', 100, 'monad_battle_1')).toEqual([]);
    expect(trustOf('2000008', 100, 'monad_battle_2')).toEqual(trustOf('2000008', 100));
    expect(trustOf('2000008', 100, 'monad_battle_2').length).toBeGreaterThan(0);
  });

  it('resolveFx : magnitudes standard ; sans standard → unresolved, jamais deviné', () => {
    const { buffs, unresolved } = resolveFx(['atk', 't_marked', 't_dmg_taken', 'def_down']);
    expect(buffs).toEqual([
      { type: 'BT_STAT', stat: 'ST_ATK', applyingType: 'OAT_RATE', value: 300, tooltipId: 7 },
      { type: 'BT_MARKING' },
      {
        type: 'BT_STAT',
        stat: 'ST_DEF',
        applyingType: 'OAT_RATE',
        value: -500,
        tooltipId: 17,
        debuff: true,
      },
    ]);
    expect(unresolved).toEqual(['t_dmg_taken']);
  });
});

describe('inputs — stats de combat (§ 16.1)', () => {
  it('sans buffs, combat === fiche, quel que soit le Codex (le terme A s’annule)', () => {
    const a = attackerBase();
    expect(buildCombatStats(a, char, data.growth, []).atk).toBe(10000);
    a.codexLevel = 11;
    expect(buildCombatStats(a, char, data.growth, []).atk).toBe(10000);
  });

  it('l’affinité s’ajoute en plat AVANT le multiplicateur ; le Codex reste hors multiplicateur', () => {
    const a = attackerBase();
    a.codexLevel = 11;
    // Chaîne ATK d'un perso qui la porte (les plats ne dépendent que de la
    // chaîne ; la fiche et la base restent celles du témoin).
    const atkChar = charWithTrust('ST_ATK');
    const trust = trustBuffs(100, data.characters.characters[atkChar], data.buffs);
    // Plats seuls : +300 ATK (5 × 60), indépendant du terme Codex.
    const flat = trustSum(atkChar, 100);
    expect(buildCombatStats(a, char, data.growth, trust).atk).toBe(10000 + flat);
    // Avec un chip +30 % : l'identité § 16.1 exacte, A recalculé de la donnée.
    const chip = resolveFx(['atk']).buffs;
    const codexRow = data.growth.archive.find((r) => r.level === 11)!;
    const base = calcBaseStat(
      char.baseStats.Atk.min,
      char.baseStats.Atk.max,
      120,
      modifierAfter100For(char, 120, data.growth),
    );
    const A = Math.trunc((base * codexRow.atkRate) / 1000);
    const expected = Math.trunc(((10000 - A + flat) * 1300) / 1000) + A;
    expect(buildCombatStats(a, char, data.growth, [...trust, ...chip]).atk).toBe(expected);
  });
});

describe('inputs — buildDamageReport', () => {
  const target = () => ({
    element: 'earth',
    stats: { hp: 500000, def: 2000, dmgRed: 0, cdmgRed: 0 },
    boss: true,
  });

  it('kit complet : S1/S2/S3 + les 3 états burst rattachés au slot du BURSTABLE', () => {
    const result = buildDamageReport(attackerBase(), target(), data);
    const keys = result.slots.map((s) => `${s.slot}${s.burst ? `b${s.burst}` : ''}`);
    expect(keys).toEqual(['S1', 'S2', 'S3', 'S2b1', 'S2b2', 'S2b3']);
    // Niveau par défaut = max du skill ; les bursts suivent le niveau du
    // burstable (`burstAP` — garde datagen : niveaux alignés sur tout le roster).
    for (const s of result.slots) expect(s.skillLevel).toBeGreaterThan(0);
    expect(result.unresolvedFx).toEqual([]);
    // Normal et crit sont TOUJOURS émis (les dégâts d'une branche ne
    // dépendent pas de sa probabilité) : sans CHC saisie, P(crit) = 0 mais
    // la valeur reste affichable. Le miss n'existe qu'avec un buff de
    // « miss chance » — absent par défaut.
    for (const s of result.slots) {
      for (const st of s.report.states) {
        expect(st.branches.map((b) => b.branch)).toEqual(['normal', 'critical']);
        expect(st.branches[0].probability).toBe(1);
        expect(st.branches[1].probability).toBe(0);
        for (const b of st.branches) expect(b.totalDamage).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('burstable au S1 (Caren 2000089) : les bursts se rattachent au S1, pas au S2', () => {
    // Le cas qui a montré le bug (Sevih 18/08/2026 — « la table result
    // affiche S2 B1… ») : `burstAP` vit sur son S1 (8901), les déclinaisons
    // 8919/8920/8921 doivent suivre.
    const result = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(), data);
    const keys = result.slots.map((s) => `${s.slot}${s.burst ? `b${s.burst}` : ''}`);
    expect(keys).toEqual(['S1', 'S2', 'S3', 'S1b1', 'S1b2', 'S1b3']);
    expect(result.dataIssues).toBeUndefined();
  });

  it('bursts au NIVEAU du burstable : S1 saisi = niveau des lignes burst, pas le S2', () => {
    const result = buildDamageReport(
      { ...attackerBase(), id: '2000089', skillLevels: { S1: 2, S2: 5 } },
      target(),
      data,
    );
    const bursts = result.slots.filter((s) => s.burst !== undefined);
    expect(bursts).toHaveLength(3);
    for (const b of bursts) expect(b.skillLevel).toBe(2);
  });

  it('bursts SANS marqueur burstAP : lignes omises et SIGNALÉES, jamais un slot supposé', () => {
    // Artefact antérieur à l'extraction du marqueur (ou RequireAP inattendu) :
    // rejouer « toujours S2 » calculerait faux en silence pour les 60 persos
    // burst-S1 — le moteur préfère omettre et le dire (revue 18/08/2026).
    const stripped = {
      ...data,
      characters: {
        ...data.characters,
        skills: Object.fromEntries(
          Object.entries(data.characters.skills).map(([id, s]) => {
            if (!s.burstAP) return [id, s];
            const rest = { ...s };
            delete rest.burstAP;
            return [id, rest];
          }),
        ),
      },
    } as DamageData;
    const result = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(), stripped);
    expect(result.slots.map((s) => s.slot)).toEqual(['S1', 'S2', 'S3']);
    expect(result.dataIssues).toHaveLength(1);
    expect(result.dataIssues![0]).toContain('burstAP');
  });

  it('l’élément joue : cible avec avantage subit plus que cible qui domine', () => {
    const vsEarth = buildDamageReport(attackerBase(), target(), data); // feu > terre
    const vsWater = buildDamageReport(attackerBase(), { ...target(), element: 'water' }, data);
    const total = (r: typeof vsEarth) => r.slots[0].report.states[0].branches[0].totalDamage;
    expect(total(vsEarth)).toBeGreaterThan(total(vsWater));
  });

  it('chips cible non standard → unresolvedFx remonté, le calcul continue', () => {
    const result = buildDamageReport(
      { ...attackerBase(), fx: ['atk'] },
      { ...target(), fx: ['t_dmg_taken', 't_def_down'] },
      data,
    );
    expect(result.unresolvedFx).toEqual(['t_dmg_taken']);
    expect(result.slots.length).toBeGreaterThan(0);
  });

  it('avec { trace: true } : chaque branche porte sa trace, § 8.3 en dernier', () => {
    const result = buildDamageReport(attackerBase(), target(), data, { trace: true });
    const branch = result.slots[0].report.states[0].branches[0];
    expect(branch.trace?.at(-1)).toMatchObject({ ref: '§ 8.3', out: branch.totalDamage });
  });

  it('un buff référencé par PLUSIEURS skills entre UNE fois (dédup — un templet, une instance)', () => {
    // Eris : 2000117_2_4 est référencé par le S2 (11702) ET le S3 (11703) —
    // avant la dédup, chaque référence redevenait une entrée et les slots
    // multi-callers comptaient double (revue 18/08/2026).
    const eris = buildDamageReport({ ...attackerBase(), id: '2000117' }, target(), data);
    expect(eris.kitPassives!.entries.filter((e) => e.buffId === '2000117_2_4')).toHaveLength(1);
    // Rhona : 2000008_1_4 (BT_DMG_TO_BOSS +500 ‰) référencé par S1/S2/S3 —
    // compté TROIS fois avant (+1500 ‰ vs boss).
    const rhona = buildDamageReport({ ...attackerBase(), id: '2000008' }, target(), data);
    expect(rhona.kitPassives!.entries.filter((e) => e.buffId === '2000008_1_4')).toHaveLength(1);
    // Caren : 2000089_u_1_2 (BT_DMG +300 ‰, callers B1/B2) référencé par les
    // deux skills burst — les lignes B1/B2 recevaient +600 ‰.
    const caren = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(), data);
    expect(caren.kitPassives!.entries.filter((e) => e.buffId === '2000089_u_1_2')).toHaveLength(1);
  });
});

describe('inputs — procs SKILL_START au lanceur (captures 18/08/2026)', () => {
  const target = (boss: boolean) => ({
    element: 'earth',
    stats: { hp: 500000, def: 2000, dmgRed: 0, cdmgRed: 0 },
    boss,
  });
  const dmg = (r: ReturnType<typeof buildDamageReport>, key: string, branch = 'normal') => {
    const s = r.slots.find((x) => `${x.slot}${x.burst ? `b${x.burst}` : ''}` === key);
    return s?.report.states[0].branches.find((b) => b.branch === branch)?.totalDamage ?? 0;
  };

  it('Rhona (2000008) : +300 ‰ pierce TARGET_IS_BOSS — le S1 tape PLUS un boss qu’un non-boss', () => {
    // Le proc `2000008_passive_3` (SKILL_START, porté par le passif de classe,
    // caller SKT_ALL, condition TARGET_IS_BOSS) pèse sur tous ses skills face
    // à un boss — PROUVÉ à 0.00 % par la fixture rhona-meteos. Ici, même
    // scénario boss/non-boss : seul le pierce (et le BT_DMG_TO_BOSS) bougent.
    const rhona = () => ({ ...attackerBase(), id: '2000008', sheet: { atk: 3000, hp: 20000 } });
    const vsBoss = buildDamageReport(rhona(), target(true), data);
    const vsMob = buildDamageReport(rhona(), target(false), data);
    expect(dmg(vsBoss, 'S1')).toBeGreaterThan(dmg(vsMob, 'S1'));
    // Son autre proc SKILL_START (`2000008_passive` : crit rate -100 %) est
    // inconditionnel : Rhona ne crit JAMAIS — P(crit) = 0 sur toute ligne.
    for (const s of vsBoss.slots) {
      for (const st of s.report.states) {
        const crit = st.branches.find((b) => b.branch === 'critical');
        expect(crit?.probability ?? 0).toBe(0);
      }
    }
  });

  it('Caren (2000089) : le pierce du proc 2000089_3_1 pèse sur S3/B2 SEULS — B2 > B1, B1 = S1-facteur', () => {
    // La donnée (buffIds de 8903/8920/8921) et la mesure (ratio B2/B1 exact)
    // disent la même chose : le +300 ‰ pierce vit au lancement du S3, du B2
    // et du B3 — jamais sur S1/B1.
    const caren = () => ({
      ...attackerBase(),
      id: '2000089',
      sheet: { atk: 2070, def: 5631, critical_dmg: 2400, pierce_power_rate: 110 },
    });
    const r = buildDamageReport(caren(), target(true), data);
    // B1 et B2 partagent facteur et niveaux : SEUL le pierce les sépare.
    expect(dmg(r, 'S1b2', 'critical')).toBeGreaterThan(dmg(r, 'S1b1', 'critical'));
  });

  it('facteur total § 8.1 : le S1 de Caren est résolu par son CLIP — 300 ‰ joué deux fois + 400 ‰', () => {
    // Les tables somment 700 ‰, le jeu frappe 1000 ‰ (mesuré 18/08/2026) : le
    // clip 2000089_Skill_01 rejoue le hit 1_1 (AnimationEvents extraits,
    // 22/08/2026) — plus de comblement heuristique, la séquence fait foi.
    const r = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(true), data);
    const state = (key: string) =>
      r.slots.find((x) => `${x.slot}${x.burst ? `b${x.burst}` : ''}` === key)!.report.states[0];
    expect(state('S1').totalFactor).toBe(1000);
    expect(state('S1').factorFilled).toBeUndefined();
    expect(state('S1').clips).toEqual([{ name: '2000089_Skill_01', totalFactor: 1000 }]);
    expect(state('S3').totalFactor).toBe(1000);
    expect(state('S3').factorFilled).toBeUndefined();
  });

  it('facteur total § 8.1 : un arrondi de répartition (999 = 3×333) est servi BRUT par le clip', () => {
    // Le S2 de Noa frappe 999 ‰ EXACT en jeu (mesuré 22/08/2026) : son clip
    // unique somme 999 — aucun comblement.
    const r = buildDamageReport({ ...attackerBase(), id: '2000022' }, target(true), data);
    const s2 = r.slots.find((x) => x.slot === 'S2' && x.burst === undefined)!.report.states[0];
    expect(s2.totalFactor).toBe(999);
    expect(s2.factorFilled).toBeUndefined();
    expect(s2.clips?.[0]?.totalFactor).toBe(999);
  });

  it('§ 8.1 par clip : le S2 de Francesca fait DEUX cascades (700 ‰ puis 300 ‰), pas une', () => {
    // Mesures 22/08/2026 : 10202 normal et 22028 crit, exacts UNIQUEMENT en
    // cascade(700) + cascade(300) — le S2 se joue en deux clips. Témoin
    // structurel : le total de la ligne diffère de CalcDamageCore(1000)
    // qu'aurait donné une cascade unique.
    const r = buildDamageReport({ ...attackerBase(), id: '2000015' }, target(true), data);
    const s2 = r.slots.find((x) => x.slot === 'S2' && x.burst === undefined)!.report.states[0];
    expect(s2.clips).toEqual([
      { name: '2000015_Skill_2_1', totalFactor: 700 },
      { name: '2000015_Skill_2_2', totalFactor: 300 },
    ]);
    // Le burst du S2 (trigger Burst1 → clip unique Skill_2_Upgrade) refait UNE
    // cascade de 1000 ‰ : même chaîne de hits, découpage différent.
    const b1 = r.slots.find((x) => x.slot === 'S2' && x.burst === 1)!.report.states[0];
    expect(b1.clips).toEqual([{ name: '2000015_Skill_2_Upgrade', totalFactor: 1000 }]);
  });

  it('DoT du kit : le S2 de Francesca porte sa ligne Bleed (tick § 11, pose certaine)', () => {
    const r = buildDamageReport({ ...attackerBase(), id: '2000015' }, target(true), data);
    const s2 = r.slots.find((x) => x.slot === 'S2' && x.burst === undefined)!;
    const bleed = s2.dots?.find((d) => d.buffId === '2000015_2_1');
    expect(bleed?.type).toBe('BT_DOT_BLEED');
    expect(bleed?.tooltipId).toBe(3); // jointure glossaire (icône/nom UI)
    expect(bleed?.damagePerTick ?? 0).toBeGreaterThan(0);
    // DEBUFF_IGNORE_RESIST + CreateRate 1000 : pose certaine, sans jet § 5.
    expect(bleed?.applyProbability).toBe(1);
    expect(bleed?.turnDuration).toBe(2);
    // Le S3 ne pose pas de DoT — pas de ligne inventée.
    expect(r.slots.find((x) => x.slot === 'S3')!.dots).toBeUndefined();
    // Poses MULTIPLES d'un même skill : le tick ne les cumule JAMAIS
    // (mesure discriminante EE on/off du 24/08/2026 — le popup est le tick
    // UNITAIRE × enhance, pas × poses). Les BURSTS posent DEUX Bleeds
    // (2000015_2_1 + 2000015_u_1) : une seule ligne, même tick que la pose
    // simple — distinctDots fusionne donc tout en UNE ligne.
    const burst = r.slots.find((x) => x.slot === 'S2' && x.burst === 1)!;
    const burstBleed = burst.dots?.find((d) => d.buffId === '2000015_2_1');
    expect(burstBleed?.damagePerTick).toBe(bleed?.damagePerTick ?? 0);
    expect(burst.dots?.filter((d) => d.type === 'BT_DOT_BLEED')).toHaveLength(1);
    const distinct = distinctDots(r.slots);
    expect(distinct).toHaveLength(1);
    expect(distinct[0].buffId).toBe('2000015_1_1');
  });

  it('poses multiples du S1 de Gnosis Beth : UNE ligne, tick unitaire, stable avec ou sans alliés', () => {
    // Les 2 lignes de pose du S1 (2000092_1_1 + _1_2 OWNER_ALONE) fusionnent
    // sans cumul — 3 mesures du 24/08/2026 : tick = EFF × 700 % × enhance,
    // jamais × poses. Et la fusion ne dépend pas de l'équipe déclarée.
    const beth = (allies?: { id: string }[]) => ({
      ...attackerBase(),
      id: '2000092',
      sheet: { atk: 4580, buff_chance: 636 },
      ...(allies ? { allies } : {}),
    });
    const tickOf = (r: ReturnType<typeof buildDamageReport>) =>
      r.slots
        .find((x) => x.slot === 'S1' && x.burst === undefined)!
        .dots?.filter((d) => d.type === 'BT_DOT_2000092');
    const solo = tickOf(buildDamageReport(beth(), target(true), data));
    const withAlly = tickOf(buildDamageReport(beth([{ id: '2000117' }]), target(true), data));
    expect(solo).toHaveLength(1);
    expect(withAlly).toHaveLength(1);
    expect(withAlly![0].damagePerTick).toBe(solo![0].damagePerTick);
  });

  it('débuff au LANCEMENT côté cible (Rhona 2000008_3_3 : DEF -50 % au S3) — le canal par slot baisse la DEF de SA ligne', () => {
    // Même scénario, S3 vs S1 : la ligne S3 se calcule contre une DEF
    // réduite de moitié — un ratio S3/S1 nettement au-dessus du seul écart
    // de facteur de skill. Témoin directionnel : la DEF slot ne fuit pas
    // sur les autres lignes (le S1 garde la DEF pleine).
    const rhona = () => ({ ...attackerBase(), id: '2000008', sheet: { atk: 3000, hp: 20000 } });
    const full = buildDamageReport(rhona(), target(true), data);
    // Repère : le MÊME kit privé du débuff (clone), face à une cible dont la
    // DEF est déjà divisée par deux — son S3 doit coïncider avec celui du
    // rapport complet (le canal par slot fait exactement cette division), et
    // son S1 face à la DEF pleine doit coïncider aussi (le débuff ne FUIT
    // pas hors de sa ligne).
    const stripped = {
      ...data,
      characters: {
        ...data.characters,
        skills: {
          ...data.characters.skills,
          '803': {
            ...data.characters.skills['803'],
            levels: data.characters.skills['803'].levels.map((l) => ({
              ...l,
              buffIds: l.buffIds.filter((b) => b !== '2000008_3_3'),
            })),
          },
        },
      },
    } as DamageData;
    const refHalved = buildDamageReport(
      rhona(),
      { ...target(true), stats: { ...target(true).stats, def: 1000 } },
      stripped,
    );
    const refFull = buildDamageReport(rhona(), target(true), stripped);
    expect(dmg(full, 'S3')).toBe(dmg(refHalved, 'S3'));
    expect(dmg(full, 'S1')).toBe(dmg(refFull, 'S1'));
  });
});

describe('inputs — compteurs § 9.1 (buffs/débuffs déclarés)', () => {
  const target = () => ({
    element: 'earth',
    stats: { hp: 500000, def: 2000, dmgRed: 0, cdmgRed: 0 },
    boss: true,
  });
  const damages = (r: ReturnType<typeof buildDamageReport>) =>
    Object.fromEntries(
      r.slots.map((s) => [
        `${s.slot}${s.burst ? `b${s.burst}` : ''}`,
        s.report.states[0].branches[0].totalDamage,
      ]),
    );

  it('Eris (2000117_2_4, ×débuffs de la CIBLE, callers S2/S3) : n=3 > n=0 sur S2/S3 SEULS', () => {
    const eris = () => ({ ...attackerBase(), id: '2000117' });
    const n0 = damages(buildDamageReport(eris(), target(), data));
    const n3 = damages(buildDamageReport(eris(), { ...target(), debuffCount: 3 }, data));
    expect(n3.S2).toBeGreaterThan(n0.S2);
    expect(n3.S3).toBeGreaterThan(n0.S3);
    // S1 hors callers : invariant. Les BURSTS aussi : le CSV du jeu ne liste
    // que SKT_SECOND,SKT_ULTIMATE — fidélité à la donnée, jamais élargi.
    expect(n3.S1).toBe(n0.S1);
    expect(n3.S2b1).toBe(n0.S2b1);
    expect(n3.S2b3).toBe(n0.S2b3);
  });

  it('H. Dianne (2000093_3_1, ×Σ buffs de l’ÉQUIPE, caller S3) : teamBuffCount ne pèse que sur le S3', () => {
    const hdianne = () => ({ ...attackerBase(), id: '2000093' });
    const n0 = damages(buildDamageReport(hdianne(), target(), data));
    const n4 = damages(buildDamageReport({ ...hdianne(), teamBuffCount: 4 }, target(), data));
    expect(n4.S3).toBeGreaterThan(n0.S3);
    expect(n4.S1).toBe(n0.S1);
    expect(n4.S2).toBe(n0.S2);
  });

  it('compteurs absents = familles à 0 : aucun défaut deviné', () => {
    // Même scénario avec compteurs explicitement à 0 : rapport identique.
    const eris = () => ({ ...attackerBase(), id: '2000117' });
    const absent = damages(buildDamageReport(eris(), target(), data));
    const zeroed = damages(
      buildDamageReport(
        { ...eris(), buffCount: 0, debuffCount: 0, teamBuffCount: 0 },
        { ...target(), buffCount: 0, debuffCount: 0 },
        data,
      ),
    );
    expect(zeroed).toEqual(absent);
  });
});

describe('inputs — buffs MAX_HP (§ 16.2 : guilde + titre)', () => {
  // Les taux (+15 % guilde Lv 10, +5 % titre en 1.4.9) se lisent dans
  // growth.json ; leur valeur est gardée par damage-data.test.ts, ici on teste
  // le cumul et les modes.
  const GUILD = data.growth.guildMaxHp.find((t) => t.level === 10)!.maxHpValue;
  const TITLE = data.growth.titleMaxHp[0].maxHpValue;
  const withHp = (): AttackerBuildInput => ({
    ...attackerBase(),
    sheet: { atk: 10000, hp: 50000 },
    guildLevel: 10,
  });
  const target = () => ({ element: 'earth', stats: { hp: 500000, def: 2000 }, boss: true });
  const applied = (sum: number, hp: number) =>
    Math.floor(Math.fround(eventMaxHpRate(sum) * Math.fround(hp)));

  it('slug de mode → DUNGEON_MODE ; les 4 slugs story = DM_NORMAL (découpage site)', () => {
    expect(dungeonModeOf('normal')).toBe('DM_NORMAL');
    expect(dungeonModeOf('normal_hard')).toBe('DM_NORMAL');
    expect(dungeonModeOf('origin')).toBe('DM_NORMAL');
    expect(dungeonModeOf('origin_hard')).toBe('DM_NORMAL');
    expect(dungeonModeOf('raid_1')).toBe('DM_RAID_1');
    expect(dungeonModeOf('world_boss')).toBe('DM_WORLD_BOSS');
  });

  it('guilde seule, mode éligible : HP = floor(float32(rate × HP))', () => {
    const r = buildDamageReport(withHp(), { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff).toMatchObject({ sum: GUILD, hpBefore: 50000 }); // Lv 10 → 15
    expect(r.combatStats.hp).toBe(applied(GUILD, 50000));
  });

  it('guilde + titre CUMULÉS en Special Request (Σ = 15 + 5 = 20)', () => {
    const a = { ...withHp(), premiumHp: true };
    const r = buildDamageReport(a, { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff?.sum).toBe(GUILD + TITLE);
    expect(r.maxHpBuff?.parts.map((p) => [p.source, p.active])).toEqual([
      ['guild', true],
      ['title', true],
    ]);
    expect(r.combatStats.hp).toBe(applied(GUILD + TITLE, 50000));
  });

  it('les listes de modes DIFFÈRENT : tour normale = guilde seule, adventure = titre seul', () => {
    const a = { ...withHp(), premiumHp: true };
    const tower = buildDamageReport(a, { ...target(), mode: 'tower' }, data);
    expect(tower.maxHpBuff?.sum).toBe(GUILD); // guilde oui, titre non
    const adv = buildDamageReport(a, { ...target(), mode: 'adventure_mission' }, data);
    expect(adv.maxHpBuff?.sum).toBe(TITLE); // titre oui, guilde non
  });

  it('mode exclu des deux (world boss…) : Σ = 0, HP intact, parts signalées', () => {
    const a = { ...withHp(), premiumHp: true };
    for (const mode of ['world_boss', 'tower_hard', 'guild_raid_main_boss']) {
      const r = buildDamageReport(a, { ...target(), mode }, data);
      expect(r.maxHpBuff?.sum, mode).toBe(0);
      expect(r.combatStats.hp, mode).toBe(50000);
    }
  });

  it('cible manuelle : coches INDÉPENDANTES par buff', () => {
    const a = { ...withHp(), premiumHp: true };
    expect(buildDamageReport(a, target(), data).maxHpBuff?.sum).toBe(0);
    expect(buildDamageReport(a, { ...target(), guildBuffOn: true }, data).maxHpBuff?.sum).toBe(
      GUILD,
    );
    expect(buildDamageReport(a, { ...target(), titleBuffOn: true }, data).maxHpBuff?.sum).toBe(
      TITLE,
    );
    expect(
      buildDamageReport(a, { ...target(), guildBuffOn: true, titleBuffOn: true }, data).maxHpBuff
        ?.sum,
    ).toBe(GUILD + TITLE);
  });

  it('sans aucun réglage de compte : aucun bloc maxHpBuff, rien ne bouge', () => {
    const a = { ...withHp(), guildLevel: 0 };
    const r = buildDamageReport(a, { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff).toBeUndefined();
    expect(r.combatStats.hp).toBe(50000);
  });
});

describe('inputs — passifs d’ALLIÉS (kit + EE des membres déclarés)', () => {
  const dataEq = { ...data, equipment: equipmentData } as unknown as DamageData;
  const target = () => ({ element: 'earth', stats: { hp: 500000, def: 2000 }, boss: true });
  // Témoins RÉELS : Francesca 2000015 = CCT_ATTACKER (Striker), 2000004 =
  // CCT_MAGE ; l'EE d'Eris (BID_CEQUIP_2000117_2, ligne Lv1) donne
  // +500 ‰ crit dmg PREMIUM plat aux alliés Strikers (OWNER_CLASS = 2), l'EE
  // de 2000028 (BID_CEQUIP_2000028_3) +300 ‰ d'ATK aux alliés Mages.
  const francesca = (): AttackerBuildInput => ({ ...attackerBase(), id: '2000015' });

  it('EE d’Eris alliée + attaquant Striker : premium ACTIF via le canal buff (pas de défactorisation — il n’est pas dans la fiche saisie)', () => {
    const without = buildDamageReport(francesca(), target(), dataEq);
    const withAlly = buildDamageReport(
      { ...francesca(), allies: [{ id: '2000117', ee: { enchant: 0 } }] },
      target(),
      dataEq,
    );
    const entry = withAlly.allyPassives?.entries.find((e) => e.buffId === 'BID_CEQUIP_2000117_2');
    expect(entry).toMatchObject({
      ally: '2000117',
      source: 'ee',
      side: 'attacker',
      active: true,
      condition: 'OWNER_CLASS',
      buff: {
        type: 'BT_STAT_PREMIUM',
        stat: 'ST_CRITICAL_DMG_RATE',
        applyingType: 'OAT_ADD',
        value: lv('BID_CEQUIP_2000117_2'), // 500
      },
    });
    // Plat +500 ‰ dans le canal buff du crit dmg — multiplié par les taux du
    // canal (identité § 16.1, même terme croisé que trust × premiums : la
    // fiche de Francesca porte un taux crit dmg, le delta observé est 580).
    // Propriété stable : delta ≥ +500 (taux du canal jamais négatifs ici).
    expect(withAlly.combatStats.critical_dmg).toBeGreaterThanOrEqual(
      without.combatStats.critical_dmg + lv('BID_CEQUIP_2000117_2'),
    );
    // Le +20 % Strikers du S2 d'Eris (2000117_2_5, SKILL_FINISH, 3 stacks) :
    // DYNAMIQUE — signalé, jamais simulé.
    expect(withAlly.allyPassives?.dynamic.some((d) => d.buffId === '2000117_2_5')).toBe(true);
  });

  it('attaquant HORS classe : le premium gaté OWNER_CLASS est INACTIF, le dynamique par classe n’est pas signalé', () => {
    const mage = buildDamageReport(
      { ...attackerBase(), id: '2000004', allies: [{ id: '2000117', ee: { enchant: 0 } }] },
      target(),
      dataEq,
    );
    const entry = mage.allyPassives?.entries.find((e) => e.buffId === 'BID_CEQUIP_2000117_2');
    expect(entry?.active).toBe(false);
    // 2000117_2_5 cible MY_TEAM_ATTACKER (les Strikers) : un Mage n'est pas
    // atteignable — pas même une chip signalée.
    expect(mage.allyPassives?.dynamic.some((d) => d.buffId === '2000117_2_5')).toBe(false);
  });

  it('premium en TAUX (EE 2000028, +300 ‰ ATK aux Mages) : l’ATK de combat monte pour un attaquant Mage', () => {
    const mageBase = (): AttackerBuildInput => ({ ...attackerBase(), id: '2000004' });
    const without = buildDamageReport(mageBase(), target(), dataEq);
    const withAlly = buildDamageReport(
      { ...mageBase(), allies: [{ id: '2000028', ee: { enchant: 0 } }] },
      target(),
      dataEq,
    );
    const entry = withAlly.allyPassives?.entries.find((e) => e.buffId === 'BID_CEQUIP_2000028_3');
    expect(entry).toMatchObject({
      active: true,
      buff: {
        type: 'BT_STAT_PREMIUM',
        stat: 'ST_ATK',
        applyingType: 'OAT_RATE',
        value: lv('BID_CEQUIP_2000028_3'), // 300
      },
    });
    expect(withAlly.combatStats.atk).toBeGreaterThan(without.combatStats.atk);
  });

  it('allié SANS EE déclaré : aucune entrée `ee` — le kit reste résolu', () => {
    const r = buildDamageReport({ ...francesca(), allies: [{ id: '2000117' }] }, target(), dataEq);
    expect(r.allyPassives?.entries.some((e) => e.source === 'ee')).toBe(false);
    expect(r.allyPassives?.dynamic.some((d) => d.buffId === '2000117_2_5')).toBe(true);
  });

  it('sans allié déclaré : aucun bloc allyPassives', () => {
    expect(buildDamageReport(francesca(), target(), dataEq).allyPassives).toBeUndefined();
  });

  it('dynamique DÉCLARÉ (stacks) : valeur × stacks § 14.1, plafonné au StackCount de la ligne', () => {
    // Le +20 % Strikers d'Eris (2000117_2_5 : BT_DMG 200 ‰, StackCount 3) —
    // prouvé in-game 23/08/2026 : 1 S2 d'Eris = 1 stack, S1 de Francesca
    // exact (fixture francesca-eris-ally-s1-stack).
    const withStacks = (n?: Record<string, number>) =>
      buildDamageReport(
        {
          ...francesca(),
          allies: [{ id: '2000117' }],
          ...(n ? { buffStacks: n } : {}),
        },
        target(),
        dataEq,
      ).slots.find((s) => s.slot === 'S1' && s.burst === undefined)!.report.states[0].branches[0]
        .totalDamage;
    const base = withStacks();
    const one = withStacks({ '2000117_2_5': 1 });
    const three = withStacks({ '2000117_2_5': 3 });
    expect(one).toBeGreaterThan(base);
    expect(three).toBeGreaterThan(one);
    // Plafond : 99 déclarés = 3 servis (StackCount de la ligne).
    expect(withStacks({ '2000117_2_5': 99 })).toBe(three);
    // Un buffId inconnu du rapport ne pèse rien.
    expect(withStacks({ inconnu: 5 })).toBe(base);
  });

  it('le PROPRE kit de l’attaquant se déclare aussi : Eris (Striker) porte son +20 % — cible MY_TEAM_ATTACKER, classe évaluée', () => {
    // Eris attaque APRÈS son S2 : son 2000117_2_5 la couvre (elle est
    // CCT_ATTACKER) — même mécanique que côté allié, sans allié déclaré.
    const eris = (n?: Record<string, number>) =>
      buildDamageReport(
        { ...attackerBase(), id: '2000117', ...(n ? { buffStacks: n } : {}) },
        target(),
        dataEq,
      );
    const base = eris();
    // Le proc est SIGNALÉ déclarable (side attacker + plafond 3) dans le kit.
    const dyn = base.kitPassives?.dynamic.find((d) => d.buffId === '2000117_2_5');
    expect(dyn).toMatchObject({
      side: 'attacker',
      maxStacks: data.buffs.buffs['2000117_2_5']![0].stackCount, // 3
    });
    const dmg = (r: ReturnType<typeof eris>) =>
      r.slots.find((s) => s.slot === 'S1' && s.burst === undefined)!.report.states[0].branches[0]
        .totalDamage;
    expect(dmg(eris({ '2000117_2_5': 2 }))).toBeGreaterThan(dmg(base));
  });
});

describe('inputs — équipement d’ÉQUIPE (talisman / arme / accessoire, 24/08/2026)', () => {
  const dataEq = { ...data, equipment: equipmentData } as unknown as DamageData;
  const target = () => ({ element: 'earth', stats: { hp: 500000, def: 2000 }, boss: true });
  // Témoins RÉELS des tables : la main ATK du talisman 6★
  // (BID_ITEM_STAT_OOPARTS_ATK_6) = BT_STAT_PREMIUM MY_TEAM OAT_RATE,
  // 11 niveaux L1:120 ‰ → L11:150 ‰ (enchant +0..+10) ; l'accessoire 2025
  // (BID_ITEM_UO_ACC_25) = BT_DMG_TO_BOSS +100 ‰ cible MY_TEAM_WITHOUT_ME.
  const TAL_ATK = 'BID_ITEM_STAT_OOPARTS_ATK_6';

  it('talisman d’ALLIÉ : la main est un buff d’équipe — canal buff du receveur, montant au niveau d’enchant', () => {
    const without = buildDamageReport(attackerBase(), target(), dataEq);
    const at = (enchant: number) =>
      buildDamageReport(
        {
          ...attackerBase(),
          allies: [{ id: '2000117', talisman: { buffId: TAL_ATK, enchant } }],
        },
        target(),
        dataEq,
      );
    const plus10 = at(10);
    const entry = plus10.allyPassives?.entries.find((e) => e.buffId === TAL_ATK);
    expect(entry).toMatchObject({
      ally: '2000117',
      source: 'talisman',
      side: 'attacker',
      active: true,
      buff: {
        type: 'BT_STAT_PREMIUM',
        stat: 'ST_ATK',
        applyingType: 'OAT_RATE',
        value: lv(TAL_ATK, 11), // 150
      },
    });
    expect(plus10.combatStats.atk).toBeGreaterThan(without.combatStats.atk);
    // +0 : la ligne L1 (120 ‰) — le montant suit l'enchant déclaré.
    const plus0 = at(0).allyPassives?.entries.find((e) => e.buffId === TAL_ATK);
    expect(plus0?.buff.value).toBe(lv(TAL_ATK, 1));
  });

  it('accessoire d’ALLIÉ à ligne d’équipe (2025 : +10 % vs boss aux alliés) : atteint l’attaquant', () => {
    const without = buildDamageReport(attackerBase(), target(), dataEq);
    const withAlly = buildDamageReport(
      {
        ...attackerBase(),
        allies: [{ id: '2000117', amulet: { groups: ['2025'], tier: 0 } }],
      },
      target(),
      dataEq,
    );
    const entry = withAlly.allyPassives?.entries.find((e) => e.buffId === 'BID_ITEM_UO_ACC_25');
    expect(entry).toMatchObject({
      ally: '2000117',
      source: 'amulet',
      side: 'attacker',
      active: true,
      buff: { type: 'BT_DMG_TO_BOSS', value: lv('BID_ITEM_UO_ACC_25', 1) }, // 100
    });
    const dmg = (r: ReturnType<typeof buildDamageReport>) =>
      r.slots.find((s) => s.slot === 'S1' && s.burst === undefined)!.report.states[0].branches[0]
        .totalDamage;
    expect(dmg(withAlly)).toBeGreaterThan(dmg(without));
  });

  it('talisman du PORTEUR : dans la fiche, assiette PLEINE — ni premium défactorisé, ni buff', () => {
    // MESURÉ (Sevih 24/08/2026) : « la stat est appliquée de base sur la
    // fiche du perso qui le porte », ET la mesure Sterope +100 % EFF du même
    // jour (tick 1995 → 3990 = fiche × 2 TOUT ROND) prouve que le buff
    // multiplie la fiche COMPLÈTE, main de talisman incluse — une stat
    // d'ITEM, pas un premium du multiplicateur (fixture
    // gnosisbeth-scrapmetal-effbuff). Rien à collecter.
    const r = buildDamageReport(
      { ...attackerBase(), gear: { talismanMain: { buffId: TAL_ATK, enchant: 10 } } },
      target(),
      dataEq,
    );
    expect(r.gearPassives?.premium.some((p) => p.source === 'talisman')).toBe(false);
    expect(r.gearPassives?.entries.some((e) => e.buffId === TAL_ATK)).toBe(false);
  });

  it('stat NON saisie + buff d’équipe qui la vise : calculée sur base 0, jamais « hors calcul » (bug Sevih 24/08)', () => {
    // Repro : fiche sans dmg_boost (champ vide) + talisman DMG d'équipe
    // (BID_ITEM_STAT_OOPARTS_DMG_6, ST_DMG_BOOST OAT_ADD, L11 = 120 ‰) —
    // la stat finale doit exister à 12 %, pas rester « — ».
    const without = buildDamageReport(attackerBase(), target(), dataEq);
    expect(without.combatStats.dmg_boost).toBeUndefined();
    const withAlly = buildDamageReport(
      {
        ...attackerBase(),
        allies: [
          { id: '2000117', talisman: { buffId: 'BID_ITEM_STAT_OOPARTS_DMG_6', enchant: 10 } },
        ],
      },
      target(),
      dataEq,
    );
    expect(withAlly.combatStats.dmg_boost).toBe(lv('BID_ITEM_STAT_OOPARTS_DMG_6', 11)); // 120
  });

  it('NON-CUMUL des mains par stat (mesure Sevih 24/08) : la plus forte l’emporte, l’allié ne verse que l’excédent', () => {
    const withTal = (
      porteur: number | undefined,
      allies: { id: string; enchant: number }[],
    ): ReturnType<typeof buildDamageReport> =>
      buildDamageReport(
        {
          ...attackerBase(),
          ...(porteur !== undefined
            ? { gear: { talismanMain: { buffId: TAL_ATK, enchant: porteur } } }
            : {}),
          allies: allies.map((a) => ({
            id: a.id,
            talisman: { buffId: TAL_ATK, enchant: a.enchant },
          })),
        },
        target(),
        dataEq,
      );
    // Porteur +10 (150) > allié +0 (120) : l'entrée alliée est DÉSACTIVÉE —
    // l'ATK de combat est celui du porteur seul.
    const strongOwner = withTal(10, [{ id: '2000117', enchant: 0 }]);
    const ownerOnly = buildDamageReport(
      { ...attackerBase(), gear: { talismanMain: { buffId: TAL_ATK, enchant: 10 } } },
      target(),
      dataEq,
    );
    expect(strongOwner.allyPassives?.entries.find((e) => e.buffId === TAL_ATK)?.active).toBe(false);
    expect(strongOwner.combatStats.atk).toBe(ownerOnly.combatStats.atk);
    // Porteur +0 (120) < allié +10 (150) : l'allié ne verse que l'EXCÉDENT
    // (30 ‰) — pas les 150 pleins.
    const strongAlly = withTal(0, [{ id: '2000117', enchant: 10 }]);
    expect(strongAlly.allyPassives?.entries.find((e) => e.buffId === TAL_ATK)?.buff.value).toBe(
      lv(TAL_ATK, 11) - lv(TAL_ATK, 1), // 30
    );
    // Deux ALLIÉS sur la même stat : seul le plus fort compte.
    const twoAllies = withTal(undefined, [
      { id: '2000117', enchant: 10 },
      { id: '2000028', enchant: 0 },
    ]);
    const actives = twoAllies.allyPassives?.entries.filter((e) => e.buffId === TAL_ATK && e.active);
    expect(actives).toHaveLength(1);
    expect(actives?.[0]).toMatchObject({ ally: '2000117', buff: { value: lv(TAL_ATK, 11) } });
    const oneAlly = withTal(undefined, [{ id: '2000117', enchant: 10 }]);
    expect(twoAllies.combatStats.atk).toBe(oneAlly.combatStats.atk);
  });
});

describe('inputs — renfort ENHANCE (§ 14.1, revue M4)', () => {
  const dataAll = {
    ...data,
    equipment: equipmentData,
    targets: targetsData,
  } as unknown as DamageData;
  const BELL = '2000095'; // T8 `trancendent_8_buff_enhance_up` (ME, +1000)
  const SAERAN = '2000129'; // S3 `2000129_3_3` (MY_TEAM_WITHOUT_ME, au lancement)
  const tgt = () => ({ element: 'CET_WATER', stats: { hp: 1000000, def: 1000 } });
  const bossEntry = (monsterId: string, buffId: string) =>
    staticBossPassives(monsterId, dataAll.targets!, data.buffs)!.entries.find(
      (e) => e.buffId === buffId,
    )!;

  it('chip ATK sous le T8 de Bell Cranel : 2 × 300 ‰ sur le canal de stat', () => {
    const r = buildDamageReport({ ...attackerBase(), id: BELL, fx: ['atk'] }, tgt(), dataAll);
    const t8 = r.kitPassives!.entries.find((e) => e.buffId === 'trancendent_8_buff_enhance_up');
    expect(t8).toMatchObject({ side: 'attacker', active: true });
    const chip = FX_CATALOG.atk!;
    expect(collectStatChannels([chip, t8!.buff]).ST_ATK.rate).toBe(2 * chip.value!);
  });

  it('t_def_down contre un boss à DEBUFF_ENHANCE +1000 : 2 × −500 ‰', () => {
    // 40103013 : passif 125124 → 4500153_4_2 (ME, DEBUFF_ENHANCE +1000).
    const enh = bossEntry('40103013', '4500153_4_2');
    expect(enh.side).toBe('defender');
    const down = FX_CATALOG.t_def_down!;
    expect(applyStatEnhance([down], [enh.buff])[0].value).toBe(2 * down.value!);
  });

  it('BUFF_ENHANCE −3000 d’un boss (4086032_4_2) INVERSE ses buffs visibles', () => {
    const enh = bossEntry('4086036', '4086032_4_2');
    expect(enh).toMatchObject({ side: 'defender', buff: { value: -3000 } });
    const up = FX_CATALOG.t_def!;
    expect(applyStatEnhance([up], [enh.buff])[0].value).toBe(-2 * up.value!);
  });

  it('ENHANCE d’un boss sur ENEMY_TEAM (4500347_4_2) : côté attaquant ; OWNER_ELEMENT non résolu', () => {
    expect(bossEntry('4500347', '4500347_4_2').side).toBe('attacker');
    const st = staticBossPassives('4086031', dataAll.targets!, data.buffs)!;
    expect(st.unresolved.some((u) => u.buffId === '4086031_6_3')).toBe(true);
  });

  it('S3 de Demiurge Saeran alliée, coché : les buffs visibles de l’attaquant doublent', () => {
    const run = (fx: string[], declared: boolean) =>
      buildDamageReport(
        {
          ...attackerBase(),
          fx,
          allies: [{ id: SAERAN }],
          ...(declared ? { buffStacks: { '2000129_3_3': 1 } } : {}),
        },
        tgt(),
        dataAll,
      );
    const proc = run([], false).allyPassives!.dynamic.find((d) => d.buffId === '2000129_3_3');
    expect(proc).toMatchObject({ side: 'attacker', buff: { type: 'BT_STAT_BUFF_ENHANCE' } });
    const gain = (declared: boolean) =>
      run(['atk'], declared).combatStats.atk - run([], declared).combatStats.atk;
    expect(Math.abs(gain(true) - 2 * gain(false))).toBeLessThanOrEqual(1);
  });

  it('deux ENHANCE de même polarité sur l’attaquant : non résolus, contribution 0', () => {
    const r = buildDamageReport(
      {
        ...attackerBase(),
        id: BELL,
        fx: ['atk'],
        allies: [{ id: SAERAN }],
        buffStacks: { '2000129_3_3': 1 },
      },
      tgt(),
      dataAll,
    );
    const reasons = [...r.kitPassives!.unresolved, ...r.allyPassives!.unresolved]
      .filter((u) => u.buffId === 'trancendent_8_buff_enhance_up' || u.buffId === '2000129_3_3')
      .map((u) => u.reason);
    expect(reasons).toHaveLength(2);
    expect(reasons.every((x) => x.includes('ordre de pose inconnu'))).toBe(true);
    expect(r.kitPassives!.entries.some((e) => e.buff.type === 'BT_STAT_BUFF_ENHANCE')).toBe(false);
    // Sans renfort : la chip compte pour sa valeur, comme chez un perso sans ENHANCE.
    const bare = buildDamageReport(
      { ...attackerBase(), id: BELL, fx: ['atk'], transcendIndex: 0 },
      tgt(),
      dataAll,
    );
    expect(
      bare.kitPassives!.entries.some((e) => e.buffId === 'trancendent_8_buff_enhance_up'),
    ).toBe(false);
  });
});

describe('inputs — familles CASTER posées par un allié (§ 9.1, revue R18)', () => {
  const dataEq = { ...data, equipment: equipmentData } as unknown as DamageData;
  const W22 = 'BID_ITEM_UO_WEAPON_22'; // DEF du porteur, MY_TEAM_WITHOUT_ME
  const run = (def: number, ally: boolean) =>
    buildDamageReport(
      {
        ...attackerBase(),
        id: '2000015',
        sheet: { atk: 5000, critical_dmg: 1500, def },
        ...(ally ? { allies: [{ id: '2000008', weapon: { groups: ['1022'], tier: 4 } }] } : {}),
      },
      { element: 'CET_WATER', stats: { hp: 1000000, def: 1000 } },
      dataEq,
    );
  const total = (r: ReturnType<typeof run>) => r.slots[0].report.states[0].branches[0].totalDamage;

  it('allié porteur : non résolu, contribution 0 — la DEF de l’attaquant ne pèse plus', () => {
    const r = run(500, true);
    expect(r.allyPassives!.entries.some((e) => e.buffId === W22)).toBe(false);
    expect(r.allyPassives!.unresolved.find((u) => u.buffId === W22)?.reason).toContain(
      'poseur allié',
    );
    expect(total(run(500, true))).toBe(total(run(5000, true)));
    expect(total(run(500, true))).toBe(total(run(500, false)));
  });

  it('la même ligne portée par l’attaquant reste une entrée', () => {
    const r = buildDamageReport(
      { ...attackerBase(), id: '2000008', gear: { weapon: { groups: ['1022'], tier: 4 } } },
      { element: 'CET_WATER', stats: { hp: 1000000, def: 1000 } },
      dataEq,
    );
    expect(r.gearPassives!.entries.some((e) => e.buffId === W22)).toBe(true);
    expect(r.gearPassives!.unresolved.some((u) => u.buffId === W22)).toBe(false);
  });
});

describe('inputs — cible : passif de fiche, RES, quirks « boss », IsIgnoreResist (revue H3/M2)', () => {
  const dataAll = {
    ...data,
    equipment: equipmentData,
    targets: targetsData,
  } as unknown as DamageData;
  // Vladi Max, Monad Gate route 3 : skill 165301 (DEF +1000 %, RES −90 %).
  const VLADI = '74000313:4244004';

  it('preset à passif de fiche : DEF de combat = fiche au canal du passif, aucun double compte', () => {
    const preset = resolvePresetTarget(VLADI, 0)!;
    const rate = getMonster('4244004')!.statPremium!.def!.rate!;
    expect(preset.premium?.def?.rate).toBe(rate);
    const target = {
      element: preset.element,
      stats: preset.stats,
      premium: preset.premium,
      monsterId: preset.monsterId,
      boss: true,
    };
    const r = buildDamageReport(attackerBase(), target, dataAll);
    expect(r.targetStats.def).toBe(Math.trunc((preset.stats.def! * (1000 + rate)) / 1000));
    // Le passif n'est ni une entrée ni un non-résolu des passifs de boss.
    const ids = [...r.bossPassives!.entries, ...r.bossPassives!.unresolved].map((e) => e.buffId);
    expect(ids).not.toContain('monad_gate_new_route_3_1');
    // Sans le champ, le moteur lit la fiche telle quelle.
    const bare = buildDamageReport(attackerBase(), { ...target, premium: undefined }, dataAll);
    expect(bare.targetStats.def).toBe(preset.stats.def);
    // Un DEF ×11 baisse les dégâts.
    const dmg = (x: typeof r) => x.slots[0].report.states[0].branches[0].totalDamage;
    expect(dmg(r)).toBeLessThan(dmg(bare));
  });

  it('quirks « boss » réglés : au canal de RES de la cible boss, rien sinon', () => {
    const quirks = { '233': 1, '237': 1 };
    const rate = bossQuirkRates(quirks, data.growth.awakening, data.buffs).ST_BUFF_RESIST!;
    expect(rate).toBeLessThan(0);
    const tgt = { element: 'earth', stats: { def: 1000, res: 160 } };
    const run = (quirkBoss: boolean) =>
      buildDamageReport({ ...attackerBase(), quirks }, { ...tgt, quirkBoss }, dataAll).targetStats;
    expect(run(true).res).toBe(Math.trunc((160 * (1000 + rate)) / 1000));
    expect(run(false).res).toBe(160);
  });

  it('chips de cible au canal : `t_res_down` annule la RES, `t_def_down` la DEF de moitié', () => {
    const tgt = { element: 'earth', stats: { def: 1000, res: 160 } };
    const r = buildDamageReport(attackerBase(), { ...tgt, fx: ['t_res_down', 't_def_down'] }, data);
    expect(r.targetStats.res).toBe(
      Math.trunc((160 * (1000 + FX_CATALOG.t_res_down!.value!)) / 1000),
    );
    expect(r.targetStats.def).toBe(
      Math.trunc((1000 * (1000 + FX_CATALOG.t_def_down!.value!)) / 1000),
    );
  });

  it('RES de la cible au jet de pose : EFF 0 contre RES 160 → 38,5 % de la pose', () => {
    const atk = { ...attackerBase(), id: '2000004', sheet: { atk: 3000, buff_chance: 0 } };
    const dot = (res: number) =>
      buildDamageReport(atk, { element: 'earth', stats: { def: 1000, res } }, data).slots[0]
        .dots![0];
    const d0 = dot(0);
    const d160 = dot(160);
    expect(data.buffs.buffs[d0.buffId]![0].buffDebuffType).toBe('DEBUFF');
    expect(1 - resistProbability(0, 160)).toBeCloseTo(0.385, 3);
    expect(d160.applyProbability).toBeCloseTo(
      (d0.applyProbability / (1 - resistProbability(0, 0))) * (1 - resistProbability(0, 160)),
      9,
    );
  });

  it('`IsIgnoreResist` : seuls DEBUFF et DEBUFF_IGNORE_IMMUNE passent le jet', () => {
    for (const t of ['NEUTRAL', 'NEUTRAL2', 'BUFF', 'DEBUFF_IGNORE_RESIST', 'DEBUFF_IGNORE_ALL'])
      expect(isIgnoreResist(t), t).toBe(true);
    for (const t of ['DEBUFF', 'DEBUFF_IGNORE_IMMUNE']) expect(isIgnoreResist(t), t).toBe(false);
    // T8 de Gnosis Beth : un DoT DEBUFF_IGNORE_ALL.
    expect(data.buffs.buffs['trancendent_8_2000092_4']![0].buffDebuffType).toBe(
      'DEBUFF_IGNORE_ALL',
    );
  });

  it('Francesca (EFF 180) contre Ars Nova (RES 223) : 0,699 hors drapeau, 1 avec, pose sûre en IGNORE_ALL', () => {
    const base = {
      attackRate: 755,
      statValue: 4000,
      defense: 1500,
      piercePowerRate: 0,
      piercePower: 0,
      dmgReduceRate: 0,
      createRatePermille: 1000,
      buffChancePermille: 180,
      buffResistPermille: 223,
    };
    expect(buildDotLine(base).applyProbability).toBeCloseTo(0.699, 3);
    const flagged = isIgnoreResist('DEBUFF_IGNORE_RESIST');
    expect(buildDotLine({ ...base, ignoreResist: flagged }).applyProbability).toBe(1);
    const all = isIgnoreResist('DEBUFF_IGNORE_ALL');
    expect(
      buildDotLine({ ...base, buffChancePermille: 0, buffResistPermille: 1000, ignoreResist: all })
        .applyProbability,
    ).toBe(1);
  });
});

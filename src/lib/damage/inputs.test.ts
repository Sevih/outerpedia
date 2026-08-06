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
import { calcBaseStat } from './formula';
import {
  buildCombatStats,
  buildDamageReport,
  dungeonModeOf,
  elementOf,
  eventMaxHpRate,
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

const attackerBase = (): AttackerBuildInput => ({
  id: CHAR_ID,
  level: 120,
  affinityTier: 0,
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
  it('trustBuffs : plats RÉSOLUS depuis buffs.json, cumulés par palier', () => {
    expect(trustBuffs(0, data.buffs)).toEqual([]);
    const t5 = trustBuffs(5, data.buffs);
    expect(t5).toHaveLength(15); // 3 stats × 5 paliers
    const sum = (st: string) =>
      t5.filter((b) => b.stat === st).reduce((s, b) => s + (b.value ?? 0), 0);
    // Témoins binaires re-vérifiés par l'extracteur : +60/+40/+300 par palier.
    expect(sum('ST_ATK')).toBe(300);
    expect(sum('ST_DEF')).toBe(200);
    expect(sum('ST_HP')).toBe(1500);
    expect(t5.every((b) => b.applyingType === 'OAT_ADD')).toBe(true);
  });

  it('resolveFx : magnitudes standard ; sans standard → unresolved, jamais deviné', () => {
    const { buffs, unresolved } = resolveFx(['atk', 't_marked', 't_dmg_taken', 'def_down']);
    expect(buffs).toEqual([
      { type: 'BT_STAT', stat: 'ST_ATK', applyingType: 'OAT_RATE', value: 300 },
      { type: 'BT_MARKING' },
      { type: 'BT_STAT', stat: 'ST_DEF', applyingType: 'OAT_RATE', value: -500 },
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
    const trust = trustBuffs(5, data.buffs);
    // Plats seuls : +300 ATK, indépendant du terme Codex.
    expect(buildCombatStats(a, char, data.growth, trust).atk).toBe(10300);
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
    const expected = Math.trunc(((10000 - A + 300) * 1300) / 1000) + A;
    expect(buildCombatStats(a, char, data.growth, [...trust, ...chip]).atk).toBe(expected);
  });
});

describe('inputs — buildDamageReport', () => {
  const target = () => ({
    element: 'earth',
    stats: { hp: 500000, def: 2000, dmgRed: 0, cdmgRed: 0 },
    boss: true,
  });

  it('kit complet : S1/S2/S3 + les 3 états burst rattachés au S2', () => {
    const result = buildDamageReport(attackerBase(), target(), data);
    const keys = result.slots.map((s) => `${s.slot}${s.burst ? `b${s.burst}` : ''}`);
    expect(keys).toEqual(['S1', 'S2', 'S3', 'S2b1', 'S2b2', 'S2b3']);
    // Niveau par défaut = max du skill ; les bursts suivent le S2 (372/372).
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
});

describe('inputs — buffs MAX_HP (§ 16.2 : guilde + titre)', () => {
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
    expect(r.maxHpBuff).toMatchObject({ sum: 15, hpBefore: 50000 }); // Lv 10 → 15
    expect(r.combatStats.hp).toBe(applied(15, 50000));
  });

  it('guilde + titre CUMULÉS en Special Request (Σ = 15 + 5 = 20)', () => {
    const a = { ...withHp(), premiumHp: true };
    const r = buildDamageReport(a, { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff?.sum).toBe(20);
    expect(r.maxHpBuff?.parts.map((p) => [p.source, p.active])).toEqual([
      ['guild', true],
      ['title', true],
    ]);
    expect(r.combatStats.hp).toBe(applied(20, 50000));
  });

  it('les listes de modes DIFFÈRENT : tour normale = guilde seule, adventure = titre seul', () => {
    const a = { ...withHp(), premiumHp: true };
    const tower = buildDamageReport(a, { ...target(), mode: 'tower' }, data);
    expect(tower.maxHpBuff?.sum).toBe(15); // guilde oui, titre non
    const adv = buildDamageReport(a, { ...target(), mode: 'adventure_mission' }, data);
    expect(adv.maxHpBuff?.sum).toBe(5); // titre oui, guilde non
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
    expect(buildDamageReport(a, { ...target(), guildBuffOn: true }, data).maxHpBuff?.sum).toBe(15);
    expect(buildDamageReport(a, { ...target(), titleBuffOn: true }, data).maxHpBuff?.sum).toBe(5);
    expect(
      buildDamageReport(a, { ...target(), guildBuffOn: true, titleBuffOn: true }, data).maxHpBuff
        ?.sum,
    ).toBe(20);
  });

  it('sans aucun réglage de compte : aucun bloc maxHpBuff, rien ne bouge', () => {
    const a = { ...withHp(), guildLevel: 0 };
    const r = buildDamageReport(a, { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff).toBeUndefined();
    expect(r.combatStats.hp).toBe(50000);
  });
});

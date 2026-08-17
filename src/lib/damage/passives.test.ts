/**
 * Passifs de BOSS (passives.ts) — rejoués sur les VRAIS artefacts committés,
 * témoin « Starving Devil » (Unidentified Chimera stage 12, monstre 403400261,
 * passif 131113) : le cas qui a motivé le chantier (Sevih 05/08/2026 — « c'est
 * un débuff comme un autre », jamais de stats saisies trafiquées).
 *
 * Attendus dérivés des TABLES (BuffTemplet via buffs.json), jamais recopiés
 * d'un rendu : crit +100 % / crit dmg −85 % sur l'équipe joueuse, réductions
 * élémentaires du boss (−15 % si l'attaquant a l'avantage, +50 % sinon), les
 * trois WG_DMG_REDUCE signalés § 12.3.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import targetsData from '../../../data/generated/damage/targets.json';
import {
  buildDamageReport,
  type AttackerBuildInput,
  type DamageData,
  type TargetBuildInput,
} from './inputs';
import { passiveAffectsDamageAmount, passiveConditionMet, staticBossPassives } from './passives';
import { Element } from './types';

const data = {
  characters: charactersData,
  growth: growthData,
  buffs: buffsData,
  targets: targetsData,
} as unknown as DamageData;

/** Unidentified Chimera, stage 12 — seul passif : 131113 (Starving Devil). */
const CHIMERA_12 = '403400261';

/** Témoins du roster par élément (le boss est TERRE) : feu = avantage,
 *  eau = désavantage, terre = neutre (EQUAL couvre aussi lumière/ténèbres). */
const FIRE = '2000001';
const WATER = '2000003';
const EARTH = '2000008';

const attacker = (id: string): AttackerBuildInput => ({
  id,
  level: 120,
  affinityTier: 0,
  codexLevel: 0,
  skillLevels: {},
  sheet: { atk: 10000, critical_rate: 500, critical_dmg: 1500 },
});

const target = (): TargetBuildInput => ({
  element: 'earth',
  stats: { hp: 500000, def: 2000 },
  boss: true,
  monsterId: CHIMERA_12,
});

describe('passives — conditions élémentaires (même relation que § 6)', () => {
  it('WIN/LOSE/EQUAL — EQUAL est le « ni l’un ni l’autre », pas « même élément »', () => {
    expect(passiveConditionMet('ATTACKER_ELEMENT_WIN', Element.Fire, Element.Earth)).toBe(true);
    expect(passiveConditionMet('ATTACKER_ELEMENT_LOSE', Element.Water, Element.Earth)).toBe(true);
    expect(passiveConditionMet('ATTACKER_ELEMENT_EQUAL', Element.Earth, Element.Earth)).toBe(true);
    // Lumière vs terre : hors du cycle feu>terre>eau → EQUAL, jamais rien.
    expect(passiveConditionMet('ATTACKER_ELEMENT_EQUAL', Element.Light, Element.Earth)).toBe(true);
    expect(passiveConditionMet('ATTACKER_ELEMENT_WIN', Element.Light, Element.Earth)).toBe(false);
    // Sans condition = toujours actif ; condition inconnue = jamais actif.
    expect(passiveConditionMet(undefined, Element.Fire, Element.Earth)).toBe(true);
    expect(passiveConditionMet('OWNER_HAS_BUFF', Element.Fire, Element.Earth)).toBe(false);
  });
});

describe('passives — Starving Devil (Chimera stage 12), donnée réelle', () => {
  it('extraction statique : 6 entrées classées (dont l’enrage), 3 WG signalés § 12.3', () => {
    const s = staticBossPassives(CHIMERA_12, data.targets!, data.buffs)!;
    expect(s).toBeDefined();
    const byId = (id: string) => s.entries.filter((e) => e.buffId === id);
    // Équipe joueuse (ENEMY_TEAM) : crit forcé + crit dmg −85 %.
    expect(byId('4076007_15_1')[0]).toMatchObject({
      side: 'attacker',
      buff: { type: 'BT_STAT', stat: 'ST_CRITICAL_RATE', applyingType: 'OAT_ADD', value: 1000 },
    });
    expect(byId('4076007_15_2')[0]).toMatchObject({
      side: 'attacker',
      buff: { type: 'BT_STAT', stat: 'ST_CRITICAL_DMG_RATE', applyingType: 'OAT_ADD', value: -850 },
    });
    // Boss (ME) : réductions conditionnées à l'élément de l'attaquant.
    expect(byId('1')[0]).toMatchObject({
      side: 'defender',
      condition: 'ATTACKER_ELEMENT_WIN',
      buff: { type: 'BT_DMG_REDUCE', applyingType: 'OAT_RATE', value: -150 },
    });
    expect(byId('2')[0]).toMatchObject({ condition: 'ATTACKER_ELEMENT_LOSE' });
    expect(byId('3')[0]).toMatchObject({ condition: 'ATTACKER_ELEMENT_EQUAL' });
    // ENRAGE (skill SKT_RAGE_ENTER1, 131125) : DMG Reduce +400 ‰ en OAT_ADD
    // sur le boss — canal de STAT défenseur § 16.1, gaté par la coche.
    expect(byId('Common_Rage_Buff_3')[0]).toMatchObject({
      skillId: '131125',
      side: 'defender',
      rage: true,
      buff: { type: 'BT_STAT', stat: 'ST_DMG_REDUCE_RATE', applyingType: 'OAT_ADD', value: 400 },
    });
    expect(s.entries).toHaveLength(6);
    // BT_DMG sortants du boss (4/5/6) : jamais calculés — absents, pas signalés.
    expect(byId('4')).toHaveLength(0);
    // Boucliers/WG heal/ATK du skill d'enrage : hors périmètre, absents aussi.
    expect(byId('common_rage_buff_atk_turn')).toHaveLength(0);
    // Les WG_DMG_REDUCE (bouclier de rage + armures) : signalés, jamais tus.
    expect(s.unresolved.map((u) => u.buffId).sort()).toEqual([
      '4076007_15_3_1',
      'armor_common_1',
      'armor_common_2',
    ]);
    for (const u of s.unresolved) expect(u.reason).toContain('12.3');
  });

  it('chips : la crit CHANCE ne pèse un montant que si le kit la LIT (2000067)', () => {
    const s = staticBossPassives(CHIMERA_12, data.targets!, data.buffs)!;
    const byId = (id: string) => s.entries.find((e) => e.buffId === id)!;
    // Kit qui ne lit PAS le taux crit : il ne pèse que sur P(crit) § 4 —
    // la chip est tue, le moteur garde l'entrée (test « crit forcé »).
    const plain = new Set(buildDamageReport(attacker(FIRE), target(), data).attackerAmountStats);
    expect(plain.has('ST_CRITICAL_RATE')).toBe(false);
    expect(passiveAffectsDamageAmount(byId('4076007_15_1'), plain)).toBe(false);
    // Crit dmg −85 % : nourrit la branche crit § 7.5 → chip.
    expect(passiveAffectsDamageAmount(byId('4076007_15_2'), plain)).toBe(true);
    // Défenseur : feedRow ne laisse déjà passer que les canaux consommés.
    expect(passiveAffectsDamageAmount(byId('1'), plain)).toBe(true);
    expect(passiveAffectsDamageAmount(byId('Common_Rage_Buff_3'), plain)).toBe(true);
    // 2000067 (2000067_2_6 : +50 % du taux CRIT en dégâts, famille § 9.1) :
    // la lecture ouvre la stat — la chip s'affiche pour lui (Sevih 17/08/2026).
    const reader = new Set(
      buildDamageReport(attacker('2000067'), target(), data).attackerAmountStats,
    );
    expect(reader.has('ST_CRITICAL_RATE')).toBe(true);
    expect(passiveAffectsDamageAmount(byId('4076007_15_1'), reader)).toBe(true);
  });

  it('enrage : inactif par défaut, la coche l’active et la réduction § 16.1 mord', () => {
    const off = buildDamageReport(attacker(FIRE), target(), data);
    const on = buildDamageReport(attacker(FIRE), { ...target(), enraged: true }, data);
    const rageOf = (r: typeof off) =>
      r.bossPassives!.entries.find((e) => e.buffId === 'Common_Rage_Buff_3')!;
    expect(rageOf(off).active).toBe(false);
    expect(rageOf(on).active).toBe(true);
    // DMG Reduce de la cible : 0 → 400 ‰ (§ 16.1, A = 0) — les dégâts chutent.
    const dmg = (r: typeof off) => r.slots[0].report.states[0].expectedDamage;
    expect(dmg(on)).toBeLessThan(dmg(off));
  });

  it('équipe joueuse : les débuffs traversent § 16.1 — crit forcé, crit dmg −850', () => {
    const r = buildDamageReport(attacker(FIRE), target(), data);
    expect(r.combatStats.critical_rate).toBe(500 + 1000);
    expect(r.combatStats.critical_dmg).toBe(1500 - 850);
    // +100 % de taux crit → P(crit) = 1, la branche normale reste émise à
    // P = 0 (normal/crit toujours émis — leurs dégâts ne dépendent pas de P).
    for (const s of r.slots) {
      for (const st of s.report.states) {
        expect(st.branches.map((b) => b.branch)).toEqual(['normal', 'critical']);
        expect(st.branches[0].probability).toBe(0);
        expect(st.branches[1].probability).toBe(1);
      }
    }
  });

  it('réduction § 9.2 du boss selon l’élément : feu −150, eau +500, terre +500', () => {
    const reduceOf = (id: string): number => {
      const r = buildDamageReport(attacker(id), target(), data, { trace: true });
      const step = r.slots[0].report.states[0].branches[0].trace?.find((t) => t.ref === '§ 9.2');
      expect(step).toBeDefined();
      return step!.out;
    };
    expect(reduceOf(FIRE)).toBe(-150); // avantage : le boss prend PLUS
    expect(reduceOf(WATER)).toBe(500); // désavantage : −50 %
    expect(reduceOf(EARTH)).toBe(500); // neutre (EQUAL) : −50 % aussi
  });

  it('le rapport expose bossPassives : entrées évaluées + non-résolus', () => {
    const r = buildDamageReport(attacker(FIRE), target(), data);
    expect(r.bossPassives).toBeDefined();
    const active = r.bossPassives!.entries.filter((e) => e.active).map((e) => e.buffId);
    expect(active.sort()).toEqual(['1', '4076007_15_1', '4076007_15_2']);
    expect(r.bossPassives!.unresolved).toHaveLength(3);
  });

  it('sans monsterId : aucun passif, rien ne bouge', () => {
    const r = buildDamageReport(attacker(FIRE), { ...target(), monsterId: undefined }, data);
    expect(r.bossPassives).toBeUndefined();
    expect(r.combatStats.critical_dmg).toBe(1500);
  });

  it('monsterId sans tables targets : signalé non résolu, jamais tu', () => {
    const bare = { ...data, targets: undefined };
    const r = buildDamageReport(attacker(FIRE), target(), bare);
    expect(r.bossPassives?.entries).toEqual([]);
    expect(r.bossPassives?.unresolved[0].reason).toContain('targets');
    expect(r.combatStats.critical_dmg).toBe(1500);
  });

  it('monstre inconnu des tables : signalé aussi', () => {
    const r = buildDamageReport(attacker(FIRE), { ...target(), monsterId: '999999' }, data);
    expect(r.bossPassives?.entries).toEqual([]);
    expect(r.bossPassives?.unresolved[0].reason).toContain('absent');
  });
});

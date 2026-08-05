/**
 * Passifs d'ÉQUIPEMENT (gear.ts) — rejoués sur les VRAIS artefacts committés,
 * témoins du scénario qui a motivé le chantier (Sevih 05/08/2026, H.Dianne vs
 * Chimera : « brancher les moteurs » avant de chasser les deltas) :
 *   - EE « Earnest Love » (2000093) : Lv10 = +100 % aux BOSS (PASSIVE), main
 *     « dégâts vs élément » = +17..23 % contre la cible que le porteur BAT
 *     (condition TARGET_ELEMENT, BuffConditionValue = CET de la CIBLE,
 *     absent = 0 = terre — preuve en tête de gear.ts) ;
 *   - Rampaging Caracal : proc de MARKING en SKILL_FINISH — jamais simulé,
 *     signalé `dynamic` (l'état se représente par la chip « cible marquée ») ;
 *   - Absolute Music : +dégâts aux boss pour les ALLIÉS du porteur
 *     (MY_TEAM_WITHOUT_ME) — ne profite JAMAIS au porteur, affiché inactif ;
 *   - Rogue's Charm +10 : BT_DMG_TARGET_BREAK +10 % (§ 9.1, cible en break) ;
 *   - set Revenge 4P : ATK jusqu'à +160 % selon les PV PERDUS (§ 14 BT 31).
 *
 * Attendus dérivés des TABLES (BuffTemplet via buffs.json), jamais recopiés
 * d'un rendu.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import equipmentData from '../../../data/generated/damage/equipment.json';
import { resolveGearPassives, gearConditionMet } from './gear';
import {
  buildDamageReport,
  type AttackerBuildInput,
  type DamageData,
  type TargetBuildInput,
} from './inputs';
import { sheetToCombatStat } from './sheet';
import { Element } from './types';

const data = {
  characters: charactersData,
  growth: growthData,
  buffs: buffsData,
  equipment: equipmentData,
} as unknown as DamageData;

const equipment = data.equipment!;
const buffs = data.buffs;

/** H.Dianne — feu, EE « Earnest Love » (pièce 2000093). */
const DIANNE = '2000093';

const attacker = (gear: AttackerBuildInput['gear'], hpPct = 100): AttackerBuildInput => ({
  id: DIANNE,
  level: 120,
  affinityTier: 0,
  codexLevel: 0,
  skillLevels: {},
  // Les PV font partie de la fiche : le contexte des familles « PV perdus »
  // (§ 14) vient d'eux — sans PV saisis, elles contribuent 0.
  sheet: { atk: 10000, hp: 40000, critical_rate: 500, critical_dmg: 1500 },
  hpPct,
  gear,
});

const target = (broken = false): TargetBuildInput => ({
  element: 'earth',
  stats: { hp: 500000, def: 2000 },
  boss: true,
  broken,
});

describe('gear — conditions', () => {
  it('TARGET_ELEMENT : BuffConditionValue = CET de la CIBLE, absent = terre', () => {
    expect(gearConditionMet('TARGET_ELEMENT', undefined, Element.Fire, Element.Earth)).toBe(true);
    expect(gearConditionMet('TARGET_ELEMENT', 0, Element.Fire, Element.Earth)).toBe(true);
    expect(gearConditionMet('TARGET_ELEMENT', 2, Element.Water, Element.Fire)).toBe(true);
    expect(gearConditionMet('TARGET_ELEMENT', 2, Element.Water, Element.Earth)).toBe(false);
    // Élémentaires ATTACKER_* : même relation que passives.ts (§ 6).
    expect(gearConditionMet('ATTACKER_ELEMENT_WIN', undefined, Element.Fire, Element.Earth)).toBe(
      true,
    );
    // Non évaluable (§ 12.1) : undefined — l'appelant signale, jamais deviné.
    expect(gearConditionMet('OWNER_HAS_BUFF', undefined, Element.Fire, Element.Earth)).toBe(
      undefined,
    );
  });
});

describe('gear — EE « Earnest Love » (H.Dianne), donnée réelle', () => {
  it('à +10 : +100 % aux boss (Lv10 ADD) + main « vs terre » niveau 11 (+23 %)', () => {
    const info = resolveGearPassives(
      DIANNE,
      { ee: { enchant: 10 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    const boss = info.entries.find((e) => e.buffId === 'BID_CEQUIP_2000093_ADD');
    expect(boss).toMatchObject({
      source: 'ee',
      side: 'attacker',
      active: true,
      buff: { type: 'BT_DMG_TO_BOSS', applyingType: 'OAT_RATE', value: 1000 },
    });
    const main = info.entries.find((e) => e.buffId === 'BID_CEQUIP_MAIN_DMG_FIRE');
    expect(main).toMatchObject({
      condition: 'TARGET_ELEMENT',
      conditionElement: Element.Earth,
      active: true,
      buff: { type: 'BT_DMG', value: 230 }, // niveau enchant + 1 = 11
    });
  });

  it('à +0 : pas de Lv10, main au niveau 1 (+17 %) ; vs eau la main est inactive', () => {
    const zero = resolveGearPassives(
      DIANNE,
      { ee: { enchant: 0 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(zero.entries.some((e) => e.buffId === 'BID_CEQUIP_2000093_ADD')).toBe(false);
    expect(zero.entries.find((e) => e.buffId === 'BID_CEQUIP_MAIN_DMG_FIRE')?.buff.value).toBe(170);
    const vsWater = resolveGearPassives(
      DIANNE,
      { ee: { enchant: 10 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Water,
    );
    expect(vsWater.entries.find((e) => e.buffId === 'BID_CEQUIP_MAIN_DMG_FIRE')?.active).toBe(
      false,
    );
  });

  it('perso sans EE : rien — état normal, pas un « non résolu »', () => {
    const info = resolveGearPassives(
      '2000001',
      { ee: { enchant: 10 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(info.entries.filter((e) => e.source === 'ee')).toEqual([]);
    expect(info.unresolved.filter((u) => u.source === 'ee')).toEqual([]);
  });
});

describe('gear — arme, accessoire, talisman, sets (donnée réelle)', () => {
  it('Rampaging Caracal (groupe 1008) : proc MARKING signalé dynamic, jamais simulé', () => {
    const info = resolveGearPassives(
      DIANNE,
      { weapon: { groups: ['1008'], tier: 4 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(info.entries).toEqual([]);
    expect(info.dynamic).toMatchObject([
      { source: 'weapon', buffId: 'BID_ITEM_UO_WEAPON_08', createType: 'SKILL_FINISH' },
    ]);
    expect(info.dynamic[0].buff.type).toBe('BT_MARKING');
  });

  it('Absolute Music (groupe 2025) : MY_TEAM_WITHOUT_ME → allies, jamais actif', () => {
    const info = resolveGearPassives(
      DIANNE,
      { amulet: { groups: ['2025'], tier: 4 } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    const e = info.entries.find((x) => x.buffId === 'BID_ITEM_UO_ACC_25');
    // Niveau = breakthrough + 1 = 5 → +20 % aux boss… pour les ALLIÉS.
    expect(e).toMatchObject({
      side: 'allies',
      active: false,
      buff: { type: 'BT_DMG_TO_BOSS', value: 200 },
    });
    // BID_ITEM_UO_ACC_25_2 est BT_NONE (placeholder) : ignoré en silence.
    expect(info.entries.some((x) => x.buffId === 'BID_ITEM_UO_ACC_25_2')).toBe(false);
  });

  it("Rogue's Charm +10 (groupe 3025) : +10 % sur cible en BREAK via § 9.1", () => {
    const info = resolveGearPassives(
      DIANNE,
      { roguesCharm: { groups: ['3025'] } },
      equipment,
      buffs,
      Element.Fire,
      Element.Earth,
    );
    expect(info.entries).toMatchObject([
      { source: 'talisman', active: true, buff: { type: 'BT_DMG_TARGET_BREAK', value: 100 } },
    ]);
    // Le Lv1 (charge de CP en SKILL_FINISH) ne pèse pas sur le hit : silencieux.
    expect(info.dynamic).toEqual([]);

    // Bout en bout : la cible en break prend +10 % (§ 9.1) — sinon 0.
    const gear = { roguesCharm: { groups: ['3025'] } };
    const dmg = (broken: boolean): number =>
      buildDamageReport(attacker(gear), target(broken), data).slots[0].report.states[0].branches[0]
        .totalDamage;
    expect(dmg(true)).toBeGreaterThan(dmg(false));
  });

  it('set Revenge 4P : ATK scalé par les PV PERDUS (§ 14 BT 31) — via § 16.1', () => {
    const gear = { sets: [{ groupId: '15', enchanted: false, pieces: 4 as const }] };
    // À 100 % PV : rien ; à 25 % PV : +160 % × 0,75 = +120 % d'ATK.
    const full = buildDamageReport(attacker(gear, 100), target(), data);
    const hurt = buildDamageReport(attacker(gear, 25), target(), data);
    expect(full.combatStats.atk).toBe(10000);
    expect(hurt.combatStats.atk).toBe(
      sheetToCombatStat({
        sheetValue: 10000,
        baseValue: 0,
        archiveRatePermille: 0,
        buffValue: 0,
        buffValueRate: 1200,
      }),
    );
    // 2 pièces seulement : le 4P ne s'applique pas.
    const two = buildDamageReport(
      attacker({ sets: [{ groupId: '15', enchanted: false, pieces: 2 }] }, 25),
      target(),
      data,
    );
    expect(two.combatStats.atk).toBe(10000);
  });
});

describe('gear — intégration buildDamageReport', () => {
  it('l’EE +10 traverse § 9.1 : boss +100 % et main vs terre +23 % dans le taux du hit', () => {
    const withEe = buildDamageReport(attacker({ ee: { enchant: 10 } }), target(), data);
    const bare = buildDamageReport(attacker({}), target(), data);
    expect(withEe.gearPassives?.entries.filter((e) => e.active)).toHaveLength(2);
    expect(withEe.slots[0].report.states[0].branches[0].totalDamage).toBeGreaterThan(
      bare.slots[0].report.states[0].branches[0].totalDamage,
    );
  });

  it('gear présent sans tables equipment : signalé non résolu, jamais tu', () => {
    const bare = { ...data, equipment: undefined };
    const r = buildDamageReport(attacker({ ee: { enchant: 10 } }), target(), bare);
    expect(r.gearPassives?.entries).toEqual([]);
    expect(r.gearPassives?.unresolved[0].reason).toContain('equipment');
  });

  it('sans gear : rien ne bouge (pas de gearPassives)', () => {
    const r = buildDamageReport({ ...attacker({}), gear: undefined }, target(), data);
    expect(r.gearPassives).toBeUndefined();
  });
});

/**
 * Agrégation § 9 / § 14.1 / § 10.1 — témoins par famille, calculés à la main
 * depuis les tables du binaire (damage-formula.md). Le point critique : § 9.3
 * est un MAX, pas une somme ; les familles `*_STAT` sont cappées à 1000 ‰ ;
 * un contexte absent contribue 0 (jamais une valeur plausible).
 */
import { describe, expect, it } from 'vitest';
import {
  collectStatChannels,
  collectCombatFlags,
  effectiveValue,
  findBuffAdditionalDamage,
  findBuffDamageReduce,
  getBuffDamageFinalReduce,
  type ActiveBuff,
} from './aggregate';

const B = (over: Partial<ActiveBuff>): ActiveBuff => ({ type: 'BT_STAT', ...over });

describe('aggregate — canaux et familles § 9', () => {
  it('§ 14.1 : valeur effective = value × stacks (défaut 1)', () => {
    expect(effectiveValue(B({ value: 40 }))).toBe(40);
    expect(effectiveValue(B({ value: 40, stacks: 5 }))).toBe(200);
  });

  it('BT_STAT → canaux plat/taux PAR stat (entrées § 16.1)', () => {
    const ch = collectStatChannels([
      B({ stat: 'ST_ATK', applyingType: 'OAT_RATE', value: 300 }),
      B({ stat: 'ST_ATK', applyingType: 'OAT_ADD', value: 60, stacks: 3 }), // affinité T3
      B({ stat: 'ST_DEF', applyingType: 'OAT_RATE', value: -500 }),
      B({ type: 'BT_DMG', value: 100 }), // pas un BT_STAT : ignoré ici
    ]);
    expect(ch.ST_ATK).toEqual({ value: 180, rate: 300 });
    expect(ch.ST_DEF).toEqual({ value: 0, rate: -500 });
    expect(ch.ST_HP).toBeUndefined();
  });

  it('BT_STAT_PREMIUM posé par un ALLIÉ : même canal que BT_STAT (§ 16.4 — le premium EST buffVal/buffRate ; pas dans la fiche du receveur, donc pas de défactorisation)', () => {
    const ch = collectStatChannels([
      B({ type: 'BT_STAT_PREMIUM', stat: 'ST_ATK', applyingType: 'OAT_RATE', value: 300 }),
      B({
        type: 'BT_STAT_PREMIUM',
        stat: 'ST_CRITICAL_DMG_RATE',
        applyingType: 'OAT_ADD',
        value: 500,
      }),
    ]);
    expect(ch.ST_ATK).toEqual({ value: 0, rate: 300 });
    expect(ch.ST_CRITICAL_DMG_RATE).toEqual({ value: 500, rate: 0 });
  });

  it('§ 9.1 : familles contextuelles — contexte absent = 0, jamais deviné', () => {
    const buffs: ActiveBuff[] = [
      B({ type: 'BT_DMG', value: 150 }),
      B({ type: 'BT_DMG_TARGET_LOST_HP_RATE', value: 300 }),
      B({ type: 'BT_DMG_TO_BOSS', value: 200 }),
      B({ type: 'BT_DMG_NOT_CRITICAL', value: 250 }),
      B({ type: 'BT_DMG_OWNER_BUFF', value: 40 }),
    ];
    // Sans contexte : seuls BT_DMG et NOT_CRITICAL (branche normale) comptent.
    expect(findBuffAdditionalDamage(buffs, { branch: 'normal' })).toBe(400);
    // En branche critique, NOT_CRITICAL tombe.
    expect(findBuffAdditionalDamage(buffs, { branch: 'critical' })).toBe(150);
    // Contexte complet : lost HP (50 % → 150), boss (+200), 3 buffs × 40.
    expect(
      findBuffAdditionalDamage(buffs, {
        branch: 'critical',
        defender: { maxHP: 1000, hp: 500 },
        targetIsBoss: true,
        attackerBuffCount: 3,
      }),
    ).toBe(150 + 150 + 200 + 120);
  });

  it('§ 9.1 : les familles *_STAT sont cappées à 1000 ‰', () => {
    const buffs = [B({ type: 'BT_DMG_OWNER_STAT', stat: 'ST_SPEED', value: 10 })];
    // speed 150 × 10 ‰ = 1 (troncature div1000)… et 200000 × 10 ‰ = 2000 → cap 1000.
    expect(findBuffAdditionalDamage(buffs, { branch: 'normal', attackerStat: () => 150 })).toBe(1);
    expect(findBuffAdditionalDamage(buffs, { branch: 'normal', attackerStat: () => 200000 })).toBe(
      1000,
    );
  });

  it('§ 9.2 : DMG_REDUCE exige OAT_RATE ; STEALTHED ne joue que hors mono-cible', () => {
    const buffs: ActiveBuff[] = [
      B({ type: 'BT_DMG_REDUCE', applyingType: 'OAT_RATE', value: 200 }),
      B({ type: 'BT_DMG_REDUCE', applyingType: 'OAT_ADD', value: 999 }), // écarté
      B({ type: 'BT_STEALTHED', value: 300 }),
    ];
    expect(findBuffDamageReduce(buffs, { attackerSkillMonoTarget: true })).toBe(200);
    expect(findBuffDamageReduce(buffs, { attackerSkillMonoTarget: false })).toBe(500);
    // Mono-cible inconnu : STEALTHED ne contribue pas (contexte absent = 0).
    expect(findBuffDamageReduce(buffs, {})).toBe(200);
  });

  it('§ 9.3 : MAX, pas somme — et BT 116 saute sur le S1', () => {
    const buffs: ActiveBuff[] = [
      B({ type: 'BT_DMG_REDUCE_FINAL', value: 300 }),
      B({ type: 'BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL', value: 500 }),
    ];
    expect(getBuffDamageFinalReduce(buffs, { isFirstSkill: false })).toBe(500);
    expect(getBuffDamageFinalReduce(buffs, { isFirstSkill: true })).toBe(300);
  });

  it('drapeaux : break réel (BID_BREAK_1) côté cible + swap § 10.1 côté attaquant', () => {
    // BID_BREAK_1 (buffs.json) : BT_DMG_REDUCE OAT_RATE −200 — négatif : une
    // cible break PREND plus de dégâts via la somme § 9.2.
    expect(
      findBuffDamageReduce(
        [B({ type: 'BT_DMG_REDUCE', applyingType: 'OAT_RATE', value: -200 })],
        {},
      ),
    ).toBe(-200);
    const flags = collectCombatFlags(
      [
        B({ type: 'BT_DMG_ELEMENT_ENCHANT', value: 100 }),
        B({ type: 'BT_SWAP_STAT_ATTACK', stat: 'ST_HP', applyingType: 'OAT_RATE', value: 120 }),
      ],
      [B({ type: 'BT_MARKING', value: 0 }), B({ type: 'BT_INVINCIBLE', value: 0 })],
    );
    expect(flags.defenderMarked).toBe(true);
    expect(flags.defenderInvincible).toBe(true);
    expect(flags.elementDamageRateBonus).toBe(100);
    expect(flags.swapAttack).toEqual({ stat: 'ST_HP', applyingType: 'OAT_RATE', value: 120 });
    expect(flags.forcedSuperiority).toBe(false);
  });
});

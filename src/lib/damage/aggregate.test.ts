/**
 * Agrégation § 9 / § 14.1 / § 10.1 — témoins par famille, calculés à la main
 * depuis les tables du binaire (damage-formula.md). Le point critique : § 9.3
 * est un MAX, pas une somme ; les familles `*_STAT` sont cappées à 1000 ‰ ;
 * un contexte absent contribue 0 (jamais une valeur plausible).
 */
import { describe, expect, it } from 'vitest';
import {
  applyStatEnhance,
  collectStatChannels,
  collectCombatFlags,
  effectiveValue,
  findBuffAdditionalDamage,
  findBuffDamageReduce,
  findBuffWGDamageReduce,
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

  it('§ 9.2 : BT_DOT_PUNISH = un TERME de config (300) par buff du défenseur, +1 si l’attaquant en porte', () => {
    const buffs: ActiveBuff[] = [
      B({ type: 'BT_DMG_REDUCE', applyingType: 'OAT_RATE', value: 100 }),
      B({ type: 'BT_DOT_PUNISH', value: 700, stacks: 3 }), // la valeur et les stacks du buff sont IGNORÉS
      B({ type: 'BT_DOT_PUNISH', value: 700 }),
    ];
    expect(findBuffDamageReduce(buffs, {})).toBe(100 + 300 + 300);
    expect(findBuffDamageReduce(buffs, { attackerHasDotPunish: true })).toBe(100 + 300 + 300 + 300);
    expect(findBuffDamageReduce(buffs, { punishReducePermille: 250 })).toBe(100 + 250 + 250);
    expect(findBuffDamageReduce([], { attackerHasDotPunish: true })).toBe(300);
  });

  it('§ 9.1 : familles *_LIMIT (164/165) — Value × compte, cumul plafonné par BuffID', () => {
    // Demiurge Saeran T8 (`trancendent_8_2000129_2`) : Value 200, LimitValue 2000.
    const saeran = B({
      type: 'BT_DMG_TARGET_DEBUFF_LIMIT',
      id: 'trancendent_8_2000129_2',
      value: 200,
      limitValue: 2000,
    });
    const ctx = (n: number) => ({ branch: 'normal' as const, defenderDebuffCount: n });
    expect(findBuffAdditionalDamage([saeran], ctx(3))).toBe(600);
    expect(findBuffAdditionalDamage([saeran], ctx(10))).toBe(2000);
    expect(findBuffAdditionalDamage([saeran], ctx(12))).toBe(2000);
    // Deux instances du MÊME BuffID : un seul plafond pour les deux ; un
    // autre BuffID a le sien.
    expect(findBuffAdditionalDamage([saeran, saeran], ctx(6))).toBe(2000);
    expect(findBuffAdditionalDamage([saeran, { ...saeran, id: 'autre' }], ctx(6))).toBe(2400);
    // Jumeau côté buffs de la cible ; LimitValue absente = plafond 0.
    const buffLimit = { ...saeran, type: 'BT_DMG_TARGET_BUFF_LIMIT' };
    expect(findBuffAdditionalDamage([buffLimit], { branch: 'normal', defenderBuffCount: 12 })).toBe(
      2000,
    );
    expect(findBuffAdditionalDamage([buffLimit], ctx(12))).toBe(0); // compte de BUFFS absent
    expect(findBuffAdditionalDamage([{ ...saeran, limitValue: undefined }], ctx(3))).toBe(0);
  });

  it('§ 11 : FindBuffWGDamageReduce — WG_DMG de l’attaquant ajoute, WG_DMG_REDUCE du défenseur retranche', () => {
    expect(
      findBuffWGDamageReduce(
        [
          B({ type: 'BT_WG_DMG', applyingType: 'OAT_ADD', value: 2 }),
          B({ type: 'BT_WG_DMG', applyingType: 'OAT_RATE', value: 500 }),
        ],
        [
          B({ type: 'BT_WG_DMG_REDUCE', applyingType: 'OAT_ADD', value: 1 }),
          B({ type: 'BT_WG_DMG_REDUCE', applyingType: 'OAT_RATE', value: 200, stacks: 2 }),
        ],
      ),
    ).toEqual({ flat: 1, rate: 100 });
    expect(findBuffWGDamageReduce([], [])).toEqual({ flat: 0, rate: 0 });
  });

  it('§ 9.3 : MAX, pas somme — et BT 121 saute sur le S1', () => {
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

describe('aggregate — renfort STAT_BUFF/DEBUFF_ENHANCE (§ 14.1, revue M4)', () => {
  const chip = (over: Partial<ActiveBuff>): ActiveBuff =>
    B({ stat: 'ST_ATK', applyingType: 'OAT_RATE', value: 300, tooltipId: 7, ...over });
  const buffEnh = (value: number): ActiveBuff => ({ type: 'BT_STAT_BUFF_ENHANCE', value });
  const debuffEnh = (value: number): ActiveBuff => ({ type: 'BT_STAT_DEBUFF_ENHANCE', value });

  it('un buff visible sous BUFF_ENHANCE +1000 vaut le double', () => {
    const atk = chip({});
    const [out] = applyStatEnhance([atk], [atk, buffEnh(1000)]);
    expect(out.value).toBe(2 * atk.value!);
  });

  it('un débuff visible sous DEBUFF_ENHANCE +1000 vaut le double ; BUFF_ENHANCE ne le touche pas', () => {
    const down = chip({ stat: 'ST_DEF', value: -500, tooltipId: 17, debuff: true });
    expect(applyStatEnhance([down], [debuffEnh(1000)])[0].value).toBe(2 * down.value!);
    expect(applyStatEnhance([down], [buffEnh(1000)])[0]).toBe(down);
  });

  it('−3000 INVERSE le buff : ApplyRate(v, −3000) = −2 v', () => {
    const up = chip({ stat: 'ST_DEF', value: 500, tooltipId: 6 });
    expect(applyStatEnhance([up], [buffEnh(-3000)])[0].value).toBe(-2 * up.value!);
  });

  it('jamais renforcés : sans tooltip, BT_STAT_PREMIUM, autres familles', () => {
    const noTip = chip({ tooltipId: undefined });
    const premium: ActiveBuff = { ...chip({}), type: 'BT_STAT_PREMIUM' };
    const dmg: ActiveBuff = { type: 'BT_DMG', value: 200, tooltipId: 7 };
    const out = applyStatEnhance([noTip, premium, dmg], [buffEnh(1000)]);
    expect(out[0]).toBe(noTip);
    expect(out[1]).toBe(premium);
    expect(out[2]).toBe(dmg);
  });

  it('le PREMIER ENHANCE trouvé, pas une somme ; stacks portés par la valeur', () => {
    const stacked = chip({ value: 100, stacks: 3 });
    const [out] = applyStatEnhance([stacked], [buffEnh(500), buffEnh(1000)]);
    expect(effectiveValue(out)).toBe(Math.trunc((effectiveValue(stacked) * 1500) / 1000));
  });

  it('collectStatChannels renforce les BT_STAT du porteur par ses propres ENHANCE', () => {
    const atk = chip({});
    expect(collectStatChannels([atk, buffEnh(1000)]).ST_ATK.rate).toBe(2 * atk.value!);
    expect(collectStatChannels([atk]).ST_ATK.rate).toBe(atk.value);
  });
});

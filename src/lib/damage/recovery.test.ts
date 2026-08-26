/**
 * Tests soins / shields / reverse heal / WG — cas dérivés de la spec § 14
 * (CBuff.OnCreate + CCharacterBattle.AddHP, valeurs calculées à la main).
 */
import { describe, expect, it } from 'vitest';

import {
  applyHpDelta,
  applyReceiveHealModifiers,
  buffValue,
  calcHealValue,
  calcReverseHealValue,
  calcShieldValue,
  enhanceStatBuffValue,
  immediateDotValue,
  itemMainOptionValue,
  pvpPenaltyRates,
  sumFactorsF32,
  lostHpRateHalfValue,
  preserveHpRatio,
  shieldAbsorb,
  wgBuffValue,
} from './index';

describe('buffValue / enhance', () => {
  it('Value = Templet.Value × StackCount (linéaire en stacks)', () => {
    expect(buffValue(150, 1)).toBe(150);
    expect(buffValue(150, 5)).toBe(750);
  });

  it('enhance de buff de stat : ×(1000 + enh)/1000 tronqué', () => {
    expect(enhanceStatBuffValue(300, 500)).toBe(450);
    expect(enhanceStatBuffValue(333, 100)).toBe(366); // 366.3 → 366
  });
});

describe('lostHpRateHalfValue', () => {
  it('sature à la valeur pleine sous 50 % PV', () => {
    // HP = 20 % de 10000 → 2×2000−10000 = −6000 → clamp 0 → perdu = 100 % → valeur pleine
    expect(lostHpRateHalfValue(10000, 2000, 400)).toBe(400);
  });
  it('croît deux fois plus vite au-dessus de 50 %', () => {
    // HP = 75 % → hpEff = 5000 → perdu 50 % → 200 (le simple LOST_HP_RATE donnerait 100)
    expect(lostHpRateHalfValue(10000, 7500, 400)).toBe(200);
    // plein PV → 0
    expect(lostHpRateHalfValue(10000, 10000, 400)).toBe(0);
  });
});

describe('preserveHpRatio', () => {
  it("HP' = trunc(MaxHP' × HP / MaxHP)", () => {
    expect(preserveHpRatio(10000, 15000, 5000)).toBe(7500);
    expect(preserveHpRatio(10000, 15000, 10000)).toBe(15000); // plein reste plein
    expect(preserveHpRatio(3, 4, 2)).toBe(2); // trunc(8/3) = 2
  });
});

describe('calcHealValue', () => {
  it('stat-basé : trunc(stat × value / 1000) ; plat sinon', () => {
    expect(calcHealValue({ value: 350, sourceStatValue: 12000 })).toBe(4200);
    expect(calcHealValue({ value: 1234 })).toBe(1234);
  });

  it('pénalité PvP : aucune réduction avant le 1er cycle, puis la valeur de scène', () => {
    // scene.pvpHealReduce = 0 avant le tour de pénalité (spec § 17.6)
    expect(calcHealValue({ value: 350, sourceStatValue: 12000, isPvp: true })).toBe(4200);
    // Soin PLAT (StatType == ST_NONE) : jamais réduit, même en PvP (§ 14.2, C# 26/08/2026).
    expect(calcHealValue({ value: 1234, isPvp: true, pvpHealReducePermille: 500 })).toBe(1234);
    expect(
      calcHealValue({
        value: 350,
        sourceStatValue: 12000,
        isPvp: true,
        pvpHealReducePermille: 500,
      }),
    ).toBe(2100);
    expect(
      calcHealValue({
        value: 350,
        sourceStatValue: 12000,
        isPvp: true,
        pvpHealReducePermille: 750,
      }),
    ).toBe(1050);
  });
});

describe('pvpPenaltyRates (§ 17.6)', () => {
  it('escalade : dégâts 100 +30/cycle sans cap, soins 500 +250/cycle cap 1000', () => {
    expect(pvpPenaltyRates(0)).toEqual({ dmgRatePermille: 0, healReducePermille: 0 });
    expect(pvpPenaltyRates(1)).toEqual({ dmgRatePermille: 100, healReducePermille: 500 });
    expect(pvpPenaltyRates(2)).toEqual({ dmgRatePermille: 130, healReducePermille: 750 });
    expect(pvpPenaltyRates(3)).toEqual({ dmgRatePermille: 160, healReducePermille: 1000 });
    expect(pvpPenaltyRates(10)).toEqual({ dmgRatePermille: 370, healReducePermille: 1000 });
  });
});

describe('applyReceiveHealModifiers', () => {
  it('seal : soin annulé', () => {
    expect(applyReceiveHealModifiers(5000, { sealed: true, increasePermille: 300 })).toBe(0);
  });

  it('INCREASE prime sur REDUCE — un seul des deux s’applique', () => {
    expect(applyReceiveHealModifiers(5000, { increasePermille: 300 })).toBe(6500);
    expect(applyReceiveHealModifiers(5000, { reducePermille: 300 })).toBe(3500);
    expect(applyReceiveHealModifiers(5000, { increasePermille: 300, reducePermille: 900 })).toBe(
      6500,
    );
  });

  it('saignement : soins reçus ÷ 2, appliqué en dernier', () => {
    expect(applyReceiveHealModifiers(5000, { hasBleed: true })).toBe(2500);
    expect(applyReceiveHealModifiers(5000, { increasePermille: 300, hasBleed: true })).toBe(3250);
  });

  it('réduction PvP temps réel avant le saignement', () => {
    expect(
      applyReceiveHealModifiers(5000, { pvpRealtimeFieldReducePermille: 200, hasBleed: true }),
    ).toBe(2000);
  });
});

describe('shieldAbsorb / applyHpDelta', () => {
  it('le shield encaisse d’abord, le surplus passe aux PV', () => {
    expect(shieldAbsorb(3000, 1000)).toEqual({ remainingShield: 2000, remainingDamage: 0 });
    expect(shieldAbsorb(3000, 3000)).toEqual({ remainingShield: 0, remainingDamage: 0 });
    expect(shieldAbsorb(3000, 4500)).toEqual({ remainingShield: 0, remainingDamage: 1500 });
    expect(shieldAbsorb(0, 4500)).toEqual({ remainingShield: 0, remainingDamage: 4500 });
  });

  it('clamp [0, MaxHP] et undead à 1 PV', () => {
    expect(applyHpDelta(5000, 10000, 8000)).toBe(10000);
    expect(applyHpDelta(5000, 10000, -8000)).toBe(0);
    expect(applyHpDelta(5000, 10000, -8000, { undead: true })).toBe(1);
    expect(applyHpDelta(5000, 10000, -8000, { undead: true, ignoreUndead: true })).toBe(0);
    expect(applyHpDelta(5000, 10000, -5000, { undead: true })).toBe(1); // pile 0 → 1
  });
});

describe('calcShieldValue', () => {
  it('stat-basé ou plat — le shield REMPLACE l’existant (pas de cumul)', () => {
    expect(calcShieldValue({ value: 200, sourceStatValue: 45000 })).toBe(9000);
    expect(calcShieldValue({ value: 777 })).toBe(777);
  });
});

describe('calcReverseHealValue', () => {
  const base = { value: 250, sourceStatValue: 40000, hp: 20000, shieldHP: 0 };

  it('stat-basé, non mitigé', () => {
    expect(calcReverseHealValue(base)).toBe(10000);
  });

  it('cappé par le plus petit BT 20', () => {
    expect(calcReverseHealValue({ ...base, capValue: 4000 })).toBe(4000);
    expect(calcReverseHealValue({ ...base, capValue: 15000 })).toBe(10000);
  });

  it('protection létale : laisse 1 (PV + shield) hors contenu létal', () => {
    expect(calcReverseHealValue({ ...base, hp: 8000, shieldHP: 1000 })).toBe(8999);
    expect(calcReverseHealValue({ ...base, hp: 8000, shieldHP: 1000, canKill: true })).toBe(10000);
    // strictement supérieur requis : HP+shield == v → protégé aussi
    expect(calcReverseHealValue({ ...base, hp: 10000 })).toBe(9999);
  });

  it('garde INVINCIBLE : aucune perte de PV (§ 14.5)', () => {
    expect(calcReverseHealValue({ ...base, invincible: true })).toBe(0);
    expect(calcReverseHealValue({ ...base, invincible: true, canKill: true })).toBe(0);
  });
});

describe('WG et DOT immédiats', () => {
  it('valeur WG : ‰ de MaxWG si ApplyingType == 2, plate sinon', () => {
    expect(wgBuffValue(300, 40, true)).toBe(12);
    expect(wgBuffValue(5, 40, false)).toBe(5);
  });

  it('tick immédiat : dot × (1000 + v)/1000', () => {
    expect(immediateDotValue(700, 500)).toBe(1050);
    expect(immediateDotValue(333, 100)).toBe(366);
  });
});

describe('options d’équipement (§ 17.5, float32)', () => {
  it('sumFactorsF32 : somme séquentielle float32', () => {
    expect(sumFactorsF32([])).toBe(0);
    expect(sumFactorsF32([0.5, 0.5])).toBe(1);
    // 0.4 n’est pas représentable : la somme accumule l’erreur f32 réelle
    expect(sumFactorsF32([0.4, 0.4, 0.4])).toBe(1.2000000476837158);
  });

  it('option principale : value × (1+enchant+singularité) × (1+breakLimit), tronqué', () => {
    expect(itemMainOptionValue(100, 0)).toBe(100);
    expect(itemMainOptionValue(100, 1)).toBe(200);
    expect(itemMainOptionValue(100, 1, 0.25)).toBe(250);
    expect(itemMainOptionValue(100, 1, 0.25, 0.25)).toBe(281); // 2,25×100×1,25 = 281,25
    // facteur d’enchant réel (3 niveaux à 0.4) sur une main ATK 18
    expect(itemMainOptionValue(18, sumFactorsF32([0.4, 0.4, 0.4]))).toBe(39); // 39,6 → 39
  });
});

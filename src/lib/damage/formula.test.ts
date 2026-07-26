/**
 * Tests du moteur de dégâts — cas dérivés de docs/specs/damage-formula.md
 * (valeurs calculées à la main depuis le pseudo-code du binaire) + invariants.
 */
import { describe, expect, it } from 'vitest';

import {
  addCheckEnemyTeamDecreaseDamageRate,
  adjustLastHitDamage,
  applyRate,
  calcCharacterSharedDamage,
  calcDamage,
  calcDamageCore,
  calcDamageDOT,
  calcDamageWG,
  calcBaseStat,
  calcFinalStat,
  calcStatByLevel,
  checkDamageRate,
  checkProbability,
  checkResist,
  checkResistThreshold,
  DamageRateType,
  Element,
  ElementSuperiority,
  getElementeryDamageRate,
  getElementSuperiority,
  getLostHPRateValue,
  getStatValuePermille,
  mulPermille,
  type CheckDamageRateInput,
  type DamageCoreInput,
  type FinalStatInput,
} from './index';

// ── Primitives ──────────────────────────────────────────────────────────────

describe('mulPermille / applyRate', () => {
  it('tronque vers zéro (sémantique C, pas floor)', () => {
    expect(mulPermille(1999, 1)).toBe(1); // 1.999 → 1
    expect(mulPermille(-1999, 1)).toBe(-1); // -1.999 → -1 (pas -2)
    expect(mulPermille(12345, 1500)).toBe(18517); // 18517.5 → 18517
  });

  it('applyRate = v × (1000 + r) / 1000', () => {
    expect(applyRate(1000, 500)).toBe(1500);
    expect(applyRate(7, -1000)).toBe(0);
    expect(applyRate(100, -2000)).toBe(-100);
  });
});

// ── CalcStat (stat de base par niveau) ──────────────────────────────────────

describe('calcStatByLevel', () => {
  it('niveau 1 = min, niveau 100 = max (interpolation en 99 pas)', () => {
    expect(calcStatByLevel(100, 1090, 1)).toBe(100);
    expect(calcStatByLevel(100, 1090, 100)).toBe(1090);
  });

  it('division par 99 tronquée vers zéro', () => {
    // (50-1) × (1090-100) = 48510 ; 48510/99 = 490 exact → 590
    expect(calcStatByLevel(100, 1090, 50)).toBe(590);
    // (2-1) × 1000 / 99 = 10.10… → 10
    expect(calcStatByLevel(0, 1000, 2)).toBe(10);
    // écart négatif (max < min) : troncature vers zéro, pas floor
    expect(calcStatByLevel(1000, 0, 2)).toBe(1000 - 10);
  });
});

describe('calcBaseStat (SetBaseValue, § 3.2)', () => {
  // ATK du perso 2000001 : min=73, max=729 (CharacterTemplet 1.4.9)
  it('niveau ≤ 100 : identique à calcStatByLevel, quel que soit le modificateur', () => {
    expect(calcBaseStat(73, 729, 100, 700)).toBe(729);
    expect(calcBaseStat(73, 729, 60, 700)).toBe(calcStatByLevel(73, 729, 60));
  });

  it('niveau 120 au palier 3 (mod 700 ‰) : pas linéaire + 70 % par niveau post-100', () => {
    // linéaire : 73 + 119×656/99 = 73 + 788 = 861 ; extra : 20×656×700/99000 = 92
    expect(calcBaseStat(73, 729, 120, 700)).toBe(953);
    // monstre (mod 0) : extrapolation linéaire pure
    expect(calcBaseStat(73, 729, 120, 0)).toBe(861);
  });

  it('addRate multiplie la base après le calcul par niveau', () => {
    expect(calcBaseStat(0, 990, 100, 0, 500)).toBe(1485); // 990 × 1,5
    expect(calcBaseStat(0, 990, 100, 0, 0)).toBe(990); // addRate < 1 ignoré
  });
});

// ── CalcFinalStat ───────────────────────────────────────────────────────────

const baseStat: FinalStatInput = {
  baseValue: 0,
  spawnAdvantageRate: 0,
  evolutionValue: 0,
  awakeningValue: 0,
  awakeningValueRate: 0,
  monadEnchantValue: 0,
  monadEnchantValueRate: 0,
  transcendentStarValueRate: 0,
  archiveStatValueRate: 0,
  itemOptionValue: 0,
  itemOptionValueRate: 0,
  buffValue: 0,
  buffValueRate: 0,
};

describe('calcFinalStat', () => {
  it('stat nue = base', () => {
    expect(calcFinalStat({ ...baseStat, baseValue: 1234 })).toBe(1234);
  });

  it('les taux (éveil/monad/trans/item) forment UN multiplicateur commun sur le flat', () => {
    // (1000 + 2000+1500+300+100+150) × 1000/1000 = 1000 × 4050/1000... ordre :
    // flat=1000, rate=1000+100+150+300+2000+1500=5050 → 1000×5050/1000 = 5050
    expect(
      calcFinalStat({
        ...baseStat,
        baseValue: 1000,
        spawnAdvantageRate: 100,
        awakeningValueRate: 150,
        monadEnchantValueRate: 300,
        transcendentStarValueRate: 2000,
        itemOptionValueRate: 1500,
      }),
    ).toBe(5050);
  });

  it('plats item/buff après le multiplicateur, buffRate sur le tout, archive sur la base seule', () => {
    // flat = 100+10+20+30 = 160 ; rate = 1000+50 = 1050 → trunc(160×1050/1000)=168
    // sub = 168 + 40 + 5 = 213 ; ×(1000+100)/1000 = trunc(234.3) = 234
    // archive : trunc(100×200/1000) = 20 → total 254
    expect(
      calcFinalStat({
        ...baseStat,
        baseValue: 100,
        evolutionValue: 10,
        awakeningValue: 20,
        monadEnchantValue: 30,
        awakeningValueRate: 50,
        itemOptionValue: 40,
        buffValue: 5,
        buffValueRate: 100,
        archiveStatValueRate: 200,
      }),
    ).toBe(254);
  });

  it('clampe un total négatif à 0', () => {
    expect(calcFinalStat({ ...baseStat, baseValue: 100, buffValueRate: -2000 })).toBe(0);
  });

  it('chaque division tronque vers zéro', () => {
    // flat=3, rate=1500 → trunc(4.5)=4 (pas 5)
    expect(calcFinalStat({ ...baseStat, baseValue: 3, spawnAdvantageRate: 500 })).toBe(4);
  });
});

// ── Probabilités ────────────────────────────────────────────────────────────

describe('checkProbability', () => {
  it('false si value < 1, quel que soit le tirage', () => {
    expect(checkProbability(0, 1000, 0)).toBe(false);
  });

  it('succès si roll ≤ value (tirage inclusif [0, max])', () => {
    expect(checkProbability(500, 1000, 500)).toBe(true);
    expect(checkProbability(500, 1000, 501)).toBe(false);
    expect(checkProbability(1000, 1000, 1000)).toBe(true); // 100 % : jamais d'échec
  });
});

describe('checkResist', () => {
  it('jamais de résistance si chance > resist', () => {
    expect(checkResistThreshold(500, 400)).toBe(0);
    expect(checkResist(500, 400, 0)).toBe(false);
  });

  it('diff = 0 → seuil 9 (floor(1000/101))', () => {
    expect(checkResistThreshold(300, 300)).toBe(9);
  });

  it('diff = 100 → seuil 500 ; diff = 900 → 899 (le floor float32 perd 1 ‰)', () => {
    expect(checkResistThreshold(0, 100)).toBe(500);
    // En réels : 1000/(100/900+1) = 900 pile ; en float32 le quotient tombe
    // juste sous 900 et FloorToInt donne 899 — fidèle au binaire.
    expect(checkResistThreshold(100, 1000)).toBe(899);
  });

  it('roll comparé au seuil (≤)', () => {
    expect(checkResist(0, 100, 500)).toBe(true);
    expect(checkResist(0, 100, 501)).toBe(false);
  });

  it('float32 exact sur toute la plage — ancré par une référence externe', () => {
    // L'émulation fround a été validée à 0 divergence sur diff ∈ [0, 20000]
    // contre une référence float32 exacte (rationnels + arrondi au plus proche
    // fait à la main — le double arrondi double→f32 est inoffensif : 53 ≥ 2×24+2).
    // Somme de contrôle et valeurs témoins issues de cette référence :
    expect(checkResistThreshold(0, 1)).toBe(9);
    expect(checkResistThreshold(0, 2)).toBe(19);
    expect(checkResistThreshold(0, 50)).toBe(333);
    expect(checkResistThreshold(0, 250)).toBe(714);
    expect(checkResistThreshold(0, 899)).toBe(899);
    expect(checkResistThreshold(0, 901)).toBe(900);
    expect(checkResistThreshold(0, 5000)).toBe(980);
    let sum = 0;
    for (let diff = 0; diff <= 5000; diff++) sum += checkResistThreshold(0, diff);
    expect(sum).toBe(4604830);
  });
});

// ── Élément ─────────────────────────────────────────────────────────────────

describe('getElementSuperiority', () => {
  it('triangle Terre > Eau > Feu > Terre', () => {
    expect(getElementSuperiority(Element.Earth, Element.Water)).toBe(
      ElementSuperiority.AttackerWin,
    );
    expect(getElementSuperiority(Element.Water, Element.Fire)).toBe(ElementSuperiority.AttackerWin);
    expect(getElementSuperiority(Element.Fire, Element.Earth)).toBe(ElementSuperiority.AttackerWin);
    expect(getElementSuperiority(Element.Water, Element.Earth)).toBe(
      ElementSuperiority.AttackerLose,
    );
    expect(getElementSuperiority(Element.Fire, Element.Water)).toBe(
      ElementSuperiority.AttackerLose,
    );
    expect(getElementSuperiority(Element.Earth, Element.Fire)).toBe(
      ElementSuperiority.AttackerLose,
    );
    expect(getElementSuperiority(Element.Earth, Element.Earth)).toBe(ElementSuperiority.Equal);
  });

  it('Lumière/Ténèbres : mutuellement forts, neutres contre le triangle', () => {
    expect(getElementSuperiority(Element.Light, Element.Dark)).toBe(ElementSuperiority.AttackerWin);
    expect(getElementSuperiority(Element.Dark, Element.Light)).toBe(ElementSuperiority.AttackerWin);
    expect(getElementSuperiority(Element.Light, Element.Light)).toBe(ElementSuperiority.Equal);
    expect(getElementSuperiority(Element.Light, Element.Fire)).toBe(ElementSuperiority.Equal);
    expect(getElementSuperiority(Element.Fire, Element.Dark)).toBe(ElementSuperiority.Equal);
  });
});

describe('getElementeryDamageRate', () => {
  it('1200 / 1000 / 800 selon l’avantage', () => {
    expect(
      getElementeryDamageRate({ attackerElement: Element.Earth, defenderElement: Element.Water }),
    ).toBe(1200);
    expect(
      getElementeryDamageRate({ attackerElement: Element.Earth, defenderElement: Element.Earth }),
    ).toBe(1000);
    expect(
      getElementeryDamageRate({ attackerElement: Element.Water, defenderElement: Element.Earth }),
    ).toBe(800);
  });

  it('le bonus ELEMENT_ENCHANT ne joue que si avantage (réel ou forcé)', () => {
    expect(
      getElementeryDamageRate({
        attackerElement: Element.Earth,
        defenderElement: Element.Water,
        elementDamageRateBonus: 100,
      }),
    ).toBe(1300);
    expect(
      getElementeryDamageRate({
        attackerElement: Element.Earth,
        defenderElement: Element.Earth,
        elementDamageRateBonus: 100,
      }),
    ).toBe(1000);
    expect(
      getElementeryDamageRate({
        attackerElement: Element.Water,
        defenderElement: Element.Earth,
        forcedSuperiority: true,
        elementDamageRateBonus: 50,
      }),
    ).toBe(1250);
    expect(
      getElementeryDamageRate({
        attackerElement: Element.Earth,
        defenderElement: Element.Water,
        forcedInferiority: true,
      }),
    ).toBe(800);
  });
});

// ── CheckDamageRate ─────────────────────────────────────────────────────────

const rateBase: CheckDamageRateInput = {
  attacker: { criticalRate: 0, criticalDmgRate: 1500, dmgBoost: 0 },
  defender: { avoid: 0, dmgReduceRate: 0, enemyCriticalDamageReduce: 0, hasInvincibleBuff: false },
  rolls: { avoid: 1000, critical: 1000 },
};

describe('checkDamageRate', () => {
  it('hit normal : taux 1000', () => {
    expect(checkDamageRate(rateBase)).toEqual({ type: DamageRateType.Normal, rate: 1000 });
  });

  it('invincible : taux 0, sans autres modificateurs', () => {
    expect(
      checkDamageRate({
        ...rateBase,
        defender: { ...rateBase.defender, hasInvincibleBuff: true },
        attacker: { ...rateBase.attacker, dmgBoost: 500 },
      }),
    ).toEqual({ type: DamageRateType.Invincible, rate: 0 });
  });

  it('critique : taux = CriticalDMGRate − EnemyCriticalDamageReduce', () => {
    expect(
      checkDamageRate({
        ...rateBase,
        attacker: { ...rateBase.attacker, criticalRate: 500 },
        defender: { ...rateBase.defender, enemyCriticalDamageReduce: 200 },
        rolls: { avoid: 1000, critical: 500 }, // roll ≤ crit → succès
      }),
    ).toEqual({ type: DamageRateType.Critical, rate: 1300 });
  });

  it("l'esquive prime sur le crit et garde un taux de 1000 (le ×0,5 vient du cœur)", () => {
    expect(
      checkDamageRate({
        ...rateBase,
        attacker: { ...rateBase.attacker, criticalRate: 1000 },
        defender: { ...rateBase.defender, avoid: 300 },
        rolls: { avoid: 300, critical: 0 },
      }),
    ).toEqual({ type: DamageRateType.Missed, rate: 1000 });
  });

  it('modificateurs additifs : +addDmg −dmgReduce +DMGBoost −DMGReduceRate', () => {
    expect(
      checkDamageRate({
        ...rateBase,
        attacker: { ...rateBase.attacker, dmgBoost: 250 },
        defender: { ...rateBase.defender, dmgReduceRate: 100 },
        additionalDamageRate: 300,
        damageReduceRate: 50,
      }),
    ).toEqual({ type: DamageRateType.Normal, rate: 1400 });
  });

  it('plancher à 300 ‰ (rate ≤ 299 → 300)', () => {
    expect(
      checkDamageRate({
        ...rateBase,
        defender: { ...rateBase.defender, dmgReduceRate: 900 },
      }).rate,
    ).toBe(300);
    // 1000 − 700 = 300 : pas de clamp (il faut ≤ 299)
    expect(
      checkDamageRate({
        ...rateBase,
        defender: { ...rateBase.defender, dmgReduceRate: 700 },
      }).rate,
    ).toBe(300);
    expect(
      checkDamageRate({
        ...rateBase,
        defender: { ...rateBase.defender, dmgReduceRate: 699 },
      }).rate,
    ).toBe(301);
  });

  it('attaque additive : conserve le résultat précédent, refait le taux', () => {
    const crit = checkDamageRate({
      ...rateBase,
      previousResult: DamageRateType.Critical,
    });
    expect(crit).toEqual({ type: DamageRateType.Critical, rate: 1500 });
    const miss = checkDamageRate({
      ...rateBase,
      previousResult: DamageRateType.Missed,
    });
    expect(miss).toEqual({ type: DamageRateType.Missed, rate: 1000 });
  });

  it('override world boss finish : NORMAL 1000 sans modificateurs', () => {
    expect(
      checkDamageRate({
        ...rateBase,
        worldBossFinishAttackByBoss: true,
        attacker: { ...rateBase.attacker, dmgBoost: 500 },
      }),
    ).toEqual({ type: DamageRateType.Normal, rate: 1000 });
  });

  it('addCheckEnemyTeamDecreaseDamageRate : + valeur × cibles', () => {
    expect(addCheckEnemyTeamDecreaseDamageRate(1000, 50, 3)).toBe(1150);
  });
});

// ── CalcDamage (cœur) ───────────────────────────────────────────────────────

const coreBase: DamageCoreInput = {
  attackStat: 10000,
  skillFactor: 1000,
  piercePowerRate: 0,
  piercePower: 0,
  defense: 1000,
  damageFactor: 1000,
  damageRate: 1000,
  elementalRate: 1000,
};

describe('calcDamageCore', () => {
  it('cas nominal : mitigation = 1/(1 + def/1000)', () => {
    // 10000 ATK, facteurs 100 %, 1000 DEF → ×0,5 → 5000
    expect(calcDamageCore(coreBase)).toBe(5000);
  });

  it('critique ×1,5 via le taux', () => {
    expect(calcDamageCore({ ...coreBase, damageRate: 1500 })).toBe(7500);
  });

  it('élément fort ×1,2 / faible ×0,8', () => {
    expect(calcDamageCore({ ...coreBase, elementalRate: 1200 })).toBe(6000);
    expect(calcDamageCore({ ...coreBase, elementalRate: 800 })).toBe(4000);
  });

  it('pénétration % : 100 % de pen annule la défense', () => {
    expect(calcDamageCore({ ...coreBase, piercePowerRate: 1000 })).toBe(10000);
  });

  it('pénétration plate au-delà de la défense : amplification bornée ×1000 (defTerm ≥ −999000)', () => {
    expect(calcDamageCore({ ...coreBase, piercePower: 2000 })).toBe(10_000_000);
  });

  it('cible marquée : ×1150/1000', () => {
    expect(calcDamageCore({ ...coreBase, defenderMarked: true })).toBe(5750);
  });

  it('miss : ×MISSED_DAMAGE_RATE (500 ‰)', () => {
    expect(calcDamageCore({ ...coreBase, isMissed: true })).toBe(2500);
  });

  it('réduction finale : ×(1000 − r)/1000, appliquée en dernier', () => {
    expect(calcDamageCore({ ...coreBase, finalReduceRate: 300 })).toBe(3500);
  });

  it('minimum 1, même à taux plancher sur une cible blindée', () => {
    expect(
      calcDamageCore({
        ...coreBase,
        attackStat: 1,
        skillFactor: 100,
        defense: 100000,
        damageRate: 300,
      }),
    ).toBe(1);
  });

  it('tronque vers zéro à la dernière division (÷1e6)', () => {
    // 333×100×1000/1000 = 33300 ; def 0 → 33300 ; ×1000/1000 ; ×1000/1000 ;
    // ×1000/1e6 = 33.3 → 33
    expect(
      calcDamageCore({
        ...coreBase,
        attackStat: 333,
        damageFactor: 100,
        defense: 0,
      }),
    ).toBe(33);
  });

  it('ordre des troncatures conforme (chaîne de div1000 successives)', () => {
    // atk=101, factor=999, skill=999 → trunc(101×999×999/1000)=100 798 (100798,899)
    // def=0 ; rate=999 → trunc(100798×999/1000)=100 697 (100697,202)
    // elem=999 → trunc(100697×999/1000)=100 596 (100596,303)
    // final : trunc(100596×1000/1e6)=100
    expect(
      calcDamageCore({
        ...coreBase,
        attackStat: 101,
        damageFactor: 999,
        skillFactor: 999,
        defense: 0,
        damageRate: 999,
        elementalRate: 999,
      }),
    ).toBe(100);
  });
});

describe('calcDamage (sorties annexes)', () => {
  it('taux 0 ou facteur 0 → tout à zéro', () => {
    expect(calcDamage({ ...coreBase, damageRate: 0 })).toEqual({
      damage: 0,
      vampiric: 0,
      hitRecovery: 0,
    });
    expect(calcDamage({ ...coreBase, damageFactor: 0 })).toEqual({
      damage: 0,
      vampiric: 0,
      hitRecovery: 0,
    });
  });

  it('vampirisme = MulPermille(dégâts, stat)', () => {
    const r = calcDamage({ ...coreBase, vampiric: 150 });
    expect(r.damage).toBe(5000);
    expect(r.vampiric).toBe(750);
  });

  it('hitRecovery = FloorToInt(float32(stat × dégâts) × 0.001f)', () => {
    const r = calcDamage({ ...coreBase, hitHpRecovery: 50 });
    // 50 × 5000 = 250000 → ×0.001f = 250.00000119… → 250
    expect(r.hitRecovery).toBe(250);
  });
});

describe('adjustLastHitDamage', () => {
  it('rehausse le dernier hit pour atteindre le total de la compétence', () => {
    expect(adjustLastHitDamage(10000, 6000, 3000)).toBe(4000);
  });
  it('ne corrige jamais à la baisse', () => {
    expect(adjustLastHitDamage(10000, 6000, 5000)).toBe(5000);
  });
});

// ── DOT ─────────────────────────────────────────────────────────────────────

describe('calcDamageDOT', () => {
  const dotBase = {
    piercePowerRate: 0,
    piercePower: 0,
    defense: 1000,
    dmgReduceRate: 0,
    attackRate: 350,
    statValue: 10000,
  };

  it('rate × stat / 1000 × mitigation défense', () => {
    // 350×10000 ×1e6/2e6 = 1 750 000 → ×1000/1e6 = 1750
    expect(calcDamageDOT(dotBase)).toBe(1750);
  });

  it('DMG Reduce cappé à 900 ‰', () => {
    expect(calcDamageDOT({ ...dotBase, dmgReduceRate: 950 })).toBe(
      calcDamageDOT({ ...dotBase, dmgReduceRate: 900 }),
    );
    expect(calcDamageDOT({ ...dotBase, dmgReduceRate: 900 })).toBe(175);
  });

  it('ignore crit/élément, pas de minimum 1', () => {
    expect(calcDamageDOT({ ...dotBase, statValue: 1, attackRate: 100 })).toBe(0);
  });
});

// ── WG ──────────────────────────────────────────────────────────────────────

describe('calcDamageWG', () => {
  it('invincible WG → 0', () => {
    expect(calcDamageWG({ defenderWgInvincible: true, skillWgReduce: 3 })).toBe(0);
  });

  it('customValue prioritaire, sinon WGReduce du skill', () => {
    expect(calcDamageWG({ skillWgReduce: 3 })).toBe(3);
    expect(calcDamageWG({ skillWgReduce: 3, customValue: 5 })).toBe(5);
  });

  it('ApplyRate(flat + wg, rate) puis clamp ≥ 0', () => {
    expect(calcDamageWG({ skillWgReduce: 4, wgReduceFlat: -2, wgReduceRate: 500 })).toBe(3);
    expect(calcDamageWG({ skillWgReduce: 2, wgReduceRate: -2000 })).toBe(0);
  });
});

// ── Partage de dégâts ───────────────────────────────────────────────────────

describe('calcCharacterSharedDamage', () => {
  it('les parts multi se calculent sur les dégâts ORIGINAUX', () => {
    const r = calcCharacterSharedDamage(10000, [300, 300]);
    expect(r.multiShared).toEqual([3000, 3000]);
    expect(r.remaining).toBe(4000);
    expect(r.singleShared).toBe(0);
  });

  it('le restant est borné à 0 puis le partage simple prend sur le restant', () => {
    const r = calcCharacterSharedDamage(10000, [600, 600], 500);
    expect(r.multiShared).toEqual([6000, 6000]);
    expect(r.remaining).toBe(0);
    expect(r.singleShared).toBe(0);
  });

  it('partage simple seul : MulPermille(restant, valeur)', () => {
    const r = calcCharacterSharedDamage(10000, [], 400);
    expect(r.singleShared).toBe(4000);
    expect(r.remaining).toBe(6000);
  });
});

// ── Helpers d'agrégats ──────────────────────────────────────────────────────

describe('getLostHPRateValue', () => {
  it('trunc((maxHP − hp) × v / maxHP)', () => {
    expect(getLostHPRateValue(10000, 2500, 400)).toBe(300); // 75 % perdus × 400
    expect(getLostHPRateValue(3, 1, 100)).toBe(66); // trunc(66.67)
    expect(getLostHPRateValue(0, 0, 100)).toBe(0);
  });
});

describe('getStatValuePermille', () => {
  it('trunc(stat × p / 1000)', () => {
    expect(getStatValuePermille(12345, 70)).toBe(864); // 864.15
  });
  it('sature à INT32_MAX au-delà de la garde du binaire', () => {
    expect(getStatValuePermille(2147483647, 1000)).toBe(2147483647);
    expect(getStatValuePermille(2147483647, 1001)).toBe(2147483647);
  });
});

// ── Invariants transverses ──────────────────────────────────────────────────

describe('invariants', () => {
  it('un crit fait toujours au moins autant qu’un hit normal (CriticalDMGRate ≥ 1000)', () => {
    for (const def of [0, 500, 2000, 50000]) {
      const normal = calcDamageCore({ ...coreBase, defense: def, damageRate: 1000 });
      const crit = calcDamageCore({ ...coreBase, defense: def, damageRate: 1500 });
      expect(crit).toBeGreaterThanOrEqual(normal);
    }
  });

  it('élément : fort ≥ neutre ≥ faible à entrées égales', () => {
    for (const atk of [100, 10000, 999999]) {
      const strong = calcDamageCore({ ...coreBase, attackStat: atk, elementalRate: 1200 });
      const neutral = calcDamageCore({ ...coreBase, attackStat: atk, elementalRate: 1000 });
      const weak = calcDamageCore({ ...coreBase, attackStat: atk, elementalRate: 800 });
      expect(strong).toBeGreaterThanOrEqual(neutral);
      expect(neutral).toBeGreaterThanOrEqual(weak);
    }
  });

  it('la défense diminue les dégâts, la pénétration les remonte sans dépasser ×1000', () => {
    const noDef = calcDamageCore({ ...coreBase, defense: 0 });
    const withDef = calcDamageCore(coreBase);
    const pierced = calcDamageCore({ ...coreBase, piercePowerRate: 1000 });
    expect(withDef).toBeLessThan(noDef);
    expect(pierced).toBe(noDef);
    const maxAmp = calcDamageCore({ ...coreBase, piercePower: 10_000_000 });
    expect(maxAmp).toBe(noDef * 1000);
  });

  it('dégâts toujours ≥ 1 quand taux et facteur sont non nuls', () => {
    for (const def of [0, 1000, 10_000_000]) {
      expect(
        calcDamageCore({
          ...coreBase,
          attackStat: 1,
          damageFactor: 1,
          skillFactor: 1,
          defense: def,
        }),
      ).toBeGreaterThanOrEqual(1);
    }
  });
});

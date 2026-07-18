import { describe, expect, it } from 'vitest';
import { calcNoGearBattlePower, type NoGearCpInput } from './combat-power';

// Combat Power sans équipement (CalcBattlePower, gear zéroé). La formule est
// reverse-engineered et « validée 0-diff in-game par le gear-solver » — ce test
// la VERROUILLE contre une régression accidentelle. Deux familles :
//  - invariants : les termes ADDITIFS et le cap sont exacts et hand-dérivés du
//    modèle (indépendants du reste de la formule) ;
//  - snapshots : sorties complètes de profils réalistes, figées à l'état
//    validé (une modif du cœur stat-dépendant les fait bouger → revue voulue).

const BASE: NoGearCpInput = {
  atk: 2000,
  def: 900,
  hp: 8000,
  spd: 110,
  critRate: 15,
  critDmg: 150,
  eff: 0,
  effRes: 0,
  showUIStar: 5,
  starPlus: 0,
  skills: { first: 5, second: 5, ultimate: 5, chainPassive: 5 },
  fused: false,
};

describe('calcNoGearBattlePower — invariants additifs (hand-dérivés)', () => {
  const cp = calcNoGearBattlePower;

  it('une étoile UI de plus vaut exactement +500', () => {
    expect(cp({ ...BASE, showUIStar: 6 }) - cp(BASE)).toBe(500);
  });

  it('un « +1 » d’étoile vaut exactement +120', () => {
    expect(cp({ ...BASE, starPlus: 1 }) - cp(BASE)).toBe(120);
  });

  it('un niveau de skill au-dessus de 1 vaut exactement +100', () => {
    const oneUp = { ...BASE, skills: { ...BASE.skills, first: 6 } };
    expect(cp(oneUp) - cp(BASE)).toBe(100);
  });

  it('les skills tout-Lv1 n’ajoutent rien (le compte est niveau − 1)', () => {
    const allLv1 = { ...BASE, skills: { first: 1, second: 1, ultimate: 1, chainPassive: 1 } };
    // BASE = 4 skills à Lv5 → 4 × (5 − 1) × 100 = 1600 ; allLv1 = 0.
    expect(cp(BASE) - cp(allLv1)).toBe(1600);
  });

  it('la Core Fusion vaut exactement +5000', () => {
    expect(cp({ ...BASE, fused: true }) - cp(BASE)).toBe(5000);
  });

  it('le crit rate est cappé à 100 % (130 ≡ 100)', () => {
    expect(cp({ ...BASE, critRate: 130 })).toBe(cp({ ...BASE, critRate: 100 }));
  });

  it('la sortie est un entier (Math.floor final)', () => {
    expect(Number.isInteger(cp(BASE))).toBe(true);
  });
});

describe('calcNoGearBattlePower — snapshots de régression (profils réalistes)', () => {
  const cp = calcNoGearBattlePower;

  it('DPS striker (crit-heavy)', () => {
    expect(
      cp({
        ...BASE,
        atk: 2600,
        def: 700,
        hp: 7200,
        spd: 128,
        critRate: 40,
        critDmg: 220,
        eff: 20,
        effRes: 10,
      }),
    ).toBe(19413);
  });

  it('Tank (HP/DEF-heavy, 5+3★)', () => {
    expect(
      cp({
        ...BASE,
        atk: 1400,
        def: 1500,
        hp: 13500,
        spd: 96,
        critRate: 10,
        eff: 15,
        effRes: 60,
        starPlus: 3,
      }),
    ).toBe(24059);
  });

  it('Support fusionné', () => {
    expect(
      cp({
        ...BASE,
        atk: 1800,
        def: 1000,
        hp: 9500,
        spd: 140,
        critRate: 20,
        critDmg: 160,
        eff: 55,
        effRes: 40,
        fused: true,
      }),
    ).toBe(24605);
  });

  it('crit cappé + DMG UP + PEN (coude du facteur crit)', () => {
    expect(cp({ ...BASE, atk: 2200, critRate: 130, critDmg: 300, dmgUp: 50, pen: 30 })).toBe(25497);
  });
});

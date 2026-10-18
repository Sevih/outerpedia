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

describe('calcNoGearBattlePower — float32 du client (`CFormula.CalcBattlePower`)', () => {
  // Réimplémentation À PART, terme à terme depuis le C# (entrées raw entières).
  const f = Math.fround;
  const client = (s: NoGearCpInput): number => {
    const crc = Math.min(Math.round(s.critRate * 10), 1000);
    const chd = Math.round(s.critDmg * 10);
    const pen = Math.round((s.pen ?? 0) * 10);
    const up = Math.round((s.dmgUp ?? 0) * 10);
    const red = Math.round((s.dmgReduce ?? 0) * 10) + Math.round((s.critDmgReduce ?? 0) * 10);
    const n5 = f(chd + up);
    const n6 =
      n5 <= 2000
        ? f(n5 / 1000)
        : f(2.5 + f(2 * f(1 - f(Math.pow(f(1 - Math.min(1, f(f(n5 - 2000) / 2500))), 2)))));
    let x = f(s.atk * f(f(1000 + crc) * f(0.001)));
    x = f(x * n6);
    x = f(x * f(f(1000 + f(pen * 1.5)) * f(0.001)));
    x = f(x * f(1 + f(s.spd / 50)));
    x = f(x * f(1 + f(f(1.7) * f(s.eff / f(s.eff + 130)))));
    const n7 = f(f(s.atk + x) / 8);
    const hd = f(s.hp + s.def);
    let y = f(hd * f(f(1.05) + f(f(0.15) * f(44000 / f(hd + 44000)))));
    y = f(y * f(1 + f(f(0.25) * f(red / f(red + 200)))));
    y = f(y * f(1 + f(f(0.25) * f(s.effRes / f(s.effRes + 200)))));
    const lv = s.skills.first + s.skills.second + s.skills.ultimate + s.skills.chainPassive;
    const n9 = f(f(f(s.showUIStar * 500) + f(s.starPlus * 120)) + f(f(lv - 4) * 100));
    return Math.floor(f(f(f(f(f(n7 + y) + n9) + 0) + 0) + (s.fused ? 5000 : 0)));
  };

  it('égal au client sur 20 000 tirages (le double sortait ±1 sur ~0,75 %)', () => {
    let seed = 12345;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const ri = (a: number, b: number) => Math.floor(a + rnd() * (b - a + 1));
    for (let i = 0; i < 20_000; i++) {
      const s: NoGearCpInput = {
        atk: ri(400, 6000),
        def: ri(300, 4000),
        hp: ri(3000, 30000),
        spd: ri(100, 320),
        critRate: ri(0, 1000) / 10,
        critDmg: ri(1500, 3800) / 10,
        eff: ri(0, 450),
        effRes: ri(0, 450),
        pen: ri(0, 600) / 10,
        dmgUp: ri(0, 500) / 10,
        dmgReduce: ri(0, 400) / 10,
        critDmgReduce: ri(0, 500) / 10,
        showUIStar: ri(3, 6),
        starPlus: ri(0, 3),
        skills: { first: 5, second: 5, ultimate: 5, chainPassive: 5 },
        fused: rnd() < 0.1,
      };
      expect(calcNoGearBattlePower(s), JSON.stringify(s)).toBe(client(s));
    }
  });
});

import { describe, expect, it } from 'vitest';
import {
  CLOSE_MARGIN,
  defaultLevel,
  judgeSubstat,
  sumFlatAt,
  type SubstatFlatProfile,
} from './substat-verdict';

// Ticks 6★ réels (sub-ticks.json) : ATK/DEF +40 | +4 %, HP +73 | +3 %.
const ATK6 = { flat: 40, pct: 4 };
const HP6 = { flat: 73, pct: 3 };

describe('judgeSubstat — verdict flat vs %', () => {
  it('équivalent-flat exact : base × pct / 100', () => {
    const v = judgeSubstat(1099, ATK6);
    expect(v.equivFlat).toBeCloseTo(43.96, 10);
    expect(v.flatTick).toBe(40);
    expect(v.pctTick).toBe(4);
    expect(v.sumFlat).toBe(1099);
  });

  it('bascule = flatTick × 100 / pctTick (1000 ATK, 2433.33 HP au 6★)', () => {
    expect(judgeSubstat(1, ATK6).breakeven).toBe(1000);
    expect(judgeSubstat(1, HP6).breakeven).toBeCloseTo(2433.33, 2);
  });

  it('des deux côtés de la bascule, hors marge', () => {
    // 1200 ATK → 48 vs 40 (+20 %) : le % gagne.
    expect(judgeSubstat(1200, ATK6).kind).toBe('pct');
    // 320 DEF → 12.8 vs 40 : le plat gagne largement.
    expect(judgeSubstat(320, ATK6).kind).toBe('flat');
  });

  it('égalité pile à la bascule → ≈ (et la marge de 5 % autour)', () => {
    expect(judgeSubstat(1000, ATK6).kind).toBe('close');
    // 1040 → 41.6 vs 40 : +4 %, sous la marge.
    expect(judgeSubstat(1040, ATK6).kind).toBe('close');
    // 960 → 38.4 vs 40 : −4 %, sous la marge.
    expect(judgeSubstat(960, ATK6).kind).toBe('close');
    // 1060 → 42.4 : +6 %, hors marge.
    expect(judgeSubstat(1060, ATK6).kind).toBe('pct');
    expect(judgeSubstat(940, ATK6).kind).toBe('flat');
    expect(CLOSE_MARGIN).toBe(0.05);
  });

  it('la marge est paramétrable (0 = verdict binaire sauf égalité exacte)', () => {
    expect(judgeSubstat(1001, ATK6, 0).kind).toBe('pct');
    expect(judgeSubstat(999, ATK6, 0).kind).toBe('flat');
    expect(judgeSubstat(1000, ATK6, 0).kind).toBe('close');
  });

  it('garde pctTick = 0 : pas de division par zéro, le plat gagne', () => {
    const v = judgeSubstat(5000, { flat: 40, pct: 0 });
    expect(v.kind).toBe('flat');
    expect(v.equivFlat).toBe(0);
    expect(v.breakeven).toBeNull();
    expect(Number.isFinite(v.equivFlat)).toBe(true);
  });

  it('garde flatTick = 0 : le % gagne dès qu’il rapporte', () => {
    expect(judgeSubstat(500, { flat: 0, pct: 4 }).kind).toBe('pct');
    expect(judgeSubstat(0, { flat: 0, pct: 4 }).kind).toBe('close');
  });

  it('monotone en la base : plus la base monte, plus le % gagne, jamais l’inverse', () => {
    const rank = { flat: 0, close: 1, pct: 2 } as const;
    let prev = -1;
    for (let base = 0; base <= 3000; base += 7) {
      const r = rank[judgeSubstat(base, ATK6).kind];
      expect(r).toBeGreaterThanOrEqual(prev);
      prev = r;
    }
    expect(prev).toBe(2);
  });
});

describe('profil — paliers stables 100 / 105 / 110 / 120', () => {
  const profile: SubstatFlatProfile = {
    levels: [100, 105, 110, 120],
    flatByLevel: {
      ATK: { 100: 1000, 105: 1100, 110: 1200, 120: 1400 },
      DEF: { 100: 300, 105: 320, 110: 340, 120: 380 },
      HP: { 100: 3800, 105: 4200, 110: 4500, 120: 5300 },
    },
    awakFlat: { ATK: 100, DEF: 200, HP: 100 },
  };

  it('defaultLevel : 100 — on ne suppose pas le limit break', () => {
    expect(defaultLevel(profile)).toBe(100);
    expect(defaultLevel({ ...profile, levels: [105, 110] })).toBe(105);
  });

  it('sumFlatAt : base du palier + quirks plats (optionnels), palier inconnu → 0', () => {
    expect(sumFlatAt(profile, 'ATK', 105, false)).toBe(1100);
    expect(sumFlatAt(profile, 'ATK', 105, true)).toBe(1200);
    expect(sumFlatAt(profile, 'HP', 120, false)).toBe(5300);
    expect(sumFlatAt(profile, 'DEF', 107, false)).toBe(0);
  });
});

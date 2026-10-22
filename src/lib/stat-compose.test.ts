import { describe, expect, it } from 'vitest';
import {
  applySpdRate,
  composeStep,
  STEP_STAT_KEYS,
  type StatLayersView,
  type StatStepView,
  type StepStatKey,
} from './stat-compose';

describe('applySpdRate — taux de vitesse externe (étage BuffValueRate de CalcFinalStat)', () => {
  it('taux 0 = identité', () => {
    expect(applySpdRate(133, 0)).toBe(133);
    expect(applySpdRate(0, 0)).toBe(0);
  });

  it('4,3 % sur 133 → 138 : trunc(133 × 1043 / 1000) = trunc(138,719)', () => {
    expect(applySpdRate(133, 4.3)).toBe(138);
  });

  it('tronque, n’arrondit pas : 149 × 1043 / 1000 = 155,407 → 155', () => {
    expect(applySpdRate(149, 4.3)).toBe(155);
    expect(applySpdRate(100, 4.99)).toBe(104);
  });
});

describe('composeStep — SPD : le taux du noyau multiplie le TOTAL', () => {
  const zero = Object.fromEntries(STEP_STAT_KEYS.map((k) => [k, 0])) as Record<StepStatKey, number>;
  const step: StatStepView = {
    key: 'lv1_ev0',
    level: 1,
    evo: 0,
    stats: { ...zero, SPD: 133 },
    base: { ...zero, SPD: 133 },
  };
  const layers = (spdPct?: number): StatLayersView => ({
    transcend: [],
    codex: [{ atkPM: 0, defPM: 0, hpPM: 0 }],
    quirks: { stat: { flat: { SPD: 2 } }, buff: { flat: { SPD: 3 } } },
    passives: { flat: { SPD: 5 }, ...(spdPct ? { spdPct } : {}) },
  });
  const sel = { tierIdx: -1, codexLevel: 0, quirksOn: true };

  it('sans taux : somme des plats, le delta hors quirks stat', () => {
    expect(composeStep(step, layers(), sel).SPD).toEqual({ value: 143, delta: 8 });
  });

  it('avec 4,3 % : trunc((133 + 2 + 3 + 5) × 1043 / 1000) = 149, pas 143 + un taux sur la seule base', () => {
    expect(composeStep(step, layers(4.3), sel).SPD).toEqual({ value: 149, delta: 14 });
  });
});

/**
 * Invariants du générateur timegate-resources sur
 * `data/generated/timegate-resources.json` committé : le guide « Weekly &
 * Monthly Reference Tables » mêle sources de shop DÉRIVÉES et sources non-shop
 * CURÉES — une dérive rendrait un total faux ou une source orpheline.
 *
 * Les cœurs `computeAsOf`/`isCurrent` sont PARTAGÉS avec shop-priorities et déjà
 * couverts là-bas ; ici, invariants seuls sur la sortie. Tourne SANS `.gamedata`.
 */
import { describe, expect, it } from 'vitest';
import timegateData from '../../data/generated/timegate-resources.json';
import type { TimegateResourcesData } from './timegate-resources';

const tg = timegateData as unknown as TimegateResourcesData;
const TYPES = new Set(['mission', 'guild', 'shop', 'craft']);

describe('timegate-resources.json — invariants', () => {
  it('ancre ISO, onglets peuplés', () => {
    expect(tg.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tg.tabs.length).toBeGreaterThan(0);
    for (const t of tg.tabs) expect(t.items.length, t.key).toBeGreaterThan(0);
  });

  it('chaque item : au moins une source, type/origine valides', () => {
    const bad: string[] = [];
    for (const tab of tg.tabs) {
      for (const it of tab.items) {
        if (!it.sources.length) bad.push(`${tab.key}/${it.id} : 0 source`);
        for (const s of it.sources) {
          if (!TYPES.has(s.type)) bad.push(`${tab.key}/${it.id} : type « ${s.type} »`);
          if (s.origin !== 'shop' && s.origin !== 'cured')
            bad.push(`${tab.key}/${it.id} : origin « ${s.origin} »`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('total mensuel global = mensuel + hebdo × 4 (règle V2)', () => {
    const bad: string[] = [];
    for (const tab of tg.tabs) {
      for (const it of tab.items) {
        const expected = it.totals.monthly + it.totals.weekly * 4;
        if (it.totals.grandMonthly !== expected)
          bad.push(`${tab.key}/${it.id} : ${it.totals.grandMonthly} ≠ ${expected}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

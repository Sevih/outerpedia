/**
 * Tests du générateur shop-priorities (guide « Recommended Purchases by Shop ») :
 *   1. CŒURS PURS : `computeAsOf` (ancre déterministe = StartDate max du cluster
 *      d'années contigu, écarte les sentinelles « forever »), `isCurrent`
 *      (produit courant à l'ancre) et `goodsSlug` (slug stable insensible au
 *      prix/rotation). Aucune table requise.
 *   2. INVARIANTS sur `data/generated/shop-priorities.json` committé.
 *
 * Tourne SANS `.gamedata`.
 */
import { describe, expect, it } from 'vitest';
import shopData from '../../data/generated/shop-priorities.json';
import type { Row } from '../lib/tables';
import { computeAsOf, goodsSlug, isCurrent, type ShopPrioritiesData } from './shop-priorities';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('computeAsOf — ancre temporelle déterministe', () => {
  it('prend la StartDate max du cluster contigu, coupe au trou > 1 an', () => {
    const rows: Row[] = [
      { StartDate: '2024-01-01 00:00:00' },
      { StartDate: '2025-06-01 00:00:00' },
      { StartDate: '2026-08-01 00:00:00' },
      { StartDate: '2999-01-01 00:00:00' }, // sentinelle « forever » → écartée
    ];
    expect(computeAsOf(rows)).toEqual({ asOf: '2026-08-01', maxYear: 2026 });
  });

  it('jette si aucune StartDate', () => {
    expect(() => computeAsOf([{}, {}])).toThrow();
  });
});

describe('isCurrent — produit courant à l’ancre', () => {
  const asOf = '2026-08-01';
  const maxYear = 2026;
  it('fenêtre ouverte englobant l’ancre → courant', () => {
    expect(isCurrent({ StartDate: '2026-01-01', EndDate: '2027-01-01' }, asOf, maxYear)).toBe(true);
    expect(isCurrent({}, asOf, maxYear)).toBe(true); // sans dates
  });
  it('placeholder futur / pas encore ouvert / fenêtre close → non courant', () => {
    expect(isCurrent({ StartDate: '2999-01-01' }, asOf, maxYear)).toBe(false); // année > maxYear
    expect(isCurrent({ StartDate: '2026-09-01' }, asOf, maxYear)).toBe(false); // après l'ancre
    expect(isCurrent({ EndDate: '2026-07-01' }, asOf, maxYear)).toBe(false); // close
  });
});

describe('goodsSlug — partie stable du slug (ce qu’on achète)', () => {
  it('item / pièce de perso → item-<id> ; costume → costume-<id>', () => {
    expect(goodsSlug({ ProductGoodsType: 'PGT_ITEM', ProductGoodsID: '123' })).toBe('item-123');
    expect(goodsSlug({ ProductGoodsType: 'PGT_CHARACTER_PIECE', ProductGoodsID: '5' })).toBe(
      'item-5',
    );
    expect(goodsSlug({ ProductGoodsType: 'PGT_COSTUME', ProductGoodsID: '7' })).toBe('costume-7');
  });
  it('gold/ether par VALEUR ; exotiques (ticket…) par clé de nom', () => {
    expect(goodsSlug({ ProductGoodsType: 'PGT_GOLD', ProductGoodsValue: '10000' })).toBe(
      'gold-10000',
    );
    expect(goodsSlug({ ProductGoodsType: 'PGT_CRYSTAL', ProductGoodsValue: '50' })).toBe(
      'ether-50',
    );
    expect(goodsSlug({ ProductGoodsType: 'PGT_TICKET', ProductNameID: 'NAME_X' })).toBe('p-name_x');
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const sp = shopData as unknown as ShopPrioritiesData;
const PERIODS = new Set(['daily', 'weekly', 'monthly', 'one-time']);
const PRIORITIES = new Set(['S', 'A', 'B', 'C']);

describe('shop-priorities.json — invariants', () => {
  it('ancre ISO, shops peuplés', () => {
    expect(sp.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sp.shops.length).toBeGreaterThan(0);
  });

  it('clés stables préfixées par le shop, uniques ; période/priorité valides', () => {
    const bad: string[] = [];
    const seen = new Set<string>();
    for (const s of sp.shops) {
      expect(s.entries.length, s.key).toBeGreaterThan(0);
      for (const e of s.entries) {
        if (!e.key.startsWith(`${s.key}/`)) bad.push(`${e.key} : mauvais préfixe`);
        if (seen.has(e.key)) bad.push(`${e.key} : clé en double`);
        seen.add(e.key);
        if (!PERIODS.has(e.limit.period)) bad.push(`${e.key} : période « ${e.limit.period} »`);
        if (e.priority && !PRIORITIES.has(e.priority))
          bad.push(`${e.key} : priorité « ${e.priority} »`);
      }
    }
    expect(bad).toEqual([]);
  });
});

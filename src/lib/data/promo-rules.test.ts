/**
 * Opérations du staff sur la liste vivante des coupons (`/coupon add|edit|remove`
 * du bot Discord). Si un de ces tests casse, une commande écrase ou perd un code.
 */
import { describe, expect, it } from 'vitest';
import { applyCouponOp, type PromoCode } from './promo-rules';

const coupon = (over: Partial<PromoCode> = {}): PromoCode => ({
  code: 'OUTER2026',
  description: { SYS_ASSET_GOLD: '100000' },
  start: '2026-10-01',
  end: '2026-10-31',
  ...over,
});

const codes = (r: ReturnType<typeof applyCouponOp>) =>
  r.ok ? r.list.map((c) => c.code) : r.errors;

describe('applyCouponOp', () => {
  const list = [coupon({ code: 'A' }), coupon({ code: 'B' })];

  it('add : en tête de liste, espaces de bord retirés', () => {
    expect(
      codes(applyCouponOp(list, { action: 'add', coupon: coupon({ code: ' NEW ' }) })),
    ).toEqual(['NEW', 'A', 'B']);
  });

  it('add : refuse un code déjà présent (sensible à la casse)', () => {
    expect(applyCouponOp(list, { action: 'add', coupon: coupon({ code: 'A' }) }).ok).toBe(false);
    expect(applyCouponOp(list, { action: 'add', coupon: coupon({ code: 'a' }) }).ok).toBe(true);
  });

  it('edit : remplace l’entrée à sa place, renommage compris', () => {
    const r = applyCouponOp(list, {
      action: 'edit',
      code: 'A',
      coupon: coupon({ code: 'A2', end: '2026-11-30' }),
    });
    expect(codes(r)).toEqual(['A2', 'B']);
    expect(r.ok && r.list[0]?.end).toBe('2026-11-30');
  });

  it('edit : refuse un code inconnu, ou un renommage vers un code pris', () => {
    expect(
      applyCouponOp(list, { action: 'edit', code: 'Z', coupon: coupon({ code: 'Z' }) }).ok,
    ).toBe(false);
    expect(
      applyCouponOp(list, { action: 'edit', code: 'A', coupon: coupon({ code: 'B' }) }).ok,
    ).toBe(false);
  });

  it('remove : retire le seul code visé ; refuse un code inconnu', () => {
    expect(codes(applyCouponOp(list, { action: 'remove', code: 'A' }))).toEqual(['B']);
    expect(applyCouponOp(list, { action: 'remove', code: 'Z' }).ok).toBe(false);
  });

  it('valide la liste obtenue : dates et récompenses', () => {
    const bad = applyCouponOp(list, {
      action: 'add',
      coupon: coupon({ code: 'C', end: '2026-09-01' }),
    });
    expect(bad.ok).toBe(false);
    const empty = applyCouponOp(list, {
      action: 'add',
      coupon: coupon({ code: 'D', description: {} }),
    });
    expect(empty.ok).toBe(false);
  });
});

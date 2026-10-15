/**
 * Opérations du staff sur la liste vivante des coupons (`/coupon add|edit|remove`
 * du bot Discord). Si un de ces tests casse, une commande écrase ou perd un code.
 */
import { describe, expect, it } from 'vitest';
import snapshot from '@data/curated/coupons.json';
import { applyCouponOp, validateBanners, validateCoupons, type PromoCode } from './promo-rules';

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
  const list = [coupon({ code: 'AAAA' }), coupon({ code: 'BBBB' })];

  it('add : en tête de liste, espaces de bord retirés', () => {
    expect(
      codes(applyCouponOp(list, { action: 'add', coupon: coupon({ code: ' NEWCODE ' }) })),
    ).toEqual(['NEWCODE', 'AAAA', 'BBBB']);
  });

  it('add : refuse un code déjà présent, quelle que soit la casse ; range en majuscules', () => {
    expect(applyCouponOp(list, { action: 'add', coupon: coupon({ code: 'AAAA' }) }).ok).toBe(false);
    expect(applyCouponOp(list, { action: 'add', coupon: coupon({ code: 'aaaa' }) }).ok).toBe(false);
    expect(
      codes(applyCouponOp(list, { action: 'add', coupon: coupon({ code: ' newcode ' }) })),
    ).toEqual(['NEWCODE', 'AAAA', 'BBBB']);
  });

  it('edit / remove : retrouvent un code tapé en minuscules', () => {
    expect(codes(applyCouponOp(list, { action: 'remove', code: 'aaaa' }))).toEqual(['BBBB']);
    expect(
      codes(
        applyCouponOp(list, { action: 'edit', code: 'bbbb', coupon: coupon({ code: 'bbbb2' }) }),
      ),
    ).toEqual(['AAAA', 'BBBB2']);
  });

  it('edit : remplace l’entrée à sa place, renommage compris', () => {
    const r = applyCouponOp(list, {
      action: 'edit',
      code: 'AAAA',
      coupon: coupon({ code: 'AAAA2', end: '2026-11-30' }),
    });
    expect(codes(r)).toEqual(['AAAA2', 'BBBB']);
    expect(r.ok && r.list[0]?.end).toBe('2026-11-30');
  });

  it('edit : refuse un code inconnu, ou un renommage vers un code pris', () => {
    expect(
      applyCouponOp(list, { action: 'edit', code: 'ZZZZ', coupon: coupon({ code: 'ZZZZ' }) }).ok,
    ).toBe(false);
    expect(
      applyCouponOp(list, { action: 'edit', code: 'AAAA', coupon: coupon({ code: 'BBBB' }) }).ok,
    ).toBe(false);
  });

  it('remove : retire le seul code visé ; refuse un code inconnu', () => {
    expect(codes(applyCouponOp(list, { action: 'remove', code: 'AAAA' }))).toEqual(['BBBB']);
    expect(applyCouponOp(list, { action: 'remove', code: 'ZZZZ' }).ok).toBe(false);
  });

  it('valide la liste obtenue : dates et récompenses', () => {
    const bad = applyCouponOp(list, {
      action: 'add',
      coupon: coupon({ code: 'CCCC', end: '2026-09-01' }),
    });
    expect(bad.ok).toBe(false);
    const empty = applyCouponOp(list, {
      action: 'add',
      coupon: coupon({ code: 'DDDD', description: {} }),
    });
    expect(empty.ok).toBe(false);
  });
});

describe('validateCoupons — forme du code et date réelle', () => {
  it('accepte 4 à 32 lettres ou chiffres, après majuscules', () => {
    expect(validateCoupons([coupon({ code: 'ABCD' })])).toEqual([]);
    expect(validateCoupons([coupon({ code: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6' })])).toEqual([]);
    expect(applyCouponOp([], { action: 'add', coupon: coupon({ code: ' outer2026 ' }) }).ok).toBe(
      true,
    );
  });

  it('refuse un code trop court, trop long ou hors lettres et chiffres', () => {
    for (const code of ['ABC', 'A'.repeat(33), 'OUTER-2026', 'OUTER 2026', 'CODÉ', '<B>X</B>'])
      expect(validateCoupons([coupon({ code })]).join()).toMatch(
        /code must be 4 to 32 letters or digits/,
      );
  });

  it('refuse une date qui n’existe pas au calendrier', () => {
    expect(validateCoupons([coupon({ start: '2026-02-30' })]).join()).toMatch(/invalid start date/);
    expect(validateCoupons([coupon({ end: '2026-06-31' })]).join()).toMatch(/invalid end date/);
    expect(validateCoupons([coupon({ end: '2026-13-01' })]).join()).toMatch(/invalid end date/);
    expect(validateCoupons([coupon({ start: '2028-02-29', end: '2028-03-01' })])).toEqual([]);
    expect(validateCoupons([coupon({ start: '2027-02-29', end: '2027-03-01' })]).join()).toMatch(
      /invalid start date/,
    );
  });

  it('les bannières suivent la même règle de date', () => {
    const banner = { id: '2000001', name: 'X', start: '2026-04-31', end: '2026-05-10' };
    expect(validateBanners([banner]).join()).toMatch(/invalid start date/);
    expect(validateBanners([{ ...banner, start: '2026-04-30' }])).toEqual([]);
  });

  it('l’instantané committé passe tout entier', () => {
    expect(validateCoupons(snapshot as unknown as PromoCode[])).toEqual([]);
  });
});

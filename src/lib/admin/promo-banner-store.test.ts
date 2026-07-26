/**
 * Contrat des stores CODES PROMO + BANNIÈRES (audit F8) —
 * `data/curated/coupons.json` et `data/curated/banner.json`.
 *
 * ⚠ CONSTAT D'AUDIT verrouillé ici : ces deux stores sont les SEULS à écrire sans
 * la moindre validation ni garde de contenu — `saveCoupons(list)` remplace le
 * fichier, point. La seule protection en place est la garde de FORME des routes
 * (`jsonArrayBody`, audit F3) : elle arrête un payload qui n'est pas un tableau,
 * pas un tableau de n'importe quoi. Les tests DÉCRIVENT cet état ; ils sont
 * l'endroit où poser des règles si on en ajoute (dates, unicité du code).
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';
import type { Banner, PromoCode } from './promo-banner-store';

const box = sandbox('promo-');
// ⚠ APRÈS `sandbox()` : le store fige ses chemins au chargement.
const { saveCoupons, loadCoupons, saveBanners, loadBanners } = await import('./promo-banner-store');

const COUPONS = 'data/curated/coupons.json';
const BANNERS = 'data/curated/banner.json';

const coupon = (over: Partial<PromoCode> = {}): PromoCode => ({
  code: 'OUTER2026',
  description: { Gold: '100000' },
  start: '2026-07-01',
  end: '2026-08-01',
  ...over,
});

const banner = (over: Partial<Banner> = {}): Banner => ({
  id: 'stella',
  name: 'Demiurge Stella',
  start: '2026-07-01',
  end: '2026-08-01',
  ...over,
});

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('coupons', () => {
  it('écrit la liste et la relit à l’identique', async () => {
    await saveCoupons([coupon()]);
    expect(loadCoupons()).toEqual([coupon()]);
  });

  it('REMPLACE la liste entière (ce n’est pas un merge)', async () => {
    await box.put(COUPONS, [coupon({ code: 'VIEUX' }), coupon({ code: 'AUTRE' })]);
    await saveCoupons([coupon({ code: 'SEUL' })]);

    const list = box.read<PromoCode[]>(COUPONS);
    expect(list).toHaveLength(1);
    expect(list[0].code).toBe('SEUL');
  });

  it('accepte une liste VIDE et écrase tout — aucune garde anti-purge', async () => {
    // Le constat d'audit : rien n'empêche de vider le fichier.
    await box.put(COUPONS, [coupon(), coupon({ code: 'B' })]);
    await saveCoupons([]);
    expect(box.read<PromoCode[]>(COUPONS)).toEqual([]);
  });

  it('accepte deux fois le MÊME code sans broncher', async () => {
    // Contraste avec `events-store`, qui refuse un slug en double.
    await saveCoupons([coupon(), coupon()]);
    expect(box.read<PromoCode[]>(COUPONS)).toHaveLength(2);
  });

  it('accepte des dates illisibles (aucune validation ISO)', async () => {
    await saveCoupons([coupon({ start: 'demain', end: 'hier' })]);
    expect(box.read<PromoCode[]>(COUPONS)[0].start).toBe('demain');
  });

  it('conserve l’ordre de la liste', async () => {
    await saveCoupons([coupon({ code: 'A' }), coupon({ code: 'B' }), coupon({ code: 'C' })]);
    expect(box.read<PromoCode[]>(COUPONS).map((c) => c.code)).toEqual(['A', 'B', 'C']);
  });

  it('`loadCoupons` renvoie [] si le fichier est absent', () => {
    expect(loadCoupons()).toEqual([]);
  });
});

describe('bannières', () => {
  it('écrit la liste et la relit à l’identique', async () => {
    await saveBanners([banner()]);
    expect(loadBanners()).toEqual([banner()]);
  });

  it('n’écrit QUE son fichier — les coupons ne bougent pas', async () => {
    // Deux stores, deux fichiers : une confusion de chemin serait invisible au rendu.
    await saveCoupons([coupon()]);
    const before = box.raw(COUPONS);
    await saveBanners([banner()]);

    expect(box.raw(COUPONS)).toBe(before);
    expect(box.read<Banner[]>(BANNERS)).toEqual([banner()]);
  });

  it('accepte une liste vide et écrase tout', async () => {
    await box.put(BANNERS, [banner()]);
    await saveBanners([]);
    expect(box.read<Banner[]>(BANNERS)).toEqual([]);
  });

  it('`loadBanners` renvoie [] si le fichier est absent', () => {
    expect(loadBanners()).toEqual([]);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await saveBanners([banner()]);
    await saveCoupons([coupon()]);
    expect(box.leftovers()).toEqual([]);
  });
});

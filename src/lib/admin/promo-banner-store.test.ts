/**
 * Contrat des stores CODES PROMO + BANNIÈRES —
 * `data/curated/coupons.json` et `data/curated/banner.json`.
 *
 * Ces deux surfaces écrivaient sans AUCUNE validation (constat de F8, seules des
 * 16 dans ce cas) alors que leur sauvegarde PUBLIE sur R2 : une entrée cassée
 * partait en prod sans redéploiement. Validation ajoutée en F10 ; ce fichier
 * verrouille les règles ET le fait que rien ne s'écrit quand elles échouent.
 *
 * Les règles ont été calibrées sur la donnée COMMITTÉE (91 coupons, 48
 * bannières au 26/07) : elles passent toutes, donc l'ajout ne bloque aucune
 * sauvegarde existante — d'où l'absence d'unicité sur l'id de bannière, 19
 * d'entre elles étant des reruns.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';
import type { Banner, PromoCode } from './promo-banner-store';

const box = sandbox('promo-');
// ⚠ APRÈS `sandbox()` : le store fige ses chemins au chargement.
const { saveCoupons, loadCoupons, saveBanners, loadBanners, validateCoupons, validateBanners } =
  await import('./promo-banner-store');

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

describe('validateCoupons', () => {
  it('accepte un coupon complet', () => {
    expect(validateCoupons([coupon()])).toEqual([]);
  });

  it('exige un code non vide', () => {
    expect(validateCoupons([coupon({ code: '  ' })]).join()).toMatch(/code is required/);
  });

  it('refuse deux fois le MÊME code (l’identité de l’entrée)', () => {
    // Deux lignes pour un code, et la période affichée devient un tirage au sort.
    expect(validateCoupons([coupon(), coupon()]).join()).toMatch(/duplicate code/);
  });

  it('exige des dates YYYY-MM-DD strictes', () => {
    for (const start of ['2026-07', '01-07-2026', '2026-07-01T00:00:00Z', 'demain', ''])
      expect(validateCoupons([coupon({ start })]).join()).toMatch(/invalid start date/);
  });

  it('refuse une fin qui précède le début', () => {
    expect(validateCoupons([coupon({ start: '2026-08-01', end: '2026-07-01' })]).join()).toMatch(
      /end date precedes start date/,
    );
  });

  it('accepte une période d’un seul jour (début = fin)', () => {
    expect(validateCoupons([coupon({ start: '2026-07-01', end: '2026-07-01' })])).toEqual([]);
  });

  it('exige au moins une récompense', () => {
    expect(validateCoupons([coupon({ description: {} })]).join()).toMatch(
      /at least one reward is required/,
    );
  });

  it('NUMÉROTE le coupon fautif et rappelle son code', () => {
    const errors = validateCoupons([coupon(), coupon({ code: 'CASSÉ', start: 'demain' })]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^Coupon 2 \(CASSÉ\)/);
  });
});

describe('validateBanners', () => {
  it('accepte une bannière complète', () => {
    expect(validateBanners([banner()])).toEqual([]);
  });

  it('exige un id de perso et un nom', () => {
    expect(validateBanners([banner({ id: '' })]).join()).toMatch(/character id is required/);
    expect(validateBanners([banner({ name: '  ' })]).join()).toMatch(/name is required/);
  });

  it('valide la période comme pour les coupons', () => {
    expect(validateBanners([banner({ end: 'jamais' })]).join()).toMatch(/invalid end date/);
    expect(validateBanners([banner({ start: '2026-08-01', end: '2026-07-01' })]).join()).toMatch(
      /end date precedes start date/,
    );
  });

  it('ACCEPTE le même perso plusieurs fois (les reruns sont légitimes)', () => {
    // Contraste délibéré avec les coupons : 19 des 48 bannières committées le sont.
    expect(validateBanners([banner(), banner({ start: '2027-01-01', end: '2027-02-01' })])).toEqual(
      [],
    );
  });
});

describe('saveCoupons', () => {
  it('écrit la liste et la relit à l’identique', async () => {
    expect(await saveCoupons([coupon()])).toEqual([]);
    expect(loadCoupons()).toEqual([coupon()]);
  });

  it('REMPLACE la liste entière (ce n’est pas un merge)', async () => {
    await box.put(COUPONS, [coupon({ code: 'VIEUX' }), coupon({ code: 'AUTRE' })]);
    await saveCoupons([coupon({ code: 'SEUL' })]);

    const list = box.read<PromoCode[]>(COUPONS);
    expect(list).toHaveLength(1);
    expect(list[0].code).toBe('SEUL');
  });

  it('n’écrit RIEN quand une SEULE entrée est fautive', async () => {
    await box.put(COUPONS, [coupon({ code: 'À GARDER' })]);
    const before = box.raw(COUPONS);

    const errors = await saveCoupons([coupon(), coupon({ code: 'CASSÉ', end: 'jamais' })]);
    expect(errors.length).toBeGreaterThan(0);
    // Intact octet pour octet : la validation protège tout le fichier.
    expect(box.raw(COUPONS)).toBe(before);
  });

  it('accepte une liste VIDE (retirer tous les codes est légitime)', async () => {
    await box.put(COUPONS, [coupon()]);
    expect(await saveCoupons([])).toEqual([]);
    expect(box.read<PromoCode[]>(COUPONS)).toEqual([]);
  });

  it('conserve l’ordre de la liste', async () => {
    await saveCoupons([coupon({ code: 'A' }), coupon({ code: 'B' }), coupon({ code: 'C' })]);
    expect(box.read<PromoCode[]>(COUPONS).map((c) => c.code)).toEqual(['A', 'B', 'C']);
  });

  it('`loadCoupons` renvoie [] si le fichier est absent', () => {
    expect(loadCoupons()).toEqual([]);
  });
});

describe('saveBanners', () => {
  it('écrit la liste et la relit à l’identique', async () => {
    expect(await saveBanners([banner()])).toEqual([]);
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

  it('n’écrit RIEN quand une entrée est fautive', async () => {
    await box.put(BANNERS, [banner({ name: 'À garder' })]);
    const before = box.raw(BANNERS);

    expect((await saveBanners([banner({ id: '' })])).length).toBeGreaterThan(0);
    expect(box.raw(BANNERS)).toBe(before);
  });

  it('accepte une liste vide', async () => {
    await box.put(BANNERS, [banner()]);
    expect(await saveBanners([])).toEqual([]);
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

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
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sandbox } from './store-fixture';
import type { Banner, PromoCode } from './promo-banner-store';

// R2 simulé : ces tests portent sur le fichier LOCAL, pas sur le réseau.
const live = vi.hoisted(() => ({ readLiveCoupons: vi.fn(), writeLiveCoupons: vi.fn() }));
vi.mock('@/lib/data/live-coupons', () => live);

const box = sandbox('promo-');
// ⚠ APRÈS `sandbox()` : le store fige ses chemins au chargement.
const {
  loadCoupons,
  loadCouponsForEdit,
  saveCouponsLive,
  saveBanners,
  loadBanners,
  validateCoupons,
  validateBanners,
} = await import('./promo-banner-store');

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

/**
 * Coupons : la liste VIVANTE est sur R2 (`live-coupons`, simulé ici) ; le store
 * n'écrit plus que l'INSTANTANÉ local, et seulement quand R2 a accepté.
 */
describe('coupons — liste vivante R2 et instantané local', () => {
  beforeEach(() => {
    live.readLiveCoupons.mockReset();
    live.writeLiveCoupons.mockReset();
  });

  it('chargement : rend la liste R2 et son jeton, et rafraîchit l’instantané', async () => {
    await box.put(COUPONS, [coupon({ code: 'VIEUX' })]);
    live.readLiveCoupons.mockResolvedValue({ list: [coupon({ code: 'DU_STAFF' })], etag: '"e1"' });

    expect(await loadCouponsForEdit()).toEqual({
      list: [coupon({ code: 'DU_STAFF' })],
      etag: '"e1"',
    });
    expect(box.read<PromoCode[]>(COUPONS)).toEqual([coupon({ code: 'DU_STAFF' })]);
  });

  it('chargement : R2 illisible → instantané local SANS jeton (enregistrement bloqué)', async () => {
    await box.put(COUPONS, [coupon({ code: 'LOCAL' })]);
    live.readLiveCoupons.mockRejectedValue(new Error('réseau'));

    const res = await loadCouponsForEdit();
    expect(res.list).toEqual([coupon({ code: 'LOCAL' })]);
    expect(res.etag).toBeNull();
    expect(res.error).toContain('réseau');
  });

  it('enregistrement accepté par R2 → instantané réécrit à l’identique', async () => {
    live.writeLiveCoupons.mockResolvedValue({ ok: true, etag: '"e2"', purged: true });
    const list = [coupon({ code: 'A' }), coupon({ code: 'B' })];

    expect((await saveCouponsLive(list, '"e1"')).ok).toBe(true);
    expect(live.writeLiveCoupons).toHaveBeenCalledWith(list, '"e1"');
    expect(box.read<PromoCode[]>(COUPONS)).toEqual(list);
  });

  it('conflit ou refus de R2 → l’instantané ne bouge PAS', async () => {
    await box.put(COUPONS, [coupon({ code: 'À GARDER' })]);
    const before = box.raw(COUPONS);
    live.writeLiveCoupons.mockResolvedValue({ ok: false, conflict: true, errors: ['changed'] });

    expect((await saveCouponsLive([coupon()], '"périmé"')).ok).toBe(false);
    expect(box.raw(COUPONS)).toBe(before);
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
    await box.put(COUPONS, [coupon()]);
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
    live.writeLiveCoupons.mockResolvedValue({ ok: true, etag: '"e"', purged: true });
    await saveBanners([banner()]);
    await saveCouponsLive([coupon()], '"e"');
    expect(box.leftovers()).toEqual([]);
  });
});

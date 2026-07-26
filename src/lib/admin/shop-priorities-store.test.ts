/**
 * Contrat de `saveShopPriorities` (audit F8) — overlay `data/curated/shop-priorities.json`
 * + éditorial `shop-editorial.json`.
 *
 * L'invariant coûteux est celui de l'OVERLAY : il est keyé par slug STABLE
 * (`shop/<goods>/<période>`) et l'éditeur ne montre QUE la rotation courante. Un
 * read-merge-write qui repartirait du payload perdrait les priorités des produits
 * hors rotation — invisible sur le moment, constaté des semaines plus tard au
 * retour du produit, et non reconstituable.
 *
 * `buildShopPriorities` (générateur : lit la donnée du jeu) est mocké — ce n'est
 * pas l'objet du test, et il n'a rien à lire dans un tmp.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sandbox } from './store-fixture';
import type { ShopEditorial, ShopPrioritiesSaveData } from './shop-priorities-store';

vi.mock('@datagen/generators/shop-priorities', () => ({
  buildShopPriorities: () => ({ shops: [] }),
}));

const box = sandbox('shop-priorities-');
// ⚠ APRÈS `sandbox()` : le store fige ses chemins au chargement.
const { saveShopPriorities } = await import('./shop-priorities-store');

const OVERLAY = 'data/curated/shop-priorities.json';
const EDITORIAL =
  'src/app/[lang]/guides/_contents/general-guides/shop-purchase-priorities/shop-editorial.json';

const editorial = (over: Partial<ShopEditorial> = {}): ShopEditorial => ({
  shopNotes: {},
  textShops: {},
  eventItems: [],
  resourceItems: [],
  ...over,
});

const payload = (over: Partial<ShopPrioritiesSaveData> = {}): ShopPrioritiesSaveData => ({
  overlay: {},
  editorial: editorial(),
  ...over,
});

type Overlay = Record<string, { priority?: string; notes?: unknown }>;

beforeEach(async () => {
  box.reset();
  // L'éditorial doit exister : le store le relit pour préserver son `_doc`.
  await box.put(EDITORIAL, { shopNotes: {}, textShops: {}, eventItems: [], resourceItems: [] });
});
afterAll(() => box.dispose());

describe('saveShopPriorities — overlay des shops dérivés', () => {
  it('écrit une priorité et une note pour un slug', async () => {
    expect(
      await saveShopPriorities(
        payload({ overlay: { 'shop/gold/weekly': { priority: 'S', notes: { en: 'À prendre' } } } }),
      ),
    ).toEqual([]);

    expect(box.read<Overlay>(OVERLAY)['shop/gold/weekly']).toEqual({
      priority: 'S',
      notes: { en: 'À prendre' },
    });
  });

  it('PRÉSERVE les slugs hors rotation (absents du payload)', async () => {
    // Le cas qui justifie le merge : ce produit n'est pas en boutique ce mois-ci.
    await box.put(OVERLAY, { 'shop/hors-rotation': { priority: 'A' } });
    await saveShopPriorities(payload({ overlay: { 'shop/gold/weekly': { priority: 'S' } } }));

    const all = box.read<Overlay>(OVERLAY);
    expect(all['shop/hors-rotation']).toEqual({ priority: 'A' });
    expect(all['shop/gold/weekly']).toEqual({ priority: 'S' });
  });

  it('supprime la clé quand priorité ET notes sont vides', async () => {
    await box.put(OVERLAY, {
      'shop/gold/weekly': { priority: 'S' },
      'shop/autre': { priority: 'B' },
    });
    await saveShopPriorities(payload({ overlay: { 'shop/gold/weekly': {} } }));

    const all = box.read<Overlay>(OVERLAY);
    expect(all['shop/gold/weekly']).toBeUndefined();
    expect(all['shop/autre']).toEqual({ priority: 'B' });
  });

  it('supprime aussi quand les notes n’ont que du blanc', async () => {
    await box.put(OVERLAY, { 'shop/gold/weekly': { priority: 'S' } });
    await saveShopPriorities(
      payload({ overlay: { 'shop/gold/weekly': { notes: { en: '   ', fr: '' } } } }),
    );
    expect(box.read<Overlay>(OVERLAY)['shop/gold/weekly']).toBeUndefined();
  });

  it('garde une note SANS priorité (une remarque seule est légitime)', async () => {
    await saveShopPriorities(
      payload({ overlay: { 'shop/gold/weekly': { notes: { fr: 'Seulement en FR' } } } }),
    );
    expect(box.read<Overlay>(OVERLAY)['shop/gold/weekly']).toEqual({
      notes: { fr: 'Seulement en FR' },
    });
  });

  it('PRÉSERVE `_doc` et le garde EN TÊTE du fichier', async () => {
    await box.put(OVERLAY, { _doc: 'sémantique du fichier', 'shop/z': { priority: 'C' } });
    await saveShopPriorities(payload({ overlay: { 'shop/a': { priority: 'S' } } }));

    const keys = Object.keys(box.read<Overlay>(OVERLAY));
    expect(keys[0]).toBe('_doc');
    expect(keys).toEqual(['_doc', 'shop/a', 'shop/z']);
  });

  it('trie les slugs numériquement (diff git stable)', async () => {
    await box.put(OVERLAY, { 'shop/s10': { priority: 'A' }, 'shop/s9': { priority: 'B' } });
    await saveShopPriorities(payload({ overlay: { 'shop/s2': { priority: 'S' } } }));
    expect(Object.keys(box.read<Overlay>(OVERLAY))).toEqual(['shop/s2', 'shop/s9', 'shop/s10']);
  });
});

describe('saveShopPriorities — validation de l’éditorial', () => {
  it('refuse un item sans nom ni libellé', async () => {
    const errors = await saveShopPriorities(
      payload({ editorial: editorial({ eventItems: [{ name: '', priority: 'S' } as never] }) }),
    );
    expect(errors.join()).toMatch(/Event item 1: an item name \(or label\) is required/);
  });

  it('accepte un item identifié par son seul libellé localisé', async () => {
    expect(
      await saveShopPriorities(
        payload({ editorial: editorial({ eventItems: [{ label: { en: 'Ticket' } } as never] }) }),
      ),
    ).toEqual([]);
  });

  it('refuse une priorité hors S/A/B/C et NOMME la valeur', async () => {
    const errors = await saveShopPriorities(
      payload({
        editorial: editorial({ resourceItems: [{ name: 'Gold', priority: 'Z' } as never] }),
      }),
    );
    expect(errors.join()).toMatch(/Resource item 1: unknown priority “Z”/);
  });

  it('exige le texte EN de chaque paragraphe d’un text shop', async () => {
    const errors = await saveShopPriorities(
      payload({
        editorial: editorial({
          textShops: { rico: { paragraphs: [{ en: 'ok' }, { fr: 'sans anglais' }] } as never },
        }),
      }),
    );
    expect(errors.join()).toMatch(/Text shop “rico”, paragraph 2: EN text is required/);
  });

  it('n’écrit RIEN — ni overlay ni éditorial — quand la validation échoue', async () => {
    await box.put(OVERLAY, { 'shop/à-garder': { priority: 'S' } });
    const beforeOverlay = box.raw(OVERLAY);
    const beforeEditorial = box.raw(EDITORIAL);

    const errors = await saveShopPriorities(
      payload({
        overlay: { 'shop/nouveau': { priority: 'A' } },
        editorial: editorial({ eventItems: [{ name: '' } as never] }),
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    // Les DEUX fichiers intacts octet pour octet : la validation précède tout.
    expect(box.raw(OVERLAY)).toBe(beforeOverlay);
    expect(box.raw(EDITORIAL)).toBe(beforeEditorial);
  });
});

describe('saveShopPriorities — éditorial et dérivé', () => {
  it('écrit les quatre sections de l’éditorial', async () => {
    await saveShopPriorities(
      payload({
        editorial: editorial({
          shopNotes: { rico: { en: 'note' } } as never,
          eventItems: [{ name: 'Ticket', priority: 'S' } as never],
        }),
      }),
    );

    const ed = box.read<Record<string, unknown>>(EDITORIAL);
    expect(Object.keys(ed)).toEqual(
      expect.arrayContaining(['shopNotes', 'textShops', 'eventItems', 'resourceItems']),
    );
    expect(ed.shopNotes).toEqual({ rico: { en: 'note' } });
  });

  it('PRÉSERVE le `_doc` de l’éditorial à la réécriture', async () => {
    await box.put(EDITORIAL, {
      _doc: 'à ne pas perdre',
      shopNotes: {},
      textShops: {},
      eventItems: [],
      resourceItems: [],
    });
    await saveShopPriorities(payload());
    expect(box.read<Record<string, unknown>>(EDITORIAL)._doc).toBe('à ne pas perdre');
  });

  it('régénère le dérivé servi (l’aperçu du guide reste à jour)', async () => {
    await saveShopPriorities(payload());
    expect(box.exists('data/generated/shop-priorities.json')).toBe(true);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await saveShopPriorities(payload({ overlay: { 'shop/gold': { priority: 'S' } } }));
    expect(box.leftovers()).toEqual([]);
  });
});

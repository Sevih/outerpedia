/**
 * Contrat de `upsertItemCurated` — `data/curated/items.json`.
 *
 * Ce store n'avait AUCUNE validation et renvoyait `void` là où ses voisins
 * renvoient `string[]` (constat de F8) — corrigé en F10. L'enjeu est direct :
 * `applyCurated` remplace le nom/la desc de l'entrée SERVIE et la route rebake
 * dans la foulée, donc une valeur mal typée partait dans le catalogue public.
 *
 * `bakeItemCatalogEntry` n'est pas couvert : c'est une façade sur
 * `integrateItemData` (générateur de catalogue), pas un store.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';
import type { ItemCurated } from './item-curated-store';

const box = sandbox('items-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { upsertItemCurated, loadItemCurated } = await import('./item-curated-store');

const FILE = 'data/curated/items.json';

/** `LangDict` est un dictionnaire COMPLET (4 langues), pas un partiel. */
const dict = (en: string) => ({ en, jp: en, kr: en, zh: en });

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('upsertItemCurated', () => {
  it('crée le fichier quand aucun curé n’existe encore', async () => {
    await upsertItemCurated('gold', { name: dict('Gold') });
    expect(box.read<Record<string, ItemCurated>>(FILE)).toEqual({ gold: { name: dict('Gold') } });
  });

  it('PRÉSERVE les autres items curés', async () => {
    await box.put(FILE, { gold: { name: dict('Gold') }, gem: { hidden: true } });
    await upsertItemCurated('stone', { icon: 'stone.webp' });

    const all = box.read<Record<string, ItemCurated>>(FILE);
    expect(all.gem).toEqual({ hidden: true });
    expect(Object.keys(all).sort()).toEqual(['gem', 'gold', 'stone']);
  });

  it('REMPLACE l’entrée du même id (un champ retiré disparaît)', async () => {
    await box.put(FILE, { gold: { name: dict('Gold'), hidden: true } });
    await upsertItemCurated('gold', { name: dict('Gold') });
    expect(box.read<Record<string, ItemCurated>>(FILE).gold).toEqual({ name: dict('Gold') });
  });

  it('supprime la clé sur une entrée vide, et garde les voisines', async () => {
    await box.put(FILE, { gold: { hidden: true }, gem: { hidden: true } });
    await upsertItemCurated('gold', {});
    expect(box.read<Record<string, ItemCurated>>(FILE)).toEqual({ gem: { hidden: true } });
  });

  it('supprime la clé sur une entrée nulle (garde `!curated`)', async () => {
    await box.put(FILE, { gold: { hidden: true } });
    await upsertItemCurated('gold', null as never);
    expect(box.read<Record<string, ItemCurated>>(FILE)).toEqual({});
  });

  it('ne COMPACTE PAS les champs vides (contrairement à `effects-store`)', async () => {
    // `{ icon: '' }` a une clé, donc l'entrée n'est pas « vide » : le vide est
    // stocké tel quel. Divergence assumée — le schéma accepte la chaîne vide.
    await upsertItemCurated('gold', { icon: '', name: {} as never });
    expect(box.read<Record<string, ItemCurated>>(FILE).gold).toEqual({ icon: '', name: {} });
  });

  it('trie les ids NUMÉRIQUEMENT (« 9 » avant « 10 »), aligné sur les autres stores', async () => {
    await box.put(FILE, { i9: {}, i10: {} });
    await upsertItemCurated('i2', { hidden: true });
    expect(Object.keys(box.read<Record<string, ItemCurated>>(FILE))).toEqual(['i2', 'i9', 'i10']);
  });

  it('`loadItemCurated` relit ce qui vient d’être écrit ; {} si absent', async () => {
    expect(loadItemCurated()).toEqual({});
    await upsertItemCurated('gold', { hidden: true });
    expect(loadItemCurated()).toEqual({ gold: { hidden: true } });
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await upsertItemCurated('gold', { hidden: true });
    expect(box.leftovers()).toEqual([]);
  });
});

describe('upsertItemCurated — validation (ajoutée en F10)', () => {
  it('accepte un override complet', async () => {
    expect(
      await upsertItemCurated('gold', {
        name: dict('Gold'),
        desc: dict('Monnaie'),
        icon: 'gold.webp',
        hidden: false,
        note: 'interne',
      }),
    ).toEqual([]);
  });

  it('refuse un booléen envoyé en texte, sans rien écrire', async () => {
    // Le cas réel d'un formulaire : `hidden: "true"` masquerait l'item au rendu
    // sans que rien ne l'annonce.
    await box.put(FILE, { gold: { hidden: true } });
    const before = box.raw(FILE);
    const errors = await upsertItemCurated('gem', { hidden: 'true' as never });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join()).toMatch(/hidden/);
    expect(box.raw(FILE)).toBe(before);
  });

  it('refuse un nom envoyé en chaîne au lieu d’un dictionnaire de langues', async () => {
    const errors = await upsertItemCurated('gold', { name: 'Gold' as never });
    expect(errors.length).toBeGreaterThan(0);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse une valeur non-textuelle DANS le dictionnaire', async () => {
    const errors = await upsertItemCurated('gold', { name: { en: 42 } as never });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('NOMME l’item fautif (l’éditeur doit savoir lequel)', async () => {
    const errors = await upsertItemCurated('gold', { icon: 42 as never });
    expect(errors.join()).toMatch(/itemCurated\[gold\]/);
  });

  it('laisse passer la suppression (entrée nulle) sans la valider', async () => {
    await box.put(FILE, { gold: { hidden: true } });
    expect(await upsertItemCurated('gold', null as never)).toEqual([]);
    expect(box.read<Record<string, ItemCurated>>(FILE)).toEqual({});
  });
});

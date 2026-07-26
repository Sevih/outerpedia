/**
 * Contrat de `upsertItemCurated` (audit F8) — `data/curated/items.json`.
 *
 * ⚠ CONSTAT D'AUDIT verrouillé ici : ce store ne valide RIEN et renvoie `void`
 * (là où ses voisins renvoient `string[]` d'erreurs). Un champ inconnu ou mal
 * typé atterrit tel quel dans le curé. Les tests ci-dessous DÉCRIVENT ce
 * comportement plutôt que de le cautionner — si une validation est ajoutée un
 * jour, ils sont l'endroit où le dire.
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

  it('ne COMPACTE PAS les champs vides — constat d’audit, pas un choix', async () => {
    // Contraste avec `effects-store` (`compactEffect`) : ici `{ icon: '' }` a une
    // clé, donc l'entrée n'est pas « vide » et le vide est STOCKÉ tel quel.
    // Le cast est le sujet du test : rien ne filtre ce que la route laisse passer.
    await upsertItemCurated('gold', { icon: '', name: {} as never });
    expect(box.read<Record<string, ItemCurated>>(FILE).gold).toEqual({ icon: '', name: {} });
  });

  it('trie les ids SANS ordre numérique — divergence assumée avec les autres stores', async () => {
    // `localeCompare` nu (pas de `numeric: true`) : « 10 » passe AVANT « 9 ».
    // Sans conséquence sur des ids d'items textuels, mais c'est une divergence.
    await box.put(FILE, { i9: {}, i10: {} });
    await upsertItemCurated('i2', { hidden: true });
    expect(Object.keys(box.read<Record<string, ItemCurated>>(FILE))).toEqual(['i10', 'i2', 'i9']);
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

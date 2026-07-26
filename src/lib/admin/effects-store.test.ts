/**
 * Contrat d'écriture du curé des EFFETS (audit F8).
 *
 * Ce qui est verrouillé ici est le read-merge-write, pas la validation (elle vit
 * dans `@datagen/curated/effects`) : une régression du merge ne casse aucun test
 * de schéma et PERD des overrides en silence — le glossaire public repart sur le
 * texte extrait sans un mot.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('effects-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { upsertEffectCurated } = await import('./effects-store');

const FILE = 'data/curated/effects.json';
type Curated = Record<string, { name?: { en?: string }; tag?: string; hidden?: boolean }>;

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('upsertEffectCurated', () => {
  it('crée le fichier quand aucun curé n’existe encore', async () => {
    expect(box.exists(FILE)).toBe(false);
    expect(await upsertEffectCurated('101', { name: { en: 'Bleed' } })).toEqual([]);
    expect(box.read<Curated>(FILE)).toEqual({ '101': { name: { en: 'Bleed' } } });
  });

  it('PRÉSERVE les autres effets curés (le merge, pas un remplacement)', async () => {
    await box.put(FILE, { '101': { name: { en: 'Bleed' } }, '102': { tag: 'dot' } });
    await upsertEffectCurated('103', { name: { en: 'Burn' } });

    const all = box.read<Curated>(FILE);
    expect(Object.keys(all)).toEqual(['101', '102', '103']);
    expect(all['102']).toEqual({ tag: 'dot' });
  });

  it('écrase l’entrée existante du MÊME id sans fusionner ses champs', async () => {
    // L'éditeur envoie l'état COMPLET de l'entrée : un champ retiré doit
    // disparaître, sinon un `hidden` levé dans l'UI ne se retire jamais.
    await box.put(FILE, { '101': { name: { en: 'Bleed' }, hidden: true } });
    await upsertEffectCurated('101', { name: { en: 'Bleed' } });
    expect(box.read<Curated>(FILE)['101']).toEqual({ name: { en: 'Bleed' } });
  });

  it('supprime la clé quand l’entrée est vide, et garde les voisines', async () => {
    await box.put(FILE, { '101': { tag: 'dot' }, '102': { tag: 'cc' } });
    expect(await upsertEffectCurated('101', {})).toEqual([]);
    expect(box.read<Curated>(FILE)).toEqual({ '102': { tag: 'cc' } });
  });

  it('supprime aussi quand tous les champs sont vides (compactage)', async () => {
    // `compactEffect` retire les vides : l'entrée devient {} → clé supprimée.
    await box.put(FILE, { '101': { tag: 'dot' } });
    await upsertEffectCurated('101', { name: {}, tag: '', hidden: false });
    expect(box.read<Curated>(FILE)).toEqual({});
  });

  it('n’écrit RIEN quand la validation échoue', async () => {
    await box.put(FILE, { '101': { tag: 'dot' } });
    const before = box.raw(FILE);
    const errors = await upsertEffectCurated('102', {
      keys: ['ok', 42 as unknown as string],
    });

    expect(errors.length).toBeGreaterThan(0);
    // Le fichier est intact OCTET POUR OCTET : pas d'écriture partielle.
    expect(box.raw(FILE)).toBe(before);
  });

  it('trie les ids numériquement (« 9 » avant « 10 », diff git stable)', async () => {
    await box.put(FILE, { '10': { tag: 'a' }, '9': { tag: 'b' } });
    await upsertEffectCurated('2', { tag: 'c' });
    expect(Object.keys(box.read<Curated>(FILE))).toEqual(['2', '9', '10']);
  });

  it('trie ids numériques ET textuels ensemble (créations éditoriales)', async () => {
    await box.put(FILE, { BT_SEAL: { tag: 'x' }, '10': { tag: 'a' } });
    await upsertEffectCurated('ELEMENTAL_ADV', { tag: 'y' });
    expect(Object.keys(box.read<Curated>(FILE))).toEqual(['10', 'BT_SEAL', 'ELEMENTAL_ADV']);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await upsertEffectCurated('101', { tag: 'dot' });
    expect(box.leftovers()).toEqual([]);
  });
});

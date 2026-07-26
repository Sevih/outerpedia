/**
 * Contrat de `upsertShortName` (audit F8) — `data/curated/short-names.json`.
 *
 * Les noms courts s'affichent là où la place manque (refs de reco d'équipement,
 * tuiles du tier-list-maker). Seules les 5 langues du contrat sont retenues : une
 * clé hors liste qui passerait dans le fichier serait ignorée au rendu tout en
 * salissant le curé.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('short-names-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { upsertShortName } = await import('./short-name-store');

const FILE = 'data/curated/short-names.json';
type Names = Record<string, Record<string, string>>;

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('upsertShortName', () => {
  it('crée le fichier et n’a rien de bloquant à dire', async () => {
    expect(await upsertShortName('stella', { en: 'D.Stella' })).toEqual([]);
    expect(box.read<Names>(FILE)).toEqual({ stella: { en: 'D.Stella' } });
  });

  it('PRÉSERVE les noms des autres persos', async () => {
    await box.put(FILE, { stella: { en: 'D.Stella' }, tamamo: { en: 'Tama', fr: 'Tama' } });
    await upsertShortName('vlada', { en: 'Vlad' });

    const all = box.read<Names>(FILE);
    expect(all.tamamo).toEqual({ en: 'Tama', fr: 'Tama' });
    expect(Object.keys(all).sort()).toEqual(['stella', 'tamamo', 'vlada']);
  });

  it('REMPLACE l’entrée du perso édité (une langue retirée disparaît)', async () => {
    await box.put(FILE, { stella: { en: 'D.Stella', fr: 'D.Stella' } });
    await upsertShortName('stella', { en: 'D.Stella' });
    expect(box.read<Names>(FILE).stella).toEqual({ en: 'D.Stella' });
  });

  it('garde les 5 langues du contrat et IGNORE tout le reste', async () => {
    await upsertShortName('stella', {
      en: 'A',
      jp: 'B',
      kr: 'C',
      zh: 'D',
      fr: 'E',
      de: 'ignorée',
    } as never);
    expect(box.read<Names>(FILE).stella).toEqual({ en: 'A', jp: 'B', kr: 'C', zh: 'D', fr: 'E' });
  });

  it('trime et retire les langues vides', async () => {
    await upsertShortName('stella', { en: '  D.Stella  ', fr: '   ', jp: '' });
    expect(box.read<Names>(FILE).stella).toEqual({ en: 'D.Stella' });
  });

  it('supprime la clé quand aucune langue n’est renseignée', async () => {
    await box.put(FILE, { stella: { en: 'D.Stella' }, tamamo: { en: 'Tama' } });
    await upsertShortName('stella', { en: '   ' });
    expect(box.read<Names>(FILE)).toEqual({ tamamo: { en: 'Tama' } });
  });

  it('supprime aussi sur un objet totalement vide', async () => {
    await box.put(FILE, { stella: { en: 'D.Stella' } });
    await upsertShortName('stella', {});
    expect(box.read<Names>(FILE)).toEqual({});
  });

  it('trie les ids numériquement (diff git stable)', async () => {
    await box.put(FILE, { c10: { en: 'A' }, c9: { en: 'B' } });
    await upsertShortName('c2', { en: 'C' });
    expect(Object.keys(box.read<Names>(FILE))).toEqual(['c2', 'c9', 'c10']);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await upsertShortName('stella', { en: 'D.Stella' });
    expect(box.leftovers()).toEqual([]);
  });
});

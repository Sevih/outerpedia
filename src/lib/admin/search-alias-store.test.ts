/**
 * Contrat de `upsertSearchAliases` (audit F8) — `data/curated/search-aliases.json`.
 *
 * Store sans validation bloquante : tout est accepté, seul le NETTOYAGE fait
 * contrat. Ce qui compte donc : la dédup insensible à la casse (un alias en
 * double n'améliore pas la recherche, il salit le diff), et le fait qu'une liste
 * vidée retire la clé au lieu de laisser un `[]` orphelin.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('search-aliases-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { upsertSearchAliases } = await import('./search-alias-store');

const FILE = 'data/curated/search-aliases.json';
type Aliases = Record<string, string[]>;

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('upsertSearchAliases', () => {
  it('crée le fichier et n’a jamais rien de bloquant à dire', async () => {
    expect(await upsertSearchAliases('stella', ['stel'])).toEqual([]);
    expect(box.read<Aliases>(FILE)).toEqual({ stella: ['stel'] });
  });

  it('PRÉSERVE les alias des autres persos', async () => {
    await box.put(FILE, { stella: ['stel'], tamamo: ['tama', 'fox'] });
    await upsertSearchAliases('vlada', ['vlad']);

    const all = box.read<Aliases>(FILE);
    expect(all.tamamo).toEqual(['tama', 'fox']);
    expect(Object.keys(all).sort()).toEqual(['stella', 'tamamo', 'vlada']);
  });

  it('REMPLACE la liste du perso édité (l’UI envoie l’état complet)', async () => {
    await box.put(FILE, { stella: ['ancien'] });
    await upsertSearchAliases('stella', ['nouveau']);
    expect(box.read<Aliases>(FILE).stella).toEqual(['nouveau']);
  });

  it('trime, retire les vides et dédoublonne SANS tenir compte de la casse', async () => {
    await upsertSearchAliases('stella', ['  Stel  ', 'stel', 'STEL', '', '   ', 'demi']);
    // Première occurrence gagne, casse d'origine conservée pour l'affichage.
    expect(box.read<Aliases>(FILE).stella).toEqual(['Stel', 'demi']);
  });

  it('conserve l’ORDRE de saisie (ce n’est pas trié : c’est éditorial)', async () => {
    await upsertSearchAliases('stella', ['zzz', 'aaa', 'mmm']);
    expect(box.read<Aliases>(FILE).stella).toEqual(['zzz', 'aaa', 'mmm']);
  });

  it('supprime la clé quand la liste arrive vide, et garde les voisines', async () => {
    await box.put(FILE, { stella: ['stel'], tamamo: ['tama'] });
    await upsertSearchAliases('stella', []);
    expect(box.read<Aliases>(FILE)).toEqual({ tamamo: ['tama'] });
  });

  it('supprime aussi quand la liste ne contient que du vide', async () => {
    await box.put(FILE, { stella: ['stel'] });
    await upsertSearchAliases('stella', ['', '   ']);
    expect(box.read<Aliases>(FILE)).toEqual({});
  });

  it('trie les ids numériquement (diff git stable)', async () => {
    await box.put(FILE, { c10: ['a'], c9: ['b'] });
    await upsertSearchAliases('c2', ['c']);
    expect(Object.keys(box.read<Aliases>(FILE))).toEqual(['c2', 'c9', 'c10']);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await upsertSearchAliases('stella', ['stel']);
    expect(box.leftovers()).toEqual([]);
  });
});

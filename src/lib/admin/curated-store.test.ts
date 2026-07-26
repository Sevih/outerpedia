/**
 * Contrat d'écriture du curé des PERSOS (audit F8) — `data/curated/characters.json`.
 *
 * C'est le curé le plus riche du corpus (rangs, rôles, tags, vidéos, pros/cons,
 * synergies) et le plus coûteux à reconstituer : tout est éditorial, rien ne se
 * régénère. Une régression du merge efface le travail de curation sans qu'aucun
 * test de schéma ne bronche.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('characters-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { upsertCharacterCurated } = await import('./curated-store');

const FILE = 'data/curated/characters.json';
type Curated = Record<string, Record<string, unknown>>;

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('upsertCharacterCurated', () => {
  it('crée le fichier quand aucun curé n’existe encore', async () => {
    expect(await upsertCharacterCurated('stella', { rank: 'SS' })).toEqual([]);
    expect(box.read<Curated>(FILE)).toEqual({ stella: { rank: 'SS' } });
  });

  it('PRÉSERVE les autres persos curés (le merge, pas un remplacement)', async () => {
    await box.put(FILE, { stella: { rank: 'SS' }, tamamo: { rank: 'S', tags: ['dps'] } });
    await upsertCharacterCurated('vlada', { rank: 'A' });

    const all = box.read<Curated>(FILE);
    expect(Object.keys(all).sort()).toEqual(['stella', 'tamamo', 'vlada']);
    // Le voisin est intact, champs compris.
    expect(all.tamamo).toEqual({ rank: 'S', tags: ['dps'] });
  });

  it('écrase l’entrée du MÊME perso sans fusionner ses champs', async () => {
    // L'éditeur envoie l'état COMPLET : un champ retiré dans l'UI doit
    // disparaître du fichier, sinon un rang effacé ressuscite.
    await box.put(FILE, { stella: { rank: 'SS', rankPvp: 'A', tags: ['dps'] } });
    await upsertCharacterCurated('stella', { rank: 'SS' });
    expect(box.read<Curated>(FILE).stella).toEqual({ rank: 'SS' });
  });

  it('supprime la clé quand l’entrée est vide, et garde les voisines', async () => {
    await box.put(FILE, { stella: { rank: 'SS' }, tamamo: { rank: 'S' } });
    expect(await upsertCharacterCurated('stella', {})).toEqual([]);
    expect(box.read<Curated>(FILE)).toEqual({ tamamo: { rank: 'S' } });
  });

  it('n’écrit RIEN quand la validation échoue et NOMME le champ fautif', async () => {
    await box.put(FILE, { stella: { rank: 'SS' } });
    const before = box.raw(FILE);
    // `role` est un enum fermé : « tank » n'en fait pas partie.
    const errors = await upsertCharacterCurated('tamamo', {
      role: 'tank' as never,
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join()).toMatch(/role/);
    // Intact OCTET POUR OCTET : ni écriture partielle, ni reformatage.
    expect(box.raw(FILE)).toBe(before);
  });

  it('refuse un entier non-entier dans skillPriority sans toucher le fichier', async () => {
    await box.put(FILE, { stella: { rank: 'SS' } });
    const errors = await upsertCharacterCurated('stella', {
      skillPriority: { first: 1.5 },
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(box.read<Curated>(FILE).stella).toEqual({ rank: 'SS' });
  });

  it('accepte un curé éditorial complet (rangs, vidéos, pros/cons)', async () => {
    const rich = {
      rank: 'SS',
      role: 'dps' as const,
      tags: ['burst', 'fire'],
      skillPriority: { first: 3, second: 1, ultimate: 2 },
      videos: [{ platform: 'youtube', id: 'abc123', title: 'Guide' }],
      prosCons: { pros: [{ en: 'Gros dégâts' }], cons: [{ en: 'Fragile' }] },
    };
    expect(await upsertCharacterCurated('stella', rich)).toEqual([]);
    expect(box.read<Curated>(FILE).stella).toEqual(rich);
  });

  it('trie les ids (diff git stable quel que soit l’ordre d’édition)', async () => {
    await box.put(FILE, { vlada: {}, stella: {} });
    await upsertCharacterCurated('nella', { rank: 'B' });
    expect(Object.keys(box.read<Curated>(FILE))).toEqual(['nella', 'stella', 'vlada']);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await upsertCharacterCurated('stella', { rank: 'SS' });
    expect(box.leftovers()).toEqual([]);
  });
});

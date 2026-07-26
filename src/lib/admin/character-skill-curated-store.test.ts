/**
 * Contrat de `applyCharacterKitCuration` (audit F8) —
 * `data/curated/character-skills.json`.
 *
 * Même geste que la curation des kits monstres MAIS sans `chipOwner` : le routage
 * perso est déterministe, il n'y a pas de kits jumeaux à préserver. Le patch est
 * volontairement borné aux cartes du perso édité (`cardIds`) — c'est ce qui
 * empêche l'éditeur d'un perso de balayer la curation d'un autre.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('character-skills-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { applyCharacterKitCuration, loadCharacterKitSections } =
  await import('./character-skill-curated-store');

const FILE = 'data/curated/character-skills.json';
interface File {
  chipHide?: Record<string, string[]>;
  chipAdd?: Record<string, string[]>;
  _doc?: unknown;
  [k: string]: unknown;
}

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('applyCharacterKitCuration — validation', () => {
  it('refuse un patch sans cartes (contexte absent)', async () => {
    expect(await applyCharacterKitCuration({ cardIds: [] })).toContain('cardIds missing');
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse une carte qui n’est pas celle du perso édité', async () => {
    // La garde qui empêche d'écrire sur la curation d'un AUTRE perso.
    const errors = await applyCharacterKitCuration({
      cardIds: ['c1'],
      chipHide: { cAutrePerso: ['b1'] },
    });
    expect(errors.join()).toMatch(/chipHide\[cAutrePerso\] : not a card of this character/);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse une liste non-textuelle sans toucher le fichier', async () => {
    await box.put(FILE, { chipAdd: { c1: ['b1'] } });
    const before = box.raw(FILE);
    const errors = await applyCharacterKitCuration({
      cardIds: ['c1'],
      chipAdd: { c1: ['ok', '  '] },
    });
    expect(errors.join()).toMatch(/chipAdd\[c1\] : string list expected/);
    expect(box.raw(FILE)).toBe(before);
  });
});

describe('applyCharacterKitCuration — merge', () => {
  it('REMPLACE la liste de la carte éditée et garde celle des autres', async () => {
    await box.put(FILE, { chipHide: { c1: ['b1', 'b2'], cAutre: ['b9'] } });
    expect(await applyCharacterKitCuration({ cardIds: ['c1'], chipHide: { c1: ['b3'] } })).toEqual(
      [],
    );

    expect(box.read<File>(FILE).chipHide).toEqual({ c1: ['b3'], cAutre: ['b9'] });
  });

  it('supprime la clé de la carte quand la liste arrive vide', async () => {
    await box.put(FILE, { chipHide: { c1: ['b1'], cAutre: ['b9'] } });
    await applyCharacterKitCuration({ cardIds: ['c1'], chipHide: { c1: [] } });
    expect(box.read<File>(FILE).chipHide).toEqual({ cAutre: ['b9'] });
  });

  it('dédoublonne et trime les entrées', async () => {
    await applyCharacterKitCuration({ cardIds: ['c1'], chipAdd: { c1: [' b1 ', 'b1', 'b2'] } });
    expect(box.read<File>(FILE).chipAdd).toEqual({ c1: ['b1', 'b2'] });
  });

  it('les deux sections sont indépendantes', async () => {
    await box.put(FILE, { chipHide: { c1: ['garde-moi'] } });
    await applyCharacterKitCuration({ cardIds: ['c1'], chipAdd: { c1: ['b1'] } });

    const f = box.read<File>(FILE);
    expect(f.chipHide).toEqual({ c1: ['garde-moi'] });
    expect(f.chipAdd).toEqual({ c1: ['b1'] });
  });

  it('PRÉSERVE la clé de doc (`_doc`)', async () => {
    await box.put(FILE, { _doc: 'à ne pas perdre' });
    await applyCharacterKitCuration({ cardIds: ['c1'], chipAdd: { c1: ['b1'] } });
    expect(box.read<File>(FILE)._doc).toBe('à ne pas perdre');
  });

  it('trie les entrées de chaque section (diff git stable)', async () => {
    await box.put(FILE, { chipHide: { cZ: ['b'], cA: ['b'] } });
    await applyCharacterKitCuration({ cardIds: ['cM'], chipHide: { cM: ['b'] } });
    expect(Object.keys(box.read<File>(FILE).chipHide ?? {})).toEqual(['cA', 'cM', 'cZ']);
  });

  it('un patch vide n’efface aucune section existante', async () => {
    await box.put(FILE, { chipHide: { c9: ['x'] }, chipAdd: { c9: ['y'] } });
    expect(await applyCharacterKitCuration({ cardIds: ['c1'] })).toEqual([]);

    const f = box.read<File>(FILE);
    expect(f.chipHide).toEqual({ c9: ['x'] });
    expect(f.chipAdd).toEqual({ c9: ['y'] });
  });

  it('`loadCharacterKitSections` relit ce qui vient d’être écrit', async () => {
    await applyCharacterKitCuration({ cardIds: ['c1'], chipHide: { c1: ['b1'] } });
    expect(loadCharacterKitSections()).toEqual({ chipHide: { c1: ['b1'] }, chipAdd: {} });
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await applyCharacterKitCuration({ cardIds: ['c1'], chipAdd: { c1: ['b1'] } });
    expect(box.leftovers()).toEqual([]);
  });
});

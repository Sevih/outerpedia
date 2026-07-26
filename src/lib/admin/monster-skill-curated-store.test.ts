/**
 * Contrat de `applyKitCuration` (audit F8) — `data/curated/monster-skills.json`.
 *
 * La pièce la plus subtile des stores : `chipOwner` est GLOBAL par buff alors que
 * l'éditeur ne connaît QU'UN kit. Poser un porteur pour ce kit doit préserver les
 * candidats des kits JUMEAUX (même buff, autre monstre) — s'ils sautent, les
 * chips disparaissent des cartes d'autres monstres sans que rien ne le signale,
 * et la curation perdue n'est pas reconstituable.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('monster-skills-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { applyKitCuration, loadKitCurationSections } = await import('./monster-skill-curated-store');

const FILE = 'data/curated/monster-skills.json';
interface File {
  chipOwner?: Record<string, string | string[]>;
  chipHide?: Record<string, string[]>;
  chipAdd?: Record<string, string[]>;
  _doc?: unknown;
  [k: string]: unknown;
}

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('applyKitCuration — validation (rien n’est écrit si ça coince)', () => {
  it('refuse un patch sans kit (contexte absent = on ne sait rien préserver)', async () => {
    expect(await applyKitCuration({ kitSkillIds: [] })).toContain('kitSkillIds missing');
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse un porteur qui n’appartient pas au kit édité', async () => {
    const errors = await applyKitCuration({
      kitSkillIds: ['s1'],
      chipOwner: { buffA: 's99' },
    });
    expect(errors.join()).toMatch(/chipOwner\[buffA\] : s99 is not a skill of the kit/);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse un chipHide/chipAdd visant un skill hors du kit', async () => {
    const errors = await applyKitCuration({
      kitSkillIds: ['s1'],
      chipHide: { s2: ['b1'] },
    });
    expect(errors.join()).toMatch(/chipHide\[s2\] : not a skill of the kit/);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse une liste non-textuelle et n’écrit rien', async () => {
    await box.put(FILE, { chipHide: { s1: ['b1'] } });
    const before = box.raw(FILE);
    const errors = await applyKitCuration({
      kitSkillIds: ['s1'],
      chipAdd: { s1: [42 as unknown as string] },
    });
    expect(errors.join()).toMatch(/chipAdd\[s1\] : string list expected/);
    expect(box.raw(FILE)).toBe(before);
  });
});

describe('applyKitCuration — chipOwner (le cas des kits jumeaux)', () => {
  it('PRÉSERVE les candidats des autres kits en posant celui du kit édité', async () => {
    // `jumeau` est le porteur choisi par un AUTRE monstre pour le même buff.
    await box.put(FILE, { chipOwner: { buffA: 'jumeau' } });
    expect(await applyKitCuration({ kitSkillIds: ['s1'], chipOwner: { buffA: 's1' } })).toEqual([]);

    // Les deux cohabitent : liste de candidats, le rendu tranche par kit.
    expect(box.read<File>(FILE).chipOwner).toEqual({ buffA: ['jumeau', 's1'] });
  });

  it('retire SEULEMENT le choix du kit édité (null) et laisse les jumeaux', async () => {
    await box.put(FILE, { chipOwner: { buffA: ['jumeau', 's1'] } });
    await applyKitCuration({ kitSkillIds: ['s1'], chipOwner: { buffA: null } });
    // Un seul candidat restant → reprend la forme scalaire (JSON compact).
    expect(box.read<File>(FILE).chipOwner).toEqual({ buffA: 'jumeau' });
  });

  it('supprime la clé quand le dernier candidat s’en va', async () => {
    await box.put(FILE, { chipOwner: { buffA: 's1' } });
    await applyKitCuration({ kitSkillIds: ['s1'], chipOwner: { buffA: null } });
    expect(box.read<File>(FILE).chipOwner).toEqual({});
  });

  it('remplace le choix du kit sans le dupliquer quand on le repose', async () => {
    // s1 et s2 sont tous deux du kit : réattribuer doit produire UN candidat.
    await box.put(FILE, { chipOwner: { buffA: 's1' } });
    await applyKitCuration({ kitSkillIds: ['s1', 's2'], chipOwner: { buffA: 's2' } });
    expect(box.read<File>(FILE).chipOwner).toEqual({ buffA: 's2' });
  });
});

describe('applyKitCuration — chipHide / chipAdd', () => {
  it('REMPLACE la liste du skill édité et garde celle des autres skills', async () => {
    await box.put(FILE, { chipHide: { s1: ['b1', 'b2'], sAutre: ['b9'] } });
    await applyKitCuration({ kitSkillIds: ['s1'], chipHide: { s1: ['b3'] } });

    const f = box.read<File>(FILE);
    expect(f.chipHide).toEqual({ s1: ['b3'], sAutre: ['b9'] });
  });

  it('supprime la clé du skill quand la liste arrive vide', async () => {
    await box.put(FILE, { chipHide: { s1: ['b1'], sAutre: ['b9'] } });
    await applyKitCuration({ kitSkillIds: ['s1'], chipHide: { s1: [] } });
    expect(box.read<File>(FILE).chipHide).toEqual({ sAutre: ['b9'] });
  });

  it('dédoublonne et trime les entrées', async () => {
    await applyKitCuration({
      kitSkillIds: ['s1'],
      chipAdd: { s1: [' b1 ', 'b1', 'b2'] },
    });
    expect(box.read<File>(FILE).chipAdd).toEqual({ s1: ['b1', 'b2'] });
  });
});

describe('applyKitCuration — intégrité du fichier', () => {
  it('PRÉSERVE les clés de doc (`_doc*`) — elles portent la sémantique du fichier', async () => {
    await box.put(FILE, { _doc: 'à ne pas perdre', _docChipOwner: 'ni celle-ci' });
    await applyKitCuration({ kitSkillIds: ['s1'], chipAdd: { s1: ['b1'] } });

    const f = box.read<File>(FILE);
    expect(f._doc).toBe('à ne pas perdre');
    expect(f._docChipOwner).toBe('ni celle-ci');
  });

  it('trie les entrées de chaque section (diff git stable)', async () => {
    await box.put(FILE, { chipHide: { sZ: ['b'], sA: ['b'] } });
    await applyKitCuration({ kitSkillIds: ['sM'], chipHide: { sM: ['b'] } });
    expect(Object.keys(box.read<File>(FILE).chipHide ?? {})).toEqual(['sA', 'sM', 'sZ']);
  });

  it('un patch vide n’efface aucune section existante', async () => {
    await box.put(FILE, { chipOwner: { b: 's9' }, chipHide: { s9: ['x'] } });
    expect(await applyKitCuration({ kitSkillIds: ['s1'] })).toEqual([]);

    const f = box.read<File>(FILE);
    expect(f.chipOwner).toEqual({ b: 's9' });
    expect(f.chipHide).toEqual({ s9: ['x'] });
  });

  it('`loadKitCurationSections` relit ce qui vient d’être écrit', async () => {
    await applyKitCuration({ kitSkillIds: ['s1'], chipAdd: { s1: ['b1'] } });
    expect(loadKitCurationSections()).toEqual({
      chipOwner: {},
      chipAdd: { s1: ['b1'] },
      chipHide: {},
    });
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await applyKitCuration({ kitSkillIds: ['s1'], chipAdd: { s1: ['b1'] } });
    expect(box.leftovers()).toEqual([]);
  });
});

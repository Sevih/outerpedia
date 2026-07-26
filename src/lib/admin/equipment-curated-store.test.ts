/**
 * Contrat de `upsertEeCurated` (audit F8) — `data/curated/equipment.json`.
 *
 * Ce fichier a CINQ sections (weapons/amulets/talismans/sets/ee) et l'éditeur EE
 * n'en touche qu'une. Deux pertes possibles, invisibles au rendu :
 *   - les sections voisines, écrasées par un read-merge-write bâclé ;
 *   - le champ `source` d'une entrée EE (hors périmètre de l'éditeur), qui décrit
 *     où l'équipement se farme — rien ne le régénère.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('equipment-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { upsertEeCurated, loadEeCuratedEntry } = await import('./equipment-curated-store');

const FILE = 'data/curated/equipment.json';
interface File {
  weapons?: Record<string, unknown>;
  amulets?: Record<string, unknown>;
  talismans?: Record<string, unknown>;
  sets?: Record<string, unknown>;
  ee: Record<string, Record<string, unknown>>;
}

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('upsertEeCurated — écriture', () => {
  it('crée le fichier avec les cinq sections quand rien n’existe', async () => {
    expect(await upsertEeCurated('stella', { rank: 'SS' })).toEqual([]);

    const f = box.read<File>(FILE);
    expect(f.ee).toEqual({ stella: { rank: 'SS' } });
    // Les sections vides sont présentes : le lecteur public les attend.
    expect(Object.keys(f).sort()).toEqual(['amulets', 'ee', 'sets', 'talismans', 'weapons']);
  });

  it('PRÉSERVE les autres sections du fichier', async () => {
    await box.put(FILE, {
      weapons: { w1: { rank: 'A' } },
      amulets: {},
      talismans: { t1: { rank: 'B' } },
      sets: {},
      ee: {},
    });
    await upsertEeCurated('stella', { rank: 'SS' });

    const f = box.read<File>(FILE);
    expect(f.weapons).toEqual({ w1: { rank: 'A' } });
    expect(f.talismans).toEqual({ t1: { rank: 'B' } });
  });

  it('PRÉSERVE `source` de l’entrée éditée (hors périmètre de l’éditeur EE)', async () => {
    await box.put(FILE, {
      ...empty(),
      ee: { stella: { source: { bosses: ['boss1'], label: 'Raid' }, rank: 'A' } },
    });
    await upsertEeCurated('stella', { rank: 'SS' });

    expect(box.read<File>(FILE).ee.stella).toEqual({
      source: { bosses: ['boss1'], label: 'Raid' },
      rank: 'SS',
    });
  });

  it('PRÉSERVE les autres persos de la section ee', async () => {
    await box.put(FILE, { ...empty(), ee: { tamamo: { rank: 'S' } } });
    await upsertEeCurated('stella', { rank: 'SS' });

    const f = box.read<File>(FILE);
    expect(f.ee.tamamo).toEqual({ rank: 'S' });
    expect(Object.keys(f.ee).sort()).toEqual(['stella', 'tamamo']);
  });
});

describe('upsertEeCurated — nettoyage des champs', () => {
  it('retire un rang vidé au lieu de stocker une chaîne vide', async () => {
    await box.put(FILE, { ...empty(), ee: { stella: { rank: 'SS', rank10: 'A' } } });
    await upsertEeCurated('stella', { rank: '', rank10: '  ' });
    // Plus aucun champ → la clé disparaît (nettoyage).
    expect(box.read<File>(FILE).ee).toEqual({});
  });

  it('trime les rangs et dédoublonne les listes de chips', async () => {
    await upsertEeCurated('stella', {
      rank: '  SS  ',
      chipHide: [' b1 ', 'b1', '', 'b2'],
      chipAdd: ['a1'],
    });
    expect(box.read<File>(FILE).ee.stella).toEqual({
      rank: 'SS',
      chipHide: ['b1', 'b2'],
      chipAdd: ['a1'],
    });
  });

  it('supprime la clé quand l’entrée n’a plus AUCUN champ, mais garde `source`', async () => {
    // `source` n'est pas dans le périmètre EE : l'entrée n'est donc pas « vide ».
    await box.put(FILE, { ...empty(), ee: { stella: { source: { label: 'Raid' }, rank: 'A' } } });
    await upsertEeCurated('stella', {});
    expect(box.read<File>(FILE).ee.stella).toEqual({ source: { label: 'Raid' } });
  });

  it('un patch vide sur une entrée SANS `source` supprime bien la clé', async () => {
    await box.put(FILE, { ...empty(), ee: { stella: { rank: 'A' }, tamamo: { rank: 'B' } } });
    await upsertEeCurated('stella', {});
    expect(box.read<File>(FILE).ee).toEqual({ tamamo: { rank: 'B' } });
  });
});

describe('upsertEeCurated — garde-fous', () => {
  it('trie la section ee numériquement (diff git stable)', async () => {
    await box.put(FILE, { ...empty(), ee: { c10: { rank: 'A' }, c9: { rank: 'B' } } });
    await upsertEeCurated('c2', { rank: 'C' });
    expect(Object.keys(box.read<File>(FILE).ee)).toEqual(['c2', 'c9', 'c10']);
  });

  it('`loadEeCuratedEntry` relit ce qui vient d’être écrit, {} si absent', async () => {
    await upsertEeCurated('stella', { rank: 'SS' });
    expect(loadEeCuratedEntry('stella')).toEqual({ rank: 'SS' });
    expect(loadEeCuratedEntry('inconnu')).toEqual({});
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await upsertEeCurated('stella', { rank: 'SS' });
    expect(box.leftovers()).toEqual([]);
  });
});

/** Les cinq sections vides — squelette d'un curé équipement. */
function empty() {
  return { weapons: {}, amulets: {}, talismans: {}, sets: {} };
}

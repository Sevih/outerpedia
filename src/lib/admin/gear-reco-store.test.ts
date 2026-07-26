/**
 * Contrat de `upsertGearReco` (audit F8) — `data/curated/gear-reco.json`.
 *
 * Store à double geste : il MERGE par perso ET recompresse les pièces vers les
 * `$presets` avant d'écrire. C'est cette recompression qui garde le fichier
 * lisible — l'éditeur envoie des builds DÉPLIÉS (tuile par tuile) et un store qui
 * les stockerait tels quels ferait exploser le JSON, puis chaque édition d'un
 * preset cesserait de se propager aux persos qui le référençaient.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { GearBuild } from '@contracts';
import { sandbox } from './store-fixture';

const box = sandbox('gear-reco-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { upsertGearReco } = await import('./gear-reco-store');

const FILE = 'data/curated/gear-reco.json';
const PRESETS = 'data/curated/gear-presets.json';
type Reco = Record<string, GearBuild[]>;

/** Presets de référence : un talisman, un combo de sets, une prio de substats. */
const presets = {
  talismans: { CPdps: ['tl_crit', 'tl_pen'] },
  sets: { dpsCombo: [{ set: 'set_atk', count: 4 }] },
  substats: { dps: 'ATK>CHC=CHD>SPD' },
};

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('upsertGearReco — merge par perso', () => {
  it('crée le fichier et écrit le build', async () => {
    expect(await upsertGearReco('stella', [{ name: 'PvE' }])).toEqual([]);
    expect(box.read<Reco>(FILE).stella).toEqual([{ name: 'PvE' }]);
  });

  it('PRÉSERVE les builds des autres persos', async () => {
    await box.put(FILE, { tamamo: [{ name: 'PvP', substats: 'SPD' }] });
    await upsertGearReco('stella', [{ name: 'PvE' }]);

    const all = box.read<Reco>(FILE);
    expect(all.tamamo).toEqual([{ name: 'PvP', substats: 'SPD' }]);
    expect(Object.keys(all).sort()).toEqual(['stella', 'tamamo']);
  });

  it('REMPLACE la liste du perso édité (l’UI envoie l’état complet)', async () => {
    await box.put(FILE, { stella: [{ name: 'Vieux' }, { name: 'Encore un' }] });
    await upsertGearReco('stella', [{ name: 'Seul' }]);
    expect(box.read<Reco>(FILE).stella).toEqual([{ name: 'Seul' }]);
  });

  it('supprime la clé sur une liste vide, et garde les voisines', async () => {
    await box.put(FILE, { stella: [{ name: 'PvE' }], tamamo: [{ name: 'PvP' }] });
    expect(await upsertGearReco('stella', [])).toEqual([]);
    expect(box.read<Reco>(FILE)).toEqual({ tamamo: [{ name: 'PvP' }] });
  });

  it('trie les ids numériquement (diff git stable)', async () => {
    await box.put(FILE, { c10: [{ name: 'A' }], c9: [{ name: 'B' }] });
    await upsertGearReco('c2', [{ name: 'C' }]);
    expect(Object.keys(box.read<Reco>(FILE))).toEqual(['c2', 'c9', 'c10']);
  });
});

describe('upsertGearReco — recompression vers les presets', () => {
  it('recompresse des talismans dépliés vers `$preset`', async () => {
    await box.put(PRESETS, presets);
    // Ordre inversé exprès : le match est indépendant de l'ordre de saisie.
    await upsertGearReco('stella', [{ name: 'PvE', talismans: ['tl_pen', 'tl_crit'] }]);
    expect(box.read<Reco>(FILE).stella[0].talismans).toEqual(['$CPdps']);
  });

  it('recompresse un combo de sets et une prio de substats', async () => {
    await box.put(PRESETS, presets);
    await upsertGearReco('stella', [
      {
        name: 'PvE',
        sets: [{ pieces: [{ set: 'set_atk', count: 4 }] }],
        substats: 'ATK>CHC=CHD>SPD',
      },
    ]);

    const build = box.read<Reco>(FILE).stella[0];
    expect(build.sets).toEqual([{ preset: 'dpsCombo' }]);
    expect(build.substats).toBe('$dps');
  });

  it('laisse INTACT ce qui ne correspond à aucun preset', async () => {
    await box.put(PRESETS, presets);
    await upsertGearReco('stella', [{ name: 'PvE', talismans: ['tl_autre'], substats: 'SPD>HP' }]);

    const build = box.read<Reco>(FILE).stella[0];
    expect(build.talismans).toEqual(['tl_autre']);
    expect(build.substats).toBe('SPD>HP');
  });

  it('ne double pas le `$` sur une référence déjà compressée', async () => {
    await box.put(PRESETS, presets);
    await upsertGearReco('stella', [{ name: 'PvE', talismans: ['$CPdps'], substats: '$dps' }]);

    const build = box.read<Reco>(FILE).stella[0];
    expect(build.talismans).toEqual(['$CPdps']);
    expect(build.substats).toBe('$dps');
  });

  it('fonctionne sans fichier de presets (rien à recompresser)', async () => {
    await upsertGearReco('stella', [{ name: 'PvE', talismans: ['tl_crit', 'tl_pen'] }]);
    expect(box.read<Reco>(FILE).stella[0].talismans).toEqual(['tl_crit', 'tl_pen']);
  });
});

describe('upsertGearReco — validation', () => {
  it('n’écrit RIEN quand un build est invalide', async () => {
    await box.put(FILE, { stella: [{ name: 'À garder' }] });
    const before = box.raw(FILE);
    // `name` est obligatoire.
    const errors = await upsertGearReco('tamamo', [{} as GearBuild]);

    expect(errors.length).toBeGreaterThan(0);
    expect(box.raw(FILE)).toBe(before);
  });

  it('refuse un combo de sets à moins de 2 pièces (min du schéma)', async () => {
    const errors = await upsertGearReco('stella', [
      { name: 'PvE', sets: [{ pieces: [{ set: 'set_atk', count: 1 }] }] },
    ]);
    expect(errors.length).toBeGreaterThan(0);
    expect(box.exists(FILE)).toBe(false);
  });

  it('NOMME le perso et l’index du build fautif', async () => {
    const errors = await upsertGearReco('stella', [
      { name: 'PvE' },
      { name: 42 as unknown as string },
    ]);
    expect(errors.join()).toMatch(/gearReco\[stella\]/);
    expect(errors.join()).toMatch(/1/);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await upsertGearReco('stella', [{ name: 'PvE' }]);
    expect(box.leftovers()).toEqual([]);
  });
});

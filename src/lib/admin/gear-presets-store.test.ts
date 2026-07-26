/**
 * Contrat de `saveGearPresets` (audit F8) — `data/curated/gear-presets.json`.
 *
 * Le fichier est remplacé ENTIER, donc la protection tient à deux gardes :
 *   - le schéma ;
 *   - le garde-fou de RÉFÉRENCES : supprimer un preset encore cité par un build
 *     de `gear-reco.json` laisserait des `$slug` pendants — le rendu des recos
 *     n'a alors plus rien à résoudre, silencieusement, sur des persos qu'on
 *     n'était pas en train d'éditer.
 *
 * Ce store était le SEUL des 16 à écrire avec `writeFileSync` + `JSON.stringify`
 * direct (constat de F8) — ALIGNÉ sur `writeJson` en F10, ce que verrouillent les
 * deux derniers tests : format canonique et écriture atomique.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { GearPresets } from '@contracts';
import { sandbox } from './store-fixture';

const box = sandbox('gear-presets-');
// ⚠ APRÈS `sandbox()` : le store fige ses chemins au chargement.
const { saveGearPresets } = await import('./gear-presets-store');

const FILE = 'data/curated/gear-presets.json';
const RECO = 'data/curated/gear-reco.json';

const full = (over: Partial<GearPresets> = {}): GearPresets => ({
  talismans: { CPdps: ['tl_crit', 'tl_pen'] },
  sets: { dpsCombo: [{ set: 'set_atk', count: 4 }] },
  substats: { dps: 'ATK>CHC=CHD>SPD' },
  ...over,
});

const empty: GearPresets = { talismans: {}, sets: {}, substats: {} };

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('saveGearPresets — validation de schéma', () => {
  it('accepte un fichier complet et l’écrit', async () => {
    expect(await saveGearPresets(full())).toEqual([]);
    expect(box.read<GearPresets>(FILE)).toEqual(full());
  });

  it('accepte les trois sections vides', async () => {
    expect(await saveGearPresets(empty)).toEqual([]);
    expect(box.read<GearPresets>(FILE)).toEqual(empty);
  });

  it('refuse une section manquante', async () => {
    const errors = await saveGearPresets({ talismans: {}, sets: {} } as GearPresets);
    expect(errors.join()).toMatch(/substats/);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse un combo à moins de 2 pièces, sans rien écrire', async () => {
    const errors = await saveGearPresets(full({ sets: { x: [{ set: 'set_atk', count: 1 }] } }));
    expect(errors.length).toBeGreaterThan(0);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse un talisman non-textuel', async () => {
    const errors = await saveGearPresets(full({ talismans: { x: [42 as unknown as string] } }));
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('saveGearPresets — garde-fou des références', () => {
  it('REFUSE de retirer un preset de talismans encore référencé', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', talismans: ['$CPdps'] }] });
    const errors = await saveGearPresets(full({ talismans: {} }));

    expect(errors.join()).toMatch(/preset still referenced/);
    // Le fautif est nommé AVEC son consommateur (slug, section, perso/build).
    expect(errors.join()).toMatch(/\$CPdps \(talismans, stella\/PvE\)/);
    expect(box.exists(FILE)).toBe(false);
  });

  it('REFUSE de retirer un preset de sets encore référencé', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', sets: [{ preset: 'dpsCombo' }] }] });
    expect((await saveGearPresets(full({ sets: {} }))).join()).toMatch(
      /\$dpsCombo \(sets, stella\/PvE\)/,
    );
  });

  it('REFUSE de retirer un preset de substats encore référencé', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', substats: '$dps' }] });
    expect((await saveGearPresets(full({ substats: {} }))).join()).toMatch(
      /\$dps \(substats, stella\/PvE\)/,
    );
  });

  it('AUTORISE le retrait dès que plus aucun build ne le cite', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', talismans: ['tl_autre'] }] });
    expect(await saveGearPresets(full({ talismans: {} }))).toEqual([]);
    expect(box.read<GearPresets>(FILE).talismans).toEqual({});
  });

  it('AUTORISE la modification d’un preset référencé (seul le retrait casse)', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', talismans: ['$CPdps'] }] });
    expect(await saveGearPresets(full({ talismans: { CPdps: ['tl_autre'] } }))).toEqual([]);
    expect(box.read<GearPresets>(FILE).talismans.CPdps).toEqual(['tl_autre']);
  });

  it('signale CHAQUE référence pendante, dédoublonnée', async () => {
    await box.put(RECO, {
      stella: [{ name: 'PvE', talismans: ['$CPdps'] }],
      tamamo: [{ name: 'PvP', talismans: ['$CPdps'], substats: '$dps' }],
    });
    const errors = await saveGearPresets(empty);
    // Deux persos citent `$CPdps` → deux entrées distinctes (le build diffère).
    expect(errors).toHaveLength(3);
  });

  it('n’a rien à reprocher quand `gear-reco.json` est absent', async () => {
    expect(await saveGearPresets(empty)).toEqual([]);
  });

  it('ignore un `gear-reco.json` illisible plutôt que de bloquer l’édition', async () => {
    // `brokenRefs` retombe sur [] : un curé cassé ne doit pas verrouiller l'admin.
    box.putRaw(RECO, '{ ceci n’est pas du JSON');
    expect(await saveGearPresets(empty)).toEqual([]);
  });
});

describe('saveGearPresets — forme du fichier', () => {
  it('trie les clés des trois sections (diff git stable)', async () => {
    await saveGearPresets({
      talismans: { zzz: ['a'], aaa: ['b'] },
      sets: { zzz: [{ set: 's', count: 2 }], aaa: [{ set: 's', count: 2 }] },
      substats: { zzz: 'SPD', aaa: 'ATK' },
    });
    const f = box.read<GearPresets>(FILE);
    expect(Object.keys(f.talismans)).toEqual(['aaa', 'zzz']);
    expect(Object.keys(f.sets)).toEqual(['aaa', 'zzz']);
    expect(Object.keys(f.substats)).toEqual(['aaa', 'zzz']);
  });

  it('écrit les sections dans un ordre FIXE, quel que soit l’ordre reçu', async () => {
    await saveGearPresets({ substats: {}, sets: {}, talismans: {} } as GearPresets);
    expect(Object.keys(box.read<GearPresets>(FILE))).toEqual(['talismans', 'sets', 'substats']);
  });

  it('passe par le sérialiseur CANONIQUE, comme les 15 autres stores', async () => {
    // Corrigé en F10 : c'était le seul store à écrire en `JSON.stringify` nu, qui
    // ÉCLATAIT les tableaux courts. Le hook pre-commit prettier les ramassait
    // derrière → chaque édition d'UN preset diffait tout le fichier.
    await saveGearPresets(full());
    const raw = box.raw(FILE);
    expect(raw.endsWith('\n')).toBe(true);
    expect(raw).toContain('["tl_crit", "tl_pen"]');
  });

  it('écrit de façon ATOMIQUE et ne laisse aucun temporaire', async () => {
    // Le trou résiduel de F1 : une interruption laissait ici un JSON tronqué, que
    // `readCuratedJson` REFUSE ensuite (il lève) → dev et build bloqués.
    await saveGearPresets(full());
    expect(box.leftovers()).toEqual([]);
    // Le fichier est relisible, donc complet.
    expect(box.read<GearPresets>(FILE)).toEqual(full());
  });
});

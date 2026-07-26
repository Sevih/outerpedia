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
 * ⚠ CONSTAT D'AUDIT (verrouillé par le dernier test) : ce store est le SEUL des 16
 * à écrire avec `writeFileSync` + `JSON.stringify` direct, au lieu du `writeJson`
 * atomique et canonique commun (cf. F1). Ni atomicité, ni format partagé.
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
  it('accepte un fichier complet et l’écrit', () => {
    expect(saveGearPresets(full())).toEqual([]);
    expect(box.read<GearPresets>(FILE)).toEqual(full());
  });

  it('accepte les trois sections vides', () => {
    expect(saveGearPresets(empty)).toEqual([]);
    expect(box.read<GearPresets>(FILE)).toEqual(empty);
  });

  it('refuse une section manquante', () => {
    const errors = saveGearPresets({ talismans: {}, sets: {} } as GearPresets);
    expect(errors.join()).toMatch(/substats/);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse un combo à moins de 2 pièces, sans rien écrire', () => {
    const errors = saveGearPresets(full({ sets: { x: [{ set: 'set_atk', count: 1 }] } }));
    expect(errors.length).toBeGreaterThan(0);
    expect(box.exists(FILE)).toBe(false);
  });

  it('refuse un talisman non-textuel', () => {
    const errors = saveGearPresets(full({ talismans: { x: [42 as unknown as string] } }));
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('saveGearPresets — garde-fou des références', () => {
  it('REFUSE de retirer un preset de talismans encore référencé', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', talismans: ['$CPdps'] }] });
    const errors = saveGearPresets(full({ talismans: {} }));

    expect(errors.join()).toMatch(/preset still referenced/);
    // Le fautif est nommé AVEC son consommateur (slug, section, perso/build).
    expect(errors.join()).toMatch(/\$CPdps \(talismans, stella\/PvE\)/);
    expect(box.exists(FILE)).toBe(false);
  });

  it('REFUSE de retirer un preset de sets encore référencé', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', sets: [{ preset: 'dpsCombo' }] }] });
    expect(saveGearPresets(full({ sets: {} })).join()).toMatch(/\$dpsCombo \(sets, stella\/PvE\)/);
  });

  it('REFUSE de retirer un preset de substats encore référencé', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', substats: '$dps' }] });
    expect(saveGearPresets(full({ substats: {} })).join()).toMatch(
      /\$dps \(substats, stella\/PvE\)/,
    );
  });

  it('AUTORISE le retrait dès que plus aucun build ne le cite', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', talismans: ['tl_autre'] }] });
    expect(saveGearPresets(full({ talismans: {} }))).toEqual([]);
    expect(box.read<GearPresets>(FILE).talismans).toEqual({});
  });

  it('AUTORISE la modification d’un preset référencé (seul le retrait casse)', async () => {
    await box.put(RECO, { stella: [{ name: 'PvE', talismans: ['$CPdps'] }] });
    expect(saveGearPresets(full({ talismans: { CPdps: ['tl_autre'] } }))).toEqual([]);
    expect(box.read<GearPresets>(FILE).talismans.CPdps).toEqual(['tl_autre']);
  });

  it('signale CHAQUE référence pendante, dédoublonnée', async () => {
    await box.put(RECO, {
      stella: [{ name: 'PvE', talismans: ['$CPdps'] }],
      tamamo: [{ name: 'PvP', talismans: ['$CPdps'], substats: '$dps' }],
    });
    const errors = saveGearPresets(empty);
    // Deux persos citent `$CPdps` → deux entrées distinctes (le build diffère).
    expect(errors).toHaveLength(3);
  });

  it('n’a rien à reprocher quand `gear-reco.json` est absent', () => {
    expect(saveGearPresets(empty)).toEqual([]);
  });

  it('ignore un `gear-reco.json` illisible plutôt que de bloquer l’édition', () => {
    // `brokenRefs` retombe sur [] : un curé cassé ne doit pas verrouiller l'admin.
    box.putRaw(RECO, '{ ceci n’est pas du JSON');
    expect(saveGearPresets(empty)).toEqual([]);
  });
});

describe('saveGearPresets — forme du fichier', () => {
  it('trie les clés des trois sections (diff git stable)', () => {
    saveGearPresets({
      talismans: { zzz: ['a'], aaa: ['b'] },
      sets: { zzz: [{ set: 's', count: 2 }], aaa: [{ set: 's', count: 2 }] },
      substats: { zzz: 'SPD', aaa: 'ATK' },
    });
    const f = box.read<GearPresets>(FILE);
    expect(Object.keys(f.talismans)).toEqual(['aaa', 'zzz']);
    expect(Object.keys(f.sets)).toEqual(['aaa', 'zzz']);
    expect(Object.keys(f.substats)).toEqual(['aaa', 'zzz']);
  });

  it('écrit les sections dans un ordre FIXE, quel que soit l’ordre reçu', () => {
    saveGearPresets({ substats: {}, sets: {}, talismans: {} } as GearPresets);
    expect(Object.keys(box.read<GearPresets>(FILE))).toEqual(['talismans', 'sets', 'substats']);
  });

  it('CONSTAT D’AUDIT : écrit hors du sérialiseur canonique (pas de `writeJson`)', () => {
    saveGearPresets(full());
    // `JSON.stringify(…, 2)` nu : indenté et terminé par un saut de ligne, mais
    // il n'est PAS passé par prettier — les tableaux courts ne sont pas ramassés
    // comme dans les 15 autres curés. À aligner (cf. DONE / F1).
    const raw = box.raw(FILE);
    expect(raw.endsWith('\n')).toBe(true);
    expect(raw).toContain('"tl_crit",');
  });
});

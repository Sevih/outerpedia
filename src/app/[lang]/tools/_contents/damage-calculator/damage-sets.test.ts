/**
 * GARDE de `DAMAGE_SET_IDS` (index.tsx), liste recopiée à la main des sets
 * proposés au calculateur (décision de Sevih du 26/07/2026 : seuls les sets à
 * passif de COMBAT, les sets de stats pures sont déjà dans la fiche saisie).
 * Tout set de `sets.json` portant un effet à BUFF est soit dans la liste, soit
 * dans `NO_DAMAGE_BUFF_SETS` avec sa raison. Un set à buff ajouté par un patch
 * casse ce test : choisir l'une ou l'autre liste, ne jamais l'ignorer.
 */
import { describe, expect, it } from 'vitest';
import { getEquipmentSets } from '@/lib/data/equipment-sets';
import { DAMAGE_SET_IDS } from './index';

/** Sets à buff SANS effet sur les dégâts infligés par le porteur. */
const NO_DAMAGE_BUFF_SETS: Record<string, string> = {
  '8': 'Fortification : réduction des dégâts SUBIS au premier coup reçu, et sa contrepartie (VIT du porteur baissée un tour) ; rien sur le hit',
  '18': 'Immunity : immunité aux débuffs et réduction des dégâts SUBIS',
};

describe('calculateur — sets à buff proposés', () => {
  it('tout set à buff est classé : dans DAMAGE_SET_IDS ou nommé sans effet sur les dégâts', () => {
    const buffSets = Object.entries(getEquipmentSets())
      .filter(([, set]) => set.tiers.some((t) => [t['2p'], t['4p']].some((e) => e && 'buff' in e)))
      .map(([id]) => id);
    expect(buffSets.length).toBeGreaterThan(0);
    const unclassified = buffSets.filter(
      (id) => !DAMAGE_SET_IDS.has(id) && !(id in NO_DAMAGE_BUFF_SETS),
    );
    expect(unclassified).toEqual([]);
    // Les deux listes ne se recouvrent pas, et ne nomment que des sets à buff.
    for (const id of DAMAGE_SET_IDS) expect(buffSets, `set ${id}`).toContain(id);
    for (const id of Object.keys(NO_DAMAGE_BUFF_SETS)) {
      expect(buffSets, `set ${id}`).toContain(id);
      expect(DAMAGE_SET_IDS.has(id), `set ${id}`).toBe(false);
    }
  });
});

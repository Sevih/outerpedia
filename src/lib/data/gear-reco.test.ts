/**
 * Palier des bonus de set (M9, décision de Sevih du 15/10/2026) : le BUTIN
 * montre le palier de base, celui qu'on farme ; les RECOS de build montrent le
 * palier enchanté (percée 4), MARQUÉ. Attendus lus dans `sets.json` (premier
 * et dernier palier), jamais recopiés — les valeurs entre parenthèses sont
 * celles du jour, pour le lecteur.
 */
import { describe, expect, it } from 'vitest';
import { getEquipmentSets } from '@/lib/data/equipment-sets';
import { setEffectText } from '@/lib/data/equipment';
import { loadGearPresets, resolveGearBuilds, resolveLootSet } from '@/lib/data/gear-reco';

const SETS = getEquipmentSets();
/** Texte d'un bonus au premier (`0`) ou au dernier (`-1`) palier. */
const text = (id: string, piece: '2p' | '4p', at: 0 | -1): string | undefined => {
  const tiers = SETS[id].tiers;
  return setEffectText(tiers[at === 0 ? 0 : tiers.length - 1][piece] ?? null, 'en');
};

describe('gear-reco — palier des bonus de set', () => {
  it('butin : palier de base (Speed sans 2P, Attack 30/20), sans mention', () => {
    const speed = resolveLootSet('13', 'en')!;
    expect(text('13', '2p', 0)).toBeUndefined();
    expect(speed.effect.effect2).toBeUndefined();
    expect(speed.effect.effect4).toBe(text('13', '4p', 0));
    const attack = resolveLootSet('1', 'en')!;
    expect(attack.effect.effect2).toBe(text('1', '2p', 0)); // Attack +30%
    expect(attack.effect.effect4).toBe(text('1', '4p', 0)); // Attack +20%
    expect(text('1', '2p', 0)).not.toBe(text('1', '2p', -1));
    expect(attack.effect.enchanted).toBeUndefined();
  });

  it('reco : palier enchanté, marqué', () => {
    const [build] = resolveGearBuilds(
      [{ name: 'test', sets: [{ pieces: [{ set: '1', count: 4 }] }] }],
      loadGearPresets(),
      'en',
    );
    const [attack] = build.setEffects;
    expect(attack.effect2).toBe(text('1', '2p', -1)); // Attack +35%
    expect(attack.effect4).toBe(text('1', '4p', -1)); // Attack +25%
    expect(attack.enchanted).toBe(true);
  });
});

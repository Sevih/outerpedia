/**
 * GARDE-FOU de `AFFINITY_PRESETS` : les paliers d'affinité à stats sont recopiés à
 * la main de `TrustRewardTemplet` (niveaux à `RewardBuffID`), que `hero-growth.json`
 * émet en `affinityStatLevels`. Un rouge après un patch = le jeu a déplacé ses
 * paliers : corriger `AFFINITY_PRESETS` (et `AFFINITY_REWARDS` du guide
 * heroes-growth), pas ce test.
 *
 * Tourne SANS `.gamedata` : ne lit que `data/generated/` et le code.
 */
import { describe, expect, it } from 'vitest';
import { getHeroGrowth } from '@/lib/data/hero-growth';
import { AFFINITY_PRESETS } from './contracts';

describe('AFFINITY_PRESETS — copie de TrustRewardTemplet (hero-growth.json)', () => {
  // Le 10 (déblocage de l'équipement exclusif) n'est pas gardé : `GameConfigTemplet`
  // a bien une clé `PRESENT_TO_SPECIAL_EQUIP` à 10, mais rien ne prouve que c'est ce
  // seuil ; rien n'est émis pour lui.
  it('sans le 10, les paliers sont les niveaux à RewardBuffID', () => {
    expect(AFFINITY_PRESETS.filter((n) => n !== 10)).toEqual(getHeroGrowth().affinityStatLevels);
  });
});

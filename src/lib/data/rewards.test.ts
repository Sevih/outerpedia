import { describe, expect, it } from 'vitest';
import { lootTableOf } from '@/lib/data/rewards';

/**
 * `lootTableOf` fige LA règle de choix de table de butin. Trois vues la
 * tranchaient chacune à sa façon, dont une dans l'ordre inverse — sans effet
 * visible tant que seules les poursuites portent `rewardWin`, d'où ce test
 * plutôt qu'un symptôme à l'écran le jour où ça change.
 */
describe('lootTableOf', () => {
  it('préfère la table de victoire propre au boss à la table générique', () => {
    expect(lootTableOf({ reward: '7041', rewardWin: '7001' })).toBe('7001');
  });

  it('retombe sur `reward` sans table de victoire', () => {
    expect(lootTableOf({ reward: '7041' })).toBe('7041');
  });

  it('rend undefined sans aucune table', () => {
    expect(lootTableOf({})).toBeUndefined();
  });
});

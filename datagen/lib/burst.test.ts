import { describe, expect, it } from 'vitest';
import { burstAPCosts } from './burst';

describe('burstAPCosts', () => {
  it('liste de coûts vide → pas burstable', () => {
    expect(burstAPCosts(undefined)).toBeUndefined();
    expect(burstAPCosts(null)).toBeUndefined();
    expect(burstAPCosts('')).toBeUndefined();
  });

  it('plusieurs coûts → burstable, coûts dans l’ordre', () => {
    expect(burstAPCosts('20,40,60')).toEqual([20, 40, 60]);
  });

  // Règle du client (`IsBurstEntryType => 0 < RequireAPList.Count`) : le
  // nombre de coûts n'entre pas en compte, un seul suffit.
  it('un seul coût → burstable', () => {
    expect(burstAPCosts('30')).toEqual([30]);
  });
});

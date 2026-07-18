import { describe, expect, it } from 'vitest';
import { isDebuffEffect } from './EffectChips';

// La divergence historique : l'affichage traitait `neutral`/`cc` en debuff
// (`category !== 'buff'`) tandis que la clé de dédup les traitait en buff
// (`category === 'debuff'`) — deux chips de couleurs opposées pouvaient donc
// fusionner. Ce test grave la règle unique que les deux usages partagent.
describe('isDebuffEffect', () => {
  it('un statut nommé fait foi, quelle que soit la catégorie', () => {
    expect(isDebuffEffect('buff', true)).toBe(true);
    expect(isDebuffEffect('debuff', false)).toBe(false);
    expect(isDebuffEffect('neutral', false)).toBe(false);
  });

  it("à défaut de statut, seul `buff` n'est pas un debuff", () => {
    expect(isDebuffEffect('buff')).toBe(false);
    expect(isDebuffEffect('debuff')).toBe(true);
    expect(isDebuffEffect('neutral')).toBe(true);
    expect(isDebuffEffect('cc')).toBe(true);
  });
});

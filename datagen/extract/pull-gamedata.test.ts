/**
 * massDeleteGuard — garde-fou E2 contre la purge silencieuse du miroir sur un
 * listing distant incomplet. Cœur PUR, testé sans device ni `.gamedata`.
 */
import { describe, expect, it } from 'vitest';
import { massDeleteGuard } from './pull-gamedata';

describe('massDeleteGuard', () => {
  it('run incrémental normal (peu de suppressions) → OK', () => {
    expect(massDeleteGuard({ localSize: 1000, toDelete: 3, toPull: 5 })).toBeNull();
  });

  it('vrai gros patch (supprime beaucoup MAIS tire autant) → OK', () => {
    // Bundles content-addressed : un nom change → 1 suppression + 1 tirage.
    expect(massDeleteGuard({ localSize: 1000, toDelete: 700, toPull: 720 })).toBeNull();
  });

  it('listing tronqué (supprime l’essentiel, ne tire presque rien) → REFUS', () => {
    const r = massDeleteGuard({ localSize: 1000, toDelete: 900, toPull: 4 });
    expect(r).toBeTruthy();
    expect(r).toMatch(/900\/1000/);
    expect(r).toMatch(/miroir intact/);
  });

  it('bootstrap (miroir vide) → OK, jamais de refus', () => {
    expect(massDeleteGuard({ localSize: 0, toDelete: 0, toPull: 5000 })).toBeNull();
  });

  it('juste sous les seuils (50 % pile, ou pull ≥ 10 %) → OK', () => {
    expect(massDeleteGuard({ localSize: 1000, toDelete: 500, toPull: 0 })).toBeNull(); // delRatio pas > 0.5
    expect(massDeleteGuard({ localSize: 1000, toDelete: 900, toPull: 100 })).toBeNull(); // pullRatio pas < 0.1
  });
});

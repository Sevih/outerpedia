/**
 * mapLimit — parallélisme borné, ORDRE préservé (le déterminisme aval en dépend).
 */
import { describe, expect, it } from 'vitest';
import { mapLimit } from './concurrency';

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('mapLimit', () => {
  it('préserve l’ordre des ENTRÉES, pas celui de l’achèvement', async () => {
    // Les premiers éléments finissent EN DERNIER (délai décroissant) : si l'ordre
    // suivait l'achèvement, le résultat serait inversé.
    const out = await mapLimit([0, 1, 2, 3], 4, async (v) => {
      await tick((4 - v) * 5);
      return v * 10;
    });
    expect(out).toEqual([0, 10, 20, 30]);
  });

  it('ne dépasse JAMAIS `limit` exécutions en vol', async () => {
    let active = 0;
    let peak = 0;
    await mapLimit(
      Array.from({ length: 20 }, (_, i) => i),
      3,
      async () => {
        active++;
        peak = Math.max(peak, active);
        await tick(5);
        active--;
      },
    );
    expect(peak).toBe(3);
  });

  it('traite TOUS les éléments (pool plus grand que la liste)', async () => {
    const out = await mapLimit([1, 2, 3], 100, async (v) => v + 1);
    expect(out).toEqual([2, 3, 4]);
  });

  it('limit ≤ 0 → ramené à 1 (jamais de pool vide), reste séquentiel', async () => {
    let active = 0;
    let peak = 0;
    await mapLimit([1, 2, 3], 0, async () => {
      active++;
      peak = Math.max(peak, active);
      await tick(2);
      active--;
    });
    expect(peak).toBe(1);
  });

  it('liste vide → []', async () => {
    expect(await mapLimit([], 4, async () => 1)).toEqual([]);
  });

  it('propage la première erreur (comme Promise.all)', async () => {
    await expect(
      mapLimit([1, 2, 3], 2, async (v) => {
        if (v === 2) throw new Error('boom');
        return v;
      }),
    ).rejects.toThrow('boom');
  });

  it('passe l’index à `fn`', async () => {
    const out = await mapLimit(['a', 'b', 'c'], 2, async (v, i) => `${i}:${v}`);
    expect(out).toEqual(['0:a', '1:b', '2:c']);
  });
});

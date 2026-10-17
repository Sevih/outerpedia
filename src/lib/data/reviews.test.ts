import { afterEach, describe, expect, it, vi } from 'vitest';
import { getReviewsForCharacter, type Review } from '@/lib/data/reviews';

/**
 * La fiche perso awaite cet appel à chaque régénération : on verrouille la
 * promesse de l'en-tête de `reviews.ts` — demande par ID, et `[]` en toute
 * erreur (la fiche ne casse jamais). `fetch` est bouchonné, aucun appel réseau.
 */
const REVIEW: Review = {
  id: '1',
  userId: '42',
  username: 'tester',
  displayName: 'Tester',
  avatar: null,
  rating: 5,
  text: 'ok',
  score: 3,
  source: 'discord',
  timestamp: '2026-10-17T00:00:00.000Z',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getReviewsForCharacter', () => {
  it("demande les reviews par l'id du perso", async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () =>
      Response.json([REVIEW]),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await getReviewsForCharacter('2000001')).toEqual([REVIEW]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0]?.[0] ?? '')).toMatch(/\/reviews\/2000001$/);
  });

  it('réponse non-OK → []', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );
    expect(await getReviewsForCharacter('2000001')).toEqual([]);
  });

  it('exception de fetch (bot injoignable) → []', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    expect(await getReviewsForCharacter('2000001')).toEqual([]);
  });

  it('bot qui accepte sans répondre → [] au bout du délai', async () => {
    // Le bouchon ne répond jamais : seul le signal du délai (2 s) le libère.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
          }),
      ),
    );
    expect(await getReviewsForCharacter('2000001')).toEqual([]);
  }, 5000);
});

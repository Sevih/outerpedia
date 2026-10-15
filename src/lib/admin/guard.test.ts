import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Les surfaces `.dev.*` (routes `/images/*`, `/audio/*`, arbre `/dev`) portent
 * la seconde garde `IS_DEV` en plus de leur exclusion du build de prod. `IS_DEV`
 * se fige à l'import : chaque cas recharge les modules sous le `NODE_ENV` voulu.
 */
vi.mock('@/app/root-document', () => ({
  RootDocument: ({ children }: { children: unknown }) => children,
}));

async function load(env: 'development' | 'production') {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', env);
  return {
    images: await import('@/app/images/[...path]/route.dev'),
    audio: await import('@/app/audio/[...path]/route.dev'),
    layout: (await import('@/app/dev/layout.dev')).default,
  };
}

// Un chemin qui sort du staging : la route, quand elle tourne, répond 400.
const escape = () => ({ params: Promise.resolve({ path: ['..', 'x'] }) });
const req = () => new Request('http://localhost/images/x');

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('gardes IS_DEV des surfaces dev-only', () => {
  it('en développement, les routes tournent et la mise en page rend', async () => {
    const { images, audio, layout } = await load('development');
    expect((await images.GET(req(), escape())).status).toBe(400);
    expect((await audio.GET(req(), escape())).status).toBe(400);
    expect(layout({ children: 'ok' })).toBeTruthy();
  });

  it('hors développement, les routes répondent 404 et la mise en page lève notFound', async () => {
    const { images, audio, layout } = await load('production');
    expect((await images.GET(req(), escape())).status).toBe(404);
    expect((await audio.GET(req(), escape())).status).toBe(404);
    expect(() => layout({ children: 'ok' })).toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
  });
});

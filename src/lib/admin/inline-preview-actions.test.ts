import { beforeEach, describe, expect, it, vi } from 'vitest';

// L'IP du visiteur, telle que Caddy la pose ; chaque test change d'adresse
// pour repartir d'un compteur neuf.
let ip = '203.0.113.1';
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-real-client-ip': ip }),
}));

// La résolution elle-même n'est pas le sujet : un cœur factice qui compte.
const resolved = vi.hoisted(() => ({ batch: 0, single: 0 }));
vi.mock('./inline-preview', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./inline-preview')>()),
  resolveInlineBatch: async (texts: string[]) => {
    resolved.batch += 1;
    return texts.map(() => []);
  },
  resolveInlinePreview: async () => {
    resolved.single += 1;
    return { segments: [], checks: [] };
  },
}));

const { renderInlineBatch, renderInlinePreview } = await import('./inline-preview-actions');
const { PREVIEW_MAX_CHARS, PREVIEW_MAX_TEXTS, previewBoundsError } =
  await import('./inline-preview');

let n = 0;
beforeEach(() => {
  n += 1;
  ip = `203.0.113.${n}`;
  resolved.batch = 0;
  resolved.single = 0;
});

describe('previewBoundsError', () => {
  it('laisse passer un lot dans les bornes, refuse au-delà', () => {
    expect(previewBoundsError(Array(PREVIEW_MAX_TEXTS).fill('x'.repeat(PREVIEW_MAX_CHARS)))).toBe(
      null,
    );
    expect(previewBoundsError(Array(PREVIEW_MAX_TEXTS + 1).fill('x'))).toMatch(/at most 20 texts/);
    expect(previewBoundsError(['x'.repeat(PREVIEW_MAX_CHARS + 1)])).toMatch(/4000 characters/);
  });

  it('refuse ce qui n’est pas une liste de textes', () => {
    expect(previewBoundsError('x')).toMatch(/list of strings/);
    expect(previewBoundsError(['x', 3])).toMatch(/list of strings/);
  });
});

describe('renderInlineBatch / renderInlinePreview', () => {
  it('résout un appel dans les bornes', async () => {
    await expect(renderInlineBatch(['{E/Fire}', ''], 'en')).resolves.toEqual([[], []]);
    await expect(renderInlinePreview('{E/Fire}', 'fr')).resolves.toEqual({
      segments: [],
      checks: [],
    });
    expect(resolved).toEqual({ batch: 1, single: 1 });
  });

  it('refuse net un lot trop long ou un texte trop grand, sans rien résoudre', async () => {
    await expect(renderInlineBatch(Array(21).fill('a'), 'en')).rejects.toThrow(/at most 20/);
    await expect(renderInlinePreview('a'.repeat(4001), 'en')).rejects.toThrow(/4000/);
    await expect(renderInlineBatch('a' as unknown as string[], 'en')).rejects.toThrow(/strings/);
    expect(resolved).toEqual({ batch: 0, single: 0 });
  });

  it('compte les appels par IP, les deux actions ensemble', async () => {
    for (let i = 0; i < 120; i += 1) {
      await renderInlineBatch(['a'], 'en');
      await renderInlinePreview('a', 'en');
    }
    await expect(renderInlineBatch(['a'], 'en')).rejects.toThrow('rate_limited');
    // Une autre adresse garde son propre quota.
    ip = '198.51.100.7';
    await expect(renderInlineBatch(['a'], 'en')).resolves.toEqual([[]]);
  });
});

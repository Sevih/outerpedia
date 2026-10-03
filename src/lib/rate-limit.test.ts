import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clientIp, createRateLimiter } from './rate-limit';

const req = (headers: Record<string, string>) =>
  new Request('https://outerpedia.com/', { headers });

describe('clientIp', () => {
  it("lit l'en-tête posé par Caddy, avant tout le reste", () => {
    expect(
      clientIp(req({ 'x-real-client-ip': '7.7.7.7', 'x-forwarded-for': '6.6.6.6, 1.1.1.1' })),
    ).toBe('7.7.7.7');
  });

  it('se replie sur la DERNIÈRE valeur de X-Forwarded-For, jamais la première', () => {
    expect(clientIp(req({ 'x-forwarded-for': '6.6.6.6, 10.0.0.1' }))).toBe('10.0.0.1');
    expect(clientIp(req({ 'x-forwarded-for': '10.0.0.1' }))).toBe('10.0.0.1');
  });

  it("n'écoute plus X-Real-IP, que personne ne pose", () => {
    expect(clientIp(req({ 'x-real-ip': '6.6.6.6' }))).toBe('unknown');
  });

  it('rend « unknown » sans en-tête', () => {
    expect(clientIp(req({}))).toBe('unknown');
  });
});

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('laisse passer `max` appels par fenêtre, bloque le suivant, puis rouvre', () => {
    const limited = createRateLimiter({ windowMs: 1000, max: 3 });
    expect([limited('a'), limited('a'), limited('a')]).toEqual([false, false, false]);
    expect(limited('a')).toBe(true);
    expect(limited('b')).toBe(false);
    vi.setSystemTime(1001);
    expect(limited('a')).toBe(false);
  });

  it('garde la Map bornée sous un flot de clés distinctes', () => {
    const limited = createRateLimiter({ windowMs: 60_000, max: 1, maxEntries: 5 });
    for (let i = 0; i < 100; i += 1) limited(`flood-${i}`);
    // Les 5 dernières clés tiennent encore leur compteur : un second appel
    // dans la fenêtre est refusé.
    expect(limited('flood-99')).toBe(true);
    expect(limited('flood-95')).toBe(true);
    // Une clé évincée repart de zéro (premier appel accepté).
    expect(limited('flood-0')).toBe(false);
  });

  it('évince les entrées expirées avant les vivantes', () => {
    const limited = createRateLimiter({ windowMs: 1000, max: 1, maxEntries: 3 });
    limited('old-1');
    limited('old-2');
    vi.setSystemTime(500);
    limited('alive');
    vi.setSystemTime(1200); // old-1 et old-2 expirées, alive vivante
    limited('new');
    expect(limited('alive')).toBe(true);
  });
});

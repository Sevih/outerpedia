import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clientIp, createRateLimiter, createWriteQuota, rateKey } from './rate-limit';

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

  it('lit aussi des en-têtes seuls (server action, `headers()`)', () => {
    expect(clientIp({ headers: new Headers({ 'x-real-client-ip': '7.7.7.7' }) })).toBe('7.7.7.7');
  });
});

describe('rateKey', () => {
  it("garde l'adresse IPv4 telle quelle", () => {
    expect(rateKey('203.0.113.9')).toBe('203.0.113.9');
    expect(rateKey(' 203.0.113.9 ')).toBe('203.0.113.9');
  });

  it('ramène une IPv6 à son préfixe /64, quelle que soit sa notation', () => {
    const key = '2001:db8:1:2::/64';
    expect(rateKey('2001:db8:1:2::1')).toBe(key);
    expect(rateKey('2001:0DB8:0001:0002:ffff:eeee:dddd:cccc')).toBe(key);
    expect(rateKey('[2001:db8:1:2:3:4:5:6]')).toBe(key);
    expect(rateKey('2001:db8:1:2::1%eth0')).toBe(key);
    expect(rateKey('2001:db8:1:3::1')).toBe('2001:db8:1:3::/64');
    expect(rateKey('::1')).toBe('0:0:0:0::/64');
    expect(rateKey('2001:db8::')).toBe('2001:db8:0:0::/64');
  });

  it("compte une IPv4 notée en IPv6 comme l'IPv4", () => {
    expect(rateKey('::ffff:203.0.113.9')).toBe('203.0.113.9');
    expect(rateKey('0:0:0:0:0:ffff:203.0.113.9')).toBe('203.0.113.9');
  });

  it('rend telle quelle une valeur illisible', () => {
    expect(rateKey('unknown')).toBe('unknown');
    expect(rateKey('1::2::3')).toBe('1::2::3');
    expect(rateKey('1:2:3')).toBe('1:2:3');
    expect(rateKey('zz::1')).toBe('zz::1');
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

  it('compte un /64 comme une seule IP', () => {
    const limited = createRateLimiter({ windowMs: 1000, max: 2 });
    expect(limited('2001:db8:1:2::1')).toBe(false);
    expect(limited('2001:db8:1:2::2')).toBe(false);
    expect(limited('2001:db8:1:2:ffff::3')).toBe(true);
    expect(limited('2001:db8:1:3::1')).toBe(false);
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

describe('createWriteQuota', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepte `max` écritures par fenêtre, toutes IP confondues, puis rouvre', () => {
    const exceeded = createWriteQuota({ windowMs: 1000, max: 3 });
    expect([exceeded(), exceeded(), exceeded()]).toEqual([false, false, false]);
    expect(exceeded()).toBe(true);
    vi.setSystemTime(1001);
    expect(exceeded()).toBe(false);
  });

  it('vaut 60 par minute par défaut', () => {
    const exceeded = createWriteQuota();
    for (let i = 0; i < 60; i += 1) expect(exceeded()).toBe(false);
    expect(exceeded()).toBe(true);
    vi.setSystemTime(60_001);
    expect(exceeded()).toBe(false);
  });
});

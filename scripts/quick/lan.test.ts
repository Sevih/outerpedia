import { describe, expect, it } from 'vitest';
import { peersOf } from '../dev-caddy.mjs';
import { isAllowedOrigin, isAllowedRemote, parsePeers } from './lan';

describe('quick ouvert à l’autre PC', () => {
  const peers = parsePeers('192.168.1.54, 192.168.1.204 192.168.1.65');

  it('lit DEV_PEERS, virgules ou espaces', () => {
    expect(peers).toEqual(['192.168.1.54', '192.168.1.204', '192.168.1.65']);
    expect(parsePeers(undefined)).toEqual([]);
    expect(parsePeers('  ')).toEqual([]);
  });

  it('accepte la boucle locale et les postes déclarés, rien d’autre', () => {
    expect(isAllowedRemote('127.0.0.1', [])).toBe(true);
    expect(isAllowedRemote('::1', [])).toBe(true);
    expect(isAllowedRemote('::ffff:127.0.0.1', [])).toBe(true);
    expect(isAllowedRemote('::ffff:192.168.1.54', peers)).toBe(true);
    expect(isAllowedRemote('192.168.1.54', [])).toBe(false);
    expect(isAllowedRemote('192.168.1.99', peers)).toBe(false);
    expect(isAllowedRemote(undefined, peers)).toBe(false);
  });

  it('refuse une écriture signée d’une autre origine', () => {
    expect(isAllowedOrigin(undefined, 4747)).toBe(true);
    expect(isAllowedOrigin('http://localhost:4747', 4747)).toBe(true);
    expect(isAllowedOrigin('https://quick.outerpedia.local', 4747)).toBe(true);
    expect(isAllowedOrigin('http://localhost:3000', 4747)).toBe(false);
    expect(isAllowedOrigin('https://outerpedia.local', 4747)).toBe(false);
    expect(isAllowedOrigin('null', 4747)).toBe(false);
  });
});

describe('dev-caddy — les amonts de l’autre PC', () => {
  it('retire de DEV_PEERS les adresses de ce poste', () => {
    const all = '192.168.1.54,192.168.1.204,192.168.1.65';
    expect(peersOf(all, ['127.0.0.1', '192.168.1.204', '192.168.1.65'])).toEqual(['192.168.1.54']);
    expect(peersOf(all, ['127.0.0.1', '192.168.1.54'])).toEqual(['192.168.1.204', '192.168.1.65']);
    expect(peersOf(undefined, ['127.0.0.1'])).toEqual([]);
  });
});

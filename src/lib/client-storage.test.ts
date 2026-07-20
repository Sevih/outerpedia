import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearStored, readStored, writeStored, type StoreSpec } from './client-storage';

/** Stub localStorage minimal (vitest tourne en node, pas de window). */
function stubStorage(): Map<string, string> {
  const map = new Map<string, string>();
  const ls = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
  vi.stubGlobal('window', { localStorage: ls });
  return map;
}

interface Settings {
  size: number;
  names: boolean;
}

const SPEC: StoreSpec<Settings> = {
  key: 'outerpedia:test',
  version: 2,
  fallback: { size: 48, names: true },
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('readStored', () => {
  it('SSR (pas de window) → fallback', () => {
    expect(readStored(SPEC)).toEqual(SPEC.fallback);
  });

  it('clé absente → fallback', () => {
    stubStorage();
    expect(readStored(SPEC)).toEqual(SPEC.fallback);
  });

  it('roundtrip write → read (enveloppe versionnée)', () => {
    const map = stubStorage();
    writeStored(SPEC, { size: 64, names: false });
    expect(readStored(SPEC)).toEqual({ size: 64, names: false });
    expect(JSON.parse(map.get('outerpedia:test')!)).toEqual({
      v: 2,
      data: { size: 64, names: false },
    });
  });

  it('JSON corrompu → fallback, sans jeter', () => {
    const map = stubStorage();
    map.set('outerpedia:test', '{oops');
    expect(readStored(SPEC)).toEqual(SPEC.fallback);
  });

  it('version antérieure → migrate, ré-écrite sous la version courante', () => {
    const map = stubStorage();
    map.set('outerpedia:test', JSON.stringify({ v: 1, data: { iconSize: 32 } }));
    const spec: StoreSpec<Settings> = {
      ...SPEC,
      migrate: (data, from) =>
        from === 1 ? { size: (data as { iconSize: number }).iconSize, names: true } : undefined,
    };
    expect(readStored(spec)).toEqual({ size: 32, names: true });
    expect(JSON.parse(map.get('outerpedia:test')!).v).toBe(2);
  });

  it('version antérieure sans migrate → fallback', () => {
    const map = stubStorage();
    map.set('outerpedia:test', JSON.stringify({ v: 1, data: { iconSize: 32 } }));
    expect(readStored(SPEC)).toEqual(SPEC.fallback);
    // Pas de migration réussie → la donnée d'origine n'est PAS écrasée.
    expect(JSON.parse(map.get('outerpedia:test')!).v).toBe(1);
  });

  it('clé V2 héritée absorbée : écrite sous la clé V3, la V2 reste en place', () => {
    const map = stubStorage();
    map.set('tlm-settings', JSON.stringify({ iconSize: 40, showNames: false }));
    const spec: StoreSpec<Settings> = {
      ...SPEC,
      legacyKeys: ['tlm-settings'],
      fromLegacy: (data) => {
        const d = data as { iconSize: number; showNames: boolean };
        return { size: d.iconSize, names: d.showNames };
      },
    };
    expect(readStored(spec)).toEqual({ size: 40, names: false });
    expect(JSON.parse(map.get('outerpedia:test')!).v).toBe(2);
    expect(map.has('tlm-settings')).toBe(true);
  });

  it('la clé V3 prime sur les clés héritées', () => {
    const map = stubStorage();
    map.set('outerpedia:test', JSON.stringify({ v: 2, data: { size: 64, names: true } }));
    map.set('tlm-settings', JSON.stringify({ iconSize: 40 }));
    const spec: StoreSpec<Settings> = {
      ...SPEC,
      legacyKeys: ['tlm-settings'],
      fromLegacy: () => ({ size: 0, names: false }),
    };
    expect(readStored(spec)).toEqual({ size: 64, names: true });
  });
});

describe('writeStored / clearStored', () => {
  it('quota plein → silencieux', () => {
    stubStorage();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
        removeItem: () => {},
      },
    });
    expect(() => writeStored(SPEC, { size: 1, names: true })).not.toThrow();
  });

  it('clearStored efface la clé V3 seulement', () => {
    const map = stubStorage();
    map.set('outerpedia:test', 'x');
    map.set('tlm-settings', 'y');
    clearStored({ ...SPEC, legacyKeys: ['tlm-settings'] });
    expect(map.has('outerpedia:test')).toBe(false);
    expect(map.has('tlm-settings')).toBe(true);
  });
});

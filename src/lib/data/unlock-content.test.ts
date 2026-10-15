import { describe, expect, it, vi } from 'vitest';
import type { UnlockEntry } from '@contracts';
import unlockData from '@data/generated/unlock-content.json';
import { getUnlockEntry } from '@/lib/data/unlock-content';

const ENTRIES = (unlockData as { entries: UnlockEntry[] }).entries;

describe('getUnlockEntry — la PREMIÈRE ligne d’un ContentType gagne, comme le jeu', () => {
  it('sur la donnée réelle : l’entrée rendue est la première de `entries` pour son type', () => {
    for (const type of new Set(ENTRIES.map((e) => e.contentType))) {
      expect(getUnlockEntry(type), type).toBe(ENTRIES.find((e) => e.contentType === type));
    }
  });

  it('sur une fixture à doublon : la première, pas la dernière', async () => {
    const first: UnlockEntry = { contentType: 'DUP', requirements: [{ stage: 'A' }] };
    const last: UnlockEntry = { contentType: 'DUP', requirements: [{ stage: 'B' }] };
    vi.resetModules();
    vi.doMock('@data/generated/unlock-content.json', () => ({
      default: { entries: [first, last] },
    }));
    const fresh = await import('@/lib/data/unlock-content');
    expect(fresh.getUnlockEntry('DUP')).toBe(first);
    vi.doUnmock('@data/generated/unlock-content.json');
  });
});

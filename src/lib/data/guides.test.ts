import { describe, expect, it } from 'vitest';
import { guideUpdatedDate, listGuides } from '@/lib/data/guides';

describe('guideUpdatedDate — résolution de la date de mise à jour', () => {
  it('privilégie le `updated` explicite du meta', () => {
    expect(
      guideUpdatedDate({
        updated: '2026-03-24',
        versions: [{ key: '2026-03' }, { key: '2025-10' }],
      }),
    ).toBe('2026-03-24');
  });

  it('dérive du dossier de version le plus récent quand `updated` est absent', () => {
    expect(
      guideUpdatedDate({ updated: undefined, versions: [{ key: '2026-03' }, { key: '2025-10' }] }),
    ).toBe('2026-03-01');
  });

  it('rend une chaîne vide pour un guide plat sans date (cas exclu par le scan)', () => {
    expect(guideUpdatedDate({ updated: undefined, versions: [] })).toBe('');
  });

  it('tous les guides réels résolvent une date ISO (le scan garantit la résolvabilité)', () => {
    for (const g of listGuides()) {
      expect(guideUpdatedDate(g), `${g.category}/${g.slug}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

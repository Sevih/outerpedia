import { describe, expect, it } from 'vitest';
import { guideUpdatedDate, listGuides, listGuidesByCategory } from '@/lib/data/guides';
import { GUIDE_TIER_KEYS, categoryRequires } from '@/lib/data/guide-categories';

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

describe('champs exigés par la vue d’une catégorie (`requires`)', () => {
  it('chaque guide porte les champs que sa catégorie exige', () => {
    for (const g of listGuides()) {
      for (const field of categoryRequires(g.category)) {
        expect(g[field], `${g.category}/${g.slug} : « ${field} » manquant`).toBeDefined();
      }
    }
  });

  /**
   * Le trou de la V2 : sa map `TIER_BY_SLUG` vivait dans le composant et un
   * guide absent était filtré SANS BRUIT. Ici la vue regroupe par palier
   * déclaré — ce test vérifie qu'aucun guide ne peut tomber hors des paniers.
   */
  it('aucun guide de general-guides ne tombe hors des paliers déclarés', () => {
    const guides = listGuidesByCategory('general-guides');
    const bucketed = GUIDE_TIER_KEYS.flatMap((tier) => guides.filter((g) => g.tier === tier));
    expect(bucketed).toHaveLength(guides.length);
  });
});

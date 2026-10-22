/**
 * Liens du suivi vers le guide du boss en cours — sur la VRAIE donnée
 * (calendrier du jeu, guides publiés) : la jointure saison → guide et la table
 * des boss de Singularity.
 */
import { describe, expect, it } from 'vitest';
import { listGuidesByCategory } from '@/lib/data/guides';
import { singularityGroups } from '@/lib/data/singularity';
import { seasonGuideLinks, singularityGuideLinks } from './guide-links';

describe('seasonGuideLinks', () => {
  it('World Boss 26 (fenêtre du 20/10) → Drakhan', () => {
    const [w] = seasonGuideLinks(
      'world-boss',
      [{ start: '2026-10-20T00:00:00Z', end: '2026-10-27T00:00:00Z' }],
      listGuidesByCategory('world-boss'),
      'en',
    );
    expect(w.guide?.href).toBe('/guides/world-boss/drakhan');
    expect(w.guide?.name).toBeTruthy();
  });

  it('Joint Challenge 31 (fenêtre du 06/10) → Annihilator', () => {
    const [w] = seasonGuideLinks(
      'joint-challenge',
      [{ start: '2026-10-06T00:00:00Z', end: '2026-10-13T00:00:00Z' }],
      listGuidesByCategory('joint-challenge'),
      'en',
    );
    expect(w.guide?.href).toBe('/guides/joint-challenge/annihilator');
  });

  it("une fenêtre sans guide n'a pas de champ `guide`", () => {
    const windows = [{ start: '2099-01-01T00:00:00Z', end: '2099-01-08T00:00:00Z' }];
    const [w] = seasonGuideLinks('world-boss', windows, listGuidesByCategory('world-boss'), 'en');
    expect(w).toEqual(windows[0]);
    expect('guide' in w).toBe(false);
  });

  it("le mode compte : la fenêtre d'un World Boss ne prend pas un guide de Joint Challenge", () => {
    const [w] = seasonGuideLinks(
      'joint-challenge',
      [{ start: '2026-10-20T00:00:00Z', end: '2026-10-27T00:00:00Z' }],
      listGuidesByCategory('joint-challenge'),
      'en',
    );
    expect(w.guide).toBeUndefined();
  });
});

describe('singularityGuideLinks', () => {
  const table = singularityGuideLinks(listGuidesByCategory('dimensional-singularity'), 'fr');

  it('chacun des boss de la rotation a son guide', () => {
    const bosses = new Set(singularityGroups().flatMap((g) => g.bosses.map((b) => b.monsters[0])));
    expect(bosses.size).toBe(15);
    expect([...bosses].filter((id) => !table[id])).toEqual([]);
  });

  it('href de guide, nom du boss dans la langue', () => {
    for (const link of Object.values(table)) {
      expect(link.href).toMatch(/^\/guides\/dimensional-singularity\/[a-z0-9-]+$/);
      expect(link.name).toBeTruthy();
    }
  });
});

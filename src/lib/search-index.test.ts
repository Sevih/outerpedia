import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '@/i18n';
import { buildSearchIndex } from '@/lib/search-index';

/**
 * `buildSearchIndex` s'appuie sur la donnée committée (`data/generated`, contrat
 * `lib/nav.ts`) : la suite tourne sans `.gamedata`. Le `t` est un stub identité
 * (les libellés de page valent alors leur clé de traduction).
 */
const t = (k: TranslationKey) => k as unknown as string;
const INDEX = buildSearchIndex('en', t);

describe('buildSearchIndex', () => {
  // Pages + personnages viennent de donnée committée (toujours là) ; les guides
  // dépendent d'un scan filesystem (best-effort — cf. `source()`), on n'exige donc
  // pas un compte mais on vérifie leur forme.
  it('couvre au moins les pages et les personnages', () => {
    const kinds = new Set(INDEX.map((e) => e.kind));
    expect(kinds).toContain('page');
    expect(kinds).toContain('character');
  });

  it('toute entrée a un libellé ET un href', () => {
    for (const e of INDEX) {
      expect(e.label).toBeTruthy();
      expect(e.href).toBeTruthy();
    }
  });

  it('les personnages pointent /characters/<slug> avec une vignette', () => {
    const chars = INDEX.filter((e) => e.kind === 'character');
    expect(chars.length).toBeGreaterThan(0);
    for (const c of chars) {
      expect(c.href.startsWith('/characters/')).toBe(true);
      expect(c.icon).toBeTruthy();
    }
  });

  it('les guides (quels qu’ils soient) pointent /guides/<catégorie>/<slug>', () => {
    const guides = INDEX.filter((e) => e.kind === 'guide');
    for (const g of guides) expect(g.href).toMatch(/^\/guides\/[^/]+\/[^/]+$/);
  });

  it('les pages incluent la nav principale (contrat lib/nav.ts)', () => {
    const pageHrefs = new Set(INDEX.filter((e) => e.kind === 'page').map((e) => e.href));
    expect(pageHrefs.has('/characters')).toBe(true);
    expect(pageHrefs.has('/guides')).toBe(true);
  });

  it('les pages de catégorie de guides (/guides/<slug>) portent une vignette', () => {
    const cats = INDEX.filter((e) => e.kind === 'page' && /^\/guides\/[^/]+$/.test(e.href));
    expect(cats.length).toBeGreaterThan(0);
    for (const c of cats) expect(c.icon).toBeTruthy();
  });

  it('aucun doublon d’href par nature', () => {
    for (const kind of ['character', 'guide'] as const) {
      const hrefs = INDEX.filter((e) => e.kind === kind).map((e) => e.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });
});

import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '@/i18n';
import { buildSearchIndex } from '@/lib/search-index';
import { normalizeSearchText } from '@/lib/search-text';

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

/**
 * Le bug qui a motivé `terms` : la palette ne filtrait que sur le libellé
 * AFFICHÉ, donc sur zh.outerpedia.com uniquement sur du chinois — un nom anglais
 * ne matchait plus rien dès la traduction de la donnée (XTY109, 18/08/2026). Ces
 * tests appliquent aux termes la MÊME règle que la palette : tous les mots de la
 * saisie doivent s'y trouver.
 */
const tokens = (s: string) => normalizeSearchText(s).split(/\s+/).filter(Boolean);
const findable = (entry: { terms?: string }, query: string) =>
  tokens(query).every((tk) => (entry.terms ?? '').includes(tk));

describe('termes cherchables (terms)', () => {
  it('toute entrée porte des termes normalisés', () => {
    for (const e of INDEX) {
      expect(e.terms).toBeTruthy();
      expect(e.terms).toBe(normalizeSearchText(e.terms!));
      // Le libellé affiché reste cherchable tel qu'il est lu.
      expect(findable(e, e.label)).toBe(true);
    }
  });

  it('un personnage reste trouvable par son nom ANGLAIS depuis zh', () => {
    const slug = (href: string) => href.split('/characters/')[1];
    const zh = new Map(
      buildSearchIndex('zh', t)
        .filter((e) => e.kind === 'character')
        .map((e) => [slug(e.href), e]),
    );
    const en = INDEX.filter((e) => e.kind === 'character');
    expect(en.length).toBeGreaterThan(0);
    for (const e of en) {
      const cn = zh.get(slug(e.href));
      expect(cn).toBeDefined();
      expect(findable(cn!, e.label)).toBe(true);
    }
  });

  it('les pages et les guides sont trouvables par leur slug anglais', () => {
    const characters = INDEX.find((e) => e.href === '/characters');
    expect(findable(characters!, 'characters')).toBe(true);
    const zhCategories = buildSearchIndex('zh', t).filter(
      (e) => e.kind === 'page' && /\/guides\/[^/]+$/.test(e.href),
    );
    for (const c of zhCategories) {
      const cat = c.href.split('/guides/')[1];
      expect(findable(c, cat.replace(/-/g, ' '))).toBe(true);
    }
  });
});

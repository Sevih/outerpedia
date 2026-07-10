import type { MetadataRoute } from 'next';
import { LANGS, LANGUAGES, DEFAULT_LANG } from '@/lib/i18n/config';
import { buildUrl } from '@/lib/seo';
import { listCharacterSlugs } from '@/lib/data/characters';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { countGuides, listGuides } from '@/lib/data/guides';

/**
 * Sitemap multilingue avec alternates hreflang. Énumère home + liste persos +
 * chaque fiche + guides. L'URL principale est en langue par défaut ;
 * `alternates` liste toutes les langues (bon pour le crawl SEO et la
 * découverte GEO).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/characters',
    ...listCharacterSlugs().map((s) => `/characters/${s}`),
    '/guides',
    ...GUIDE_CATEGORY_SLUGS.filter((c) => countGuides(c) > 0).map((c) => `/guides/${c}`),
    ...listGuides()
      .filter((g) => !g.hidden)
      .map((g) => `/guides/${g.category}/${g.slug}`),
  ];

  return paths.map((path) => ({
    url: buildUrl(DEFAULT_LANG, path),
    changeFrequency: 'weekly',
    alternates: {
      languages: Object.fromEntries(LANGS.map((l) => [LANGUAGES[l].htmlLang, buildUrl(l, path)])),
    },
  }));
}

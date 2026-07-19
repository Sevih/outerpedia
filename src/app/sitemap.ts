import type { MetadataRoute } from 'next';
import { LANGS, LANGUAGES, DEFAULT_LANG } from '@/lib/i18n/config';
import { buildUrl } from '@/lib/seo';
import { listCharacterSlugs } from '@/lib/data/characters';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { countGuides, guideUpdatedDate, listGuides } from '@/lib/data/guides';
import { allEquipmentSlugs } from '@/lib/data/equipment-detail';

/**
 * Sitemap multilingue avec alternates hreflang. Énumère home + liste persos +
 * chaque fiche + guides. L'URL principale est en langue par défaut ;
 * `alternates` liste toutes les langues (bon pour le crawl SEO et la
 * découverte GEO). Les guides portent un `lastModified` (date `updated`
 * résolue) — signal de fraîcheur fiable pour le crawl.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const generic = [
    '/',
    '/characters',
    ...listCharacterSlugs().map((s) => `/characters/${s}`),
    '/equipment',
    ...allEquipmentSlugs().map((s) => `/equipment/${s}`),
    '/guides',
    ...GUIDE_CATEGORY_SLUGS.filter((c) => countGuides(c) > 0).map((c) => `/guides/${c}`),
    '/legal',
    '/contributors',
    '/coupons',
    '/tools',
  ];

  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: buildUrl(DEFAULT_LANG, path),
    changeFrequency: 'weekly',
    ...(lastModified ? { lastModified } : {}),
    alternates: {
      languages: Object.fromEntries(LANGS.map((l) => [LANGUAGES[l].htmlLang, buildUrl(l, path)])),
    },
  });

  return [
    ...generic.map((p) => entry(p)),
    ...listGuides()
      .filter((g) => !g.hidden)
      .map((g) => entry(`/guides/${g.category}/${g.slug}`, guideUpdatedDate(g))),
  ];
}

import type { MetadataRoute } from 'next';
import { LANGS, LANGUAGES, DEFAULT_LANG } from '@/lib/i18n/config';
import { buildUrl } from '@/lib/seo';
import { listCharacterSlugs } from '@/lib/data/characters';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { countGuides, guideUpdatedDate, listGuides } from '@/lib/data/guides';
import { allEquipmentSlugs } from '@/lib/data/equipment-detail';
import { listEventSlugs } from '@/lib/data/events';
import { PORTED_TOOL_SLUGS } from './[lang]/tools/registry';

/**
 * Sitemap multilingue avec alternates hreflang. Énumère home + liste persos +
 * chaque fiche + guides + événements. L'URL principale est en langue par
 * défaut ; `alternates` liste toutes les langues (bon pour le crawl SEO et la
 * découverte GEO). Les guides portent un `lastModified` (date `updated`
 * résolue) — signal de fraîcheur fiable pour le crawl.
 *
 * TOUTE page indexable doit figurer ici. Y ajouter une route au moment où on la
 * crée : `/changelog` et `/event` (+ ses fiches) étaient pré-rendues et
 * indexables mais absentes, donc invisibles au crawl (audit du 07/08). Les
 * pages en `robots: { index: false }` — `/contribute` et ses sous-pages — sont
 * au contraire à laisser DEHORS : les déclarer contredirait leur propre balise.
 *
 * `async` pour `listEventSlugs` (les événements se lisent au disque) ; il filtre
 * déjà les brouillons, un événement `draft` ne doit jamais être annoncé.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generic = [
    '/',
    '/characters',
    ...listCharacterSlugs().map((s) => `/characters/${s}`),
    '/equipment',
    ...allEquipmentSlugs().map((s) => `/equipment/${s}`),
    '/guides',
    ...GUIDE_CATEGORY_SLUGS.filter((c) => countGuides(c) > 0).map((c) => `/guides/${c}`),
    '/event',
    ...(await listEventSlugs()).map((s) => `/event/${s}`),
    '/changelog',
    '/legal',
    '/contributors',
    '/coupons',
    '/tools',
    // Outils portés (routeur à plat `/<slug>`) — s'étend avec le registre.
    ...PORTED_TOOL_SLUGS.map((s) => `/${s}`),
    '/tierlist',
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

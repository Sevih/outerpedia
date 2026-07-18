import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import {
  createPageMetadata,
  buildUrl,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
} from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { CategoryCard } from '@/components/guides/CategoryCard';
import { GUIDE_CATEGORIES, GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { countGuides } from '@/lib/data/guides';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/guides',
    title: t('page.guides.title'),
    description: t('page.guides.description'),
  });
}

export default async function GuidesLanding({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);

  // Catégories non vides, dans l'ordre d'affichage (mêmes que la grille).
  const visibleCategories = GUIDE_CATEGORY_SLUGS.filter((slug) => countGuides(slug) > 0);

  const crumbLd = buildBreadcrumbJsonLd([
    { name: 'Outerpedia', url: buildUrl(lang, '/') },
    { name: t('page.guides.title'), url: buildUrl(lang, '/guides') },
  ]);
  const listLd = buildItemListJsonLd({
    name: t('page.guides.title'),
    description: t('page.guides.description'),
    url: buildUrl(lang, '/guides'),
    itemListOrder: 'Ascending',
    items: visibleCategories.map((slug) => ({
      name: lRec(GUIDE_CATEGORIES[slug].label, lang),
      url: buildUrl(lang, `/guides/${slug}`),
    })),
  });

  const totalGuides = visibleCategories.reduce((sum, slug) => sum + countGuides(slug), 0);
  const counterLabel = t('guides.counter', {
    guides: totalGuides,
    categories: visibleCategories.length,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <JsonLd data={crumbLd} />
      <JsonLd data={listLd} />

      {/* Héro (visuel V2) : titre-bandeau, description, compteur. */}
      <div className="flex flex-col items-center text-center">
        <h1 className="h1-page">{t('page.guides.title')}</h1>
        <p className="text-content-muted mx-auto mt-2 max-w-2xl text-sm">
          {t('page.guides.description')}
        </p>
        <div className="text-content-subtle mt-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase">
          <span
            className="inline-block size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            aria-hidden
          />
          <span>{counterLabel}</span>
        </div>
      </div>

      <h2 className="sr-only">{t('page.guides.list')}</h2>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCategories.map((slug) => {
          const count = countGuides(slug);
          return (
            <CategoryCard
              key={slug}
              slug={slug}
              lang={lang}
              countLabel={t(count === 1 ? 'guides.count.one' : 'guides.count.many', { count })}
            />
          );
        })}
      </div>
    </div>
  );
}

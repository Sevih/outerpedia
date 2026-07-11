import type { Metadata } from 'next';
import Link from 'next/link';
import { isValidLang, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import {
  createPageMetadata,
  buildUrl,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
} from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { GUIDE_CATEGORIES, GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { countGuides } from '@/lib/data/guides';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
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
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
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

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <JsonLd data={crumbLd} />
      <JsonLd data={listLd} />
      <div>
        <h1 className="text-content-strong text-2xl font-bold">{t('page.guides.title')}</h1>
        <p className="text-content-muted text-sm">{t('page.guides.description')}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCategories.map((slug) => {
          const cat = GUIDE_CATEGORIES[slug];
          const count = countGuides(slug);
          return (
            <Link
              key={slug}
              href={localePath(lang, `/guides/${slug}`)}
              className="border-line-subtle bg-surface-raised hover:border-line group flex gap-4 rounded-lg border p-4 shadow-sm transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
              <img
                src={img.guideIcon(cat.icon)}
                alt=""
                className="h-12 w-12 shrink-0 object-contain"
                loading="lazy"
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-content-strong group-hover:text-accent font-semibold transition-colors">
                    {lRec(cat.label, lang)}
                  </h2>
                  <span className="text-content-muted text-xs whitespace-nowrap">
                    {t(count === 1 ? 'guides.count.one' : 'guides.count.many', { count })}
                  </span>
                </div>
                <p className="text-content-muted mt-1 line-clamp-3 text-sm">
                  {lRec(cat.desc, lang)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

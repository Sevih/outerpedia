import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LANGS, isValidLang, type Lang } from '@/lib/i18n/config';
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
import {
  GUIDE_CATEGORIES,
  GUIDE_CATEGORY_SLUGS,
  isGuideCategory,
} from '@/lib/data/guide-categories';
import { listGuidesByCategory } from '@/lib/data/guides';
import CategoryView from '@/components/guides/category-views';

export function generateStaticParams() {
  return LANGS.flatMap((lang) => GUIDE_CATEGORY_SLUGS.map((category) => ({ lang, category })));
}

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang: raw, category } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  if (!isGuideCategory(category)) return {};
  const cat = GUIDE_CATEGORIES[category];
  return createPageMetadata({
    lang,
    path: `/guides/${category}`,
    title: lRec(cat.label, lang),
    description: lRec(cat.desc, lang),
  });
}

export default async function GuideCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang: raw, category } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  if (!isGuideCategory(category)) notFound();

  const t = await getT(lang);
  const cat = GUIDE_CATEGORIES[category];
  const label = lRec(cat.label, lang);
  const guides = listGuidesByCategory(category);

  const crumbLd = buildBreadcrumbJsonLd([
    { name: 'Outerpedia', url: buildUrl(lang, '/') },
    { name: t('page.guides.title'), url: buildUrl(lang, '/guides') },
    { name: label, url: buildUrl(lang, `/guides/${category}`) },
  ]);
  const listLd = buildItemListJsonLd({
    name: label,
    description: lRec(cat.desc, lang),
    url: buildUrl(lang, `/guides/${category}`),
    // Liste réellement ordonnée (order croissant puis date) — pas Unordered.
    itemListOrder: 'Ascending',
    items: guides.map((g) => ({
      name: lRec(g.title, lang),
      url: buildUrl(lang, `/guides/${category}/${g.slug}`),
    })),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <JsonLd data={crumbLd} />
      <JsonLd data={listLd} />
      <nav className="text-content-muted text-sm">
        <Link href={localePath(lang, '/guides')} className="hover:text-content-strong">
          {t('page.guides.title')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-content-strong">{label}</span>
      </nav>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img src={img.guideIcon(cat.icon)} alt="" className="h-12 w-12 object-contain" />
        <div>
          <h1 className="text-content-strong text-2xl font-bold">{label}</h1>
          <p className="text-content-muted text-sm">{lRec(cat.desc, lang)}</p>
        </div>
      </div>
      {guides.length === 0 ? (
        <p className="text-content-muted text-sm">{t('page.guides.empty_category')}</p>
      ) : (
        <CategoryView lang={lang} category={category} guides={guides} />
      )}
    </div>
  );
}

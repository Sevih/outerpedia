import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LANGS, isValidLang, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import { createPageMetadata, buildUrl, buildBreadcrumbJsonLd, buildArticleJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { localePath } from '@/lib/navigation';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { GUIDE_CATEGORIES } from '@/lib/data/guide-categories';
import {
  formatGuideDate,
  getGuide,
  listGuideParams,
  type GuideContentProps,
} from '@/lib/data/guides';

export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    listGuideParams().map(({ category, slug }) => ({ lang, category, slug })),
  );
}

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, category, slug } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const guide = getGuide(category, slug);
  if (!guide) return {};
  return createPageMetadata({
    lang,
    path: `/guides/${category}/${slug}`,
    title: lRec(guide.title, lang),
    description: lRec(guide.description, lang),
    ...(guide.ogImage ? { ogImage: guide.ogImage } : {}),
  });
}

export default async function GuideDetail({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}) {
  const { lang: raw, category, slug } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const guide = getGuide(category, slug);
  if (!guide) notFound();

  const t = await getT(lang);
  const title = lRec(guide.title, lang);
  const catLabel = lRec(GUIDE_CATEGORIES[guide.category].label, lang);
  const path = `/guides/${category}/${slug}`;

  // Le data layer garantit l'existence d'index.tsx : un échec ici est un vrai
  // bug de contenu et doit CASSER le build, pas produire un 404 silencieux.
  const mod = (await import(`../../_contents/${category}/${slug}/index`)) as {
    default: React.ComponentType<GuideContentProps>;
  };
  const GuideContent = mod.default;

  const articleLd = buildArticleJsonLd({
    lang,
    path,
    headline: title,
    description: lRec(guide.description, lang),
    author: guide.author,
    dateModified: guide.updated,
    ...(guide.ogImage ? { image: guide.ogImage } : {}),
  });
  const crumbLd = buildBreadcrumbJsonLd([
    { name: 'Outerpedia', url: buildUrl(lang, '/') },
    { name: t('page.guides.title'), url: buildUrl(lang, '/guides') },
    { name: catLabel, url: buildUrl(lang, `/guides/${category}`) },
    { name: title, url: buildUrl(lang, path) },
  ]);

  return (
    <div className="mx-auto max-w-285 space-y-6 px-4 py-6 lg:px-6">
      <JsonLd data={articleLd} />
      <JsonLd data={crumbLd} />
      <nav className="text-content-muted text-sm">
        <Link href={localePath(lang, '/guides')} className="hover:text-content-strong">
          {t('page.guides.title')}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={localePath(lang, `/guides/${guide.category}`)}
          className="hover:text-content-strong"
        >
          {catLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-content-strong">{title}</span>
      </nav>
      <header className="space-y-2">
        <h1 className="text-content-strong text-3xl font-bold">{title}</h1>
        <div className="text-content-muted flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span>
            {t('page.guide.by', { author: guide.author })} ·{' '}
            {t('page.guide.updated', { date: formatGuideDate(guide.updated, lang) })}
          </span>
          <ShareButtons title={title} lang={lang} />
        </div>
      </header>
      <article className="space-y-6">
        <GuideContent lang={lang} guide={guide} />
      </article>
    </div>
  );
}

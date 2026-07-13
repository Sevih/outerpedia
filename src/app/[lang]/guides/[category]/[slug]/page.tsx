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
import { GUIDE_CATEGORIES, type GuideCategory } from '@/lib/data/guide-categories';
import {
  formatGuideDate,
  getGuide,
  guideUpdatedDate,
  listGuideParams,
  type GuideContentProps,
} from '@/lib/data/guides';
import { getMonster, monsterOgImage } from '@/lib/data/monsters';

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
  const updated = guideUpdatedDate(guide);

  // CARTE DE PARTAGE : le portrait du boss quand le guide en a un — c'est le
  // visuel qui identifie le guide, et il est déjà dans la donnée (`meta.bossId`),
  // donc rien à saisir à la main. `meta.ogImage` reste prioritaire : c'est
  // l'échappatoire pour un guide qui veut son propre visuel.
  // Les guides SANS boss (general-guides…) gardent la carte par défaut du site :
  // leur donner un visuel demande une image générée, chantier à part.
  const boss = guide.bossId ? getMonster(guide.bossId) : undefined;
  const portrait =
    boss && !guide.ogImage
      ? // Les sprites `MT_*` font 128×128 (21 des 24 extraits ; les 3 autres à
        // quelques pixels près). La taille n'est qu'un indice pour le crawler.
        { ogImage: monsterOgImage(boss), ogImageSize: { width: 128, height: 128 } }
      : undefined;

  // Catégorie `bossTitle` : le SEO titre sur le boss, comme la page —
  // « Nom du boss — Special Request » et la description préfixée de son nom
  // (le reste de la phrase vient du meta, déjà localisé par mode).
  const bossName =
    (GUIDE_CATEGORIES[guide.category] as GuideCategory).bossTitle && boss
      ? lRec(boss.name, lang) || boss.name.en
      : undefined;

  return createPageMetadata({
    lang,
    path: `/guides/${category}/${slug}`,
    title: bossName
      ? `${bossName} — ${lRec(GUIDE_CATEGORIES[guide.category].label, lang)}`
      : lRec(guide.title, lang),
    description: bossName
      ? `${bossName} — ${lRec(guide.description, lang)}`
      : lRec(guide.description, lang),
    ...(guide.ogImage ? { ogImage: guide.ogImage } : {}),
    ...portrait,
    // og:type=article + dates (published = modified faute de date de création).
    article: { publishedTime: updated, modifiedTime: updated, authors: [guide.author] },
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
  const updated = guideUpdatedDate(guide);
  // Catégorie qui titre sur le BOSS (cf. `bossTitle`, guide-categories.ts).
  const boss =
    (GUIDE_CATEGORIES[guide.category] as GuideCategory).bossTitle && guide.bossId
      ? getMonster(guide.bossId)
      : undefined;

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
    dateModified: updated,
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
      {boss ? (
        /* Catégorie `bossTitle` : le guide EST la fiche d'un boss — H1 centré à
           son NOM (le titre du meta, générique, reste au SEO et aux listes),
           partage à droite, et le sous-titre annonce ce qu'on va lire. */
        <header className="space-y-2">
          {/* Les headings sont en `width: fit-content` (globals.css, trait de
              titre du jeu) : centrer le TEXTE ne fait rien, on centre le bloc. */}
          <h1 className="text-content-strong mx-auto text-3xl font-bold">
            {lRec(boss.name, lang) || boss.name.en}
          </h1>
          <div className="text-content-muted flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
            <span>
              {t('page.guide.by', { author: guide.author })} ·{' '}
              {t('page.guide.updated', { date: formatGuideDate(updated, lang) })}
            </span>
            <ShareButtons title={title} lang={lang} />
          </div>
          <h2 className="text-content-strong text-xl font-bold">{t('guides.strategy_guide')}</h2>
        </header>
      ) : (
        <header className="space-y-2">
          <h1 className="text-content-strong text-3xl font-bold">{title}</h1>
          <div className="text-content-muted flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span>
              {t('page.guide.by', { author: guide.author })} ·{' '}
              {t('page.guide.updated', { date: formatGuideDate(updated, lang) })}
            </span>
            <ShareButtons title={title} lang={lang} />
          </div>
        </header>
      )}
      <article className="space-y-6">
        <GuideContent lang={lang} guide={guide} />
      </article>
    </div>
  );
}

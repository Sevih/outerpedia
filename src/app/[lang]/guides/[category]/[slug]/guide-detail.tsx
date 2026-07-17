/**
 * LE CORPS d'une page de guide — mutualisé entre la route de base
 * (`[category]/[slug]`) et la sous-route par étage (`[category]/[slug]/[floor]`,
 * propre aux tours). Les deux rendent le MÊME cadre (fil d'Ariane, en-tête,
 * JSON-LD, boutons de partage) ; seule change la donnée passée au contenu :
 * l'étage courant (`floor`), `undefined` hors des tours.
 *
 * Les `generateStaticParams` / `generateMetadata` restent dans chaque `page.tsx`
 * (ils diffèrent : la sous-route énumère les étages et canonicalise sur eux).
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import { buildUrl, buildBreadcrumbJsonLd, buildArticleJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { localePath } from '@/lib/navigation';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { GUIDE_CATEGORIES, type GuideCategory } from '@/lib/data/guide-categories';
import {
  formatGuideDate,
  getGuide,
  guideUpdatedDate,
  type GuideContentProps,
} from '@/lib/data/guides';
import { getMonster } from '@/lib/data/monsters';

export async function GuideDetail({
  lang,
  category,
  slug,
  floor,
}: {
  lang: Lang;
  category: string;
  slug: string;
  /** Étage courant (tours) — passé tel quel au contenu. */
  floor?: number;
}) {
  const guide = getGuide(category, slug);
  if (!guide) notFound();

  const t = await getT(lang);
  const title = lRec(guide.title, lang);
  const catLabel = lRec(GUIDE_CATEGORIES[guide.category].label, lang);
  const path =
    floor !== undefined ? `/guides/${category}/${slug}/${floor}` : `/guides/${category}/${slug}`;
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

  const header: ReactNode = boss ? (
    /* Catégorie `bossTitle` : le guide EST la fiche d'un boss — H1 centré à son
       NOM (le titre du meta, générique, reste au SEO et aux listes), partage à
       droite, et le sous-titre annonce ce qu'on va lire. */
    <header className="space-y-2">
      {/* Les headings sont en `width: fit-content` (globals.css, trait de titre
          du jeu) : centrer le TEXTE ne fait rien, on centre le bloc. */}
      <h1 className="text-content-strong mx-auto text-3xl font-bold">
        {lRec(boss.name, lang) || boss.name.en}
      </h1>
      <div className="text-content-muted flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <span>
          {t('page.guide.by', { author: guide.author })} ·{' '}
          {t('page.guide.updated', { date: formatGuideDate(updated, lang) })}
        </span>
        <ShareButtons
          title={title}
          lang={lang}
          strings={{
            shareOn: t('share.on'),
            copyLink: t('share.copy_link'),
            copied: t('common.copied'),
          }}
        />
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
        <ShareButtons
          title={title}
          lang={lang}
          strings={{
            shareOn: t('share.on'),
            copyLink: t('share.copy_link'),
            copied: t('common.copied'),
          }}
        />
      </div>
    </header>
  );

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
      {header}
      <article className="space-y-6">
        <GuideContent lang={lang} guide={guide} floor={floor} />
      </article>
    </div>
  );
}

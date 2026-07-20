import type { Metadata } from 'next';
import { LANGS, normalizeLang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { createPageMetadata } from '@/lib/seo';
import { GUIDE_CATEGORIES, type GuideCategory } from '@/lib/data/guide-categories';
import { getGuide, guideBossMonster, guideUpdatedDate, listGuideParams } from '@/lib/data/guides';
import { monsterOgImage } from '@/lib/data/monsters';
import { GuideDetail } from './guide-detail';

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
  const lang = normalizeLang(raw);
  const guide = getGuide(category, slug);
  if (!guide) return {};
  const updated = guideUpdatedDate(guide);

  // CARTE DE PARTAGE : le portrait du boss quand le guide en a un — c'est le
  // visuel qui identifie le guide. `guideBossMonster` en est la source unique
  // (`meta.bossId`, ou le boss de phase 2 dérivé pour un guild raid). `meta.ogImage`
  // reste prioritaire : c'est l'échappatoire pour un guide qui veut son propre visuel.
  // Les guides SANS boss (general-guides…) gardent la carte par défaut du site :
  // leur donner un visuel demande une image générée, chantier à part.
  const boss = guideBossMonster(guide);
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

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}) {
  const { lang: raw, category, slug } = await params;
  const lang = normalizeLang(raw);
  return <GuideDetail lang={lang} category={category} slug={slug} />;
}

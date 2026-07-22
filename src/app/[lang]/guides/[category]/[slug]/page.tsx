import type { Metadata } from 'next';
import { LANGS, normalizeLang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { GUIDE_CATEGORIES, type GuideCategory } from '@/lib/data/guide-categories';
import { getGuide, guideBossMonster, guideUpdatedDate, listGuideParams } from '@/lib/data/guides';
import { monsterOgImage } from '@/lib/data/monsters';
import { img } from '@/lib/images';
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
  const t = await getT(lang);
  const updated = guideUpdatedDate(guide);

  // CARTE DE PARTAGE : le portrait du boss quand le guide en a un — c'est le
  // visuel qui identifie le guide. `guideBossMonster` en est la source unique
  // (`meta.bossId`, ou le boss de phase 2 dérivé pour un guild raid). `meta.ogImage`
  // reste prioritaire : c'est l'échappatoire pour un guide qui veut son propre visuel.
  // Les guides SANS boss (general-guides…) partagent leur ICÔNE de meta — le
  // visuel qui les identifie déjà partout dans l'UI — en variante PNG collectée
  // par le manifest pour EXACTEMENT ce sous-ensemble (les aperçus Discord/OG
  // digèrent mal le WebP). Tailles d'icônes variables : l'indice par défaut de
  // createPageMetadata suffit au crawler.
  const boss = guideBossMonster(guide);
  const portrait = guide.ogImage
    ? undefined
    : boss
      ? // Les sprites `MT_*` font 128×128 (21 des 24 extraits ; les 3 autres à
        // quelques pixels près). La taille n'est qu'un indice pour le crawler.
        { ogImage: monsterOgImage(boss), ogImageSize: { width: 128, height: 128 } }
      : { ogImage: img.guideIconPng(guide.icon) };

  // Catégorie `bossTitle` : le SEO titre sur le boss, comme la page —
  // « Nom du boss — Special Request » et la description préfixée de son nom
  // (le reste de la phrase vient du meta, déjà localisé par mode).
  const bossName =
    (GUIDE_CATEGORIES[guide.category] as GuideCategory).bossTitle && boss
      ? lRec(boss.name, lang) || boss.name.en
      : undefined;

  // PORTÉE du titre — un titre de meta n'est PAS unique à l'échelle du site
  // (audit du 2026-07-22) : « Drakhan » titrait à la fois la fiche du perso et
  // son guide World Boss, « Tyrant Toddler » ses deux guides (Singularity et
  // Adventure License). Le libellé de catégorie les sépare. Monad Gate rejoue en
  // plus les MÊMES zones à chaque profondeur — « Land of Snow and Steel » existe
  // en Depth 3 puis 6→10, 29 guides pour 5 titres : là, seule la profondeur
  // tranche. Effet de bord voulu : des titres plus longs (578 URLs étaient sous
  // la longueur utile).
  const catLabel = lRec(GUIDE_CATEGORIES[guide.category].label, lang);
  const scope = guide.depth
    ? `${catLabel} ${t('guides.monad_gate.depth', { n: guide.depth })}`
    : catLabel;

  return createPageMetadata({
    lang,
    path: `/guides/${category}/${slug}`,
    title: `${bossName ?? lRec(guide.title, lang)} — ${scope}`,
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

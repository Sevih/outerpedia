/**
 * UN ÉTAGE d'un guide de tour — la sous-route qui rend UN étage côté serveur en
 * restant STATIQUE (un `?floor=` déopterait toute la route guide en dynamique).
 * Seuls les guides `skyward-tower` peuplent cette route : `generateStaticParams`
 * énumère leurs étages, les autres guides n'ont simplement pas de segment
 * `[floor]`. Le cadre (en-tête, fil d'Ariane…) est mutualisé avec la route de
 * base (`GuideDetail`) ; ici on ne fait que résoudre l'étage et canonicaliser
 * sur lui.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGS, isValidLang, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { getGuide, listGuideParams } from '@/lib/data/guides';
import { getTower } from '@/lib/data/towers';
import { GuideDetail } from '../guide-detail';

/** Les étages de la tour d'un guide (`[]` si le guide n'est pas une tour). */
function towerFloors(category: string, slug: string): number[] {
  const guide = getGuide(category, slug);
  const tower = guide?.tower ? getTower(guide.tower) : undefined;
  return tower ? tower.floors.map((f) => f.floor) : [];
}

export function generateStaticParams() {
  const towerGuides = listGuideParams().filter(({ category }) => category === 'skyward-tower');
  return LANGS.flatMap((lang) =>
    towerGuides.flatMap(({ category, slug }) =>
      towerFloors(category, slug).map((floor) => ({
        lang,
        category,
        slug,
        floor: String(floor),
      })),
    ),
  );
}

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string; floor: string }>;
}): Promise<Metadata> {
  const { lang: raw, category, slug, floor } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const guide = getGuide(category, slug);
  const n = Number(floor);
  if (!guide || !Number.isInteger(n)) return {};
  const t = await getT(lang);
  const floorLabel = t('tower.floor', { n });

  return createPageMetadata({
    lang,
    // Chaque étage se canonicalise sur LUI-MÊME (contenu propre : boss et
    // conditions de l'étage).
    path: `/guides/${category}/${slug}/${floor}`,
    title: `${lRec(guide.title, lang)} — ${floorLabel}`,
    description: `${floorLabel} — ${lRec(guide.description, lang)}`,
    ...(guide.ogImage ? { ogImage: guide.ogImage } : {}),
  });
}

export default async function GuideFloorPage({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string; floor: string }>;
}) {
  const { lang: raw, category, slug, floor } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const n = Number(floor);
  // Étage non numérique = URL fabriquée → 404 (le composant valide l'existence).
  if (!Number.isInteger(n) || n < 1) notFound();
  return <GuideDetail lang={lang} category={category} slug={slug} floor={n} />;
}

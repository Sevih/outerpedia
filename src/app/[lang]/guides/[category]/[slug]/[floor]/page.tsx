/**
 * UN ÉTAGE d'un guide de tour — la sous-route qui rend UN étage côté serveur en
 * restant STATIQUE (un `?floor=` déopterait toute la route guide en dynamique).
 * Seuls les guides `skyward-tower` peuplent cette route ; les autres guides
 * n'ont simplement pas de segment `[floor]`. Le cadre (en-tête, fil d'Ariane…)
 * est mutualisé avec la route de base (`GuideDetail`) ; ici on ne fait que
 * résoudre l'étage et le canonicaliser vers son guide de tour.
 *
 * Pas de `generateStaticParams` : les ~3297 étages (× 5 langues) dominaient le
 * build. On les rend À LA DEMANDE puis on les cache 24 h (`revalidate`), comme
 * les pages d'équipement. `dynamicParams` restant à `true`, un étage jamais
 * visité se génère au premier hit au lieu de peser sur le build.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeLang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { getGuide } from '@/lib/data/guides';
import { getTower } from '@/lib/data/towers';
import { getMonster } from '@/lib/data/monsters';
import { GuideDetail } from '../guide-detail';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string; floor: string }>;
}): Promise<Metadata> {
  const { lang: raw, category, slug, floor } = await params;
  const lang = normalizeLang(raw);
  const guide = getGuide(category, slug);
  const n = Number(floor);
  if (!guide || !Number.isInteger(n)) return {};
  const t = await getT(lang);
  // Very hard : le segment est un id de boss (nav par combat) → on titre au NOM
  // du boss ; standard : c'est un n° d'étage.
  const tower = guide.tower ? getTower(guide.tower) : undefined;
  const boss = tower?.mode === 'tower_very_hard' ? getMonster(floor) : undefined;
  const label = boss ? lRec(boss.name, lang) || boss.name.en : t('tower.floor', { n });

  return createPageMetadata({
    lang,
    path: `/guides/${category}/${slug}/${floor}`,
    // Un étage n'est PAS une entité de recherche autonome : c'est une vue du
    // guide de tour — même cadre, même H1, et des étages entiers partagent la
    // même équipe de clear donc le même contenu (audit du 2026-07-22 : 410 URLs
    // en duplicate, TOUTES des étages de tour). Les ~3300 étages × 5 langues
    // restent navigables et rendus, mais se canonicalisent vers leur tour :
    // une seule entité par tour dans l'index au lieu de ~16 000.
    canonicalPath: `/guides/${category}/${slug}`,
    title: `${lRec(guide.title, lang)} — ${label}`,
    description: `${label} — ${lRec(guide.description, lang)}`,
    ...(guide.ogImage ? { ogImage: guide.ogImage } : {}),
  });
}

export default async function GuideFloorPage({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string; floor: string }>;
}) {
  const { lang: raw, category, slug, floor } = await params;
  const lang = normalizeLang(raw);
  const n = Number(floor);
  // Étage non numérique = URL fabriquée → 404 (le composant valide l'existence).
  if (!Number.isInteger(n) || n < 1) notFound();
  return <GuideDetail lang={lang} category={category} slug={slug} floor={n} />;
}

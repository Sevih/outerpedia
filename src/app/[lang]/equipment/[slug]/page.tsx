import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLang, type Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata, buildUrl } from '@/lib/seo';
import { img } from '@/lib/images';
import JsonLd from '@/components/seo/JsonLd';
import { localePath } from '@/lib/navigation';
import {
  BackLink,
  EquipmentDetail,
  type DetailLabels,
} from '@/components/equipment/EquipmentDetail';
import { getEquipmentDetail } from '@/lib/data/equipment-detail';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);
  const model = getEquipmentDetail(slug, lang);
  if (!model) return {};
  return createPageMetadata({
    lang,
    path: `/equipment/${slug}`,
    title: `${model.name} – Outerplane`,
    description: t('page.equipments.description'),
    // Icône de l'item en PNG (aperçus Discord/OG) — propriété et taille V2.
    ogImage: model.eeCharacterId ? img.eePng(model.eeCharacterId) : img.equipmentPng(model.icon),
    ogImageSize: { width: 150, height: 150 },
  });
}

/** Slugs de boutique extraits → libellés localisés. */
function shopLabel(slug: string, t: Awaited<ReturnType<typeof getT>>): string {
  if (slug === 'adventure_license') return t('equip.source.adventure_license');
  if (slug === 'event_shop') return t('equip.source.event_shop');
  return slug;
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);
  const model = getEquipmentDetail(slug, lang);
  if (!model) notFound();

  // Libellés de boutique traduits (le modèle porte les slugs bruts).
  if (model.source) {
    const parts = [
      ...(model.source.shops ?? []).map((s) => shopLabel(s, t)),
      ...(model.source.label ? [model.source.label] : []),
    ];
    model.source.label = parts.length ? parts.join(' · ') : undefined;
  }

  const labels: DetailLabels = {
    back: t('equip.detail.back'),
    configure: t('equip.detail.configure'),
    enhancement: t('equip.detail.enhancement'),
    breakthrough: t('equip.detail.breakthrough'),
    reforge: t('equip.detail.reforge'),
    available: t('equip.detail.available'),
    ascend: t('equip.detail.ascend'),
    ascended: t('equip.detail.ascended'),
    needs10: t('equip.detail.needs10'),
    mainStat: t('equip.detail.mainstat'),
    mainStats: t('equip.detail.mainstats'),
    substats: t('equip.detail.substats'),
    effect: t('equip.detail.effect'),
    setEffects: t('equip.detail.set_effects'),
    source: t('equip.detail.source'),
    recommendedBy: t('equip.detail.recommended_by'),
    ascension: t('equip.detail.ascension'),
    bonus15: t('equip.detail.bonus15'),
    priority: t('equip.detail.priority'),
    unlock: t('equip.ee.unlock'),
    upgrade: t('equip.ee.upgrade'),
    owner: t('equip.detail.owner'),
    singularitySuffix: t('equip.detail.singularity_suffix'),
    andMore: t('equip.detail.and_more'),
    activationCost: t('equip.detail.activation_cost'),
    stepRates: t('equip.detail.step_rates'),
    substatsRange: t('equip.detail.minmax'),
    step: t('equip.detail.step'),
    grade: t('equip.detail.grade'),
    pieces: {
      helmet: t('equip.detail.piece.helmet'),
      armor: t('equip.detail.piece.armor'),
      gloves: t('equip.detail.piece.gloves'),
      shoes: t('equip.detail.piece.shoes'),
    },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: model.name,
    url: buildUrl(lang, `/equipment/${slug}`),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <JsonLd data={jsonLd} />
      <BackLink href={localePath(lang, '/equipment')} label={labels.back} />
      <EquipmentDetail model={model} labels={labels} />
    </div>
  );
}

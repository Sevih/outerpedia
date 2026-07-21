import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { normalizeLang, type Lang } from '@/lib/i18n/config';
import { getT, type TranslationKey } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { img } from '@/lib/images';
import { getToolMeta } from '@/lib/data/tools';
import { ToolShell } from '@/components/tools/ToolShell';
import { TOOL_COMPONENTS, PORTED_TOOL_SLUGS } from '../tools/registry';

export const revalidate = 86400;

/**
 * Routeur À PLAT des outils : `/(slug)` sert le composant `_contents/<slug>`
 * (parité URL avec la prod V2 — pas de préfixe `/tools`). Seuls les slugs
 * PORTÉS (registre) rendent ; les autres, comme tout slug inconnu, renvoient un
 * 404. Enveloppe l'outil d'un titre i18n + fil d'Ariane + retour à la landing.
 */
export function generateStaticParams() {
  return PORTED_TOOL_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = normalizeLang(raw);
  const tool = getToolMeta(slug);
  if (!tool || !TOOL_COMPONENTS[slug] || tool.status === 'coming-soon') return {};
  const t = await getT(lang);
  const title = t(`tools.${slug}` as TranslationKey);
  return createPageMetadata({
    lang,
    path: `/${slug}`,
    title: t('page.tool.meta_title').replace('{title}', title),
    description: t(`tools.${slug}.desc` as TranslationKey),
    // Carte de partage = l'icône de l'outil (celle de la landing), en PNG
    // (Discord/OG digèrent mal le WebP — collecte dans le manifeste d'assets).
    ogImage: img.toolIconPng(tool.icon),
  });
}

export default async function ToolPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = normalizeLang(raw);
  const loader = TOOL_COMPONENTS[slug];
  const tool = getToolMeta(slug);
  if (!loader || !tool || tool.status === 'coming-soon') notFound();

  const t = await getT(lang);
  const title = t(`tools.${slug}` as TranslationKey);
  const description = t(`tools.${slug}.desc` as TranslationKey);

  let ToolContent: ComponentType<{ lang: Lang }>;
  try {
    ToolContent = (await loader()).default;
  } catch {
    notFound();
  }

  return (
    <ToolShell lang={lang} slug={slug} title={title} description={description} t={t}>
      <ToolContent lang={lang} />
    </ToolShell>
  );
}

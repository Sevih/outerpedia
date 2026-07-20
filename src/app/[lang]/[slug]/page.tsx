import type { Metadata } from 'next';
import type { Route } from 'next';
import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { normalizeLang, type Lang } from '@/lib/i18n/config';
import { getT, type TranslationKey } from '@/i18n';
import { createPageMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';
import { buildUrl } from '@/lib/site';
import { img } from '@/lib/images';
import { getToolMeta } from '@/lib/data/tools';
import JsonLd from '@/components/seo/JsonLd';
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

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: t('nav.home'), url: buildUrl(lang, '/') },
    { name: t('page.tools.title'), url: buildUrl(lang, '/tools') },
    { name: title, url: buildUrl(lang, `/${slug}`) },
  ]);

  return (
    <div className="px-4 py-6 md:px-6">
      <JsonLd data={breadcrumb} id="ld-breadcrumb" />
      <div className="mx-auto max-w-6xl">
        <Link
          href={'/tools' as Route}
          className="text-content-muted hover:text-content-strong inline-flex items-center gap-1 text-sm transition-colors"
        >
          &larr; {t('page.tools.title')}
        </Link>
        {/* `mx-auto` obligatoire : les titres sont en `width: fit-content` (liseré
            de base) — `text-center` seul ne centre pas le bloc. */}
        <h1 className="text-content-strong mx-auto mt-3 text-center text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-content-muted mx-auto mt-2 max-w-2xl text-center text-sm">
            {description}
          </p>
        )}
      </div>
      <div className="mt-6">
        <ToolContent lang={lang} />
      </div>
    </div>
  );
}

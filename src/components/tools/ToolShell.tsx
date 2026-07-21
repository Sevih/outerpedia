/**
 * ENVELOPPE commune des pages d'outil : fil d'Ariane JSON-LD, retour à la
 * landing, titre et description i18n. Partagée par le routeur À PLAT
 * (`[lang]/[slug]`) et par les outils qui ont leur PROPRE route parce qu'ils
 * ont des sous-pages (`/event` et ses `/event/<slug>`) — sans elle, ces
 * derniers dériveraient visuellement du reste des outils.
 */
import type { ReactNode } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import type { Lang } from '@/lib/i18n/config';
import type { TFunction } from '@/i18n';
import { buildBreadcrumbJsonLd } from '@/lib/seo';
import { buildUrl } from '@/lib/site';
import JsonLd from '@/components/seo/JsonLd';

export function ToolShell({
  lang,
  slug,
  title,
  description,
  t,
  children,
}: {
  lang: Lang;
  slug: string;
  title: string;
  description?: string;
  t: TFunction;
  children: ReactNode;
}) {
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
      <div className="mt-6">{children}</div>
    </div>
  );
}

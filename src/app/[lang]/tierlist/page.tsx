import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT, type TranslationKey } from '@/i18n';
import { createPageMetadata, getMonthYear } from '@/lib/seo';
import { getVisibleTools, type ToolMeta } from '@/lib/data/tools';
import { getCharacterListItems } from '@/lib/data/characters';
import { img } from '@/lib/images';

export const revalidate = 86400;

const FEATURED = ['tierlistpve', 'tierlistpvp'] as const;
const OTHER = ['ee-priority-base', 'ee-priority-plus10', 'most-used-units'] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  const monthYear = getMonthYear(lang);
  return createPageMetadata({
    lang,
    path: '/tierlist',
    title: t('page.tierlist.meta_title').replace('{monthYear}', monthYear),
    description: t('page.tierlist.description').replace('{monthYear}', monthYear),
  });
}

/**
 * Hub des tier lists : deux cartes phares (PvE / PvP) et un rail vers les autres
 * classements. Les sous-outils `/tools/<slug>` ne sont pas encore portés (404
 * assumée — layout d'abord). L'aperçu « top S-tier » de la V2 est différé : la
 * donnée de rang par perso n'existe pas encore en V3 (elle vit dans l'outil
 * tierlist, non porté). Page statique, revalidation 24 h.
 */
export default async function TierlistPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);

  const byId = new Map(getVisibleTools().map((tool) => [tool.slug, tool]));
  const featured = FEATURED.map((slug) => byId.get(slug)).filter((x): x is ToolMeta => Boolean(x));
  const others = OTHER.map((slug) => byId.get(slug)).filter((x): x is ToolMeta => Boolean(x));
  const rankingsCount = featured.length + others.length;
  const unitCount = getCharacterListItems().length;

  const toolTitle = (slug: string) => t(`tools.${slug}` as TranslationKey);
  const toolDesc = (slug: string) => t(`tools.${slug}.desc` as TranslationKey);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-content-strong text-3xl font-bold">{t('page.tierlist.title')}</h1>
        <p className="text-content-muted mx-auto mt-2 max-w-2xl text-sm">
          {t('page.tierlist.description').replace('{monthYear}', getMonthYear(lang))}
        </p>
        <div className="text-content-subtle mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.14em] uppercase">
          <span>
            {rankingsCount} {t('tierlist.versus.tools_count')}
          </span>
          <span aria-hidden>·</span>
          <span>{t('tierlist.versus.units').replace('{count}', String(unitCount))}</span>
        </div>
      </div>

      {/* Versus : PvE vs PvP */}
      <div className="relative mt-8 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5">
        {featured.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}` as Route}
            className="card-interactive flex flex-col items-center gap-3 p-6 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={img.toolIcon(tool.icon)} alt="" className="size-14 object-contain" />
            <h2 className="text-content-strong text-lg font-bold">{toolTitle(tool.slug)}</h2>
            <p className="text-content-subtle max-w-sm text-sm">{toolDesc(tool.slug)}</p>
            <span className="text-accent mt-1 text-sm font-semibold">
              {t('tierlist.versus.view')} →
            </span>
          </Link>
        ))}

        {featured.length === 2 && (
          <span
            className="border-line bg-surface-raised text-content-muted pointer-events-none absolute top-1/2 left-1/2 z-10 hidden size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-bold md:flex"
            aria-hidden
          >
            VS
          </span>
        )}
      </div>

      {/* Rail : autres classements */}
      {others.length > 0 && (
        <div className="mt-10">
          <h2 className="text-content-strong mb-3 text-base font-semibold">
            {t('page.tierlist.other_rankings')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {others.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}` as Route}
                className="card-interactive flex items-start gap-3 p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                <img
                  src={img.toolIcon(tool.icon)}
                  alt=""
                  className="size-10 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="text-content-strong text-sm font-semibold">
                    {toolTitle(tool.slug)}
                  </p>
                  <p className="text-content-subtle mt-0.5 line-clamp-2 text-xs">
                    {toolDesc(tool.slug)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

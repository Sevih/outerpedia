import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT, type TranslationKey } from '@/i18n';
import { createPageMetadata, getMonthYear } from '@/lib/seo';
import { getVisibleTools, type ToolMeta } from '@/lib/data/tools';
import { getCharacterListItems } from '@/lib/data/characters';
import { FlagshipCard } from '@/components/tierlist/FlagshipCard';
import { VsBadge } from '@/components/tierlist/VsBadge';
import { OtherRankingsRail, type RailToolVM } from '@/components/tierlist/OtherRankingsRail';
import type { FlagshipKey } from '@/components/tierlist/tierlistTheme';

export const revalidate = 86400;

const FEATURED: { slug: string; flag: FlagshipKey; side: 'left' | 'right' }[] = [
  { slug: 'tierlistpve', flag: 'pve', side: 'left' },
  { slug: 'tierlistpvp', flag: 'pvp', side: 'right' },
];
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
 * Hub des tier lists : deux cartes phares PvE/PvP (badge VS) et un rail « autres
 * classements ». Les sous-outils `/tools/<slug>` ne sont pas encore portés (404
 * assumée — layout d'abord). L'aperçu top-tier est omis (pas de donnée de rang
 * par perso en V3). Page statique, revalidation 24 h.
 */
export default async function TierlistPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);

  const byId = new Map(getVisibleTools().map((tool) => [tool.slug, tool]));
  const toolTitle = (slug: string) => t(`tools.${slug}` as TranslationKey);
  const toolDesc = (slug: string) => t(`tools.${slug}.desc` as TranslationKey);

  const featured = FEATURED.filter((f) => byId.has(f.slug));
  const others: RailToolVM[] = OTHER.map((slug) => byId.get(slug))
    .filter((x): x is ToolMeta => Boolean(x))
    .map((tool) => ({
      slug: tool.slug,
      icon: tool.icon,
      title: toolTitle(tool.slug),
      desc: toolDesc(tool.slug),
      href: `/tools/${tool.slug}`,
    }));

  const rankingsCount = featured.length + others.length;
  const unitCount = getCharacterListItems().length;
  const viewLabel = t('tierlist.versus.view');
  const previewLabel = t('tierlist.versus.preview');

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
        {featured.map((f) => (
          <FlagshipCard
            key={f.slug}
            flagship={f.flag}
            title={toolTitle(f.slug)}
            description={toolDesc(f.slug)}
            href={`/tools/${f.slug}`}
            side={f.side}
            viewLabel={`${viewLabel} ${f.flag.toUpperCase()}`}
            previewLabel={previewLabel}
          />
        ))}
        {featured.length === 2 && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <VsBadge />
          </div>
        )}
      </div>

      {/* Rail : autres classements */}
      {others.length > 0 && (
        <div className="mt-10">
          <OtherRankingsRail
            tools={others}
            heading={t('page.tierlist.other_rankings')}
            countLabel={`${others.length} ${t('tierlist.versus.tools_count')}`}
          />
        </div>
      )}
    </div>
  );
}

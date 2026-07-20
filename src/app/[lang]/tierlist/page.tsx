import type { Metadata } from 'next';
import { normalizeLang, type Lang } from '@/lib/i18n/config';
import { getT, type TranslationKey } from '@/i18n';
import { createPageMetadata, getMonthYear } from '@/lib/seo';
import { getVisibleTools, type ToolMeta } from '@/lib/data/tools';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import type { CharacterCurated } from '@contracts';
import { FlagshipCard, type FlagshipTopHero } from '@/components/tierlist/FlagshipCard';
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
 * Aperçu top-tier d'une carte phare : les S-tier du mode, mélangés avec une
 * graine STABLE SUR LA JOURNÉE (l'ordre ne change pas à l'intérieur de la
 * fenêtre ISR de 24 h), plafonnés à 12 (2 rangées de portraits).
 */
function topHeroesFor(
  select: (cu: CharacterCurated) => string | undefined,
  lang: Lang,
  seedKey: string,
  cap = 12,
): FlagshipTopHero[] {
  const curated = loadCuratedCharacters();
  const candidates = getCharacterListItems().filter((c) => select(curated[c.id] ?? {}) === 'S');
  return seededShuffle(candidates, dailySeed(seedKey))
    .slice(0, cap)
    .map((c) => ({ id: c.id, name: characterDisplayName(c, lang) }));
}

/** Graine déterministe qui change une fois par jour (hash djb2 de `jour:clé`). */
function dailySeed(extra: string): number {
  const day = Math.floor(Date.now() / 86_400_000);
  const key = `${day}:${extra}`;
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h) ^ key.charCodeAt(i);
  return h >>> 0;
}

/** Mélange de Fisher–Yates piloté par un PRNG mulberry32 (déterministe). */
function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr];
  let s = seed | 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Hub des tier lists : deux cartes phares PvE/PvP (badge VS, cluster de
 * portraits top S-tier mélangé chaque jour) et un rail « autres classements ».
 * Les liens suivent le routeur À PLAT (`/<slug>`, parité URL prod V2) ; les
 * sous-outils non portés y répondent 404 (assumé). Page statique, revalidation
 * 24 h.
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
      href: `/${tool.slug}`,
    }));

  const topHeroes: Record<FlagshipKey, FlagshipTopHero[]> = {
    pve: topHeroesFor((cu) => cu.rank, lang, 'pve'),
    pvp: topHeroesFor((cu) => cu.rankPvp, lang, 'pvp'),
  };

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
            href={`/${f.slug}`}
            side={f.side}
            viewLabel={`${viewLabel} ${f.flag.toUpperCase()}`}
            previewLabel={previewLabel}
            topHeroes={topHeroes[f.flag]}
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

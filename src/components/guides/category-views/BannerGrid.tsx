import Link from 'next/link';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { formatGuideDate, guideUpdatedDate } from '@/lib/data/guides';
import { SeasonBadge } from '@/components/guides/SeasonBadge';
import { EmptyCategory } from './EmptyCategory';
import type { CategoryViewProps } from './types';

/**
 * Vue BANNIÈRE : l'icône du guide est une bannière large (`T_Banner_*`), rendue
 * en fond plein avec titre et description en surimpression.
 *
 * UNE vue pour guild-raid / world-boss / joint-challenge — en V2 c'étaient
 * TROIS fichiers strictement identiques (GuildRaidList / WorldBossList /
 * JointChallengeList, 41 lignes copiées-collées). Rien ici ne dépend de la
 * catégorie : seul le meta du guide est lu, et le badge de saison se relie au
 * calendrier par le monstre combattu (`bossId`).
 */
export default async function BannerGrid({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <Link
          key={guide.slug}
          href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
          className="ring-line-subtle hover:ring-accent/60 group relative block aspect-300/128 overflow-hidden rounded-lg ring-1 transition-shadow"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={img.guideIcon(guide.icon)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Voile : le texte se lit quelle que soit la bannière. */}
          <div className="from-surface-base/95 via-surface-base/40 to-surface-base/10 absolute inset-0 bg-linear-to-t" />
          <span className="text-content absolute top-1.5 left-2.5 text-xs drop-shadow-lg">
            {t('page.guide.updated', { date: formatGuideDate(guideUpdatedDate(guide), lang) })}
          </span>
          <SeasonBadge bossId={guide.bossId} lang={lang} />
          <h2 className="text-content-strong absolute inset-0 flex items-center p-3 text-sm font-semibold drop-shadow-lg">
            {lRec(guide.title, lang)}
          </h2>
          <p className="text-content-muted absolute inset-x-0 bottom-0 line-clamp-2 px-3 pb-1.5 text-[10px] drop-shadow-lg">
            {lRec(guide.description, lang)}
          </p>
        </Link>
      ))}
    </div>
  );
}

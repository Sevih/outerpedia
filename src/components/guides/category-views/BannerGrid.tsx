import Link from 'next/link';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { formatGuideDate, guideUpdatedDate, type Guide } from '@/lib/data/guides';
import { compareBySeason, seasonStandingAt, seasonsForBoss } from '@/lib/data/content-schedule';
import { serverNow } from '@/lib/time';
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
 * catégorie : seul le meta du guide est lu, et le calendrier fait le reste.
 */

export default async function BannerGrid({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;

  const now = serverNow();
  const standing = (g: Guide) =>
    g.bossId ? seasonStandingAt(seasonsForBoss(g.bossId), now) : undefined;

  // L'ordre suit le JEU (cf. `compareBySeason`), la date de mise à jour ne sert
  // plus que de départage — pour les guides qu'aucun calendrier ne connaît.
  const sorted = guides
    .map((g) => ({ guide: g, st: standing(g) }))
    .sort(
      (a, b) =>
        compareBySeason(a.st, b.st) ||
        guideUpdatedDate(b.guide).localeCompare(guideUpdatedDate(a.guide)),
    );

  return (
    // CENTRÉ — une grille laisse la dernière rangée incomplète collée à gauche
    // (cinq guides sur trois colonnes : 3 + 2 orphelines). Avec cinq boss dans un
    // mode qui en fait tourner un à la fois, ça arrive tout le temps.
    <div className="flex flex-wrap justify-center gap-4">
      {sorted.map(({ guide, st }) => {
        const live = st?.state === 'live';
        return (
          <Link
            key={guide.slug}
            href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
            // Le boss EN COURS se voit de loin : anneau d'accent et halo. Le
            // calendrier sait lequel c'est — autant le dire à l'œil, pas
            // seulement dans une pastille de coin.
            className={`group relative block aspect-300/128 w-full max-w-85 shrink-0 overflow-hidden rounded-lg transition-shadow sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] ${
              live
                ? 'ring-accent shadow-accent/25 shadow-lg ring-2'
                : 'ring-line-subtle hover:ring-accent/60 ring-1'
            }`}
          >
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
        );
      })}
    </div>
  );
}

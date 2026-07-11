import { getT } from '@/i18n';
import { formatGuideDate } from '@/lib/data/guides';
import { seasonStandingAt, seasonsForBoss } from '@/lib/data/content-schedule';
import { serverNow } from '@/lib/time';
import type { Lang } from '@/lib/i18n/config';

/**
 * Statut de saison d'un boss (« en cours jusqu'au… », « dernière saison… »).
 *
 * Rendu CÔTÉ SERVEUR, donc présent dans le HTML (crawlable, pas de flash).
 * C'est possible parce que la page est purgée au moment où le jeu bascule
 * (cron 00:05 UTC → `/api/revalidate`), et non quand un minuteur ISR aveugle
 * expire. Sans cette purge, un « en cours » figé au build mentirait des heures.
 */
export async function SeasonBadge({ bossId, lang }: { bossId?: string; lang: Lang }) {
  if (!bossId) return null;
  const standing = seasonStandingAt(seasonsForBoss(bossId), serverNow());
  if (!standing) return null;

  const t = await getT(lang);
  const { state, season } = standing;
  // En cours → on annonce la fin du COMBAT ; sinon → le début de la saison.
  const date = formatGuideDate(
    (state === 'live' ? season.battleEnd : season.start).slice(0, 10),
    lang,
  );
  const label = t(
    state === 'live'
      ? 'guides.season.live'
      : state === 'upcoming'
        ? 'guides.season.next'
        : 'guides.season.last',
    { date },
  );

  return (
    <span
      className={`absolute top-1.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold drop-shadow-lg ${
        state === 'live' ? 'bg-accent text-accent-fg' : 'bg-surface-overlay/80 text-content-muted'
      }`}
    >
      {label}
    </span>
  );
}

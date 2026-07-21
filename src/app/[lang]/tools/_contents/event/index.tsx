/**
 * Événements communautaires — wrapper SERVEUR de la liste (`/event`).
 *
 * Résout la donnée curée en cartes déjà localisées et passe les libellés au
 * client (aucune localisation côté navigateur, règle des outils V3). Le contenu
 * complet d'un événement vit sur sa page `/event/<slug>` — la liste n'en porte
 * que le résumé.
 *
 * En DEV, les brouillons sont listés (badge « brouillon ») pour se relire avant
 * publication ; en prod ils n'existent pas, jusque dans le HTML.
 */
import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { localePath } from '@/lib/navigation';
import { IS_DEV } from '@/lib/admin/guard';
import { EVENT_STATUSES, EVENT_TYPES, formatEventDate, getEvents } from '@/lib/data/events';
import { EventsBrowser, type EventCardVM, type EventsLabels } from './EventsBrowser';

export default async function EventTool({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const events = await getEvents(lang, { includeDrafts: IS_DEV });

  const cards: EventCardVM[] = events.map((e) => ({
    slug: e.slug,
    href: localePath(lang, `/event/${e.slug}`),
    type: e.type,
    status: e.status,
    // Teaser : la donnée n'a PAS envoyé le titre — on affiche la seule chose
    // annoncée, « À venir — Concours ».
    title: e.teased
      ? `${t('tools.event.status.upcoming')} — ${t(`tools.event.type.${e.type}`)}`
      : e.title,
    summary: e.summary,
    ...(e.teased && { teased: true }),
    dates: `${formatEventDate(e.start, lang)} — ${formatEventDate(e.end, lang)}`,
    ...(e.organizer && { organizer: e.organizer }),
    ...(e.cover && { cover: img.asset(e.cover) }),
    ...(e.phase && { phase: e.phase }),
    ...(e.draft && { draft: true }),
  }));

  const labels: EventsLabels = {
    filterType: t('tools.event.filter.type'),
    filterStatus: t('tools.event.filter.status'),
    all: t('common.all'),
    empty: t('tools.event.empty'),
    draft: t('tools.event.draft'),
    types: Object.fromEntries(
      EVENT_TYPES.map((v) => [v, t(`tools.event.type.${v}`)]),
    ) as EventsLabels['types'],
    statuses: Object.fromEntries(
      EVENT_STATUSES.map((v) => [v, t(`tools.event.status.${v}`)]),
    ) as EventsLabels['statuses'],
  };

  return <EventsBrowser events={cards} labels={labels} />;
}

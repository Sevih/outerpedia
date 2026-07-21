/**
 * BANDEAU d'annonce des événements, sous le header de toutes les pages
 * (portage V2) : les événements EN COURS avec leur échéance ou leur jalon
 * courant, puis ceux À VENIR. Aucun événement à annoncer = rien du tout.
 *
 * Composant SERVEUR : la donnée est résolue au rendu, rien n'arrive après
 * l'hydratation — un bandeau qui apparaîtrait côté client décalerait toute la
 * page vers le bas (CLS).
 *
 * Le GIF « event » de la V2 n'est PAS porté : 3,5 Mo d'animation chargés sur
 * CHAQUE page du wiki, pour un bandeau que le style suffit à faire remarquer.
 */
import type { Route } from 'next';
import Link from 'next/link';
import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { formatEventDeadline, getBannerEvents } from '@/lib/data/events';
import { EVENT_STATUS_BADGE } from '@/components/events/presentation';

export async function EventBanner({ lang }: { lang: Lang }) {
  const events = await getBannerEvents(lang);
  if (events.length === 0) return null;
  const t = await getT(lang);

  return (
    <div className="border-line-subtle bg-surface-raised/60 border-b">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-1.5">
        {events.map((e) => (
          <Link
            key={e.slug}
            href={`/event/${e.slug}` as Route}
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 transition-opacity hover:opacity-80"
          >
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${EVENT_STATUS_BADGE[e.status]}`}
            >
              {t(`tools.event.status.${e.status}`)}
            </span>
            <span className="text-content-strong text-sm font-medium">{e.title}</span>
            <span className="text-content-subtle text-xs">
              ·{' '}
              {e.status === 'upcoming'
                ? t('tools.event.starts', { date: formatEventDeadline(e.start, lang) })
                : // Un événement à jalons annonce le PROCHAIN (« clôture des
                  // inscriptions »), plus parlant que sa date de fin lointaine.
                  (e.phase ?? t('tools.event.ends', { date: formatEventDeadline(e.end, lang) }))}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

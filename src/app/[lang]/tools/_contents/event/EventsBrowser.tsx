'use client';

/**
 * Liste filtrable des événements communautaires. Le client ne reçoit que des
 * RÉSUMÉS déjà localisés (titre, résumé, statut) — le contenu d'un événement
 * n'est chargé que sur sa page, et les brouillons sont écartés côté serveur.
 *
 * En V2 la liste dépliait l'événement en place (`/event#slug`) : rien n'était
 * partageable ni indexable. Ici chaque carte est un lien vers `/event/<slug>`.
 */
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { EVENT_STATUS_BADGE, EVENT_TYPE_BADGE } from '@/components/events/presentation';
import { EVENT_STATUSES, EVENT_TYPES, type EventStatus, type EventType } from '@/lib/data/events';

export interface EventCardVM {
  slug: string;
  href: string;
  type: EventType;
  status: EventStatus;
  title: string;
  summary: string;
  organizer?: string;
  cover?: string;
  dates: string;
  phase?: string;
  draft?: boolean;
}

export interface EventsLabels {
  filterType: string;
  filterStatus: string;
  all: string;
  empty: string;
  types: Record<EventType, string>;
  statuses: Record<EventStatus, string>;
  draft: string;
}

export function EventsBrowser({ events, labels }: { events: EventCardVM[]; labels: EventsLabels }) {
  const [type, setType] = useState<EventType | null>(null);
  const [status, setStatus] = useState<EventStatus | null>(null);

  const visible = events.filter(
    (e) => (!type || e.type === type) && (!status || e.status === status),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-content-subtle text-xs uppercase">{labels.filterType}</span>
          <FilterPill active={type === null} onClick={() => setType(null)} className="h-8 px-3">
            {labels.all}
          </FilterPill>
          {EVENT_TYPES.map((v) => (
            <FilterPill
              key={v}
              active={type === v}
              onClick={() => setType(type === v ? null : v)}
              className="h-8 px-3"
            >
              {labels.types[v]}
            </FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-content-subtle text-xs uppercase">{labels.filterStatus}</span>
          <FilterPill active={status === null} onClick={() => setStatus(null)} className="h-8 px-3">
            {labels.all}
          </FilterPill>
          {EVENT_STATUSES.map((v) => (
            <FilterPill
              key={v}
              active={status === v}
              onClick={() => setStatus(status === v ? null : v)}
              className="h-8 px-3"
            >
              {labels.statuses[v]}
            </FilterPill>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-content-subtle py-12 text-center">{labels.empty}</p>
      ) : (
        <div className="space-y-3">
          {visible.map((e, i) => (
            <Link
              key={e.slug}
              href={e.href as Route}
              className="border-line-subtle bg-surface-raised/50 hover:border-accent/50 flex gap-4 rounded-lg border p-3 transition"
            >
              {e.cover && (
                <div className="relative hidden h-20 w-36 shrink-0 overflow-hidden rounded-md sm:block">
                  {/* La première vignette est au-dessus de la ligne de flottaison
                      (c'est le LCP de la page) — les suivantes restent paresseuses. */}
                  <Image
                    src={e.cover}
                    alt=""
                    fill
                    sizes="144px"
                    priority={i === 0}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${EVENT_STATUS_BADGE[e.status]}`}
                  >
                    {labels.statuses[e.status]}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${EVENT_TYPE_BADGE[e.type]}`}
                  >
                    {labels.types[e.type]}
                  </span>
                  {e.draft && (
                    <span className="bg-warn/15 text-warn rounded px-2 py-0.5 text-xs font-medium">
                      {labels.draft}
                    </span>
                  )}
                  <span className="text-content-subtle ml-auto text-xs">{e.dates}</span>
                </div>
                <h2 className="text-content-strong truncate font-semibold">{e.title}</h2>
                {e.phase && <p className="text-accent text-xs">{e.phase}</p>}
                {e.summary && (
                  <p className="text-content-muted line-clamp-2 text-sm">{e.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

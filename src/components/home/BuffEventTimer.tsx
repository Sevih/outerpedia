'use client';

import { useState } from 'react';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { useNow } from '@/hooks/useNow';
import type { BuffScheduleEntry } from '@/lib/home';

/**
 * Widget « Daily Buff » — le buff du jour dépend de la date UTC, résolue côté
 * CLIENT (la home est en cache ISR, un jour rendu au serveur serait périmé) via
 * l'horloge partagée. Rien tant que `now === null` (SSR) → accord d'hydratation.
 * Planning dérivé des posts (`buff-events.json`) ; libellés d'affichage résolus
 * par l'appelant (`buff.type.<type>`), `raw` en repli.
 */

// Icône par type de buff (sprite du pool éditorial). Les types sans icône
// (modes abandonnés, `other`) retombent sur la pastille colorée.
const BUFF_ICON: Record<string, string> = {
  'frog-gold': 'TI_Item_Event_Gold',
  'frog-food': 'TI_Item_Event_User_Exp',
  'ark-raid': 'TI_Item_Event_DayWeek_Open',
  'special-ecology': 'TI_Item_Event_Boss_Reward_000',
  'special-identification': 'TI_Item_Event_Boss_Reward_000',
  doppelganger: 'EBT_CHAR_PIECE_DROP',
  'kate-workshop': 'kate-workshop',
  'story-survey': 'story-survey',
};

// Pastille de couleur par type de buff (à défaut d'icône). `other` → token neutre.
const BUFF_DOT: Record<string, string> = {
  'frog-gold': 'bg-amber-400',
  'frog-food': 'bg-lime-400',
  'ark-raid': 'bg-red-400',
  'special-ecology': 'bg-emerald-400',
  'special-identification': 'bg-teal-400',
  doppelganger: 'bg-fuchsia-400',
  'kate-workshop': 'bg-orange-400',
  'story-survey': 'bg-sky-400',
  'evolution-stone': 'bg-violet-400',
  'bounty-hunter': 'bg-yellow-400',
  'bandit-chase': 'bg-rose-400',
  other: 'bg-content-subtle',
};

export interface BuffStrings {
  title: string;
  today: string;
  tomorrow: string;
  /** Gabarit avec `{time}`. */
  changesIn: string;
  none: string;
  /** Gabarit avec `{date}`. */
  nextOn: string;
  showAll: string;
  showLess: string;
}

/** `YYYY-MM-DD` d'une date, en UTC (les buffs suivent le calendrier UTC). */
function utcKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export function BuffEventTimer({
  schedule,
  lang,
  typeLabels,
  strings,
}: {
  schedule: BuffScheduleEntry[];
  lang: Lang;
  typeLabels: Record<string, string>;
  strings: BuffStrings;
}) {
  const [expanded, setExpanded] = useState(false);
  const now = useNow();

  if (schedule.length === 0 || now === null) return null;

  const todayKey = utcKey(new Date(now));
  const tomorrowKey = utcKey(new Date(now + 86400000));

  const upcoming = schedule.filter((e) => e.date >= todayKey);
  if (upcoming.length === 0) return null;

  const hasToday = upcoming[0].date === todayKey;
  const rows = expanded ? upcoming : upcoming.slice(0, 2);

  const nextReset = new Date(now);
  nextReset.setUTCHours(24, 0, 0, 0);
  const msToReset = nextReset.getTime() - now;

  const dateFmt = new Intl.DateTimeFormat(LANGUAGES[lang].htmlLang, {
    weekday: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const label = (type: string, raw: string) => typeLabels[type] ?? raw;
  const rowName = (date: string) => {
    if (date === todayKey) return strings.today;
    if (date === tomorrowKey) return strings.tomorrow;
    return dateFmt.format(new Date(`${date}T00:00:00Z`));
  };

  return (
    <div className="card-interactive flex h-full flex-col justify-center gap-1.5 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-content-muted text-xs font-semibold tracking-wide uppercase">
          {strings.title}
        </p>
        {hasToday && (
          <span className="text-content-muted font-mono text-xs tabular-nums">
            {strings.changesIn.replace('{time}', formatDuration(msToReset))}
          </span>
        )}
      </div>

      {!hasToday && (
        <p className="text-content-muted text-sm">
          {strings.none}
          {' — '}
          <span className="text-content">
            {strings.nextOn.replace('{date}', rowName(upcoming[0].date))}
          </span>
        </p>
      )}

      <ul
        className={
          expanded ? 'flex max-h-44 flex-col gap-1 overflow-y-auto pr-1' : 'flex flex-col gap-1'
        }
      >
        {rows.map((e) => {
          const isToday = e.date === todayKey;
          return (
            <li key={e.date} className={`flex items-center gap-2 ${isToday ? '' : 'opacity-80'}`}>
              <span className="text-content-subtle w-16 shrink-0 text-xs font-semibold whitespace-nowrap">
                {rowName(e.date)}
              </span>
              {BUFF_ICON[e.type] ? (
                <img
                  src={img.buff(BUFF_ICON[e.type])}
                  alt=""
                  aria-hidden
                  className="size-5 shrink-0 object-contain"
                  width={20}
                  height={20}
                />
              ) : (
                <span
                  className={`size-2.5 shrink-0 rounded-full ${BUFF_DOT[e.type] ?? BUFF_DOT.other}`}
                  aria-hidden
                />
              )}
              <span
                className={`truncate text-sm ${isToday ? 'text-content-strong font-semibold' : 'text-content-muted'}`}
              >
                {label(e.type, e.raw)}
              </span>
            </li>
          );
        })}
      </ul>

      {upcoming.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-accent self-start text-xs font-semibold hover:brightness-125"
        >
          {expanded ? strings.showLess : strings.showAll}
        </button>
      )}
    </div>
  );
}

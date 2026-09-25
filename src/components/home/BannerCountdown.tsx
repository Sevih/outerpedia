'use client';

import type { ReactNode } from 'react';
import { ELEMENT_TEXT } from '@/lib/images';
import { useNow } from '@/hooks/useNow';
import { formatDuration, type DurationUnits } from '@/lib/format-duration';

/**
 * Compte à rebours d'une bannière (client : dépend de l'heure du visiteur, la
 * page étant en cache ISR). Teinté de l'élément du perso. `BannerWrapper` masque
 * la carte dès que la bannière est terminée.
 */
export function BannerCountdown({
  endDate,
  element,
  endsInLabel,
  units,
}: {
  endDate: string;
  element: string;
  endsInLabel: string;
  units: DurationUnits;
}) {
  const now = useNow();
  if (now === null) return <span className="bg-surface-raised inline-block h-5 w-20 rounded" />;

  const timeLeft = new Date(endDate + 'T00:00:00Z').getTime() - now;
  if (timeLeft <= 0) return null;

  return (
    <span
      className={`bg-surface-raised inline-block rounded px-2 py-0.5 text-xs font-medium ${ELEMENT_TEXT[element] ?? 'text-content-muted'}`}
    >
      {endsInLabel} {formatDuration(timeLeft, units, { maxUnits: 2 })}
    </span>
  );
}

/** Masque ses enfants une fois la bannière terminée (heure locale du visiteur). */
export function BannerWrapper({ endDate, children }: { endDate: string; children: ReactNode }) {
  const now = useNow();
  const end = new Date(endDate + 'T00:00:00Z').getTime();
  if (now !== null && now >= end) return null;
  return <>{children}</>;
}

'use client';

import type { ReactNode } from 'react';
import { ELEMENT_TEXT } from '@/lib/images';
import { useNow } from '@/hooks/useNow';

/**
 * Compte à rebours d'une bannière (client : dépend de l'heure du visiteur, la
 * page étant en cache ISR). Teinté de l'élément du perso. `BannerWrapper` masque
 * la carte dès que la bannière est terminée.
 */
function formatTimeLeft(ms: number): string {
  if (ms <= 0) return '';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function BannerCountdown({
  endDate,
  element,
  endsInLabel,
}: {
  endDate: string;
  element: string;
  endsInLabel: string;
}) {
  const now = useNow();
  if (now === null) return <span className="bg-surface-raised inline-block h-5 w-20 rounded" />;

  const timeLeft = new Date(endDate + 'T00:00:00Z').getTime() - now;
  if (timeLeft <= 0) return null;

  return (
    <span
      className={`bg-surface-raised inline-block rounded px-2 py-0.5 text-xs font-medium ${ELEMENT_TEXT[element] ?? 'text-content-muted'}`}
    >
      {endsInLabel} {formatTimeLeft(timeLeft)}
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

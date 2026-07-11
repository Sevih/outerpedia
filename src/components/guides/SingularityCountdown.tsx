'use client';

import { useSyncExternalStore } from 'react';

/**
 * HORLOGE — temps restant avant la bascule quotidienne (00:00 UTC), vue comme un
 * store externe.
 *
 * Le temps qui passe est par nature hors-React : le lire pendant le rendu est
 * impur, le poser depuis un effet violerait `setState`-dans-un-effet. Un store
 * qui bat la seconde et notifie ses abonnés est la forme propre. Snapshot
 * serveur = `null` : rien ne s'affiche au SSR, donc pas de divergence
 * d'hydratation — et de toute façon un compte à rebours figé au build n'aurait
 * aucun sens.
 */
const clock = {
  ms: null as number | null,
  listeners: new Set<() => void>(),
  timer: undefined as ReturnType<typeof setInterval> | undefined,
  tick() {
    const next = new Date();
    next.setUTCHours(24, 0, 0, 0); // prochain minuit UTC
    clock.ms = next.getTime() - Date.now();
    for (const l of clock.listeners) l();
  },
  subscribe(listener: () => void) {
    clock.listeners.add(listener);
    if (!clock.timer) {
      clock.tick();
      clock.timer = setInterval(clock.tick, 1000);
    }
    return () => {
      clock.listeners.delete(listener);
      if (clock.listeners.size === 0) {
        clearInterval(clock.timer);
        clock.timer = undefined;
      }
    };
  },
  getSnapshot: () => clock.ms,
  getServerSnapshot: () => null,
};

/**
 * Format NUMÉRIQUE (`4:12:03`), volontairement sans unités : la V2 écrivait
 * « 4h 12m 3s » avec des suffixes anglais EN DUR, jamais traduits. Des chiffres
 * se lisent dans les cinq langues.
 */
function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${h}:${pad(m)}:${pad(s)}`;
}

/** « Prochain reset dans 4:12:03 ». `template` porte `{time}`, déjà localisé. */
export function SingularityCountdown({
  template,
  className,
}: {
  template: string;
  className?: string;
}) {
  const ms = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
  if (ms === null) return <span className={className} aria-hidden />;
  return <span className={className}>{template.replace('{time}', format(ms))}</span>;
}

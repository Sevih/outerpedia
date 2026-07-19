'use client';

import { useSyncExternalStore } from 'react';

/**
 * HORLOGE PARTAGÉE — l'instant présent vu comme un store externe (même forme que
 * `SingularityCountdown`). Le temps est hors-React : le lire au rendu est impur,
 * le poser depuis un effet violerait `setState`-dans-un-effet. Un store qui bat
 * la seconde et notifie ses abonnés est la forme propre. Snapshot serveur =
 * `null` → rien au SSR, donc pas de divergence d'hydratation ; l'appelant rend
 * un placeholder tant que `now === null`.
 *
 * Un SEUL intervalle pour tous les widgets abonnés (bannières, resets, buff).
 */
const clock = {
  now: null as number | null,
  listeners: new Set<() => void>(),
  timer: undefined as ReturnType<typeof setInterval> | undefined,
  tick() {
    clock.now = Date.now();
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
  getSnapshot: () => clock.now,
  getServerSnapshot: () => null as number | null,
};

/** L'instant présent (epoch ms) ou `null` au SSR / avant le premier tick. */
export function useNow(): number | null {
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
}

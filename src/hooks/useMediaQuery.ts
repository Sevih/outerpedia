'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Vrai si la media query matche (SSR : faux — résolu au premier rendu client). */
export function useMediaQuery(query: string): boolean {
  // `subscribe`/`getSnapshot` mémoïsés sur `query` : sans ça ils sont recréés à
  // chaque rendu, et useSyncExternalStore se désabonne/réabonne (matchMedia) à
  // chaque fois — coûteux quand le hook est monté en masse (grille de cartes).
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

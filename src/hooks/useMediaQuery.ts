'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Vrai si la media query matche. Au SSR (et à la pré-hydratation), il n'y a pas
 * de viewport : on renvoie `serverDefault` (faux par défaut). `useSyncExternalStore`
 * recale ensuite côté client sans warning d'hydratation si la valeur diffère.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
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
  const getServerSnapshot = useCallback(() => serverDefault, [serverDefault]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

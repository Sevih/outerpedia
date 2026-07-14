'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Une TRANCHE de l'URL comme store externe (useSyncExternalStore).
 *
 * La sélection d'onglet (`?tab=`) ou de version (`#version=`) vit dans l'URL —
 * lien partageable — et l'URL doit rester la SOURCE DE VÉRITÉ : un état React
 * parallèle qui « prime » sur elle rend Back/Forward muet dès le premier clic
 * (l'URL change, l'UI ne suit plus). Ici, pas d'état parallèle : on lit la
 * tranche, on écrit la tranche.
 *
 * `history.replaceState` ne déclenche NI `popstate` NI `hashchange` — c'est le
 * piège qui pousse vers un état parallèle. `writeUrl` le comble : mutation puis
 * événement synthétique, tous les abonnés (y compris un autre composant monté
 * sur la même tranche) se resynchronisent.
 *
 * Snapshot serveur : null — le HTML statique ne connaît pas l'URL du client,
 * la resynchronisation post-hydratation est le comportement voulu.
 */
const SYNC_EVENT = 'app:urlchange';

export function useUrlSlice(
  nativeEvent: 'popstate' | 'hashchange',
  read: () => string | null,
): string | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener(nativeEvent, onChange);
      window.addEventListener(SYNC_EVENT, onChange);
      return () => {
        window.removeEventListener(nativeEvent, onChange);
        window.removeEventListener(SYNC_EVENT, onChange);
      };
    },
    [nativeEvent],
  );
  return useSyncExternalStore(subscribe, read, () => null);
}

/** Écrit l'URL (sans rechargement) puis notifie les abonnés de useUrlSlice. */
export function writeUrl(mutate: () => void): void {
  mutate();
  window.dispatchEvent(new Event(SYNC_EVENT));
}

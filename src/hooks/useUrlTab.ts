'use client';

import { useState } from 'react';
import { useUrlSlice, writeUrl } from '@/hooks/useUrlSlice';

/**
 * Sélection d'onglet dont l'URL est la SOURCE DE VÉRITÉ (`?<urlParam>=<id>`).
 *
 * Le moteur de `ui/Tabs` (son seul consommateur depuis la bascule des guides
 * sur le hash) : lecture de la tranche d'URL (via useUrlSlice → Back/Forward
 * pilote l'UI), écriture par `history.replaceState` (pas de rechargement
 * serveur), validation de l'id lu contre la liste, et repli sur le premier
 * onglet. Sans `urlParam`, la sélection redevient un simple état local (ni URL,
 * ni partage).
 *
 * RÈGLE D'USAGE (décision 2026-07-16) : le `?param` sert les pages HORS guides ;
 * l'état interne d'un guide vit dans le HASH multi-params (`SegmentedTabs`).
 *
 * Générique sur `{ id: string }` : le hook ne connaît que l'id, le rendu (libellé,
 * visuel, contenu) reste à l'appelant.
 */
export function useUrlTab<T extends { id: string }>(tabs: T[], urlParam?: string) {
  const urlTab = useUrlSlice('popstate', () =>
    urlParam ? new URLSearchParams(window.location.search).get(urlParam) : null,
  );
  // Sans `urlParam`, pas de tranche d'URL : la sélection est un état local.
  const [localTab, setLocalTab] = useState<string | null>(null);
  const fromUrl = urlTab && tabs.some((t) => t.id === urlTab) ? urlTab : null;
  const active = (urlParam ? fromUrl : localTab) ?? tabs[0]?.id;
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  const select = (id: string) => {
    if (!urlParam) {
      setLocalTab(id);
      return;
    }
    writeUrl(() => {
      const url = new URL(window.location.href);
      url.searchParams.set(urlParam, id);
      window.history.replaceState(null, '', url);
    });
  };

  return { active, current, select };
}

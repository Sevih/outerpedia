'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useUrlSlice, writeUrl } from '@/hooks/useUrlSlice';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Onglets théminés (soulignement de l'onglet actif via la couleur d'accent).
 *
 * `urlParam` : mémorise l'onglet actif dans l'URL (`?<param>=<id>`) — l'URL est
 * la SOURCE DE VÉRITÉ (cf. useUrlSlice : Back/Forward pilote l'UI), écrite via
 * `history.replaceState` (pas de rechargement serveur). Lecture par
 * `window.location` et non `useSearchParams` : la page reste statiquement
 * rendable (pas de bailout CSR ni de Suspense imposé).
 */
export function Tabs({
  tabs,
  className,
  urlParam,
}: {
  tabs: Tab[];
  className?: string;
  urlParam?: string;
}) {
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

  return (
    <div className={className}>
      <div role="tablist" className="border-line-subtle flex gap-1 border-b">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => select(t.id)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                on
                  ? 'border-accent text-content-strong'
                  : 'text-content-muted hover:text-content-strong border-transparent',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-4">
        {current?.content}
      </div>
    </div>
  );
}

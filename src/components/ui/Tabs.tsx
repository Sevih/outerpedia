'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Onglets théminés (soulignement de l'onglet actif via la couleur d'accent).
 *
 * `urlParam` : mémorise l'onglet actif dans l'URL (`?<param>=<id>`) — restauré
 * au montage, écrit via `history.replaceState` (pas de rechargement serveur).
 * Lecture par `window.location` et non `useSearchParams` : la page reste
 * statiquement rendable (pas de bailout CSR ni de Suspense imposé).
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
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  useEffect(() => {
    if (!urlParam) return;
    const v = new URLSearchParams(window.location.search).get(urlParam);
    // Restauration au MONTAGE uniquement : le HTML statique ne connaît pas la
    // query — la resynchronisation post-hydratation est le comportement voulu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v && tabs.some((t) => t.id === v)) setActive(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (id: string) => {
    setActive(id);
    if (urlParam) {
      const url = new URL(window.location.href);
      url.searchParams.set(urlParam, id);
      window.history.replaceState(null, '', url);
    }
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

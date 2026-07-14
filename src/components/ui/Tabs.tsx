'use client';

import { useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

// La query string comme STORE EXTERNE (pattern AdminSidebar) : le HTML statique
// ne la connaît pas (snapshot serveur vide), le client se resynchronise à
// l'hydratation — sans setState dans un effet. `popstate` couvre en prime la
// navigation historique (avant : restauration au montage uniquement).
const subscribeSearch = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};
const readSearch = () => window.location.search;

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
  // Sélection UTILISATEUR (prioritaire) ; à défaut la query, puis le 1er onglet.
  const [selected, setSelected] = useState<string | null>(null);
  const search = useSyncExternalStore(subscribeSearch, readSearch, () => '');
  const urlTab = urlParam ? new URLSearchParams(search).get(urlParam) : null;
  const active = selected ?? (urlTab && tabs.some((t) => t.id === urlTab) ? urlTab : tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  const select = (id: string) => {
    setSelected(id);
    // replaceState ne déclenche pas `popstate` — sans importance : `selected`
    // prime désormais sur le snapshot de la query.
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

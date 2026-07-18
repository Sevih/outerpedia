'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import { onTabListKeyDown } from '@/lib/tablist';
import { useUrlTab } from '@/hooks/useUrlTab';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Onglets théminés (soulignement de l'onglet actif via la couleur d'accent).
 *
 * `urlParam` : mémorise l'onglet actif dans l'URL (`?<param>=<id>`) — l'URL est
 * la SOURCE DE VÉRITÉ (cf. useUrlTab/useUrlSlice : Back/Forward pilote l'UI),
 * écrite via `history.replaceState` (pas de rechargement serveur). La page reste
 * statiquement rendable (pas de bailout CSR ni de Suspense imposé).
 *
 * RÈGLE D'USAGE (décision 2026-07-16) : ce composant sert les pages HORS
 * guides (browsers, admin…). L'état INTERNE d'un guide (version, phase,
 * équipe) vit dans le HASH multi-params → `guides/SegmentedTabs` + url-hash.
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
  const { active, current, select } = useUrlTab(tabs, urlParam);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === active),
  );

  // Ids stables pour lier chaque onglet à l'unique panneau (aria-controls) et le
  // panneau à l'onglet actif (aria-labelledby).
  const baseId = useId();
  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  return (
    <div className={className}>
      <div
        role="tablist"
        className="border-line-subtle flex gap-1 border-b"
        onKeyDown={(e) => onTabListKeyDown(e, tabs.length, activeIndex, (i) => select(tabs[i].id))}
      >
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              id={tabId(t.id)}
              role="tab"
              aria-selected={on}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
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
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={current ? tabId(current.id) : undefined}
        tabIndex={0}
        className="pt-4"
      >
        {current?.content}
      </div>
    </div>
  );
}

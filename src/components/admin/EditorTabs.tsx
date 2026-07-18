'use client';

/**
 * Onglets d'un éditeur admin : une barre + un panneau par onglet. Tous les
 * panneaux sont MONTÉS (inactifs masqués en CSS) → l'état des éditeurs (saisie
 * en cours, sélections) survit au changement d'onglet.
 */
import { useState, type ReactNode } from 'react';

export function EditorTabs({
  tabs,
}: {
  tabs: { key: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div className="space-y-4">
      <div className="border-line flex w-fit flex-wrap gap-1 rounded-lg border p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              active === t.key
                ? 'bg-accent/20 text-accent font-semibold'
                : 'text-content-muted hover:bg-surface-overlay'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} className={active === t.key ? '' : 'hidden'}>
          {t.content}
        </div>
      ))}
    </div>
  );
}

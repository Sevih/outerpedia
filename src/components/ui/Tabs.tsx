'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/** Onglets théminés (soulignement de l'onglet actif via la couleur d'accent). */
export function Tabs({ tabs, className }: { tabs: Tab[]; className?: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

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
              onClick={() => setActive(t.id)}
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

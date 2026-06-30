'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

/** Accordéon théminé (un seul panneau ouvert à la fois). */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div
      className={cn('divide-line-subtle border-line-subtle divide-y rounded-lg border', className)}
    >
      {items.map((it) => {
        const on = it.id === open;
        return (
          <div key={it.id}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : it.id)}
              className="text-content-strong hover:bg-surface-overlay flex w-full items-center justify-between px-4 py-3 text-left font-medium"
            >
              {it.title}
              <span className={cn('text-content-subtle transition-transform', on && 'rotate-180')}>
                ▾
              </span>
            </button>
            {on && <div className="text-content-muted px-4 pb-4">{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

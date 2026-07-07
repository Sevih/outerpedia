'use client';

import * as HoverCard from '@radix-ui/react-hover-card';
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Tooltip inline partagé (Radix HoverCard) — portage V2.
 * Desktop : survol. Mobile : tap pour ouvrir, tap ailleurs pour fermer.
 */
export function InlineTooltip({
  children,
  content,
  bg = 'bg-neutral-800',
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  bg?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('ontouchstart' in window) {
      e.preventDefault();
      setOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('touchstart', close);
    return () => document.removeEventListener('touchstart', close);
  }, [open]);

  return (
    <HoverCard.Root openDelay={0} closeDelay={0} open={open} onOpenChange={setOpen}>
      <HoverCard.Trigger asChild>
        <span ref={triggerRef} onClick={handleTap} onTouchEnd={handleTap}>
          {children}
        </span>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={6}
          className={`z-80 max-w-70 rounded border border-white/10 px-3 py-2 shadow-lg ${bg}`}
        >
          {content}
          <HoverCard.Arrow className={arrowClass(bg)} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

/** Couleur de la flèche dérivée de la classe de fond. */
function arrowClass(bg: string): string {
  if (bg.includes('buff-bg')) return 'fill-buff-bg';
  if (bg.includes('debuff-bg')) return 'fill-debuff-bg';
  return 'fill-neutral-800';
}

'use client';

import * as HoverCard from '@radix-ui/react-hover-card';
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Tooltip inline partagé (Radix HoverCard).
 * Desktop : survol. Mobile : tap pour ouvrir, tap ailleurs pour fermer.
 *
 * Par défaut le contenu est une IMPASSE : on le lit, on n'y entre pas. Le
 * pointeur qui quitte le déclencheur ferme aussitôt (closeDelay 0, il ne peut
 * pas franchir le sideOffset), et sur mobile le moindre touch hors du
 * déclencheur ferme aussi. Parfait pour deux lignes de description — mais un
 * contenu qu'on doit PARCOURIR (liste longue, zone scrollable) devient
 * inatteignable : c'est ce que `interactive` débloque.
 */
export function InlineTooltip({
  children,
  content,
  // Fond volontairement SOMBRE (lisibilité au survol) : la surface overlay est
  // le token le plus proche du neutral-800 historique.
  bg = 'bg-surface-overlay',
  interactive = false,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  bg?: string;
  /**
   * Le contenu se PARCOURT (on y entre, on y scrolle) : laisse au pointeur le
   * temps de traverser jusqu'à lui, et ne ferme plus au touch qui tombe
   * dedans. À réserver aux contenus qui le méritent — ailleurs, la fermeture
   * immédiate est le bon comportement.
   */
  interactive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('ontouchstart' in window) {
      e.preventDefault();
      setOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: TouchEvent) => {
      const target = e.target as Node;
      // Le contenu vit dans un PORTAL : il n'est pas dans le déclencheur, donc
      // sans ce second test, le toucher qui le scrolle le referme.
      if (interactive && contentRef.current?.contains(target)) return;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('touchstart', close);
    return () => document.removeEventListener('touchstart', close);
  }, [open, interactive]);

  return (
    <HoverCard.Root
      openDelay={0}
      closeDelay={interactive ? 200 : 0}
      open={open}
      onOpenChange={setOpen}
    >
      <HoverCard.Trigger asChild>
        <span ref={triggerRef} onClick={handleTap} onTouchEnd={handleTap}>
          {children}
        </span>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          ref={contentRef}
          side="top"
          align="center"
          sideOffset={6}
          className={`border-line z-80 max-w-70 rounded border px-3 py-2 shadow-lg ${bg}`}
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
  return 'fill-surface-overlay';
}

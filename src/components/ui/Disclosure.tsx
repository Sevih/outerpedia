'use client';

/**
 * Un repli SIMPLE — un bouton, un contenu masqué par défaut.
 *
 * Différent de l'`Accordion` (plusieurs panneaux, le premier ouvert d'office) :
 * ici un seul bloc, FERMÉ au départ, qu'on déplie à la demande — le mode compact
 * d'une carte de boss cache ses stats derrière ce bouton.
 */
import { useState, type ReactNode } from 'react';

export function Disclosure({
  label,
  children,
  defaultOpen = false,
}: {
  /** Libellé du bouton, déjà localisé. */
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="border-line-subtle bg-surface-raised text-content hover:text-content-strong inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold transition-colors"
      >
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        {label}
      </button>
      {open && children}
    </div>
  );
}

'use client';

import { cn } from '@/lib/cn';

/** Pastille de filtre cliquable (état actif/inactif théminé). */
export function Pill({
  active = false,
  className,
  children,
  ...rest
}: { active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'bg-accent text-accent-fg border-transparent'
          : 'border-line bg-surface-overlay text-content-muted hover:text-content-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

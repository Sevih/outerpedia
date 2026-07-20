'use client';

/**
 * Pastille de filtre générique (toggle) — utilisée par le panneau avancé
 * (chaîne/role/gift/source/team bonus/tags). Portage V2 sur tokens V3 : accent
 * ciel actif, surface au repos.
 */
export function FilterPill({
  active,
  children,
  onClick,
  className,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={[
        'focus-visible:ring-accent inline-flex cursor-pointer items-center justify-center rounded leading-none transition select-none focus:outline-none focus-visible:ring-2',
        active
          ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/50'
          : 'bg-surface-sunken/70 border-line-subtle text-content-muted hover:text-content-strong border',
        'text-xs',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

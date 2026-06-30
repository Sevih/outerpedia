'use client';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/cn';

/**
 * Bascule clair/sombre. On rend les DEUX icônes et on laisse le CSS (`dark:`)
 * afficher la bonne selon la classe `dark` de <html> (posée par next-themes avant
 * le paint) → pas d'effet de montage, pas de mismatch d'hydratation. Au clic,
 * `resolvedTheme` est fiable (exécuté côté client).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Basculer le thème clair / sombre"
      title="Basculer le thème"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'border-line text-content-muted hover:bg-surface-overlay hover:text-content-strong inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
        className,
      )}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="block dark:hidden" />
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

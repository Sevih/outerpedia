'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

export type NavTone = 'warn' | 'danger' | 'accent';

export interface NavItem {
  label: string;
  href: string;
  /** Compteur « à traiter » ; masqué si count = 0. */
  badge?: { count: number; tone: NavTone } | null;
  /** Placeholder : lien visible mais grisé. */
  soon?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const TONE: Record<NavTone, string> = {
  warn: 'bg-warn/15 text-warn',
  danger: 'bg-danger/15 text-danger',
  accent: 'bg-accent/15 text-accent',
};

/**
 * Menu admin à sections (Extractor / Editor / Tools / Guides). Deux axes :
 * ce qu'on fait (la section) × sur quelle entité (la ligne). Les compteurs
 * « à traiter » vivent sur les lignes Extractor, calculés côté serveur.
 */
export function AdminSidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <aside className="border-line-subtle bg-surface-raised sticky top-0 flex h-dvh w-60 shrink-0 flex-col self-start overflow-hidden border-r">
      <div className="border-line-subtle flex items-center gap-2 border-b px-4 py-3">
        <Link href={'/admin' as Route} className="text-content-strong font-semibold">
          Admin
        </Link>
        <span className="bg-warn/15 text-warn rounded px-1.5 py-0.5 text-[10px] font-medium uppercase">
          dev only
        </span>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            <p className="text-content-subtle px-4 pb-1 text-[10px] font-semibold tracking-wider uppercase">
              {section.title}
            </p>
            <ul>
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href as Route}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2 border-l-2 px-4 py-1.5 text-sm ${
                        active
                          ? 'border-accent bg-surface-overlay text-content-strong'
                          : 'text-content-muted hover:text-content-strong hover:bg-surface-overlay/50 border-transparent'
                      } ${item.soon ? 'opacity-40' : ''}`}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.soon && (
                        <span className="text-content-subtle text-[10px]">à venir</span>
                      )}
                      {item.badge && item.badge.count > 0 && (
                        <span
                          className={`rounded px-1.5 text-[10px] font-medium tabular-nums ${TONE[item.badge.tone]}`}
                        >
                          {item.badge.count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

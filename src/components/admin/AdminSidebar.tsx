'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

export type NavTone = 'warn' | 'danger' | 'accent';

export interface NavItem {
  label: string;
  href: string;
  /** Compteur « à traiter » ; masqué si count = 0. `title` = détail au survol
   *  (le badge est un TOTAL : new + diff + removed). */
  badge?: { count: number; tone: NavTone; title?: string } | null;
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

const COLLAPSE_KEY = 'admin.sidebar.collapsed';

// Mini-store externe branché sur localStorage : SSR rend « déplié » (snapshot
// serveur), le client se resynchronise à l'hydratation — sans setState en effet.
let collapseListeners: Array<() => void> = [];
const subscribeCollapse = (l: () => void) => {
  collapseListeners.push(l);
  return () => {
    collapseListeners = collapseListeners.filter((x) => x !== l);
  };
};
const readCollapse = () => localStorage.getItem(COLLAPSE_KEY) === '1';
const writeCollapse = (v: boolean) => {
  localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0');
  for (const l of collapseListeners) l();
};

/**
 * Menu admin à sections (Extractor / Editor / Tools / Guides). Deux axes :
 * ce qu'on fait (la section) × sur quelle entité (la ligne). Les compteurs
 * « à traiter » vivent sur les lignes Extractor, calculés côté serveur.
 * COLLAPSABLE (persisté en localStorage) : une fois sur le bon outil, le menu
 * se replie en rail fin pour rendre la place au contenu.
 */
export function AdminSidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeCollapse, readCollapse, () => false);
  const toggle = () => writeCollapse(!collapsed);

  if (collapsed) {
    return (
      <aside className="border-line-subtle bg-surface-raised sticky top-0 flex h-dvh w-10 shrink-0 flex-col items-center self-start border-r py-3">
        <button
          type="button"
          onClick={toggle}
          title="Expand the menu"
          className="text-content-subtle hover:text-content-strong text-lg"
        >
          ☰
        </button>
        <Link
          href={'/admin' as Route}
          title="Admin"
          className="text-content-subtle hover:text-content-strong mt-4 text-[10px] font-semibold tracking-widest uppercase [writing-mode:vertical-rl]"
        >
          Admin
        </Link>
        <Link
          href={'/' as Route}
          title="Back to site"
          className="text-content-subtle hover:text-content-strong mt-auto text-sm"
        >
          ↩
        </Link>
      </aside>
    );
  }

  return (
    <aside className="border-line-subtle bg-surface-raised sticky top-0 flex h-dvh w-60 shrink-0 flex-col self-start overflow-hidden border-r">
      <div className="border-line-subtle flex items-center gap-2 border-b px-4 py-3">
        <Link href={'/admin' as Route} className="text-content-strong font-semibold">
          Admin
        </Link>
        <span className="bg-warn/15 text-warn rounded px-1.5 py-0.5 text-[10px] font-medium uppercase">
          dev only
        </span>
        <button
          type="button"
          onClick={toggle}
          title="Collapse the menu"
          className="text-content-subtle hover:text-content-strong ml-auto text-sm"
        >
          ⟨⟨
        </button>
      </div>

      <div className="border-line-subtle border-b px-4 py-1.5">
        <Link href={'/' as Route} className="text-content-subtle hover:text-content-strong text-xs">
          ↩ Back to site
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.title} className="mt-4 mb-1 first:mt-1">
            {/* En-tête de SECTION : filet + fond léger → nettement distinct d'un item cliquable. */}
            <p className="text-content-subtle bg-surface-overlay/40 border-line-subtle mb-1 border-y px-4 py-1 text-[10px] font-bold tracking-widest uppercase">
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
                      className={`flex items-center gap-2 border-l-2 py-1.5 pr-3 pl-6 text-sm ${
                        active
                          ? 'border-accent bg-surface-overlay text-content-strong font-medium'
                          : 'text-content-muted hover:text-content-strong hover:bg-surface-overlay/50 border-transparent'
                      } ${item.soon ? 'opacity-40' : ''}`}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.soon && <span className="text-content-subtle text-[10px]">soon</span>}
                      {item.badge && item.badge.count > 0 && (
                        <span
                          title={item.badge.title}
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

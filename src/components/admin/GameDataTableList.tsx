'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { TableInfo } from '@/lib/admin/gamedata-store';

/** Taille de fichier lisible (les tables vont de 4 Ko à 18 Mo). */
function humanSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} Mo`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} Ko`;
  return `${bytes} o`;
}

/**
 * Liste latérale des tables parsées du jeu. On n'affiche QUE ce qu'on connaît
 * sans lire les fichiers (nom + taille) : compter les lignes des 257 tables
 * coûterait 140 Mo de parse à chaque rendu du layout. Le décompte réel arrive
 * sur la page de la table.
 */
export function GameDataTableList({ tables }: { tables: TableInfo[] }) {
  const [search, setSearch] = useState('');
  const pathname = usePathname();

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return s ? tables.filter((t) => t.name.toLowerCase().includes(s)) : tables;
  }, [tables, search]);

  return (
    <aside className="border-line-subtle sticky top-6 flex h-[calc(100dvh-7.5rem)] w-72 shrink-0 flex-col self-start overflow-hidden rounded-lg border">
      <div className="border-line-subtle space-y-2 border-b p-3">
        <div className="text-content-subtle flex justify-between text-xs">
          <span>{tables.length} tables</span>
          {search && <span>{filtered.length} filtrée(s)</span>}
        </div>
        <input
          className="border-line bg-surface-base text-content focus:border-accent w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
          placeholder="Nom de table…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ul className="divide-line-subtle min-h-0 flex-1 divide-y overflow-y-auto text-sm">
        {filtered.map((t) => {
          const href = `/admin/tools/gamedata/${t.name}` as Route;
          const active = pathname === href;
          return (
            <li key={t.name}>
              <Link
                href={href}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 ${
                  active ? 'bg-surface-overlay' : 'hover:bg-surface-overlay/50'
                }`}
              >
                <span className="text-content truncate">{t.name}</span>
                <span className="text-content-subtle shrink-0 text-xs">{humanSize(t.bytes)}</span>
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="text-content-subtle px-3 py-2 text-xs">Aucune table ne correspond.</li>
        )}
      </ul>
    </aside>
  );
}

'use client';

/**
 * LE SÉLECTEUR D'ÉTAGE d'une tour — la colonne de gauche.
 *
 * Chaque étage est un LIEN vers sa propre URL (`.../fire-tower/35`) : c'est la
 * sous-route statique qui rend l'étage côté serveur (cf. la route `[floor]`),
 * pas un basculement client. Le composant ne fait donc que DEUX choses que le
 * serveur ne peut pas faire : filtrer la liste à la frappe, et marquer l'étage
 * courant. Les libellés (boss, numéro) sont calculés au build et passés en
 * props — ici on ne résout rien.
 */
import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

export interface TowerMenuItem {
  floor: number;
  href: string;
  /** Nom du boss de l'étage (libellé + cible de recherche). */
  boss?: string;
  /** L'étage porte au moins une restriction fixe (pastille). */
  restricted?: boolean;
}

export function TowerFloorMenu({
  items,
  current,
  searchPlaceholder,
}: {
  items: TowerMenuItem[];
  current: number;
  searchPlaceholder: string;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter((it) => String(it.floor).includes(q) || it.boss?.toLowerCase().includes(q))
    : items;

  return (
    <div className="md:sticky md:top-20">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="border-line-subtle bg-surface-raised text-content-strong placeholder:text-content-muted focus:border-accent mb-3 w-full rounded-md border px-3 py-2 text-sm outline-none"
      />
      <ul className="border-line-subtle bg-surface-raised max-h-[45vh] space-y-0.5 overflow-y-auto rounded-lg border p-1.5 md:max-h-[calc(100vh-9rem)]">
        {filtered.map((it) => {
          const active = it.floor === current;
          return (
            <li key={it.floor}>
              <Link
                href={it.href as Route}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-accent/15 text-content-strong font-medium'
                    : 'text-content hover:bg-surface-hover',
                ].join(' ')}
              >
                <span className="text-content-muted w-8 shrink-0 text-right tabular-nums">
                  {it.floor}
                </span>
                <span className="min-w-0 flex-1 truncate">{it.boss}</span>
                {it.restricted && (
                  <span aria-hidden className="bg-accent/70 h-1.5 w-1.5 shrink-0 rounded-full" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { img } from '@/lib/images';
import type { SidebarRow } from '@/lib/admin/character-rows';

export type { SidebarRow };

const FILTERS = ['all', 'diff', 'v2', 'new', 'ok'] as const;
type Filter = (typeof FILTERS)[number];

/** Liste latérale des persos façon extracteur V2 : stats, recherche, filtres. */
export function CharactersSidebar({
  rows,
  basePath = '/admin/extractor/characters',
}: {
  rows: SidebarRow[];
  basePath?: string;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const pathname = usePathname();

  const stats = useMemo(
    () => ({
      total: rows.length,
      ok: rows.filter((r) => r.status === 'ok').length,
      diff: rows.filter((r) => r.status === 'diff').length,
      v2: rows.filter((r) => r.v2Count > 0).length,
      new: rows.filter((r) => r.status === 'new').length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows
      .filter((r) =>
        filter === 'all' ? true : filter === 'v2' ? r.v2Count > 0 : r.status === filter,
      )
      .filter((r) => !s || r.id.includes(s) || r.name.toLowerCase().includes(s))
      .sort((a, b) => {
        // diffs d'abord (plus gros en tête), puis new, puis par id.
        const pa = a.status === 'diff' ? 0 : a.status === 'new' ? 1 : 2;
        const pb = b.status === 'diff' ? 0 : b.status === 'new' ? 1 : 2;
        if (pa !== pb) return pa - pb;
        if (a.diffCount !== b.diffCount) return b.diffCount - a.diffCount;
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      });
  }, [rows, search, filter]);

  return (
    <aside className="border-line-subtle sticky top-6 flex h-[calc(100dvh-7.5rem)] w-72 shrink-0 flex-col self-start overflow-hidden rounded-lg border">
      <div className="border-line-subtle space-y-2 border-b p-3">
        <div className="flex gap-2 text-xs">
          <span className="text-content-subtle">{stats.total} total</span>
          <span className="text-success">{stats.ok} ok</span>
          <span className="text-warn">{stats.diff} diff</span>
          <span className="text-danger">{stats.v2} v2≠</span>
          <span className="text-accent">{stats.new} new</span>
        </div>
        <input
          className="border-line bg-surface-base text-content focus:border-accent w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
          placeholder="Nom ou id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded px-2 py-0.5 text-xs ${
                filter === f
                  ? 'bg-surface-overlay text-content-strong'
                  : 'text-content-subtle hover:text-content'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-line-subtle min-h-0 flex-1 divide-y overflow-y-auto text-sm">
        {filtered.map((r) => {
          const href = `${basePath}/${r.id}` as Route;
          const active = pathname === href;
          return (
            <li key={r.id}>
              <Link
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 ${active ? 'bg-surface-overlay' : 'hover:bg-surface-overlay/50'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- icône dev */}
                <img
                  src={img.face(r.id)}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded object-contain"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center justify-between">
                    <span className="text-content-subtle font-mono text-xs">{r.id}</span>
                    <span className="flex items-center gap-1">
                      {r.status === 'new' && (
                        <span className="bg-accent/15 text-accent rounded px-1 text-[10px]">
                          new
                        </span>
                      )}
                      {r.status === 'diff' && (
                        <span className="bg-warn/15 text-warn rounded px-1 text-[10px]">
                          {r.diffCount} diff
                        </span>
                      )}
                      {r.status === 'ok' && (
                        <span className="bg-success/15 text-success rounded px-1 text-[10px]">
                          ok
                        </span>
                      )}
                      {r.v2Count > 0 && (
                        <span className="bg-danger/15 text-danger rounded px-1 text-[10px]">
                          {r.v2Count} v2≠
                        </span>
                      )}
                      {r.curated && <span className="text-accent text-[10px]">✎</span>}
                    </span>
                  </span>
                  <span className="text-content truncate">{r.name}</span>
                  {r.element && (
                    <span className="flex items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element -- icône prod */}
                      <img src={img.element(r.element)} alt="" className="h-4 w-4" />
                      {/* eslint-disable-next-line @next/next/no-img-element -- icône prod */}
                      <img src={img.klass(r.class)} alt="" className="h-4 w-4" />
                      <span className="text-light text-xs">{'★'.repeat(r.rarity)}</span>
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

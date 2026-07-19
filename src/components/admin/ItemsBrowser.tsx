'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';

export interface CatalogEntry {
  id: string;
  name: string;
  desc?: string;
  icon: string;
  grade: string;
  type: string;
  star?: number;
  hidden?: boolean;
  curated?: boolean;
}

const CAP = 500;

/** Catalogue Item + monnaies : recherche, filtre par type + « sans description ». */
export function ItemsBrowser({ entries }: { entries: CatalogEntry[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [noDesc, setNoDesc] = useState(false);
  const [noIcon, setNoIcon] = useState(false);
  const [newId, setNewId] = useState('');

  const types = useMemo(
    () => ['all', ...Array.from(new Set(entries.map((e) => e.type))).sort()],
    [entries],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (type === 'all' || e.type === type) &&
        (!noDesc || !e.desc) &&
        (!noIcon || !e.icon) &&
        (!s || e.name.toLowerCase().includes(s) || e.id.toLowerCase().includes(s)),
    );
  }, [entries, q, type, noDesc, noIcon]);

  const shown = filtered.slice(0, CAP);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="border-line bg-surface-base text-content focus:border-accent w-64 rounded-md border px-2 py-1 text-sm focus:outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or id…"
        />
        <div className="flex flex-wrap gap-1">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded px-2 py-0.5 text-xs ${
                type === t
                  ? 'bg-surface-overlay text-content-strong'
                  : 'text-content-subtle hover:text-content'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="text-content flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={noDesc} onChange={(e) => setNoDesc(e.target.checked)} />
          no description
        </label>
        <label className="text-content flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={noIcon} onChange={(e) => setNoIcon(e.target.checked)} />
          no icon
        </label>
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const s = newId.trim();
            if (s) router.push(`/admin/editor/items/${encodeURIComponent(s)}` as Route);
          }}
        >
          <input
            className="border-line bg-surface-base text-content focus:border-accent w-40 rounded-md border px-2 py-1 font-mono text-xs focus:outline-none"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="id to create/edit"
          />
          <button
            type="submit"
            className="border-line hover:border-accent rounded-md border px-2 py-1 text-xs"
          >
            create / edit
          </button>
        </form>
        <span className="text-content-subtle ml-auto text-xs">
          {filtered.length} entry(ies){filtered.length > CAP ? ` · ${CAP} shown` : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr className="border-line-subtle border-b">
              <th className="px-2 py-1" />
              <th className="px-2 py-1 font-medium">Name</th>
              <th className="px-2 py-1 font-medium">Type</th>
              <th className="px-2 py-1 font-medium">Grade</th>
              <th className="px-2 py-1 font-medium">★</th>
              <th className="px-2 py-1 font-medium">Desc</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((e) => (
              <tr key={e.id} className="border-line-subtle hover:bg-surface-base border-t">
                <td className="px-2 py-1">
                  <ItemInline
                    item={{
                      name: e.name,
                      iconSrc: e.icon ? img.item(e.icon) : '',
                      grade: e.grade,
                      desc: e.desc,
                    }}
                    size={24}
                    iconOnly
                  />
                </td>
                <td className="px-2 py-1">
                  <Link
                    href={`/admin/editor/items/${encodeURIComponent(e.id)}` as Route}
                    className="text-content hover:text-accent"
                  >
                    {e.name}
                    {e.curated && <span className="text-accent ml-1 text-[10px]">✎</span>}
                    {e.hidden && (
                      <span className="text-content-subtle ml-1 text-[10px]">hidden</span>
                    )}
                  </Link>
                </td>
                <td className="text-content-subtle px-2 py-1 text-xs">{e.type}</td>
                <td className="text-content-subtle px-2 py-1 text-xs">{e.grade}</td>
                <td className="text-content-subtle px-2 py-1 text-xs">
                  {e.star ? '★'.repeat(e.star) : ''}
                </td>
                <td className="px-2 py-1 text-xs">
                  {e.desc ? (
                    <span className="text-success">✓</span>
                  ) : (
                    <span className="text-warn">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

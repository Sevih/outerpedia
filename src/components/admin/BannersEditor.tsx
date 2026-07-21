'use client';

import { useState } from 'react';
import type { Banner } from '@/lib/admin/promo-banner-store';
import { postJson } from '@/lib/admin/post-json';
import { type Keyed, rowKey, withKey } from '@/lib/admin/keyed';
import { CharacterPicker, type CharOption } from '@/components/admin/CharacterPicker';

const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };
type Row = Keyed<Banner>;

/** Tri récent → ancien (par date de début). */
const byStartDesc = <T extends { start: string }>(l: T[]): T[] =>
  [...l].sort((a, b) => (b.start || '').localeCompare(a.start || ''));

/** Statut d'une fenêtre à aujourd'hui (jours UTC, même règle que la home). */
type WindowStatus = 'active' | 'upcoming' | 'expired' | 'draft';
function statusOf(b: Banner, today: string): WindowStatus {
  if (!b.start || !b.end) return 'draft';
  if (b.start > today) return 'upcoming';
  if (b.end < today) return 'expired';
  return 'active';
}

/** Jours entiers entre deux dates ISO (b − a). */
const daysBetween = (a: string, b: string): number =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** Badge de statut : Active (jours restants) / Upcoming (dans N j) / Expired. */
function StatusBadge({
  status,
  banner,
  today,
}: {
  status: WindowStatus;
  banner: Banner;
  today: string;
}) {
  if (status === 'draft') return null;
  const cls = {
    active: 'border-success/40 text-success',
    upcoming: 'border-accent/40 text-accent',
    expired: 'border-line text-content-subtle',
  }[status];
  const label = {
    active: `Active · ${daysBetween(today, banner.end)}d left`,
    upcoming: `Upcoming · in ${daysBetween(today, banner.start)}d`,
    expired: 'Expired',
  }[status];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

/** Éditeur des bannières : on choisit le perso par nom (id auto), + période. */
export function BannersEditor({ initial, chars }: { initial: Banner[]; chars: CharOption[] }) {
  const [rows, setRows] = useState<Row[]>(() => byStartDesc(initial.map(withKey)));
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // Jour UTC figé au premier rendu — même horloge que le filtre actif de la home.
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const set = (i: number, patch: Partial<Banner>) =>
    setRows((s) => s.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = () =>
    setRows((s) => [{ id: '', name: '', start: '', end: '', _key: rowKey() }, ...s]);
  const remove = (i: number) => setRows((s) => s.filter((_, j) => j !== i));

  async function save() {
    setStatus({ kind: 'idle' });
    try {
      // `_key` est présentationnel : on reconstruit la forme métier Banner.
      const res = await postJson<{
        ok: boolean;
        publish?: { ok: boolean; purged: boolean; error?: string };
      }>(
        '/api/admin/curated/banners',
        rows
          .filter((r) => r.id || r.name)
          .map((r): Banner => ({ id: r.id, name: r.name, start: r.start, end: r.end })),
      );
      // La sauvegarde publie aussi la copie runtime R2 (live sans redéploiement) —
      // un échec de publication est un AVERTISSEMENT, le fichier local est sauvé.
      const p = res.publish;
      if (p?.ok && p.purged) setStatus({ kind: 'ok', msg: 'Saved + publié (live ≤ 10 min)' });
      else if (p?.ok) setStatus({ kind: 'ok', msg: `Saved + publié — ${p.error ?? ''}` });
      else
        setStatus({ kind: 'err', msg: `Saved local, publication R2 ratée : ${p?.error ?? '?'}` });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <div className="space-y-4">
      {/* Barre d'actions en haut */}
      <div className="border-line-subtle bg-surface-base sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b py-2">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Save
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
        <button
          type="button"
          onClick={add}
          className="border-line hover:border-accent rounded-md border px-3 py-1.5 text-sm"
        >
          + banner
        </button>
        <span className="text-content-subtle ml-auto text-xs">{rows.length} banner(s)</span>
      </div>

      {/* max-w : colonnes étroites, une table pleine largeur n'est que du vide.
          4xl — en 3xl les dates compressent la colonne Status (badge rogné). */}
      <div className="max-w-4xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr className="border-line-subtle border-b">
              <th className="px-2 py-1 font-medium">Character (search by name)</th>
              <th className="w-36 px-2 py-1 font-medium">Start</th>
              <th className="w-36 px-2 py-1 font-medium">End</th>
              <th className="w-40 px-2 py-1 font-medium">Status</th>
              <th className="w-8 px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const st = statusOf(r, today);
              return (
                <tr
                  key={r._key}
                  className={`border-line-subtle border-t align-middle ${st === 'expired' ? 'opacity-50' : ''}`}
                >
                  <td className="px-2 py-1.5">
                    <CharacterPicker
                      compact
                      options={chars}
                      id={r.id}
                      name={r.name}
                      onSelect={(c) => set(i, { id: c.id, name: c.name })}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      className={input}
                      value={r.start}
                      onChange={(e) => set(i, { start: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      className={input}
                      value={r.end}
                      onChange={(e) => set(i, { end: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <StatusBadge status={st} banner={r} today={today} />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      className="text-danger text-sm"
                      onClick={() => remove(i)}
                      aria-label="Delete"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

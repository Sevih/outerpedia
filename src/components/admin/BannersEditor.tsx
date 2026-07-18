'use client';

import { useState } from 'react';
import type { Banner } from '@/lib/admin/promo-banner-store';
import { postJson } from '@/lib/admin/post-json';
import { type Keyed, rowKey, withKey } from '@/lib/admin/keyed';
import { CharacterPicker, type CharOption } from '@/components/admin/CharacterPicker';
import { RegenFromV2Button } from './RegenFromV2Button';

const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };
type Row = Keyed<Banner>;

/** Tri récent → ancien (par date de début). */
const byStartDesc = <T extends { start: string }>(l: T[]): T[] =>
  [...l].sort((a, b) => (b.start || '').localeCompare(a.start || ''));

/** Éditeur des bannières : on choisit le perso par nom (id auto), + période. */
export function BannersEditor({ initial, chars }: { initial: Banner[]; chars: CharOption[] }) {
  const [rows, setRows] = useState<Row[]>(() => byStartDesc(initial.map(withKey)));
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const set = (i: number, patch: Partial<Banner>) =>
    setRows((s) => s.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = () =>
    setRows((s) => [{ id: '', name: '', start: '', end: '', _key: rowKey() }, ...s]);
  const remove = (i: number) => setRows((s) => s.filter((_, j) => j !== i));

  async function save() {
    setStatus({ kind: 'idle' });
    try {
      // `_key` est présentationnel : on reconstruit la forme métier Banner.
      await postJson(
        '/api/admin/curated/banners',
        rows
          .filter((r) => r.id || r.name)
          .map((r): Banner => ({ id: r.id, name: r.name, start: r.start, end: r.end })),
      );
      setStatus({ kind: 'ok', msg: 'Enregistré' });
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
          Enregistrer
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
        <button
          type="button"
          onClick={add}
          className="border-line hover:border-accent rounded-md border px-3 py-1.5 text-sm"
        >
          + bannière
        </button>
        <RegenFromV2Button
          kind="banners"
          onRegen={(d) => setRows(byStartDesc((d as Banner[]).map(withKey)))}
        />
        <span className="text-content-subtle ml-auto text-xs">{rows.length} bannière(s)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr className="border-line-subtle border-b">
              <th className="px-2 py-1 font-medium">Perso (recherche par nom)</th>
              <th className="px-2 py-1 font-medium">Début</th>
              <th className="px-2 py-1 font-medium">Fin</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r._key} className="border-line-subtle border-t align-top">
                <td className="px-2 py-1">
                  <CharacterPicker
                    options={chars}
                    id={r.id}
                    name={r.name}
                    onSelect={(c) => set(i, { id: c.id, name: c.name })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="date"
                    className={input}
                    value={r.start}
                    onChange={(e) => set(i, { start: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="date"
                    className={input}
                    value={r.end}
                    onChange={(e) => set(i, { end: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <button
                    type="button"
                    className="text-danger text-sm"
                    onClick={() => remove(i)}
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

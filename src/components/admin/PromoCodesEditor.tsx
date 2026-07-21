'use client';

import { useState } from 'react';
import type { PromoCode } from '@/lib/admin/promo-banner-store';
import { postJson } from '@/lib/admin/post-json';
import { rowKey } from '@/lib/admin/keyed';
import type { ItemOption } from '@/lib/data/items';
import { ItemPicker } from './ItemPicker';

const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';

/** Reward = id d'item (stocké) → quantité. `_key` = clé React stable. */
type Reward = { id: string; qty: string; _key: string };
type Row = { code: string; start: string; end: string; rewards: Reward[]; _key: string };
type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

const toRow = (p: PromoCode): Row => ({
  code: p.code,
  start: p.start,
  end: p.end,
  rewards: Object.entries(p.description ?? {}).map(([id, qty]) => ({ id, qty, _key: rowKey() })),
  _key: rowKey(),
});
const toPromo = (r: Row): PromoCode => ({
  code: r.code,
  start: r.start,
  end: r.end,
  description: Object.fromEntries(r.rewards.filter((x) => x.id.trim()).map((x) => [x.id, x.qty])),
});
/** Tri récent → ancien (par date de début). */
const byStartDesc = (l: Row[]): Row[] =>
  [...l].sort((a, b) => (b.start || '').localeCompare(a.start || ''));

/** Éditeur des codes promo (code, période, récompenses par item). */
export function PromoCodesEditor({
  initial,
  items,
}: {
  initial: PromoCode[];
  items: ItemOption[];
}) {
  const [rows, setRows] = useState<Row[]>(() => byStartDesc(initial.map(toRow)));
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const set = (i: number, patch: Partial<Row>) =>
    setRows((s) => s.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setReward = (i: number, ri: number, patch: Partial<Reward>) =>
    set(i, {
      rewards: rows[i].rewards.map((x, j) => (j === ri ? { ...x, ...patch } : x)),
    });
  const add = () =>
    setRows((s) => [
      {
        code: '',
        start: '',
        end: '',
        rewards: [{ id: '', qty: '', _key: rowKey() }],
        _key: rowKey(),
      },
      ...s,
    ]);
  const remove = (i: number) => setRows((s) => s.filter((_, j) => j !== i));

  async function save() {
    setStatus({ kind: 'idle' });
    try {
      const res = await postJson<{
        ok: boolean;
        publish?: { ok: boolean; purged: boolean; error?: string };
      }>('/api/admin/curated/coupons', rows.filter((r) => r.code.trim()).map(toPromo));
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
          + code
        </button>
        <span className="text-content-subtle ml-auto text-xs">{rows.length} code(s)</span>
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r._key} className="border-line-subtle space-y-2 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className={`${input} w-44 font-mono`}
                value={r.code}
                placeholder="CODE"
                onChange={(e) => set(i, { code: e.target.value })}
              />
              <label className="text-content-subtle text-xs">from</label>
              <input
                type="date"
                className={input}
                value={r.start}
                onChange={(e) => set(i, { start: e.target.value })}
              />
              <label className="text-content-subtle text-xs">to</label>
              <input
                type="date"
                className={input}
                value={r.end}
                onChange={(e) => set(i, { end: e.target.value })}
              />
              <button
                type="button"
                className="text-danger ml-auto text-sm"
                onClick={() => remove(i)}
                aria-label="Delete the code"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 pl-1">
              <p className="text-content-subtle text-xs uppercase">Rewards</p>
              {r.rewards.map((rw, ri) => (
                <div key={rw._key} className="flex items-center gap-2">
                  <ItemPicker
                    options={items}
                    value={rw.id}
                    onChange={(id) => setReward(i, ri, { id })}
                  />
                  <span className="text-content-subtle text-xs">×</span>
                  <input
                    className={`${input} w-20`}
                    value={rw.qty}
                    placeholder="1000"
                    onChange={(e) => setReward(i, ri, { qty: e.target.value })}
                  />
                  <button
                    type="button"
                    className="text-danger text-sm"
                    onClick={() => set(i, { rewards: r.rewards.filter((_, j) => j !== ri) })}
                    aria-label="Delete the reward"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-accent text-xs hover:underline"
                onClick={() =>
                  set(i, { rewards: [...r.rewards, { id: '', qty: '', _key: rowKey() }] })
                }
              >
                + reward
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

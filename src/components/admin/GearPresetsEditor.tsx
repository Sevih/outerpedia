'use client';

import { useState } from 'react';
import type { GearPresets, SetComboPiece } from '@contracts';
import type { GearOption } from '@/lib/admin/gear-options';
import { postJson } from '@/lib/admin/post-json';
import { rowKey } from '@/lib/admin/keyed';

const field =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';
const btn = 'rounded border border-line px-2 py-0.5 text-xs text-content-subtle hover:text-content';

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

/** Ligne éditable slug → valeur (le slug se référence en `$slug` dans les builds). */
interface Row<T> {
  slug: string;
  value: T;
  /** Clé React stable (présentationnel — le save reconstruit via `slug`/`value`). */
  _key: string;
}

const toRows = <T,>(rec: Record<string, T>): Row<T>[] =>
  Object.entries(rec).map(([slug, value]) => ({ slug, value, _key: rowKey() }));

function SlugInput({
  row,
  onChange,
  usage,
}: {
  row: { slug: string };
  onChange: (slug: string) => void;
  usage?: number;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-content-subtle text-sm">$</span>
      <input
        className={`${field} w-36 font-mono text-xs`}
        value={row.slug}
        onChange={(e) => onChange(e.target.value.trim())}
      />
      <span className="text-content-subtle w-14 text-xs">
        {usage ? `${usage} build${usage > 1 ? 's' : ''}` : 'inutilisé'}
      </span>
    </span>
  );
}

/**
 * Éditeur des PRESETS partagés de gear reco (`data/curated/gear-presets.json`) :
 * listes de talismans, combos de sets, priorités de substats — référencés par
 * `$slug` dans les builds. Le serveur refuse la suppression d'un preset encore
 * référencé (garde-fou anti-casse).
 */
export function GearPresetsEditor({
  initial,
  talismanOptions,
  setOptions,
  usage,
}: {
  initial: GearPresets;
  talismanOptions: GearOption[];
  setOptions: GearOption[];
  /** `kind:slug` → nombre de builds qui référencent ce preset. */
  usage: Record<string, number>;
}) {
  const [talis, setTalis] = useState<Row<string[]>[]>(() => toRows(initial.talismans));
  const [sets, setSets] = useState<Row<SetComboPiece[]>[]>(() => toRows(initial.sets));
  const [subs, setSubs] = useState<Row<string>[]>(() => toRows(initial.substats));
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function save() {
    setStatus({ kind: 'idle' });
    const dup = (rows: { slug: string }[]) =>
      rows.map((r) => r.slug).filter((s, i, a) => s && a.indexOf(s) !== i);
    const dups = [...dup(talis), ...dup(sets), ...dup(subs)];
    if (dups.length) {
      setStatus({ kind: 'err', msg: `Slugs en double : ${[...new Set(dups)].join(', ')}` });
      return;
    }
    const body: GearPresets = {
      talismans: Object.fromEntries(
        talis.filter((r) => r.slug).map((r) => [r.slug, r.value.filter(Boolean)]),
      ),
      sets: Object.fromEntries(
        sets.filter((r) => r.slug).map((r) => [r.slug, r.value.filter((p) => p.set)]),
      ),
      substats: Object.fromEntries(
        subs.filter((r) => r.slug && r.value.trim()).map((r) => [r.slug, r.value.trim()]),
      ),
    };
    try {
      await postJson('/api/admin/curated/gear-presets', body);
      setStatus({ kind: 'ok', msg: 'Enregistré' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  const patchRow = <T,>(
    rows: Row<T>[],
    set: (r: Row<T>[]) => void,
    i: number,
    p: Partial<Row<T>>,
  ) => set(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));

  return (
    <div className="space-y-8">
      {/* Talismans */}
      <section className="space-y-3">
        <p className={label}>Presets de talismans</p>
        {talis.map((row, i) => (
          <div
            key={row._key}
            className="border-line-subtle flex flex-wrap items-start gap-2 rounded-lg border p-2"
          >
            <SlugInput
              row={row}
              onChange={(slug) => patchRow(talis, setTalis, i, { slug })}
              usage={usage[`talismans:${row.slug}`]}
            />
            <div className="flex min-w-60 flex-1 flex-col gap-1">
              {row.value.map((id, ti) => (
                <div key={ti} className="flex items-center gap-1">
                  <select
                    className={`${field} flex-1`}
                    value={id}
                    onChange={(e) =>
                      patchRow(talis, setTalis, i, {
                        value: row.value.map((x, j) => (j === ti ? e.target.value : x)),
                      })
                    }
                  >
                    <option value="">—</option>
                    {talismanOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={btn}
                    onClick={() =>
                      patchRow(talis, setTalis, i, { value: row.value.filter((_, j) => j !== ti) })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={`${btn} self-start`}
                onClick={() => patchRow(talis, setTalis, i, { value: [...row.value, ''] })}
              >
                + talisman
              </button>
            </div>
            <button
              type="button"
              className={btn}
              onClick={() => setTalis(talis.filter((_, j) => j !== i))}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          className={btn}
          onClick={() => setTalis([...talis, { slug: '', value: [], _key: rowKey() }])}
        >
          + Nouveau preset talismans
        </button>
      </section>

      {/* Sets */}
      <section className="space-y-3">
        <p className={label}>Presets de combos de sets</p>
        {sets.map((row, i) => (
          <div
            key={row._key}
            className="border-line-subtle flex flex-wrap items-start gap-2 rounded-lg border p-2"
          >
            <SlugInput
              row={row}
              onChange={(slug) => patchRow(sets, setSets, i, { slug })}
              usage={usage[`sets:${row.slug}`]}
            />
            <div className="flex min-w-60 flex-1 flex-col gap-1">
              {row.value.map((p, pi) => (
                <div key={pi} className="flex items-center gap-1">
                  <select
                    className={`${field} flex-1`}
                    value={p.set}
                    onChange={(e) =>
                      patchRow(sets, setSets, i, {
                        value: row.value.map((x, j) =>
                          j === pi ? { ...x, set: e.target.value } : x,
                        ),
                      })
                    }
                  >
                    <option value="">—</option>
                    {setOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className={field}
                    value={p.count}
                    onChange={(e) =>
                      patchRow(sets, setSets, i, {
                        value: row.value.map((x, j) =>
                          j === pi ? { ...x, count: Number(e.target.value) } : x,
                        ),
                      })
                    }
                  >
                    <option value={2}>×2</option>
                    <option value={4}>×4</option>
                  </select>
                  <button
                    type="button"
                    className={btn}
                    onClick={() =>
                      patchRow(sets, setSets, i, { value: row.value.filter((_, j) => j !== pi) })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={`${btn} self-start`}
                onClick={() =>
                  patchRow(sets, setSets, i, { value: [...row.value, { set: '', count: 2 }] })
                }
              >
                + pièce
              </button>
            </div>
            <button
              type="button"
              className={btn}
              onClick={() => setSets(sets.filter((_, j) => j !== i))}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          className={btn}
          onClick={() =>
            setSets([...sets, { slug: '', value: [{ set: '', count: 4 }], _key: rowKey() }])
          }
        >
          + Nouveau preset sets
        </button>
      </section>

      {/* Substats */}
      <section className="space-y-3">
        <p className={label}>Presets de priorités de substats (« ATK&gt;CHC=CHD&gt;SPD »)</p>
        {subs.map((row, i) => (
          <div
            key={row._key}
            className="border-line-subtle flex flex-wrap items-center gap-2 rounded-lg border p-2"
          >
            <SlugInput
              row={row}
              onChange={(slug) => patchRow(subs, setSubs, i, { slug })}
              usage={usage[`substats:${row.slug}`]}
            />
            <input
              className={`${field} min-w-60 flex-1 font-mono text-xs`}
              value={row.value}
              onChange={(e) => patchRow(subs, setSubs, i, { value: e.target.value })}
            />
            <button
              type="button"
              className={btn}
              onClick={() => setSubs(subs.filter((_, j) => j !== i))}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          className={btn}
          onClick={() => setSubs([...subs, { slug: '', value: '', _key: rowKey() }])}
        >
          + Nouveau preset substats
        </button>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Enregistrer
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
      </div>
    </div>
  );
}

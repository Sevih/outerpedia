'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DiffBuckets, ReviewEntity } from '@/lib/admin/review-types';
import { postJson } from '@/lib/admin/post-json';
import { EntityDiffPanel } from './EntityDiffPanel';

/** Entité de revue enrichie d'un nom lisible (résolu côté serveur). */
export type NamedReviewEntity = ReviewEntity & { name: string };

type Status = ReviewEntity['status'];
type Filter = 'all' | Status;

const BADGE: Record<Status, { label: string; cls: string }> = {
  new: { label: 'new', cls: 'text-warn' },
  diff: { label: 'diff', cls: 'text-danger' },
  typo: { label: 'typo', cls: 'text-content-subtle' },
  removed: { label: 'disparu', cls: 'text-danger' },
};

/**
 * Revue d'extraction d'UNE cible (committé ↔ extraction fraîche), filtrable par
 * statut. `new`/`diff`/`typo`/`disparu` classés côté serveur. Deux gestes :
 *   - « Valider toute l'extraction » = promote (écrit le fichier entier) ;
 *   - « Corriger les typos » = n'applique QUE les coquilles (guillemets,
 *     ponctuation…), laissant les vrais écarts à arbitrer.
 * L'utilisateur committe ensuite via git.
 */
export function ExtractorReview({
  id,
  file,
  entities,
  buckets,
}: {
  id: string;
  file: string;
  entities: NamedReviewEntity[];
  buckets: DiffBuckets;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<null | 'all' | 'typos'>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const counts: Record<Filter, number> = {
    all: entities.length,
    new: buckets.new,
    diff: buckets.diff,
    typo: buckets.typo,
    removed: buckets.removed,
  };
  const shown = useMemo(
    () => (filter === 'all' ? entities : entities.filter((e) => e.status === filter)),
    [entities, filter],
  );

  async function accept(mode: 'all' | 'typos') {
    setBusy(mode);
    setMsg(null);
    try {
      const res = await postJson<{ fixed?: number }>(
        `/api/admin/review/${id}`,
        mode === 'typos' ? { mode: 'typos' } : undefined,
      );
      setMsg({
        tone: 'ok',
        text:
          mode === 'typos'
            ? `${res.fixed ?? 0} typo(s) corrigée(s) dans ${file} — committe via git.`
            : `Extraction validée dans ${file} — committe via git.`,
      });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'err', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  const total = buckets.new + buckets.diff + buckets.removed;

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="border-line-subtle bg-surface-raised flex flex-wrap items-center gap-3 rounded-lg border p-3">
        {entities.length === 0 ? (
          <span className="text-success text-sm">✓ Extraction à jour — aucun écart.</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => accept('all')}
              disabled={busy !== null}
              className="bg-accent text-accent-fg rounded-md px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {busy === 'all' ? '…' : 'Valider toute l’extraction'}
            </button>
            {buckets.typo > 0 && (
              <button
                type="button"
                onClick={() => accept('typos')}
                disabled={busy !== null}
                className="border-line hover:border-accent rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {busy === 'typos' ? '…' : `Corriger les typos (${buckets.typo})`}
              </button>
            )}
            <span className="text-content-subtle text-xs">
              {total} vrai(s) écart(s){buckets.typo > 0 && ` · ${buckets.typo} typo`}
            </span>
          </>
        )}
        {msg && (
          <span className={`text-sm ${msg.tone === 'ok' ? 'text-success' : 'text-danger'}`}>
            {msg.text}
          </span>
        )}
      </div>

      {/* Filtres */}
      {entities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'new', 'diff', 'typo', 'removed'] as const)
            .filter((f) => f === 'all' || counts[f] > 0)
            .map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  filter === f
                    ? 'border-accent text-accent'
                    : 'border-line-subtle text-content-subtle hover:text-content'
                }`}
              >
                {f === 'all' ? 'Tous' : BADGE[f].label} ({counts[f]})
              </button>
            ))}
        </div>
      )}

      {/* Liste */}
      <ul className="space-y-2">
        {shown.map((e) => (
          <li key={e.key} className="border-line-subtle rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold uppercase ${BADGE[e.status].cls}`}>
                {BADGE[e.status].label}
              </span>
              <span className="text-content-strong text-sm font-medium">{e.name}</span>
              <span className="text-content-subtle font-mono text-xs">{e.key}</span>
            </div>
            {e.fields.length > 0 && (
              <div className="mt-2">
                <EntityDiffPanel fields={e.fields} bare />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

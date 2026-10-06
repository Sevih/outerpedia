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
  // Retouche mineure (texte reformulé sans nombre changé, costume ajouté ou
  // déplacé) : couleur discrète, comme la typo — rien à arbitrer.
  minor: { label: 'minor', cls: 'text-content-muted' },
  typo: { label: 'typo', cls: 'text-content-subtle' },
  removed: { label: 'removed', cls: 'text-danger' },
};

/** Bilan d'images d'une écriture (cible des persos), tel que la route le rend. */
interface Assets {
  staged: number;
  restaged: number;
  present: number;
  missing: Array<{ key: string; reason: string }>;
}

const assetsSummary = (a?: Assets): string =>
  a
    ? ` · images: ${a.staged} produced, ${a.restaged} remade, ${a.present} already there` +
      (a.missing.length ? `, ${a.missing.length} missing` : '')
    : '';

/**
 * Revue d'extraction d'UNE cible (committé ↔ extraction fraîche), filtrable par
 * statut. `new`/`diff`/`minor`/`typo`/`disparu` classés côté serveur. Deux gestes :
 *   - « Valider toute l'extraction » = promote (écrit le fichier entier) ;
 *   - « Appliquer les retouches mineures » = n'applique QUE les entités
 *     mineures (texte reformulé, costume ajouté ou déplacé) et les coquilles
 *     (guillemets, ponctuation…), laissant les vrais écarts à arbitrer.
 * L'utilisateur committe ensuite via git.
 */
export function ExtractorReview({
  id,
  file,
  entities,
  buckets,
  integrateKind,
}: {
  id: string;
  file: string;
  entities: NamedReviewEntity[];
  buckets: DiffBuckets;
  /**
   * Active un bouton « Intégrer » PAR ligne, postant à
   * `/api/admin/integrate/<kind>/<key>` (comme la fiche gear/perso). Absent =
   * pas d'intégration par entité (seul le « valider tout » global).
   */
  integrateKind?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<null | 'all' | 'minor'>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowMsg, setRowMsg] = useState<Record<string, { tone: 'ok' | 'err'; text: string }>>({});

  async function integrateRow(key: string) {
    setRowBusy(key);
    setRowMsg((m) => ({ ...m, [key]: { tone: 'ok', text: '…' } }));
    try {
      const data = await postJson<{ report?: { files: string[]; assets: { staged: number } } }>(
        `/api/admin/integrate/${integrateKind}/${encodeURIComponent(key)}`,
      );
      const r = data.report;
      setRowMsg((m) => ({
        ...m,
        [key]: {
          tone: 'ok',
          text: r
            ? `✓ ${r.files.join(', ')} · ${r.assets.staged} image(s) — commit via git.`
            : '✓ integrated',
        },
      }));
      router.refresh();
    } catch (e) {
      setRowMsg((m) => ({ ...m, [key]: { tone: 'err', text: (e as Error).message } }));
    } finally {
      setRowBusy(null);
    }
  }

  const counts: Record<Filter, number> = {
    all: entities.length,
    new: buckets.new,
    diff: buckets.diff,
    minor: buckets.minor,
    typo: buckets.typo,
    removed: buckets.removed,
  };
  const shown = useMemo(
    () => (filter === 'all' ? entities : entities.filter((e) => e.status === filter)),
    [entities, filter],
  );

  async function accept(mode: 'all' | 'minor') {
    setBusy(mode);
    setMsg(null);
    try {
      const res = await postJson<{ typo?: number; minor?: number; assets?: Assets }>(
        `/api/admin/review/${id}`,
        mode === 'minor' ? { mode: 'minor' } : undefined,
      );
      // L'écran dit combien d'entités de chaque sorte il a appliquées.
      setMsg({
        tone: 'ok',
        text:
          (mode === 'minor'
            ? `${res.minor ?? 0} minor + ${res.typo ?? 0} typo applied in ${file}`
            : `Extraction confirmed in ${file}`) +
          assetsSummary(res.assets) +
          ' — commit via git.',
      });
      router.refresh();
    } catch (e) {
      setMsg({ tone: 'err', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  const total = buckets.new + buckets.diff + buckets.removed;
  const soft = buckets.minor + buckets.typo;

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="border-line-subtle bg-surface-raised flex flex-wrap items-center gap-3 rounded-lg border p-3">
        {entities.length === 0 ? (
          <span className="text-success text-sm">✓ Extraction up to date — no differences.</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => accept('all')}
              disabled={busy !== null}
              className="bg-accent text-accent-fg rounded-md px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {busy === 'all' ? '…' : 'Confirm the whole extraction'}
            </button>
            {soft > 0 && (
              <button
                type="button"
                onClick={() => accept('minor')}
                disabled={busy !== null}
                className="border-line hover:border-accent rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {busy === 'minor' ? '…' : `Apply minor changes (${soft})`}
              </button>
            )}
            <span className="text-content-subtle text-xs">
              {total} real difference(s)
              {buckets.minor > 0 && ` · ${buckets.minor} minor`}
              {buckets.typo > 0 && ` · ${buckets.typo} typo`}
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
          {(['all', 'new', 'diff', 'minor', 'typo', 'removed'] as const)
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
                {f === 'all' ? 'All' : BADGE[f].label} ({counts[f]})
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
              {integrateKind && (
                <button
                  type="button"
                  onClick={() => integrateRow(e.key)}
                  disabled={rowBusy !== null}
                  className="border-line hover:border-accent ml-auto rounded-md border px-2 py-0.5 text-xs disabled:opacity-50"
                >
                  {rowBusy === e.key ? '…' : e.status === 'removed' ? 'Remove' : 'Integrate'}
                </button>
              )}
            </div>
            {rowMsg[e.key] && (
              <p
                className={`mt-1 text-xs ${rowMsg[e.key].tone === 'ok' ? 'text-success' : 'text-danger'}`}
              >
                {rowMsg[e.key].text}
              </p>
            )}
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

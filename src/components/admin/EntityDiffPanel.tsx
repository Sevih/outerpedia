'use client';

import type { FieldDiff } from '@/lib/admin/review-types';
import { diffRoot, labelKey } from '@/lib/admin/diff-labels';
import { DiffHighlight } from './DiffHighlight';

/** Formate une valeur de feuille pour l'affichage (absent / texte / JSON). */
function fmt(v: unknown): string {
  if (v === undefined) return '(absent)';
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

/** Une valeur, suivie de son libellé humain quand c'est un id résolu. */
function Value({ v, label }: { v: unknown; label?: string }) {
  return (
    <>
      {fmt(v)}
      {label && <span className="text-content-subtle ml-1.5 font-normal">— {label}</span>}
    </>
  );
}

/** Une feuille modifiée : diff mot-à-mot pour du texte, sinon avant/après brut. */
function FieldRow({ d, labels }: { d: FieldDiff; labels?: Record<string, string> }) {
  const root = diffRoot(d.path);
  const labelOf = (v: unknown) => (typeof v === 'string' ? labels?.[labelKey(root, v)] : undefined);
  const before = labelOf(d.existing);
  const after = labelOf(d.extracted);
  // Deux textes → diff mot-à-mot. MAIS si les valeurs sont des ids résolus, le
  // mot-à-mot est illisible (« 132 » vs « 130 ») : on montre alors les libellés.
  const bothStrings = typeof d.existing === 'string' && typeof d.extracted === 'string';
  return (
    <div className="space-y-1">
      <p className="text-content-subtle font-mono text-xs">{d.path}</p>
      {bothStrings && !before && !after ? (
        <DiffHighlight existing={d.existing as string} extracted={d.extracted as string} />
      ) : (
        <div className="space-y-1 text-xs">
          <p className="bg-danger/5 text-danger rounded px-2 py-1 break-all">
            <span className="mr-1.5 font-semibold opacity-70">existant</span>
            <Value v={d.existing} label={before} />
          </p>
          <p className="bg-success/5 text-success rounded px-2 py-1 break-all">
            <span className="mr-1.5 font-semibold opacity-70">extrait</span>
            <Value v={d.extracted} label={after} />
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Écart d'extraction pour UNE entité, affiché sur sa fiche admin (là où on
 * intervient). La validation reste globale (accueil) car l'extraction est
 * déterministe : on accepte le fichier entier, pas une entité isolée.
 *
 * `labels` (cf. `diff-labels`) donne un nom aux valeurs qui sont des ids —
 * sans lui, un écart de liste de skills est indécidable.
 */
export function EntityDiffPanel({
  fields,
  labels,
  bare = false,
}: {
  fields: FieldDiff[];
  labels?: Record<string, string>;
  bare?: boolean;
}) {
  if (!fields.length) return null;
  // `bare` : feuilles seules (l'appelant fournit son propre cadre / son propre
  // libellé) — utilisé par la revue d'extraction générique (ExtractorReview).
  if (bare) {
    return (
      <div className="space-y-3">
        {fields.map((d) => (
          <FieldRow key={d.path} d={d} labels={labels} />
        ))}
      </div>
    );
  }
  return (
    <div className="border-warn/40 bg-warn/5 space-y-3 rounded-lg border p-3">
      <p className="text-warn text-xs font-semibold uppercase">
        Modification d&apos;extraction en attente — {fields.length} champ(s)
      </p>
      {fields.map((d) => (
        <FieldRow key={d.path} d={d} labels={labels} />
      ))}
      <p className="text-content-subtle text-xs">
        Si l&apos;extraction est correcte, intègre ce perso (bouton ci-dessous). Si elle est fausse,
        c&apos;est la spec d&apos;extraction qu&apos;il faut corriger.
      </p>
    </div>
  );
}

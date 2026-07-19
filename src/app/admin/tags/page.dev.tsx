import { collectTagOccurrences } from '@/lib/admin/tag-control';

export const dynamic = 'force-dynamic';

/**
 * CONTRÔLE DES TAGS INLINE (port de l'outil V2) : diagnostic détaillé — la
 * collecte vit dans `@/lib/admin/tag-control`, partagée avec le test vitest
 * BLOQUANT (`tag-control.test.ts`) qui fait sonner le pipeline avant tout
 * build si un tag n'a pas de correspondance.
 */
export default function AdminTagsPage() {
  const occurrences = collectTagOccurrences();
  const bad = occurrences.filter((o) => !o.ok);
  const byType = new Map<string, number>();
  for (const o of occurrences) byType.set(o.type, (byType.get(o.type) ?? 0) + 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Inline tag control</h1>
        <p className="text-content-muted text-sm">
          {occurrences.length} tags checked (
          {[...byType.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([t, n]) => `${t}:${n}`)
            .join(' · ')}
          ) — {bad.length} unmatched · BLOCKING check: vitest (tag-control.test.ts)
        </p>
      </div>

      {bad.length === 0 ? (
        <p className="border-success/40 bg-success/5 text-success rounded-lg border p-4 text-sm">
          ✓ All editorial content tags have a match.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-content-subtle text-left text-xs uppercase">
            <tr>
              <th className="py-1 pr-3 font-medium">Tag</th>
              <th className="py-1 pr-3 font-medium">Reason</th>
              <th className="py-1 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {bad.map((o, i) => (
              <tr key={i} className="border-line-subtle border-t">
                <td className="text-danger py-1 pr-3 font-mono text-xs">{o.tag}</td>
                <td className="text-content-muted py-1 pr-3">{o.reason}</td>
                <td className="text-content-subtle py-1 text-xs">{o.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

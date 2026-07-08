import Link from 'next/link';
import type { Route } from 'next';
import { v2MissingInV3 } from '@/lib/data/effects';

export const dynamic = 'force-dynamic';

/**
 * Extractor · Effect = contrôle anti-régression : chaque libellé V2 doit avoir
 * un équivalent V3 (curé inclus). La curation/catalogue vit côté Editor.
 */
export default function ExtractorEffectsControl() {
  const missing = v2MissingInV3();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-content-strong text-xl font-semibold">Extractor · Effect</h1>
          <p className="text-content-muted text-sm">
            Contrôle « régression vs V2 » — chaque libellé V2 doit avoir un équivalent V3.
          </p>
        </div>
        <Link
          href={'/admin/editor/effects' as Route}
          className="border-line bg-surface-raised hover:border-accent rounded-md border px-3 py-1.5 text-sm"
        >
          Catalogue &amp; curation (Editor) →
        </Link>
      </div>

      {missing.length === 0 ? (
        <p className="border-success/40 bg-success/5 text-success rounded-lg border p-4 text-sm">
          ✓ Aucune régression : tous les libellés V2 ont un équivalent V3.
        </p>
      ) : (
        <section className="border-danger/40 bg-danger/5 space-y-2 rounded-lg border p-4">
          <p className="text-danger text-sm font-semibold uppercase">
            Régression : {missing.length} effet(s) V2 sans équivalent V3
          </p>
          <p className="text-content-muted text-xs">
            Chaque ligne = un concept V2 introuvable dans les noms V3 (curé inclus). À combler par
            extraction (si la donnée de jeu l&apos;a) ou par curation (renommer un effet V3
            équivalent, ou créer l&apos;exception) côté Editor.
          </p>
          <table className="w-full text-sm">
            <thead className="text-content-subtle text-left text-xs uppercase">
              <tr>
                <th className="py-1 pr-3 font-medium">Libellé V2</th>
                <th className="py-1 pr-3 font-medium">Catégorie</th>
                <th className="py-1 pr-3 font-medium">Clé interne (name)</th>
                <th className="py-1 font-medium">Icône</th>
              </tr>
            </thead>
            <tbody>
              {missing.map((m, i) => (
                <tr key={i} className="border-line-subtle border-t">
                  <td className="text-content-strong py-1 pr-3">{m.label}</td>
                  <td className="text-content-muted py-1 pr-3">{m.category ?? '—'}</td>
                  <td className="text-content-subtle py-1 pr-3 font-mono text-xs">
                    {m.name ?? '—'}
                  </td>
                  <td className="text-content-subtle py-1 font-mono text-xs">{m.icon ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

import type { CatalogueReport } from '@/lib/admin/equipment-control';

/**
 * Rapport de contrôle d'un catalogue d'équipement vs l'oracle V2 (une famille).
 * Partagé par les pages Extractor par famille. `report = null` = pas d'oracle.
 */
export function EquipmentReport({
  title,
  report,
}: {
  title: string;
  report: CatalogueReport | null;
}) {
  const total = report ? report.issues.length + report.missingV3.length : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">{title}</h1>
        {report ? (
          <p className="text-content-muted text-sm">
            {report.v3Count} extraits V3 · {report.v2Count} oracle V2 ·{' '}
            {total === 0 ? (
              <span className="text-success">à jour</span>
            ) : (
              <span className="text-warn">
                {report.issues.length} écart(s)
                {report.missingV3.length
                  ? ` · ${report.missingV3.length} V2 sans équivalent V3`
                  : ''}
              </span>
            )}
          </p>
        ) : (
          <p className="text-content-subtle text-sm">Aucun oracle V2 pour cette catégorie.</p>
        )}
      </div>

      {report && total === 0 && (
        <p className="border-success/40 bg-success/5 text-success rounded-lg border p-4 text-sm">
          ✓ Aucun écart avec l&apos;oracle V2.
        </p>
      )}

      {report && report.missingV3.length > 0 && (
        <p className="text-danger text-xs">
          V2 sans équivalent V3 : {report.missingV3.join(' · ')}
        </p>
      )}

      {report && report.issues.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-content-subtle text-left text-xs uppercase">
              <tr>
                <th className="py-1 pr-3 font-medium">Item</th>
                <th className="py-1 pr-3 font-medium">Champ</th>
                <th className="py-1 pr-3 font-medium">V2</th>
                <th className="py-1 font-medium">V3</th>
              </tr>
            </thead>
            <tbody>
              {report.issues.map((i, k) => (
                <tr key={k} className="border-line-subtle border-t align-top">
                  <td className="text-content-strong py-1 pr-3">{i.item}</td>
                  <td className="text-warn py-1 pr-3 font-mono text-xs">{i.field}</td>
                  <td className="text-content-muted max-w-96 py-1 pr-3 text-xs">{i.v2}</td>
                  <td className="text-content-muted max-w-96 py-1 text-xs">{i.v3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
} from '@/lib/data/equipment';
import { equipmentV2Control } from '@/lib/admin/equipment-control';

export const dynamic = 'force-dynamic';

/**
 * ÉQUIPEMENT (admin) : état de l'EXTRACTION (tailles des catalogues affichés)
 * + CONTRÔLE V2 (diff champ par champ contre `data/legacy/equipment/*` —
 * identité, icônes, passifs, main stats, sets, chips d'EE).
 */
export default function AdminEquipmentPage() {
  const extraction = [
    ['armes (familles wiki)', getWeaponFamilies().length],
    ['amulettes', getAmuletFamilies().length],
    ['talismans', getTalismanFamilies().length],
    ['EE', getEEViews().length],
    ['sets', getSetViews('en').length],
  ] as const;
  const reports = equipmentV2Control();
  const totalIssues = reports.reduce((n, r) => n + r.issues.length + r.missingV3.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Équipement</h1>
        <p className="text-content-muted text-sm">
          Extraction : {extraction.map(([n, c]) => `${c} ${n}`).join(' · ')}
        </p>
      </div>

      {totalIssues === 0 ? (
        <p className="border-success/40 bg-success/5 text-success rounded-lg border p-4 text-sm">
          ✓ Aucun écart avec l&apos;oracle V2.
        </p>
      ) : (
        reports.map((r) => (
          <section key={r.name} className="space-y-2">
            <h2 className="text-content-strong text-sm font-semibold uppercase">
              {r.name}{' '}
              <span className="text-content-subtle font-normal normal-case">
                ({r.v3Count} V3 · {r.v2Count} V2 · {r.issues.length} écart(s)
                {r.missingV3.length ? ` · ${r.missingV3.length} V2 sans équivalent V3` : ''})
              </span>
            </h2>
            {r.missingV3.length > 0 && (
              <p className="text-danger text-xs">
                V2 sans équivalent V3 : {r.missingV3.join(' · ')}
              </p>
            )}
            {r.issues.length > 0 && (
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
                  {r.issues.map((i, k) => (
                    <tr key={k} className="border-line-subtle border-t align-top">
                      <td className="text-content-strong py-1 pr-3">{i.item}</td>
                      <td className="text-warn py-1 pr-3 font-mono text-xs">{i.field}</td>
                      <td className="text-content-muted max-w-96 py-1 pr-3 text-xs">{i.v2}</td>
                      <td className="text-content-muted max-w-96 py-1 text-xs">{i.v3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {r.issues.length === 0 && r.missingV3.length === 0 && (
              <p className="text-success text-xs">✓ raccord</p>
            )}
          </section>
        ))
      )}
    </div>
  );
}

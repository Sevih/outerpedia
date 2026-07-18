'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '@/lib/admin/post-json';
import type { EquipmentEntityKind } from '@/lib/admin/review-types';

interface Report {
  files: string[];
  assets: {
    staged: number;
    /** Images REFAITES : elles existaient déjà, mais leur source a changé. */
    restaged: number;
    present: number;
    missing: Array<{ key: string; reason: string }>;
  };
}

type Status =
  { kind: 'idle' | 'busy' } | { kind: 'ok'; report: Report } | { kind: 'err'; msg: string };

/**
 * Intègre CETTE entité d'équipement (lignes de la famille + records partagés +
 * images), sur clic explicite. Pendant gear de `IntegrateCharacterButton` :
 * affiche le rapport (fichiers écrits, images produites, manquants).
 */
export function IntegrateGearButton({
  kind,
  id,
  isNew,
}: {
  kind: EquipmentEntityKind;
  id: string;
  isNew: boolean;
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const router = useRouter();

  async function integrate() {
    setStatus({ kind: 'busy' });
    try {
      const data = await postJson<{ report?: Report }>(
        `/api/admin/integrate/equipment/${kind}/${encodeURIComponent(id)}`,
      );
      if (!data.report) throw new Error('Réponse sans rapport');
      setStatus({ kind: 'ok', report: data.report });
      router.refresh();
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={integrate}
        disabled={status.kind === 'busy'}
        className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {status.kind === 'busy'
          ? 'Intégration…'
          : isNew
            ? 'Intégrer (données + images)'
            : 'Ré-intégrer (appliquer l’extraction)'}
      </button>

      {status.kind === 'ok' && (
        <div className="border-success/40 bg-success/5 space-y-1 rounded-md border p-3 text-sm">
          <p className="text-success">
            ✓ Intégré — {status.report.files.join(', ')} · images : {status.report.assets.staged}{' '}
            produites
            {status.report.assets.restaged > 0 &&
              `, ${status.report.assets.restaged} refaites`}, {status.report.assets.present} déjà
            là. Committe via git, puis <code>pnpm assets:push</code>.
          </p>
          {status.report.assets.missing.length > 0 && (
            <ul className="text-warn text-xs">
              {status.report.assets.missing.map((m) => (
                <li key={m.key}>
                  ⚠ {m.key} — {m.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {status.kind === 'err' && <p className="text-danger text-sm">{status.msg}</p>}
    </div>
  );
}

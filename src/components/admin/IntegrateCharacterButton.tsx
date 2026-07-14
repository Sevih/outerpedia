'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
 * Intègre CE perso (données + images), sur clic explicite. Affiche le rapport :
 * fichiers écrits, images produites, manquants (avec raison).
 */
export function IntegrateCharacterButton({ id, isNew }: { id: string; isNew: boolean }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const router = useRouter();

  async function integrate() {
    setStatus({ kind: 'busy' });
    const res = await fetch(`/api/admin/integrate/character/${id}`, { method: 'POST' });
    const data = (await res.json().catch(() => ({}))) as { report?: Report; error?: string };
    if (res.ok && data.report) {
      setStatus({ kind: 'ok', report: data.report });
      router.refresh();
    } else {
      setStatus({ kind: 'err', msg: data.error ?? 'Échec intégration' });
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
            ? 'Intégrer ce perso (données + images)'
            : 'Ré-intégrer ce perso (appliquer l’extraction)'}
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

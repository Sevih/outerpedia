'use client';

import { useState } from 'react';

type Status = { kind: 'idle' | 'busy' | 'ok' | 'err'; msg?: string };

/**
 * Enregistre TOUT UN MODE DE JEU : chaque monstre spawnant dans un donjon du
 * mode + ses adds rattachés → data/generated (même geste que « Enregistrer »
 * d'une fiche, en lot). L'utilisateur committe ensuite via git.
 */
export function IntegrateModeButton({ modes }: { modes: Array<{ value: string; label: string }> }) {
  const [mode, setMode] = useState(modes[0]?.value ?? '');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function integrate() {
    setStatus({ kind: 'busy' });
    const res = await fetch(`/api/admin/integrate/monster-mode/${encodeURIComponent(mode)}`, {
      method: 'POST',
    });
    const data = (await res.json().catch(() => ({}))) as {
      report?: { ids: string[]; files: string[] };
      error?: string;
    };
    if (res.ok && data.report) {
      setStatus({
        kind: 'ok',
        msg: `${data.report.ids.length} monstre(s) écrits (${data.report.files.join(', ')}) — committe via git.`,
      });
    } else {
      setStatus({ kind: 'err', msg: data.error ?? 'Échec écriture' });
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="border-line-subtle bg-surface text-content rounded-md border px-2 py-1 text-xs"
      >
        {modes.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={integrate}
        disabled={status.kind === 'busy' || !mode}
        className="bg-accent text-accent-fg rounded-md px-3 py-1 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {status.kind === 'busy' ? 'Écriture…' : 'Enregistrer le mode'}
      </button>
      {status.kind === 'ok' && <span className="text-success text-xs">{status.msg}</span>}
      {status.kind === 'err' && <span className="text-danger text-xs">{status.msg}</span>}
    </span>
  );
}

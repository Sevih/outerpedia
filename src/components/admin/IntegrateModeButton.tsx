'use client';

import { useState } from 'react';
import { postJson } from '@/lib/admin/post-json';

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
    try {
      const data = await postJson<{ report?: { ids: string[]; files: string[] } }>(
        `/api/admin/integrate/monster-mode/${encodeURIComponent(mode)}`,
      );
      if (!data.report) throw new Error('Response without report');
      setStatus({
        kind: 'ok',
        msg: `${data.report.ids.length} monster(s) written (${data.report.files.join(', ')}) — commit via git.`,
      });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
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
        {status.kind === 'busy' ? 'Writing…' : 'Save mode'}
      </button>
      {status.kind === 'ok' && <span className="text-success text-xs">{status.msg}</span>}
      {status.kind === 'err' && <span className="text-danger text-xs">{status.msg}</span>}
    </span>
  );
}

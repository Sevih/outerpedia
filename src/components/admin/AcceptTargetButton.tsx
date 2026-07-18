'use client';

import { useState } from 'react';
import { postJson } from '@/lib/admin/post-json';

type Status = { kind: 'idle' | 'busy' | 'ok' | 'err'; msg?: string };

/**
 * Valide une cible : écrit l'extraction fraîche dans `data/generated/<file>`.
 * L'utilisateur committe ensuite via git. Validation par fichier (tout-ou-rien),
 * car l'extraction est déterministe.
 */
export function AcceptTargetButton({ id, file }: { id: string; file: string }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function accept() {
    setStatus({ kind: 'busy' });
    try {
      await postJson(`/api/admin/review/${id}`);
      setStatus({ kind: 'ok', msg: `${file} écrit — committe via git.` });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={accept}
        disabled={status.kind === 'busy'}
        className="bg-accent text-accent-fg rounded-md px-3 py-1 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {status.kind === 'busy' ? 'Écriture…' : 'Valider'}
      </button>
      {status.kind === 'ok' && <span className="text-success text-xs">{status.msg}</span>}
      {status.kind === 'err' && <span className="text-danger text-xs">{status.msg}</span>}
    </span>
  );
}

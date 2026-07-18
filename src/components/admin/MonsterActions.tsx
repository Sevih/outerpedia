'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '@/lib/admin/post-json';

interface IntegrateReport {
  files: string[];
}
interface VersionReport {
  key: string;
  name?: string;
  skills: number;
  ref: string;
  gameVersion?: string;
  file: string;
}

type Status =
  | { kind: 'idle' | 'busy' }
  | { kind: 'saved'; report: IntegrateReport }
  | { kind: 'versioned'; report: VersionReport }
  | { kind: 'err'; msg: string };

/**
 * Actions d'un monstre depuis sa fiche extracteur :
 *   - « Enregistrer » : écrit l'extraction fraîche de CE monstre (entité +
 *     skills) dans `data/generated` ;
 *   - « Versionner » : fige l'état COMMITTÉ (git HEAD) dans
 *     `monster-archive/<id>@<n>.json` — à faire AVANT d'enregistrer/committer
 *     une maj significative, pour que les guides épinglés restent justes.
 */
export function MonsterActions({
  id,
  isNew,
  canVersion,
}: {
  id: string;
  isNew: boolean;
  /** Faux si le monstre n'a jamais été committé (rien à figer). */
  canVersion: boolean;
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [label, setLabel] = useState('');
  const router = useRouter();

  async function save() {
    setStatus({ kind: 'busy' });
    try {
      const data = await postJson<{ report: IntegrateReport }>(
        `/api/admin/integrate/monster/${id}`,
      );
      setStatus({ kind: 'saved', report: data.report });
      router.refresh();
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  async function version() {
    setStatus({ kind: 'busy' });
    try {
      const data = await postJson<{ report: VersionReport }>(`/api/admin/version/monster/${id}`, {
        label,
      });
      setStatus({ kind: 'versioned', report: data.report });
      setLabel('');
      router.refresh();
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={status.kind === 'busy'}
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {status.kind === 'busy'
            ? '…'
            : isNew
              ? 'Enregistrer ce monstre (entité + skills)'
              : 'Enregistrer (appliquer l’extraction)'}
        </button>
        {canVersion && (
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={version}
              disabled={status.kind === 'busy'}
              className="border-line-subtle text-content hover:bg-surface-raised rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Versionner l’état committé
            </button>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="label (optionnel) : avant maj 1.11…"
              className="border-line-subtle bg-surface-base w-56 rounded-md border px-2 py-2 text-xs"
            />
          </span>
        )}
      </div>

      {status.kind === 'saved' && (
        <p className="border-success/40 bg-success/5 text-success rounded-md border p-3 text-sm">
          ✓ Enregistré — {status.report.files.join(', ')}. Committe via git.
        </p>
      )}
      {status.kind === 'versioned' && (
        <p className="border-success/40 bg-success/5 text-success rounded-md border p-3 text-sm">
          ✓ Figé sous <code>{status.report.key}</code>
          {status.report.name ? ` (${status.report.name})` : ''} — {status.report.skills} skill(s),
          source {status.report.ref}
          {status.report.gameVersion ? `, jeu ${status.report.gameVersion}` : ''}. Committe{' '}
          <code>{status.report.file}</code>.
        </p>
      )}
      {status.kind === 'err' && <p className="text-danger text-sm">{status.msg}</p>}
    </div>
  );
}

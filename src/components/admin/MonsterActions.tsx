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

/**
 * Ce que le ré-épinglage a fait aux guides. Redéclaré ici comme `VersionReport`
 * — le contrat de la route, vu du client.
 */
interface RepinReport {
  files: string[];
  applied: Array<{ guide: string; field: string }>;
  skipped: string[];
  pinnedVersions: string[];
  pending: Array<{ guide: string; origin: string; version?: string }>;
  kept: Array<{ guide: string; field: string; version?: string; reason: string }>;
}

type Status =
  | { kind: 'idle' | 'busy' }
  | { kind: 'saved'; report: IntegrateReport }
  | { kind: 'versioned'; report: VersionReport; repin: RepinReport }
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
      const data = await postJson<{ report: VersionReport; repin: RepinReport }>(
        `/api/admin/version/monster/${id}`,
        { label },
      );
      setStatus({ kind: 'versioned', report: data.report, repin: data.repin });
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
              ? 'Save this monster (entity + skills)'
              : 'Save (apply extraction)'}
        </button>
        {canVersion && (
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={version}
              disabled={status.kind === 'busy'}
              className="border-line-subtle text-content hover:bg-surface-raised rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Version the committed state
            </button>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="label (optional): before update 1.11…"
              className="border-line-subtle bg-surface-base w-56 rounded-md border px-2 py-2 text-xs"
            />
          </span>
        )}
      </div>

      {status.kind === 'saved' && (
        <p className="border-success/40 bg-success/5 text-success rounded-md border p-3 text-sm">
          ✓ Saved — {status.report.files.join(', ')}. Commit via git.
        </p>
      )}
      {status.kind === 'versioned' && (
        <div className="space-y-2 text-sm">
          <p className="border-success/40 bg-success/5 text-success rounded-md border p-3">
            ✓ Frozen under <code>{status.report.key}</code>
            {status.report.name ? ` (${status.report.name})` : ''} — {status.report.skills}{' '}
            skill(s), source {status.report.ref}
            {status.report.gameVersion ? `, game ${status.report.gameVersion}` : ''}. Commit{' '}
            <code>{status.report.file}</code>.
          </p>
          {/* Le ré-épinglage réécrit du CONTENU : ce qu'il a touché doit se lire,
              sinon on committe des guides modifiés sans le savoir. */}
          {status.repin.files.length > 0 && (
            <p className="border-success/40 bg-success/5 text-success rounded-md border p-3">
              ✓ Re-pinned {status.repin.applied.length} reference(s) in {status.repin.files.length}{' '}
              guide file(s) — commit them too:{' '}
              {status.repin.files.map((f) => (
                <code key={f} className="mr-1">
                  {f}
                </code>
              ))}
            </p>
          )}
          {/* Un guide versionné ne NOMME pas son boss : son pin vit dans le
              `config.json` de la version, qui est du contenu lui aussi. */}
          {status.repin.pinnedVersions.length > 0 && (
            <p className="border-success/40 bg-success/5 text-success rounded-md border p-3">
              ✓ Pinned in {status.repin.pinnedVersions.length} guide version(s) — commit their{' '}
              <code>config.json</code> too: {status.repin.pinnedVersions.join(', ')}
            </p>
          )}
          {/* Ce qui reste : un guide PLAT qui atteint le monstre par un combat
              n'a pas de version où poser le pin — et il suit le live par nature.
              Le taire ferait croire le geste complet alors qu'il ne l'est pas. */}
          {status.repin.pending.length > 0 && (
            <p className="border-warn/40 bg-warn/5 text-warn rounded-md border p-3">
              ⚠ {status.repin.pending.length} reference(s) reach this monster through an encounter
              group with no version to pin — those guides follow the live boss:{' '}
              {status.repin.pending
                .map((p) => `${p.guide}${p.version ? ` (${p.version})` : ''}`)
                .join(', ')}
            </p>
          )}
          {/* Laissé en live À DESSEIN : le dire, sinon l'absence du guide dans
              le compte-rendu se lit comme un oubli. */}
          {status.repin.kept.length > 0 && (
            <div className="border-line-subtle bg-surface-sunken text-content-muted space-y-1 rounded-md border p-3">
              <p>Left as is, on purpose:</p>
              {/* Le motif vient de CHAQUE entrée : il y en a deux (un
                  `meta.bossId` de guide versionné, une version déjà figée sur ce
                  monstre), et un texte unique ici mentirait sur l'autre. */}
              <ul className="list-disc space-y-0.5 pl-5">
                {status.repin.kept.map((k, i) => (
                  <li key={`${k.guide}-${k.field}-${k.version ?? ''}-${i}`}>
                    <code>
                      {k.guide}
                      {k.version ? ` (${k.version})` : ''}
                    </code>{' '}
                    · {k.field} — {k.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {status.repin.skipped.length > 0 && (
            <p className="border-danger/40 bg-danger/5 text-danger rounded-md border p-3">
              ✗ Could not write: {status.repin.skipped.join(', ')}
            </p>
          )}
        </div>
      )}
      {status.kind === 'err' && <p className="text-danger text-sm">{status.msg}</p>}
    </div>
  );
}

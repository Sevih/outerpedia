'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '@/lib/admin/post-json';

type Status = { kind: 'idle' | 'busy' | 'ok' | 'err'; msg?: string };

/** Bilan d'images d'une écriture (persos, monstres, équipement), tel que la route le rend. */
interface Assets {
  staged: number;
  restaged: number;
  present: number;
  missing: Array<{ key: string; reason: string }>;
}

const assetsSummary = (a?: Assets): string =>
  a
    ? ` · images: ${a.staged} produced, ${a.restaged} remade, ${a.present} already there` +
      (a.missing.length ? `, ${a.missing.length} missing` : '')
    : '';

/**
 * Valide une cible : écrit l'extraction fraîche dans `data/generated/<file>`.
 * L'utilisateur committe ensuite via git. Validation par fichier (tout-ou-rien),
 * car l'extraction est déterministe. En mode `minor`, n'applique QUE les
 * retouches mineures et les coquilles (cf. `acceptMinor`), et dit combien
 * d'entités de chaque sorte sont passées. Sur les cibles des persos, des
 * monstres et de l'équipement, les deux modes mettent en place les images des
 * entités déjà validées modifiées (costume ajouté → son full art) — le bilan
 * suit le message.
 */
export function AcceptTargetButton({
  id,
  file,
  mode = 'all',
  label,
}: {
  id: string;
  file: string;
  mode?: 'all' | 'minor';
  /** Libellé du bouton (défaut : « Confirm »). */
  label?: string;
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const router = useRouter();

  async function accept() {
    setStatus({ kind: 'busy' });
    try {
      const res = await postJson<{ typo?: number; minor?: number; assets?: Assets }>(
        `/api/admin/review/${id}`,
        mode === 'minor' ? { mode: 'minor' } : undefined,
      );
      setStatus({
        kind: 'ok',
        msg:
          (mode === 'minor'
            ? `${res.minor ?? 0} minor + ${res.typo ?? 0} typo applied in ${file}`
            : `${file} written`) +
          assetsSummary(res.assets) +
          ' — commit via git.',
      });
      router.refresh();
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
        {status.kind === 'busy' ? 'Writing…' : (label ?? 'Confirm')}
      </button>
      {status.kind === 'ok' && <span className="text-success text-xs">{status.msg}</span>}
      {status.kind === 'err' && <span className="text-danger text-xs">{status.msg}</span>}
    </span>
  );
}

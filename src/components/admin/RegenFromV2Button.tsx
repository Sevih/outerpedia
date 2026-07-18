'use client';

import { useState } from 'react';
import { postJson } from '@/lib/admin/post-json';

/**
 * Bouton d'import ponctuel depuis le repo V2 voisin (écrase la copie V3).
 * Rend la donnée importée au parent pour rafraîchir l'éditeur.
 */
export function RegenFromV2Button({
  kind,
  onRegen,
}: {
  kind: 'coupons' | 'banners';
  onRegen: (data: unknown[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function regen() {
    if (!confirm('Écraser la liste actuelle avec la donnée V2 ?')) return;
    setBusy(true);
    setMsg(null);
    try {
      const json = await postJson<{ ok?: boolean; data?: unknown[]; error?: string }>(
        '/api/admin/tools/regen-v2',
        { kind },
      );
      if (json.ok && json.data) {
        onRegen(json.data);
        setMsg(`Importé depuis V2 (${json.data.length})`);
      } else {
        setMsg(json.error ?? 'Échec import');
      }
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={regen}
        disabled={busy}
        className="border-line hover:border-accent rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {busy ? 'Import…' : 'Regen depuis V2'}
      </button>
      {msg && <span className="text-content-subtle text-xs">{msg}</span>}
    </span>
  );
}

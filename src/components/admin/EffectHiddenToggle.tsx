'use client';

import { useState } from 'react';
import type { EffectCurated } from '@contracts';

/**
 * Bascule « ignoré du live » d'un effet, directement depuis la fiche perso
 * admin (évite l'aller-retour vers /admin/effects). Écrit l'override curé en
 * préservant les autres champs.
 */
export function EffectHiddenToggle({
  effectId,
  curated,
  initialHidden,
}: {
  effectId: string;
  curated: EffectCurated;
  initialHidden: boolean;
}) {
  const [hidden, setHidden] = useState(initialHidden);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function toggle(next: boolean) {
    setBusy(true);
    setError(false);
    const body: EffectCurated = { ...curated };
    if (next) body.hidden = true;
    else delete body.hidden;
    const res = await fetch(`/api/admin/curated/effects/${effectId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) setHidden(next);
    else setError(true);
  }

  return (
    <label
      className={`flex items-center gap-1.5 text-xs ${hidden ? 'text-danger' : 'text-content-subtle'}`}
    >
      <input
        type="checkbox"
        checked={hidden}
        disabled={busy}
        onChange={(e) => toggle(e.target.checked)}
      />
      ignoré (live)
      {error && <span className="text-danger">échec</span>}
    </label>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

/**
 * Création d'un effet : on choisit l'id (conseillé = la clé éditoriale
 * principale, ex. `UNCOUNTERABLE`) puis on remplit le formulaire vierge
 * sur /admin/effects/[id].
 */
export function NewEffectForm() {
  const router = useRouter();
  const [id, setId] = useState('');
  const slug = id.trim().toUpperCase().replace(/\s+/g, '_');

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (slug) router.push(`/admin/effects/${encodeURIComponent(slug)}` as Route);
      }}
    >
      <input
        className="border-line bg-surface-base text-content focus:border-accent w-56 rounded-md border px-3 py-1.5 font-mono text-xs focus:outline-none"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="ID (ex. UNCOUNTERABLE)"
      />
      <button
        type="submit"
        disabled={!slug}
        className="bg-accent text-accent-fg rounded-md px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
      >
        Créer un effet
      </button>
    </form>
  );
}

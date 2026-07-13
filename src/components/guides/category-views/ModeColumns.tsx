'use client';

import { useState, type ReactNode } from 'react';

/**
 * Colonnes par MODE (portage V2) : côte à côte en desktop, onglets en mobile.
 *
 * Le contenu des colonnes est rendu CÔTÉ SERVEUR et passé en `ReactNode` —
 * l'état client ne porte que l'onglet actif. Générique sur le nombre de
 * sections (la V2 figeait deux onglets en dur).
 */
export function ModeColumns({
  sections,
}: {
  sections: { key: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-6">
      {/* Onglets — mobile seulement */}
      <div className="flex justify-center gap-2 lg:hidden">
        {sections.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setActive(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              i === active
                ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300'
                : 'border-line bg-surface-overlay text-content hover:bg-line'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Mobile : la colonne de l'onglet actif */}
      <div className="lg:hidden">{sections[active]?.content}</div>

      {/* Desktop : toutes les colonnes côte à côte */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        {sections.map((s) => (
          <section key={s.key}>
            <h2 className="mb-3">{s.label}</h2>
            {s.content}
          </section>
        ))}
      </div>
    </div>
  );
}

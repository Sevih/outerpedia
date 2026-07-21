'use client';

import { useState, type ReactNode } from 'react';

/**
 * Colonnes par MODE (portage V2) : côte à côte en desktop, onglets en mobile.
 *
 * Le contenu des colonnes est rendu CÔTÉ SERVEUR et passé en `ReactNode` —
 * l'état client ne porte que l'onglet actif. Générique sur le nombre de
 * sections (la V2 figeait deux onglets en dur).
 *
 * UNE SEULE INSTANCE de chaque colonne dans le DOM (refonte 2026-07-21) : la
 * version précédente rendait un bloc mobile (l'onglet actif) PLUS un bloc
 * desktop (toutes les colonnes), donc la colonne active deux fois — sur
 * `/guides/special-request`, 15 cartes-bannières sérialisées pour 10 affichées.
 * Ici le contenu n'existe qu'une fois et c'est le CSS qui décide : en mobile,
 * seule la colonne active est visible ; en desktop (`lg`), la grille les
 * montre toutes. Le titre de colonne suit la même règle — en mobile l'onglet
 * en tient lieu, il reste donc masqué mais présent pour les lecteurs d'écran.
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
            aria-pressed={i === active}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              i === active
                ? 'border-select/50 bg-select/10 text-select-fg'
                : 'border-line bg-surface-overlay text-content hover:bg-line'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {sections.map((s, i) => (
          <section key={s.key} className={i === active ? undefined : 'hidden lg:block'}>
            {/* Titre porté par l'onglet en mobile : masqué à l'œil, gardé pour
                l'a11y (la section reste nommée quelle que soit la largeur). */}
            <h2 className="sr-only mb-3 lg:not-sr-only">{s.label}</h2>
            {s.content}
          </section>
        ))}
      </div>
    </div>
  );
}

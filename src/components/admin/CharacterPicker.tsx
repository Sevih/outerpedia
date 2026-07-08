'use client';

import { useMemo, useState } from 'react';
import { img } from '@/lib/images';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

export interface CharOption {
  id: string;
  name: string;
  element?: string;
  class?: string;
  rarity?: number;
}

/**
 * Sélecteur de personnage par NOM (l'id est renseigné automatiquement depuis la
 * sélection). Aperçu portrait (`FI_{id}`). Un id legacy hors data V3 reste
 * affiché par sa face + son nom.
 */
export function CharacterPicker({
  options,
  id,
  name,
  onSelect,
}: {
  options: CharOption[];
  id: string;
  name: string;
  onSelect: (c: { id: string; name: string }) => void;
}) {
  const [query, setQuery] = useState('');
  const selected = useMemo(() => options.find((o) => o.id === id), [options, id]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 20);
  }, [options, query]);

  if (id) {
    return (
      <div className="flex items-center gap-2">
        {selected ? (
          <CharacterPortrait
            id={selected.id}
            name={selected.name}
            element={selected.element}
            classType={selected.class}
            rarity={selected.rarity}
            size={44}
          />
        ) : (
          <span className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={img.face(id)}
              alt={name || id}
              className="border-line-subtle h-11 w-11 rounded-lg border object-cover"
            />
            <span className="text-content-subtle max-w-24 truncate text-xs">{name || id}</span>
          </span>
        )}
        <button
          type="button"
          className="text-content-subtle text-xs hover:underline"
          onClick={() => onSelect({ id: '', name: '' })}
          title="Changer de perso"
        >
          changer
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-w-56">
      <input
        className="border-line bg-surface-base text-content focus:border-accent w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Chercher un perso…"
      />
      {matches.length > 0 && (
        <ul className="border-line bg-surface-raised absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border shadow-lg">
          {matches.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className="hover:bg-surface-overlay flex w-full items-center gap-2 px-2 py-1 text-left text-sm"
                onClick={() => {
                  onSelect({ id: o.id, name: o.name });
                  setQuery('');
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                <img
                  src={img.face(o.id)}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded object-cover"
                />
                <span className="text-content min-w-0 flex-1 truncate">{o.name}</span>
                <span className="text-content-subtle font-mono text-[10px]">{o.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

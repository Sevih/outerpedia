'use client';

import { useMemo, useState, type ReactNode } from 'react';

/**
 * Châssis de sélecteur cherchable (admin) : champ de recherche → liste de
 * candidats → aperçu de la valeur posée + bouton « changer ». Générique sur le
 * type d'option — les spécificités (filtre/classement, icône de ligne, aperçu
 * du sélectionné) arrivent en callbacks. Factorise CharacterPicker ↔ ItemPicker,
 * qui ne différaient que par ces trois points.
 */
export function SearchPicker<T>({
  options,
  value,
  idOf,
  nameOf,
  search,
  renderIcon,
  renderSelected,
  onPick,
  onClear,
  placeholder,
  changeTitle = 'Change',
  className = 'min-w-56',
}: {
  options: T[];
  /** Id sélectionné (vide = mode recherche). */
  value: string;
  idOf: (o: T) => string;
  nameOf: (o: T) => string;
  /** Filtre + classement des candidats pour une requête non vide. */
  search: (options: T[], query: string) => T[];
  /** Icône (à gauche) d'une ligne de résultat. */
  renderIcon: (o: T) => ReactNode;
  /** Aperçu de la valeur posée ; `o` undefined = id absent des options (legacy). */
  renderSelected: (o: T | undefined) => ReactNode;
  onPick: (o: T) => void;
  onClear: () => void;
  placeholder: string;
  changeTitle?: string;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const selected = useMemo(() => options.find((o) => idOf(o) === value), [options, value, idOf]);
  const matches = useMemo(
    () => (query.trim() ? search(options, query.trim()) : []),
    [options, query, search],
  );

  if (value) {
    return (
      <div className="flex items-center gap-2">
        {renderSelected(selected)}
        <button
          type="button"
          className="text-content-subtle text-xs hover:underline"
          onClick={onClear}
          title={changeTitle}
        >
          changer
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        className="border-line bg-surface-base text-content focus:border-accent w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      {matches.length > 0 && (
        <ul className="border-line bg-surface-raised absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border shadow-lg">
          {matches.map((o) => (
            <li key={idOf(o)}>
              <button
                type="button"
                className="hover:bg-surface-overlay flex w-full items-center gap-2 px-2 py-1 text-left text-sm"
                onClick={() => {
                  onPick(o);
                  setQuery('');
                }}
              >
                {renderIcon(o)}
                <span className="text-content min-w-0 flex-1 truncate">{nameOf(o)}</span>
                <span className="text-content-subtle font-mono text-[10px]">{idOf(o)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

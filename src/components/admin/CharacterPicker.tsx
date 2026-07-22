'use client';

import { img } from '@/lib/images';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { SearchPicker } from './SearchPicker';

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
 * affiché par sa face + son nom. Adaptateur de `SearchPicker`.
 *
 * `compact` : aperçu sur UNE ligne (petite face + nom en clair) — pour les
 * tables denses (bannières), où le nom sous un portrait de 44px se tronque.
 */
export function CharacterPicker({
  options,
  id,
  name,
  onSelect,
  compact = false,
}: {
  options: CharOption[];
  id: string;
  name: string;
  onSelect: (c: { id: string; name: string }) => void;
  compact?: boolean;
}) {
  return (
    <SearchPicker
      options={options}
      value={id}
      idOf={(o) => o.id}
      nameOf={(o) => o.name}
      search={(opts, q) =>
        opts.filter((o) => o.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20)
      }
      renderIcon={(o) => (
        <img
          src={img.face(o.id)}
          alt=""
          aria-hidden
          className="h-6 w-6 shrink-0 rounded object-cover"
          width={24}
          height={24}
        />
      )}
      renderSelected={(o) =>
        compact ? (
          <span className="flex min-w-0 items-center gap-2">
            <img
              src={img.face(id)}
              alt=""
              aria-hidden
              className="border-line-subtle h-9 w-9 shrink-0 rounded-lg border object-cover"
              width={36}
              height={36}
            />
            <span className="text-content min-w-0 truncate text-sm">{o?.name || name || id}</span>
          </span>
        ) : o ? (
          <CharacterPortrait
            id={o.id}
            name={o.name}
            element={o.element}
            classType={o.class}
            rarity={o.rarity}
            size={44}
          />
        ) : (
          <span className="flex flex-col items-center">
            <img
              src={img.face(id)}
              alt={name || id}
              className="border-line-subtle h-11 w-11 rounded-lg border object-cover"
              width={44}
              height={44}
            />
            <span className="text-content-subtle max-w-24 truncate text-xs">{name || id}</span>
          </span>
        )
      }
      onPick={(o) => onSelect({ id: o.id, name: o.name })}
      onClear={() => onSelect({ id: '', name: '' })}
      placeholder="Search a character…"
      changeTitle="Change character"
    />
  );
}

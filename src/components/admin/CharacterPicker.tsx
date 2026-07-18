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
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img src={img.face(o.id)} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
      )}
      renderSelected={(o) =>
        o ? (
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
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={img.face(id)}
              alt={name || id}
              className="border-line-subtle h-11 w-11 rounded-lg border object-cover"
            />
            <span className="text-content-subtle max-w-24 truncate text-xs">{name || id}</span>
          </span>
        )
      }
      onPick={(o) => onSelect({ id: o.id, name: o.name })}
      onClear={() => onSelect({ id: '', name: '' })}
      placeholder="Chercher un perso…"
      changeTitle="Changer de perso"
    />
  );
}

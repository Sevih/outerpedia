'use client';

/**
 * Puces de personnages éditables (portraits + retrait) avec ajout par nom via
 * une datalist partagée. Les persos sont désignés par NOM D'AFFICHAGE EN (clé
 * du contenu éditorial des guides). Brique commune aux éditeurs admin (reco,
 * slots d'équipe, sources de héros, reviews…).
 */
import { useState } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import type { CharOption } from '@/components/admin/CharacterPicker';

const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

/** Datalist des noms EN à poser une fois par page (référencée par `datalistId`). */
export function CharacterNameDatalist({ id, options }: { id: string; options: CharOption[] }) {
  return (
    <datalist id={id}>
      {options.map((c) => (
        <option key={c.id} value={c.name} />
      ))}
    </datalist>
  );
}

export function CharacterChips({
  names,
  charByName,
  datalistId,
  onChange,
  size = 48,
}: {
  names: string[];
  charByName: Map<string, CharOption>;
  datalistId: string;
  onChange: (names: string[]) => void;
  size?: number;
}) {
  const [add, setAdd] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2">
      {names.map((n, i) => {
        const c = charByName.get(n);
        return (
          <div key={i} className="relative">
            {c ? (
              <CharacterPortrait
                id={c.id}
                name={c.name}
                element={c.element}
                classType={c.class}
                rarity={c.rarity}
                size={size}
              />
            ) : (
              <div className="border-line-subtle text-content-subtle flex h-12 w-12 items-center justify-center rounded-lg border p-1 text-center text-[10px]">
                {n || '?'}
              </div>
            )}
            <button
              type="button"
              title="Remove"
              className="border-line bg-surface-raised text-danger absolute -top-1.5 -right-1.5 rounded-full border px-1 text-xs"
              onClick={() => onChange(names.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        );
      })}
      <input
        className={`${input} h-9 w-36`}
        list={datalistId}
        placeholder="+ hero…"
        value={add}
        onChange={(e) => setAdd(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const raw = add.trim();
          if (raw) onChange([...names, raw]);
          setAdd('');
        }}
      />
    </div>
  );
}

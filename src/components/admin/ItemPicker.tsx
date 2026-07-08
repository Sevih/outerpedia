'use client';

import { useMemo, useState } from 'react';
import { img } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';
import type { ItemOption } from '@/lib/data/items';

const inline = (o: ItemOption) => ({
  name: o.name,
  iconSrc: o.icon ? img.item(o.icon) : '',
  grade: o.grade,
  desc: o.desc,
});

/** Tuile simple (cadre + icône) — sans bouton, utilisable dans une option cliquable. */
function Tile({ o }: { o: ItemOption }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: 18, height: 18 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img src={img.slotFrame(o.grade)} alt="" className="absolute inset-0 h-full w-full" />
      {o.icon && (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img
          src={img.item(o.icon)}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
    </span>
  );
}

/**
 * Sélecteur d'item : recherche par nom dans la data items (id stocké), aperçu
 * `ItemInline`. Une valeur non résolue (id inconnu / reste d'un import V2 par
 * nom) reste éditable et re-cherchable.
 */
export function ItemPicker({
  options,
  value,
  onChange,
}: {
  options: ItemOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const selected = useMemo(() => options.find((o) => o.id === value), [options, value]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 20);
  }, [options, query]);

  // Valeur posée (résolue ou non) : aperçu + bouton pour re-chercher.
  if (value) {
    return (
      <div className="flex items-center gap-2">
        {selected ? (
          <ItemInline item={inline(selected)} size={18} />
        ) : (
          <span className="text-warn text-xs italic">{value} (non résolu)</span>
        )}
        <button
          type="button"
          className="text-content-subtle text-xs hover:underline"
          onClick={() => onChange('')}
          title="Changer d'item"
        >
          changer
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-w-56 flex-1">
      <input
        className="border-line bg-surface-base text-content focus:border-accent w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Chercher un item…"
      />
      {matches.length > 0 && (
        <ul className="border-line bg-surface-raised absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border shadow-lg">
          {matches.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className="hover:bg-surface-overlay flex w-full items-center gap-2 px-2 py-1 text-left text-sm"
                onClick={() => {
                  onChange(o.id);
                  setQuery('');
                }}
              >
                {o.icon ? <Tile o={o} /> : <span aria-hidden>🪙</span>}
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

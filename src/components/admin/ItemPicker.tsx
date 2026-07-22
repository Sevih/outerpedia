'use client';

import { img } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';
import type { ItemOption } from '@/lib/data/items';
import { SearchPicker } from './SearchPicker';

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
      <img
        src={img.slotFrame(o.grade)}
        alt=""
        aria-hidden
        width={18}
        height={18}
        className="absolute inset-0 h-full w-full"
      />
      {o.icon && (
        <img
          src={img.item(o.icon)}
          alt=""
          aria-hidden
          width={18}
          height={18}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
    </span>
  );
}

/** Rang : nom exact > commence par > contient ; puis nom le plus court. Sans ça,
 * une monnaie courte (« Gold ») est noyée sous les coffres qui la contiennent. */
function searchItems(options: ItemOption[], query: string): ItemOption[] {
  const q = query.toLowerCase();
  const rank = (name: string) => {
    const n = name.toLowerCase();
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    return 2;
  };
  return options
    .filter((o) => o.name.toLowerCase().includes(q))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.length - b.name.length)
    .slice(0, 20);
}

/**
 * Sélecteur d'item : recherche par nom dans la data items (id stocké), aperçu
 * `ItemInline`. Une valeur non résolue (id inconnu / reste d'un import V2 par
 * nom) reste éditable et re-cherchable. Adaptateur de `SearchPicker`.
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
  return (
    <SearchPicker
      options={options}
      value={value}
      idOf={(o) => o.id}
      nameOf={(o) => o.name}
      search={searchItems}
      className="min-w-56 flex-1"
      renderIcon={(o) => (o.icon ? <Tile o={o} /> : <span aria-hidden>🪙</span>)}
      renderSelected={(o) =>
        o ? (
          <ItemInline item={inline(o)} size={18} />
        ) : (
          <span className="text-warn text-xs italic">{value} (unresolved)</span>
        )
      }
      onPick={(o) => onChange(o.id)}
      onClear={() => onChange('')}
      placeholder="Search an item…"
      changeTitle="Change item"
    />
  );
}

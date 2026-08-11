'use client';

import { SearchPicker } from './SearchPicker';

export interface GroupOption {
  group: string;
  label: string;
  /** Portrait du boss — reconnaître vaut mieux que lire une ligne d'homonymes. */
  icon?: string;
}

/**
 * Sélecteur de COMBAT (`DungeonRef.group`) par libellé — « le monstre » d'un
 * guide de boss. On ne choisit que parmi les combats existants (cf.
 * `listGroups`) : un group inventé casserait le rendu. Adaptateur de `SearchPicker`.
 */
export function GroupPicker({
  options,
  value,
  onSelect,
}: {
  options: GroupOption[];
  value: string;
  onSelect: (group: string) => void;
}) {
  return (
    <SearchPicker
      options={options}
      value={value}
      idOf={(o) => o.group}
      nameOf={(o) => o.label}
      search={(opts, q) =>
        opts.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 25)
      }
      renderIcon={(o) =>
        o.icon ? (
          <img src={o.icon} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
        ) : null
      }
      renderSelected={(o) =>
        o ? (
          <span className="text-content flex items-center gap-2 text-sm font-medium">
            {o.icon && (
              <img src={o.icon} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
            )}
            {o.label}
          </span>
        ) : (
          <span className="text-content-subtle font-mono text-xs">{value || '—'}</span>
        )
      }
      onPick={(o) => onSelect(o.group)}
      onClear={() => onSelect('')}
      placeholder="Search a battle…"
      changeTitle="Change battle"
    />
  );
}

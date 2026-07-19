'use client';

import { SearchPicker } from './SearchPicker';

export interface IdLabel {
  id: string;
  label: string;
}

/**
 * Sélecteur générique par libellé sur une liste `{ id, label }` — donjon
 * (`meta.dungeons`), monstre/boss (`meta.bossId`). On ne choisit que parmi la
 * donnée réelle. Adaptateur de `SearchPicker`.
 */
export function IdLabelPicker({
  options,
  value,
  onSelect,
  placeholder = 'Chercher…',
}: {
  options: IdLabel[];
  value: string;
  onSelect: (id: string) => void;
  placeholder?: string;
}) {
  return (
    <SearchPicker
      options={options}
      value={value}
      idOf={(o) => o.id}
      nameOf={(o) => o.label}
      search={(opts, q) =>
        opts.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 25)
      }
      renderIcon={() => null}
      renderSelected={(o) =>
        o ? (
          <span className="text-content text-sm font-medium">{o.label}</span>
        ) : (
          <span className="text-content-subtle font-mono text-xs">{value || '—'}</span>
        )
      }
      onPick={(o) => onSelect(o.id)}
      onClear={() => onSelect('')}
      placeholder={placeholder}
      changeTitle="Changer"
    />
  );
}

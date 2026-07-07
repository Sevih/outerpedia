'use client';

import { useMemo, useState } from 'react';
import { ResponsiveCharacterCard } from './ResponsiveCharacterCard';

/** Ligne allégée pour l'affichage en carte/liste. */
export interface CharacterRow {
  id: string;
  slug: string;
  /** Nom complet localisé (préfixe Core Fusion / surnom inclus). */
  name: string;
  /** Préfixe de titre (affiché au-dessus du nom sur la carte). */
  prefix?: string | null;
  element: string;
  class: string;
  rarity: number;
  isFusion: boolean;
  /** Tags éditoriaux (premium/limited/…) + `core-fusion` (icône de carte). */
  tags: string[];
  rank?: string;
  role?: string;
}

const field =
  'rounded-md border border-line bg-surface-base px-2 py-1.5 text-sm text-content focus:border-accent focus:outline-none';

/** Valeurs distinctes triées d'un champ. */
function distinct(rows: CharacterRow[], key: keyof CharacterRow): string[] {
  return [...new Set(rows.map((r) => r[key]).filter(Boolean) as string[])].sort();
}

export function CharactersBrowser({ rows }: { rows: CharacterRow[] }) {
  const [element, setElement] = useState('');
  const [klass, setKlass] = useState('');
  const [role, setRole] = useState('');
  const [rarity, setRarity] = useState(0);
  const [q, setQ] = useState('');

  const elements = useMemo(() => distinct(rows, 'element'), [rows]);
  const classes = useMemo(() => distinct(rows, 'class'), [rows]);
  const roles = useMemo(() => distinct(rows, 'role'), [rows]);
  const rarities = useMemo(
    () => [...new Set(rows.map((r) => r.rarity))].sort((a, b) => b - a),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!element || r.element === element) &&
        (!klass || r.class === klass) &&
        (!role || r.role === role) &&
        (!rarity || r.rarity === rarity) &&
        (!needle || r.name.toLowerCase().includes(needle)),
    );
  }, [rows, element, klass, role, rarity, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${field} w-44`}
          placeholder="Rechercher…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={field} value={element} onChange={(e) => setElement(e.target.value)}>
          <option value="">Élément</option>
          {elements.map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </select>
        <select className={field} value={klass} onChange={(e) => setKlass(e.target.value)}>
          <option value="">Classe</option>
          {classes.map((cl) => (
            <option key={cl} value={cl}>
              {cl}
            </option>
          ))}
        </select>
        <select className={field} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Rôle</option>
          {roles.map((ro) => (
            <option key={ro} value={ro}>
              {ro}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          {rarities.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRarity(rarity === r ? 0 : r)}
              className={`rounded-md border px-2 py-1 text-xs ${
                rarity === r
                  ? 'border-accent text-accent'
                  : 'border-line text-content-subtle hover:text-content'
              }`}
            >
              {r}★
            </button>
          ))}
        </div>
        <span className="text-content-subtle ml-auto text-xs">{filtered.length} persos</span>
      </div>

      <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
        {filtered.map((row, i) => (
          <ResponsiveCharacterCard
            key={row.id}
            id={row.id}
            name={row.name}
            prefix={row.prefix}
            element={row.element}
            classType={row.class}
            rarity={row.rarity}
            tags={row.tags}
            href={`/characters/${row.slug}`}
            priority={i <= 5}
          />
        ))}
      </div>
    </div>
  );
}

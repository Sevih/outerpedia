'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { FilterPill } from '@/components/character/filters/FilterPill';
import type { GearCategory } from './usage';

/** Perso résolu (nom localisé côté serveur) d'une ligne dépliée. */
export interface GearUsageChar {
  id: string;
  slug: string;
  name: string;
}

/** Ligne du classement d'une catégorie (déjà triée par count décroissant). */
export interface GearUsageRow {
  key: string;
  name: string;
  /** Noms recherchables (toutes langues), déjà normalisés. */
  searchNames: string[];
  icon: string;
  grade: string;
  star?: number;
  overlayIcon?: string;
  classType?: string;
  count: number;
  characters: GearUsageChar[];
}

export interface GearUsageLabels {
  disclaimer: string;
  searchPlaceholder: string;
  /** Libellés d'onglet par catégorie. */
  tabs: Record<GearCategory, string>;
  /** Unité du compteur par ligne (« characters »). */
  charsUnit: string;
}

const CATEGORIES: GearCategory[] = ['weapon', 'amulet', 'set', 'talisman'];

/**
 * Statistiques d'usage des équipements (portage V2) : onglets
 * armes/accessoires/sets/talismans, recherche, lignes classées avec barre
 * proportionnelle au perso-count, dépliables sur la liste des persos dont un
 * build recommande la pièce. État local pur (pas de sync URL — parité V2, un
 * classement se consulte, il ne se partage pas filtré).
 */
export function GearUsageBrowser({
  data,
  labels,
}: {
  data: Record<GearCategory, GearUsageRow[]>;
  labels: GearUsageLabels;
}) {
  const [category, setCategory] = useState<GearCategory>('weapon');
  const [q, setQ] = useState('');
  const query = useDeferredValue(q);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const entries = useMemo(() => {
    const list = data[category];
    const needle = query.normalize('NFKC').toLowerCase().trim();
    if (!needle) return list;
    return list.filter((e) => e.searchNames.some((n) => n.includes(needle)));
  }, [data, category, query]);

  // Liste triée par count décroissant → le premier porte le max (base des barres).
  const maxCount = entries.length > 0 ? entries[0].count : 1;

  return (
    <div className="mx-auto max-w-250 space-y-4">
      {/* Note de méthode */}
      <div className="text-content-muted rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-center text-sm">
        {labels.disclaimer}
      </div>

      {/* Onglets de catégorie */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            active={category === cat}
            onClick={() => {
              setCategory(cat);
              setExpandedKey(null);
            }}
            className="h-9 px-4"
          >
            <span className="flex items-center gap-1.5">
              {labels.tabs[cat]}
              <span className="text-content-subtle text-[10px]">({data[cat].length})</span>
            </span>
          </FilterPill>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative mx-auto flex max-w-md items-center">
        <svg
          className="text-content-subtle pointer-events-none absolute left-3 size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="border-line-subtle bg-surface-sunken/70 text-content placeholder:text-content-subtle focus:border-accent h-9 w-full rounded-lg border pr-8 pl-9 text-sm focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="clear"
            className="text-content-subtle hover:text-content-strong absolute right-2"
          >
            ×
          </button>
        )}
      </div>

      {/* Classement */}
      <div className="space-y-1.5">
        {entries.map((entry, index) => {
          const isExpanded = expandedKey === entry.key;
          const barWidth = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
          return (
            <div key={entry.key}>
              <button
                type="button"
                onClick={() => setExpandedKey(isExpanded ? null : entry.key)}
                className={`border-line-subtle flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                  isExpanded
                    ? 'bg-surface-raised/80 rounded-b-none'
                    : 'bg-surface-raised/40 hover:bg-surface-raised/80'
                }`}
              >
                {/* Rang */}
                <span className="text-content-subtle w-7 shrink-0 text-center text-sm font-bold">
                  #{index + 1}
                </span>

                {/* Tuile d'item */}
                <EquipmentIcon
                  icon={entry.icon}
                  grade={entry.grade}
                  alt={entry.name}
                  size={40}
                  stars={entry.star}
                  overlayIcon={entry.overlayIcon}
                  classType={entry.classType}
                />

                {/* Nom + barre */}
                <div className="min-w-0 flex-1">
                  <span className="text-content-strong block truncate text-sm font-semibold">
                    {entry.name}
                  </span>
                  <div className="bg-surface-sunken/70 mt-1 h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-sky-500/70 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Compte */}
                <div className="min-w-12 shrink-0 text-center">
                  <span className="text-xl font-bold text-sky-400">{entry.count}</span>
                  <span className="text-content-subtle block text-[10px] tracking-wide uppercase">
                    {labels.charsUnit}
                  </span>
                </div>

                {/* Chevron */}
                <svg
                  className={`text-content-subtle h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Déplié : les persos qui la jouent */}
              {isExpanded && (
                <div className="border-line-subtle bg-surface-raised/60 rounded-b-lg border-x border-b px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {entry.characters.map((c) => (
                      <Link
                        key={c.id}
                        href={`/characters/${c.slug}` as Route}
                        className="bg-surface-sunken/50 hover:bg-surface-sunken flex items-center gap-2 rounded-lg px-2 py-1.5 transition"
                      >
                        {/* Largeur fixe : le span racine du portrait est en w-full. */}
                        <span className="w-10 shrink-0">
                          <CharacterPortrait id={c.id} name={c.name} size={40} showName={false} />
                        </span>
                        <span className="text-content text-xs">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compteur */}
      <p className="text-content-subtle text-center text-xs">
        {entries.length} / {data[category].length}
      </p>
    </div>
  );
}

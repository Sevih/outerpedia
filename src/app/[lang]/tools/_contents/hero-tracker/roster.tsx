'use client';

/**
 * Autour du roster suivi : la barre de filtres et de tri, le tiroir
 * « ajouter » et l'état vide. Extrait du composant principal (découpage du
 * 03/10/2026 — JSX déplacé tel quel ; filtres, tri et recherche restent au
 * parent, via useTrackerState).
 */
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import {
  ClassIconPill,
  ElementIconPill,
  SearchField,
  StarPill,
} from '@/components/character/filters/FilterAtoms';
import { CLASS_ORDER, ELEMENT_ORDER } from '@/lib/images';
import {
  SORT_DESC,
  type HeroRow,
  type HeroTrackerLabels,
  type RosterFilters,
  type SortKey,
} from './contracts';

/* ─────────────────────────── Roster & état vide ─────────────────────────── */

/** Les trois raretés du jeu — filtre du roster suivi. */
const RARITIES = [3, 2, 1] as const;

/**
 * Barre du roster suivi : filtrer (élément / classe / rareté) et choisir l'ordre.
 * Un compte se remplit par paquets — « mes cinq feu », « mes soigneurs » — et une
 * liste de trente héros sans prise se parcourt à la molette.
 */
export function RosterBar({
  filters,
  onFilters,
  sort,
  onSort,
  elementNames,
  classNames,
  labels,
}: {
  filters: RosterFilters;
  onFilters: (f: RosterFilters) => void;
  sort: { by: SortKey; desc: boolean };
  onSort: (s: { by: SortKey; desc: boolean }) => void;
  elementNames: Record<string, string>;
  classNames: Record<string, string>;
  labels: HeroTrackerLabels;
}) {
  const sorts: { key: SortKey; label: string }[] = [
    { key: 'need', label: labels.sortNeed },
    { key: 'level', label: labels.level },
    { key: 'affinity', label: labels.affinity },
    { key: 'name', label: labels.sortName },
  ];

  return (
    <div className="border-line-subtle bg-surface-sunken flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-2.5 py-2">
      <span className="flex gap-1">
        {ELEMENT_ORDER.map((el) => (
          <ElementIconPill
            key={el}
            element={el}
            active={filters.element === el}
            onClick={() => onFilters({ ...filters, element: filters.element === el ? null : el })}
            size="sm"
            title={elementNames[el]}
          />
        ))}
      </span>

      <span className="flex gap-1">
        {CLASS_ORDER.map((cl) => (
          <ClassIconPill
            key={cl}
            classType={cl}
            active={filters.class === cl}
            onClick={() => onFilters({ ...filters, class: filters.class === cl ? null : cl })}
            size="sm"
            title={classNames[cl]}
          />
        ))}
      </span>

      <span className="flex gap-1">
        {RARITIES.map((r) => (
          <StarPill
            key={r}
            stars={r}
            active={filters.rarity === r}
            onClick={() => onFilters({ ...filters, rarity: filters.rarity === r ? null : r })}
            ariaLabel={labels.starAria.replace('{rarity}', String(r))}
          />
        ))}
      </span>

      <div className="flex-1" />

      <span className="flex flex-wrap items-center gap-1">
        <span className="text-content-subtle text-2xs font-mono tracking-wide uppercase">
          {labels.sort}
        </span>
        {sorts.map((s) => {
          const active = sort.by === s.key;
          return (
            <button
              key={s.key}
              type="button"
              // Recliquer le critère actif inverse le sens — et c'est aussi ce
              // qui redonne un ordre frais quand la saisie l'a périmé.
              onClick={() =>
                onSort(
                  active ? { by: s.key, desc: !sort.desc } : { by: s.key, desc: SORT_DESC[s.key] },
                )
              }
              className={`text-3xs h-7 rounded-md border px-2 transition-colors ${
                active
                  ? 'border-accent bg-accent/15 text-accent font-semibold'
                  : 'border-line-subtle text-content-muted hover:border-line'
              }`}
            >
              {s.label}
              {active && <span className="ml-0.5 font-mono">{sort.desc ? '↓' : '↑'}</span>}
            </button>
          );
        })}
      </span>
    </div>
  );
}

export function HeroPicker({
  rows,
  query,
  onQuery,
  element,
  onElement,
  elementNames,
  onToggle,
  labels,
}: {
  rows: HeroRow[];
  query: string;
  onQuery: (v: string) => void;
  element: string | null;
  onElement: (v: string | null) => void;
  elementNames: Record<string, string>;
  onToggle: (hero: HeroRow) => void;
  labels: HeroTrackerLabels;
}) {
  return (
    <div className="border-line-subtle bg-surface-sunken space-y-2.5 rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-content-strong text-sm font-semibold">{labels.addHero}</h3>
        <span className="text-content-subtle text-3xs font-mono">
          {labels.untracked.replace('{count}', String(rows.length))}
        </span>
        <div className="flex-1" />
        <div className="w-full min-w-0 sm:w-52">
          <SearchField
            value={query}
            onChange={onQuery}
            placeholder={labels.search}
            clearLabel={labels.clearSearch}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onElement(null)}
          className={`text-3xs rounded-md border px-2 py-1 transition-colors ${
            element === null
              ? 'border-accent bg-accent/15 text-accent font-semibold'
              : 'border-line-subtle text-content-muted hover:border-line'
          }`}
        >
          {labels.axisAll}
        </button>
        {ELEMENT_ORDER.map((el) => (
          <ElementIconPill
            key={el}
            element={el}
            active={element === el}
            onClick={() => onElement(element === el ? null : el)}
            size="sm"
            title={elementNames[el]}
          />
        ))}
      </div>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
        {rows.map((hero) => (
          <li key={hero.id}>
            <button
              type="button"
              onClick={() => onToggle(hero)}
              title={hero.name}
              className="block w-full hover:brightness-110"
            >
              <CharacterPortrait
                id={hero.id}
                name={hero.name}
                element={hero.element}
                classType={hero.class}
                rarity={hero.rarity}
                size={44}
                showName={false}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyState({ labels, onPick }: { labels: HeroTrackerLabels; onPick: () => void }) {
  return (
    <div className="border-line-subtle bg-surface-raised flex flex-col items-center gap-3 rounded-xl border px-4 py-8 text-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="border-line bg-surface-sunken h-10 w-10 rounded-lg border border-dashed"
          />
        ))}
      </div>
      <h3 className="text-content-strong text-base font-bold">{labels.emptyTitle}</h3>
      <p className="text-content-muted max-w-xs text-sm text-pretty">{labels.intro}</p>
      <button
        type="button"
        onClick={onPick}
        className="bg-accent text-accent-fg rounded-lg px-4 py-2.5 text-sm font-semibold hover:brightness-110"
      >
        {labels.emptyCta}
      </button>
    </div>
  );
}

'use client';

import {
  ElementIconPill,
  ClassIconPill,
  StarPill,
  TONE,
  BarGroup,
  SearchField,
  ToolbarDivider,
} from './FilterAtoms';
import { FilterPill } from './FilterPill';
import type { FilterOption } from './AdvancedFiltersPanel';

export interface FiltersBarLabels {
  searchPlaceholder: string;
  elements: string;
  classes: string;
  rarity: string;
  /** Libellé du groupe Rôles (requis si `roles` est fourni). */
  roles?: string;
  filtersTitle: string;
  advanced: string;
  starAria: string;
}

interface Props {
  query: string;
  onQueryChange: (v: string) => void;

  elements: string[];
  elementFilter: string[];
  onToggleElement: (v: string) => void;

  classes: string[];
  classFilter: string[];
  onToggleClass: (v: string) => void;

  rarities: number[];
  rarityFilter: number[];
  onToggleRarity: (v: number) => void;

  /** Fournis ensemble, ajoutent un groupe Rôles dans la barre (parité V2). */
  roles?: FilterOption[];
  roleFilter?: string[];
  onToggleRole?: (v: string) => void;

  labels: FiltersBarLabels;
  /** Compte des filtres avancés actifs (badge du bouton). */
  advancedCount?: number;
  /** Absent → pas de panneau avancé : le déclencheur n'est pas rendu. */
  onOpenAdvanced?: () => void;
  advancedOpen?: boolean;
}

/**
 * Barre de filtres — toolbar horizontale sur desktop (search + pills
 * élément/classe/rareté + bouton avancé), rangées empilées sur mobile. Portage
 * V2 réhabillé sur tokens V3 (accent ciel). xl+ : le bouton avancé est masqué
 * (la sidebar persistante prend le relais).
 */
export function CharactersFiltersBar({
  query,
  onQueryChange,
  elements,
  elementFilter,
  onToggleElement,
  classes,
  classFilter,
  onToggleClass,
  rarities,
  rarityFilter,
  onToggleRarity,
  roles,
  roleFilter,
  onToggleRole,
  labels,
  advancedCount = 0,
  onOpenAdvanced,
  advancedOpen,
}: Props) {
  const basicsCount = elementFilter.length + classFilter.length + rarityFilter.length;
  const showRoles = Boolean(roles?.length && roleFilter && onToggleRole);

  return (
    <div className="space-y-3">
      {/* Mobile : recherche + bouton Filtres */}
      <div className="flex items-center gap-2 md:hidden">
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder={labels.searchPlaceholder}
        />
        {onOpenAdvanced && (
          <AdvancedButton
            label={labels.filtersTitle}
            count={advancedCount + basicsCount}
            active={advancedOpen}
            onClick={onOpenAdvanced}
          />
        )}
      </div>

      {/* Mobile : rangées rapides élément puis classe + rareté */}
      <div className="space-y-2 md:hidden">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {elements.map((el) => (
            <ElementIconPill
              key={el}
              element={el}
              active={elementFilter.includes(el)}
              onClick={() => onToggleElement(el)}
              size="sm"
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {classes.map((cl) => (
            <ClassIconPill
              key={cl}
              classType={cl}
              active={classFilter.includes(cl)}
              onClick={() => onToggleClass(cl)}
              size="sm"
            />
          ))}
          <span className="bg-line-subtle mx-1 h-5 w-px" />
          {rarities.map((r) => (
            <StarPill
              key={r}
              stars={r}
              active={rarityFilter.includes(r)}
              onClick={() => onToggleRarity(r)}
              ariaLabel={labels.starAria.replace('{rarity}', String(r))}
            />
          ))}
        </div>
        {showRoles && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {roles!.map((r) => (
              <FilterPill
                key={r.value}
                active={roleFilter!.includes(r.value)}
                onClick={() => onToggleRole!(r.value)}
                className="h-7 px-2.5"
              >
                {r.label}
              </FilterPill>
            ))}
          </div>
        )}
      </div>

      {/* Desktop : toolbar horizontale unique */}
      <div className="border-line-subtle bg-surface-raised/60 hidden flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border px-3 py-2.5 backdrop-blur-sm md:flex">
        <div className="w-72 max-w-full">
          <SearchField
            value={query}
            onChange={onQueryChange}
            placeholder={labels.searchPlaceholder}
          />
        </div>

        <ToolbarDivider />

        <BarGroup label={labels.elements}>
          {elements.map((el) => (
            <ElementIconPill
              key={el}
              element={el}
              active={elementFilter.includes(el)}
              onClick={() => onToggleElement(el)}
            />
          ))}
        </BarGroup>

        <ToolbarDivider />

        <BarGroup label={labels.classes}>
          {classes.map((cl) => (
            <ClassIconPill
              key={cl}
              classType={cl}
              active={classFilter.includes(cl)}
              onClick={() => onToggleClass(cl)}
            />
          ))}
        </BarGroup>

        <ToolbarDivider />

        <BarGroup label={labels.rarity}>
          {rarities.map((r) => (
            <StarPill
              key={r}
              stars={r}
              active={rarityFilter.includes(r)}
              onClick={() => onToggleRarity(r)}
              ariaLabel={labels.starAria.replace('{rarity}', String(r))}
            />
          ))}
        </BarGroup>

        {showRoles && (
          <>
            <ToolbarDivider />
            <BarGroup label={labels.roles ?? ''}>
              {roles!.map((r) => (
                <FilterPill
                  key={r.value}
                  active={roleFilter!.includes(r.value)}
                  onClick={() => onToggleRole!(r.value)}
                  className="h-8 px-3"
                >
                  {r.label}
                </FilterPill>
              ))}
            </BarGroup>
          </>
        )}

        <div className="flex-1" />

        {/* xl+ : la sidebar remplace ce déclencheur. */}
        {onOpenAdvanced && (
          <div className="xl:hidden">
            <AdvancedButton
              label={labels.advanced}
              count={advancedCount}
              active={advancedOpen}
              onClick={onOpenAdvanced}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────────
// (SearchField/BarGroup/ToolbarDivider vivent dans FilterAtoms — partagés avec
// la toolbar de /equipment.)

function AdvancedButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      style={{
        background: active ? TONE.cyan : undefined,
        borderColor: active ? TONE.cyan : undefined,
        color: active ? '#0a0a0a' : undefined,
      }}
      className={`focus-visible:ring-accent inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border text-sm font-medium transition focus:outline-none focus-visible:ring-2 ${
        active
          ? 'px-3'
          : 'border-line-subtle bg-surface-sunken/70 text-content-strong hover:border-line px-3'
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h12M4 8h8M6 12h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {label}
      {count > 0 && (
        <span
          style={{
            background: active ? '#0a0a0a' : TONE.cyan,
            color: active ? TONE.cyan : '#0a0a0a',
          }}
          className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold"
        >
          {count}
        </span>
      )}
    </button>
  );
}

'use client';

import { ElementIconPill, ClassIconPill, StarPill, TONE } from './FilterAtoms';

export interface FiltersBarLabels {
  searchPlaceholder: string;
  elements: string;
  classes: string;
  rarity: string;
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

  labels: FiltersBarLabels;
  /** Compte des filtres avancés actifs (badge du bouton). */
  advancedCount: number;
  onOpenAdvanced: () => void;
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
  labels,
  advancedCount,
  onOpenAdvanced,
  advancedOpen,
}: Props) {
  const basicsCount = elementFilter.length + classFilter.length + rarityFilter.length;

  return (
    <div className="space-y-3">
      {/* Mobile : recherche + bouton Filtres */}
      <div className="flex items-center gap-2 md:hidden">
        <SearchField
          value={query}
          onChange={onQueryChange}
          placeholder={labels.searchPlaceholder}
        />
        <AdvancedButton
          label={labels.filtersTitle}
          count={advancedCount + basicsCount}
          active={advancedOpen}
          onClick={onOpenAdvanced}
        />
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

        <Divider />

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

        <Divider />

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

        <Divider />

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

        <div className="flex-1" />

        {/* xl+ : la sidebar remplace ce déclencheur. */}
        <div className="xl:hidden">
          <AdvancedButton
            label={labels.advanced}
            count={advancedCount}
            active={advancedOpen}
            onClick={onOpenAdvanced}
          />
        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function Divider() {
  return <span className="bg-line/70 h-9 w-px self-end" aria-hidden />;
}

function BarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-content-muted text-center font-mono text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-1">{children}</div>
    </div>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex items-center">
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-line-subtle bg-surface-sunken/70 text-content placeholder:text-content-subtle focus:border-accent h-9 w-full rounded-lg border pr-8 pl-9 text-sm focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="clear"
          className="text-content-subtle hover:text-content-strong absolute right-2"
        >
          ×
        </button>
      )}
    </div>
  );
}

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

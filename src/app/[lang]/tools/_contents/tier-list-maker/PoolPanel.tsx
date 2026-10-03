'use client';

/**
 * Panneau du POOL du Tier List Maker : onglets, recherche, tri, filtres
 * (élément, classe, rareté, tags, skins) et la grille des items encore à
 * ranger — qui est aussi la cible de drop pour dé-ranger. Extrait du composant
 * principal (découpage du 03/10/2026 — JSX déplacé tel quel ; l'état du pool
 * reste au parent, via usePool).
 */
import { CLASS_ORDER, ELEMENT_ORDER } from '@/lib/images';
import {
  ClassIconPill,
  ElementIconPill,
  SearchField,
  StarPill,
} from '@/components/character/filters/FilterAtoms';
import { FilterPill } from '@/components/character/filters/FilterPill';
import {
  FILTER_TAGS,
  RARITIES,
  SORT_KEYS,
  type IconSize,
  type SortKey,
  type Tab,
  type TierItem,
  type TlmLabels,
} from './contracts';
import { ItemView } from './ui';

export function PoolPanel({
  TABS,
  tab,
  setTab,
  rawQuery,
  setRawQuery,
  query,
  sort,
  setSort,
  elementFilter,
  setElementFilter,
  classFilter,
  setClassFilter,
  rarityFilter,
  setRarityFilter,
  tagFilter,
  setTagFilter,
  skinsOnly,
  setSkinsOnly,
  placed,
  poolItems,
  selectedKey,
  drag,
  iconSize,
  showNames,
  showElement,
  showClass,
  showRarity,
  labelFor,
  shortFor,
  skinLabelFor,
  tapZone,
  placeByKeyboard,
  placeBtnClass,
  onItemPointerDown,
  keySelect,
  labels: L,
}: {
  TABS: { id: Tab; count: number }[];
  tab: Tab;
  setTab: (next: Tab) => void;
  /** Saisie brute du champ ; `query` en est la valeur différée, celle qui filtre. */
  rawQuery: string;
  setRawQuery: (next: string) => void;
  query: string;
  sort: SortKey;
  setSort: (next: SortKey) => void;
  elementFilter: string[];
  setElementFilter: (next: string[] | ((prev: string[]) => string[])) => void;
  classFilter: string[];
  setClassFilter: (next: string[] | ((prev: string[]) => string[])) => void;
  rarityFilter: number[];
  setRarityFilter: (next: number[] | ((prev: number[]) => number[])) => void;
  tagFilter: string[];
  setTagFilter: (next: string[] | ((prev: string[]) => string[])) => void;
  skinsOnly: boolean;
  setSkinsOnly: (next: boolean | ((prev: boolean) => boolean)) => void;
  /** Clés déjà rangées dans un tier. */
  placed: Set<string>;
  poolItems: TierItem[];
  selectedKey: string | null;
  drag: { key: string; x: number; y: number } | null;
  iconSize: IconSize;
  showNames: boolean;
  showElement: boolean;
  showClass: boolean;
  showRarity: boolean;
  labelFor: (it: TierItem) => string;
  shortFor: (it: TierItem) => string | undefined;
  skinLabelFor: (it: TierItem) => string | undefined;
  tapZone: (e: React.MouseEvent, action: string) => void;
  placeByKeyboard: (e: React.MouseEvent, action: string) => void;
  placeBtnClass: string;
  onItemPointerDown: (e: React.PointerEvent, key: string) => void;
  keySelect: (key: string) => void;
  labels: TlmLabels;
}) {
  return (
    <div className="mt-6 lg:sticky lg:top-4 lg:mt-0 lg:max-h-[calc(100dvh-1.5rem)] lg:w-96 lg:shrink-0 lg:self-start lg:overflow-y-auto">
      {/* Onglets */}
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {TABS.map(({ id, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              tab === id
                ? 'bg-accent text-accent-fg'
                : 'bg-surface-overlay text-content-muted hover:bg-surface-overlay/70',
            ].join(' ')}
          >
            {L.tabs[id]}
            <span className="ml-1.5 text-xs opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {/* Recherche + filtres */}
      <SearchField
        value={rawQuery}
        onChange={setRawQuery}
        placeholder={L.search}
        clearLabel={L.clearSearch}
      />
      <div className="mt-2 flex items-center justify-center gap-2">
        <label className="text-content-muted text-xs">{L.sort}</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="border-line bg-surface-overlay text-content rounded border px-2 py-1 text-xs focus:border-sky-500 focus:outline-none"
        >
          {SORT_KEYS.map((k) => (
            <option key={k} value={k}>
              {L.sorts[k]}
            </option>
          ))}
        </select>
      </div>
      {tab === 'characters' && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <div className="flex gap-1.5">
            {ELEMENT_ORDER.map((el) => (
              <ElementIconPill
                key={el}
                element={el}
                active={elementFilter.includes(el)}
                onClick={() =>
                  setElementFilter((f) => (f.includes(el) ? f.filter((x) => x !== el) : [...f, el]))
                }
                size="sm"
                title={L.elementNames[el]}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            {CLASS_ORDER.map((cl) => (
              <ClassIconPill
                key={cl}
                classType={cl}
                active={classFilter.includes(cl)}
                onClick={() =>
                  setClassFilter((f) => (f.includes(cl) ? f.filter((x) => x !== cl) : [...f, cl]))
                }
                size="sm"
                title={L.classNames[cl]}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            {RARITIES.map((r) => (
              <StarPill
                key={r}
                stars={r}
                active={rarityFilter.includes(r)}
                onClick={() =>
                  setRarityFilter((f) => (f.includes(r) ? f.filter((x) => x !== r) : [...f, r]))
                }
                ariaLabel={L.starAria.replace('{rarity}', String(r))}
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {FILTER_TAGS.map((tg) => (
              <FilterPill
                key={tg}
                active={tagFilter.includes(tg)}
                onClick={() =>
                  setTagFilter((f) => (f.includes(tg) ? f.filter((x) => x !== tg) : [...f, tg]))
                }
                className="h-8 px-2"
                title={L.tags[tg]}
              >
                <span className="text-xs leading-none font-medium">{L.tags[tg]}</span>
              </FilterPill>
            ))}
            <FilterPill
              active={skinsOnly}
              onClick={() => setSkinsOnly((v) => !v)}
              className="h-8 px-2"
              title={L.skinsOnly}
            >
              <span className="text-xs leading-none font-medium">{L.skinsOnly}</span>
            </FilterPill>
          </div>
        </div>
      )}

      {/* Grille du pool (cible de drop pour dé-ranger) */}
      <div
        data-drop="pool"
        onClick={(e) => tapZone(e, 'pool')}
        className="border-line bg-surface-sunken/40 mt-4 flex min-h-20 flex-wrap content-start justify-center gap-1.5 rounded-lg border border-dashed p-3"
      >
        {selectedKey && (
          <button
            type="button"
            data-place
            onClick={(e) => placeByKeyboard(e, 'pool')}
            className={placeBtnClass}
          >
            {L.placeInPool}
          </button>
        )}
        {poolItems.length === 0 ? (
          <p className="text-content-subtle py-6 text-sm">
            {placed.size > 0 &&
            query.trim() === '' &&
            elementFilter.length === 0 &&
            classFilter.length === 0 &&
            rarityFilter.length === 0 &&
            tagFilter.length === 0 &&
            !skinsOnly
              ? L.emptyPool
              : L.noResults}
          </p>
        ) : (
          poolItems.map((it) => (
            <ItemView
              key={it.key}
              item={it}
              selected={selectedKey === it.key}
              dimmed={drag?.key === it.key}
              label={labelFor(it)}
              shortLabel={shortFor(it)}
              skinLabel={skinLabelFor(it)}
              size={iconSize}
              showName={showNames}
              showElement={showElement}
              showClass={showClass}
              showRarity={showRarity}
              onPointerDown={onItemPointerDown}
              onKeySelect={keySelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

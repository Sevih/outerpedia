'use client';

import { useState } from 'react';
import { FilterPill } from './FilterPill';
import { LogicToggle, Eyebrow, TONE } from './FilterAtoms';

/** Une option de filtre (valeur + libellé localisé + icône éventuelle). */
export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

export interface AdvancedPanelLabels {
  tabCombat: string;
  tabEffects: string;
  tabBonus: string;
  tabTags: string;
  chains: string;
  roles: string;
  gifts: string;
  teamBonus: string;
  tags: string;
  matchLogic: string;
}

export interface AdvancedFiltersPanelProps {
  labels: AdvancedPanelLabels;

  // Combat
  chains: FilterOption[];
  chainFilter: string[];
  onToggleChain: (v: string) => void;
  roles: FilterOption[];
  roleFilter: string[];
  onToggleRole: (v: string) => void;
  gifts: FilterOption[];
  giftFilter: string[];
  onToggleGift: (v: string) => void;

  // Tags
  tags: FilterOption[];
  tagFilter: string[];
  onToggleTag: (v: string) => void;
  tagLogic: 'AND' | 'OR';
  onTagLogicChange: (v: 'AND' | 'OR') => void;
}

type TabKey = 'combat' | 'tags';

/**
 * Corps des filtres avancés (bandeau d'onglets + contenu) — partagé par la
 * sidebar xl et le drawer mobile. État d'onglet local ; l'état des filtres vit
 * chez le parent. Phase 1 : Combat + Tags (Effects/Bonus arrivent avec la data
 * worker). Portage V2 sur tokens V3.
 */
export function AdvancedFiltersPanel(props: AdvancedFiltersPanelProps) {
  const {
    labels,
    chains,
    chainFilter,
    onToggleChain,
    roles,
    roleFilter,
    onToggleRole,
    gifts,
    giftFilter,
    onToggleGift,
    tags,
    tagFilter,
    onToggleTag,
    tagLogic,
    onTagLogicChange,
  } = props;
  const [activeTab, setActiveTab] = useState<TabKey>('combat');

  const counts: Record<TabKey, number> = {
    combat: chainFilter.length + roleFilter.length + giftFilter.length,
    tags: tagFilter.length,
  };
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'combat', label: labels.tabCombat },
    { key: 'tags', label: labels.tabTags },
  ];

  return (
    <>
      {/* Onglets */}
      <div className="border-line-subtle/80 flex gap-1 overflow-x-auto border-b px-3 py-2.5">
        {tabs.map((tab) => {
          const on = tab.key === activeTab;
          const n = counts[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={on}
              style={{
                background: on ? `${TONE.cyan}1f` : undefined,
                borderColor: on ? `${TONE.cyan}66` : undefined,
                color: on ? TONE.cyan : undefined,
              }}
              className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs transition ${on ? '' : 'border-line-subtle bg-surface-sunken/70 text-content-muted'}`}
            >
              {tab.label}
              {n > 0 && (
                <span
                  style={{
                    background: on ? TONE.cyan : undefined,
                    color: on ? '#0a0a0a' : undefined,
                  }}
                  className={`rounded px-1.5 font-mono text-[9px] font-bold ${on ? '' : 'bg-surface-overlay text-content-muted'}`}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === 'combat' && (
          <div className="space-y-4">
            <PillSection
              label={labels.chains}
              options={chains}
              selected={chainFilter}
              onToggle={onToggleChain}
            />
            <PillSection
              label={labels.roles}
              options={roles}
              selected={roleFilter}
              onToggle={onToggleRole}
            />
            <PillSection
              label={labels.gifts}
              options={gifts}
              selected={giftFilter}
              onToggle={onToggleGift}
            />
          </div>
        )}
        {activeTab === 'tags' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Eyebrow>{labels.matchLogic}</Eyebrow>
              <LogicToggle value={tagLogic} onChange={onTagLogicChange} tone={TONE.indigo} />
            </div>
            <PillSection
              label={labels.tags}
              options={tags}
              selected={tagFilter}
              onToggle={onToggleTag}
              withIcon
            />
          </div>
        )}
      </div>
    </>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-content-muted mt-3 mb-2 text-xs tracking-wide uppercase first:mt-0">
      {children}
    </p>
  );
}

function PillSection({
  label,
  options,
  selected,
  onToggle,
  withIcon,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (v: string) => void;
  withIcon?: boolean;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <FilterPill
            key={opt.value}
            active={selected.includes(opt.value)}
            onClick={() => onToggle(opt.value)}
            className={withIcon ? 'h-8 gap-1.5 px-2.5' : 'h-8 px-3'}
          >
            {withIcon && opt.icon && (
              // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
              <img src={opt.icon} alt="" className="size-4 shrink-0 object-contain" />
            )}
            <span>{opt.label}</span>
          </FilterPill>
        ))}
      </div>
    </div>
  );
}

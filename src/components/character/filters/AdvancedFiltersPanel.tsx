'use client';

import { useState } from 'react';
import { FilterPill } from './FilterPill';
import { LogicToggle, Eyebrow, TONE } from './FilterAtoms';
import { EffectGroupGrid } from './EffectGroupGrid';
import type { EffectGroup } from '@/lib/data/effect-filters';

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
  // Effects
  buffs: string;
  debuffs: string;
  filterBySource: string;
  unique: string;
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

  // Effects
  buffGroups: EffectGroup[];
  debuffGroups: EffectGroup[];
  selectedBuffs: string[];
  onToggleBuff: (v: string) => void;
  selectedDebuffs: string[];
  onToggleDebuff: (v: string) => void;
  effectLogic: 'AND' | 'OR';
  onEffectLogicChange: (v: 'AND' | 'OR') => void;
  sources: FilterOption[];
  sourceFilter: string[];
  onToggleSource: (v: string) => void;
  showUnique: boolean;
  onToggleShowUnique: () => void;

  // Team Bonus
  teamBonusOptions: FilterOption[];
  teamBonusFilter: string[];
  onToggleTeamBonus: (v: string) => void;

  // Tags
  tags: FilterOption[];
  tagFilter: string[];
  onToggleTag: (v: string) => void;
  tagLogic: 'AND' | 'OR';
  onTagLogicChange: (v: 'AND' | 'OR') => void;
}

type TabKey = 'combat' | 'effects' | 'bonus' | 'tags';

/**
 * Corps des filtres avancés (bandeau d'onglets + contenu) — partagé par la
 * sidebar xl et le drawer mobile. État d'onglet local ; l'état des filtres vit
 * chez le parent. Les onglets Effects/Bonus n'apparaissent que si leur donnée
 * est présente (data-gated — pas d'onglet vide). Portage V2 sur tokens V3.
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
    buffGroups,
    debuffGroups,
    selectedBuffs,
    onToggleBuff,
    selectedDebuffs,
    onToggleDebuff,
    effectLogic,
    onEffectLogicChange,
    sources,
    sourceFilter,
    onToggleSource,
    showUnique,
    onToggleShowUnique,
    teamBonusOptions,
    teamBonusFilter,
    onToggleTeamBonus,
    tags,
    tagFilter,
    onToggleTag,
    tagLogic,
    onTagLogicChange,
  } = props;

  const hasEffects = buffGroups.length > 0 || debuffGroups.length > 0;
  const hasBonus = teamBonusOptions.length > 0;

  const counts: Record<TabKey, number> = {
    combat: chainFilter.length + roleFilter.length + giftFilter.length,
    effects:
      selectedBuffs.length + selectedDebuffs.length + sourceFilter.length + (showUnique ? 1 : 0),
    bonus: teamBonusFilter.length,
    tags: tagFilter.length,
  };
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'combat', label: labels.tabCombat },
    ...(hasEffects ? [{ key: 'effects' as const, label: labels.tabEffects }] : []),
    ...(hasBonus ? [{ key: 'bonus' as const, label: labels.tabBonus }] : []),
    { key: 'tags', label: labels.tabTags },
  ];

  const [activeTab, setActiveTab] = useState<TabKey>('combat');

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

        {activeTab === 'effects' && hasEffects && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Eyebrow>{labels.matchLogic}</Eyebrow>
              <LogicToggle value={effectLogic} onChange={onEffectLogicChange} />
            </div>

            {sources.length > 0 && (
              <PillSection
                label={labels.filterBySource}
                options={sources}
                selected={sourceFilter}
                onToggle={onToggleSource}
              />
            )}

            <label className="border-line-subtle bg-surface-sunken/70 hover:border-line flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition">
              <input
                type="checkbox"
                checked={showUnique}
                onChange={onToggleShowUnique}
                className="size-4 accent-sky-500"
              />
              <span className="text-content flex-1 text-sm">{labels.unique}</span>
            </label>

            {buffGroups.length > 0 && (
              <div>
                <p className="mb-2 text-center text-xs tracking-wide text-sky-300 uppercase">
                  {labels.buffs}
                </p>
                <EffectGroupGrid
                  groups={visibleGroups(buffGroups, showUnique)}
                  selected={selectedBuffs}
                  side="buff"
                  onToggle={onToggleBuff}
                />
              </div>
            )}

            {debuffGroups.length > 0 && (
              <>
                <div className="border-line-subtle border-t" />
                <div>
                  <p className="mb-2 text-center text-xs tracking-wide text-rose-300 uppercase">
                    {labels.debuffs}
                  </p>
                  <EffectGroupGrid
                    groups={visibleGroups(debuffGroups, showUnique)}
                    selected={selectedDebuffs}
                    side="debuff"
                    onToggle={onToggleDebuff}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bonus' && hasBonus && (
          <div className="space-y-3">
            <SectionLabel>{labels.teamBonus}</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {teamBonusOptions.map((opt) => (
                <FilterPill
                  key={opt.value}
                  active={teamBonusFilter.includes(opt.value)}
                  onClick={() => onToggleTeamBonus(opt.value)}
                  className="h-8 gap-1.5 px-2.5"
                >
                  {opt.icon && (
                    <img
                      src={opt.icon}
                      alt=""
                      aria-hidden
                      className="size-4 shrink-0 object-contain"
                      width={16}
                      height={16}
                    />
                  )}
                  <span>{opt.label}</span>
                </FilterPill>
              ))}
            </div>
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

/** Ne garde la famille `unique` que si le toggle est activé (parité V2). */
function visibleGroups(groups: EffectGroup[], showUnique: boolean): EffectGroup[] {
  return showUnique ? groups : groups.filter((g) => g.category !== 'unique');
}

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
              <img
                src={opt.icon}
                alt=""
                aria-hidden
                className="size-4 shrink-0 object-contain"
                width={16}
                height={16}
              />
            )}
            <span>{opt.label}</span>
          </FilterPill>
        ))}
      </div>
    </div>
  );
}

'use client'

import React from 'react'
import Image from 'next/image'
import { ElementIcon } from './ElementIcon'
import { ClassIcon } from './ClassIcon'
import { ELEMENTS, CLASSES, CHAIN_TYPES, CHAIN_TYPE_LABELS, RARITIES, SKILL_SOURCES } from '@/types/enums'
import type { ElementType, ClassType, SkillKey } from '@/types/enums'
import type { EffectsLogic, GroupedEffects, EffectCategory } from '@/types/team-planner'
import EffectFilterDropdown from './EffectFilterDropdown'
import SelectedEffectsPills from './SelectedEffectsPills'

interface FilterBarProps {
  // State
  selectedElements: string[]
  selectedClasses: string[]
  selectedRarities: number[]
  selectedChainTypes: string[]
  selectedEffects: {name: string; type: 'buff' | 'debuff'}[]
  selectedSources: SkillKey[]
  effectsLogic: EffectsLogic
  isFiltersExpanded: boolean
  isEffectDropdownOpen: boolean
  filteredCount: number
  isSmallScreen: boolean

  // Data
  groupedEffects: GroupedEffects
  effectCategories: {
    buff: EffectCategory
    debuff: EffectCategory
  }

  // Handlers
  onToggleElement: (element: string) => void
  onToggleClass: (className: string) => void
  onToggleRarity: (rarity: number) => void
  onToggleChainType: (chainType: string) => void
  onToggleEffect: (effectName: string, effectType: 'buff' | 'debuff') => void
  onToggleSource: (source: SkillKey) => void
  onToggleEffectsLogic: () => void
  onToggleFiltersExpanded: () => void
  onToggleEffectDropdown: () => void
  onClearFilters: () => void

  // i18n
  t: (key: string) => string
}

// FilterPill component (same style as CharactersPageClient)
function FilterPill({
  active,
  children,
  onClick,
  className,
  title,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  title?: string
  className?: string
}) {
  const base = "inline-flex items-center justify-center rounded cursor-pointer select-none transition"
  const state = active
    ? "bg-cyan-500/25 text-white ring-1 ring-cyan-400"
    : "bg-slate-700/60 text-slate-200 hover:bg-cyan-700"
  const size = "h-6 px-2 text-[11px] leading-none py-0"
  const fix = "[&_*]:leading-none [&_img]:align-middle [&_img]:block"
  const cls = [base, state, size, fix, className].filter(Boolean).join(" ")

  return (
    <button onClick={onClick} title={title} aria-pressed={active}
      className={`${cls} focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400`} type="button">
      {children}
    </button>
  )
}

export default function FilterBar({
  selectedElements,
  selectedClasses,
  selectedRarities,
  selectedChainTypes,
  selectedEffects,
  selectedSources,
  effectsLogic,
  isFiltersExpanded,
  isEffectDropdownOpen,
  filteredCount,
  isSmallScreen,
  groupedEffects,
  effectCategories,
  onToggleElement,
  onToggleClass,
  onToggleRarity,
  onToggleChainType,
  onToggleEffect,
  onToggleSource,
  onToggleEffectsLogic,
  onToggleFiltersExpanded,
  onToggleEffectDropdown,
  onClearFilters,
  t,
}: FilterBarProps) {
  const hasActiveFilters = selectedElements.length > 0 ||
                          selectedClasses.length > 0 ||
                          selectedRarities.length > 0 ||
                          selectedChainTypes.length > 0 ||
                          selectedEffects.length > 0 ||
                          selectedSources.length > 0

  return (
    <div className="border-b border-gray-700">
      {/* Header - Always visible */}
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/30 transition-colors" onClick={onToggleFiltersExpanded}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-300">Filters</h3>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-[10px] bg-cyan-600 text-white rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{filteredCount} found</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Filter Content - Collapsable */}
      {isFiltersExpanded && (
        <div className="p-3 pt-0">
          {/* Compact horizontal layout on desktop, stacked on mobile */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-3 md:flex-wrap">
            {/* Rarities */}
            <div className="flex justify-center gap-1.5">
              {RARITIES.map(rarity => {
                const active = selectedRarities.includes(rarity)
                return (
                  <FilterPill
                    key={rarity}
                    active={active}
                    onClick={() => onToggleRarity(rarity)}
                    className="h-6 px-2"
                  >
                    <div className="flex items-center -space-x-0.5">
                      {Array.from({ length: rarity }).map((_, i) => (
                        <Image key={i} src="/images/ui/star.webp" alt="star" width={12} height={12} style={{ width: 12, height: 12 }} />
                      ))}
                    </div>
                  </FilterPill>
                )
              })}
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-gray-700" />

            {/* Elements */}
            <div className="flex gap-1.5 justify-center">
              {ELEMENTS.map(element => {
                const active = selectedElements.includes(element)
                return (
                  <FilterPill
                    key={element}
                    title={element}
                    active={active}
                    onClick={() => onToggleElement(element)}
                    className="w-8 h-8 px-0"
                  >
                    <ElementIcon element={element as ElementType} />
                  </FilterPill>
                )
              })}
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-gray-700" />

            {/* Classes */}
            <div className="flex gap-1.5 justify-center">
              {CLASSES.map(className => {
                const active = selectedClasses.includes(className)
                return (
                  <FilterPill
                    key={className}
                    title={className}
                    active={active}
                    onClick={() => onToggleClass(className)}
                    className="w-8 h-8 px-0"
                  >
                    <ClassIcon className={className as ClassType} />
                  </FilterPill>
                )
              })}
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-gray-700" />

            {/* Chain Types */}
            <div className="flex gap-1.5 justify-center">
              {CHAIN_TYPES.map(chainType => {
                const active = selectedChainTypes.includes(chainType)
                return (
                  <FilterPill
                    key={chainType}
                    active={active}
                    onClick={() => onToggleChainType(chainType)}
                  >
                    {CHAIN_TYPE_LABELS[chainType]}
                  </FilterPill>
                )
              })}
            </div>
          </div>

          {/* Buff/Debuff Effects - Separate section */}
          <div className="mt-2 pt-2 border-t border-gray-700 space-y-1.5">
            {/* Buff Logic - Always visible */}
            <div className="flex items-center justify-center gap-2">
              <label className="text-[10px] uppercase tracking-wide text-slate-300 whitespace-nowrap">Buff Logic</label>

              {/* Toggle Switch */}
              <button
                onClick={onToggleEffectsLogic}
                className="relative inline-flex items-center h-5 w-16 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                style={{
                  backgroundColor: effectsLogic === 'OR' ? 'rgb(37 99 235 / 0.5)' : 'rgb(185 28 28 / 0.5)'
                }}
                title={effectsLogic === 'OR' ? 'Match ANY effect' : 'Match ALL effects'}
              >
                {/* Slider with text inside */}
                <span
                  className={`relative inline-block h-[18px] w-8 transform rounded-full transition-transform ${
                    effectsLogic === 'OR'
                      ? 'translate-x-0 bg-blue-500'
                      : 'translate-x-8 bg-red-500'
                  }`}
                >
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-white">
                    {effectsLogic}
                  </span>
                </span>
              </button>
            </div>

            {/* Source Filter */}
            <div className="flex items-center justify-center gap-2">
              <label className="text-[10px] uppercase tracking-wide text-slate-300 whitespace-nowrap">Source</label>
              <div className="flex gap-1 flex-wrap justify-center">
                {SKILL_SOURCES.map(source => (
                  <FilterPill
                    key={source.key}
                    active={selectedSources.includes(source.key)}
                    onClick={() => onToggleSource(source.key)}
                    className="text-[9px] px-1.5 h-5"
                  >
                    {t(isSmallScreen ? source.labelCompactKey : source.labelKey)}
                  </FilterPill>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <label className="text-[10px] uppercase tracking-wide text-slate-300 whitespace-nowrap">Effects</label>

              {/* Custom dropdown with icons */}
              <div className="relative flex-1 max-w-xs effect-dropdown-container">
                <button
                  type="button"
                  onClick={onToggleEffectDropdown}
                  className="w-full px-2 py-1 text-[11px] bg-gray-900 border border-gray-600 rounded text-white text-left focus:outline-none focus:border-cyan-500 flex items-center justify-between"
                >
                  <span>+ Add effect...</span>
                  <svg className={`w-3 h-3 transition-transform ${isEffectDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <EffectFilterDropdown
                  isOpen={isEffectDropdownOpen}
                  groupedEffects={groupedEffects}
                  selectedEffects={selectedEffects}
                  effectCategories={effectCategories}
                  onToggleEffect={onToggleEffect}
                  onClose={() => onToggleEffectDropdown()}
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="px-2 py-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 rounded transition-colors whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>

            <SelectedEffectsPills
              selectedEffects={selectedEffects}
              groupedEffects={groupedEffects}
              onRemoveEffect={onToggleEffect}
            />
          </div>
        </div>
      )}
    </div>
  )
}

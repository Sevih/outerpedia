'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { CharacterLite } from '@/types/types'
import type { SkillKey } from '@/types/enums'
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'
import effectCategories from '@/data/effect_categories.json'
import { useI18n } from '@/lib/contexts/I18nContext'
import type {
  EffectWithGroup,
  EffectCategory,
  CharacterSelectorModalProps,
  EffectsLogic
} from '@/types/team-planner'
import FilterBar from '@/app/components/FilterBar'
import CharacterGrid from '@/app/components/CharacterGrid'

// Build effect group map once at module level
const effectGroupMap = new Map<string, string>()
const buildEffectGroupMap = () => {
  if (effectGroupMap.size === 0) {
    ;[...buffs, ...debuffs].forEach((effect: EffectWithGroup) => {
      if (effect.group) {
        effectGroupMap.set(effect.name, effect.group)
      }
    })
  }
  return effectGroupMap
}

export default function CharacterSelectorModal({
  isOpen,
  onClose,
  onSelect,
  characters,
  selectedPosition,
  excludeCharacterIds = [],
}: CharacterSelectorModalProps) {
  const { t } = useI18n()
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Filtres - Tous en multi-sélection
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedRarities, setSelectedRarities] = useState<number[]>([])
  const [selectedChainTypes, setSelectedChainTypes] = useState<string[]>([])
  const [selectedEffects, setSelectedEffects] = useState<{name: string; type: 'buff' | 'debuff'}[]>([])
  const [selectedSources, setSelectedSources] = useState<SkillKey[]>([])
  const [effectsLogic, setEffectsLogic] = useState<EffectsLogic>('OR')
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true)
  const [isEffectDropdownOpen, setIsEffectDropdownOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const element = document.getElementById('portal-root')
    setPortalElement(element)
    return () => setMounted(false)
  }, [])

  // Track screen size for responsive labels
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    setIsSmallScreen(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsSmallScreen(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEffectDropdownOpen) {
          setIsEffectDropdownOpen(false)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, isEffectDropdownOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isEffectDropdownOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.effect-dropdown-container')) {
        setIsEffectDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isEffectDropdownOpen])

  // Helper function to check if character has effect (considering groups)
  const charHasEffect = useCallback((charEffects: string[], filterEffect: string): boolean => {
    const groupMap = buildEffectGroupMap()

    // Direct match
    if (charEffects.includes(filterEffect)) return true

    // Check if any of the character's effects belong to the same group as filterEffect
    for (const charEffect of charEffects) {
      const charGroup = groupMap.get(charEffect)
      if (charGroup && charGroup === filterEffect) {
        return true
      }
    }

    return false
  }, [])

  // Helper function to check if character has effect from specific sources
  const charHasEffectFromSources = useCallback((
    char: CharacterLite,
    filterEffect: string,
    effectType: 'buff' | 'debuff',
    sources: SkillKey[]
  ): boolean => {
    // If no sources specified, check only the correct effect type
    if (sources.length === 0) {
      const charEffects = effectType === 'buff' ? (char.buff || []) : (char.debuff || [])
      return charHasEffect(charEffects, filterEffect)
    }

    // Check if character has the effect in any of the specified sources
    if (!char.effectsBySource) {
      return false
    }

    for (const source of sources) {
      const sourceEffects = effectType === 'buff'
        ? (char.effectsBySource[source]?.buff || [])
        : (char.effectsBySource[source]?.debuff || [])

      if (charHasEffect(sourceEffects, filterEffect)) {
        return true
      }
    }

    return false
  }, [charHasEffect])

  const filteredCharacters = useMemo(() => {
    // First, exclude characters already in the team
    let filtered = characters.filter(
      char => !excludeCharacterIds.includes(char.ID)
    )

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(char =>
        char.Fullname.toLowerCase().includes(term) ||
        char.ID.toLowerCase().includes(term)
      )
    }

    // Apply element filter (multi-select)
    if (selectedElements.length > 0) {
      filtered = filtered.filter(char => char.Element && selectedElements.includes(char.Element))
    }

    // Apply class filter (multi-select)
    if (selectedClasses.length > 0) {
      filtered = filtered.filter(char => char.Class && selectedClasses.includes(char.Class))
    }

    // Apply rarity filter (multi-select)
    if (selectedRarities.length > 0) {
      filtered = filtered.filter(char => selectedRarities.includes(char.Rarity))
    }

    // Apply chain type filter (multi-select)
    if (selectedChainTypes.length > 0) {
      filtered = filtered.filter(char => char.Chain_Type && selectedChainTypes.includes(char.Chain_Type))
    }

    // Apply effects filter (buffs/debuffs) with source filter
    if (selectedEffects.length > 0) {
      filtered = filtered.filter(char => {
        if (effectsLogic === 'OR') {
          // OR logic: Character must have at least ONE of the selected effects from the specified sources
          return selectedEffects.some(effect =>
            charHasEffectFromSources(char, effect.name, effect.type, selectedSources)
          )
        } else {
          // AND logic: Character must have ALL selected effects from the specified sources
          return selectedEffects.every(effect =>
            charHasEffectFromSources(char, effect.name, effect.type, selectedSources)
          )
        }
      })
    }

    return filtered
  }, [characters, searchTerm, excludeCharacterIds, selectedElements, selectedClasses, selectedRarities, selectedChainTypes, selectedEffects, effectsLogic, selectedSources, charHasEffectFromSources])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedElements([])
    setSelectedClasses([])
    setSelectedRarities([])
    setSelectedChainTypes([])
    setSelectedEffects([])
    setSelectedSources([])
  }

  // Combiner tous les effets disponibles groupés par type et catégorie
  const groupedEffects = useMemo(() => {
    type EffectMapEntry = { name: string; label: string; icon: string; type: 'buff' | 'debuff'; category: string }

    // Build effect group map for filtering logic
    buildEffectGroupMap()

    // SAME LOGIC AS groupEffects.ts in CharactersPageClient
    // If an effect has a 'group', hide it and display only the group parent instead

    // Build maps for grouping logic - SEPARATE for buffs and debuffs!
    const buffsWithGroup = new Set<string>() // Buffs that have a group (should be hidden)
    const debuffsWithGroup = new Set<string>() // Debuffs that have a group (should be hidden)
    const buffGroupToCategory = new Map<string, string>() // Map buff group name to its category
    const debuffGroupToCategory = new Map<string, string>() // Map debuff group name to its category

    // Process buffs to identify which ones should be hidden
    ;(buffs as EffectWithGroup[]).forEach((buff: EffectWithGroup) => {
      if (buff.group) {
        buffsWithGroup.add(buff.name)
        if (buff.category) {
          buffGroupToCategory.set(buff.group, buff.category)
        }
      }
    })

    // Process debuffs to identify which ones should be hidden
    ;(debuffs as EffectWithGroup[]).forEach((debuff: EffectWithGroup) => {
      if (debuff.group) {
        debuffsWithGroup.add(debuff.name)
        if (debuff.category) {
          debuffGroupToCategory.set(debuff.group, debuff.category)
        }
      }
    })

    // Filter and map buffs: skip hidden/unique/grouped effects
    const buffEffects: EffectMapEntry[] = (buffs as EffectWithGroup[])
      .filter(buff =>
        buff.category !== 'hidden' &&
        buff.category !== 'unique' &&
        !buffsWithGroup.has(buff.name) // Skip buffs that have a group
      )
      .map(buff => ({
        name: buff.name,
        label: buff.label,
        icon: buff.icon,
        type: 'buff' as const,
        category: buff.category || buffGroupToCategory.get(buff.name) || 'utility'
      }))

    // Filter and map debuffs: skip hidden/unique/grouped effects
    const debuffEffects: EffectMapEntry[] = (debuffs as EffectWithGroup[])
      .filter(debuff =>
        debuff.category !== 'hidden' &&
        debuff.category !== 'unique' &&
        !debuffsWithGroup.has(debuff.name) // Skip debuffs that have a group
      )
      .map(debuff => ({
        name: debuff.name,
        label: debuff.label,
        icon: debuff.icon,
        type: 'debuff' as const,
        category: debuff.category || debuffGroupToCategory.get(debuff.name) || 'utility'
      }))

    // Helper to group by category
    const groupByCategory = (effects: EffectMapEntry[]): Record<string, EffectMapEntry[]> => {
      const categoryMap: Record<string, EffectMapEntry[]> = {}
      effects.forEach(effect => {
        const category = effect.category
        if (!categoryMap[category]) {
          categoryMap[category] = []
        }
        categoryMap[category].push(effect)
      })

      // Sort effects within each category by label
      Object.values(categoryMap).forEach((effects) => {
        effects.sort((a, b) => a.label.localeCompare(b.label))
      })

      return categoryMap
    }

    return {
      buffs: groupByCategory(buffEffects),
      debuffs: groupByCategory(debuffEffects)
    }
  }, [])

  // Toggle functions pour chaque type de filtre
  const toggleElement = (element: string) => {
    setSelectedElements(prev =>
      prev.includes(element) ? prev.filter(e => e !== element) : [...prev, element]
    )
  }

  const toggleClass = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    )
  }

  const toggleRarity = (rarity: number) => {
    setSelectedRarities(prev =>
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    )
  }

  const toggleChainType = (chainType: string) => {
    setSelectedChainTypes(prev =>
      prev.includes(chainType) ? prev.filter(c => c !== chainType) : [...prev, chainType]
    )
  }

  const toggleEffect = (effectName: string, effectType: 'buff' | 'debuff') => {
    setSelectedEffects(prev => {
      const exists = prev.find(e => e.name === effectName && e.type === effectType)
      if (exists) {
        return prev.filter(e => !(e.name === effectName && e.type === effectType))
      } else {
        return [...prev, { name: effectName, type: effectType }]
      }
    })
  }

  const toggleSource = (source: SkillKey) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    )
  }

  if (!isOpen || !mounted || !portalElement) return null

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[80vh] flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Position {selectedPosition}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <FilterBar
          selectedElements={selectedElements}
          selectedClasses={selectedClasses}
          selectedRarities={selectedRarities}
          selectedChainTypes={selectedChainTypes}
          selectedEffects={selectedEffects}
          selectedSources={selectedSources}
          effectsLogic={effectsLogic}
          isFiltersExpanded={isFiltersExpanded}
          isEffectDropdownOpen={isEffectDropdownOpen}
          filteredCount={filteredCharacters.length}
          isSmallScreen={isSmallScreen}
          groupedEffects={groupedEffects}
          effectCategories={effectCategories as { buff: EffectCategory; debuff: EffectCategory }}
          onToggleElement={toggleElement}
          onToggleClass={toggleClass}
          onToggleRarity={toggleRarity}
          onToggleChainType={toggleChainType}
          onToggleEffect={toggleEffect}
          onToggleSource={toggleSource}
          onToggleEffectsLogic={() => setEffectsLogic(prev => prev === 'OR' ? 'AND' : 'OR')}
          onToggleFiltersExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
          onToggleEffectDropdown={() => setIsEffectDropdownOpen(!isEffectDropdownOpen)}
          onClearFilters={clearFilters}
          t={t}
        />

        {/* Character Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <CharacterGrid
            characters={filteredCharacters}
            onSelectCharacter={(characterId, characterName) => {
              onSelect(characterId, characterName)
              onClose()
            }}
          />
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, portalElement)
}

type EffectData = { name: string; category?: string; group?: string }

export function groupEffects(
  allEffects: string[],
  effectsData: EffectData[],
  categoryKeys: string[],
  type: 'buff' | 'debuff',
  showUniqueEffects: boolean
) {
  const clean = [...new Set(
    allEffects.map(s => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
  )]

  // Create maps for quick lookup
  const effectToCategory = new Map<string, string>()
  const effectToGroup = new Map<string, string>()
  const groupedEffects = new Set<string>() // Effects that have a group (should be hidden)
  const groupToCategory = new Map<string, string>() // Map group name to its category

  for (const effect of effectsData) {
    if (effect.category) {
      effectToCategory.set(effect.name, effect.category)
    }
    if (effect.group) {
      effectToGroup.set(effect.name, effect.group)
      groupedEffects.add(effect.name) // Mark as grouped (will be hidden)

      // Remember which category the group belongs to
      if (effect.category) {
        groupToCategory.set(effect.group, effect.category)
      }
    }
  }

  // Build a set of effects to display (including parent groups)
  const effectsToDisplay = new Set<string>()

  for (const effectName of clean) {
    if (groupedEffects.has(effectName)) {
      // This effect has a group, add the group instead
      const groupName = effectToGroup.get(effectName)
      if (groupName) {
        effectsToDisplay.add(groupName)
      }
    } else {
      // Regular effect, add it directly
      effectsToDisplay.add(effectName)
    }
  }

  const grouped: { title: string; effects: string[] }[] = []

  for (const categoryKey of categoryKeys) {
    // Skip hidden category (never display)
    if (categoryKey === 'hidden') {
      continue
    }

    // Skip unique category if showUniqueEffects is false
    if (!showUniqueEffects && categoryKey === 'unique') {
      continue
    }

    // Get all effects in this category that should be displayed
    const effectsInCategory = Array.from(effectsToDisplay)
      .filter(effectName => {
        // Check if it's a direct effect with this category
        const directCategory = effectToCategory.get(effectName)
        if (directCategory === categoryKey) return true

        // Check if it's a group name belonging to this category
        const groupCategory = groupToCategory.get(effectName)
        if (groupCategory === categoryKey) return true

        return false
      })
      .sort() // Sort alphabetically

    if (effectsInCategory.length) {
      grouped.push({
        title: `characters.effectsGroups.${type}.${categoryKey}`,
        effects: effectsInCategory
      })
    }
  }

  return grouped
}

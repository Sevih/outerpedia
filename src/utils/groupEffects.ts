export function groupEffects(
  allEffects: string[],
  orderedGroups: { title: string; items: string[] }[],
  showUniqueEffects: boolean
) {
  const clean = [...new Set(
    allEffects.map(s => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
  )]
  const cleanSet = new Set(clean)
  const grouped: { title: string; effects: string[] }[] = []

  for (const group of orderedGroups) {
    const effectsInGroup = group.items.filter(
      e => cleanSet.has(e) && (showUniqueEffects || !e.startsWith('UNIQUE_'))
    )
    if (effectsInGroup.length) grouped.push({ title: group.title, effects: effectsInGroup })
  }

  
  return grouped
}

export function groupEffects(
    allEffects: string[],
    orderedGroups: { title: string; items: string[] }[],
    showUniqueEffects: boolean
  ) {
    const grouped: { title: string; effects: string[] }[] = [];
  
    const knownEffects = new Set(orderedGroups.flatMap((g) => g.items));
  
    for (const group of orderedGroups) {
      const effectsInGroup = group.items.filter((effect) => allEffects.includes(effect));
      if (effectsInGroup.length > 0) {
        grouped.push({ title: group.title, effects: effectsInGroup });
      }
    }
  
    const otherEffects = allEffects.filter((effect) => {
      if (knownEffects.has(effect)) return false;
      if (!showUniqueEffects && effect.startsWith('UNIQUE_')) return false;
      return true;
    });
  
    if (otherEffects.length > 0) {
      grouped.push({ title: 'Other', effects: otherEffects });
    }
    
    return grouped;
  }
  
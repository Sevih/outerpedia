export function normalizeClass(input: string | string[] | null | undefined): string[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}

/**
 * Retourne le chemin du background selon la rareté de l'item
 * @param rarity - La rareté de l'item (legendary, epic, superior, normal)
 * @param fallback - Rareté par défaut si non trouvée
 */
const rarityMap: Record<string, string> = {
  legendary: 'legendary',
  epic: 'epic',
  superior: 'superior',
  normal: 'normal',
  // Aliases
  rare: 'superior',
  uncommon: 'normal',
  common: 'normal',
}

function normalizeRarity(rarity?: string | number | null, fallback = 'legendary'): string {
  const key = String(rarity ?? fallback).toLowerCase()
  return rarityMap[key] ?? fallback
}

export function getRarityBg(rarity?: string | number | null, fallback = 'legendary'): string {
  return `/images/bg/CT_Slot_${normalizeRarity(rarity, fallback)}.webp`
}

/**
 * Retourne la classe Tailwind pour la couleur du texte selon la rareté
 * legendary = rouge, epic = violet, superior = bleu, normal = blanc
 */
export function getRarityTextClass(rarity?: string | number | null, fallback = 'legendary'): string {
  const colorMap: Record<string, string> = {
    legendary: 'text-red-400',
    epic: 'text-blue-300',
    superior: 'text-green-400',
    normal: 'text-gray-200',
  }
  return colorMap[normalizeRarity(rarity, fallback)] ?? colorMap.legendary
}

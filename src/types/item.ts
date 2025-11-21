// src/types/item.ts
import type { WithLocalizedFields } from '@/types/common'

export type ItemRarity = 'normal' | 'superior' | 'epic' | 'legendary'

/**
 * Type de base pour un item (sans variantes localisées)
 */
export interface ItemBase {
  /** Nom canon EN (sert pour les slugs/images) */
  name: string
  /** Rareté de l'item */
  rarity: ItemRarity
  /** Description de l'item (peut être string ou objet localisé) */
  description: string
  /** Icône personnalisée (optionnelle) */
  icon?: string
}

/**
 * Type complet avec variantes localisées pour name et description
 * Ajoute automatiquement: name_jp, name_kr, description_jp, description_kr
 */
export type Item = WithLocalizedFields<ItemBase, 'name' | 'description'>

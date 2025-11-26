// src/types/hero-content.ts
import type { WithLocalizedFields } from "@/types/common"

/**
 * Type de base pour les Pros & Cons d'un héros
 */
export interface ProsConsBase {
  pro?: string[]
  con?: string[]
}

/**
 * Type complet avec variantes localisées pour pro et con
 */
export type ProsCons = WithLocalizedFields<
  WithLocalizedFields<ProsConsBase, 'pro'>,
  'con'
>

/**
 * Map des Pros & Cons par slug de héros
 */
export type ProsConsMap = Record<string, ProsCons>

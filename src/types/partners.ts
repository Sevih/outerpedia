// src/types/partners.ts
import type { Localized } from "@/types/common"

/**
 * Type pour une entrée de partenaire avec reason localisé
 */
export interface PartnerEntry {
  hero: string[]
  reason: Localized
}

// Élément du tableau "partner" :
// - soit une entrée finale (PartnerEntry)
// - soit un objet imbriqué { "<autre-slug>": { partner: [...]} }
export type PartnerNested = Record<string, { partner: PartnerItem[] }>
export type PartnerItem = PartnerEntry | PartnerNested

// Racine : Record<slug, { partner: PartnerItem[] }>
export type PartnerRoot = Record<string, { partner: PartnerItem[] }>

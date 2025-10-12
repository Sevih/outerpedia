// src/types/partners.ts
export type PartnerReason = { en: string; jp: string; kr: string };
export type PartnerEntry = { hero: string[]; reason: PartnerReason };

// Élément du tableau "partner" :
// - soit une entrée finale (PartnerEntry)
// - soit un objet imbriqué { "<autre-slug>": { partner: [...]} }
export type PartnerNested = Record<string, { partner: PartnerItem[] }>;
export type PartnerItem = PartnerEntry | PartnerNested;

// Racine : Record<slug, { partner: PartnerItem[] }>
export type PartnerRoot = Record<string, { partner: PartnerItem[] }>;

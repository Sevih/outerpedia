// src/types/common.ts
// Types communs réutilisables dans tout le projet

import type { TenantKey } from '@/tenants/config'

/**
 * Type pour les chaînes localisées
 * Utilise Partial pour rendre toutes les langues optionnelles sauf 'en'
 */
export type Localized = {
  en: string
} & Partial<Record<Exclude<TenantKey, 'en'>, string>>

/**
 * Alias pour une localisation complètement optionnelle
 */
export type LocalizedOptional = Partial<Record<TenantKey, string>>

/**
 * Type utilitaire pour ajouter des variantes localisées à des champs spécifiques
 * Utilisé pour les objets avec pattern: field avec suffixe
 *
 * @example
 * type MyType = { name: string, age: number }
 * type LocalizedMyType = WithLocalizedFields<MyType, 'name'>
 * //
 */
export type WithLocalizedFields<T, K extends keyof T> = T & {
  [P in Exclude<TenantKey, 'en'> as `${K & string}_${P}`]?: T[K]
}

/**
 * Type utilitaire pour extraire les noms de tous les champs localisés d'un type
 * Génère une union de tous les champs base + leurs variantes localisées
 *
 * @example
 * type MyType = { name avec suffixe: string}
 * type LocalizedKeys = LocalizedFieldNames<MyType, 'name'>

 */
export type LocalizedFieldNames<T, K extends keyof T> =
  | K
  | `${K & string}_${Exclude<TenantKey, 'en'>}`

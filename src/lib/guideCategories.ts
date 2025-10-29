// lib/guideCategories.ts
import rawCategoryMeta from '@/data/guides/categories.json'

type CategoryMeta = {
  icon: string
  valid: boolean
  keywords?: string[]
}

export const categoryMeta = rawCategoryMeta as Record<string, CategoryMeta>

/**
 * Get the localized title for a guide category from i18n
 * @param categorySlug - The category slug (e.g., "general-guides")
 * @param t - The i18n translation function
 * @returns The localized title
 */
export function getCategoryTitle(
  categorySlug: string,
  t: (key: string) => string
): string {
  return t(`guides.categories.${categorySlug}.title`)
}

/**
 * Get the localized description for a guide category from i18n
 * @param categorySlug - The category slug (e.g., "general-guides")
 * @param t - The i18n translation function
 * @returns The localized description
 */
export function getCategoryDescription(
  categorySlug: string,
  t: (key: string) => string
): string {
  return t(`guides.categories.${categorySlug}.description`)
}

/**
 * Get all category metadata including localized title and description
 * @param categorySlug - The category slug
 * @param t - The i18n translation function
 * @returns Complete category data with localized strings
 */
export function getCategoryData(
  categorySlug: string,
  t: (key: string) => string
) {
  const meta = categoryMeta[categorySlug]
  if (!meta) return null

  return {
    ...meta,
    title: getCategoryTitle(categorySlug, t),
    description: getCategoryDescription(categorySlug, t),
  }
}

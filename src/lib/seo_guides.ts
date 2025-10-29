// src/lib/seo.ts
import type { TenantKey } from '@/tenants/config'
import { getServerI18n } from '@/lib/contexts/server-i18n'

function dedupeByLocale(list: string[], lang: TenantKey): string[] {
  const norm = (s: string) => (lang === 'en' ? s.toLowerCase() : s)
  return Array.from(new Map(list.map(k => [norm(k), k])).values())
}

const CATEGORY_KEYS = [
  'adventure',
  'world-boss',
  'joint-boss',
  'adventure-license',
  'special-request',
  'irregular-extermination',
  'guild-raid',
  'general-guides',
  'skyward-tower',
  'monad-gate',
] as const

export async function generateGuideKeywords(category: string, metaTitle: string, lang: TenantKey): Promise<string[]> {
  const { t } = await getServerI18n(lang)

  // Base keywords from i18n
  const baseKeywords = [
    t('seo.gameName'),
    t('seo.siteName'),
    t('seo.wiki'),
    t('seo.guide'),
    metaTitle,
    `${metaTitle} ${t('seo.guideSuffix')}`,
    metaTitle.toLowerCase().replace(/\s+/g, '-'),
    t('seo.characterBuilds'),
    t('seo.turnBasedRpg'),
    t('seo.mobileRpg'),
  ]

  // Find matching category key
  const categoryKey = CATEGORY_KEYS.find(k => category.toLowerCase().includes(k))

  // Add category-specific keywords if found
  const categoryKeywords = categoryKey
    ? t(`seo.category.${categoryKey}`).split(',')
    : []

  const allKeywords = [...baseKeywords, ...categoryKeywords]
  return dedupeByLocale(allKeywords, lang)
}

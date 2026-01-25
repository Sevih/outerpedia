import { getAvailableLanguageCodes, type TenantKey } from '@/tenants/config'
import { l } from '@/lib/localize'
import type { ExclusiveEquipment } from '@/types/character'

// --- Types JSON-safe
type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[]

export type JsonLdObject = { [key: string]: JSONValue }

// --- EE type (utilise le type centralisé au lieu d'une redéfinition)
export type EEEntry = ExclusiveEquipment

// --- Normalise le domaine
function normalizeBase(domain: string): string {
  const trimmed = domain.trim()
  if (!trimmed) return 'https://outerpedia.com'
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  return withProto.replace(/\/+$/, '')
}

// --- Pick language key removed - using centralized l() function

// --- Nettoie les balises et espaces pour JSON-LD
function stripRichText(s: string): string {
  return s
    // supprime <color=...>...</color>
    .replace(/<\/?color[^>]*>/gi, '')
    // remplace <br> par espace
    .replace(/<br\s*\/?>/gi, ' ')
    // compact espaces
    .replace(/\s+/g, ' ')
    .trim()
}

// --------- LDs génériques ---------
export function websiteLd(domain: string): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Outerpedia',
    url: `${base}/`,
  }
}

export function breadcrumbLd(
  domain: string,
  labels: { home: string; current: string; currentPath?: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  const currentUrl = `${base}${labels.currentPath ?? '/ee-priority'}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: labels.home, item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: labels.current, item: currentUrl },
    ],
  }
}

// --------- EE ItemList localisé (+0) ---------
type CharacterLite = { ID: string | number; Fullname: string }
type CharacterMap = Record<string, CharacterLite>

/**
 * Construit un ItemList pour la page EE Priority (+0).
 * - name/effect choisis selon la langue 
 * - description nettoyée (sans <color>)
 */
export function itemListLd(
  domain: string,
  opts: {
    title: string
    description: string
    list: Record<string, EEEntry> // slug → EE
    characterMap: CharacterMap    // slug → Character
    imageKind?: 'portrait' | 'atb'
    lang: TenantKey
  }
): JsonLdObject {
  const base = normalizeBase(domain)
  const imageForId = (id: string | number) =>
    opts.imageKind === 'atb'
      ? `${base}/images/characters/atb/IG_Turn_${id}.webp`
      : `${base}/images/characters/portrait/CT_${id}.webp`

  const elements: JSONValue[] = []
  let pos = 0

  for (const [slug, ee] of Object.entries(opts.list)) {
    const char = opts.characterMap[slug]
    if (!char) continue

    // Localisés (fallback EN → JP → KR)
    const name = l(ee, 'name', opts.lang)

    // EE Priority +0 → on utilise 'effect' (pas effect10)
    const rawEffect = l(ee, 'effect', opts.lang) || ''

    const description = stripRichText(rawEffect)

    pos += 1
    elements.push({
      '@type': 'ListItem',
      position: pos,
      url: `${base}/characters/${slug}`,
      name,
      image: imageForId(char.ID),
      description,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.title,
    url: `${base}/ee-priority`,
    description: opts.description,
    itemListElement: elements,
    inLanguage: getAvailableLanguageCodes(),
  }
}

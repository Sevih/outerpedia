// JSON-safe typing (même pattern que Pull Sim)
import { getAvailableLanguageCodes } from '@/tenants/config'

type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[]

export type JsonLdObject = { [key: string]: JSONValue }

function normalizeBase(domain: string): string {
  const trimmed = domain.trim()
  if (!trimmed) return 'https://outerpedia.com'
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  return withProto.replace(/\/+$/, '')
}

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
  labels: { home: string; current: string; currentPath: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  const currentUrl = `${base}${labels.currentPath}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: labels.home, item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: labels.current, item: currentUrl },
    ],
  }
}

// Pull Sim garde WebApplication (ok)
export function webAppLd(domain: string, opts: { name: string; description: string }): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    applicationCategory: ['Game', 'Simulation'],
    operatingSystem: 'Web',
    url: `${base}/`,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    isAccessibleForFree: true,
    inLanguage: getAvailableLanguageCodes(),
  }
}

// Item pages: WebPage avec about (Thing)
export function itemWebPageLd(domain: string, opts: {
  name: string
  category: 'weapon' | 'accessory' | 'set'
  imageUrl: string
  path: string
}): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${opts.name} | ${opts.category} | Outerpedia`,
    url: `${base}${opts.path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Outerpedia',
      url: `${base}/`,
    },
    inLanguage: getAvailableLanguageCodes(),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: opts.imageUrl,
    },
    about: {
      '@type': 'Thing',
      name: opts.name,
      // on précise qu'il s'agit d’un item de jeu
      additionalType: 'https://schema.org/Thing',
      // info libre utile pour le contexte de la page
      category: opts.category,
      image: opts.imageUrl,
    },
  }
}

// JSON-safe typing (même pattern que Pull Sim / Items)
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

export function guidesWebPageLd(domain: string, opts: {
  title: string
  description: string
  path: string
  imageUrl: string
}): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.title,
    url: `${base}${opts.path}`,
    description: opts.description,
    isPartOf: { '@type': 'WebSite', name: 'Outerpedia', url: `${base}/` },
    inLanguage: getAvailableLanguageCodes(),
    primaryImageOfPage: { '@type': 'ImageObject', url: opts.imageUrl },
  }
}

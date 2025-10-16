// app/(tools)/patch-history/jsonld.ts

// A JSON-safe value (no functions, no undefined)
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

/** Minimal WebSite LD (JSON-safe) */
export function websiteLd(domain: string): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Outerpedia',
    url: `${base}/`,
  }
}

/** Breadcrumb LD (Home → Current) */
export function breadcrumbLd(
  domain: string,
  labels: { home: string; current: string; currentPath?: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  const currentUrl = `${base}${labels.currentPath ?? '/patch-history'}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: labels.home,
        item: `${base}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: labels.current,
        item: currentUrl,
      },
    ],
  }
}

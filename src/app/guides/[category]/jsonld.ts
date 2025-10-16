// Même pattern JSON-safe que les autres pages
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

/** Collection de guides d'une catégorie */
export function guidesCollectionLd(domain: string, opts: {
  title: string
  description: string
  path: string
  items: Array<{
    title: string
    author: string
    last_updated: string
    description: string
  }>
}): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.title,
    description: opts.description,
    url: `${base}${opts.path}`,
    isPartOf: { '@type': 'WebSite', name: 'Outerpedia', url: `${base}/` },
    mainEntity: opts.items.map(g => ({
      '@type': 'Article',
      headline: g.title,
      author: { '@type': 'Person', name: g.author },
      datePublished: g.last_updated,
      description: g.description,
    })),
  }
}

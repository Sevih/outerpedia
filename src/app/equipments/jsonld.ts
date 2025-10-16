// JSON-safe typing (même pattern que le reste)
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

/** Page collection d’équipements */
export function equipmentsCollectionLd(domain: string, opts: {
  title: string
  description: string
  path: string
  imageUrl: string
  counts: { weapons: number; accessories: number; talismans: number; sets: number; ee: number }
  inLanguage: ('en' | 'jp' | 'kr')[]
}): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.title,
    description: opts.description,
    url: `${base}${opts.path}`,
    isPartOf: { '@type': 'WebSite', name: 'Outerpedia', url: `${base}/` },
    inLanguage: opts.inLanguage,
    primaryImageOfPage: { '@type': 'ImageObject', url: opts.imageUrl },
    about: [
      { '@type': 'Thing', name: 'Weapons', additionalProperty: { '@type': 'PropertyValue', name: 'count', value: opts.counts.weapons } },
      { '@type': 'Thing', name: 'Accessories', additionalProperty: { '@type': 'PropertyValue', name: 'count', value: opts.counts.accessories } },
      { '@type': 'Thing', name: 'Talismans', additionalProperty: { '@type': 'PropertyValue', name: 'count', value: opts.counts.talismans } },
      { '@type': 'Thing', name: 'Sets', additionalProperty: { '@type': 'PropertyValue', name: 'count', value: opts.counts.sets } },
      { '@type': 'Thing', name: 'Exclusive Equipment', additionalProperty: { '@type': 'PropertyValue', name: 'count', value: opts.counts.ee } },
    ],
  }
}

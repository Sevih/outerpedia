// JSON-safe typing util
type JSONValue = string | number | boolean | null | { [k: string]: JSONValue } | JSONValue[]
export type JsonLdObject = { [k: string]: JSONValue }

function normalizeBase(domain: string): string {
  const d = domain?.trim() || 'outerpedia.com'
  const withProto = /^https?:\/\//i.test(d) ? d : `https://${d}`
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
  labels: { home: string; current: string; currentPath?: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  const currentUrl = `${base}${labels.currentPath ?? '/tierlist'}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: labels.home, item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: labels.current, item: currentUrl },
    ],
  }
}

export function tierCollectionsLd(
  domain: string,
  opts: { title: string; description: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.title,
    url: `${base}/tierlist`,
    description: opts.description,
    hasPart: [
      {
        '@type': 'ItemList',
        name: 'PvE Tier List',
        url: `${base}/tierlistpve`,
      },
      {
        '@type': 'ItemList',
        name: 'PvP Tier List',
        url: `${base}/tierlistpvp`,
      },
    ],
  }
}

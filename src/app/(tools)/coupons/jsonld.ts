// app/(tools)/coupons/jsonld.ts
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
  labels: { home: string; current: string; currentPath?: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  const currentUrl = `${base}${labels.currentPath ?? '/coupons'}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: labels.home, item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: labels.current, item: currentUrl },
    ],
  }
}

/** ItemList simple : chaque code devient un ListItem avec période de validité dans la description */
export function couponsListLd(
  domain: string,
  opts: {
    title: string
    description: string
    list: { code: string; start: string; end: string; status: 'active' | 'expired' | 'upcoming' }[]
  }
): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.title,
    url: `${base}/coupons`,
    description: opts.description,
    itemListElement: opts.list.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.code,
      url: `${base}/coupons#${encodeURIComponent(c.code)}`,
      description: `Valid ${c.start} → ${c.end} · ${c.status}`,
    })),
  }
}

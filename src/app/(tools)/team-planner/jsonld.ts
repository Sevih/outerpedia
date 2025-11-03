// app/(tools)/team-planner/jsonld.ts

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
  const currentUrl = `${base}${labels.currentPath ?? '/team-planner'}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: labels.home, item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: labels.current, item: currentUrl },
    ],
  }
}

export function webPageLd(domain: string, description: string): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Team Planner - Outerpedia',
    description,
    url: `${base}/team-planner`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Outerpedia',
      url: `${base}/`,
    },
  }
}

export function softwareApplicationLd(domain: string): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Outerplane Team Planner',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    description: 'Build and validate teams for Outerplane with custom rules and restrictions',
    url: `${base}/team-planner`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

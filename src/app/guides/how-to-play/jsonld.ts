// JSON-safe typing
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
  labels: { home: string; guides: string; current: string; currentPath?: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  const currentUrl = `${base}${labels.currentPath ?? '/guides/how-to-play'}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: labels.home, item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: labels.guides, item: `${base}/guides` },
      { '@type': 'ListItem', position: 3, name: labels.current, item: currentUrl },
    ],
  }
}

export function articleLd(
  domain: string,
  opts: { title: string; description: string; datePublished: string; dateModified: string; author: string; path?: string }
): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      '@type': 'Person',
      name: opts.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Outerpedia',
      url: base,
    },
    url: `${base}${opts.path ?? '/guides/how-to-play'}`,
    inLanguage: 'en',
  }
}
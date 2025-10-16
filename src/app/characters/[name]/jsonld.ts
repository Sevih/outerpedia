// app/characters/[name]/jsonld.ts
type JSONValue =
  | string | number | boolean | null
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
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Outerpedia', url: `${base}/` }
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
      { '@type': 'ListItem', position: 2, name: 'Characters', item: `${base}/characters` },
      { '@type': 'ListItem', position: 3, name: labels.current, item: currentUrl },
    ],
  }
}

export function characterWebPageLd(
  domain: string,
  opts: {
    title: string
    description: string
    path: string
    imageUrl: string
    inLanguage: ('en' | 'jp' | 'kr')[]
    attrs: { name: string; id: string; element: string; class: string; subclass?: string }
  }
): JsonLdObject {
  const base = normalizeBase(domain)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.title,
    description: opts.description,
    url: `${base}${opts.path}`,
    inLanguage: opts.inLanguage,
    isPartOf: { '@type': 'WebSite', name: 'Outerpedia', url: `${base}/` },
    primaryImageOfPage: { '@type': 'ImageObject', url: opts.imageUrl },
    about: {
      '@type': 'Thing',
      name: opts.attrs.name,
      identifier: opts.attrs.id,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Element', value: opts.attrs.element },
        { '@type': 'PropertyValue', name: 'Class', value: opts.attrs.class },
        ...(opts.attrs.subclass ? [{ '@type': 'PropertyValue', name: 'SubClass', value: opts.attrs.subclass }] : []),
      ],
    },
  }
}

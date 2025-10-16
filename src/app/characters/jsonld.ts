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

/** Collection de personnages (légère, sans tout lister) */
export function charactersCollectionLd(
  domain: string,
  opts: {
    title: string
    description: string
    path: string
    imageUrl: string
    inLanguage: ('en' | 'jp' | 'kr')[]
    count: number
    sample?: Array<{ name: string; url: string; image: string; description?: string }>
  }
): JsonLdObject {
  const base = normalizeBase(domain)

  const mainEntity = opts.sample && opts.sample.length
    ? opts.sample.map((c) => {
        const item: { [key: string]: JSONValue } = {
          '@type': 'CreativeWork',
          name: c.name,
          url: c.url,
          image: c.image,
        }
        if (c.description) item.description = c.description // ✅ pas d'undefined dans l'objet
        return item
      })
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.title,
    description: opts.description,
    url: `${base}${opts.path}`,
    isPartOf: { '@type': 'WebSite', name: 'Outerpedia', url: `${base}/` },
    inLanguage: opts.inLanguage,
    primaryImageOfPage: { '@type': 'ImageObject', url: opts.imageUrl },
    about: {
      '@type': 'Thing',
      name: 'Characters',
      additionalProperty: { '@type': 'PropertyValue', name: 'count', value: opts.count },
    },
    ...(mainEntity ? { mainEntity } : {}), // ✅ on n’ajoute la clé que si elle existe
  }
}
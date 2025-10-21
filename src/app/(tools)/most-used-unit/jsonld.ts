export function websiteLd(domain: string) {
  const base = `https://${domain}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: base,
    name: 'Outerpedia',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/search?q={query}`,
      'query-input': 'required name=query',
    },
  }
}

export function breadcrumbLd(
  domain: string,
  labels?: { home?: string; current?: string }
) {
  const base = `https://${domain}`
  const home = labels?.home ?? 'Home'
  const current = labels?.current ?? 'Most Used Units'
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: home,
        item: base,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: current,
        item: `${base}/most-used-unit`,
      },
    ],
  }
}

import type { MetadataRoute } from 'next'
import { getTenant } from '@/tenants/tenant'

export const dynamic = 'force-dynamic'        // généré au build puis mis en cache

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { domain } = await getTenant()

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/images/tmp/', '/webhooks/', '/UnderConstruction/'] },
    ],
    sitemap: `https://${domain}/sitemap.xml`,
    host: `https://${domain}`,
  }
}

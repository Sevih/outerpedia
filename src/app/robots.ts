// src/app/robots.ts
import type { MetadataRoute } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { domain } = await getTenantServer()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/images/tmp/', '/webhooks/', '/UnderConstruction/'],
      },
    ],
    sitemap: `https://${domain}/sitemap.xml`,
    host: `https://${domain}`,
  }
}

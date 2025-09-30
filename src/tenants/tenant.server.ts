// src/tenants/tenant.server.ts
import { headers } from 'next/headers'
import { resolveTenantFromHost, type TenantKey } from './config'

export async function getTenantServer(): Promise<{ key: TenantKey; domain: string }> {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const key = resolveTenantFromHost(host || '')
  return { key, domain: host.toLowerCase() }
}

// src/tenants/tenant.client.ts
'use client'
import { resolveTenantFromHost, type TenantKey } from './config'

export function getTenantKeyClient(): TenantKey {
  const host = typeof window !== 'undefined' ? window.location.host : ''
  return resolveTenantFromHost(host)
}

import { headers } from 'next/headers';
import { TENANTS, resolveTenantFromHost, type TenantKey } from './config';

export async function getTenant() {
  const h = await headers();
  const host = h.get('host') ?? TENANTS.en.domain;
  const key = resolveTenantFromHost(host) as TenantKey;
  return { key, ...TENANTS[key] };
}

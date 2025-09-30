'use client';
import { getT } from './index';
import type { TenantKey } from '@/tenants/config';

export function T({ k, current, fallback }: { k: string; current: TenantKey; fallback?: string }) {
  const t = getT(current);
  return <>{t(k, fallback)}</>;
}

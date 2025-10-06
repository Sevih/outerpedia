import type { TenantKey } from '@/tenants/config';
import en from './locales/en';
import kr from './locales/kr';
import jp from './locales/jp';

type Messages = Record<keyof typeof en, string>;

const DICTS: Record<TenantKey, Messages> = {
  en: en as Messages,
  kr: kr as Messages,
  jp: jp as Messages,
};

export function getT(current: TenantKey) {
  const dict = DICTS[current] ?? DICTS.en;
  return (key: keyof typeof en | string, fallback?: string) =>
    (dict as Record<string, string>)[key] ?? fallback ?? String(key);
}

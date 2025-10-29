import type { TenantKey } from '@/tenants/config';
import en from './locales/en';
import kr from './locales/kr';
import jp from './locales/jp';
import zh from './locales/zh';

export type Messages = Record<string, string>;

const DICTS: Record<TenantKey, Messages> = {
  en: en as Messages,
  kr: kr as Messages,
  jp: jp as Messages,
  zh: zh as Messages,
};

export function getT(current: TenantKey) {
  const dict = DICTS[current] ?? DICTS.en;
  return (key: keyof typeof en | string, fallback?: string) =>
    (dict as Record<string, string>)[key] ?? fallback ?? String(key);
}

/**
 * Import dynamique d'un fichier de locale pour le server-side
 * Centralisé ici pour éviter de dupliquer le switch case
 */
export async function importLocale(lang: TenantKey): Promise<Messages> {
  switch (lang) {
    case 'en': return (await import('./locales/en')).default
    case 'jp': return (await import('./locales/jp')).default
    case 'kr': return (await import('./locales/kr')).default
    case 'zh': return (await import('./locales/zh')).default
    default: return (await import('./locales/en')).default
  }
}

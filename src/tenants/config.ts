// src/tenants/config.ts

export type TenantKey = 'en' | 'jp' | 'kr' | 'zh';

export const BASE_DOMAIN =
  process.env.NEXT_PUBLIC_BASE_DOMAIN || 'outerpedia.local';

export const TENANTS: Record<TenantKey, {
  locale: 'en-US'|'ja-JP'|'ko-KR'|'zh-CN';
  label: string;
  domain: string;
  theme?: 'default'|'jp'|'kr'|'zh';
}> = {
  en: { locale: 'en-US', label: 'English',  domain: BASE_DOMAIN,         theme: 'default' },
  jp: { locale: 'ja-JP', label: '日本語',     domain: `jp.${BASE_DOMAIN}`, theme: 'jp' },
  kr: { locale: 'ko-KR', label: '한국어',     domain: `kr.${BASE_DOMAIN}`, theme: 'kr' },
  zh: { locale: 'zh-CN', label: '简体中文',   domain: `zh.${BASE_DOMAIN}`, theme: 'zh' },
};

export function resolveTenantFromHost(host?: string): TenantKey {
  if (!host) return 'en';
  const h = host.toLowerCase().split(':')[0];
  const parts = h.split('.');
  const sub = parts.length > 2 ? parts[0] : '';
  if (sub === 'jp') return 'jp';
  if (sub === 'kr') return 'kr';
  if (sub === 'zh') return 'zh';
  return 'en';
}

export const OG_LOCALE: Record<TenantKey, string> = {
  en: 'en_US',
  jp: 'ja_JP',
  kr: 'ko_KR',
  zh: 'zh_CN',
};

export const HREFLANG: Record<TenantKey, string> = {
  en: 'en',
  jp: 'ja',
  kr: 'ko',
  zh: 'zh',
};

/**
 * Retourne toutes les langues disponibles (depuis TENANTS)
 * Utiliser cette fonction au lieu de hardcoder ['en', 'jp', 'kr', 'zh']
 */
export function getAvailableLanguages(): TenantKey[] {
  return Object.keys(TENANTS) as TenantKey[];
}

/**
 * Retourne les codes de langue pour JSON-LD (ex: ['en', 'ja', 'ko', 'zh'])
 * Utilise HREFLANG au lieu de TenantKey
 */
export function getAvailableLanguageCodes(): string[] {
  return getAvailableLanguages().map(k => HREFLANG[k]);
}

/**
 * Langues pour lesquelles VA Games publie des notices live
 * Si VA Games ajoute une nouvelle langue (ex: zh), il suffit de l'ajouter ici
 */
export const VA_AVAILABLE_LANGUAGES = ['en', 'kr', 'jp'] as const;
export type VALanguage = typeof VA_AVAILABLE_LANGUAGES[number];

/**
 * Mapper une TenantKey vers une langue VA disponible
 * Si la langue du tenant n'a pas de notices VA, retourne 'en' par défaut
 */
export function getVALanguage(tenantKey: TenantKey): VALanguage {
  return (VA_AVAILABLE_LANGUAGES as readonly string[]).includes(tenantKey)
    ? (tenantKey as VALanguage)
    : 'en';
}

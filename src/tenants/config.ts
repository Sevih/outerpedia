export type TenantKey = 'en' | 'fr' | 'jp' | 'kr';

// base domain injectée par env (local: outerpedia.local, prod: outerpedia.com)
export const BASE_DOMAIN =
  process.env.NEXT_PUBLIC_BASE_DOMAIN || 'outerpedia.local';

export const TENANTS: Record<TenantKey, {
  locale: 'en-US'|'fr-FR'|'ja-JP'|'ko-KR';
  label: string;
  // domaine calculé à partir de BASE_DOMAIN (marche en local et en prod)
  domain: string;
  theme?: 'default'|'fr'|'jp'|'kr';
}> = {
  en: { locale: 'en-US', label: 'English',  domain: BASE_DOMAIN,                theme: 'default' },
  fr: { locale: 'fr-FR', label: 'Français', domain: `fr.${BASE_DOMAIN}`,        theme: 'fr' },
  jp: { locale: 'ja-JP', label: '日本語',     domain: `jp.${BASE_DOMAIN}`,        theme: 'jp' },
  kr: { locale: 'ko-KR', label: '한국어',     domain: `kr.${BASE_DOMAIN}`,        theme: 'kr' },
};

// Déduction du tenant depuis *n’importe quel* host (local/prod)
// Pas besoin de connaître le "base domain" : on lit juste le 1er label.
export function resolveTenantFromHost(host?: string): TenantKey {
  if (!host) return 'en';
  const h = host.toLowerCase().split(':')[0]; // strip port
  const parts = h.split('.');
  // root domain (ex: outerpedia.com / outerpedia.local) => parts.length === 2
  const sub = parts.length > 2 ? parts[0] : '';
  if (sub === 'fr') return 'fr';
  if (sub === 'jp') return 'jp';
  if (sub === 'kr') return 'kr';
  return 'en';
}

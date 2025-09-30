// src/tenants/config.ts

export type TenantKey = 'en' | 'fr' | 'jp' | 'kr';

export const BASE_DOMAIN =
  process.env.NEXT_PUBLIC_BASE_DOMAIN || 'outerpedia.local';

export const TENANTS: Record<TenantKey, {
  locale: 'en-US'|'fr-FR'|'ja-JP'|'ko-KR';
  label: string;
  domain: string;
  theme?: 'default'|'fr'|'jp'|'kr';
}> = {
  en: { locale: 'en-US', label: 'English',  domain: BASE_DOMAIN,         theme: 'default' },
  fr: { locale: 'fr-FR', label: 'Français', domain: `fr.${BASE_DOMAIN}`, theme: 'fr' },
  jp: { locale: 'ja-JP', label: '日本語',     domain: `jp.${BASE_DOMAIN}`, theme: 'jp' },
  kr: { locale: 'ko-KR', label: '한국어',     domain: `kr.${BASE_DOMAIN}`, theme: 'kr' },
};

export function resolveTenantFromHost(host?: string): TenantKey {
  if (!host) return 'en';
  const h = host.toLowerCase().split(':')[0];
  const parts = h.split('.');
  const sub = parts.length > 2 ? parts[0] : '';
  if (sub === 'fr') return 'fr';
  if (sub === 'jp') return 'jp';
  if (sub === 'kr') return 'kr';
  return 'en';
}

// ↓↓↓ EXPORTER ces quatre maps ↓↓↓
export const TITLES: Record<TenantKey, string> = {
  en: 'Outerplane Tier List, Character Builds, Guides & Database – Outerpedia',
  fr: 'Outerplane Tier List, Builds, Guides & Base de données – Outerpedia',
  jp: 'Outerplane ティアリスト・ビルド・ガイド・データベース – Outerpedia',
  kr: 'Outerplane 티어리스트, 빌드, 가이드 & 데이터베이스 – Outerpedia',
};

export const DESCS: Record<TenantKey, string> = {
  en: 'Explore characters, builds, gear, tier lists and join our Discord community for Outerplane!',
  fr: 'Découvrez les personnages, builds, équipements, tier lists et rejoignez notre Discord pour Outerplane !',
  jp: 'Outerplane のキャラクター、ビルド、装備、ティアリストをチェックし、Discord コミュニティに参加しよう！',
  kr: 'Outerplane의 캐릭터, 빌드, 장비, 티어리스트를 확인하고 Discord 커뮤니티에 참여하세요!',
};

export const OG_LOCALE: Record<TenantKey, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  jp: 'ja_JP',
  kr: 'ko_KR',
};

export const HREFLANG: Record<TenantKey, string> = {
  en: 'en',
  fr: 'fr',
  jp: 'ja',
  kr: 'ko',
};

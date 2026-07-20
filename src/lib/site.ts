/**
 * PROFIL DE DÉPLOIEMENT — la SEULE chose qui décide « quelle URL publique ce
 * build sert ». Tout ce qui fabrique une URL absolue (canonicals, hreflang,
 * sitemap, robots, `@id` JSON-LD) passe par ici.
 *
 * Piloté par 3 variables d'env, BAKÉES AU BUILD (`NEXT_PUBLIC_*` = build-time :
 * la génération statique fige les URLs à la compilation ; un env runtime
 * n'atteindrait PAS les pages pré-rendues). Changer de profil = rebuild.
 *
 *   | Profil       | SITE_ORIGIN                       | LANG_ROUTING | INDEXABLE |
 *   |--------------|-----------------------------------|--------------|-----------|
 *   | dev          | http://localhost:3000 (défaut)    | path         | oui       |
 *   | staging VPS  | https://vps-7b703196.vps.ovh.net  | path         | non       |
 *   | prod finale  | https://outerpedia.com            | subdomain    | oui       |
 *
 * On DÉCOUPLE volontairement « suis-je en dev » de « quelle stratégie d'URL » :
 * le staging est en `NODE_ENV=production` mais doit router par chemin (l'hôte
 * OVH ne sait pas servir `jp.vps-….ovh.net`). Bascule : docs/procedure/bascule-domaine.md
 */
import { DEFAULT_LANG, LANGUAGES, normalizeLang, type Lang } from '@/lib/i18n/config';

export type LangRouting = 'path' | 'subdomain';

/** Origine (protocole + hôte) réellement servie par CE déploiement. */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? `http://localhost:${process.env.PORT ?? 3000}`
).replace(/\/+$/, '');

/**
 * Routage des langues : `path` (/en, /jp… sur un seul hôte — dev + staging) ou
 * `subdomain` (outerpedia.com pour EN + jp.outerpedia.com… — prod finale).
 */
export const LANG_ROUTING: LangRouting =
  process.env.NEXT_PUBLIC_LANG_ROUTING === 'subdomain' ? 'subdomain' : 'path';

/**
 * Indexable par les moteurs ? Défaut SÛR : un build de production reste en
 * `noindex` tant qu'on ne l'active pas explicitement (staging VPS = noindex ;
 * prod finale = `NEXT_PUBLIC_SITE_INDEXABLE=true`). En dev, indexable par défaut
 * pour que les audits locaux (Lighthouse) ne râlent pas « blocked from indexing »
 * sur chaque page. Le noindex se pose par META (cf. app/layout.tsx), PAS par un
 * `Disallow` robots.txt : sinon Googlebot ne verrait jamais le noindex.
 */
export const SITE_INDEXABLE =
  process.env.NEXT_PUBLIC_SITE_INDEXABLE !== undefined
    ? process.env.NEXT_PUBLIC_SITE_INDEXABLE === 'true'
    : process.env.NODE_ENV !== 'production';

const ORIGIN = new URL(SITE_ORIGIN);

/**
 * Origine canonique pour les `@id` JSON-LD — stable pour un déploiement donné,
 * pour que les cross-refs survivent aux sous-domaines de langue.
 */
export const CANONICAL_ORIGIN = SITE_ORIGIN;

/** URL de base (racine, langue par défaut) — robots, llms.txt, `metadataBase`. */
export function getBaseUrl(): string {
  return SITE_ORIGIN;
}

/** URL absolue pour une langue + un chemin, selon le profil de déploiement. */
export function buildUrl(lang: Lang, path = ''): string {
  const segment = path === '/' ? '' : path;
  const safeLang = normalizeLang(lang);
  if (LANG_ROUTING === 'subdomain') {
    const sub = LANGUAGES[safeLang].subdomain; // '' pour la langue par défaut (apex)
    return sub ? `${ORIGIN.protocol}//${sub}.${ORIGIN.host}${segment}` : `${SITE_ORIGIN}${segment}`;
  }
  // path : un préfixe de chemin par langue — SAUF la langue par défaut, servie
  // sans préfixe (le proxy REDIRIGE /en/* vers /*) : canonical/hreflang doivent
  // porter l'URL réellement servie, jamais une URL qui redirige (audit Sitebulb
  // 20/07 : 1163 canonicals vers redirection). Même convention que le mode
  // subdomain (apex = langue par défaut).
  return safeLang === DEFAULT_LANG
    ? `${SITE_ORIGIN}${segment}`
    : `${SITE_ORIGIN}/${safeLang}${segment}`;
}

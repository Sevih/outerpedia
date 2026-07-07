/**
 * SEO centralisé — métadonnées de page + builders JSON-LD.
 *
 * Objectif : chaque page n'a qu'à appeler `createPageMetadata` (canonical +
 * hreflang + OpenGraph + Twitter) et éventuellement un builder JSON-LD, sans
 * redupliquer la logique d'URL/langue. Porté de la V2, adapté à la config V3.
 */
import type { Metadata } from 'next';
import { LANGUAGES, LANGS, DEFAULT_LANG, isValidLang, type Lang } from '@/lib/i18n/config';

/** Normalise une langue non fiable (param de route brut) vers une Lang valide. */
function normalizeLang(lang: string): Lang {
  return isValidLang(lang) ? lang : DEFAULT_LANG;
}

/** « Month Year » localisé pour les titres SEO dynamiques (tier lists…). */
export function getMonthYear(lang: Lang): string {
  return new Date().toLocaleString(LANGUAGES[normalizeLang(lang)].htmlLang, {
    month: 'long',
    year: 'numeric',
  });
}

const SITE_NAME = 'Outerpedia';
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'outerpedia.com';
const DEFAULT_OG_IMAGE = '/images/ui/og_default.jpg';

/** URL de base selon l'environnement (localhost en dev). */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development')
    return `http://localhost:${process.env.PORT ?? '3000'}`;
  return `https://${BASE_DOMAIN}`;
}

/** URL complète pour une langue + un path (path-based en dev, sous-domaine en prod). */
export function buildUrl(lang: Lang, path = ''): string {
  const segment = path === '/' ? '' : path;
  const base = getBaseUrl();
  const safeLang = normalizeLang(lang);
  if (process.env.NODE_ENV === 'development') return `${base}/${safeLang}${segment}`;
  const sub = LANGUAGES[safeLang].subdomain;
  return sub ? `https://${sub}.${BASE_DOMAIN}${segment}` : `${base}${segment}`;
}

/** Alternates hreflang pour un path (toutes les langues + x-default). */
function buildAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[LANGUAGES[l].htmlLang] = buildUrl(l, path);
  languages['x-default'] = buildUrl(DEFAULT_LANG, path);
  return languages;
}

const OG_LOCALE = Object.fromEntries(
  LANGS.map((l) => [l, LANGUAGES[l].htmlLang.replace('-', '_')]),
) as Record<Lang, string>;

type PageMetadataOptions = {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  ogImageSize?: { width: number; height: number };
  noindex?: boolean;
};

/**
 * Métadonnées complètes d'une page (title/desc/OG/Twitter/hreflang/robots).
 * NB : pas de `keywords` — la balise meta keywords est ignorée par les moteurs.
 */
export function createPageMetadata({
  lang,
  path,
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageSize,
  noindex = false,
}: PageMetadataOptions): Metadata {
  const url = buildUrl(lang, path);
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const isDefault = ogImage === DEFAULT_OG_IMAGE;
  const { width, height } =
    ogImageSize ?? (isDefault ? { width: 1200, height: 630 } : { width: 150, height: 150 });

  return {
    title,
    description,
    alternates: { canonical: url, languages: buildAlternates(path) },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: OG_LOCALE[normalizeLang(lang)],
      images: [{ url: ogImage, width, height }],
    },
    twitter: {
      card: isDefault || width > height ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(noindex && { robots: { index: false, follow: false } }),
  };
}

// ─── Builders JSON-LD ────────────────────────────────────────────────────────
// @id stables (origine canonique) pour que les cross-refs survivent aux sous-domaines.
const CANONICAL_ORIGIN = `https://${BASE_DOMAIN}`;
const WEBSITE_ID = `${CANONICAL_ORIGIN}/#website`;
const VIDEOGAME_ID = `${CANONICAL_ORIGIN}/#videogame`;
const ORGANIZATION_ID = `${CANONICAL_ORIGIN}/#organization`;
const PUBLISHER_ID = `${CANONICAL_ORIGIN}/#publisher`;
const LOGO_PATH = '/images/logo.png';

type JsonLdValue = string | number | boolean | null | JsonLdNode | JsonLdValue[];
type JsonLdNode = { [key: string]: JsonLdValue };

const absImage = (image?: string): string | undefined =>
  image ? (image.startsWith('http') ? image : `${CANONICAL_ORIGIN}${image}`) : undefined;

/** WebSite + VideoGame + éditeurs en @graph connecté (émis une fois par page). */
export function buildSiteJsonLd(lang: Lang, description: string): JsonLdNode {
  const safeLang = normalizeLang(lang);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: buildUrl(safeLang, '/'),
        name: SITE_NAME,
        description,
        inLanguage: LANGUAGES[safeLang].htmlLang,
        about: { '@id': VIDEOGAME_ID },
      },
      {
        '@type': 'VideoGame',
        '@id': VIDEOGAME_ID,
        name: 'Outerplane',
        applicationCategory: 'Game',
        genre: 'RPG',
        gamePlatform: ['Android', 'iOS'],
        operatingSystem: ['Android', 'iOS'],
        publisher: { '@id': ORGANIZATION_ID },
      },
      { '@type': 'Organization', '@id': ORGANIZATION_ID, name: 'VAGAMES CORP' },
      {
        '@type': 'Organization',
        '@id': PUBLISHER_ID,
        name: SITE_NAME,
        url: `${CANONICAL_ORIGIN}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${CANONICAL_ORIGIN}${LOGO_PATH}`,
          width: 1000,
          height: 1353,
        },
      },
    ],
  };
}

/** BreadcrumbList (les URLs doivent déjà être absolues). */
export function buildBreadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; url: string }>,
): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** VideoGameCharacter pour une fiche perso (liée au VideoGame Outerplane). */
export function buildVideoGameCharacterJsonLd(opts: {
  lang: Lang;
  path: string;
  name: string;
  description: string;
  image?: string;
}): JsonLdNode {
  const safeLang = normalizeLang(opts.lang);
  const url = buildUrl(safeLang, opts.path);
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'VideoGameCharacter',
    name: opts.name,
    description: opts.description,
    url,
    inLanguage: LANGUAGES[safeLang].htmlLang,
    partOf: { '@id': VIDEOGAME_ID },
    subjectOf: { '@type': 'WebPage', '@id': url, isPartOf: { '@id': WEBSITE_ID } },
  };
  const img = absImage(opts.image);
  if (img) node.image = img;
  return node;
}

/** ItemList pour une liste ordonnée/curée (persos, tier lists…). */
export function buildItemListJsonLd(opts: {
  name: string;
  description?: string;
  url?: string;
  items: ReadonlyArray<{ name: string; url: string }>;
  itemListOrder?: 'Ascending' | 'Descending' | 'Unordered';
}): JsonLdNode {
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    numberOfItems: opts.items.length,
    itemListOrder:
      opts.itemListOrder === 'Unordered'
        ? 'https://schema.org/ItemListUnordered'
        : `https://schema.org/ItemListOrder${opts.itemListOrder ?? 'Ascending'}`,
    itemListElement: opts.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
  if (opts.description) node.description = opts.description;
  if (opts.url) node.url = opts.url;
  return node;
}

/**
 * VideoObject pour une vidéo embed. Google EXIGE `uploadDate` + `thumbnailUrl` :
 * on renvoie `null` si l'un manque (mieux vaut ne rien émettre qu'un schéma
 * invalide). Miniature dérivable pour YouTube ; sinon fournir `thumbnail`.
 */
export function buildVideoObjectJsonLd(opts: {
  platform: 'youtube' | 'twitch' | 'bilibili';
  id: string;
  title: string;
  author?: string;
  uploadDate?: string;
  thumbnail?: string;
}): JsonLdNode | null {
  let embedUrl: string;
  let contentUrl: string | undefined;
  let thumbnailUrl: string | undefined = opts.thumbnail;
  switch (opts.platform) {
    case 'youtube':
      embedUrl = `https://www.youtube.com/embed/${opts.id}`;
      contentUrl = `https://www.youtube.com/watch?v=${opts.id}`;
      thumbnailUrl ??= `https://i.ytimg.com/vi/${opts.id}/hqdefault.jpg`;
      break;
    case 'twitch':
      embedUrl = `https://player.twitch.tv/?video=${opts.id}`;
      contentUrl = `https://www.twitch.tv/videos/${opts.id.replace(/^v/, '')}`;
      break;
    case 'bilibili':
      embedUrl = `https://player.bilibili.com/player.html?bvid=${opts.id}`;
      contentUrl = `https://www.bilibili.com/video/${opts.id}`;
      break;
  }
  // Champs requis par Google absents → pas de schéma (évite un JSON-LD invalide).
  if (!opts.uploadDate || !thumbnailUrl) return null;

  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: opts.title,
    description: opts.title,
    embedUrl,
    thumbnailUrl,
    uploadDate: opts.uploadDate,
  };
  if (contentUrl) node.contentUrl = contentUrl;
  if (opts.author) node.author = { '@type': 'Person', name: opts.author };
  return node;
}

/** FAQPage — repris volontiers par les moteurs génératifs et Google (rich-result). */
export function buildFaqJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>,
): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
}

/**
 * SEO centralisé — métadonnées de page + builders JSON-LD.
 *
 * Objectif : chaque page n'a qu'à appeler `createPageMetadata` (canonical +
 * hreflang + OpenGraph + Twitter) et éventuellement un builder JSON-LD, sans
 * redupliquer la logique d'URL/langue. Porté de la V2, adapté à la config V3.
 */
import type { Metadata } from 'next';
import { LANGUAGES, LANGS, DEFAULT_LANG, normalizeLang, type Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { getBaseUrl, buildUrl, CANONICAL_ORIGIN } from '@/lib/site';

// URL / domaine : le profil de déploiement (origine, routage, index) vit dans
// src/lib/site.ts — source UNIQUE. Réexporté ici pour préserver les imports
// historiques `@/lib/seo` (robots, sitemap, llms.txt, layout).
export { getBaseUrl, buildUrl };

/** « Month Year » localisé pour les titres SEO dynamiques (tier lists…). */
export function getMonthYear(lang: Lang): string {
  return new Date().toLocaleString(LANGUAGES[normalizeLang(lang)].htmlLang, {
    month: 'long',
    year: 'numeric',
  });
}

const SITE_NAME = 'Outerpedia';
/**
 * Carte de partage par défaut — passe par la base R2, comme toute image du site.
 * Elle était écrite en chemin racine (`/images/…`), donc résolue contre le
 * domaine du site : ça marchait en dev (une route y sert `.assets-staging/`) et
 * pointait dans le vide en prod, où `/images/*` n'est servi par personne. Toutes
 * les pages sans `ogImage` explicite avaient donc une carte cassée.
 */
const DEFAULT_OG_IMAGE = img.ogDefault();

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
  /**
   * Page qui n'est PAS une entité de recherche autonome : canonical ET hreflang
   * pointent vers `canonicalPath` au lieu de la page elle-même. Les deux vont
   * ENSEMBLE — un hreflang qui annoncerait la page canonicalisée contredirait le
   * canonical, et Google ignore les paires en conflit. `og:url` reste sur `path`
   * (l'URL réellement partagée). Absent = la page se canonicalise sur elle-même,
   * cas par défaut.
   */
  canonicalPath?: string;
  title: string;
  description: string;
  ogImage?: string;
  ogImageSize?: { width: number; height: number };
  noindex?: boolean;
  /**
   * Page de type ARTICLE (guides) : bascule `og:type=article` et pose
   * `article:published_time`/`modified_time`/`author` (dates ISO). Absent =
   * page `website` classique.
   */
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] };
};

/**
 * Métadonnées complètes d'une page (title/desc/OG/Twitter/hreflang/robots).
 * NB : pas de `keywords` — la balise meta keywords est ignorée par les moteurs.
 */
export function createPageMetadata({
  lang,
  path,
  canonicalPath,
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageSize,
  noindex = false,
  article,
}: PageMetadataOptions): Metadata {
  const url = buildUrl(lang, path);
  const canonicalUrl = canonicalPath ? buildUrl(lang, canonicalPath) : url;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const isDefault = ogImage === DEFAULT_OG_IMAGE;
  const { width, height } =
    ogImageSize ?? (isDefault ? { width: 1200, height: 630 } : { width: 150, height: 150 });

  const ogBase = {
    title: fullTitle,
    description,
    url,
    siteName: SITE_NAME,
    locale: OG_LOCALE[normalizeLang(lang)],
    images: [{ url: ogImage, width, height }],
  };
  const openGraph: Metadata['openGraph'] = article
    ? {
        ...ogBase,
        type: 'article',
        ...(article.publishedTime ? { publishedTime: article.publishedTime } : {}),
        ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
        ...(article.authors ? { authors: article.authors } : {}),
      }
    : { ...ogBase, type: 'website' };

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl, languages: buildAlternates(canonicalPath ?? path) },
    openGraph,
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
// @id stables (origine canonique, cf. src/lib/site.ts) pour que les cross-refs
// survivent aux sous-domaines de langue d'un même déploiement.
const WEBSITE_ID = `${CANONICAL_ORIGIN}/#website`;
const VIDEOGAME_ID = `${CANONICAL_ORIGIN}/#videogame`;
const ORGANIZATION_ID = `${CANONICAL_ORIGIN}/#organization`;
const PUBLISHER_ID = `${CANONICAL_ORIGIN}/#publisher`;
/**
 * Logo de l'éditeur (JSON-LD `Organization`) — l'icône PWA, servie depuis
 * `public/icons/` par Next lui-même.
 *
 * Pointait `/images/logo.png` : le MÊME piège que l'image OG par défaut (cf.
 * `DEFAULT_OG_IMAGE` plus haut) — un chemin racine résolu contre le domaine du
 * SITE, où `/images/*` n'est servi par personne en prod. Corrigé pour l'OG, ce
 * logo-ci avait survécu, et partait donc en 404 dans le JSON-LD de CHAQUE page
 * (repéré le 2026-07-22 dans le rapport de couverture Search Console). On ne
 * repasse pas par `img.*` (bucket R2) exprès : `/icons/` est servi par l'app
 * sur tous les hôtes de langue, sans dépendre de la base d'assets.
 */
const LOGO_PATH = '/icons/icon-512x512.png';

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
      // Major9 a racheté l'IP Outerplane et l'équipe de dev à VA Games (oct. 2025) :
      // c'est lui l'éditeur ET l'ayant droit depuis.
      { '@type': 'Organization', '@id': ORGANIZATION_ID, name: 'Major9' },
      {
        '@type': 'Organization',
        '@id': PUBLISHER_ID,
        name: SITE_NAME,
        url: `${CANONICAL_ORIGIN}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${CANONICAL_ORIGIN}${LOGO_PATH}`,
          width: 512,
          height: 512,
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

/** Article (guides) : auteur, dates, image — lié au WebSite via isPartOf. */
export function buildArticleJsonLd(opts: {
  lang: Lang;
  path: string;
  headline: string;
  description: string;
  author: string;
  /** Date ISO `YYYY-MM-DD` de dernière mise à jour éditoriale. */
  dateModified: string;
  /** Date ISO de publication ; à défaut, on retombe sur `dateModified` (on ne
   * track pas de date de création séparée — un guide neuf a les deux égales). */
  datePublished?: string;
  image?: string;
}): JsonLdNode {
  const safeLang = normalizeLang(opts.lang);
  const url = buildUrl(safeLang, opts.path);
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    author: { '@type': 'Person', name: opts.author },
    publisher: { '@id': PUBLISHER_ID },
    datePublished: opts.datePublished ?? opts.dateModified,
    dateModified: opts.dateModified,
    inLanguage: LANGUAGES[safeLang].htmlLang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url, isPartOf: { '@id': WEBSITE_ID } },
    about: { '@id': VIDEOGAME_ID },
  };
  const img = absImage(opts.image);
  if (img) node.image = img;
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

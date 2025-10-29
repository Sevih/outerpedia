// src/lib/seo.ts
import type { Metadata } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import { TENANTS, HREFLANG, OG_LOCALE, getAvailableLanguages } from '@/tenants/config'
import { getServerI18n } from '@/lib/contexts/server-i18n'

type ImageOpt = {
  /** Chemin absolu (https://...) ou relatif (sera préfixé par domain) */
  url: string
  width?: number
  height?: number
  /** Clé i18n pour l'alt (fallback: altFallback) */
  altKey?: string
  altFallback?: string
}

type CreatePageMetaArgs = {
  /** ex: '/gear-usage-stats' */
  path: `/${string}`
  /** clés i18n requises pour title / desc */
  titleKey: string
  descKey: string
  /** Clés i18n optionnelles (sinon fallback title/desc) */
  ogTitleKey?: string
  ogDescKey?: string
  twitterTitleKey?: string
  twitterDescKey?: string
  /** keywords additionnels (pré-localisés ou clés i18n à résoudre avant) */
  keywords?: string[]
  /** Image OG/Twitter */
  image?: ImageOpt
  /** Type OG (par défaut: 'website') */
  ogType?: 'website' | 'article'
  /** Twitter card (par défaut: auto, voir logique ci-dessous) */
  twitterCard?: 'summary' | 'summary_large_image'
  /** Variables d’interpolation (ex: { monthYear }) */
  vars?: Record<string, unknown>
}

/** Construit l'objet { 'en-US': urlEn, 'ja-JP': urlJp, ... } pour alternates.languages, avec x-default */
function buildLanguageAlternates(
  path: string
): Record<string, string> & { 'x-default': string } {
  const base: Record<string, string> = Object.fromEntries(
    getAvailableLanguages().map((k) => [
      HREFLANG[k],
      `https://${TENANTS[k].domain}${path}`,
    ])
  )
  return {
    ...base,
    'x-default': `https://${TENANTS.en.domain}${path}`, // fallback EN
  }
}


/** Normalise une URL d’image (supporte relatif → absolu via domain) */
function normalizeImageUrl(url: string, domain: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${domain}${url}`
}

/** Règle projet: PNG dans metadata (pas de WEBP). Convertit .webp → .png si besoin */
function ensurePngForMeta(url: string) {
  try {
    const u = new URL(url)
    if (u.pathname.endsWith('.webp')) {
      u.pathname = u.pathname.replace(/\.webp$/i, '.png')
      return u.toString()
    }
    return url
  } catch {
    // si ce n'est pas une URL absolue (devrait déjà être normalisée)
    return url.replace(/\.webp$/i, '.png')
  }
}

/** Déduit si on doit forcer summary_large_image */
function chooseTwitterCard(
  provided: CreatePageMetaArgs['twitterCard'],
  w?: number,
  h?: number
): 'summary' | 'summary_large_image' {
  if (provided) return provided
  // Heuristique: si large image (>= 300x157), on préfère summary_large_image
  if ((w ?? 0) >= 300 && (h ?? 0) >= 157) return 'summary_large_image'
  return 'summary'
}

/** Helper principal : retourne un Metadata complet, localisé et cohérent site-wide */
export async function createPageMetadata({
  path,
  titleKey,
  descKey,
  ogTitleKey,
  ogDescKey,
  twitterTitleKey,
  twitterDescKey,
  keywords = [],
  image = {
    url: '/images/ui/nav/CM_Lobby_Btn_StepUp.png', // PNG en metadata par défaut
    width: 150, height: 150, altFallback: 'Outerpedia'
  },
  ogType = 'website',
  twitterCard,
  vars = {},
}: CreatePageMetaArgs): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  const url = `https://${domain}${path}`
  const languages = buildLanguageAlternates(path)
  const ogLocale = OG_LOCALE[langKey] ?? 'en_US'
  const ogAlternateLocales = getAvailableLanguages()
    .filter(k => k !== langKey)
    .map(k => OG_LOCALE[k])

  const title       = t(titleKey, vars)
  const description = t(descKey,  vars)
  const ogTitle     = ogTitleKey      ? (t(ogTitleKey,      vars) || title)       : title
  const ogDesc      = ogDescKey       ? (t(ogDescKey,       vars) || description) : description
  const twTitle     = twitterTitleKey ? (t(twitterTitleKey, vars) || title)       : title
  const twDesc      = twitterDescKey  ? (t(twitterDescKey,  vars) || description) : description

  const normalizedImg = ensurePngForMeta(normalizeImageUrl(image.url, domain))
  const imgAlt = image.altKey ? (t(image.altKey, vars) || image.altFallback || '') : (image.altFallback || '')

  const finalTwitterCard = chooseTwitterCard(twitterCard, image.width, image.height)

  return {
    metadataBase: new URL(`https://${domain}`), // sécurise la génération d’URLs absolues
    title,
    description,
    keywords,
    alternates: { canonical: url, languages },
    openGraph: {
      url,
      siteName: 'Outerpedia',
      title: ogTitle,
      description: ogDesc,
      type: ogType,
      locale: ogLocale,
      // expose aussi les locales alternatives en OG (quand Next les mappe)
      alternateLocale: ogAlternateLocales,
      images: [{
        url: normalizedImg,
        width: image.width ?? 150,
        height: image.height ?? 150,
        alt: imgAlt || 'Outerpedia',
      }],
    },
    twitter: {
      card: finalTwitterCard,
      title: twTitle,
      description: twDesc,
      images: [normalizedImg],
      // optionnel: si tu veux lier un @
      // site: '@outerpedia',
      // creator: '@outerpedia',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
  }
}

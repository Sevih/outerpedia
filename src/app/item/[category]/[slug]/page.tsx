import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, itemWebPageLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

// Data
import weaponData from '@/data/weapon.json'
import accessoryData from '@/data/amulet.json'
import setData from '@/data/sets.json'

// Renderers
import renderWeapon from '@/app/components/renderWeapon'
import renderAccessory from '@/app/components/renderAccessory'
import renderSet from '@/app/components/renderSet'

// Types & utils
import type { Weapon, Accessory, ArmorSet } from '@/types/equipment'
import { TENANTS, OG_LOCALE, HREFLANG, type TenantKey } from '@/tenants/config'
import { toKebabCase } from '@/utils/formatText'
import BackButton from '@/app/components/ui/BackButton'
import { l } from '@/lib/localize'

// ---------- Types ----------
type Category = 'weapon' | 'accessory' | 'set'
type Params = { category: Category; slug: string }

// ---------- Données ----------
const WEAPONS = weaponData as Weapon[]
const ACCESSORIES = accessoryData as Accessory[]
const SETS = setData as ArmorSet[]

// ---------- Utils ----------
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function findEntry<T extends { name: string }>(list: T[], slug: string): T | null {
  return list.find(i => toKebabCase(i.name) === slug) ?? null
}

function getEntry(category: Category, slug: string) {
  switch (category) {
    case 'weapon':
      return findEntry<Weapon>(WEAPONS, slug)
    case 'accessory':
      return findEntry<Accessory>(ACCESSORIES, slug)
    case 'set':
      return findEntry<ArmorSet>(SETS, slug)
  }
}

// Construit la map hreflang -> URL pour ce chemin
function buildLanguageAlternates(path: string) {
  const acc: Record<string, string> = {}
    ; (Object.keys(TENANTS) as TenantKey[]).forEach(k => {
      acc[HREFLANG[k]] = `https://${TENANTS[k].domain}${path}`
    })
  return acc
}

// ---------- Static params ----------
export async function generateStaticParams() {
  const params: Params[] = []
  for (const it of WEAPONS) params.push({ category: 'weapon', slug: toKebabCase(it.name) })
  for (const it of ACCESSORIES) params.push({ category: 'accessory', slug: toKebabCase(it.name) })
  for (const it of SETS) params.push({ category: 'set', slug: toKebabCase(it.name) })
  return params
}

// ---------- SEO helpers ----------
function getItemPngImageUrl(category: Category, entry: Weapon | Accessory | ArmorSet): string {
  if (category === 'weapon' || category === 'accessory') {
    const imageField = (entry as Weapon | Accessory).image
    if (!imageField) return '/images/equipment/default.png'
    const file = imageField.endsWith('.webp') ? imageField.replace('.webp', '.png') : imageField
    return `/images/equipment/${file}`
  }
  const setIcon = (entry as ArmorSet).set_icon
  if (setIcon) return `/images/ui/effect/${setIcon}.png`
  return '/images/ui/nav/CM_Lobby_Button_Character.png'
}

function notFoundMeta(domain: string, path: string, ogLocale: string): Metadata {
  return {
    title: 'Item not found',
    description: 'This item does not exist.',
    alternates: {
      canonical: `https://${TENANTS.en.domain}${path}`,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      url: `https://${domain}${path}`,
      siteName: 'Outerpedia',
      title: 'Item not found',
      description: 'This item does not exist.',
      type: 'website',
      images: [{ url: `https://${domain}/images/ui/nav/CM_Lobby_Button_Character.png`, width: 150, height: 150 }],
      locale: ogLocale,
    },
    twitter: {
      card: 'summary',
      title: 'Item not found',
      description: 'This item does not exist.',
      images: [`https://${domain}/images/ui/nav/CM_Lobby_Button_Character.png`],
    },
    robots: { index: false, follow: false },
  }
}

// ---------- Metadata ----------
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, slug } = await params
  const { key: langKey, domain } = await getTenantServer()
  const path = `/item/${category}/${slug}` as `/${string}`
  const ogLocale = OG_LOCALE[langKey] ?? 'en_US'

  if (category !== 'weapon' && category !== 'accessory' && category !== 'set') {
    return notFoundMeta(domain, path, ogLocale)
  }

  const entry = getEntry(category, slug) as (Weapon | Accessory | ArmorSet | null)
  if (!entry) return notFoundMeta(domain, path, ogLocale)

  const translatedName = l(entry, 'name', langKey)
  const image = `https://${domain}${getItemPngImageUrl(category, entry)}`

  // ✅ Respect règle projet : PNG en metadata
  return createPageMetadata({
    path, // déjà typé as `/${string}` plus haut
    titleKey: 'item.meta.title',
    descKey: 'item.meta.desc',
    ogTitleKey: 'item.meta.ogTitle',
    ogDescKey: 'item.meta.ogDesc',
    twitterTitleKey: 'item.meta.twTitle',
    twitterDescKey: 'item.meta.twDesc',
    keywords: [
      'Outerplane', 'Outerpedia', translatedName,
      `${translatedName} Outerplane`, `${translatedName} Build`, `${translatedName} Guide`,
      category, 'gear', 'effect',
    ],
    image: {
      url: image,           // ton URL absolue, .webp auto-convertie en .png par seo.ts si besoin
      width: 512,
      height: 512,
      altFallback: `${translatedName} - ${capitalize(category)} Image`,
    },
    ogType: 'website',
    twitterCard: 'summary',
    // variables pour interpoler les clés i18n
    vars: {
      name: translatedName,
      category: capitalize(category),
    },
  })
}

// ---------- Page ----------
export default async function Page({ params }: { params: Promise<Params> }) {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)
  const { category, slug } = await params

  const entry = getEntry(category, slug) as (Weapon | Accessory | ArmorSet | null)
  if (!entry) notFound()

  const path = `/item/${category}/${slug}`


  return (
    <>
      {/* JSON-LD */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: entry!.name,
            currentPath: path,
          }),
          itemWebPageLd(domain, {
            name: entry!.name,
            category,
            imageUrl: `https://${domain}${getItemPngImageUrl(category, entry!)}`,
            path,
            inLanguage: ['en', 'jp', 'kr'],
          }),
        ]}
      />

      <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
        <BackButton fallback="/item" />
      </div>
      <div className="p-6 text-white">
        {category === 'weapon' && renderWeapon(entry as Weapon, langKey)}
        {category === 'accessory' && renderAccessory(entry as Accessory, langKey)}
        {category === 'set' && renderSet(entry as ArmorSet, langKey)}
      </div>
    </>
  )
}

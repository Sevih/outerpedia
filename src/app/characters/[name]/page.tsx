// app/characters/[name]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import type { TenantKey } from '@/tenants/config'
import type { Character } from '@/types/character'
import CharacterDetailClient from './CharacterDetailClient'
import partnersData from '@/data/partners.json'
import { selectPartners } from '@/lib/selectPartners'
import type { PartnerRoot } from '@/types/partners'

import rawWeapons from '@/data/weapon.json'
import rawAmulets from '@/data/amulet.json'
import rawTalismans from '@/data/talisman.json'
import rawSets from '@/data/sets.json'
import type { Talisman, Accessory, ArmorSet, Weapon } from '@/types/equipment'
import { l } from '@/lib/localize'

// 🔹 SEO unifié
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, characterWebPageLd } from './jsonld'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = { params: Promise<{ name: string }> }

async function readCharacterFile(slug: string): Promise<Character | null> {
  const filePath = path.join(process.cwd(), 'src/data/char', `${slug}.json`)
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf-8'))
  } catch {
    return null
  }
}

async function readCharacterRecoFile(slug: string) {
  const filePath = path.join(process.cwd(), 'src/data/reco', `${slug}.json`)
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function localizedDisplayName(char: Character, langKey: TenantKey) {
  return l(char, 'Fullname', langKey)
}

// ---------- Metadata ----------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name: slug } = await params
  const { key: langKey, domain } = await getTenantServer()
  const char = await readCharacterFile(slug)

  // Page list fallback si le perso n’existe pas
  if (!char) {
    return {
      title: 'Outerplane Characters - Outerpedia',
      description:
        'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
      alternates: {
        canonical: `https://${domain}/characters`,
      },
      openGraph: {
        url: `https://${domain}/characters`,
        siteName: 'Outerpedia',
        title: 'Outerplane Characters - Outerpedia',
        description:
          'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
        type: 'website',
        images: [
          {
            url: `https://${domain}/images/ui/nav/CM_Lobby_Button_Character.png`,
            width: 150,
            height: 150,
            alt: 'Outerpedia Characters',
          },
        ],
      },
      twitter: {
        card: 'summary',
        title: 'Outerplane Characters - Outerpedia',
        description:
          'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
        images: [`https://${domain}/images/ui/nav/CM_Lobby_Button_Character.png`],
      },
      robots: { index: false, follow: false },
    }
  }

  const displayName = localizedDisplayName(char, langKey)
  const pathUrl = `/characters/${slug}` as `/${string}`

  // PNG en metadata (ta règle projet)
  const portraitPng = `https://${domain}/images/characters/atb/IG_Turn_${char.ID}.png`

  // ✅ SEO via helper (canonical EN, hreflang auto, PNG only, etc.)
  return createPageMetadata({
    path: pathUrl,
    titleKey: 'char.meta.title',      // ex: '{name} | Character Details | Outerpedia'
    descKey:  'char.meta.desc',       // ex: '{element} {class} {name} — skills, upgrades, ranking, EE, sets.'
    ogTitleKey: 'char.og.title',
    ogDescKey:  'char.og.desc',
    twitterTitleKey: 'char.twitter.title',
    twitterDescKey:  'char.twitter.desc',
    keywords: [
      'Outerplane', 'Outerpedia', displayName,
      `${displayName} Outerplane`, `${displayName} Build`, `${displayName} Guide`,
      char.Class, char.SubClass, char.Element,
      `${displayName} pve tier`, `${displayName} pvp tier`, 'skills', 'gear', 'chain',
    ],
    image: {
      url: portraitPng,
      width: 150,
      height: 150,
      altFallback: `${displayName} Portrait - Outerplane`,
    },
    ogType: 'website',
    twitterCard: 'summary',
    vars: {
      name: displayName,
      element: char.Element,
      class: char.Class,
      subclass: char.SubClass,
    },
  })
}

// ---------- Page ----------
export default async function Page({ params }: PageProps) {
  const { key: langKey, domain } = await getTenantServer()
  const { name: slug } = await params

  const label = `⏱️ Character page: ${slug} - ${Date.now()}`
  console.time(label)

  const char = await readCharacterFile(slug)
  if (!char) return notFound()

  const recoData = await readCharacterRecoFile(slug)
  const partners = selectPartners(partnersData as PartnerRoot, slug)

  // -- CHARGEMENT SERVER des gear-data --
  const weapons = rawWeapons as Weapon[]
  const amulets = rawAmulets as Accessory[]
  const { t } = await getServerI18n(langKey)
  const talismans = rawTalismans as Talisman[]
  const sets = rawSets as ArmorSet[]

  const displayName = localizedDisplayName(char, langKey)
  const pathUrl = `/characters/${slug}`

  // JSON-LD harmonisé (WebPage + Breadcrumb + WebSite)
  const absPortraitPng =
    `https://${domain}/images/characters/atb/IG_Turn_${char.ID}.png`

  console.timeEnd(label)

  return (
    <>
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('chars.breadcrumb.home'),
            current: displayName,
            currentPath: pathUrl,
          }),
          characterWebPageLd(domain, {
            title: `${displayName} | Outerpedia`,
            description: `${char.Element} ${char.Class} ${displayName} — skills, upgrades, ranking, exclusive equipment, and recommended sets.`,
            path: pathUrl,
            imageUrl: absPortraitPng,
            attrs: {
              name: displayName,
              id: String(char.ID),
              element: char.Element,
              class: char.Class,
              subclass: char.SubClass ?? '',
            },
          }),
        ]}
      />

      <CharacterDetailClient
        character={char}
        slug={slug}
        langKey={langKey}
        recoData={recoData}
        partners={partners}
        weapons={weapons}
        amulets={amulets}
        talismans={talismans}
        sets={sets}
      />
    </>
  )
}

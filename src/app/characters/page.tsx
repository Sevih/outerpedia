import type { Metadata } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import CharactersPage from './CharactersPageClient'

import characters from '@/data/_allCharacters.json'
import type { CharacterLite } from '@/types/types'
import { toKebabCase } from '@/utils/formatText'
import { getMonthYear } from '@/utils/getMonthYear'
import { getServerI18n } from '@/lib/contexts/server-i18n'

import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, charactersCollectionLd } from './jsonld'

const monthYear = getMonthYear()

// ---------- Metadata ----------
export async function generateMetadata(): Promise<Metadata> {
  const { domain } = await getTenantServer()
  const path = '/characters' as `/${string}`
  const iconAbs = `https://${domain}/images/ui/nav/CM_Lobby_Button_Character.png`

  return createPageMetadata({
    path,
    titleKey: 'chars.meta.title',       // Outerplane Characters – Full Database Updated {monthYear} | Outerpedia
    descKey:  'chars.meta.desc',        // Explore all characters ... Updated {monthYear} ...
    ogTitleKey: 'chars.og.title',
    ogDescKey:  'chars.og.desc',
    twitterTitleKey: 'chars.twitter.title',
    twitterDescKey:  'chars.twitter.desc',
    keywords: [
      'Outerplane','Characters','Heroes','Character Database','Stats','Skills',
      'Gear Recommendations','Exclusive Equipment', `${monthYear}`,'EvaMains','Outerpedia',
    ],
    image: {
      url: iconAbs,
      width: 150,
      height: 150,
      altFallback: 'Outerpedia Character Collection',
    },
    ogType: 'website',
    twitterCard: 'summary',
    vars: { monthYear },
  })
}

// ---------- Page ----------
export default async function Page() {
  const { domain, key: langKey } = await getTenantServer()
  const { t } = await getServerI18n(langKey)
  const path = '/characters'
  const base = `https://${domain}`

  // Compte (léger) pour le JSON-LD
  const list = characters as unknown as CharacterLite[]
  const count = list.length

  // Un petit échantillon (max 8) pour le JSON-LD sans tout alourdir
  const sample = list.slice(0, 8).map((char) => ({
    name: char.Fullname,
    url: `${base}/characters/${toKebabCase(char.Fullname)}`,
    image: `${base}/images/characters/full/IMG_${char.ID}.webp`,
    description: `Element: ${char.Element} | Class: ${char.Class} | Subclass: ${char.SubClass}`,
  }))

  const titleH1Short = t('chars.page.h1.short')
  const titleH1Full = t('chars.page.h1.full')

  return (
    <>
      {/* JSON-LD harmonisé */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('chars.breadcrumb.home'),
            current: titleH1Short,
            currentPath: path,
          }),
          charactersCollectionLd(domain, {
            title: `${titleH1Short} – Outerpedia`,
            description: t('chars.jsonld.desc', { monthYear }),
            path,
            imageUrl: `${base}/images/ui/nav/CM_Lobby_Button_Character.png`,
            count,
            sample,
          }),
        ]}
      />

      <div className="p-3">
        {/* ✅ H1 visible avec les mots-clés du title */}
        <h1 className="text-3xl font-bold">{titleH1Full}</h1>

        {/* ✅ Date visible pour matcher le title */}
        <h2 className="text-sm text-gray-400 text-center mb-2">
          {t('chars.page.updated', { monthYear })}
        </h2>
        <CharactersPage langue={langKey} initialCharacters={list} />
      </div>
    </>
  )
}

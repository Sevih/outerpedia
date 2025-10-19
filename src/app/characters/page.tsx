import type { Metadata } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import CharactersPage from './CharactersPageClient'

import characters from '@/data/_allCharacters.json'
import type { Character } from '@/types/character'
import { toKebabCase } from '@/utils/formatText'
import { getMonthYear } from '@/utils/getMonthYear'

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
  const path = '/characters'
  const base = `https://${domain}`

  // Compte (léger) pour le JSON-LD
  const list = characters as Character[]
  const count = list.length

  // Un petit échantillon (max 8) pour le JSON-LD sans tout alourdir
  const sample = list.slice(0, 8).map((char) => ({
    name: char.Fullname,
    url: `${base}/characters/${toKebabCase(char.Fullname)}`,
    image: `${base}/images/characters/full/IMG_${char.ID}.webp`,
    description: `Element: ${char.Element} | Class: ${char.Class} | Subclass: ${char.SubClass}`,
  }))

  const titleH1 =
    langKey === 'jp' ? 'キャラクター一覧'
    : langKey === 'kr' ? '캐릭터 목록'
    : 'Outerplane Characters'

  return (
    <>
      {/* JSON-LD harmonisé */}
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: langKey === 'jp' ? 'ホーム' : langKey === 'kr' ? '홈' : 'Home',
            current: titleH1,
            currentPath: path,
          }),
          charactersCollectionLd(domain, {
            title: `${titleH1} – Outerpedia`,
            description:
              langKey === 'jp'
                ? `全キャラクターの詳細：ステータス、スキル、ビルド、専用装備。${monthYear} 更新。`
                : langKey === 'kr'
                ? `모든 캐릭터 정보: 스탯, 스킬, 빌드, 전용 장비. ${monthYear} 업데이트.`
                : `Full character database: stats, skills, builds, and exclusive equipment. Updated ${monthYear}.`,
            path,
            imageUrl: `${base}/images/ui/nav/CM_Lobby_Button_Character.png`,
            inLanguage: ['en', 'jp', 'kr'],
            count,
            sample,
          }),
        ]}
      />

      <div className="p-3">
        {/* ✅ H1 visible avec les mots-clés du title */}
      <h1 className="text-3xl font-bold mb-2">
        {langKey === 'jp' ? 'キャラクター一覧' 
         : langKey === 'kr' ? '캐릭터 목록'
         : 'Outerplane Characters Database'}
      </h1>
      
      {/* ✅ Date visible pour matcher le title */}
      <p className="text-sm text-gray-400 mb-6">
        {langKey === 'jp' ? `${monthYear} 更新`
         : langKey === 'kr' ? `${monthYear} 업데이트`
         : `Updated ${monthYear}`}
      </p>
        <CharactersPage langue={langKey} />
      </div>
    </>
  )
}

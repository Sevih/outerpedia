// app/characters/[name]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import { promises as fs } from 'fs'
import path from 'path'
import type { Character } from '@/types/character'
import { toKebabCase } from '@/utils/formatText'
import { TENANTS, OG_LOCALE, HREFLANG, type TenantKey } from '@/tenants/config'
import CharacterDetailClient from './CharacterDetailClient'

// 🔓 on force dynamique pour le multi-tenant (tu peux enlever si tu préfères ta page en statique)
export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = { params: Promise<{ name: string }> }
type RecoPayload = { status: string; builds?: unknown };

function isRecordObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}


async function readCharacterFile(slug: string): Promise<Character | null> {
  const filePath = path.join(process.cwd(), 'src/data/char', `${slug}.json`)
  try { return JSON.parse(await fs.readFile(filePath, 'utf-8')) } catch { return null }
}

function buildLanguageAlternates(slug: string): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(TENANTS) as TenantKey[]).map((k) => [
      HREFLANG[k],
      `https://${TENANTS[k].domain}/characters/${slug}`,
    ])
  )
}

function localizedDisplayName(char: Character, langKey: TenantKey) {
  if (langKey === 'jp' && char.Fullname_jp) return char.Fullname_jp
  if (langKey === 'kr' && char.Fullname_kr) return char.Fullname_kr
  return char.Fullname
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name: slug } = await params
  const { key: langKey, domain } = await getTenantServer()
  const char = await readCharacterFile(slug)

  const currentUrl = `https://${domain}/characters/${slug}`
  const languages = buildLanguageAlternates(slug)
  const ogLocale = OG_LOCALE[langKey] ?? 'en_US'

  if (!char) {
    return {
      title: 'Outerplane Characters - Outerpedia',
      description:
        'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
      alternates: {
        canonical: `https://${domain}/characters`,
        languages: (Object.keys(TENANTS) as TenantKey[]).reduce((acc, k) => {
          acc[HREFLANG[k]] = `https://${TENANTS[k].domain}/characters`
          return acc
        }, {} as Record<string, string>),
      },
      openGraph: {
        url: `https://${domain}/characters`,
        siteName: 'Outerpedia',
        title: 'Outerplane Characters - Outerpedia',
        description:
          'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
        type: 'website',
        images: [{
          url: `https://${domain}/images/ui/nav/CM_Lobby_Button_Character.png`,
          width: 150, height: 150, alt: 'Outerpedia Characters',
        }],
        locale: ogLocale,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Outerplane Characters - Outerpedia',
        description:
          'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
        images: [`https://${domain}/images/ui/nav/CM_Lobby_Button_Character.png`],
      },
      robots: { index: false, follow: false },
    }
  }

  const displayName = localizedDisplayName(char, langKey)
  const title = `Character Details : ${displayName} - Outerpedia`
  const description = `${char.Element} ${char.Class} ${displayName} overview — skill breakdown and upgrade priority, ranking, exclusive equipment, and recommended sets.`
  const image = `https://${domain}/images/characters/atb/IG_Turn_${char.ID}.png`

  return {
    title,
    description,
    keywords: [
      'Outerplane', 'Outerpedia', displayName,
      `${displayName} Outerplane`, `${displayName} Build`, `${displayName} Guide`,
      char.Class, char.SubClass, char.Element,
      `${displayName} pve tier`, `${displayName} pvp tier`, 'skills', 'gear', 'chain',
    ],
    alternates: { canonical: currentUrl, languages },
    openGraph: {
      url: currentUrl, siteName: 'Outerpedia', title, description, type: 'website',
      images: [{ url: image, width: 150, height: 150, alt: `${displayName} Portrait - Outerplane` }],
      locale: ogLocale,
    },
    twitter: { card: 'summary', title, description, images: [image] },
  }
}

export default async function Page({ params }: PageProps) {
  const { key: langKey } = await getTenantServer()
  const { name: slug } = await params

  const label = `⏱️ Character page: ${slug} - ${Date.now()}`
  console.time(label)

  const char = await readCharacterFile(slug)
  if (!char) return notFound()

  // --- fetch reco comme avant ---
  const recoFile = toKebabCase(char.Fullname.toLowerCase())
  let recoData: Record<string, unknown> | null = null
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    const res = await fetch(`${baseUrl}/api/reco/${recoFile}`, { cache: 'no-store' })
    if (res.ok) {
      const data: RecoPayload = await res.json()
      // On ne garde QUE 'builds' si c'est bien un objet (Record) et non un array
      recoData = (data && data.status !== 'empty' && isRecordObject(data.builds))
        ? (data.builds as Record<string, unknown>)
        : null
    }
  } catch { recoData = null }

  console.timeEnd(label)

  // On laisse le rendu complet au client, en lui passant juste ce qu’il faut
  return (
    <CharacterDetailClient
      character={char}
      slug={slug}
      langKey={langKey}
      recoData={recoData}
    />
  )
}

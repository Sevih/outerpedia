import rawGuides from '@/data/guides/guides-ref.json'
import rawCategoryMeta from '@/data/guides/categories.json'
import { notFound } from 'next/navigation'
import GuideContentWrapper from './GuideContentWrapper'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import type { TenantKey } from '@/tenants/config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Localized = { en: string; jp?: string; kr?: string }
const getLocalized = (v: Localized | string, lang: TenantKey) =>
  typeof v === 'string' ? v : (v[lang] ?? v.en)

function dedupeByLocale(list: string[], lang: TenantKey): string[] {
  const norm = (s: string) => (lang === 'en' ? s.toLowerCase() : s)
  return Array.from(new Map(list.map(k => [norm(k), k])).values())
}

type Guide = {
  category: string
  title: string | Localized
  description: string | Localized
  icon: string
  last_updated: string
  author: string
  second_image?: string
}

type Props = {
  params: {
    category: string
    slug: string
  }
}

type CategoryMeta = {
  title: string | Localized
  description: string | Localized
  icon: string
  valid: boolean
}

const categoryMeta = rawCategoryMeta as Record<string, CategoryMeta>
const guides = rawGuides as Record<string, Guide>

// 📌 Génération des routes statiques
export async function generateStaticParams() {
  return Object.entries(guides).map(([slug, guide]) => ({
    category: guide.category,
    slug,
  }))
}

// 📌 Métadonnées dynamiques pour SEO
export async function generateMetadata({ params }: { params: Promise<Props['params']> }): Promise<Metadata> {
  const { key: langKey, domain } = await getTenantServer()
  const { category, slug } = await params
  const guide = guides[slug]

  if (!guide || guide.category !== category) {
    return { title: 'Guide not found', description: 'This guide does not exist.' }
  }

  const meta = categoryMeta[category]
  const metaTitle = getLocalized(meta.title, langKey) // titre de la categorie
  //const metaDesc = getLocalized(meta.description, langKey) // desc de la categorie ex general
  const guideTitle = getLocalized(guide.title, langKey) //titre du guide afficher
  const guideDesc = getLocalized(guide.description, langKey) // desc du guide afficher

  let image: string

  // ✅ Canonical toujours sur le domaine EN
  const canonical = `https://outerpedia.com/guides/${guide.category}/${slug}`

  // ✅ hreflang (alternates.languages)
  const languages: Record<string, string> = {
    en: `https://outerpedia.com/guides/${guide.category}/${slug}`,
    jp: `https://jp.outerpedia.com/guides/${guide.category}/${slug}`,
    kr: `https://kr.outerpedia.com/guides/${guide.category}/${slug}`,
  }

  switch (guide.category) {
    case 'monad-gate':
      image = `https://${domain}/images/guides/monad-gate/CM_Adventure_MonadGate.png`
      break
    default:
      image = `https://${domain}/images/guides/${guide.category}/${slug}_portrait.png`
      break
  }

  const metadata = {
    title: `${guideTitle} | ${metaTitle} | Outerpedia`,
    description: `${metaTitle} ${guideTitle} ${guideDesc}`,
    keywords: generateGuideKeywords(
      { ...guide, title: guideTitle, description: guideDesc },
      slug,
      langKey                    // ⬅️ ajoute la locale
    ),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: `${guideTitle} | ${metaTitle} | Outerpedia`,
      description: `${metaTitle} ${guideTitle} ${guideDesc}`,
      type: 'article',
      url: canonical,
      images: [{ url: image, width: 150, height: 150, alt: `${guideTitle} portrait` }],
    },
    twitter: {
      card: 'summary',
      title: `${guideTitle} | ${metaTitle} | Outerpedia`,
      description: `${metaTitle} ${guideTitle} ${guideDesc}`,
      images: [image],
    },
  }

  //console.log('Generated metadata for /guides/[category]/[slug]:', metadata)
  return metadata
}

// 📌 Rendu principal de la page
export default async function GuidePage({ params }: { params: Promise<Props['params']> }) {
  const { key: langKey, domain } = await getTenantServer()
  const { category, slug } = await params
  const guide = guides[slug]

  if (!guide || guide.category !== category) {
    notFound()
  }

  const meta = categoryMeta[category]
  const metaTitle = getLocalized(meta.title, langKey)
  const guideTitle = getLocalized(guide.title, langKey)
  const guideDesc = getLocalized(guide.description, langKey)
  const pageUrl = `https://${domain}/guides/${category}/${slug}`
  let image: string
  let secondeimage: string | undefined

  switch (guide.category) {
    case 'monad-gate':
      image = `/images/guides/monad-gate/CM_Adventure_MonadGate.webp`
      secondeimage = `/images/guides/monad-gate/CM_Adventure_MonadGate.webp`
      break
    default:
      image = `/images/guides/${guide.category}/${slug}_banner.webp`
      secondeimage = guide.second_image
        ? `/images/guides/${guide.category}/${guide.second_image}_banner.webp`
        : undefined
      break
  }

  return (
    <div className="p-6">
      <div className="sr-only">
        <h1>{`${guideTitle} | ${metaTitle}`}</h1>
      </div>
      <div className="relative w-full h-[150px] rounded-2xl overflow-hidden mb-6">
        {/* Image centrée */}
        {!secondeimage ? (
          <Image
            src={image}
            alt={`${guideTitle} banner`}
            fill
            sizes="100vw"
            className="object-contain z-0"
            priority
          />
        ) : (
          <>
            <Image
              src={image}
              alt={`${guideTitle} banner`}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ left: '20%' }}
              priority
            />
            <Image
              src={secondeimage}
              alt={`${guideTitle} second banner`}
              fill
              sizes="100vw"
              className="object-contain"
              style={{ left: '-20%' }}
            />
          </>
        )}

        {/* Flèche retour */}
        <div className="absolute top-4 left-4 z-20 h-[32px] w-[32px]">
          <Link href={`/guides/${category}`} className="relative block h-full w-full">
            <Image
              src="/images/ui/CM_TopMenu_Back.webp"
              alt="Back"
              fill
              sizes="32px"
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Texte positionné sur la zone rouge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white text-center px-4">
          <div className="text-xs sm:text-sm uppercase tracking-wide font-semibold mb-3">
            <span className="guide-title">{category.replace(/-/g, ' ')}</span>
          </div>
          <div className="text-base sm:text-lg md:text-xl font-bold leading-tight max-w-full break-words">
            <span className="guide-title mt-4">{guideTitle}</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-neutral-400 mb-6">
        ✍️ {guide.author} · 🕒 {new Date(guide.last_updated).toLocaleDateString()}
      </div>

      {category === 'general-guides' ? (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This guide provides information and advice about <strong>{guideTitle}</strong> in Outerplane.<br />
          If you have additional tips or notice any missing details, feel free to share them with us on&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            EvaMains Discord
          </Link>.
        </p>
      ) : category === 'special-request' ? (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This guide provides strategies and tips for defeating the <strong>{guideTitle}</strong> gear boss in Outerplane.<br />
          If you know any additional tactics, team compositions, or optimizations, feel free to share them with us on&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            EvaMains Discord
          </Link>.
        </p>
      ) : (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This guide covers all currently available information and advice for <strong>{category.replace(/-/g, ' ')}</strong> – <strong>{guideTitle}</strong> in Outerplane.<br />
          If you know any additional strategies, tips, or missing details, feel free to share them with us on&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            EvaMains Discord
          </Link>.
        </p>
      )}

      <div className="mt-6">
        <GuideContentWrapper category={category} slug={slug} />
      </div>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guideTitle,
            description: guideDesc,
            author: { '@type': 'Person', name: guide.author },
            datePublished: guide.last_updated,
            url: pageUrl,
          }),
        }}
      />
    </div>
  )
}

function generateGuideKeywords(guide: Guide, slug: string, lang: TenantKey): string[] {
  // titrage/desc localisés (au cas où on n’a pas passé des strings déjà résolues)
  const titleStr =
    typeof guide.title === 'string' ? guide.title : (guide.title[lang] ?? guide.title.en)
  const descStr =
    typeof guide.description === 'string' ? guide.description : (guide.description[lang] ?? guide.description.en)

  // Bases par langue
  const base_en = [
    'outerplane', 'outerpedia', 'outerplane wiki', 'outerplane guide',
    titleStr, `${titleStr} guide`, slug,
    'turn-based rpg', 'mobile rpg', 'character builds',
  ]
  const base_jp = [
    'アウタープレーン', 'Outerpedia', 'アウタープレーン 攻略', 'アウタープレーン ガイド',
    titleStr, `${titleStr} ガイド`,
  ]
  const base_kr = [
    '아우터플레인', 'Outerpedia', '아우터플레인 공략', '아우터플레인 가이드',
    titleStr, `${titleStr} 공략`,
  ]

  // Extras par catégorie (EN/JP/KR)
  const extras: Record<string, { en: string[]; jp: string[]; kr: string[] }> = {
    'adventure': {
      en: ['adventure', 'story mode', 'chapter walkthrough', 'map', 'spoiler-free', 'stage progression', 'pve'],
      jp: ['アドベンチャー', 'ストーリーモード', 'チャプター攻略', 'マップ', 'ネタバレ無し', 'ステージ進行', 'PvE'],
      kr: ['모험', '스토리 모드', '챕터 공략', '맵', '스포일러 없음', '스테이지 진행', 'PVE'],
    },
    'world-boss': {
      en: ['world boss', 'boss strategy', 'team building', 'gear recommendation', 'extreme league', 'pve'],
      jp: ['ワールドボス', 'ボス攻略', '編成', '装備おすすめ', 'エクストリームリーグ', 'PvE'],
      kr: ['월드 보스', '보스 공략', '팀 구성', '장비 추천', '익스트림 리그', 'PVE'],
    },
    'joint-boss': {
      en: ['joint boss', 'co-op', 'raid score', 'damage optimization', 'team comps', 'pve'],
      jp: ['合同ボス', '協力', 'スコア稼ぎ', 'ダメージ最適化', '編成', 'PvE'],
      kr: ['합동 보스', '협동', '레이드 점수', '딜 최적화', '조합', 'PVE'],
    },
    'adventure-license': {
      en: ['adventure license', 'promotion license', 'license levels', 'license quests', 'pve'],
      jp: ['アドベンチャーライセンス', '昇級ライセンス', 'ライセンスレベル', 'ライセンス任務', 'PvE'],
      kr: ['모험 라이선스', '승급 라이선스', '라이선스 레벨', '라이선스 퀘스트', 'PVE'],
    },
    'special-request': { // Gear Boss
      en: ['gear boss', 'special request', 'identification', 'ecology study', 'materials', 'pve'],
      jp: ['装備ボス', 'スペシャル依頼', '鑑定', '生態調査', '素材', 'PvE'],
      kr: ['장비 보스', '스페셜 의뢰', '감정', '생태 조사', '재료', 'PVE'],
    },
    'irregular-extermination': {
      en: ['irregular extermination', 'limited-time event', 'event boss', 'rewards', 'pve'],
      jp: ['異常個体討伐', '期間限定イベント', 'イベントボス', '報酬', 'PvE'],
      kr: ['이레귤러 토벌', '한정 이벤트', '이벤트 보스', '보상', 'PVE'],
    },
    'guild-raid': {
      en: ['guild raid', 'co-op boss', 'weekly ranking', 'guild damage', 'team building', 'pve'],
      jp: ['ギルドレイド', '協力ボス', '週間ランキング', 'ギルドダメージ', '編成', 'PvE'],
      kr: ['길드 레이드', '협동 보스', '주간 랭킹', '길드 딜', '조합', 'PVE'],
    },
    'general-guides': {
      en: ['beginner guide', 'resource management', 'daily routine', 'systems overview', 'tips and tricks', 'pve'],
      jp: ['初心者向け', '資源管理', '日課', 'システム概要', '小技', 'PvE'],
      kr: ['초보자 가이드', '자원 관리', '일일 루틴', '시스템 개요', '꿀팁', 'PVE'],
    },
    'skyward-tower': {
      en: ['skyward tower', 'floors', 'clear strategy', 'recommended teams', 'pve'],
      jp: ['天空の塔', 'フロア', '攻略', 'おすすめ編成', 'PvE'],
      kr: ['하늘탑', '층', '공략', '추천 조합', 'PVE'],
    },
    'monad-gate': {
      en: ['monad gate', 'roguelike', 'routes', 'map', 'relics', 'pve'],
      jp: ['モナドゲート', 'ローグライク', 'ルート', 'マップ', '遺物', 'PvE'],
      kr: ['모나드 게이트', '로그라이크', '루트', '맵', '유물', 'PVE'],
    },
  }

  // Catégorie détectée
  const catKey = Object.keys(extras).find(k => guide.category.toLowerCase().includes(k))
  const extra = catKey ? extras[catKey] : null

  // Mots-clés depuis la description (simple heuristique)
  const desc = (descStr ?? '').toLowerCase()
  const descKeywords_en: string[] = []
  if (desc.includes('video')) descKeywords_en.push('video guide')
  if (desc.includes('full run')) descKeywords_en.push('full run')
  if (desc.includes('combat')) descKeywords_en.push('combat footage')
  if (desc.includes('strategy')) descKeywords_en.push('strategy')
  if (desc.includes('boss')) descKeywords_en.push('boss fight')

  // Dates
  const date = new Date(guide.last_updated)
  const year = date.getFullYear()
  const monthName = date.toLocaleString('en-US', { month: 'long' })
  const dateKeywords_en = [`updated ${year}`, `${monthName} ${year}`, `guide ${year}`]

  // Assemblage par langue
  let out: string[]
  if (lang === 'jp') {
    out = [...base_jp, ...(extra ? extra.jp : [])]
  } else if (lang === 'kr') {
    out = [...base_kr, ...(extra ? extra.kr : [])]
  } else {
    out = [...base_en, ...(extra ? extra.en : []), ...descKeywords_en, ...dateKeywords_en]
  }

  return dedupeByLocale(out, lang)
}


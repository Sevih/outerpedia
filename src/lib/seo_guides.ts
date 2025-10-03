// src/lib/seo.ts
import type { TenantKey } from '@/tenants/config'

function dedupeByLocale(list: string[], lang: TenantKey): string[] {
  const norm = (s: string) => (lang === 'en' ? s.toLowerCase() : s)
  return Array.from(new Map(list.map(k => [norm(k), k])).values())
}

export function generateGuideKeywords(category: string, metaTitle: string, lang: TenantKey): string[] {
  // Bases par langue
  const base_en = [
    'outerplane','outerpedia','outerplane wiki','outerplane guide',
    metaTitle, `${metaTitle} guide`,
    metaTitle.toLowerCase().replace(/\s+/g, '-'),
    'rpg guides','turn-based rpg','mobile rpg database',
  ]
  const base_jp = [
    'アウタープレーン','Outerpedia','アウタープレーン 攻略','アウタープレーン ガイド',
    metaTitle, `${metaTitle} ガイド`,
  ]
  const base_kr = [
    '아우터플레인','Outerpedia','아우터플레인 공략','아우터플레인 가이드',
    metaTitle, `${metaTitle} 공략`,
  ]

  // Extras par catégorie (EN/JP/KR)
  const extras: Record<
    string,
    { en: string[]; jp: string[]; kr: string[] }
  > = {
    'adventure': {
      en: ['adventure','story mode','chapter walkthrough','map','spoiler-free','stage progression','pve'],
      jp: ['アドベンチャー','ストーリーモード','チャプター攻略','マップ','ネタバレ無し','ステージ進行','PvE'],
      kr: ['모험','스토리 모드','챕터 공략','맵','스포일러 없음','스테이지 진행','PVE'],
    },
    'world-boss': {
      en: ['world boss','boss strategy','team building','gear recommendation','extreme league','pve'],
      jp: ['ワールドボス','ボス攻略','編成','装備おすすめ','エクストリームリーグ','PvE'],
      kr: ['월드 보스','보스 공략','팀 구성','장비 추천','익스트림 리그','PVE'],
    },
    'joint-boss': {
      en: ['joint boss','co-op','raid score','damage optimization','team comps','pve'],
      jp: ['合同ボス','協力','スコア稼ぎ','ダメージ最適化','編成','PvE'],
      kr: ['합동 보스','협동','레이드 점수','딜 최적화','조합','PVE'],
    },
    'adventure-license': {
      en: ['adventure license','promotion license','license levels','license quests','pve'],
      jp: ['アドベンチャーライセンス','昇級ライセンス','ライセンスレベル','ライセンス任務','PvE'],
      kr: ['모험 라이선스','승급 라이선스','라이선스 레벨','라이선스 퀘스트','PVE'],
    },
    'special-request': { // Gear Boss
      en: ['gear boss','special request','identification','ecology study','materials','pve'],
      jp: ['装備ボス','スペシャル依頼','鑑定','生態調査','素材','PvE'],
      kr: ['장비 보스','스페셜 의뢰','감정','생태 조사','재료','PVE'],
    },
    'irregular-extermination': {
      en: ['irregular extermination','limited-time event','event boss','rewards','pve'],
      jp: ['異常個体討伐','期間限定イベント','イベントボス','報酬','PvE'],
      kr: ['이레귤러 토벌','한정 이벤트','이벤트 보스','보상','PVE'],
    },
    'guild-raid': {
      en: ['guild raid','co-op boss','weekly ranking','guild damage','team building','pve'],
      jp: ['ギルドレイド','協力ボス','週間ランキング','ギルドダメージ','編成','PvE'],
      kr: ['길드 레이드','협동 보스','주간 랭킹','길드 딜','조합','PVE'],
    },
    'general-guides': {
      en: ['beginner guide','resource management','daily routine','systems overview','tips and tricks','pve'],
      jp: ['初心者向け','資源管理','日課','システム概要','小技','PvE'],
      kr: ['초보자 가이드','자원 관리','일일 루틴','시스템 개요','꿀팁','PVE'],
    },
    'skyward-tower': {
      en: ['skyward tower','floors','clear strategy','recommended teams','pve'],
      jp: ['天空の塔','フロア','攻略','おすすめ編成','PvE'],
      kr: ['하늘탑','층','공략','추천 조합','PVE'],
    },
    'monad-gate': {
      en: ['monad gate','roguelike','routes','map','relics','pve'],
      jp: ['モナドゲート','ローグライク','ルート','マップ','遺物','PvE'],
      kr: ['모나드 게이트','로그라이크','루트','맵','유물','PVE'],
    },
  }

  // Trouver la clé qui matche la catégorie demandée
  const key = Object.keys(extras).find(k => category.toLowerCase().includes(k))

  // Sélectionner bases + extras selon la langue
  let out: string[]
  if (lang === 'jp') {
    out = [...base_jp, ...(key ? extras[key].jp : [])]
  } else if (lang === 'kr') {
    out = [...base_kr, ...(key ? extras[key].kr : [])]
  } else {
    out = [...base_en, ...(key ? extras[key].en : [])]
  }

  return dedupeByLocale(out, lang)
}

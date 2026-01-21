'use client'

// ============================================================================
// IMPORTS
// ============================================================================
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Components
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import EquipmentIntro from '@/app/components/EquipmentIntro'
import StarLevel from '@/app/components/StarLevel'
import Accordion from '@/app/components/ui/Accordion'
import GuideIconInline from '@/app/components/GuideIconInline'

// Local helpers
import {
  type TabKey,
  SubstatColorLegend,
  PerfectSubstatsExample,
  HammerMaterials,
  CatalystMaterials,
  GluniteMaterials,
  EnhancementComparisonGrid,
  BreakthroughExamplesGrid,
  GearPriorityList,
  UpgradeMethodsGrid,
  SectionHeader,
  ChangeStatsModesGrid,
  ObtainingMethodsList,
} from './helpers'

// ============================================================================
// LOCALIZED CONTENT
// ============================================================================

const TEXTS = {
  // Main
  title: '装備ガイド',
  introduction: 'アウタープレーンの装備の仕組み、強化システム、最高の装備の入手方法を網羅したガイドです。',

  // Tabs
  tabs: {
    basics: '装備の基本',
    upgrading: '装備強化',
    obtaining: '装備入手',
    faq: 'よくある質問'
  },

  // Basics section
  basics: {
    overviewTitle: '概要',
    overviewText: '装備はヒーローの戦力に重要な役割を果たします。各ヒーローは3種類の装備を装着できます：',
    gearTypes: {
      weapon: '武器',
      accessory: 'アクセサリー',
      armor: '防具'
    },
    gearTypesEnd: '。それぞれが戦闘でのステータスとパフォーマンスに影響します。',
    propertiesTitle: '装備のプロパティ',
    propertiesText: '各装備には以下のプロパティがあります：',
    substatsTitle: 'サブステータスについて',
    substatsRule: '各ステータスはアイテムごとに1回のみ出現します。メインステータスかサブステータスかに関わらず同じです（例：速度メインのアクセサリーに速度サブは付きません）。',
    substatsColorIntro: 'サブステータスの値は6つのセグメントで表され、以下の色で示されます：',
    substatsColors: {
      gray: 'グレー — 非活性',
      yellow: 'イエロー — 活性（初期抽選）',
      orange: 'オレンジ — 活性（再鍛造で獲得）'
    },
    equipmentProperties: {
      stars: 'スターレベル：1★黄色から6★黄色まで',
      reforge: '再鍛造レベル：1★オレンジから6★オレンジまで',
      rarity: 'グレード：ノーマル、スーペリア、エピック、レジェンダリー',
      upgrade: '強化レベル：0から+10まで',
      tier: '突破：T0からT4まで',
      set: 'セット効果または固有効果',
      class: 'クラス制限（レジェンダリー武器＆アクセサリー）'
    },
    maxYellowTitle: '黄色セグメントの最大数',
    maxYellowText: 'サブステータスごとの黄色セグメントの最大数は3です。ただし、イベントショップの一部アイテムでは4が見られる場合があります。リコの秘密ショップでは単一のサブステに4本のバーが付くこともありますが、ショップが最大レベルである必要があり、確率も低いです。',
    perfectExample: '「完璧な」装備の例（ショップ除く）：'
  },

  // Common labels
  common: {
    materials: '素材：',
    tip: 'ヒント：',
    note: '注意：'
  },

  // Upgrading section
  upgrading: {
    title: '装備強化システム',
    intro: '装備を強化する方法は4つあります：',
    methods: {
      enhance: { title: '強化', desc: '強化レベルでメインステータスを上昇' },
      reforge: { title: '再鍛造', desc: 'サブステータスを追加または改善' },
      breakthrough: { title: '突破', desc: 'セット効果を解放し効果を向上' },
      changeStats: { title: 'ステータス変更', desc: 'トランジストーンでサブステを再抽選' }
    },

    // Enhance
    enhanceText: '強化メニューから利用可能。ハンマーを使用してアイテムの強化レベルを+10まで上げます。これはメインステータスのみを向上させ、アイテムのグレードと星レベルに基づきます。',
    enhanceTip1: 'インベントリでハンマーを2:1の比率で上位グレードに変換できます。',
    enhanceTip2: 'ハンマーの変換は特殊装備の強化にのみ有用です。通常の強化では意味がありません。',
    enhanceTip3: '見習いのハンマーを合成すると合計経験値がやや多くなります（変換時の250に対して200）が、ゴールドがかかるため、得られる利益は変換コストで相殺されることが多いです。',
    enhanceComparisonTitle: 'レアリティ別の強化比較：',
    enhanceLabels: { normal: 'ノーマル (1★)', epic: 'エピック (2★)', legendary: 'レジェンダリー (1★)' },

    // Reforge
    reforgeText: '強化メニューの再鍛造タブから利用可能。再鍛造は触媒を使用してサブステータスを改善します。',
    reforgeTip: 'ハンマーと同様に、インベントリで触媒を6:1の比率で上位グレードに変換できます。',
    reforgeHowTitle: '再鍛造の仕組み：',
    reforgeStep1: 'サブステータスが4つ未満の場合、1つ追加されます（最大4つまで）',
    reforgeStep2: 'サブステータスが4つある場合、1つが強化されます（オレンジセグメントが追加、最大6セグメントまで）',
    reforgeLimitTitle: '再鍛造の上限',
    reforgeLimitText: 'アイテムは星レベルまで再鍛造できます（1★装備は1回、6★装備は最大6回）。',

    // Breakthrough
    breakthroughText: '強化メニューの突破タブから利用可能。突破はアイテムのティアをT4まで上げ、メインステータスとアイテム効果を向上させます。',
    breakthroughTip: 'グルナイトの代わりに同一アイテムを使用できます（同じグレード、同じ効果、同じスロットである必要があります）。',
    breakthroughExamplesTitle: '突破の例：',

    // Change Stats
    changeStatsText: 'ステータス変更メニューから利用可能。2つのモードがあります：',
    changeStatsModes: {
      changeAll: {
        title: '全変更（トランジストーン・トータル）',
        desc: '4つのサブステすべてと黄色セグメントを再抽選します。オレンジセグメントは固定されたままです。また、選択変更でロックされていたステータスも解除されます。'
      },
      selectChange: {
        title: '選択変更（トランジストーン・インディビジュアル）',
        desc: '選択した1つのサブステのみを再抽選します。他の3つのサブステはロックされ、変更されません。この方法でロックされたステータスは、全変更を使用するまでロックされたままです。黄色セグメントの数は変わりますが、オレンジは固定です。'
      }
    },
    changeStatsWarningTitle: '注意',
    changeStatsWarningText: 'サブステにすでに4つ以上のオレンジセグメントがある場合、トランジストーン（インディビジュアル）での再抽選は避けてください。オレンジセグメントは固定されるため、再抽選の範囲が1〜3から1〜2黄色セグメントに減少します。'
  },

  // Obtaining section
  obtaining: {
    title: '6★装備の入手方法',
    intro: 'アウタープレーンで6★装備を入手する主な方法は4つあります：',
    methods: {
      farmBosses: {
        title: '装備ボス＆ストーリーステージを周回',
        desc: 'シーズン3の5-10以降の装備ボスとストーリーハードステージを周回。武器とアクセサリーはメインステータスとスキルのRNGが重いため、防具の周回を優先しましょう。'
      },
      craftArmor: {
        title: "ケイトのショップで防具を製作",
        desc: '製作割引週間（月1回）に防具を製作。ポテンティウム（防具）を使用して希望の防具セットを選択できます。',
        warning: 'RNGのため武器/アクセサリーの製作は避けてください。'
      },
      preciseCraft: {
        title: '精密製作を使用',
        desc: '武器とアクセサリーには精密製作を使用。エフェクティウムを使用し、サブステの再抽選が可能で、トランジストーン（インディビジュアル）の節約になります。'
      },
      irregularBosses: {
        title: 'イレギュラーボスを周回',
        desc: 'クイーンとワイバーンは1つの装備セットをドロップし、他の2体のボスは別のセットをドロップします。ビルドに合わせて適切なボスを周回しましょう。'
      }
    },
    dropRateTitle: 'ドロップ率の向上',
    dropRateText: 'スペシャルリクエストステージのドロップ率を上げるモナドゲートの称号を使用しましょう。ワールドライン・エクスプローラーなどの称号は最大30%のドロップ率アップが可能で、RNGのストレスを軽減できます。',
    shopsTitle: '特別ショップ＆イベント',
    limitedShopsTitle: '期間限定ショップ',
    limitedShopsText: '年に数回、期間限定ショップで3×4サブステ（またはそれ以上）のレジェンダリー装備がエーテルで購入できます。非常にお得なので優先しましょう。',
    eventChestsTitle: 'イベント選択チェスト',
    eventChestsText: 'イベントでは武器、アクセサリー、防具のチェストが含まれることが多いです。メインステータスが固定かランダムか確認しましょう。サブステは特に記載がない限り通常ランダムです。',
    priorityTitle: 'スロット別装備優先度',
    priorityIntro: 'レジェンダリー装備の周回とトランジストーン使用の優先順位：',
    prioritySlots: {
      weapons: '武器',
      accessories: 'アクセサリー',
      gloves: 'グローブ',
      otherArmor: 'その他の防具'
    },
    priorityDescriptions: {
      weapons: '固有スキルあり、レジェンダリー最優先',
      accessories: '固有スキルあり、DPSにはメインステが重要',
      gloves: '特定コンテンツでは命中メインステが重要',
      otherArmor: 'エピックでも使える、レアリティよりサブステ重視'
    }
  },

  // FAQ section
  faq: {
    qualityTitle: '装備の品質とレアリティ',
    upgradingTitle: '強化とリソース',
    farmingTitle: '周回と入手',

    // Quality questions
    legendaryOnly: {
      q: 'レジェンダリー装備だけを狙うべき？',
      a1: 'いいえ！エピック装備は特に防具で強力な代替品です。',
      a2: '強化コストが安く、最大ステータスはレジェンダリーより再鍛造1回分少ないだけです。',
      a3: '武器とアクセサリーには固有スキルがあるため、ここではレジェンダリーを優先し、次に命中のためグローブを狙いましょう。'
    },
    sixVsFive: {
      q: '6★装備は常に5★レジェンダリーより良い？',
      a1: '一般的に、すべての6★装備は5★レジェンダリー（赤）装備より優れています。保持する価値のある5★装備は、固有パッシブを持つイベントショップのものだけです（装備ページで5★の武器とアクセサリーを選択すると確認できます）。',
      a2: '6★青防具はエンドゲームコンテンツでも使用可能で、強化も簡単です。',
      a3: 'グレー/グリーンの6★防具は、より良い青や赤の装備を入手するまでの一時的な使用にとどめましょう。'
    },

    // Upgrading questions
    transistoneUsage: {
      q: 'トランジストーンはいつ使うべき？',
      a: 'トランジストーンは主にイレギュラー装備に使用し、次に赤防具に使用します。赤以外の装備には使用しないでください。'
    },
    badMainStat: {
      q: '良い武器/アクセサリーでメインステが悪い場合は？',
      a: '突破用の素材として保存しておきましょう。正しいメインステを持つより良いバージョンを入手したら、その装備の突破に使用できます。'
    },
    badSubstats: {
      q: 'サブステが悪い赤防具はどうする？',
      a: 'トランジストーン（トータル）を使いたくない場合は、突破用素材として保存。十分なトータル・トランジストーンがある場合は、3つの良いサブステが出るまで再抽選し、最後の1つをトランジストーン（インディビジュアル）で修正しましょう。'
    },

    // Farming questions
    howToGet: {
      q: '6★装備を入手する主な方法は？',
      intro: '主な4つの選択肢：',
      m1: 'シーズン3の5-10以降の装備ボスとストーリーハードステージを周回。武器とアクセサリーはRNGが重いため、防具の周回を優先。',
      m2: 'ケイトのショップで製作割引週間（月1回）に防具を製作。ポテンティウム（防具）で希望のセットを選択。RNGのため武器/アクセサリーの製作は避ける。',
      m3: '武器/アクセサリーには精密製作を使用。エフェクティウムを使用し、サブステ再抽選が可能でトランジストーン（インディビジュアル）を節約。',
      m4: 'イレギュラーボスを周回。クイーンとワイバーンは1つのセット、他の2体は別のセットをドロップ。ビルドに合わせて適切なボスを周回。'
    },
    dropBoost: {
      q: '装備のドロップ率を上げるには？',
      a: 'スペシャルリクエストステージのドロップ率を上げるモナドゲートの称号を使用。ワールドライン・エクスプローラーなどの称号は最大30%のドロップ率アップが可能で、RNGのストレスを軽減。'
    },
    limitedShop: {
      q: '期間限定ショップは価値がある？',
      a: 'はい。年に数回、期間限定ショップで3×4サブステ（またはそれ以上）のレジェンダリー装備がエーテルで購入できます。非常にお得なので優先しましょう。'
    },
    eventChests: {
      q: 'イベントの装備選択チェストについては？',
      a: '武器、アクセサリー、防具のチェストが含まれることが多いです。メインステータスが固定かランダムか確認。サブステは特に記載がない限り通常ランダムです。'
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ALLOWED_TABS: TabKey[] = ['basics', 'upgrading', 'obtaining', 'faq']

export default function GearGuide() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabKey | null
  const [selected, setSelected] = useState<TabKey>('basics')

  // Initialize from URL
  useEffect(() => {
    if (tabParam && ALLOWED_TABS.includes(tabParam)) {
      setSelected(tabParam)
    } else if (tabParam === null) {
      setSelected('basics')
    }
  }, [tabParam])

  // Handle tab change and update URL
  const handleTabChange = (key: TabKey) => {
    setSelected(key)
    const params = new URLSearchParams(window.location.search)
    if (key === 'basics') {
      params.delete('tab') // default tab → clean URL
    } else {
      params.set('tab', key)
    }
    const qs = params.toString()
    const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`
    window.history.replaceState(null, '', newUrl)
  }

  const tabs = [
    { key: 'basics' as const, label: TEXTS.tabs.basics },
    { key: 'upgrading' as const, label: TEXTS.tabs.upgrading },
    { key: 'obtaining' as const, label: TEXTS.tabs.obtaining },
    { key: 'faq' as const, label: TEXTS.tabs.faq }
  ]

  const content = {
    basics: <GearBasicsContent />,
    upgrading: <UpgradingGearContent />,
    obtaining: <ObtainingGearContent />,
    faq: <FAQContent />
  }

  return (
    <div className="guide-content">
      {/* Main Title */}
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-amber-400 border-l-4 border-amber-500 pl-4">
        {TEXTS.title}
      </h2>

      {/* Introduction */}
      <p className="text-neutral-300 mb-6 leading-relaxed">
        {TEXTS.introduction}
      </p>

      {/* Animated Tabs */}
      <div className="flex justify-center mb-6 mt-4">
        <AnimatedTabs
          tabs={tabs}
          selected={selected}
          onSelect={handleTabChange}
          pillColor="#f59e0b"
          scrollable={false}
        />
      </div>

      {/* Content */}
      <section className="guide-version-content mt-6">
        {content[selected]}
      </section>
    </div>
  )
}

// ============================================================================
// GEAR BASICS CONTENT
// ============================================================================

function GearBasicsContent() {
  const t = TEXTS.basics

  return (
    <div className="space-y-8">
      <GuideHeading level={2}>{t.overviewTitle}</GuideHeading>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
        <p>
          {t.overviewText} <strong className="text-red-400">{t.gearTypes.weapon}</strong>、<strong className="text-purple-400">{t.gearTypes.accessory}</strong>、<strong className="text-blue-400">{t.gearTypes.armor}</strong>{t.gearTypesEnd}
        </p>
      </div>

      <GuideHeading level={3}>{t.propertiesTitle}</GuideHeading>

      <p className="mb-4">{t.propertiesText}</p>

      <EquipmentIntro labels={t.equipmentProperties} />

      <GuideHeading level={3}>{t.substatsTitle}</GuideHeading>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
        <p>{t.substatsRule}</p>

        <div className="mt-4">
          <p className="mb-2">{t.substatsColorIntro}</p>
          <SubstatColorLegend labels={t.substatsColors} />
        </div>

        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mt-4">
          <p className="font-semibold text-amber-300">{t.maxYellowTitle}</p>
          <p className="mt-2 text-sm">{t.maxYellowText}</p>
        </div>

        <div className="mt-6">
          <p className="mb-3">{t.perfectExample}</p>
          <PerfectSubstatsExample />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// UPGRADING GEAR CONTENT
// ============================================================================

function UpgradingGearContent() {
  const t = TEXTS.upgrading

  return (
    <div className="space-y-8">
      <GuideHeading level={2}>{t.title}</GuideHeading>

      <p className="text-neutral-300 mb-6">{t.intro}</p>

      <UpgradeMethodsGrid labels={t.methods} />

      {/* Enhance Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
        <SectionHeader number={1} title={t.methods.enhance.title} color="green" />

        <p>{t.enhanceText}</p>

        <HammerMaterials label={TEXTS.common.materials} />

        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-sm space-y-2">
          <p className="text-neutral-400">
            <strong className="text-neutral-200">{TEXTS.common.tip}</strong> {t.enhanceTip1}
          </p>
          <p className="text-neutral-400">{t.enhanceTip2}</p>
          <p className="text-neutral-400">{t.enhanceTip3}</p>
        </div>

        <div className="mt-6">
          <p className="font-semibold mb-4">{t.enhanceComparisonTitle}</p>
          <EnhancementComparisonGrid labels={t.enhanceLabels} />
        </div>
      </div>

      {/* Reforge Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
        <SectionHeader number={2} title={t.methods.reforge.title} color="purple" />

        <p>{t.reforgeText}</p>

        <CatalystMaterials label={TEXTS.common.materials} />

        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-sm">
          <p className="text-neutral-400">
            <strong className="text-neutral-200">{TEXTS.common.note}</strong> {t.reforgeTip}
          </p>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-3">{t.reforgeHowTitle}</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-purple-900/20 rounded-lg">
              <span className="text-purple-400 font-bold">1</span>
              <p>{t.reforgeStep1}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-900/20 rounded-lg">
              <span className="text-purple-400 font-bold">2</span>
              <p>{t.reforgeStep2}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
          <p className="text-purple-300 font-semibold">{t.reforgeLimitTitle}</p>
          <p className="text-sm mt-1">
            {t.reforgeLimitText.split('1★')[0]}<StarLevel levelLabel="1" size={14} />{t.reforgeLimitText.split('1★')[1].split('6★')[0]}<StarLevel levelLabel="6" size={14} />{t.reforgeLimitText.split('6★')[1]}
          </p>
        </div>
      </div>

      {/* Breakthrough Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
        <SectionHeader number={3} title={t.methods.breakthrough.title} color="amber" />

        <p>{t.breakthroughText}</p>

        <GluniteMaterials label={TEXTS.common.materials} />

        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-sm">
          <p className="text-neutral-400">
            <strong className="text-neutral-200">{TEXTS.common.note}</strong> {t.breakthroughTip}
          </p>
        </div>

        <div className="mt-6">
          <p className="font-semibold mb-4">{t.breakthroughExamplesTitle}</p>
          <BreakthroughExamplesGrid lang="jp" />
        </div>
      </div>

      {/* Change Stats Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
        <SectionHeader number={4} title={t.methods.changeStats.title} color="cyan" />

        <p>{t.changeStatsText}</p>

        <ChangeStatsModesGrid labels={t.changeStatsModes} />

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
          <p className="text-yellow-300 font-semibold">{t.changeStatsWarningTitle}</p>
          <p className="text-sm mt-1">{t.changeStatsWarningText}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// OBTAINING GEAR CONTENT
// ============================================================================

function ObtainingGearContent() {
  const t = TEXTS.obtaining

  const methodsContent = {
    farmBosses: {
      title: t.methods.farmBosses.title,
      content: <p>{t.methods.farmBosses.desc}</p>
    },
    craftArmor: {
      title: t.methods.craftArmor.title,
      content: (
        <>
          <p>
            {t.methods.craftArmor.desc.split('ポテンティウム（防具）')[0]}
            <ItemInlineDisplay names="Potentium (Armor)" />
            {t.methods.craftArmor.desc.split('ポテンティウム（防具）')[1]}
          </p>
          <p className="text-amber-300 text-sm mt-2">{t.methods.craftArmor.warning}</p>
        </>
      )
    },
    preciseCraft: {
      title: t.methods.preciseCraft.title,
      content: (
        <p>
          {t.methods.preciseCraft.desc.split('エフェクティウム')[0]}
          <ItemInlineDisplay names="Effectium" />
          {t.methods.preciseCraft.desc.split('エフェクティウム')[1].split('トランジストーン（インディビジュアル）')[0]}
          <ItemInlineDisplay names="Transistone (Individual)" />
          {t.methods.preciseCraft.desc.split('トランジストーン（インディビジュアル）')[1]}
        </p>
      )
    },
    irregularBosses: {
      title: t.methods.irregularBosses.title,
      content: <p>{t.methods.irregularBosses.desc}</p>
    }
  }

  return (
    <div className="space-y-8">
      <GuideHeading level={2}>{t.title}</GuideHeading>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
        <p className="mb-6">{t.intro}</p>
        <ObtainingMethodsList content={methodsContent} />
      </div>

      <GuideHeading level={3}>{t.dropRateTitle}</GuideHeading>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
        <p>
          {t.dropRateText.split('ワールドライン・エクスプローラー')[0]}
          <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
          {t.dropRateText.split('ワールドライン・エクスプローラー')[1]}
        </p>
      </div>

      <GuideHeading level={3}>{t.shopsTitle}</GuideHeading>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">{t.limitedShopsTitle}</h4>
          <p className="text-neutral-300 text-sm">
            {t.limitedShopsText.split('エーテル')[0]}
            <ItemInlineDisplay names="Ether" />
            {t.limitedShopsText.split('エーテル').slice(1).join('エーテル')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-amber-400 mb-3">{t.eventChestsTitle}</h4>
          <p className="text-neutral-300 text-sm">{t.eventChestsText}</p>
        </div>
      </div>

      <GuideHeading level={3}>{t.priorityTitle}</GuideHeading>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
        <p className="mb-4">{t.priorityIntro}</p>
        <GearPriorityList slots={t.prioritySlots} descriptions={t.priorityDescriptions} />
      </div>
    </div>
  )
}

// ============================================================================
// FAQ CONTENT
// ============================================================================

function FAQContent() {
  const t = TEXTS.faq

  return (
    <div className="space-y-8">
      {/* Gear Quality */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-amber-400">{t.qualityTitle}</h4>
        <Accordion
          items={[
            {
              key: 'red-gear-weapons',
              title: t.legendaryOnly.q,
              content: (
                <>
                  <p><strong>{t.legendaryOnly.a1}</strong></p>
                  <p className="mt-2">{t.legendaryOnly.a2}</p>
                  <p className="mt-2">{t.legendaryOnly.a3}</p>
                </>
              ),
            },
            {
              key: '6v5-comparison',
              title: t.sixVsFive.q,
              content: (
                <>
                  <p>{t.sixVsFive.a1}</p>
                  <p className="mt-2">{t.sixVsFive.a2}</p>
                  <p className="mt-2">{t.sixVsFive.a3}</p>
                </>
              ),
            },
          ]}
        />
      </div>

      {/* Upgrading */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-purple-400">{t.upgradingTitle}</h4>
        <Accordion
          items={[
            {
              key: 'transistone-usage',
              title: t.transistoneUsage.q,
              content: <p>{t.transistoneUsage.a}</p>,
            },
            {
              key: 'bad-main-stat',
              title: t.badMainStat.q,
              content: <p>{t.badMainStat.a}</p>,
            },
            {
              key: 'bad-substats-red-armor',
              title: t.badSubstats.q,
              content: (
                <p>
                  {t.badSubstats.a.split('トランジストーン（トータル）')[0]}
                  <ItemInlineDisplay names="Transistone (Total)" />
                  {t.badSubstats.a.split('トランジストーン（トータル）')[1].split('トランジストーン（インディビジュアル）')[0]}
                  <ItemInlineDisplay names="Transistone (Individual)" />
                  {t.badSubstats.a.split('トランジストーン（インディビジュアル）')[1]}
                </p>
              ),
            },
          ]}
        />
      </div>

      {/* Farming */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-green-400">{t.farmingTitle}</h4>
        <Accordion
          items={[
            {
              key: 'how-to-get-6star',
              title: t.howToGet.q,
              content: (
                <>
                  <p>{t.howToGet.intro}</p>
                  <ol className="list-decimal list-inside ml-4 space-y-2 mt-2">
                    <li><strong>{t.howToGet.m1.split('シーズン')[0]}</strong>{'シーズン' + t.howToGet.m1.split('シーズン')[1]}</li>
                    <li>
                      <strong>{t.howToGet.m2.split('製作割引')[0]}</strong>
                      {'製作割引' + t.howToGet.m2.split('製作割引')[1].split('ポテンティウム（防具）')[0]}
                      <ItemInlineDisplay names="Potentium (Armor)" />
                      {t.howToGet.m2.split('ポテンティウム（防具）')[1]}
                    </li>
                    <li>
                      <strong>{t.howToGet.m3.split('エフェクティウム')[0]}</strong>
                      <ItemInlineDisplay names="Effectium" />
                      {t.howToGet.m3.split('エフェクティウム')[1].split('トランジストーン（インディビジュアル）')[0]}
                      <ItemInlineDisplay names="Transistone (Individual)" />
                      {t.howToGet.m3.split('トランジストーン（インディビジュアル）')[1]}
                    </li>
                    <li><strong>{t.howToGet.m4.split('クイーン')[0]}</strong>{'クイーン' + t.howToGet.m4.split('クイーン')[1]}</li>
                  </ol>
                </>
              ),
            },
            {
              key: 'drop-boost-titles',
              title: t.dropBoost.q,
              content: (
                <p>
                  {t.dropBoost.a.split('ワールドライン・エクスプローラー')[0]}
                  <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
                  {t.dropBoost.a.split('ワールドライン・エクスプローラー')[1]}
                </p>
              ),
            },
            {
              key: 'limited-shop-worth',
              title: t.limitedShop.q,
              content: (
                <p>
                  {t.limitedShop.a.split('エーテル')[0]}
                  <ItemInlineDisplay names="Ether" />
                  {t.limitedShop.a.split('エーテル').slice(1).join('エーテル')}
                </p>
              ),
            },
            {
              key: 'event-selection-chests',
              title: t.eventChests.q,
              content: <p>{t.eventChests.a}</p>,
            },
          ]}
        />
      </div>
    </div>
  )
}

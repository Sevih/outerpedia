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
  title: '장비 가이드',
  introduction: '아우터플레인의 장비 시스템, 강화 방법, 최고의 장비를 얻는 방법을 다루는 종합 가이드입니다.',

  // Tabs
  tabs: {
    basics: '장비 기초',
    upgrading: '장비 강화',
    obtaining: '장비 획득',
    faq: 'FAQ'
  },

  // Basics section
  basics: {
    overviewTitle: '개요',
    overviewText: '장비는 영웅의 전투력에 중요한 역할을 합니다. 각 영웅은 세 가지 유형의 장비를 장착할 수 있습니다:',
    gearTypes: {
      weapon: '무기',
      accessory: '액세서리',
      armor: '방어구'
    },
    gearTypesEnd: '. 각각은 전투에서의 스탯과 성능에 기여합니다.',
    propertiesTitle: '장비 속성',
    propertiesText: '각 장비에는 다음과 같은 속성이 있습니다:',
    substatsTitle: '부옵션 이해하기',
    substatsRule: '각 스탯은 메인 스탯이든 부옵션이든 아이템당 한 번만 나타납니다 (예: 속도 메인옵 액세서리에는 속도 부옵이 붙지 않습니다).',
    substatsColorIntro: '부옵션 값은 6개의 세그먼트로 표시되며 다음 색상 코드를 사용합니다:',
    substatsColors: {
      gray: '회색 — 비활성',
      yellow: '노란색 — 활성 (초기 추첨)',
      orange: '주황색 — 활성 (재련으로 획득)'
    },
    equipmentProperties: {
      stars: '스타 레벨: 1★ 노란색부터 6★ 노란색까지',
      reforge: '재련 레벨: 1★ 주황색부터 6★ 주황색까지',
      rarity: '등급: 노말, 슈페리어, 에픽, 레전드',
      upgrade: '강화 레벨: 0부터 +10까지',
      tier: '돌파: T0부터 T4까지',
      set: '세트 효과 또는 고유 효과',
      class: '클래스 제한 (레전드 무기 & 액세서리)'
    },
    maxYellowTitle: '최대 노란색 세그먼트',
    maxYellowText: '부옵션당 노란색 세그먼트의 최대 수는 3개입니다. 단, 이벤트 상점의 일부 아이템에서는 4개가 나올 수 있습니다. 리코의 비밀 상점에서는 단일 부옵에 4칸이 붙을 수 있지만, 상점이 최대 레벨이어야 하며 확률도 낮습니다.',
    perfectExample: '"완벽한" 장비 예시 (상점 제외):'
  },

  // Common labels
  common: {
    materials: '재료:',
    tip: '팁:',
    note: '참고:'
  },

  // Upgrading section
  upgrading: {
    title: '장비 강화 시스템',
    intro: '장비를 개선하는 네 가지 방법이 있습니다:',
    methods: {
      enhance: { title: '강화', desc: '강화 레벨로 메인 스탯 증가' },
      reforge: { title: '재련', desc: '부옵션 추가 또는 개선' },
      breakthrough: { title: '돌파', desc: '세트 효과 해금 및 효과 향상' },
      changeStats: { title: '스탯 변경', desc: '트랜지스톤으로 부옵 재추첨' }
    },

    // Enhance
    enhanceText: '강화 메뉴에서 사용 가능. 망치를 사용하여 아이템의 강화 레벨을 +10까지 올립니다. 이는 아이템의 등급과 별 레벨에 따라 메인 스탯만 향상시킵니다.',
    enhanceTip1: '인벤토리에서 망치를 2:1 비율로 상위 등급으로 변환할 수 있습니다.',
    enhanceTip2: '망치 변환은 특수 장비 강화에만 유용합니다. 일반 강화에는 이점이 없습니다.',
    enhanceTip3: '견습생의 망치를 조합하면 총 경험치가 약간 더 많아집니다 (변환 시 250 대비 200), 하지만 골드가 들어 이득이 변환 비용으로 상쇄되는 경우가 많습니다.',
    enhanceComparisonTitle: '희귀도별 강화 비교:',
    enhanceLabels: { normal: '노멀 (1★)', epic: '에픽 (2★)', legendary: '레전드 (1★)' },

    // Reforge
    reforgeText: '강화 메뉴의 재련 탭에서 사용 가능. 재련은 촉매를 사용하여 부옵션을 개선합니다.',
    reforgeTip: '망치와 마찬가지로 인벤토리에서 촉매를 6:1 비율로 상위 등급으로 변환할 수 있습니다.',
    reforgeHowTitle: '재련 작동 방식:',
    reforgeStep1: '아이템에 부옵션이 4개 미만이면 하나가 추가됩니다 (최대 4개)',
    reforgeStep2: '아이템에 부옵션이 4개 있으면 하나가 강화됩니다 (주황색 세그먼트 추가, 최대 6개)',
    reforgeLimitTitle: '재련 한도',
    reforgeLimitText: '아이템은 별 레벨까지 재련할 수 있습니다 (1★ 장비는 1회, 6★ 장비는 최대 6회).',

    // Breakthrough
    breakthroughText: '강화 메뉴의 돌파 탭에서 사용 가능. 돌파는 아이템의 티어를 T4까지 올려 메인 스탯과 아이템 효과를 향상시킵니다.',
    breakthroughTip: '글루나이트 대신 동일 아이템을 사용할 수 있습니다 (같은 등급, 같은 효과, 같은 슬롯이어야 합니다).',
    breakthroughExamplesTitle: '돌파 예시:',

    // Change Stats
    changeStatsText: '스탯 변경 메뉴에서 사용 가능. 두 가지 모드가 있습니다:',
    changeStatsModes: {
      changeAll: {
        title: '전체 변경 (트랜지스톤 토탈)',
        desc: '4개의 부옵션 모두와 노란색 세그먼트를 재추첨합니다. 주황색 세그먼트는 고정됩니다. 또한 선택 변경으로 잠긴 스탯도 해제됩니다.'
      },
      selectChange: {
        title: '선택 변경 (트랜지스톤 개별)',
        desc: '선택한 하나의 부옵션만 재추첨합니다. 나머지 3개의 부옵션은 잠기며 변경되지 않습니다. 이 방법으로 잠긴 스탯은 전체 변경을 사용할 때까지 잠긴 상태로 유지됩니다. 노란색 세그먼트 수는 변하지만 주황색은 고정됩니다.'
      }
    },
    changeStatsWarningTitle: '주의',
    changeStatsWarningText: '부옵션에 이미 4개 이상의 주황색 세그먼트가 있는 경우 트랜지스톤 (개별)으로 재추첨하지 마세요. 주황색 세그먼트는 고정되므로 재추첨 범위가 1-3에서 1-2 노란색 세그먼트로 줄어듭니다.'
  },

  // Obtaining section
  obtaining: {
    title: '6성 장비 획득 방법',
    intro: '아우터플레인에서 6성 장비를 획득하는 네 가지 주요 방법이 있습니다:',
    methods: {
      farmBosses: {
        title: '장비 보스 & 스토리 스테이지 파밍',
        desc: '시즌 3, 5-10부터 장비 보스와 스토리 하드 스테이지를 파밍하세요. 무기와 액세서리는 메인 스탯과 스킬의 RNG가 심하므로 방어구 파밍을 우선시하세요.'
      },
      craftArmor: {
        title: "케이트 상점에서 방어구 제작",
        desc: '제작 할인 주간 (월 1회)에 방어구를 제작하세요. 포텐티움 (방어구)을 사용하여 원하는 방어구 세트를 선택할 수 있습니다.',
        warning: 'RNG 때문에 무기/액세서리 제작은 피하세요.'
      },
      preciseCraft: {
        title: '정밀 제작 사용',
        desc: '무기와 액세서리에는 정밀 제작을 사용하세요. 이펙티움을 사용하며 부옵 재추첨이 가능해 트랜지스톤 (개별)을 절약할 수 있습니다.'
      },
      irregularBosses: {
        title: '이레귤러 보스 파밍',
        desc: '퀸과 와이번은 한 장비 세트를 드롭하고, 나머지 두 보스는 다른 세트를 드롭합니다. 빌드에 맞는 보스를 파밍하세요.'
      }
    },
    dropRateTitle: '드롭률 높이기',
    dropRateText: '스페셜 리퀘스트 스테이지의 드롭률을 높이는 모나드 게이트 칭호를 사용하세요. 월드라인 익스플로러 같은 칭호는 최대 30%의 드롭률 증가가 가능해 RNG 스트레스를 줄여줍니다.',
    shopsTitle: '특별 상점 & 이벤트',
    limitedShopsTitle: '기간 한정 상점',
    limitedShopsText: '1년에 몇 번, 기간 한정 상점에서 3×4 부옵 (또는 그 이상)의 레전드 장비를 에테르로 구매할 수 있습니다. 매우 좋은 거래이므로 우선시하세요.',
    eventChestsTitle: '이벤트 선택 상자',
    eventChestsText: '이벤트에는 무기, 액세서리, 방어구 상자가 포함되는 경우가 많습니다. 메인 스탯이 고정인지 랜덤인지 확인하세요. 부옵션은 별도 표시가 없으면 보통 랜덤입니다.',
    priorityTitle: '슬롯별 장비 우선순위',
    priorityIntro: '레전드 장비 파밍과 트랜지스톤 사용의 우선순위:',
    prioritySlots: {
      weapons: '무기',
      accessories: '액세서리',
      gloves: '장갑',
      otherArmor: '기타 방어구'
    },
    priorityDescriptions: {
      weapons: '고유 스킬 보유, 레전드 최우선',
      accessories: '고유 스킬 보유, DPS에게 메인 스탯 중요',
      gloves: '특정 콘텐츠에서 적중 메인 스탯 중요',
      otherArmor: '에픽도 사용 가능, 희귀도보다 부옵 중시'
    }
  },

  // FAQ section
  faq: {
    qualityTitle: '장비 품질 & 희귀도',
    upgradingTitle: '강화 & 자원',
    farmingTitle: '파밍 & 획득',

    // Quality questions
    legendaryOnly: {
      q: '레전드 장비만 노려야 하나요?',
      a1: '아닙니다! 에픽 장비는 특히 방어구에서 강력한 대안입니다.',
      a2: '강화 비용이 저렴하고 최대 스탯은 레전드보다 재련 1회 적을 뿐입니다.',
      a3: '무기와 액세서리는 고유 스킬이 있어 레전드를 우선하고, 그 다음으로 적중을 위해 장갑을 노리세요.'
    },
    sixVsFive: {
      q: '6성 장비가 항상 5성 레전드보다 좋나요?',
      a1: '일반적으로 모든 6성 장비는 5성 레전드 (빨간색) 장비보다 좋습니다. 보관할 가치가 있는 5성 장비는 고유 패시브가 있는 이벤트 상점 아이템뿐입니다 (장비 페이지에서 5성 무기와 액세서리를 선택하면 확인 가능).',
      a2: '6성 파란색 방어구는 엔드게임 콘텐츠에서도 사용 가능하며 강화도 쉽습니다.',
      a3: '회색/초록색 6성 방어구는 더 좋은 파란색이나 빨간색 장비를 얻을 때까지 임시로만 사용하세요.'
    },

    // Upgrading questions
    transistoneUsage: {
      q: '트랜지스톤은 언제 사용해야 하나요?',
      a: '트랜지스톤은 주로 이레귤러 장비에 사용하고, 그 다음으로 빨간 방어구에 사용하세요. 빨간색이 아닌 장비에는 사용하지 마세요.'
    },
    badMainStat: {
      q: '좋은 무기/액세서리인데 메인 스탯이 안 좋으면?',
      a: '돌파 재료로 보관하세요. 올바른 메인 스탯을 가진 더 좋은 버전을 얻으면 해당 장비의 돌파에 사용할 수 있습니다.'
    },
    badSubstats: {
      q: '부옵이 안 좋은 빨간 방어구는 어떻게 하나요?',
      a: '트랜지스톤 (토탈)을 사용하고 싶지 않다면 돌파 재료로 보관하세요. 충분한 토탈 트랜지스톤이 있다면 3개의 좋은 부옵이 나올 때까지 재추첨하고, 마지막 하나는 트랜지스톤 (개별)로 수정하세요.'
    },

    // Farming questions
    howToGet: {
      q: '6성 장비를 얻는 주요 방법은?',
      intro: '네 가지 주요 옵션:',
      m1: '시즌 3, 5-10부터 장비 보스와 스토리 하드 스테이지를 파밍. 무기와 액세서리는 RNG가 심하므로 방어구 파밍 우선.',
      m2: '케이트 상점에서 제작 할인 주간 (월 1회)에 방어구 제작. 포텐티움 (방어구)으로 원하는 세트 선택. RNG 때문에 무기/액세서리 제작 피함.',
      m3: '무기/액세서리에는 정밀 제작 사용. 이펙티움을 사용하며 부옵 재추첨 가능, 트랜지스톤 (개별) 절약.',
      m4: '이레귤러 보스 파밍. 퀸과 와이번은 한 세트, 나머지 두 보스는 다른 세트 드롭. 빌드에 맞는 보스 파밍.'
    },
    dropBoost: {
      q: '장비 드롭률을 높이려면?',
      a: '스페셜 리퀘스트 스테이지의 드롭률을 높이는 모나드 게이트 칭호를 사용하세요. 월드라인 익스플로러 같은 칭호는 최대 30%의 드롭률 증가가 가능해 RNG 스트레스를 줄여줍니다.'
    },
    limitedShop: {
      q: '기간 한정 상점은 가치가 있나요?',
      a: '네. 1년에 몇 번, 기간 한정 상점에서 3×4 부옵 (또는 그 이상)의 레전드 장비를 에테르로 구매할 수 있습니다. 매우 좋은 거래이므로 우선시하세요.'
    },
    eventChests: {
      q: '이벤트 장비 선택 상자는?',
      a: '무기, 액세서리, 방어구 상자가 포함되는 경우가 많습니다. 메인 스탯이 고정인지 랜덤인지 확인하세요. 부옵션은 별도 표시가 없으면 보통 랜덤입니다.'
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
          {t.overviewText} <strong className="text-red-400">{t.gearTypes.weapon}</strong>, <strong className="text-purple-400">{t.gearTypes.accessory}</strong>, <strong className="text-blue-400">{t.gearTypes.armor}</strong>{t.gearTypesEnd}
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
          <BreakthroughExamplesGrid lang="kr" />
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
            {t.methods.craftArmor.desc.split('포텐티움 (방어구)')[0]}
            <ItemInlineDisplay names="Potentium (Armor)" />
            {t.methods.craftArmor.desc.split('포텐티움 (방어구)')[1]}
          </p>
          <p className="text-amber-300 text-sm mt-2">{t.methods.craftArmor.warning}</p>
        </>
      )
    },
    preciseCraft: {
      title: t.methods.preciseCraft.title,
      content: (
        <p>
          {t.methods.preciseCraft.desc.split('이펙티움')[0]}
          <ItemInlineDisplay names="Effectium" />
          {t.methods.preciseCraft.desc.split('이펙티움')[1].split('트랜지스톤 (개별)')[0]}
          <ItemInlineDisplay names="Transistone (Individual)" />
          {t.methods.preciseCraft.desc.split('트랜지스톤 (개별)')[1]}
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
          {t.dropRateText.split('월드라인 익스플로러')[0]}
          <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
          {t.dropRateText.split('월드라인 익스플로러')[1]}
        </p>
      </div>

      <GuideHeading level={3}>{t.shopsTitle}</GuideHeading>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">{t.limitedShopsTitle}</h4>
          <p className="text-neutral-300 text-sm">
            {t.limitedShopsText.split('에테르')[0]}
            <ItemInlineDisplay names="Ether" />
            {t.limitedShopsText.split('에테르').slice(1).join('에테르')}
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
                  {t.badSubstats.a.split('트랜지스톤 (토탈)')[0]}
                  <ItemInlineDisplay names="Transistone (Total)" />
                  {t.badSubstats.a.split('트랜지스톤 (토탈)')[1].split('트랜지스톤 (개별)')[0]}
                  <ItemInlineDisplay names="Transistone (Individual)" />
                  {t.badSubstats.a.split('트랜지스톤 (개별)')[1]}
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
                    <li><strong>{t.howToGet.m1.split('시즌')[0]}</strong>{'시즌' + t.howToGet.m1.split('시즌')[1]}</li>
                    <li>
                      <strong>{t.howToGet.m2.split('제작 할인')[0]}</strong>
                      {'제작 할인' + t.howToGet.m2.split('제작 할인')[1].split('포텐티움 (방어구)')[0]}
                      <ItemInlineDisplay names="Potentium (Armor)" />
                      {t.howToGet.m2.split('포텐티움 (방어구)')[1]}
                    </li>
                    <li>
                      <strong>{t.howToGet.m3.split('이펙티움')[0]}</strong>
                      <ItemInlineDisplay names="Effectium" />
                      {t.howToGet.m3.split('이펙티움')[1].split('트랜지스톤 (개별)')[0]}
                      <ItemInlineDisplay names="Transistone (Individual)" />
                      {t.howToGet.m3.split('트랜지스톤 (개별)')[1]}
                    </li>
                    <li><strong>{t.howToGet.m4.split('퀸')[0]}</strong>{'퀸' + t.howToGet.m4.split('퀸')[1]}</li>
                  </ol>
                </>
              ),
            },
            {
              key: 'drop-boost-titles',
              title: t.dropBoost.q,
              content: (
                <p>
                  {t.dropBoost.a.split('월드라인 익스플로러')[0]}
                  <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
                  {t.dropBoost.a.split('월드라인 익스플로러')[1]}
                </p>
              ),
            },
            {
              key: 'limited-shop-worth',
              title: t.limitedShop.q,
              content: (
                <p>
                  {t.limitedShop.a.split('에테르')[0]}
                  <ItemInlineDisplay names="Ether" />
                  {t.limitedShop.a.split('에테르').slice(1).join('에테르')}
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

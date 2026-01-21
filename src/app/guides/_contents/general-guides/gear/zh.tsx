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
  title: '装备指南',
  introduction: '本指南全面介绍异域战记的装备机制、强化系统以及如何获取最佳装备。',

  // Tabs
  tabs: {
    basics: '装备基础',
    upgrading: '装备强化',
    obtaining: '装备获取',
    faq: '常见问题'
  },

  // Basics section
  basics: {
    overviewTitle: '概述',
    overviewText: '装备在英雄的战力中起着关键作用。每个英雄可以装备三种类型的装备：',
    gearTypes: {
      weapon: '武器',
      accessory: '饰品',
      armor: '防具'
    },
    gearTypesEnd: '，它们分别影响战斗中的属性和表现。',
    propertiesTitle: '装备属性',
    propertiesText: '每件装备有以下属性：',
    substatsTitle: '理解副属性',
    substatsRule: '每个属性在一件装备上只能出现一次，无论是主属性还是副属性（例如：速度主属的饰品不能有速度副属性）。',
    substatsColorIntro: '副属性值由6个条段表示，使用以下颜色代码：',
    substatsColors: {
      gray: '灰色 — 未激活',
      yellow: '黄色 — 已激活（初始抽取）',
      orange: '橙色 — 已激活（通过重铸获得）'
    },
    equipmentProperties: {
      stars: '星级：从1★黄色到6★黄色',
      reforge: '重铸等级：从1★橙色到6★橙色',
      rarity: '品质：普通、精良、史诗、传说',
      upgrade: '强化等级：从0到+10',
      tier: '突破：从T0到T4',
      set: '套装效果或独特效果',
      class: '职业限制（传说武器和饰品）'
    },
    maxYellowTitle: '黄色条段上限',
    maxYellowText: '每个副属性的黄色条段最多为3条，但活动商店的某些物品可能会出现4条。里科的秘密商店可以给单个副属性4条，但需要商店达到最高等级（即使如此，概率也很低）。',
    perfectExample: '"完美"装备示例（不含商店）：'
  },

  // Common labels
  common: {
    materials: '材料：',
    tip: '提示：',
    note: '注意：'
  },

  // Upgrading section
  upgrading: {
    title: '装备强化系统',
    intro: '有四种主要方式来提升装备：',
    methods: {
      enhance: { title: '强化', desc: '通过强化等级提升主属性' },
      reforge: { title: '重铸', desc: '添加或提升副属性' },
      breakthrough: { title: '突破', desc: '解锁套装效果并提升效果' },
      changeStats: { title: '更换属性', desc: '用转换石重新随机副属性' }
    },

    // Enhance
    enhanceText: '通过强化菜单使用锤子将装备强化等级提升至+10。这只会根据装备的品质和星级提升主属性。',
    enhanceTip1: '你可以在背包中以2:1的比例将锤子转换为更高等级。',
    enhanceTip2: '转换锤子只对强化特殊装备有用，对普通强化没有好处。',
    enhanceTip3: '合成学徒之锤可以获得略多的总经验值（200对比转换后的250），但需要花费金币，所以收益往往被转换费用抵消。',
    enhanceComparisonTitle: '按稀有度强化对比：',
    enhanceLabels: { normal: '普通 (1★)', epic: '史诗 (2★)', legendary: '传说 (1★)' },

    // Reforge
    reforgeText: '通过强化菜单的重铸标签使用催化剂来提升副属性。',
    reforgeTip: '和锤子一样，你可以在背包中以6:1的比例将催化剂转换为更高等级。',
    reforgeHowTitle: '重铸机制：',
    reforgeStep1: '如果装备副属性少于4条，会添加一条（最多4条）',
    reforgeStep2: '如果装备已有4条副属性，会强化其中一条（添加橙色条段，每个副属性最多6条）',
    reforgeLimitTitle: '重铸上限',
    reforgeLimitText: '装备可以重铸的次数等于其星级（1★装备1次，6★装备最多6次）。',

    // Breakthrough
    breakthroughText: '通过强化菜单的突破标签使用格鲁奈特将装备突破至T4，提升主属性和装备效果。',
    breakthroughTip: '你可以使用相同的装备代替格鲁奈特（必须是相同品质、相同效果、相同部位）。',
    breakthroughExamplesTitle: '突破示例：',

    // Change Stats
    changeStatsText: '通过更换属性菜单使用。有两种模式：',
    changeStatsModes: {
      changeAll: {
        title: '全部更换（转换石·全体）',
        desc: '重新随机全部4条副属性及其黄色条段。橙色条段保持固定。这也会解锁之前被选择更换锁定的属性。'
      },
      selectChange: {
        title: '选择更换（转换石·单体）',
        desc: '只重新随机选中的一条副属性。其他3条副属性会被锁定，不会改变。一旦某个属性被这样锁定，在使用全部更换之前会一直保持锁定。黄色条段数量会改变，但橙色保持固定。'
      }
    },
    changeStatsWarningTitle: '注意',
    changeStatsWarningText: '如果副属性已有4条或更多橙色条段，避免使用转换石（单体）重随。因为橙色条段固定，重随范围会从1-3黄色条段降至1-2条。'
  },

  // Obtaining section
  obtaining: {
    title: '如何获取6星装备',
    intro: '在异域战记中获取6星装备有四种主要方式：',
    methods: {
      farmBosses: {
        title: '刷装备Boss和故事关卡',
        desc: '从第三季5-10开始刷装备Boss和故事困难关卡。武器和饰品的主属性和技能RNG较重，优先刷防具。'
      },
      craftArmor: {
        title: '在凯特商店制作防具',
        desc: '在制作折扣周（每月一周）制作防具。使用聚能石（防具）选择你想要的防具套装。',
        warning: '由于RNG，避免制作武器/饰品。'
      },
      preciseCraft: {
        title: '使用精确制作',
        desc: '对于武器和饰品，使用精确制作。这会消耗效能石，允许副属性重随，帮你节省转换石（单体）。'
      },
      irregularBosses: {
        title: '刷异变Boss',
        desc: '女王和飞龙掉落一套装备，另外两个Boss掉落另一套。查看掉落表，刷适合你配装的Boss。'
      }
    },
    dropRateTitle: '提高掉落率',
    dropRateText: '使用提高特殊请求关卡掉落率的莫纳德之门称号。像世界线探索者这样的称号可以将掉落率提高最多30%，帮助减少RNG的烦恼。',
    shopsTitle: '特殊商店和活动',
    limitedShopsTitle: '限时商店',
    limitedShopsText: '每年几次，限时商店会提供3×4副属性（或更好）的传说装备，可用以太购买。这是非常划算的交易，应该优先购买。',
    eventChestsTitle: '活动选择宝箱',
    eventChestsText: '活动通常包含武器、饰品和防具宝箱。检查主属性是固定还是随机的。除非另有说明，副属性通常是随机的。',
    priorityTitle: '装备部位优先级',
    priorityIntro: '传说装备刷取和转换石使用的优先顺序：',
    prioritySlots: {
      weapons: '武器',
      accessories: '饰品',
      gloves: '手套',
      otherArmor: '其他防具'
    },
    priorityDescriptions: {
      weapons: '有独特技能，传说优先级最高',
      accessories: '有独特技能，DPS需要关注主属性',
      gloves: '某些内容中命中主属性很重要',
      otherArmor: '史诗也可用，副属性比稀有度更重要'
    }
  },

  // FAQ section
  faq: {
    qualityTitle: '装备品质和稀有度',
    upgradingTitle: '强化和资源',
    farmingTitle: '刷取和获取',

    // Quality questions
    legendaryOnly: {
      q: '应该只追求传说装备吗？',
      a1: '不！史诗装备是很好的替代品，特别是防具。',
      a2: '强化成本更低，最大属性只比传说少一次重铸。',
      a3: '武器和饰品有独特技能，所以这里优先传说，其次是命中手套。'
    },
    sixVsFive: {
      q: '6星装备一定比5星传说更好吗？',
      a1: '一般来说，所有6星装备都比5星传说（红色）装备好。唯一值得保留的5星装备是活动商店中有独特被动的（你可以在装备页面选择5星武器和饰品查看）。',
      a2: '6星蓝色防具在终局内容中也可用，而且更容易强化。',
      a3: '灰色/绿色6星防具只应临时使用，直到获得更好的蓝色或红色装备。'
    },

    // Upgrading questions
    transistoneUsage: {
      q: '什么时候应该使用转换石？',
      a: '转换石主要用于异变装备，其次是红色防具。不要用在非红色装备上。'
    },
    badMainStat: {
      q: '好武器/饰品但主属性不好怎么办？',
      a: '作为突破材料保存。当你获得主属性正确的更好版本时，可以用它来突破那件装备。'
    },
    badSubstats: {
      q: '副属性不好的红色防具怎么办？',
      a: '如果你不想用转换石（全体），就作为突破材料保存。如果你有足够的全体转换石，重随直到获得3条好的副属性，然后用转换石（单体）修正最后一条。'
    },

    // Farming questions
    howToGet: {
      q: '获取6星装备的主要方式是什么？',
      intro: '四个主要选项：',
      m1: '从第三季5-10开始刷装备Boss和故事困难关卡。武器和饰品RNG重，优先刷防具。',
      m2: '在凯特商店制作折扣周（每月一周）制作防具。用聚能石（防具）选择想要的套装。由于RNG避免制作武器/饰品。',
      m3: '武器/饰品使用精确制作。消耗效能石，允许副属性重随，节省转换石（单体）。',
      m4: '刷异变Boss。女王和飞龙掉一套，另外两个Boss掉另一套。根据配装刷合适的Boss。'
    },
    dropBoost: {
      q: '如何提高装备掉落率？',
      a: '使用提高特殊请求关卡掉落率的莫纳德之门称号。像世界线探索者这样的称号可以将掉落率提高最多30%，帮助减少RNG的烦恼。'
    },
    limitedShop: {
      q: '限时商店值得吗？',
      a: '是的。每年几次，限时商店会提供3×4副属性（或更好）的传说装备，可用以太购买。这是非常划算的交易，应该优先购买。'
    },
    eventChests: {
      q: '活动装备选择宝箱呢？',
      a: '通常包含武器、饰品和防具宝箱。检查主属性是固定还是随机的。除非另有说明，副属性通常是随机的。'
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
          {t.overviewText}<strong className="text-red-400">{t.gearTypes.weapon}</strong>、<strong className="text-purple-400">{t.gearTypes.accessory}</strong>、<strong className="text-blue-400">{t.gearTypes.armor}</strong>{t.gearTypesEnd}
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
          <BreakthroughExamplesGrid lang="zh" />
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
            {t.methods.craftArmor.desc.split('聚能石（防具）')[0]}
            <ItemInlineDisplay names="Potentium (Armor)" />
            {t.methods.craftArmor.desc.split('聚能石（防具）')[1]}
          </p>
          <p className="text-amber-300 text-sm mt-2">{t.methods.craftArmor.warning}</p>
        </>
      )
    },
    preciseCraft: {
      title: t.methods.preciseCraft.title,
      content: (
        <p>
          {t.methods.preciseCraft.desc.split('效能石')[0]}
          <ItemInlineDisplay names="Effectium" />
          {t.methods.preciseCraft.desc.split('效能石')[1].split('转换石（单体）')[0]}
          <ItemInlineDisplay names="Transistone (Individual)" />
          {t.methods.preciseCraft.desc.split('转换石（单体）')[1]}
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
          {t.dropRateText.split('世界线探索者')[0]}
          <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
          {t.dropRateText.split('世界线探索者')[1]}
        </p>
      </div>

      <GuideHeading level={3}>{t.shopsTitle}</GuideHeading>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">{t.limitedShopsTitle}</h4>
          <p className="text-neutral-300 text-sm">
            {t.limitedShopsText.split('以太')[0]}
            <ItemInlineDisplay names="Ether" />
            {t.limitedShopsText.split('以太').slice(1).join('以太')}
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
                  {t.badSubstats.a.split('转换石（全体）')[0]}
                  <ItemInlineDisplay names="Transistone (Total)" />
                  {t.badSubstats.a.split('转换石（全体）')[1].split('转换石（单体）')[0]}
                  <ItemInlineDisplay names="Transistone (Individual)" />
                  {t.badSubstats.a.split('转换石（单体）')[1]}
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
                    <li><strong>{t.howToGet.m1.split('第三季')[0]}</strong>{'第三季' + t.howToGet.m1.split('第三季')[1]}</li>
                    <li>
                      <strong>{t.howToGet.m2.split('制作折扣')[0]}</strong>
                      {'制作折扣' + t.howToGet.m2.split('制作折扣')[1].split('聚能石（防具）')[0]}
                      <ItemInlineDisplay names="Potentium (Armor)" />
                      {t.howToGet.m2.split('聚能石（防具）')[1]}
                    </li>
                    <li>
                      <strong>{t.howToGet.m3.split('效能石')[0]}</strong>
                      <ItemInlineDisplay names="Effectium" />
                      {t.howToGet.m3.split('效能石')[1].split('转换石（单体）')[0]}
                      <ItemInlineDisplay names="Transistone (Individual)" />
                      {t.howToGet.m3.split('转换石（单体）')[1]}
                    </li>
                    <li><strong>{t.howToGet.m4.split('女王')[0]}</strong>{'女王' + t.howToGet.m4.split('女王')[1]}</li>
                  </ol>
                </>
              ),
            },
            {
              key: 'drop-boost-titles',
              title: t.dropBoost.q,
              content: (
                <p>
                  {t.dropBoost.a.split('世界线探索者')[0]}
                  <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
                  {t.dropBoost.a.split('世界线探索者')[1]}
                </p>
              ),
            },
            {
              key: 'limited-shop-worth',
              title: t.limitedShop.q,
              content: (
                <p>
                  {t.limitedShop.a.split('以太')[0]}
                  <ItemInlineDisplay names="Ether" />
                  {t.limitedShop.a.split('以太').slice(1).join('以太')}
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

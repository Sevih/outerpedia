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
  title: 'Equipment Guide',
  introduction: 'A comprehensive guide covering gear mechanics, upgrading systems, and how to obtain the best equipment in Outerplane.',

  // Tabs
  tabs: {
    basics: 'Gear Basics',
    upgrading: 'Upgrading Gear',
    obtaining: 'Obtaining Gear',
    faq: 'FAQ'
  },

  // Basics section
  basics: {
    overviewTitle: 'Overview',
    overviewText: 'Gear plays a crucial role in a hero\'s power. Each hero can equip three different types of gear:',
    gearTypes: {
      weapon: 'Weapon',
      accessory: 'Accessory',
      armor: 'Armor'
    },
    gearTypesEnd: ', each contributing to their overall stats and performance in battle.',
    propertiesTitle: 'Gear Properties',
    propertiesText: 'Each piece of gear has several properties:',
    substatsTitle: 'Understanding Substats',
    substatsRule: 'Each stat can only appear once per item, regardless of whether it is a main stat or a substat (e.g: you cannot roll a speed substat on a speed mainstat Accessory).',
    substatsColorIntro: 'Substat values are represented as a bar with 6 segments using the following color code:',
    substatsColors: {
      gray: 'Gray — Inactive',
      yellow: 'Yellow — Active (from initial roll)',
      orange: 'Orange — Active (gained through reforge)'
    },
    equipmentProperties: {
      stars: 'Star Level: from 1★ yellow star to 6★ yellow',
      reforge: 'Reforge Level: from 1★ orange to 6★ orange',
      rarity: 'Grade: Normal, Superior, Epic, Legendary',
      upgrade: 'Upgrade Level: from 0 to +10',
      tier: 'Breakthrough: from T0 to T4',
      set: 'Set Effect or Unique Effect',
      class: 'Class restriction (Legendary weapons & accessories)'
    },
    maxYellowTitle: 'Maximum Yellow Segments',
    maxYellowText: 'The maximum number of yellow segments per substat is 3, except for some items in the event shop where you may see 4. Rico\'s Secret Shop can grant 4 bars on a single substat, but this requires the shop to be max level (and even then, the chance is rare).',
    perfectExample: 'A "perfect" gear example (excluding shop) might look like:'
  },

  // Common labels
  common: {
    materials: 'Materials:',
    tip: 'Tip:',
    note: 'Note:'
  },

  // Upgrading section
  upgrading: {
    title: 'Gear Enhancement Systems',
    intro: 'There are four main ways to improve your gear:',
    methods: {
      enhance: { title: 'Enhance', desc: 'Increase main stat via enhancement level' },
      reforge: { title: 'Reforge', desc: 'Add or improve substats' },
      breakthrough: { title: 'Breakthrough', desc: 'Unlock set bonuses and improve effects' },
      changeStats: { title: 'Change Stats', desc: 'Reroll substats with Transistones' }
    },

    // Enhance
    enhanceText: 'Available via the Enhance menu, using hammers to increase the item\'s enhancement level up to +10. This improves the Main Stat only, based on the item\'s grade and star level.',
    enhanceTip1: 'You can convert hammers to a higher grade in your inventory with a 2:1 ratio.',
    enhanceTip2: 'Converting hammers is only useful for enhancing Special Gear — there is no benefit for regular enhancing.',
    enhanceTip3: 'Combining Apprentice\'s Hammers can yield slightly more total EXP (200 EXP vs. 250 EXP when converted), but it costs gold — so the gain is often offset by the conversion expense.',
    enhanceComparisonTitle: 'Enhancement Comparison by Rarity:',
    enhanceLabels: { normal: 'Normal (1★)', epic: 'Epic (2★)', legendary: 'Legendary (1★)' },

    // Reforge
    reforgeText: 'Available via the Reforge tab in the Enhance menu. Reforging uses catalysts to improve substats.',
    reforgeTip: 'Like hammers, you can convert catalysts to the upper grade in your inventory with a 6:1 ratio.',
    reforgeHowTitle: 'How Reforging Works:',
    reforgeStep1: 'If the item has less than 4 substats, it will add one (up to 4 total)',
    reforgeStep2: 'If the item has 4 substats, it will enhance one (adds an orange segment) up to a maximum of 6 active segments per substat',
    reforgeLimitTitle: 'Reforge Limit',
    reforgeLimitText: 'You can reforge an item up to its star level (one time for 1★ gear and up to six times for 6★ gear).',

    // Breakthrough
    breakthroughText: 'Available via the Breakthrough tab in the Enhance menu. Breakthrough increases the item\'s tier up to T4, improving the main stat and item\'s effect.',
    breakthroughTip: 'You can use a duplicate item instead of Glunite (it must be the same grade, same effect, and same slot).',
    breakthroughExamplesTitle: 'Breakthrough Examples:',

    // Change Stats
    changeStatsText: 'Available via the Change Stat menu. There are two modes available:',
    changeStatsModes: {
      changeAll: {
        title: 'Change All (Transistone Total)',
        desc: 'Rerolls all 4 substats and their yellow segments. Orange segments remain fixed. This also unlocks any stats that were previously locked by Select & Change.'
      },
      selectChange: {
        title: 'Select & Change (Transistone Individual)',
        desc: 'Rerolls only one selected substat. The other 3 substats are locked and will not change. Once a stat type is locked this way, it stays locked until you use Change All. Yellow segment count will change, but orange ones remain.'
      }
    },
    changeStatsWarningTitle: 'Warning',
    changeStatsWarningText: 'Avoid rerolling stats using Transistone (Individual) if the substat already has 4 or more orange segments. Since orange segments are fixed, the reroll range drops from 1-3 to 1-2 yellow segments.'
  },

  // Obtaining section
  obtaining: {
    title: 'How to Get 6-Star Gear',
    intro: 'There are four main ways to acquire 6-star gear in Outerplane:',
    methods: {
      farmBosses: {
        title: 'Farm Gear Bosses & Story Stages',
        desc: 'Farm gear bosses and story hard stages starting from Season 3, 5-10. Prioritize farming armor, as weapons and accessories involve heavy RNG on main stats and skills.'
      },
      craftArmor: {
        title: "Craft Armor at Kate's Shop",
        desc: 'Craft armor during crafting discount weeks (1 week/month). Use Potentium (Armor) to select your desired armor set.',
        warning: 'Avoid crafting weapons/accessories due to RNG.'
      },
      preciseCraft: {
        title: 'Use Precise Craft',
        desc: 'For weapons and accessories, use Precise Craft. This uses Effectium and allows sub-stat rerolling, helping you save Transistone (Individual).'
      },
      irregularBosses: {
        title: 'Farm Irregular Bosses',
        desc: 'Queen and Wyvre drop one gear set, while the other two bosses drop a different set. Check drop tables to farm the right bosses for your build.'
      }
    },
    dropRateTitle: 'Increasing Drop Rates',
    dropRateText: 'Use Monad Gate titles that increase drop rates from Special Request stages. Some titles, like Worldline Explorer, can boost drop rates by up to 30%, helping reduce RNG frustration.',
    shopsTitle: 'Special Shops & Events',
    limitedShopsTitle: 'Limited-Time Shops',
    limitedShopsText: 'A few times a year, limited shops offer legendary gear with 3×4 substats (or better) purchasable with Ether. These are excellent deals and should be prioritized.',
    eventChestsTitle: 'Event Selection Chests',
    eventChestsText: 'Events often include weapon, accessory, and armor chests. Check if the main stat is fixed or random. Sub-stats are usually random unless stated otherwise.',
    priorityTitle: 'Gear Priority by Slot',
    priorityIntro: 'Where to focus your Legendary gear farming and Transistone usage:',
    prioritySlots: {
      weapons: 'Weapons',
      accessories: 'Accessories',
      gloves: 'Gloves',
      otherArmor: 'Other Armor'
    },
    priorityDescriptions: {
      weapons: 'Unique skills, highest priority for Legendary',
      accessories: 'Unique skills, main stat matters for DPS',
      gloves: 'Accuracy main stat important for certain content',
      otherArmor: 'Epic is viable, focus on substats over rarity'
    }
  },

  // FAQ section
  faq: {
    qualityTitle: 'Gear Quality & Rarity',
    upgradingTitle: 'Upgrading & Resources',
    farmingTitle: 'Farming & Acquisition',

    // Quality questions
    legendaryOnly: {
      q: 'Should I only aim for Legendary gear?',
      a1: 'No! Epic gear is a strong alternative, especially on armor.',
      a2: 'It is cheaper to upgrade and the maximum stats are just 1 reforge lower than Legendary.',
      a3: 'Weapons and Accessories have unique skills, so you would prefer looking for Legendary gear here, followed by Gloves for Accuracy.'
    },
    sixVsFive: {
      q: 'Is 6-star gear always better than 5-star legendary gear?',
      a1: 'In general, all 6-star gear is better than 5-star legendary (red) gear. The only 5-star gear worth keeping are those from event shops with unique passives (you can view them by going to the equipment page and selecting 5 stars on weapons and accessories).',
      a2: '6-star blue armor is viable for end-game content and is easier to upgrade.',
      a3: 'Grey/Green 6-star armor should only be used temporarily until you get better blue or red gear.'
    },

    // Upgrading questions
    transistoneUsage: {
      q: 'When should I use Transistones?',
      a: 'Use Transistones primarily on Irregular gear, then red armor. Do not use them on any other non-red gear.'
    },
    badMainStat: {
      q: 'What if I get a good weapon/accessory with a bad main stat?',
      a: 'Save it as transcend fodder. When you get a better version with the right main stat, you can use it to breakthrough that gear.'
    },
    badSubstats: {
      q: 'What to do with red armor that has bad sub-stats?',
      a: 'If you don\'t want to use Transistone (Total), keep it as transcend fodder. If you do have enough total Transistones, reroll until you get 3 good sub-stats, then use a Transistone (Individual) to fix the last one.'
    },

    // Farming questions
    howToGet: {
      q: 'What are the main ways to get 6-star gear?',
      intro: 'Here are your 4 main options:',
      m1: 'Farm gear bosses and story hard stages starting from Season 3, 5-10. Prioritize farming armor, as weapons and accessories involve heavy RNG.',
      m2: "Craft armor at Kate's shop during crafting discount weeks (1 week/month). Use Potentium (Armor) to select your desired armor set. Avoid crafting weapons/accessories due to RNG.",
      m3: 'Use Precise Craft for weapons/accessories. This uses Effectium and allows sub-stat rerolling, helping you save Transistone (Individual).',
      m4: 'Farm Irregular Bosses. Queen and Wyvre drop one gear set, while the other two bosses drop a different set. Check drop tables to farm the right bosses for your build.'
    },
    dropBoost: {
      q: 'How can I increase gear drop rates?',
      a: 'Use Monad Gate titles that increase drop rates from Special Request stages. Some titles, like Worldline Explorer, can boost drop rates by up to 30%, helping reduce RNG frustration.'
    },
    limitedShop: {
      q: 'Are limited-time shops worth it?',
      a: 'Yes. A few times a year, limited shops offer legendary gear with 3×4 substats (or better) purchasable with Ether. These are excellent deals and should be prioritized.'
    },
    eventChests: {
      q: 'What about gear selection chests from events?',
      a: 'They often include weapon, accessory, and armor chests. Check if the main stat is fixed or random. Sub-stats are usually random unless stated otherwise.'
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
          {t.overviewText} <strong className="text-red-400">{t.gearTypes.weapon}</strong>, <strong className="text-purple-400">{t.gearTypes.accessory}</strong>, and <strong className="text-blue-400">{t.gearTypes.armor}</strong>{t.gearTypesEnd}
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
          <BreakthroughExamplesGrid />
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
            {t.methods.craftArmor.desc.split('Potentium (Armor)')[0]}
            <ItemInlineDisplay names="Potentium (Armor)" />
            {t.methods.craftArmor.desc.split('Potentium (Armor)')[1]}
          </p>
          <p className="text-amber-300 text-sm mt-2">{t.methods.craftArmor.warning}</p>
        </>
      )
    },
    preciseCraft: {
      title: t.methods.preciseCraft.title,
      content: (
        <p>
          {t.methods.preciseCraft.desc.split('Effectium')[0]}
          <ItemInlineDisplay names="Effectium" />
          {t.methods.preciseCraft.desc.split('Effectium')[1].split('Transistone (Individual)')[0]}
          <ItemInlineDisplay names="Transistone (Individual)" />
          {t.methods.preciseCraft.desc.split('Transistone (Individual)')[1]}
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
          {t.dropRateText.split('Worldline Explorer')[0]}
          <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
          {t.dropRateText.split('Worldline Explorer')[1]}
        </p>
      </div>

      <GuideHeading level={3}>{t.shopsTitle}</GuideHeading>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">{t.limitedShopsTitle}</h4>
          <p className="text-neutral-300 text-sm">
            {t.limitedShopsText.split('Ether')[0]}
            <ItemInlineDisplay names="Ether" />
            {t.limitedShopsText.split('Ether').slice(1).join('Ether')}
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
                  {t.badSubstats.a.split('Transistone (Total)')[0]}
                  <ItemInlineDisplay names="Transistone (Total)" />
                  {t.badSubstats.a.split('Transistone (Total)')[1].split('Transistone (Individual)')[0]}
                  <ItemInlineDisplay names="Transistone (Individual)" />
                  {t.badSubstats.a.split('Transistone (Individual)')[1]}
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
                    <li><strong>{t.howToGet.m1.split(' starting')[0]}</strong>{' starting' + t.howToGet.m1.split(' starting')[1]}</li>
                    <li>
                      <strong>{t.howToGet.m2.split(' during')[0]}</strong>
                      {' during' + t.howToGet.m2.split(' during')[1].split('Potentium (Armor)')[0]}
                      <ItemInlineDisplay names="Potentium (Armor)" />
                      {t.howToGet.m2.split('Potentium (Armor)')[1]}
                    </li>
                    <li>
                      <strong>{t.howToGet.m3.split(' for')[0]}</strong>
                      {' for' + t.howToGet.m3.split(' for')[1].split('Effectium')[0]}
                      <ItemInlineDisplay names="Effectium" />
                      {t.howToGet.m3.split('Effectium')[1].split('Transistone (Individual)')[0]}
                      <ItemInlineDisplay names="Transistone (Individual)" />
                      {t.howToGet.m3.split('Transistone (Individual)')[1]}
                    </li>
                    <li><strong>{t.howToGet.m4.split('. Queen')[0]}</strong>{'. Queen' + t.howToGet.m4.split('. Queen')[1]}</li>
                  </ol>
                </>
              ),
            },
            {
              key: 'drop-boost-titles',
              title: t.dropBoost.q,
              content: (
                <p>
                  {t.dropBoost.a.split('Worldline Explorer')[0]}
                  <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
                  {t.dropBoost.a.split('Worldline Explorer')[1]}
                </p>
              ),
            },
            {
              key: 'limited-shop-worth',
              title: t.limitedShop.q,
              content: (
                <p>
                  {t.limitedShop.a.split('Ether')[0]}
                  <ItemInlineDisplay names="Ether" />
                  {t.limitedShop.a.split('Ether').slice(1).join('Ether')}
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

'use client'

import EquipmentCardInline from '@/app/components/EquipmentCard'
import StatInlineTag from '@/app/components/StatInlineTag'
import SubstatBar from '@/app/components/SubstatBar'
import SubstatBarWithValue from '@/app/components/SubstatBarWithValue'
import ItemInlineDisplay from '@/app/components/ItemInline'
import GuideIconInline from '@/app/components/GuideIconInline'

// Data imports for breakthrough examples
import weaponsData from '@/data/weapon.json'
import setsData from '@/data/sets.json'
import type { TenantKey } from '@/tenants/config'

// ============================================================================
// TYPES
// ============================================================================

export type TabKey = 'basics' | 'upgrading' | 'obtaining' | 'faq'

export type GearRarity = 'normal' | 'superior' | 'epic' | 'legendary'

export type EnhancementExample = {
  rarity: GearRarity
  star: number
  atkBase: number
  atkMax: number
}

export type GearPriority = {
  rank: number
  slot: string
  color: string
  bgColor: string
}

export type EquipmentClass = 'ranger' | 'striker' | 'healer' | 'defender' | 'mage' | null

// ============================================================================
// CONSTANTS - MATERIALS
// ============================================================================

export const HAMMER_ITEMS = [
  "Apprentice's Hammer",
  "Expert's Hammer",
  "Master's Hammer",
  "Artisan's Hammer"
] as const

export const CATALYST_ITEMS = [
  "Normal Reforge Catalyst",
  "Superior Reforge Catalyst",
  "Epic Reforge Catalyst",
  "Legendary Reforge Catalyst"
] as const

export const GLUNITE_ITEMS = [
  "Glunite",
  "Refined Glunite",
  "Event Glunite",
  "Armor Glunite"
] as const

// ============================================================================
// CONSTANTS - ENHANCEMENT EXAMPLES
// ============================================================================

export const ENHANCEMENT_EXAMPLES: EnhancementExample[] = [
  { rarity: 'normal', star: 1, atkBase: 18, atkMax: 90 },
  { rarity: 'epic', star: 2, atkBase: 54, atkMax: 270 },
  { rarity: 'legendary', star: 1, atkBase: 30, atkMax: 150 }
]

// ============================================================================
// CONSTANTS - GEAR PRIORITY
// ============================================================================

export type GearPrioritySlotKey = 'weapons' | 'accessories' | 'gloves' | 'otherArmor'

export const GEAR_PRIORITY: (Omit<GearPriority, 'slot'> & { slotKey: GearPrioritySlotKey })[] = [
  { rank: 1, slotKey: 'weapons', color: 'red', bgColor: 'red-900/20' },
  { rank: 2, slotKey: 'accessories', color: 'purple', bgColor: 'purple-900/20' },
  { rank: 3, slotKey: 'gloves', color: 'amber', bgColor: 'amber-900/20' },
  { rank: 4, slotKey: 'otherArmor', color: 'blue', bgColor: 'blue-900/20' }
]

// ============================================================================
// CONSTANTS - PERFECT SUBSTATS EXAMPLE
// ============================================================================

export const PERFECT_SUBSTATS = ['ATK%', 'CHC', 'CHD', 'SPD'] as const

// ============================================================================
// COMPONENTS - MATERIALS DISPLAY
// ============================================================================

type MaterialsDisplayProps = {
  label: string
}

export function HammerMaterials({ label }: MaterialsDisplayProps) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <span className="text-neutral-400">{label}</span>
      {HAMMER_ITEMS.map(item => (
        <ItemInlineDisplay key={item} names={item} text={false} />
      ))}
    </div>
  )
}

export function CatalystMaterials({ label }: MaterialsDisplayProps) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <span className="text-neutral-400">{label}</span>
      {CATALYST_ITEMS.map(item => (
        <ItemInlineDisplay key={item} names={item} text={false} />
      ))}
    </div>
  )
}

export function GluniteMaterials({ label }: MaterialsDisplayProps) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <span className="text-neutral-400">{label}</span>
      {GLUNITE_ITEMS.map(item => (
        <ItemInlineDisplay key={item} names={item} text={false} />
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTS - SUBSTAT DISPLAY
// ============================================================================

type SubstatColorLegendProps = {
  labels: {
    gray: string
    yellow: string
    orange: string
  }
}

export function SubstatColorLegend({ labels }: SubstatColorLegendProps) {
  return (
    <div className="mt-4">
      <SubstatBar yellow={2} orange={3} />
      <ul className="list-disc list-inside mt-3 space-y-1">
        <li><span className="text-neutral-400">{labels.gray.split('—')[0].trim()}</span> — {labels.gray.split('—')[1]?.trim()}</li>
        <li><span className="text-yellow-400">{labels.yellow.split('—')[0].trim()}</span> — {labels.yellow.split('—')[1]?.trim()}</li>
        <li><span className="text-orange-400">{labels.orange.split('—')[0].trim()}</span> — {labels.orange.split('—')[1]?.trim()}</li>
      </ul>
    </div>
  )
}

export function PerfectSubstatsExample() {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 inline-block">
      <ul className="space-y-2">
        {PERFECT_SUBSTATS.map(stat => (
          <li key={stat}><SubstatBarWithValue stat={stat} yellow={3} orange={0} /></li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================================
// COMPONENTS - ENHANCEMENT COMPARISON
// ============================================================================

type EnhancementColumnProps = {
  example: EnhancementExample
  labelText: string
  labelColor: string
}

function EnhancementColumn({ example, labelText, labelColor }: EnhancementColumnProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-[160px]">
      <p className={`${labelColor} text-sm`}>{labelText}</p>
      <div className="flex flex-col items-center">
        <EquipmentCardInline
          data={{
            type: 'Weapon',
            rarity: example.rarity,
            star: example.star,
            reforge: 0,
            tier: null,
            level: null,
            class: null,
            effect: null,
          }}
        />
        <div className="mt-1 flex items-center gap-1 text-sm">
          <StatInlineTag name="ATK" color="text-white" /> {example.atkBase}
        </div>
      </div>
      <span className="text-neutral-500">↓</span>
      <div className="flex flex-col items-center">
        <EquipmentCardInline
          data={{
            type: 'Weapon',
            rarity: example.rarity,
            star: example.star,
            reforge: 0,
            tier: null,
            level: 10,
            class: null,
            effect: null,
          }}
        />
        <div className="mt-1 flex items-center gap-1 text-sm">
          <StatInlineTag name="ATK" color="text-white" /> {example.atkMax}
        </div>
      </div>
    </div>
  )
}

type EnhancementComparisonGridProps = {
  labels: { normal: string; epic: string; legendary: string }
}

export function EnhancementComparisonGrid({ labels }: EnhancementComparisonGridProps) {
  const labelConfigs = [
    { key: 'normal', color: 'text-neutral-400' },
    { key: 'epic', color: 'text-blue-400' },
    { key: 'legendary', color: 'text-red-400' }
  ] as const

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {ENHANCEMENT_EXAMPLES.map((example, idx) => (
        <EnhancementColumn
          key={example.rarity}
          example={example}
          labelText={labels[labelConfigs[idx].key]}
          labelColor={labelConfigs[idx].color}
        />
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTS - BREAKTHROUGH EXAMPLES (using official data from JSON)
// ============================================================================

// Helper to get localized field
function getLocalizedField<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang: TenantKey
): string | null {
  if (lang === 'en') return obj[field] as string | null
  const localizedKey = `${field}_${lang}`
  return (obj[localizedKey] as string | null) ?? (obj[field] as string | null)
}

// Helper to highlight differences between T1 and T4 effect texts
// Returns JSX with changed parts highlighted in green
function highlightDifferences(t1Text: string | null, t4Text: string | null): React.ReactNode {
  if (!t4Text) return null
  if (!t1Text) return <span className="text-green-400">{t4Text}</span>

  // Find numbers/percentages in both texts
  const numberPattern = /(\d+(?:\.\d+)?%?)/g
  const t1Numbers = t1Text.match(numberPattern) || []
  const t4Numbers = t4Text.match(numberPattern) || []

  // If no numbers or same numbers, just return t4 text
  if (t4Numbers.length === 0 || JSON.stringify(t1Numbers) === JSON.stringify(t4Numbers)) {
    return <span className="text-neutral-400">{t4Text}</span>
  }

  // Replace changed numbers with highlighted versions
  const result: React.ReactNode[] = []
  let lastIndex = 0
  let t1Index = 0
  let match: RegExpExecArray | null

  const regex = /(\d+(?:\.\d+)?%?)/g
  while ((match = regex.exec(t4Text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(
        <span key={`text-${lastIndex}`} className="text-neutral-400">
          {t4Text.slice(lastIndex, match.index)}
        </span>
      )
    }

    // Check if this number changed from T1
    const t4Num = match[1]
    const t1Num = t1Numbers[t1Index]
    const isChanged = t1Num !== t4Num

    result.push(
      <span key={`num-${match.index}`} className={isChanged ? "text-green-400 font-medium" : "text-neutral-400"}>
        {t4Num}
      </span>
    )

    lastIndex = regex.lastIndex
    t1Index++
  }

  // Add remaining text
  if (lastIndex < t4Text.length) {
    result.push(
      <span key={`text-end`} className="text-neutral-400">
        {t4Text.slice(lastIndex)}
      </span>
    )
  }

  return <>{result}</>
}

// Get weapon data by name
function getWeaponByName(name: string) {
  return weaponsData.find(w => w.name === name)
}

// Get set data by name
function getSetByName(name: string) {
  return setsData.find(s => s.name === name)
}

type BreakthroughExamplesGridProps = {
  lang?: TenantKey
}

export function BreakthroughExamplesGrid({ lang = 'en' }: BreakthroughExamplesGridProps) {
  // Get official data
  const surefireGreatsword = getWeaponByName('Surefire Greatsword')
  const immunitySet = getSetByName('Immunity Set')
  const penetrationSet = getSetByName('Penetration Set')

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {/* Weapon Example: Surefire Greatsword */}
      {surefireGreatsword && (
        <div className="flex flex-col items-center gap-4 min-w-[200px]">
          <p className="text-amber-400 font-medium">
            {getLocalizedField(surefireGreatsword, 'name', lang)}
          </p>
          <div className="flex flex-col items-center">
            <EquipmentCardInline data={{
              type: 'Weapon',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: null,
              level: null,
              class: (surefireGreatsword.class?.toLowerCase() ?? null) as EquipmentClass,
              effect: 11
            }} />
            <div className="mt-2 text-center text-sm">
              <div className="flex items-center justify-center gap-1">
                <StatInlineTag name="ATK" color='text-white' /> 200
              </div>
              <p className="text-neutral-400 mt-1 max-w-[180px]">
                {getLocalizedField(surefireGreatsword, 'effect_desc1', lang)}
              </p>
            </div>
          </div>
          <span className="text-neutral-500">↓ T4</span>
          <div className="flex flex-col items-center">
            <EquipmentCardInline data={{
              type: 'Weapon',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: 4,
              level: null,
              class: (surefireGreatsword.class?.toLowerCase() ?? null) as EquipmentClass,
              effect: 11
            }} />
            <div className="mt-2 text-center text-sm">
              <div className="flex items-center justify-center gap-1">
                <StatInlineTag name="ATK" color='text-white' /> <span className="text-green-400">240</span>
              </div>
              <p className="mt-1 max-w-[180px]">
                {highlightDifferences(
                  getLocalizedField(surefireGreatsword, 'effect_desc1', lang),
                  getLocalizedField(surefireGreatsword, 'effect_desc4', lang)
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Set Example: Immunity Set */}
      {immunitySet && (
        <div className="flex flex-col items-center gap-4 min-w-[200px]">
          <p className="text-amber-400 font-medium">
            {getLocalizedField(immunitySet, 'name', lang)}
          </p>
          <div className="flex flex-col items-center">
            <EquipmentCardInline data={{
              type: 'Armor',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: null,
              level: null,
              class: null,
              effect: 19
            }} />
            <div className="mt-2 text-center text-sm">
              <div className="flex items-center justify-center gap-1">
                <StatInlineTag name="DEF" color='text-white' /> 100
              </div>
              <p className="text-neutral-400 mt-1 max-w-[180px]">
                2p: {getLocalizedField(immunitySet, 'effect_2_1', lang)}
              </p>
            </div>
          </div>
          <span className="text-neutral-500">↓ T4</span>
          <div className="flex flex-col items-center">
            <EquipmentCardInline data={{
              type: 'Armor',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: 4,
              level: null,
              class: null,
              effect: 19
            }} />
            <div className="mt-2 text-center text-sm">
              <div className="flex items-center justify-center gap-1">
                <StatInlineTag name="DEF" color='text-white' /> <span className="text-green-400 font-medium">120</span>
              </div>
              <p className="mt-1 max-w-[180px]">
                <span className="text-neutral-400">2p: </span>
                {highlightDifferences(
                  getLocalizedField(immunitySet, 'effect_2_1', lang),
                  getLocalizedField(immunitySet, 'effect_2_4', lang)
                )}
              </p>
              <p className="text-green-400 max-w-[180px]">
                4p: {getLocalizedField(immunitySet, 'effect_4_4', lang)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Set Example: Penetration Set */}
      {penetrationSet && (
        <div className="flex flex-col items-center gap-4 min-w-[200px]">
          <p className="text-amber-400 font-medium">
            {getLocalizedField(penetrationSet, 'name', lang)}
          </p>
          <div className="flex flex-col items-center">
            <EquipmentCardInline data={{
              type: 'Armor',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: null,
              level: null,
              class: null,
              effect: 11
            }} />
            <div className="mt-2 text-center text-sm">
              <div className="flex items-center justify-center gap-1">
                <StatInlineTag name="DEF" color='text-white' /> 100
              </div>
              <p className="text-neutral-400 mt-1 max-w-[180px]">
                4p: {getLocalizedField(penetrationSet, 'effect_4_1', lang)}
              </p>
            </div>
          </div>
          <span className="text-neutral-500">↓ T4</span>
          <div className="flex flex-col items-center">
            <EquipmentCardInline data={{
              type: 'Armor',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: 4,
              level: null,
              class: null,
              effect: 11
            }} />
            <div className="mt-2 text-center text-sm">
              <div className="flex items-center justify-center gap-1">
                <StatInlineTag name="DEF" color='text-white' /> <span className="text-green-400 font-medium">120</span>
              </div>
              <p className="text-green-400 mt-1 max-w-[180px]">
                2p: {getLocalizedField(penetrationSet, 'effect_2_4', lang)}
              </p>
              <p className="mt-1 max-w-[180px]">
                <span className="text-neutral-400">4p: </span>
                {highlightDifferences(
                  getLocalizedField(penetrationSet, 'effect_4_1', lang),
                  getLocalizedField(penetrationSet, 'effect_4_4', lang)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTS - GEAR PRIORITY LIST
// ============================================================================

type GearPriorityListProps = {
  slots: Record<GearPrioritySlotKey, string>
  descriptions: Record<GearPrioritySlotKey, string>
}

export function GearPriorityList({ slots, descriptions }: GearPriorityListProps) {
  return (
    <div className="space-y-3">
      {GEAR_PRIORITY.map(({ rank, slotKey, color }) => (
        <div key={slotKey} className={`flex items-center gap-3 p-3 bg-${color}-900/20 rounded-lg`}>
          <span className={`text-2xl font-bold text-${color}-400`}>{rank}</span>
          <div>
            <p className={`font-semibold text-${color}-300`}>{slots[slotKey]}</p>
            <p className="text-sm text-neutral-400">{descriptions[slotKey]}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTS - UPGRADE METHODS GRID
// ============================================================================

type UpgradeMethod = {
  key: string
  color: string
}

const UPGRADE_METHODS: UpgradeMethod[] = [
  { key: 'enhance', color: 'green' },
  { key: 'reforge', color: 'purple' },
  { key: 'breakthrough', color: 'amber' },
  { key: 'changeStats', color: 'cyan' }
]

type UpgradeMethodsGridProps = {
  labels: Record<string, { title: string; desc: string }>
}

export function UpgradeMethodsGrid({ labels }: UpgradeMethodsGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-8">
      {UPGRADE_METHODS.map(({ key, color }) => (
        <div key={key} className={`p-4 bg-gradient-to-br from-${color}-900/20 to-${color}-900/10 border border-${color}-500/30 rounded-lg`}>
          <p className={`font-semibold text-${color}-400`}>{labels[key].title}</p>
          <p className="text-sm text-neutral-400">{labels[key].desc}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTS - SECTION HEADER WITH NUMBER
// ============================================================================

type SectionHeaderProps = {
  number: number
  title: string
  color: string
}

export function SectionHeader({ number, title, color }: SectionHeaderProps) {
  return (
    <h3 className={`text-xl font-bold text-${color}-400 flex items-center gap-2`}>
      <span className={`w-8 h-8 bg-${color}-500/20 rounded-full flex items-center justify-center text-sm`}>
        {number}
      </span>
      {title}
    </h3>
  )
}

// ============================================================================
// COMPONENTS - CHANGE STATS MODES
// ============================================================================

type ChangeStatMode = {
  key: string
  item: string
}

const CHANGE_STAT_MODES: ChangeStatMode[] = [
  { key: 'changeAll', item: 'Transistone (Total)' },
  { key: 'selectChange', item: 'Transistone (Individual)' }
]

type ChangeStatsModesGridProps = {
  labels: Record<string, { title: string; desc: string }>
}

export function ChangeStatsModesGrid({ labels }: ChangeStatsModesGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      {CHANGE_STAT_MODES.map(({ key, item }) => (
        <div key={key} className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
          <p className="font-semibold text-cyan-300 mb-2">{labels[key].title}</p>
          <p className="text-sm text-neutral-300">{labels[key].desc}</p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="text-neutral-400">Cost:</span>
            <ItemInlineDisplay names={item} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTS - OBTAINING GEAR METHODS
// ============================================================================

type ObtainingMethod = {
  key: string
  color: string
}

const OBTAINING_METHODS: ObtainingMethod[] = [
  { key: 'farmBosses', color: 'green' },
  { key: 'craftArmor', color: 'blue' },
  { key: 'preciseCraft', color: 'purple' },
  { key: 'irregularBosses', color: 'amber' }
]

type ObtainingMethodsListProps = {
  content: Record<string, { title: string; content: React.ReactNode }>
}

export function ObtainingMethodsList({ content }: ObtainingMethodsListProps) {
  return (
    <div className="space-y-6">
      {OBTAINING_METHODS.map(({ key, color }, idx) => (
        <div key={key} className={`border-l-4 border-${color}-500 pl-4`}>
          <h4 className={`text-lg font-semibold text-${color}-400`}>
            {idx + 1}. {content[key].title}
          </h4>
          <div className="text-neutral-300 mt-2">
            {content[key].content}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTS - DROP RATE INFO
// ============================================================================

type DropRateInfoProps = {
  text: React.ReactNode
}

export function DropRateInfo({ text }: DropRateInfoProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6">
      <p>
        {text}
        <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" />
      </p>
    </div>
  )
}

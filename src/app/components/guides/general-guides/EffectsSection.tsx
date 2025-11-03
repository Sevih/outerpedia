'use client'

import Image from 'next/image'
import GuideHeading from '@/app/components/GuideHeading'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import buffscollection from '@/data/buffs.json'
import debuffscollection from '@/data/debuffs.json'

// ============================================================================
// CONFIGURATION
// ============================================================================

// Buffs without official in-game icons
const CUSTOM_ICON_BUFFS = new Set<string>([
'BT_EXTEND_BUFF',
'BT_EXTEND_DEBUFF',
'BT_REMOVE_DEBUFF',
'BT_RESURRECTION',
'BT_ADDITIVE_ATTACK_ON_EVENT',
'BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK',
'BT_CALL_BACKUP_2',
'BT_CALL_BACKUP',
'BT_ADDITIVE_TURN',
'HEAVY_STRIKE',
'BT_ACTION_GAUGE',
'SYS_BUFF_REVENGE',
'BT_SEAL_COUNTER'
])

// Debuffs without official in-game icons
const CUSTOM_ICON_DEBUFFS = new Set<string>([
'BT_ACTION_GAUGE',
'BT_IMMEDIATELY_BURN',
'BT_STATBUFF_CONVERT_TO_STATDEBUFF',
'BT_SEALED_RESURRECTION',
'BT_EXTEND_DEBUFF',
'BT_EXTEND_BUFF',
'BT_STEAL_BUFF',
'BT_RESOURCE_DOWN',
'BT_WG_REVERSE_HEAL'
])

// Buffs to exclude from the list (irremovable unique mechanics & unused)
const IGNORED_BUFFS = new Set<string>([
    // Unused buffs
    'BT_DAMGE_TAKEN',
    'BT_IMMUNE_IR',
    'BT_INVINCIBLE_IR',
    'BT_STAT|ST_ATK_IR',
    'BT_STAT|ST_AVOID_IR',
    'BT_STAT|ST_BUFF_CHANCE_IR',
    'BT_STAT|ST_CRITICAL_RATE_IR',
    'BT_STAT|ST_DEF_IR',
    'BT_STAT|ST_SPEED_IR',
    'BT_SYS_BUFF_ENHANCE_IR',

    // Manual insert
    'BT_SHIELD_BASED_TARGET',
    'BT_EXTRA_ATTACK_ON_TURN_END',
    'BT_RUN_PASSIVE_SKILL_ON_TURN_END_TEAM',
    'BT_RUN_PASSIVE_SKILL_ON_TURN_END_TEAM_IGNORE_SEAL_ADDITIVE',
    'BT_COOL3_CHARGE',
    'BT_COOL2_CHARGE',
    'BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER',
    'BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER'
])

// Buff groups to exclude from the list
const IGNORED_BUFF_GROUPS = new Set<string>([

])

// Buff categories to exclude from the list
const IGNORED_BUFF_CATEGORIES = new Set<string>([
    'hidden', 'unique'
])

// Debuffs to exclude from the list (irremovable unique mechanics & unused)
const IGNORED_DEBUFFS = new Set<string>([
    // Unused debuffs
    'BT_AGGRO_IR',
    'BT_DOT_POISON_IR',
    'BT_FIXED_DAMAGE',
    'BT_FREEZE_IR',
    'BT_RANDOM',
    'BT_SEAL_ADDITIVE_ATTACK_IR',
    'BT_SEAL_BT_CALL_BACKUP_IR',
    'BT_SEAL_ADDITIVE_TURN_IR',
    'BT_SILENCE_IR',
    'BT_STAT|ST_ATK_IR',
    'BT_STAT|ST_CRITICAL_RATE_IR',
    'BT_STAT|ST_DEF_IR',
    'BT_STONE_IR',
    'BT_STUN_IR',
    'BT_SYS_DEBUFF_ENHANCE_IR',

    // Manual insert
    'BT_COOL3_CHARGE',
    'BT_IMMEDIATELY_CURSE',
    'BT_IMMEDIATELY_BLEED',
    'BT_IMMEDIATELY_2000092',

])

// Debuff groups to exclude from the list
const IGNORED_DEBUFF_GROUPS = new Set<string>([

])

// Debuff categories to exclude from the list
const IGNORED_DEBUFF_CATEGORIES = new Set<string>([
    'hidden', 'unique'
])

// ============================================================================
// EFFECT TABLE COMPONENT
// ============================================================================

interface EffectTableProps {
    effects: typeof buffscollection
    customIconSet: Set<string>
    type: 'buff' | 'debuff'
}

function EffectTable({ effects, customIconSet, type }: EffectTableProps) {
    const { key: lang } = useTenant()
    const { t } = useI18n()

    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full table-auto border-separate border-spacing-y-2 text-sm">
                <thead>
                    <tr className="text-left bg-white/5">
                        <th className="p-2 rounded-l">{t('effects.table.icon')}</th>
                        <th className="p-2">{t('effects.table.name')}</th>
                        <th className="p-2 rounded-r">{t('effects.table.description')}</th>
                    </tr>
                </thead>
                <tbody>
                    {effects.map((effect) => {
                        const iconPath = `/images/ui/effect/${effect.icon}.png`

                        // Localisation
                        const localizedLabel = l(effect, 'label', lang)
                        const localizedDescription = l(effect, 'description', lang)

                        const isRemovable = !localizedDescription.toLowerCase().includes('cannot be removed')
                        const imageClass = isRemovable ? type : ''

                        // Convertir les \n en sauts de ligne
                        const descriptionLines = localizedDescription.split('\\n')

                        return (
                            <tr key={effect.name} className="bg-white/5 hover:bg-white/10 rounded-lg">
                                <td className="p-2 rounded-l">
                                    <Image
                                        src={iconPath}
                                        alt={localizedLabel}
                                        width={32}
                                        height={32}
                                        className={`w-8 h-8 object-contain ${imageClass}`}
                                    />
                                </td>                                
                                <td className="p-2 font-medium">
                                    <span className={customIconSet.has(effect.name) ? 'text-orange-400 italic' : ''}>
                                        {localizedLabel}
                                    </span>
                                </td>
                                <td className="p-2 text-neutral-300 rounded-r">
                                    {descriptionLines.map((line, index) => (
                                        <span key={index}>
                                            {line}
                                            {index < descriptionLines.length - 1 && <br />}
                                        </span>
                                    ))}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

// ============================================================================
// BUFFS SECTION COMPONENT
// ============================================================================

export function BuffsSection() {
    const { t } = useI18n()

    const filteredBuffs = buffscollection
        .filter(buff => {
            if (buff.name.startsWith('UNIQUE')) return false
            if (IGNORED_BUFFS.has(buff.name)) return false
            if ('group' in buff && buff.group && IGNORED_BUFF_GROUPS.has(buff.group)) return false
            if ('category' in buff && buff.category && IGNORED_BUFF_CATEGORIES.has(buff.category)) return false
            return true
        })
        .sort((a, b) => {
            // Trier par catégorie d'abord
            const categoryA = 'category' in a ? a.category || '' : ''
            const categoryB = 'category' in b ? b.category || '' : ''
            const categoryCompare = categoryA.localeCompare(categoryB)
            if (categoryCompare !== 0) return categoryCompare
            // Puis par label
            return a.label.localeCompare(b.label)
        })

    return (
        <div className="space-y-8">
            <section className="space-y-6">
                <GuideHeading level={2}>Buffs</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>{t('effects.buffs.intro')}</p>
                    <p className="text-orange-400 italic">
                        {t('effects.buffs.customIcon')}
                    </p>
                    <p>{t('effects.buffs.listIntro')}</p>
                </div>

                <EffectTable
                    effects={filteredBuffs}
                    customIconSet={CUSTOM_ICON_BUFFS}
                    type="buff"
                />
            </section>
        </div>
    )
}

// ============================================================================
// DEBUFFS SECTION COMPONENT
// ============================================================================

export function DebuffsSection() {
    const { t } = useI18n()

    // Ordre de tri personnalisé pour les catégories de debuffs
    const debuffCategoryOrder: Record<string, number> = {
        'statReduction': 0,
        'cc': 1,
        'dot': 2,
        'util': 3
    }

    const filteredDebuffs = debuffscollection
        .filter(debuff => {
            if (debuff.name.startsWith('UNIQUE')) return false
            if (IGNORED_DEBUFFS.has(debuff.name)) return false
            if ('group' in debuff && debuff.group && IGNORED_DEBUFF_GROUPS.has(debuff.group)) return false
            if ('category' in debuff && debuff.category && IGNORED_DEBUFF_CATEGORIES.has(debuff.category)) return false
            return true
        })
        .sort((a, b) => {
            // Trier par catégorie d'abord selon l'ordre personnalisé
            const categoryA = 'category' in a ? a.category || '' : ''
            const categoryB = 'category' in b ? b.category || '' : ''
            const orderA = debuffCategoryOrder[categoryA] ?? 999
            const orderB = debuffCategoryOrder[categoryB] ?? 999
            if (orderA !== orderB) return orderA - orderB
            // Puis par label
            return a.label.localeCompare(b.label)
        })

    return (
        <div className="space-y-8">
            <section className="space-y-6">
                <GuideHeading level={2}>Debuffs</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>{t('effects.debuffs.intro')}</p>
                    <p className="text-orange-400 italic">
                        {t('effects.debuffs.customIcon')}
                    </p>
                    <p>{t('effects.debuffs.listIntro')}</p>
                </div>

                <EffectTable
                    effects={filteredDebuffs}
                    customIconSet={CUSTOM_ICON_DEBUFFS}
                    type="debuff"
                />
            </section>
        </div>
    )
}

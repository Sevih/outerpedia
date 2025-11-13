'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function DrakhanGuide() {
    return (
        <GuideTemplate
            title="Drakhan Strategy Guide"
            introduction="Demiurge Drakhan is an extremely powerful boss who deals percentage-based fixed damage and can instantly kill low-health targets. During enrage, she becomes immune to weakness gauge damage and upgrades her execute skill to AoE."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Drakhan'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500182'
                                labelFilter={"Conqueror and Destroyer"}
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Demiurge Vlada moveset</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /> by 1 turn.</li>
                                <li><strong>S2</strong>: AoE, used if an ally uses an AoE skill. Deals 30% of target HP as <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /></li>
                                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                                <li><strong>Passive</strong>: Reduces enemies speed by 5% each turn (Max 20 stacks).</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Use characters with strong AoE healing skills.</li>
                                <li>Take out Demiurge Vlada quickly so the speed debuff doesn&apos;t stack too high.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Mene" /> <CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Monad Eva" /> <CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Dianne" />: for healing</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}

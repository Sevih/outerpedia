'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function FatalGuide() {
    return (
        <GuideTemplate
            title="Fatal Strategy Guide"
            introduction="Fatal is a deadly assassin boss who becomes nearly invincible while stealthed, dealing massive damage and resurrecting allies. She silences Fire heroes and extends all ally buffs after each action."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Fatal'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500266'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Sand Soldier Khopesh (foes) moveset</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><strong>S1</strong>: Single, grants <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> 1 turn to the caster.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Avoid using <ElementInlineTag element='fire' /> heroes.</li>
                                <li>Bring a speedy hero to apply <EffectInlineTag name="BT_SEALED" type="debuff" /> on foes before Fatal moves (around 270 speed).</li>
                                <li>Bring a hero with either <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> or <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> to remove <EffectInlineTag name="BT_STEALTHED" type="buff" />.</li>
                                <li><CharacterLinkCard name="Caren" /> is the MPV here since her S2 will still target Fatal while <EffectInlineTag name="BT_STEALTHED" type="buff" /></li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Kappa" /><CharacterLinkCard name="Regina" /> : for <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
                                <li><CharacterLinkCard name="Dahlia" /><CharacterLinkCard name="Demiurge Vlada" /><CharacterLinkCard name="Veronica" /><CharacterLinkCard name="Alice" /><CharacterLinkCard name="Gnosis Nella" /> : for AoE <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
                                <li><CharacterLinkCard name="Akari" /><CharacterLinkCard name="Alice" /><CharacterLinkCard name="Gnosis Nella" /> : for <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                                <li><CharacterLinkCard name="Caren" /><CharacterLinkCard name="Stella" /> : for <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}

'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function AncientFoeGuide() {
    return (
        <GuideTemplate
            title="Ancient Foe Strategy Guide"
            introduction="Ancient Foe is a dangerous boss that inflicts curse debuffs and can freeze targets below 70% HP while ignoring immunity. It gains powerful buffs during enrage phases every 10 enemy actions and applies irremovable curse interruption effects."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Frozen Dragon of Phantasm Harshna'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4286026'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Bring <EffectInlineTag name="BT_SEALED" type="debuff" /> to prevent the boss getting <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" />.</li>
                                <li>Bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> to deal with <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FREEZE" type="debuff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Demiurge Delta" /> <CharacterLinkCard name="Saeran" />: for <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />.</li>
                                <li><CharacterLinkCard name="Akari" /> <CharacterLinkCard name="Luna" /> <CharacterLinkCard name="Gnosis Nella" /> <CharacterLinkCard name="Alice" /> : for <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}

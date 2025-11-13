'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function AsteiDemiurgeGuide() {
    return (
        <GuideTemplate
            title="Astei (Demiurge) Strategy Guide"
            introduction="Demiurge Astei is a powerful boss that chains critical buffs to inflict petrification on all enemies, then upgrades it to ignore immunity. Only takes weakness damage while enraged, and her enrage ultimate deals lethal damage."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500047'
                                labelFilter={["Snapped Back to Reality", "Doll Garden's Caretaker"]}
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Use 2 characters to handle <EffectInlineTag name="BT_STONE" type="debuff" /> mechanics with <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> and <EffectInlineTag name="BT_IMMUNE" type="buff" /> .</li>
                                <li>If damage is a problem, try to bring a character that can prevent boss from taking buff <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Tio" /> <CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Faenan" /> <CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Monad Eva" />: choose any 2 for <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                                <li><CharacterLinkCard name="Akari" /> : <EffectInlineTag name="BT_SEALED" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /></li>
                                <li><CharacterLinkCard name="Edelweiss" /> <CharacterLinkCard name="Luna" /> : <EffectInlineTag name="BT_SEALED" type="debuff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                                <li><CharacterLinkCard name="Veronica" /> <CharacterLinkCard name="Luna" /> : <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                                <li><CharacterLinkCard name="Stella" /> <CharacterLinkCard name="Demiurge Stella" /> : can&apos;t be <EffectInlineTag name="BT_STONE" type="debuff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}

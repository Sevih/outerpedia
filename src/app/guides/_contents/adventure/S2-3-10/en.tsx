'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="Sacreed Guardian Strategy Guide"
            introduction="Sacreed Guardian is a deadly boss that executes the highest-attack hero with its S3 and enrages every 5 turns. The boss only takes weakness damage while enraged, making timing and crowd control crucial."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144003'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Sacreed Guardian moveset</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><strong>S1</strong>: Single, inflict <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> 2 turns.</li>
                                <li><strong>S2</strong>: AoE, inflict <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> 2 turns.</li>
                                <li><strong>S3</strong>: AoE, inflict <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and kill the hero with the highest attack.</li>
                                <li><strong>Passive</strong>: Recovers 5 weakness gauge when killing an enemy. Takes weakness damage only if enrage</li>
                                <li><strong>Enrage</strong>: every 5 turns. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />. Recovers weakness gauge by 10% when enraging.</li>
                                <li><strong>Enrage Ultimate</strong>: used when enrage ends. AoE, inflict <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> 2 turns and reset S3 cooldown.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>The boss has no immunities so bring hard CC like <EffectInlineTag name="BT_STUN" type="debuff" /> <EffectInlineTag name="BT_FREEZE" type="debuff" /> <EffectInlineTag name="BT_STONE" type="debuff" /> <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /> <EffectInlineTag name="BT_SILENCE" type="debuff" />.</li>
                                <li>Bringing <EffectInlineTag name="BT_RESURRECTION" type="buff" /> can help too.</li>
                                <li><EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> can prevent the boss taking too many turns and enraging.</li>
                                <li>Save chains until the boss enrages.</li>
                                <li>You can try to burn it down with <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> chain attack.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Mene" />, <CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_RESURRECTION" type="buff" /></li>
                                <li><CharacterLinkCard name="Tamara" /> : got <EffectInlineTag name="BT_SILENCE" type="debuff" /> and <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /></li>
                                <li><CharacterLinkCard name="Dahlia" /> : got <EffectInlineTag name="BT_FREEZE" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /></li>
                                <li><CharacterLinkCard name="Iota" /> : got <EffectInlineTag name="BT_STUN" type="debuff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /></li>
                                <li><CharacterLinkCard name="Gnosis Nella" /><CharacterLinkCard name="Tamamo-no-Mae" /> : <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> Starters</li>
                                <li><CharacterLinkCard name="Demiurge Stella" /><CharacterLinkCard name="Iota" /><CharacterLinkCard name="Laplace" /> <CharacterLinkCard name="Ryu Lion" />: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> Finishers</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}

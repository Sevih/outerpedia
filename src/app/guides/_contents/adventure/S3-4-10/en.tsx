'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function HildeGuide() {
    return (
        <GuideTemplate
            title="Hilde Strategy Guide"
            introduction="Hilde is a complex boss who calls backup allies and resurrects fallen teammates. She inflicts irremovable taunt on the first ally to evade and gains full action gauge when hitting an undebuffed ally."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Hilde'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500283'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Maxie moveset</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of caster by 10%.</li>
                                <li><strong>S2</strong>: Single, used after Roxie attack. Damage on the enemie with the highest attack. <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of caster by 25%.</li>
                                <li><strong>S3</strong>: AoE, grant <EffectInlineTag name="BT_STAT|ST_ATK" type="buff" /><EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="buff" /> 1 turn and inflict 2 <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> 1 turn.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Roxie moveset</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><strong>S1</strong>: Single, 30% chance to inflict <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" />.</li>
                                <li><strong>S2</strong>: Single, used after Maxie attack. Damage on the enemie with the highest speed. <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of caster by 25% and grants <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" /> to Maxie and herself.</li>
                                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> 2 turns.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Bring <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> to avoid getting <EffectInlineTag name="BT_AGGRO_IR" type="debuff" />.</li>
                                <li>Healers with healing on S1 can help if you end up getting <EffectInlineTag name="BT_AGGRO_IR" type="debuff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Mero" />: for <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" />.</li>
                                <li><CharacterLinkCard name="Gnosis Beth" /> <CharacterLinkCard name="Ember" /> : for landing debuff while getting hit.</li>
                                <li><CharacterLinkCard name="Tamamo-no-Mae" /> <CharacterLinkCard name="Ember" /> : for <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Charlotte" /> <CharacterLinkCard name="Skadi" /> <CharacterLinkCard name="Sterope" />: for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" />.</li>
                                <li><CharacterLinkCard name="Hilde" /> <CharacterLinkCard name="Edelweiss" /> : for damage sharing.</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}

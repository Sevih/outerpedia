'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function AsteiGuide() {
    return (
        <GuideTemplate
            title="Astei Strategy Guide"
            introduction="Astei is a formidable support boss who heals allies, boosts attack, and resurrects her team upon enraging. Her companion Sterope punishes non-offensive skills by recovering the boss team's resources."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 mb-4">
                                ⚠️ This guide also applies to stage S2 Hard 5-9 ⚠️
                            </div>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500045'
                                labelFilter='An Unpleasant Reunion'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Sterope moveset</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><strong>S1</strong>: Single, if Sterope has a buff activates an additional attack and grants Divine Retribution (Increases damage dealt by all allies by 4% (Max 15 stacks)).</li>
                                <li><strong>S3</strong>: Grants <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> 2 turns on all allies.</li>
                                <li><strong>Passive</strong>: At the start of battle, inflicts <EffectInlineTag name="UNIQUE_KERAUNOS" type="debuff" /> for 3 turns on all units (allies and enemies).</li>
                                <li><strong>Passive</strong>: When enemies use a non-attack skill, recovers all allies&apos; weakness gauge by 4 and health by 3%.</li>
                                <li><strong>Passive</strong>: Inflict 700 <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> when hit and <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of all allies by 10%.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>The boss has no immunities, so bring <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" />.</li>
                                <li>Try to avoid using characters with non-offensive skills.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Demiurge Vlada" />, <CharacterLinkCard name="Sterope" />, <CharacterLinkCard name="Eternal" />: for <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /></li>
                                <li><CharacterLinkCard name="Monad Eva" />, <CharacterLinkCard name="Dianne" /> : can heal without using non-offensive skills</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}

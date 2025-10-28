'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function PrototypeEx78() {
    return (
        <GuideTemplate
            title="Prototype EX-78 Joint Boss Strategy"
            introduction="Prototype EX-78 is a challenging joint boss in Outerplane. This guide provides video resources to help you understand the mechanics and strategies needed to achieve maximum scores."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'October 2025 Version',
                    content: (
                        <>
                            <GuideHeading level={3}>Strategy Overview</GuideHeading>
                            <GuideHeading level={4}>Prototype EX-78 moveset</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4 space-y-1">
                                <li><strong>S1</strong>: Single, prioritizes the leftmost enemy. If the target isn&apos;t <ClassInlineTag name='Healer' /> grants <EffectInlineTag name='BT_DAMGE_TAKEN' type='buff' /> 1 turn.</li>
                                <li><strong>S2</strong>: AoE, grants <EffectInlineTag name='BT_STAT|ST_CRITICAL_RATE' type='buff' /> <EffectInlineTag name='BT_STAT|ST_CRITICAL_DMG_RATE' type='buff' /> 3 turns.</li>
                                <li><strong>S3</strong>: AoE <EffectInlineTag name='BT_SEAL_COUNTER' type='buff' />, inflicts <EffectInlineTag name='BT_STAT|ST_DEF' type='debuff' /> <EffectInlineTag name='BT_STAT|ST_ATK' type='debuff' /> 5 turns (ignore imumnity).</li>
                                <li><strong>Passive</strong>: Increases damage taken from <ElementInlineTag element='Earth' /> and <ElementInlineTag element='Water' /> enemies.</li>
                                <li><strong>Passive</strong>: Decrease damage taken from <ElementInlineTag element='Light' />, <ElementInlineTag element='Dark' /> and <ElementInlineTag element='Fire' /> enemies.</li>
                                <li><strong>Passive</strong>: If inflicted by <EffectInlineTag name='BT_DOT_POISON' type='debuff' />, takes increased damage.</li>
                                <li><strong>Passive</strong>: When attacked by an enemy with a debuff, reduces enemies&apos; CP by 30.</li>
                                <li><strong>Passive</strong>: After attacking, recovers 10% of WG if granted a dispellable buff.</li>
                                <li><strong>Passive</strong>: Takes 100% increased WG damage from <EffectInlineTag name='BT_CALL_BACKUP' type='buff' />.</li>
                                <li><strong>Passive</strong>: <EffectInlineTag name='BT_REVERSE_HEAL_BASED_TARGET' type='debuff' /> cannot exceed 80 000.</li>
                                <li><strong>Enrage</strong>: Every 4 turns and last 3 turns. Gains <EffectInlineTag name='BT_STAT|ST_ATK_IR' type='buff' />, <EffectInlineTag name='BT_DAMGE_TAKEN' type='buff' /> and recovers 30% of weakness gauge.</li>
                                <li><strong>Enrage Ultimate</strong>: AoE, inflicts <EffectInlineTag name='BT_STUN' type='debuff' /> 2 turns (ignore resilience) and grants permanent <EffectInlineTag name='BT_STAT|ST_CRITICAL_RATE_IR' type='buff' />.</li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />

                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Luna" /> <CharacterLinkCard name="Viella" />: Essential pick because of the score bonus.</li>
                                <li><CharacterLinkCard name="Monad Eva" /> <CharacterLinkCard name="Veronica" />: alternative to Viella & Luna with <EffectInlineTag name='BT_CALL_BACKUP' type='buff' />.</li>
                                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Saeran" />: if you need <EffectInlineTag name='BT_REMOVE_DEBUFF' type='buff' />.</li>
                                <li><CharacterLinkCard name="Ame" /> <CharacterLinkCard name="Rey" /> <CharacterLinkCard name="Noa" /> <CharacterLinkCard name="Ryu Lion" />: <ElementInlineTag element='Earth' /> DPS.</li>
                                <li><CharacterLinkCard name="Rin" /> <CharacterLinkCard name="Caren" /> <CharacterLinkCard name="Beth" /> <CharacterLinkCard name="Poolside Trickster Regina" /> <CharacterLinkCard name="Laplace" /> <CharacterLinkCard name="Roxie" /> <CharacterLinkCard name="Sofia" />: <ElementInlineTag element='Water' /> DPS.</li>
                                <li><CharacterLinkCard name="Tamara" /> <CharacterLinkCard name="Charlotte" />: as support.</li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />

                            <GuideHeading level={3}>Video Guide</GuideHeading>
                            <p className="text-neutral-400 text-sm italic mt-2">
                                Run provided by <span className="text-white font-semibold">XuRenChao</span> (28/10/2025)
                            </p>
                            <YoutubeEmbed videoId="jw0GIwox7YM" title="Prototype EX-78 - Joint Challenge - (Auto) Very Hard Mode - by XuRenChao" />
                        </>
                    ),
                },

                legacy2024: {
                    label: 'Legacy (December 2024 Video)',
                    content: (
                        <>
                            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
                                <p className="text-amber-200 text-sm">
                                    ⚠️ <strong>Note:</strong> This is a strategy from December 2024. While the core mechanics may remain similar,
                                    character recommendations and optimal strategies may have evolved since then.
                                </p>
                            </div>

                            <GuideHeading level={3}>Video Guide by Ducky</GuideHeading>
                            <p className="mb-4 text-neutral-300">
                                No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
                            </p>
                            <YoutubeEmbed videoId="UuspJgswwNQ" title="Prototype EX-78 Joint Boss Max Score by Ducky" />
                        </>
                    ),
                },
            }}
        />
    )
}

'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

const teams = {
    team1: {
        label: 'Suggested Core',
        icon: 'SC_Debuff_Effect_Add_Debuff.webp',
        setup: [
            ['Gnosis Beth','Demiurge Stella','Skadi'],
            ['Regina','Akari','Kuro'],
            ['Dianne','Stella'],
            ['Drakhan'],
        ]
    }
}

export default function Amadeus13Guide() {
    return (
        <GuideTemplate
            title="Amadeus 13 Strategy Guide"
            introduction="Amadeus 13 is a challenging encounter that requires careful debuff management and strategic character selection. The boss is immune to weakness gauge damage unless debuffed and applies random debuffs that bypass immunity, making cleansing and debuff application crucial for success."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <GuideHeading level={3}>Strategy Overview</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Immune to <EffectInlineTag name="BT_WG_REVERSE_HEAL" type="debuff" /> if not debuff</li>
                                <li>Applies random debuffs that bypass <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                                <li>Using non-attack skills gives the boss <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE_IR" type="buff" /></li>
                                <li>Immune to <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                                <li>Buffs can be reversed by <CharacterLinkCard name="Kuro" /> into long-duration debuffs</li>
                            </ul>
                            <hr className="my-6 border-neutral-700" />
                            <GuideHeading level={3}>Tactical Tips</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Keep applying debuffs to deal enough <EffectInlineTag name="BT_WG_REVERSE_HEAL" type="debuff" /> before the enrage mechanic triggers.</li>
                                <li>The boss applies random debuffs that ignore immunity. Cleansing is crucial after they land.</li>
                                <li>The boss extends party debuffs by 1 turn each round. Plan your cleanses accordingly.</li>
                                <li>Do not use characters with non-attack skills, as they grant the boss a permanent critical hit buff.</li>
                            </ul>
                            <hr className="my-6 border-neutral-700" />
                            <GuideHeading level={3}>Recommended Characters</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Dianne" /> is ideal as both her heals are attacks, and she can cleanse without triggering the boss mechanic.</li>
                                <li><CharacterLinkCard name="Kuro" /> shines with buff reversal. Use S3 after boss self-buffs to convert them into long debuffs.</li>
                                <li><CharacterLinkCard name="Drakhan" /> and <CharacterLinkCard name="Gnosis Beth" /> are MVPs thanks to their repeated debuffs</li>                
                                <li><CharacterLinkCard name="Akari" /> works even without Unbuffable thanks to her broad debuff kit.</li>
                                <li><CharacterLinkCard name="Skadi" /> could be used to fill a slot as the buffs can help someone like Regina do more damage.</li>
                            </ul>
                            <hr className="my-6 border-neutral-700" />
                            <TeamTabSelector teams={teams} />
                            <hr className="my-6 border-neutral-700" />
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                                <YoutubeEmbed videoId="2lbN-rK89xI" title="Amadeus 13 – Clean Run Showcase by Sevih" />
                            </div>
                        </>
                    ),
                },
            }}
        />
    )
}
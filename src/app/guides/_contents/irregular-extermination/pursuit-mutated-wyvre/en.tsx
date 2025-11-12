'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import StatInlineTag from '@/app/components/StatInlineTag';
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

type NoteEntry =
    | { type: 'p'; string: string }
    | { type: 'ul'; items: string[] }

const teams = {
    team1: {
        label: 'Recommended Team',
        icon: 'SC_Buff_Stat_CriRate.webp',
        setup: [
            ['Dianne'],
            ['Skadi'],            
            ['Caren','Demiurge Astei','Maxwell'],
            ['Gnosis Dahlia', "Holy Night's Blessing Dianne",'Ame']
        ],
        note: [
            {
                type: 'p',
                string: "Feel free to use any strong DPS character that don't rely on debuffs."
            }
        ] as NoteEntry[]
    },
    team2: {
        label: 'One run kill',
        icon: 'SC_Buff_Effect_Element_Superiority.webp',
        setup: [
            ['Dianne'],
            ['Skadi'],            
            ['Demiurge Luna'],
            ['Maxwell']
        ]
    },
}

export default function IrregularMutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="Mutated Wyvre Strategy Guide"
            introduction="The Mutated Wyvre has permanent immunity to debuffs and punishes non-critical hits by recovering 50% WG. This boss requires high critical rate teams and careful management of counters."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Mutated Wyvre'
                                modeKey='Pursuit Operation'
                                defaultBossId='51202003'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Noticable Heroes</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Dianne" /> :  <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                                <li><CharacterLinkCard name="Skadi" /> : the only hero that got a <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> that bypass <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <StatInlineTag name="RES" /> check when fighting Irregulars<br />Gives <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> too</li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />
                            <TeamTabSelector teams={teams} />
                            <hr className="my-6 border-neutral-700" />

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                                <YoutubeEmbed videoId="PCgNRKFlRGI" title="Mutated Wyvre - Pursuit Operation - 1 run kill by Sevih" />
                            </div>
                        </>
                    ),
                },
            }}
        />
    )
}

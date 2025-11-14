'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ElementInlineTag from '@/app/components/ElementInline'
import CalamariTeamsData from './Grand-Calamari.json'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import type {TeamData} from '@/types/team'
import BossDisplay from '@/app/components/BossDisplay'

const CalamariTeams = CalamariTeamsData as TeamData



export default function GrandCalamari13Guide() {
    return (
        <GuideTemplate
            title="Grand Calamari 13 Strategy Guide"
            introduction="Grand Calamari 13 is immune to buff removal and reduces debuff duration by 1 each turn. The key to this fight is preventing the boss from gaining buffs using Unbuffable or buff conversion, while managing the Buff Chance Down debuff it applies."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Special Request: Ecology Study' defaultBossId='403400362' />

                            <GuideHeading level={3}>Tactical Tips</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Prevent the boss from gaining buffs using <EffectInlineTag name="BT_SEALED" type="debuff" /> or <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> <EffectInlineTag name="BT_STATBUFF_CONVERT_TO_STATDEBUFF" type="debuff" />.</li>                
                                <li>Bring a cleanser like <CharacterLinkCard name="Monad Eva" /> whose cleanse is triggered passively to deal with <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="debuff" />.</li>
                                <li><EffectInlineTag name="BT_COOL_CHARGE" type="buff" /> is helpful if you&apos;re only using one source of <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Drakhan" /> and <CharacterLinkCard name="Akari" /> benefits greatly from their exclusive equipments</li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />

                            <GuideHeading level={3}>Recommended Characters</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Gnosis Nella" /> is ideal thanks to <EffectInlineTag name="IG_Buff_Effect_Sealed_Interruption_D" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Akari" /> <CharacterLinkCard name="Edelweiss" /> have strong debuffs, including <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Kuro" /> is a great pick with <EffectInlineTag name="BT_STATBUFF_CONVERT_TO_STATDEBUFF" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Monad Eva" /> is excellent for cleansing the boss&apos;s S3 debuff passively.</li>
                                <li><CharacterLinkCard name="Drakhan" /> <CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Gnosis Beth" /> are strong <ElementInlineTag element="light" /> damage dealers.</li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />

                            <StageBasedTeamSelector teamData={CalamariTeams} defaultStage="1-10" icon='/images/ui/effect/light.webp' replace={{ lead: "Stage ", mid: " to ", tail: "" }} />

                            <hr className="my-6 border-neutral-700" />
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>

                                <YoutubeEmbed videoId="O9cxC5paoes" title="Grand Calamari 13 – Clean Run Showcase by Sevih" />
                            </div>
                        </>
                    ),
                },
            }}
        />
    )
}
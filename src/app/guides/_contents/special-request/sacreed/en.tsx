'use client'

import { useState, useCallback } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ElementInlineTag from '@/app/components/ElementInline'
import SacreedTeamsData from './Sacreed.json'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import type { TeamData } from '@/types/team'
import BossDisplay from '@/app/components/BossDisplay'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'

const SacreedTeams = SacreedTeamsData as TeamData

export default function SacreedGuardian13Guide() {
    const [miniBossId, setMiniBossId] = useState('404400462')

    // Mapping: Sacreed Guardian boss ID → Deformed Inferior Core boss ID
    const handleBossChange = useCallback((sacreedBossId: string) => {
        const bossIdMap: Record<string, string> = {
            '404400362': '404400462', // Stage 13
            '404400361': '404400461', // Stage 12
            '404400360': '404400460', // Stage 11
            '404400359': '404400459', // Stage 10
        }
        // Stage 9 et moins utilisent tous 404400450
        setMiniBossId(bossIdMap[sacreedBossId] || '404400450')
    }, [])

    return (
        <GuideTemplate
            title="Sacreed Guardian 13 Strategy Guide"
            introduction="Sacreed Guardian 13 is immune to Unbuffable, requiring buff removal, buff steal, or buff conversion strategies. If the boss has any buffs when taking its turn, it will stun your team and become invincible. The orb grants 3 buffs per turn and must be controlled with AoE debuffs. Focus on lockdown and bursting the boss quickly."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            {/**<BossDisplay bossKey='Sacreed Guardian' modeKey='Special Request: Ecology Study' defaultBossId='404400362' />*/}

                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey='Special Request: Ecology Study'
                                defaultBossId='404400362'
                                onBossChange={handleBossChange}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Deformed Inferior Core', defaultBossId: miniBossId }
                                ]}
                                modeKey='Special Request: Ecology Study'
                            />

                            <GuideHeading level={3}>Strategy Overview</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Immune to <EffectInlineTag name="BT_SEALED" type="debuff" /> : use <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> <EffectInlineTag name="BT_STATBUFF_CONVERT_TO_STATDEBUFF" type="debuff" /> <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
                                <li>If the boss has any buffs when taking its turn, it will <EffectInlineTag name="BT_STUN" type="debuff" /> your team and <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> himself</li>
                                <li>Boss strips your buffs with S2 so <EffectInlineTag name="BT_IMMUNE" type="buff" /> will not protect against the stun mechanic</li>
                                <li>The orb grants 3 buffs/turn — it can be debuffed by all effects except <EffectInlineTag name="BT_AGGRO" type="debuff" /></li>
                                <li>The boss is vulnerable to <EffectInlineTag name="BT_STUN" type="debuff" />, <EffectInlineTag name="BT_DOT_POISON" type="debuff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> and even <EffectInlineTag name="BT_AGGRO" type="debuff" /></li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />

                            <GuideHeading level={3}>Tactical Tips</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Use a fast unit to strip the boss&apos;s initial <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> at the start of the fight.</li>
                                <li>Apply AoE debuffs to disable the orb, which applies 3 buffs every turn to the boss.</li>
                                <li>Debuff the boss consistently to delay its AoE and S2 skills.</li>
                                <li><ClassInlineTag name='Healer' /> can&apos;t be stun until Stage 11</li>
                                <li>Healing is optional, focus on lockdown and bursting the boss quickly before it gains buffs.</li>
                                <li>Stage 12: The boss heals when these effects are triggered: <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />, <EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" />, and <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />.</li>
                                <li>Stage 13 : The boss negates <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> <EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" /> <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> characters like <CharacterLinkCard name="Demiurge Stella" /> and <CharacterLinkCard name="Stella" /> are immune to stun but won&apos;t trigger their passives.</li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />

                            <GuideHeading level={3}>Recommended Characters</GuideHeading>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Iota" />  is excellent here for AoE <EffectInlineTag name="BT_STUN" type="debuff" /> and <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Francesca" /> can handle both DPS and buff removal but needs to pass effectiveness checks.</li>
                                <li><CharacterLinkCard name="Omega Nadja" /> is great at 4 stars (for stage 13) since her <EffectInlineTag name="IG_Buff_Effect_2000102_Interruption_D" type="debuff" /> will remove the initial speed buff as a result removing the threat of being stunned from Sacreed Guardian&apos;s first attack.</li>
                                <li><CharacterLinkCard name="Aer" /> is reliable for <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> without relying on success rate checks.</li>
                                <li><CharacterLinkCard name="Kuro" /> is a great pick with <EffectInlineTag name="BT_STATBUFF_CONVERT_TO_STATDEBUFF" type="debuff" /></li>
                                <li><CharacterLinkCard name="Maxwell" /> and <CharacterLinkCard name="Demiurge Astei" /> are strong <ElementInlineTag element="dark" /> DPS picks for this fight.</li>
                                <li><CharacterLinkCard name="Dahlia" />, <CharacterLinkCard name="Notia" />, and <CharacterLinkCard name="Gnosis Nella" /> provide key debuffs or buff removal.</li>
                            </ul>
                            <span className="text-sm text-gray-400"><strong>Note: </strong><CharacterLinkCard name="Omega Nadja" /> and <CharacterLinkCard name="Iota" /> pair well if Iota is really fast and can prevent the boss from attacking. Just be mindful of the turn limit, and make sure both DPS units, along with Iota, are fast as well.
                            </span>

                            <hr className="my-6 border-neutral-700" />


                            <StageBasedTeamSelector teamData={SacreedTeams} defaultStage="1-10" icon='/images/ui/effect/dark.webp' replace={{ lead: "Stage ", mid: " to ", tail: "" }} />


                            <hr className="my-6 border-neutral-700" />
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>

                                <YoutubeEmbed videoId="fLdbR9Sa7G0" title="Sacreed Guardian 13 – Clean Run Showcase by Sevih" />
                            </div>
                        </>
                    ),
                },
            }}
        />
    )
}
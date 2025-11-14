'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import BossDisplay from '@/app/components/BossDisplay'
import TyrantTeamsData from './Tyrant.json'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import type {TeamData} from '@/types/team'

const TyrantTeams = TyrantTeamsData as TeamData

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="Tyrant Strategy Guide"
            introduction="The Toddler is a very unique fight that is more focused on cleansing debuffs quickly. Upon entering the battle, you will be instantly stacked with Poison, Bleed, and Lightning DoTs that will kill you very quickly if not cleansed immediately. Units with AoE cleansing are very important, and once cleansed, you must use Burst Skills, Dual Attacks, and Chain Skills to damage his weakness gauge."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Tyrant Toddler' modeKey='Special Request: Ecology Study' defaultBossId='401400262' />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Upon entering the battle, you will be instantly stacked with <EffectInlineTag name="BT_DOT_POISON" type="debuff" />, <EffectInlineTag name="BT_DOT_BLEED" type="debuff" />, and <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> but so will the boss.</li>
                                <li>These DoTs will kill you very quickly if not cleansed immediately.</li>
                                <li>Since they are applied at the start of battle, <EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" /> that cleanse like <CharacterLinkCard name="Tio" />, <CharacterLinkCard name="Meva" />, <CharacterLinkCard name="Stella" /> will not trigger.</li>
                                <li>Units with AoE cleansing are very important.</li>
                                <li><CharacterLinkCard name="Dianne" />&#39;s S3 completely trivializes this boss by cleansing the full duration of all debuffs.</li>
                                <li><CharacterLinkCard name="Saeran" />&#39;s Skill 2 Burst 2 is also viable, but you need to build enough AP in the first area to use it immediately.</li>
                                <li><CharacterLinkCard name="Shu" />&#39;s Skill 3 is viable but only cleanse 2 debuffs.</li>
                                <li><CharacterLinkCard name="Monad Eva" />&#39;s Skill 1 Burst 3 works too but you need her 5 star and AP.</li>
                                <li>Once cleansed, you must use <strong>Burst Skills</strong>, <strong>Dual Attacks</strong>, and <strong>Chain Skills</strong> to damage his WG.</li>
                                <li>Try to burst him down quickly since his damage increases rapidly over time.</li>
                                <li>Stage 12: Increases the speed of <ClassInlineTag name="Healer" /> and <ClassInlineTag name="Defender" /> by 50%, and makes their damage scale with their defense. All other classes deal 95% less damage.</li>
                                <li>Stage 13: Fully reduces Critical Hit chance and reduces the damage of all classes except <ClassInlineTag name="Defender" /> by 95%.</li>
                            </ul>
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={TyrantTeams} defaultStage="1-10" icon='/images/ui/effect/earth.webp' replace={{ lead: "Stage ", mid: " to ", tail: "" }} />
                            <hr className="my-6 border-neutral-700" />
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                                <YoutubeEmbed videoId="n9-IcrXHyBA" title='combat footage' />
                            </div>
                        </>
                    ),
                },
            }}
        />
    )
}
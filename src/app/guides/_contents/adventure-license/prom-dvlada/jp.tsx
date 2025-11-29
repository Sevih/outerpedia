'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import VladaALTeamsData from './VladaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const VladaALTeams = VladaALTeamsData as Record<string, TeamData>

export default function VladaGuide() {
    return (
        <GuideTemplate
            title="デミウルゴス・ヴラダ 冒険者ライセンス ガイド"
            introduction="デミウルゴス・ヴラダとドレイカーンは弱体効果を付与すると味方全体のHPを15%回復し、対象の弱体効果数に応じてダメージが増加します。{D/BT_DOT_CURSE}と{D/BT_FIXED_DAMAGE}は制限なく付与可能です。通常1〜2回の挑戦が必要です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000006' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000007' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "両方の敵は弱体効果を付与すると味方全体のHPを15%回復します。",
                                    "両方の敵は対象の弱体効果数に応じてダメージが増加します。",
                                    "{D/BT_DOT_CURSE}と{D/BT_FIXED_DAMAGE}は制限なく付与可能です。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladaALTeams.vladaAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="JIx2mVtXufA"
                                title="デミウルゴス・ヴラダ - 冒険者ライセンス: 昇級チャレンジ"
                                author="Sevih"
                                date="09/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

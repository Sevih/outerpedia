'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import ChimeraALTeamsData from './ChimeraAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ChimeraALTeams = ChimeraALTeamsData as Record<string, TeamData>

export default function UnidentifiedChimeraGuide() {
    return (
        <GuideTemplate
            title="未確認キメラ 冒険者ライセンス ガイド"
            introduction="未確認キメラ冒険者ライセンスは、スペシャルリクエスト ステージ12と同じスキルを持っています。適切なチーム編成で1回の挑戦でクリア可能。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Adventure License' defaultBossId='51000006' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "ボスは毎ターン弱体効果を2つ解除するため、弱体効果のみに頼らないこと。",
                                    "全ユニットの会心ダメージが85%減少。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ChimeraALTeams.chimeraAL} defaultStage="Recommended Team" />
                        </>
                    ),
                },
            }}
        />
    )
}

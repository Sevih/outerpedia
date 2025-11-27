'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosALTeamsData from './MeteosAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosALTeams = MeteosALTeamsData as Record<string, TeamData>

export default function BlazingKnightMeteosGuide() {
    return (
        <GuideTemplate
            title="火炎の騎士メテウス 冒険者ライセンス ガイド"
            introduction="火炎の騎士メテウス冒険者ライセンスは特別依頼ステージ12と同じスキルを持っていますが、第1エンレージフェーズのみです。適切な編成で1〜2回の挑戦で安定してクリア可能です。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Adventure License' defaultBossId='51000012' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "{E/Water}以外の敵からのWGダメージを50%軽減します。",
                                    "ボスは{B/BT_SHIELD_BASED_CASTER}を持つターゲットへのダメージが減少します。",
                                    "{B/BT_REMOVE_DEBUFF}を使用して{D/BT_SEALED}に対処しましょう。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosALTeams.meteosAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Do7Vyjz3odI"
                                title="火炎の騎士メテウス - 冒険者ライセンス - ステージ10 - 1回クリア"
                                author="XuRenChao"
                                date="11/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

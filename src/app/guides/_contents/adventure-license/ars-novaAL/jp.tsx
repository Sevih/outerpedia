'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaALTeamsData from './ArsNovaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ArsNovaALTeams = ArsNovaALTeamsData as Record<string, TeamData>

export default function ArsNovaGuide() {
    return (
        <GuideTemplate
            title="アルス・ノーヴァ 冒険者ライセンス攻略ガイド"
            introduction="アルス・ノーヴァ冒険者ライセンスは、スペシャルリクエストステージ12と同じスキルを持っています。適切なチーム編成で1回の挑戦で安定してクリアできます。この攻略はステージ10まで検証済みです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey="Ars Nova" modeKey='Adventure License' defaultBossId='51000024' />
                                                        <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000025' labelFilter={"Weekly Conquest - Ars Nova"} />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "スペシャルリクエストステージ12と同じスキルです。",
                                    "{E/Dark}ユニットのみがフルWGダメージを与えられます。闇属性以外のユニットはWGダメージが50%減少します。",
                                    "チームのCPが150以上の場合、ボスはWGダメージを受けません。CPをこの閾値以下に保ってください。",
                                    "ボスは攻撃後に劣化コアを召喚します。生存しているコア1体につき、ボスの固定ダメージが1500増加します。",
                                    "コアを倒すと15CPを獲得します。チェインスキルに有用ですが、150CPを超えないように注意してください。",
                                    "HP30%で、ボスは3ターン狂暴化し、その後カンタータで致命的なダメージを与えます。カンタータが発動する前に倒すかブレイクしてください。",
                                    "戦闘開始から4ターン以内にボスが狂暴化すると、チームは80CPを獲得します。これによりチェインスキルを早く発動できます。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaALTeams.arsNovaAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Gb-649eighM"
                                title="Ars Nova - Adventure License - Stage 10 - 1 run clear"
                                author="Sevih"
                                date="10/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

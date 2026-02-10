'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import BeatlesALTeamsData from './BeatlesAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BeatlesALTeams = BeatlesALTeamsData as Record<string, TeamData>

export default function DekrilMekrilGuide() {
    return (
        <GuideTemplate
            title="デグリル&メグリル 冒険者ライセンス攻略ガイド"
            introduction="デグリル&メグリル冒険者ライセンスは、スペシャルリクエストステージ12と同じスキルを持っています。この兄弟デュオは適切なチーム編成で1回の挑戦で安定してクリアできます。この攻略はステージ9まで検証済みです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey="Dek'Ril" modeKey='Adventure License' defaultBossId='51000007' />
                                <BossDisplay bossKey="Mek'Ril" modeKey='Adventure License' defaultBossId='51000008' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "チェインスキル以外のAoEスキルを使用するとボスに{B/BT_STAT|ST_DEF}が付与されます。",
                                    "キャラクターが{D/BT_DOT_POISON}を受けている場合、ボスは行動直後に反撃します。",
                                    "メインボス（右側）のみが攻撃します。左側のボスは常に{B/BT_STAT|ST_ATK}をバフします。",
                                    "左側のボスを倒すと、メインボスが{B/BT_INVINCIBLE}と{B/BT_STAT|ST_ATK}を獲得します。",
                                    "{D/BT_REMOVE_BUFF}や{D/BT_STEAL_BUFF}を付与できるキャラクターが強く推奨されます。",
                                    "{B/BT_STAT|ST_DEF}の発動を避けるため、単体DPSに集中しましょう。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                        </>
                    ),
                },
            }}
        />
    )
}

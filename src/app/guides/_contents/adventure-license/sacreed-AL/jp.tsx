'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SacreedALTeamsData from './SacreedAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SacreedALTeams = SacreedALTeamsData as Record<string, TeamData>

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="セイクリッドガーディアン 冒険者ライセンス ガイド"
            introduction="セイクリッドガーディアン冒険者ライセンスは、スペシャルリクエストステージ12と同じスキルを持っています。ボスはターン終了時に強化効果があると無敵を獲得するため、{D/BT_REMOVE_BUFF}または{D/BT_STUN}ロックが必須です。適切なチーム編成で1〜2回でクリア可能です。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Sacreed Guardian' modeKey='Adventure License' defaultBossId='51000021' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000022' labelFilter={"Weekly Conquest - Sacreed Guardian"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "ボスがターン終了時に強化効果を持っている場合、{C/Healer}以外の全ユニットに{D/BT_STUN}を付与し、{B/BT_INVINCIBLE}を獲得します。{D/BT_REMOVE_BUFF}または{D/BT_STUN}で防ぎましょう。",
                                    "ボスは4ターンごとに狂暴化し、解除不可の攻撃力UPとダメージDOWNを獲得します。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SacreedALTeams.sacreedAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="1ui7TcwD7po"
                                title="セイクリッドガーディアン - 冒険者ライセンス - ステージ10 - 1回クリア (オート)"
                                author="XuRenChao"
                                date="06/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

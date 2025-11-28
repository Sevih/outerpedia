'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SchattenmeisterSchwartzALTeamsData from './SchattenmeisterSchwartzAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SchattenmeisterSchwartzALTeams = SchattenmeisterSchwartzALTeamsData as Record<string, TeamData>

export default function SchattenmeisterSchwartzGuide() {
    return (
        <GuideTemplate
            title="シャッテンマイスター・シュヴァルツ 冒険者ライセンス ガイド"
            introduction="シャッテンマイスター・シュヴァルツは解除不可の{D/IG_Buff_Effect_Sealed_Interruption_D}を付与し、シャドウビーストを召喚します。ボスは単独では低ダメージですが、シャドウビーストが生存中はダメージが増加します。全体攻撃で雑魚を素早く処理しましょう。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Schattenmeister Schwartz' modeKey='Adventure License' defaultBossId='51000019' />
                                <BossDisplay bossKey='Shadow Beast Fire-Breather' modeKey='Adventure License' defaultBossId='51000020' labelFilter={"Weekly Conquest - Schattenmeister Schwartz"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "敵全体に解除不可の{D/IG_Buff_Effect_Sealed_Interruption_D}を常時付与。",
                                    "全体攻撃でシャドウビーストを素早く処理しましょう。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SchattenmeisterSchwartzALTeams.schattenmeisterSchwartzAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="glWpGZRH4xc"
                                title="シャッテンマイスター・シュヴァルツ - 冒険者ライセンス - ステージ10 - 1回クリア (オート)"
                                author="XuRenChao"
                                date="01/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

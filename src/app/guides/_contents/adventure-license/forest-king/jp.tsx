'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ForestKingALTeamsData from './ForestKingAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ForestKingALTeams = ForestKingALTeamsData as Record<string, TeamData>

export default function ForestKingGuide() {
    return (
        <GuideTemplate
            title="森の王 冒険者ライセンス ガイド"
            introduction="森の王冒険者ライセンスはデバフ重視の攻撃を伴う簡単なメカニクスが特徴です。適切な編成で1回の挑戦で安定してクリア可能です。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Forest King' modeKey='Adventure License' defaultBossId='51000017' />
                            <BossDisplay bossKey='Spare Core' modeKey='Adventure License' defaultBossId='51000018' labelFilter={"Weekly Conquest - Forest King"} />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "究極スキルで{D/BT_STUN}状態のターゲットに増加したダメージを与えます。",
                                    "攻撃を受けた時、すべての敵のバフ持続時間を1ターン減少させます。",
                                    "{C/Striker}の敵から受けるダメージを大幅に減少させますが、{C/Mage}と{C/Ranger}の敵から受けるダメージが増加します。",
                                    "{E/Dark}ユニットは{D/BT_STAT|ST_CRITICAL_RATE_IR}が減少します。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ForestKingALTeams.forestKingAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="o3-ytts1Kos"
                                title="森の王 - 冒険者ライセンス - ステージ10 - 1回クリア (オート)"
                                author="XuRenChao"
                                date="26/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

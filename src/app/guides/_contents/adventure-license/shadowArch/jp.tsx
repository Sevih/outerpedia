'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ShadowArchALTeamsData from './ShadowArchAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ShadowArchALTeams = ShadowArchALTeamsData as Record<string, TeamData>

export default function ShadowOfTheArchdemonGuide() {
    return (
        <GuideTemplate
            title="魔王の隻影 冒険者ライセンス ガイド"
            introduction="魔王の隻影は{E/Fire}属性以外の敵のスピードを0にします。ボスは強化効果がある間WGダメージを受けず、弱体効果を付与するとWGが全回復します。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Shadow of the Archdemon' modeKey='Adventure License' defaultBossId='51000027' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "{E/Fire}属性のみ行動可能 - {E/Fire}属性以外の敵はスピードが完全に減少。",
                                    "強化効果がある間、WGダメージを受けない。",
                                    "ボスに弱体効果を付与するとWGが全回復。",
                                    "解除可能なステータスDOWN効果を持つ敵に{D/BT_STUN}を5ターン付与。効果抵抗を無視。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ShadowArchALTeams.shadowArchAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="bRSHzurhoV0"
                                title="魔王の隻影 - 冒険者ライセンス - ステージ10 - 1回クリア (オート)"
                                author="XuRenChao"
                                date="26/08/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

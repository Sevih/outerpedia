'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import FulminationALTeamsData from './FulminationAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'

const FulminationALTeams = FulminationALTeamsData as Record<string, TeamData>

export default function FulminationALGuide() {
    return (
        <GuideTemplate
            title="ヴラダ・アサルトスーツ アドベンチャーライセンスガイド"
            introduction="ヴラダ・アサルトスーツは、反撃とリベンジ攻撃からのみWGダメージを受けるというユニークなメカニックを持っています。適切なチーム構成で通常1回でクリア可能です。この戦略はステージ10まで検証済みです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Vlada Assault Suit' modeKey='Adventure License' defaultBossId='51000029' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "反撃とリベンジ攻撃からのみWGダメージを受ける。",
                                    "全体攻撃からのダメージを大幅に軽減する。",
                                    "非{E/Earth}ユニットの{D/BT_STAT|ST_CRITICAL_RATE_IR}を減少させる。",
                                    "S2はバフを持たない対象に大幅に増加したダメージを与える。",
                                    "S3はボスに{B/BT_STAT|ST_SPEED}を、味方全体に{D/BT_STAT|ST_SPEED}を付与し、免疫と抵抗を無視する。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={FulminationALTeams.fulminationAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="lt4osbmszzY"
                                title="Ful.Mi.NATION Assault Suit - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="29/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

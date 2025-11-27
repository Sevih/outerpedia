'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import KsaiALTeamsData from './KsaiAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const KsaiALTeams = KsaiALTeamsData as Record<string, TeamData>

export default function KsaiGuide() {
    return (
        <GuideTemplate
            title="ザイ 冒険者ライセンス ガイド"
            introduction="ザイは水属性ユニットを優遇する火属性スピード型ボスです。水属性以外のユニットは攻撃力と防御力にペナルティを受け、チーム全体が弱体促進を受けます。DoT上限により呪いと固定ダメージ戦略の効果が低く、ティック当たり5000に制限されます。適切な水属性中心のチーム構成で1回でクリアできます。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Ksai' modeKey='Adventure License' defaultBossId='51000028' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{E/Water}以外のユニットは{D/BT_STAT|ST_ATK_IR}と{D/BT_STAT|ST_DEF_IR}のペナルティを受けます。",
                                "チームは{D/BT_SYS_DEBUFF_ENHANCE_IR}を受け、ボスは{B/BT_SYS_BUFF_ENHANCE_IR}を持ちます。",
                                "ボスのHPが70%を下回るまで{D/BT_WG_REVERSE_HEAL}に対して免疫があります。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={KsaiALTeams.ksaiAL} defaultStage="Team 1 – Reliable Clear" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="-jEcneW-N3Y" title="ザイ - 冒険者ライセンス - ステージ10 - 1回クリア (オート)" author="XuRenChao" date="15/09/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MutatedWyvrePOTeamsData from './MutatedWyvrePO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MutatedWyvrePOTeams = MutatedWyvrePOTeamsData as Record<string, TeamData>

export default function MutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="変異したワイブル 追撃殲滅戦ガイド"
            introduction="変異したワイブルは弱体効果に対して永続的な免疫を持ち、会心でない攻撃を受けるとWGを50%回復します。また、反撃/復讐/迅速対応や攻撃以外のスキルを使用すると、チーム全体がスタンします。高い会心率が必要です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Mutated Wyvre' modeKey='Pursuit Operation' defaultBossId='51202003' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "反撃/復讐/迅速対応や攻撃以外のスキルを使用すると、チーム全体が1ターンの間{D/BT_STUN}状態になります。",
                                "{D/BT_FIXED_DAMAGE}は5000が上限です。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MutatedWyvrePOTeams.mutatedWyvrePO} defaultStage="One Run Kill" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="PCgNRKFlRGI" title="変異したワイブル - 追撃殲滅戦 - ワンキル" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

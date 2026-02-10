'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosTeamsData from './Meteos.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosTeams = MeteosTeamsData as Record<string, TeamData>

export default function MeteosGuide() {
    return (
        <GuideTemplate
            title="灼熱の騎士メテオス特殊依頼攻略ガイド"
            introduction="メテオスのギミックは主に{B/BT_SHIELD_BASED_CASTER}バフに関連しています。5回攻撃を受けるとAoE反撃を発動する特殊ゲージを持ち、デバフがあるとダメージが増加します。回復効果を遮断するためヒーラーは無力です。{B/BT_SHIELD_BASED_CASTER}で保護されたユニットには激怒中でもダメージが大幅に減少します。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Special Request: Identification' defaultBossId='407600262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスは5回攻撃を受けるとAoE反撃を発動する特殊ゲージを持っています。デュアルアタックとチェインアタックが推奨されます。",
                                "ボスはデバフがあるとダメージが増加します。デバフは最大2〜3個に抑えましょう。",
                                "ボスは永続的な{D/BT_SEALED_RECEIVE_HEAL}を付与するため、ヒーラーは無力です。",
                                "高難度ステージではボスがDPSユニットに{D/BT_SEALED}を付与します。",
                                "{B/BT_SHIELD_BASED_CASTER}で保護されたユニットにはボスのダメージが大幅に減少します。",
                                "{E/Water}ユニットのみWGダメージを与えられます。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosTeams.meteosSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U2R6eEZgyuI" title="メテオス戦闘映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

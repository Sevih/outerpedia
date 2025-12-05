'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import BlockbusterPOTeamsData from './BlockbusterPO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BlockbusterPOTeams = BlockbusterPOTeamsData as Record<string, TeamData>

export default function BlockbusterPOGuide() {
    return (
        <GuideTemplate
            title="ブラックバスター 追撃殲滅戦ガイド"
            introduction="ブラックバスターは毎ターン開始時にランダムな強化効果を獲得し、会心ダメージを受けると被ダメージが大幅に減少しWGを50%回復します。{B/HEAVY_STRIKE}を使う非会心チームか、WGメカニズムを無視できる強力なDPSが最適です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Blockbuster' modeKey='Pursuit Operation' defaultBossId='51202002' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "毎ターン開始時にランダムな強化効果を獲得する。",
                                "会心ダメージを受けると、被ダメージが大幅に減少しWGを50%回復する。",
                                "{B/HEAVY_STRIKE}キャラクターを使用して会心ペナルティを回避。",
                                "{D/BT_SEALED}でボスの強化を防ぐ。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BlockbusterPOTeams.blockbusterPO} defaultStage="Non-Crit Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="pgWkc6X6VNE" title="ブラックバスター - 追撃殲滅戦 - 1回クリア" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

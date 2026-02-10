'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import guardianTeamsData from './Guardian.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const guardianTeams = guardianTeamsData as Record<string, TeamData>

export default function MasterlessGuide() {
    return (
        <GuideTemplate
            title="主なきガーディアン特殊依頼攻略ガイド"
            introduction="このボスはデバフの付与とミニオンの管理が全てです。デバフがない状態では弱点ゲージを削れません。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Special Request: Ecology Study' defaultBossId='404400162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスにデバフがない場合、弱点ゲージを削れず、必殺技のダメージが大幅に増加します。",
                                "ボスはS1とS2でミニオンを召喚します。各ミニオンが行動するとボスの{B/BT_ACTION_GAUGE}が20%増加します。",
                                "AoEスキルを持ち込んでミニオンを素早く処理しましょう。",
                                "ステージ12：ボスは{E/Earth}と{E/Fire}ユニットに{D/BT_STAT|ST_CRITICAL_RATE_IR}を付与します。",
                                "ステージ13：ボスは全ユニットに{D/BT_STAT|ST_CRITICAL_RATE_IR}を付与します。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={guardianTeams.guardianSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="jAJOiJgASCU" title="主なきガーディアン戦闘映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

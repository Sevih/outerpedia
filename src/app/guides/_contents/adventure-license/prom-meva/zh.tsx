'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import EvaALTeamsData from './EvaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const EvaALTeams = EvaALTeamsData as Record<string, TeamData>

export default function MonadEvaPromotionGuide() {
    return (
        <GuideTemplate
            title="莫纳德·艾娃 晋升挑战 攻略"
            introduction="特级冒险家晋升挑战,featuring {P/Monad Eva}和{P/K}。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Eva' modeKey='Challenge' defaultBossId='50000008' />
                                <BossDisplay bossKey='K' modeKey='Challenge' defaultBossId='50000009' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "艾娃受到单体攻击时会无效化WG伤害并减少受到的伤害。使用群体技能。",
                                    "{B/BT_CALL_BACKUP}伤害非常高,需要带能扛住的角色或复活角色。",
                                    "两个Boss速度都是220,确保所有角色速度至少达到240。",
                                    "Boss可受{D/BT_DOT_CURSE}和{D/BT_FIXED_DAMAGE}影响且无上限。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={EvaALTeams.evaAL} defaultStage="Fixed Damage Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="AOhLXfgLUzM"
                                title="莫纳德·艾娃 - 晋升挑战"
                                author="XuRenChao"
                                date="09/06/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

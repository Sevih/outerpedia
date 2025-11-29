'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import DasteiALTeamsData from './DasteiAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

const DasteiALTeams = DasteiALTeamsData as Record<string, TeamData>

export default function DasteiPromotionGuide() {
    return (
        <GuideTemplate
            title="创世之神 奥斯黛 晋升挑战 攻略"
            introduction="首席冒险家晋升挑战（{P/Demiurge Astei}）。施加{D/BT_STONE}并可转换为{D/BT_STONE_IR}。生命值降至50%时狂暴化，3回合后全灭攻击。使用{D/BT_DOT_CURSE}或{D/BT_FIXED_DAMAGE}队伍绕过伤害减免。通常一次通关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Astei' modeKey='Challenge' defaultBossId='50000002' />
                                <BossDisplay bossKey='Sterope' modeKey='Challenge' defaultBossId='50000003' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "回合结束时对随机敌人施加{D/BT_STONE}。可转换为{D/BT_STONE_IR}（6回合）。",
                                    "生命值50%时狂暴化。3回合后全灭攻击。",
                                    "使用{D/BT_DOT_CURSE}或{D/BT_FIXED_DAMAGE}绕过伤害减免。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DasteiALTeams.dasteiAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage />
                        </>
                    ),
                },
            }}
        />
    )
}

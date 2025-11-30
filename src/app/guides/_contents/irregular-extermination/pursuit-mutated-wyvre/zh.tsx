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
            title="变异双足飞龙 追击歼灭战指南"
            introduction="变异双足飞龙对弱化效果拥有永久免疫,并且在受到非暴击攻击时会恢复50%的WG。此外,使用反击/复仇/迅速应对或非攻击技能时,会使全队陷入眩晕。需要高暴击率队伍。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Mutated Wyvre' modeKey='Pursuit Operation' defaultBossId='51202003' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "使用反击/复仇/迅速应对或非攻击技能时,全队会陷入{D/BT_STUN}状态1回合。",
                                "{D/BT_FIXED_DAMAGE}上限为5000。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MutatedWyvrePOTeams.mutatedWyvrePO} defaultStage="One Run Kill" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="PCgNRKFlRGI" title="变异双足飞龙 - 追击歼灭战 - 一轮击杀" author="Sevih" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}

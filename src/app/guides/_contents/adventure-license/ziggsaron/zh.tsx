'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ZiggsaronALTeamsData from './ZiggsaronAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ZiggsaronALTeams = ZiggsaronALTeamsData as Record<string, TeamData>

export default function RavenousWolfKingZiggsaronGuide() {
    return (
        <GuideTemplate
            title="饿狼王齐格萨龙 冒险许可证 攻略"
            introduction="每周讨伐Boss。永久降低攻击力，每回合开始时施加无法强化。非速度型受到的伤害降低，非水属性受到的WG伤害-50%。每4回合狂暴化，使用致命大招。1-2次尝试可通关。已验证至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <BossDisplay bossKey='Ravenous Wolf King, Ziggsaron' modeKey='Adventure License' defaultBossId='51000034' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "队伍永久获得无法解除的{D/BT_STAT|ST_ATK}。",
                                "每回合开始时施加{D/BT_SEALED}，持续1回合。",
                                "禁用反击、复仇和迅速应对。",
                                "非{C/Ranger}单位造成的伤害降低。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ZiggsaronALTeams.ziggsaronAL} defaultStage="No Ranger" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="Nlt72xRKMpo" title="齐格萨龙 - 冒险许可证 - 第10关 - 1次通关 (自动)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

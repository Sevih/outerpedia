'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ToddlerALTeamsData from './ToddlerAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ToddlerALTeams = ToddlerALTeamsData as Record<string, TeamData>

export default function TyrantToddlerGuide() {
    return (
        <GuideTemplate
            title="幼体泰兰特 冒险许可证 攻略"
            introduction="与特殊委托第12关技能相同。可在1至2次尝试内通关。已验证至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Tyrant Toddler' modeKey='Adventure License' defaultBossId='51000004' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000005' labelFilter={"Weekly Conquest - Tyrant Toddler"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "仅受到来自爆发技能、夹攻和连携技能的WG伤害。",
                                "{C/Healer}和{C/Defender}友军速度提升50%，并根据防御力等比提升伤害。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ToddlerALTeams.toddlerAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="i7HvX6Gzic8" title="幼体泰兰特 - 冒险许可证 - 第10关 - 1次通关" author="XuRenChao" date="11/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

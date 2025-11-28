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
            title="科赛 冒险许可证 指南"
            introduction="科赛是一个偏向水属性单位的火属性速度型首领。非水属性单位会受到攻击力和防御力惩罚，整个队伍会受到弱化促进效果。DoT上限使诅咒和固定伤害策略效果较差，每跳伤害限制在5000。通过合适的以水属性为中心的队伍配置可以一次通关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Ksai' modeKey='Adventure License' defaultBossId='51000028' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "非{E/Water}单位会受到{D/BT_STAT|ST_ATK_IR}和{D/BT_STAT|ST_DEF_IR}惩罚。",
                                "队伍受到{D/BT_SYS_BUFF_ENHANCE_DEBUFF_UP}，首领拥有{B/BT_SYS_BUFF_ENHANCE_IR}。",
                                "首领在生命值降至70%以下之前对{D/BT_WG_REVERSE_HEAL}免疫。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={KsaiALTeams.ksaiAL} defaultStage="Team 1 – Reliable Clear" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="-jEcneW-N3Y" title="科赛 - 冒险许可证 - 第10关 - 1次通关 (自动)" author="XuRenChao" date="15/09/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import DahliaALTeamsData from './DahliaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const DahliaALTeams = DahliaALTeamsData as Record<string, TeamData>

export default function DahliaGuide() {
    return (
        <GuideTemplate
            title="达利娅 冒险执照指南"
            introduction="达利娅有25回合限制。除非你的队伍能稳定每回合造成39,296~58,945点伤害，否则使用{D/BT_DOT_2000092}或{D/BT_DOT_BURN}的DoT是最可靠的攻略方式。单次攻击所受伤害上限为最大生命值的6%。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Dahlia' modeKey='Challenge' defaultBossId='50000010' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "单次攻击所受伤害上限为最大生命值的6%。",
                                    "受到暴击时，以S1进行反击。",
                                    "Boss免疫{D/BT_DOT_CURSE}和{D/BT_FIXED_DAMAGE}，使用{D/BT_DOT_2000092}或{D/BT_DOT_BURN}绕过伤害上限。",
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DahliaALTeams.dahliaAL} defaultStage="G.Beth Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="iOvGnQDYaCE"
                                title="达利娅 - 冒险执照：晋升挑战"
                                author="XuRenChao"
                                date="25/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

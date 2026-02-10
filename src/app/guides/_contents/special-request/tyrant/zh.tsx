'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import TyrantTeamsData from './Tyrant.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const TyrantTeams = TyrantTeamsData as Record<string, TeamData>

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="暴君特殊委托攻略指南"
            introduction="暴君幼崽的核心在于快速净化减益。进入战斗时会立即叠加{D/BT_DOT_POISON}、{D/BT_DOT_BLEED}和{D/BT_DOT_LIGHTNING}，如果不立即净化会非常快地被击杀。拥有AoE净化的角色是必需的。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Tyrant Toddler' modeKey='Special Request: Ecology Study' defaultBossId='401400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "进入战斗时，你的队伍和BOSS都会立即叠加{D/BT_DOT_POISON}、{D/BT_DOT_BLEED}和{D/BT_DOT_LIGHTNING}。",
                                "如果不立即净化，这些持续伤害会非常快地击杀你。",
                                "Viella和Dianne的S3可以净化所有减益的全部持续时间，使这个BOSS变得简单。",
                                "仅受到爆发技能、协同攻击和连锁技能的WG伤害。",
                                "{C/Healer}和{C/Defender}队友获得+50%速度，并根据防御力增加伤害。",
                                "第12阶段：{C/Healer}和{C/Defender}速度增加50%，伤害按防御力计算。其他所有职业伤害减少95%。",
                                "第13阶段：完全降低暴击率，{C/Defender}以外所有职业伤害减少95%。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={TyrantTeams.tyrantSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="n9-IcrXHyBA" title="暴君战斗录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}

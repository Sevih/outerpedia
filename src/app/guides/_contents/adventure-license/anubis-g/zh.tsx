'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AnubisALTeamsData from './AnubisAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'

const AnubisALTeams = AnubisALTeamsData as Record<string, TeamData>

export default function AnubisGuardianGuide() {
    return (
        <GuideTemplate
            title="阿努比斯守护者 冒险执照攻略指南"
            introduction="阿努比斯守护者具有独特的机制，包括每回合复活小怪、延长自身所有增益和减益效果，以及需要火属性单位才能造成最佳伤害。非火属性单位会移除BOSS的所有减益效果，并且WG伤害减半。BOSS在50%血量时进入狂暴状态，3回合后造成致命伤害。使用合适的火属性队伍通常可在1-2次尝试内通关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey="Iota World's Giant God Soldier" modeKey='Adventure License' defaultBossId='51000031' />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Sand Soldier Khopesh', defaultBossId: '51000032' },
                                    { bossKey: 'Sand Soldier Spear', defaultBossId: '51000033' }
                                ]}
                                modeKey={['Weekly Conquest - Anubis Guardian']}
                                defaultModeKey='Weekly Conquest - Anubis Guardian'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "只使用{E/Fire}单位。非火属性单位会移除BOSS的所有减益效果，并且WG伤害减少50%。",
                                    "BOSS在攻击后每回合复活所有小怪。将伤害集中在BOSS身上，而不是小怪。",
                                    "BOSS身上的所有增益和减益效果在每回合开始时延长1回合。{D/BT_DOT_BURN}叠加非常有效。",
                                    "当只有BOSS存活时不会造成WG伤害——你必须至少保留一只小怪存活。",
                                    "在50%血量时，BOSS进入狂暴状态，3回合后造成致命伤害。快速推进。",
                                    "你的队伍暴击率降为0%——不要依赖暴击流。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AnubisALTeams.anubisAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="fU0UUuHswKM"
                                title="Anubis Guardian - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="22/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

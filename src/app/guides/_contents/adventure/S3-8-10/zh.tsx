'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbominationHunterBelialGuide() {
    return (
        <GuideTemplate
            title="憎恶猎手贝利尔攻略指南"
            introduction="憎恶猎手贝利尔是一个毁灭性的Boss，会引爆燃烧减益造成大量伤害。他在战斗开始时立即引爆燃烧，每回合对非防御者施加燃烧，并在狂暴时处决整个队伍。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abomination Hunter Belial'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114005'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "带{B/BT_SHIELD_BASED_CASTER}和/或{B/BT_INVINCIBLE}来应对{D/BT_DOT_BURN}（确保在第二场战斗结束时施加）。",
                                "带{B/BT_IMMUNE}来在第一次{D/BT_IMMEDIATELY_2000092}后阻挡{D/BT_DOT_BURN}。",
                                "带{B/BT_RESURRECTION}来从第一次{D/BT_IMMEDIATELY_2000092}后的死亡中恢复。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                        </>
                    ),
                },
            }}
        />
    )
}

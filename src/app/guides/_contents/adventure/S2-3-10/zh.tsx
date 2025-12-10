'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="神圣守护者攻略指南"
            introduction="神圣守护者是一个危险的Boss，会用S3处决攻击力最高的英雄，并每5回合进入狂暴状态。Boss在狂暴时只受弱点伤害，因此时机和控制至关重要。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Boss没有免疫，所以携带硬控如{D/BT_STUN} {D/BT_FREEZE} {D/BT_STONE} {D/BT_COOL_CHARGE} {D/BT_SILENCE}。",
                                "携带{B/BT_RESURRECTION}也有帮助。",
                                "{D/BT_ACTION_GAUGE} {B/BT_ACTION_GAUGE} {D/BT_STAT|ST_SPEED} {B/BT_STAT|ST_SPEED}可以阻止Boss行动过多次并进入狂暴。",
                                "在Boss狂暴前保留连锁点数。",
                                "你可以尝试用{D/BT_FIXED_DAMAGE}连锁攻击快速击杀。"
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

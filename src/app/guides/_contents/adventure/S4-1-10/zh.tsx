'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

export default function NellaGuide() {
    return (
        <GuideTemplate
            title="三声啼哭 攻略指南"
            introduction="三声啼哭是一个防御型Boss，在没有弱化效果的情况下几乎无敌。您的队伍必须保持持续的增益效果以防止无法解除的{D/BT_DOT_BURN_IR}，同时施加{D/BT_FREEZE}来绕过其伤害减免并完成连锁攻击爆发。Boss在受击时会快速获得行动条，并且每回合都会清除弱化效果，因此精确的时机把握至关重要。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Three Cries'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114006'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "在对Boss释放之前尽可能积累更多的连锁点数",
                                "在其S2/S3攻击前准备好增益效果以防止{D/BT_DOT_BURN}",
                                "在发动所有连锁攻击并打破Boss前先施加{D/BT_FREEZE}",
                                "调整队伍速度，使所有单位在开始连锁攻击前达到100%优先级。这可以防止Boss尽管从受击中获得行动条仍能插入行动（每次受击获得20%）",
                                "{I-T/Sage's Charm} +10如果由连锁中的最后一个单位装备，可使连锁攻击伤害增加50%",
                                "避免使用{E/Light}和{E/Dark}单位以防止Boss清除自身弱化效果"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="i2ok2KIpvsQ"
                                title="Three Cries - Story Hard 4-1-10 clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="13/01/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}

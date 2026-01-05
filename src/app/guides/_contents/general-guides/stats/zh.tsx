'use client'

// ============================================================================
// IMPORTS
// ============================================================================
import { useState } from 'react'

// Components
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import StatInlineTag from '@/app/components/StatInlineTag'
import Accordion from '@/app/components/ui/Accordion'
import StatCard, { StatGroup } from '@/app/components/guides/StatCard'
import SkillInline from '@/app/components/SkillInline'
import GuideIconInline from '@/app/components/GuideIconInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ClassInlineTag from '@/app/components/ClassInlineTag'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BasicStatsGuide() {
    const [selected, setSelected] = useState<'stats' | 'combat' | 'faq'>('stats')

    const tabs = [
        { key: 'stats' as const, label: '基础属性' },
        { key: 'combat' as const, label: '战斗基础' },
        { key: 'faq' as const, label: '常见问题' }
    ]

    const content = {
        stats: <StatsContent />,
        combat: <CombatBasicsContent />,
        faq: <FAQContent />
    }

    return (
        <div className="guide-content">
            {/* 主标题 */}
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-sky-400 border-l-4 border-sky-500 pl-4">
                属性 & 战斗机制
            </h2>

            {/* 介绍 */}
            <p className="text-neutral-300 mb-6 leading-relaxed">
                这是一份关于Outerplane属性和战斗机制的综合指南。
            </p>

            {/* 标签页 */}
            <div className="flex justify-center mb-6 mt-4">
                <AnimatedTabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={setSelected}
                    pillColor="#0ea5e9"
                    scrollable={false}
                />
            </div>

            {/* 内容 */}
            <section className="guide-version-content mt-6">
                {content[selected]}
            </section>
        </div>
    )
}

// ============================================================================
// STATS CONTENT
// ============================================================================

function StatsContent() {
    return (
        <div className="space-y-8">
            <GuideHeading level={2}>核心属性</GuideHeading>

            {/* 攻击属性 */}
            <StatGroup title="攻击属性" color="red">
                <StatCard
                    abbr="ATK"
                    desc="攻击力越高，对敌人造成的伤害越大。"
                    effect={{
                        buff: ["BT_STAT|ST_ATK"],
                        debuff: ["BT_STAT|ST_ATK"]
                    }}
                    details={
                        <>
                            <p>攻击力直接增加技能的基础伤害。但部分技能依赖其他属性或完全忽略攻击力。</p>
                            <p className="mt-2">部分持续伤害(DoT)受攻击力影响：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                <li><EffectInlineTag name="BT_DOT_BLEED" type="debuff" /></li>
                                <li><EffectInlineTag name="BT_DOT_POISON" type="debuff" /></li>
                                <li><EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /></li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="CHC"
                    desc="触发暴击的概率。暴击时根据暴击伤害增加伤害。"
                    effect={{
                        buff: ["BT_STAT|ST_CRITICAL_RATE"],
                        debuff: ["BT_STAT|ST_CRITICAL_RATE"]
                    }}
                    details={
                        <>
                            <p>默认情况下，大多数角色的基础暴击率较低，需要通过装备、增益、特性和被动来提升。当暴击率达到100%时，所有适用的攻击都会暴击。</p>
                            <p className="mt-3 font-semibold">重要事项：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>暴击率上限为100%，超出部分无效。</li>
                                <li>治疗和护盾不会暴击。</li>
                                <li>带有<EffectInlineTag name="HEAVY_STRIKE" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />效果的技能（如<SkillInline character="Kitsune of Eternity Tamamo-no-Mae" skill="S1" />）不会暴击。</li>
                                <li>持续伤害效果不会暴击。</li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="CHD"
                    desc="暴击命中时的伤害增幅。"
                    effect={{
                        buff: ["BT_STAT|ST_CRITICAL_DMG_RATE"],
                        debuff: ["BT_STAT|ST_CRITICAL_DMG_RATE"]
                    }}
                    details={
                        <>
                            <p>暴击伤害决定暴击命中时的额外伤害。计算公式通常是基础伤害乘以暴击伤害百分比。</p>
                            <p className="mt-2">所有单位的基础暴击伤害为<strong>150%</strong>。</p>
                            <p className="mt-2 text-yellow-400">如果暴击率较低，投资暴击伤害的价值不大。</p>
                        </>
                    }
                />

                <StatCard
                    abbr="PEN"
                    desc="穿透可以忽略目标部分防御力。"
                    effect={{
                        buff: ["BT_STAT|ST_PIERCE_POWER_RATE"],
                        debuff: ["BT_STAT|ST_PIERCE_POWER_RATE"]
                    }}
                    details={
                        <>
                            <p>穿透在伤害计算时忽略敌人防御力(DEF)的一定百分比。穿透越高，DEF在伤害减免计算中的影响越小。</p>
                            <p className="mt-2">例如，目标有<strong>2000 DEF</strong>，你有<strong>20%穿透</strong>，则视为目标只有<strong>1600 DEF</strong>。</p>
                            <p className="mt-2">穿透对高DEF的坦克型敌人更有效。</p>
                            <p className="mt-3 text-sm text-yellow-400">
                                <strong>注意：</strong>如果敌人防御力为0（如联合作战），穿透将毫无意义。
                            </p>
                        </>
                    }
                />
            </StatGroup>

            {/* 防御属性 */}
            <StatGroup title="防御属性" color="blue">
                <StatCard
                    abbr="HP"
                    desc="生命值降至0以下时无法继续战斗。"
                    details={
                        <>
                            <p>生命值代表单位在倒下前能承受的总伤害量。HP归零时立即退出战斗。</p>
                            <p className="mt-2">与攻击力类似，部分技能依赖HP（如<SkillInline character="Demiurge Drakhan" skill="S1" />）。</p>
                            <p className="mt-3">可以通过治疗技能恢复HP，并用以下增益保护：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li><EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /></li>
                                <li><EffectInlineTag name="BT_INVINCIBLE" type="buff" /></li>
                                <li><EffectInlineTag name="BT_UNDEAD" type="buff" /></li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="DEF"
                    desc="防御力越高，受到的伤害越少。"
                    effect={{
                        buff: ["BT_STAT|ST_DEF"],
                        debuff: ["BT_STAT|ST_DEF"]
                    }}
                    details={
                        <>
                            <p>防御力减少大部分来源的伤害。部分技能依赖防御力（如<SkillInline character="Caren" skill="S3" />）。</p>
                            <p className="mt-3">但部分游戏机制可以部分或完全忽略DEF：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                <li><EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="buff" /></li>
                                <li><EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /></li>
                            </ul>
                        </>
                    }
                />
            </StatGroup>

            {/* 功能属性 */}
            <StatGroup title="功能属性" color="green">
                <StatCard
                    abbr="SPD"
                    desc="速度越高，行动越频繁。"
                    effect={{
                        buff: ["BT_STAT|ST_SPEED"],
                        debuff: ["BT_STAT|ST_SPEED"]
                    }}
                    details={
                        <>
                            <p>速度决定单位多快轮到行动。SPD越高，战斗中行动越频繁。</p>
                            <p className="mt-2">与攻击力类似，部分技能依赖SPD（如<SkillInline character="Stella" skill="S2" />）。</p>
                            <p className="mt-3 text-yellow-400">速度与&quot;行动值&quot;概念直接相关，详见<strong>战斗基础</strong>部分。</p>
                        </>
                    }
                />
            </StatGroup>

            {/* 命中 & 闪避 */}
            <StatGroup title="命中 & 闪避" color="purple">
                <StatCard
                    abbr="ACC"
                    desc="增加攻击成功命中敌人的概率。"
                    effect={{
                        buff: ["BT_STAT|ST_ACCURACY"],
                        debuff: ["BT_STAT|ST_ACCURACY"]
                    }}
                    details={
                        <>
                            <p>当命中高于目标闪避时，攻击100%命中。</p>
                            <p className="mt-3 font-semibold">重要事项：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>被<StatInlineTag name="EVA" />对抗。</li>
                                <li>未命中时伤害-50%，且不会暴击。</li>
                                <li>特定内容（如Boss或PvP）可能需要高命中。</li>
                                <li>部分技能在命中前施加减益，绕过命中/闪避检定。</li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="EVA"
                    desc="增加闪避敌人攻击的概率。未命中的攻击伤害-50%，且不会暴击。"
                    effect={{
                        buff: ["BT_STAT|ST_AVOID"],
                        debuff: ["BT_STAT|ST_AVOID"]
                    }}
                    details={
                        <>
                            <p>被<StatInlineTag name="ACC" />对抗的闪避增加躲避敌人攻击的概率。闪避率上限为<strong>25%</strong>，当闪避比敌人命中高<strong>+40</strong>以上时达到。</p>
                            <p className="mt-3 font-semibold">未命中时：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>伤害减少50%</li>
                                <li>不会暴击</li>
                                <li>不会施加减益</li>
                            </ul>
                        </>
                    }
                />
            </StatGroup>

            {/* 效果命中 & 效果抵抗 */}
            <StatGroup title="效果命中 & 效果抵抗" color="amber">
                <StatCard
                    abbr="EFF"
                    desc="效果命中越高，目标抵抗减益的概率越低。"
                    effect={{
                        buff: ["BT_STAT|ST_BUFF_CHANCE"],
                        debuff: ["BT_STAT|ST_BUFF_CHANCE"]
                    }}
                    details={
                        <>
                            <p>效果命中增加成功施加减益的概率，被<StatInlineTag name="RES" />对抗。</p>
                            <p className="mt-2">当效果命中大于等于敌人效果抵抗时，减益施加基础概率为100%。</p>
                            <p className="mt-2">部分技能依赖效果命中（如<CharacterLinkCard name="Gnosis Beth" icon={false} />的<EffectInlineTag name="BT_DOT_2000092" type="debuff" />）。</p>
                        </>
                    }
                />

                <StatCard
                    abbr="RES"
                    desc="效果抵抗越高，抵抗减益的概率越高。"
                    effect={{
                        buff: ["BT_STAT|ST_BUFF_RESIST"],
                        debuff: ["BT_STAT|ST_BUFF_RESIST"]
                    }}
                    details={
                        <>
                            <p>效果抵抗降低被施加减益的概率，被<StatInlineTag name="EFF" />对抗。<EffectInlineTag name="BT_IMMUNE" type="buff" />增益可使你免疫减益。</p>
                            <p className="mt-3">当效果抵抗高于敌人效果命中时：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>RES − EFF = 0 → 100%概率</li>
                                <li>RES − EFF = 100 → 50%</li>
                                <li>RES − EFF = 300 → 25%</li>
                                <li>RES − EFF = 900 → 10%</li>
                            </ul>
                            <p className="mt-3 text-yellow-400">注意：部分技能绕过效果抵抗检定（如<SkillInline character="Drakhan" skill="S2" />）。</p>
                        </>
                    }
                />
            </StatGroup>
        </div>
    )
}

// ============================================================================
// FAQ CONTENT
// ============================================================================

function FAQContent() {
    return (
        <div className="space-y-8">
            {/* 暴击 & DoT */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-red-400">暴击 & DoT</h4>
                <Accordion
                    items={[
                        {
                            key: 'crit-cap',
                            title: '暴击率可以超过100%吗？',
                            content: '不可以。暴击率上限为100%。超出部分无效。'
                        },
                        {
                            key: 'crit-on-heal',
                            title: '治疗或护盾可以暴击吗？',
                            content: '不可以。治疗、护盾和辅助技能除非特别说明，否则不会暴击。暴击机制仅适用于伤害技能。'
                        },
                        {
                            key: 'dot-crit',
                            title: 'DoT受暴击率或暴击伤害影响吗？',
                            content: '不受。持续伤害效果（如燃烧、流血、中毒等）不受暴击率或暴击伤害影响。它们不会暴击。'
                        },
                        {
                            key: 'dot-scaling',
                            title: 'DoT受攻击力影响吗？',
                            content: '是的。部分DoT依赖施放者的攻击力，但系数比直接伤害低。'
                        },
                        {
                            key: 'pen-vs-dots',
                            title: '穿透影响DoT或固定伤害吗？',
                            content: (
                                <>
                                    <p>取决于DoT类型。被DEF减免的DoT受穿透加成：</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li><EffectInlineTag name="BT_DOT_BLEED" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_POISON" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /></li>
                                    </ul>
                                    <p className="mt-3">但部分DoT完全忽略DEF，不受穿透影响：</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_2000092" type="debuff" /></li>
                                    </ul>
                                    <p className="mt-3">固定伤害始终忽略DEF，不受穿透影响。</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 命中、未命中 & 减益施加 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400">命中、未命中 & 减益施加</h4>
                <Accordion
                    items={[
                        {
                            key: 'acc-vs-eva',
                            title: '命中 vs 闪避如何运作？',
                            content: '比较你的ACC和敌人的EVA。ACC更高则100%命中。更低则根据差值增加未命中概率。'
                        },
                        {
                            key: 'acc-vs-eff',
                            title: '命中和效果命中有什么区别？',
                            content: '命中决定攻击对闪避的成功率（攻击是否命中？），效果命中决定减益对效果抵抗的成功率。'
                        },
                        {
                            key: 'debuff-on-miss',
                            title: '攻击未命中时会施加减益吗？',
                            content: '不会。被闪避时不会施加减益。但部分特殊技能在命中前或独立施加减益。'
                        },
                        {
                            key: 'guaranteed-debuffs',
                            title: '有技能即使未命中也能施加减益吗？',
                            content: '有。部分技能在造成伤害前或不依赖命中检定施加减益。通常在技能描述中会说明。'
                        },
                        {
                            key: 'eff-res-formula',
                            title: '减益成功率有最低值吗？',
                            content: '没有。成功率取决于攻击者的效果命中(EFF)和目标的效果抵抗(RES)之差。EFF ≥ RES时100%成功。否则根据RES超过EFF的量递减。例如，RES − EFF差值为300时只有25%，900时只有10%。'
                        }
                    ]}
                />
            </div>

            {/* 防御 & 穿透 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-blue-400">防御 & 穿透</h4>
                <Accordion
                    items={[
                        {
                            key: 'pen-vs-high-def',
                            title: '穿透对高DEF更有效吗？',
                            content: '是的。敌人DEF越高，穿透带来的伤害增幅越大。因为它减少了伤害公式中的有效DEF。'
                        },
                        {
                            key: 'fixed-damage-mitigation',
                            title: '防御力能减免固定伤害吗？',
                            content: '不能。固定伤害忽略DEF。只能用护盾或无敌来阻挡。'
                        }
                    ]}
                />
            </div>

            {/* 属性依赖 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-green-400">属性依赖</h4>
                <Accordion
                    items={[
                        {
                            key: 'dual-scaling',
                            title: '技能可以依赖多个属性吗？',
                            content: (
                                <>
                                    <p>严格来说不能。Outerplane目前没有均匀使用两个属性的技能（如50% ATK + 50% HP）。所谓的&quot;双重依赖&quot;实际上是<strong>次要依赖</strong>——主属性（通常是ATK）加上HP、SPD、EVA等的次要加成。</p>
                                    <p className="mt-2">例如，部分技能以ATK为主，并从施放者的最大HP或速度获得加成。<SkillInline character="Regina" skill="S3" />包含闪避的轻微依赖，<CharacterLinkCard name="Demiurge Stella" icon={false} />有HP的部分依赖。</p>
                                    <p className="mt-2">这些次要依赖通常较小，不应成为装备配置的重点。也有技能完全依赖ATK以外的属性（如基于HP或DEF的伤害）。</p>
                                </>
                            )
                        },
                        {
                            key: 'stat-scaling',
                            title: '如何知道技能使用什么属性？',
                            content: (
                                <>
                                    <p>如果没有提及，通常默认依赖ATK。</p>
                                    <p className="mt-2">如果使用其他属性，会有类似描述：</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li>&quot;造成的伤害根据最大生命值<strong>而非</strong>攻击力增加。&quot;</li>
                                        <li>&quot;造成的伤害根据最大生命值增加。&quot;（在ATK基础上）</li>
                                    </ul>
                                    <p className="mt-2">措辞很重要：&quot;而非&quot;表示替代ATK依赖，没有则表示额外依赖。</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 速度 & 行动值 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-cyan-400">速度 & 行动值</h4>
                <Accordion
                    items={[
                        {
                            key: 'speed-formula',
                            title: '速度如何计算？',
                            content: (
                                <>
                                    <p><strong>Outerplane</strong>速度计算基础公式：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        SPD = 基础SPD + 装备SPD + (基础SPD × 套装效果%)
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>基础SPD：</strong>角色固有的未修正速度。</li>
                                        <li><strong>装备SPD：</strong>装备提供的固定速度。</li>
                                        <li>
                                            <strong>套装效果：</strong>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                <li>无速度套装 = 0</li>
                                                <li>2件速度套装 = 0.12 (12%)</li>
                                                <li>4件速度套装 = 0.25 (25%)</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'priority-formula',
                            title: '第1回合行动值如何计算？',
                            content: (
                                <>
                                    <p>战斗开始时的初始行动值计算公式：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        行动值 = (SPD + 友方速度超越加成 + (SPD × 增益%)) × 100 / (最高SPD + 最高SPD队友方速度超越加成 + (最高SPD × 增益%))
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>SPD：</strong>单位的总速度（如上计算）。</li>
                                        <li><strong>最高SPD：</strong>所有单位中最高的SPD（作为除数）。</li>
                                        <li><strong>友方速度超越加成：</strong>从超越获得的速度。</li>
                                        <li>
                                            <strong>增益：</strong>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                <li>无速度增益 = 0</li>
                                                <li>速度增益 = 0.3 (30%)</li>
                                                <li>速度减益 = -0.3 (-30%)</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'max-speed',
                            title: '理论最大速度',
                            content: (
                                <>
                                    <p>理论最大速度：</p>
                                    <ul className="list-disc list-inside mt-2">
                                        <li><strong>基础速度：</strong><ClassInlineTag name="Ranger" />的154</li>
                                        <li><strong>装备SPD：</strong>138（每部位18 + 饰品48）</li>
                                        <li><strong>套装SPD：</strong>38（基于154角色）</li>
                                        <li><strong>友方速度超越加成：</strong>30（<CharacterLinkCard name="Dianne" icon={false} /> + <CharacterLinkCard name="Mene" icon={false} /> + <CharacterLinkCard name="Demiurge Delta" icon={false} />）</li>
                                    </ul>
                                    <p className="mt-3">总计：<strong>360</strong>（带速度增益时468）</p>
                                    <p className="mt-2"><CharacterLinkCard name="Ryu Lion" icon={false} />的4星超越加成可进一步提升：<strong>370</strong>（带速度增益时481）</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 公式 & 计算 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-amber-400">公式 & 计算</h4>
                <Accordion
                    items={[
                        {
                            key: 'formula',
                            title: '计算方法',
                            content: (
                                <>
                                    <p>以下公式和说明由<strong>Enebe-NB</strong>收集和测试。这是对Outerplane战斗公式的出色分析工作。</p>
                                    <p className="mt-2">
                                        完整参考：{' '}
                                        <a
                                            href="https://docs.google.com/spreadsheets/d/10Sl_b7n7_j-PxkNxYGZEvu7HvrJNyRYDSyyYLcUwDOU/edit?gid=938189457#gid=938189457"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 underline"
                                        >
                                            [Google Sheet - Outerplane Analysis by Enebe-NB]
                                        </a>
                                    </p>

                                    <h4 className="font-semibold mt-4">防御减免</h4>
                                    <p><strong>公式：</strong> <code>f(DEF) = 1000 / (1000 + DEF)</code></p>
                                    <p className="mt-2">此公式决定防御力的伤害减免量。DEF增加时，额外点数的效果递减（收益递减）。</p>
                                    <p className="mt-2">有效生命值(EHP)可由此推导：</p>
                                    <p className="mt-1"><strong>有效HP：</strong> <code>EHP = HP + (HP × DEF / 1000)</code></p>

                                    <h4 className="font-semibold mt-4">命中 vs 闪避</h4>
                                    <p>如果<code>EVA - ACC ≤ 0</code>，闪避概率 = 0%。</p>
                                    <p className="mt-2">否则：</p>
                                    <p className="mt-1"><strong>公式：</strong> <code>概率 = min(25%, 1000 / (100 + (EVA - ACC)))</code></p>
                                    <p className="mt-2">这意味着当EVA超过敌人ACC 40以上时，闪避率固定在25%。超过此值的EVA不影响未命中概率。</p>

                                    <h4 className="font-semibold mt-4">效果命中 vs 效果抵抗</h4>
                                    <p>如果<code>EFF ≥ RES</code>，减益成功概率为100%。</p>
                                    <p className="mt-2">否则，减益施加概率计算如下：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        成功概率 = 100 / (100 + (RES − EFF))
                                    </p>
                                </>
                            )
                        },
                        {
                            key: 'damage-formula',
                            title: 'Outerplane的完整伤害公式是什么？',
                            content: (
                                <>
                                    <p>Outerplane中计算技能伤害的基础公式：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        伤害 = 属性 × 技能 × ATK × 修正 × (1000 / (1000 + (1 − PEN%) × DEF))
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>属性</strong>：0.8（克制）、1（中立）、1.2（被克制）</li>
                                        <li><strong>技能</strong>：技能倍率</li>
                                        <li><strong>ATK</strong>：单位的主要依赖属性（根据技能/角色可能是HP、DEF等）</li>
                                        <li><strong>修正</strong>：包括暴击伤害、额外伤害%、次要依赖（HP、闪避等）、爆发伤害效果</li>
                                        <li><strong>PEN%</strong>：穿透</li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-4">
                                        来源：{' '}
                                        <a
                                            href="https://discord.com/channels/1264787916660670605/1264811556059873312/1265103204128133191"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-400"
                                        >
                                            Fabool on EvaMains Discord（2024年7月23日）
                                        </a>
                                    </p>
                                </>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    )
}

// ============================================================================
// COMBAT BASICS CONTENT
// ============================================================================

function CombatBasicsContent() {
    return (
        <div className="space-y-12">
            {/* 行动值系统 */}
            <section className="space-y-6">
                <GuideHeading level={2}>回合制行动值系统</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>
                        把<strong>Outerplane</strong>的每场战斗想象成100米环形跑道。
                        每个角色（友方和敌方）都在这条跑道上奔跑。
                        第一个跑完一圈（100%）到达行动线的人<strong>获得回合</strong>。
                    </p>
                    <p>
                        在游戏中，点击回合顺序图标<GuideIconInline name="IG_Menu_Btn_Action" text="" />可以看到这个进度以<strong>百分比</strong>显示：
                    </p>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>0%</strong> = 起跑线</li>
                        <li><strong>100%</strong> = 行动线 — 获得回合</li>
                    </ul>
                </div>

                <Accordion
                    items={[
                        {
                            key: 'speed',
                            title: <><StatInlineTag name='SPD' /></>,
                            content: (
                                <>
                                    <p>把<StatInlineTag name='SPD' />想象成角色的奔跑速度——决定在跑道上前进多快的属性。</p>
                                    <ul className="list-disc list-inside ml-4 mt-3">
                                        <li><StatInlineTag name='SPD' />越高，越快到达100%。</li>
                                        <li>200 <StatInlineTag name='SPD' />的角色移动速度是100的两倍。</li>
                                        <li>这意味着一方行动1次时，另一方可以行动2次。</li>
                                    </ul>
                                    <p className="mt-3">这不是固定回合顺序系统——而是连续流动。角色一到达100%就立即行动。</p>
                                </>
                            )
                        },
                        {
                            key: 'priority',
                            title: <><span className='text-amber-400'>行动值</span></>,
                            content: (
                                <>
                                    <p>部分技能或效果可以改变你在跑道上的<strong>当前位置</strong>，与速度无关。想象角色在跑道上向前或向后瞬移。</p>
                                    <p className="mt-2">这称为<strong><span className='text-amber-400'>行动值</span>增加或减少</strong>。</p>
                                    <p className="mt-2">其他游戏也有类似系统——Epic Seven的战斗准备或Summoner&apos;s War的ATB槽等。</p>

                                    <p className="text-sm text-yellow-400 mt-4">
                                        行动值没有官方游戏内图标。但本网站使用此图标：<span style={{ filter: 'grayscale(1)' }}><GuideIconInline name="SC_Buff_Effect_Increase_Priority" text="" /></span>。
                                    </p>

                                    <p className="mt-4">直接相关的效果：</p>
                                    <p className="mt-2"><span className="text-sky-400">有益</span>：<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> — 将角色向前推。</p>
                                    <p className="mt-1"><span className="text-red-400">有害</span>：<EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> — 将角色向后推。</p>

                                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                                        <p className="font-semibold text-yellow-400">重要事项：</p>
                                        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                                            <li>行动值不会超过100%或低于0%。</li>
                                            <li>多个角色在不同时间到达100%时，先到的先行动。这是最常见的情况。</li>
                                            <li>但多个角色在<strong>同一行动内</strong>到达100%时（如通过大量+行动值提升），行动顺序基于固定位置优先级：<strong>右前 → 上 → 下 → 左后</strong></li>
                                            <li>此位置规则仅在多个角色被同时推到100%时使用。</li>
                                            <li>⚠️ <strong>100%之后</strong>施加的额外行动值提升被忽略，不影响回合顺序。</li>
                                            <li>在这种情况下，行动方总是先行动，然后是敌方——各自按上述位置规则解决平局。</li>
                                        </ul>
                                    </div>
                                </>
                            )
                        }
                    ]}
                />
            </section>

            {/* 回合流程 */}
            <section className="space-y-6">
                <GuideHeading level={2}>回合流程详解</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>角色到达100%行动值时，回合分为多个阶段进行。每个阶段发生特定事件：</p>

                    <div className="space-y-6 mt-6">
                        {/* 开始阶段 */}
                        <div className="border-l-4 border-green-500 pl-4">
                            <h4 className="text-lg font-bold text-green-400">1. 开始阶段</h4>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>所有技能冷却减少1。</li>
                                <li>持续治疗(HoT)效果生效（如<EffectInlineTag name="BT_CONTINU_HEAL" type="buff" />）</li>
                                <li>持续伤害(DoT)效果生效（如<EffectInlineTag name="BT_DOT_BLEED" type="debuff" />）</li>
                            </ul>
                        </div>

                        {/* 行动阶段 */}
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="text-lg font-bold text-blue-400">2. 行动阶段</h4>
                            <p className="mt-2 text-yellow-400">如果受到<EffectInlineTag name="BT_STUN" type="debuff" />等行动阻止效果，此阶段跳过，回合直接进入结束阶段。</p>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <h5 className="font-semibold text-blue-300">2-1：选择阶段</h5>
                                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                        <li>强制行动优先解决（如<EffectInlineTag name="BT_AGGRO" type="debuff" />），立即开始命中阶段。</li>
                                        <li>之后，玩家选择技能和目标。</li>
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-blue-300">2-2：命中阶段</h5>
                                    <div className="ml-4 mt-2 space-y-3">
                                        <div>
                                            <p className="font-medium">技能分三个阶段执行：</p>
                                            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                                                <li>
                                                    <strong>命中前：</strong>技能命中前发生。例如，<SkillInline character="Drakhan" skill="S3" />的EE+10在命中前施加<EffectInlineTag name="BT_DOT_CURSE" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />——这很重要，因为技能伤害取决于减益数量。
                                                </li>
                                                <li>
                                                    <strong>命中：</strong>技能连接——直接伤害和治疗生效。
                                                </li>
                                                <li>
                                                    <strong>命中后：</strong>技能命中后发生——例如，<SkillInline character="Demiurge Vlada" skill="S3" />在命中后施加<EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />。
                                                </li>
                                            </ul>
                                        </div>
                                        <p>追加攻击触发（如<SkillInline character="Ryu Lion" skill="S2" />）。</p>
                                        <p>友方反应（如<SkillInline character="Caren" skill="S2" />）也可能触发。这些后续效果按位置顺序解决：<strong>右前 → 上 → 下 → 左后</strong>。</p>
                                        <p>敌方反应（<EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />、<EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" />、<EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />等）也可能发生，遵循相同位置顺序。</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 结束阶段 */}
                        <div className="border-l-4 border-purple-500 pl-4">
                            <h4 className="text-lg font-bold text-purple-400">3. 结束阶段</h4>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>复活效果解决（如<EffectInlineTag name="BT_REVIVAL" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />或<SkillInline character="Demiurge Astei" skill="S2" />）。</li>
                                <li>所有剩余增益和减益的持续时间减少1回合——开始阶段已处理的除外。</li>
                                <li>剩余行动值增减生效。</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 第1回合计算 */}
            <section className="space-y-6">
                <GuideHeading level={2}>第1回合计算</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>战斗开始时，<StatInlineTag name="SPD" />最高的单位先行动。所有其他单位的初始行动值与最快单位的SPD成比例。</p>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-blue-300">示例：</p>
                        <ul className="list-disc list-inside ml-4 mt-2">
                            <li>最快单位<strong>300 SPD</strong>以<strong>100%</strong>行动值开始。</li>
                            <li><strong>200 SPD</strong>单位以<strong>66%</strong>开始（200 × 100 / 300）。</li>
                            <li><strong>150 SPD</strong>单位以<strong>50%</strong>开始（150 × 100 / 300）。</li>
                        </ul>
                    </div>

                    <p className="mt-4">但游戏有一个隐藏的<strong>0-5%</strong>随机波动应用于每个单位的初始行动值。因此，稍慢的单位可能先行动。</p>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-yellow-400">带RNG的示例：</p>
                        <p className="mt-2">单位A：300 SPD → 100% +0% = 100%</p>
                        <p>单位B：290 SPD → 96% + 5% = 101%</p>
                        <p className="mt-2">→ <strong>单位B先行动。</strong></p>
                    </div>

                    <p className="mt-4">此机制在<strong>PvP</strong>中特别重要，第1回合可能决定比赛结果。</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-sky-300">战斗开始时的速度增益</h4>
                    <p>部分单位带<EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />开始战斗，可以显著改变回合顺序。</p>

                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-purple-300">示例：</p>
                        <p className="mt-2"><CharacterLinkCard name="Tamara" icon={false} />：300 SPD → 100%行动值</p>
                        <p><CharacterLinkCard name="Dahlia" icon={false} />：280 SPD → 93%（280 × 100 / 300）</p>
                        <p className="mt-2">通常<CharacterLinkCard name="Tamara" icon={false} />先行动。</p>
                        <p className="mt-2">但如果<CharacterLinkCard name="Dahlia" icon={false} />带<EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />开始（如从EE），有效SPD为：</p>
                        <p>280 × 1.3 = 364 → 100%行动值</p>
                        <p><CharacterLinkCard name="Tamara" icon={false} />：300 SPD → <strong>82%</strong>（300 × 100 / 364）</p>
                        <p className="mt-2">→ <strong><CharacterLinkCard name="Dahlia" icon={false} />先行动。</strong></p>
                    </div>

                    <p className="mt-4">部分超越特权为全队提供<StatInlineTag name="SPD" />加成（如<CharacterLinkCard name="Mene" />或<CharacterLinkCard name="Demiurge Delta" />）。</p>
                </div>
            </section>

            {/* 例外 */}
            <section className="space-y-6">
                <GuideHeading level={2}>特殊机制 & 例外</GuideHeading>

                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">额外回合</h4>
                        <p>当技能施加<EffectInlineTag name="BT_ADDITIVE_TURN" type="buff" />时，角色在行动值重置为0%前立即获得完整回合（包括所有阶段）。</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">造物主弗拉达的被动</h4>
                        <p>当5★<CharacterLinkCard name="Demiurge Vlada" />在战斗中时，敌方队伍所有<strong>行动值增加效果</strong>减少<strong>50%</strong>。</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">竞技场场地技能</h4>
                        <p>竞技场有两个场地技能生效：</p>
                        <ul className="list-disc list-inside ml-4 mt-3 space-y-2">
                            <li>
                                <GuideIconInline name="Skill_PVP_LeagueBuff_01" text="强者的心跳" /> <strong>强者的心跳</strong>：黄金III以上，所有英雄<StatInlineTag name="RES" />增加50
                            </li>
                            <li>
                                <GuideIconInline name="Skill_PVP_Penalty" text="决斗者的誓言" /> <strong>决斗者的誓言</strong>：复活后行动值减少50%。每10回合对所有英雄造成最大HP 10%的固定伤害（无视<EffectInlineTag name="BT_INVINCIBLE" type="buff" />、<EffectInlineTag name="BT_UNDEAD" type="buff" />）
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

        </div>
    )
}

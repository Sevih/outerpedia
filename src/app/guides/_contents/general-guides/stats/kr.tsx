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
        { key: 'stats' as const, label: '기본 스탯' },
        { key: 'combat' as const, label: '전투 기초' },
        { key: 'faq' as const, label: 'FAQ' }
    ]

    const content = {
        stats: <StatsContent />,
        combat: <CombatBasicsContent />,
        faq: <FAQContent />
    }

    return (
        <div className="guide-content">
            {/* 메인 제목 */}
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-sky-400 border-l-4 border-sky-500 pl-4">
                스탯 & 전투 메카닉
            </h2>

            {/* 소개 */}
            <p className="text-neutral-300 mb-6 leading-relaxed">
                Outerplane의 스탯과 전투 메카닉을 다루는 종합 가이드입니다.
            </p>

            {/* 탭 */}
            <div className="flex justify-center mb-6 mt-4">
                <AnimatedTabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={setSelected}
                    pillColor="#0ea5e9"
                    scrollable={false}
                />
            </div>

            {/* 콘텐츠 */}
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
            <GuideHeading level={2}>핵심 스탯</GuideHeading>

            {/* 공격 스탯 */}
            <StatGroup title="공격 스탯" color="red">
                <StatCard
                    abbr="ATK"
                    desc="공격력이 높을수록 적에게 더 많은 데미지를 줍니다."
                    effect={{
                        buff: ["BT_STAT|ST_ATK"],
                        debuff: ["BT_STAT|ST_ATK"]
                    }}
                    details={
                        <>
                            <p>공격력은 스킬의 기본 데미지를 직접 증가시킵니다. 단, 일부 스킬은 다른 스탯에 의존하거나 공격력을 완전히 무시합니다.</p>
                            <p className="mt-2">일부 DoT(지속 데미지)는 공격력의 영향을 받습니다:</p>
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
                    desc="치명타가 발생할 확률. 치명타 발생 시 치명타 데미지에 따라 데미지가 증가합니다."
                    effect={{
                        buff: ["BT_STAT|ST_CRITICAL_RATE"],
                        debuff: ["BT_STAT|ST_CRITICAL_RATE"]
                    }}
                    details={
                        <>
                            <p>기본적으로 대부분의 캐릭터는 낮은 기본 치명타 확률로 시작하며, 장비, 버프, 특성, 패시브로 올려야 합니다. 치명타 확률 100%에 도달하면 모든 해당 공격이 치명타가 됩니다.</p>
                            <p className="mt-3 font-semibold">중요 사항:</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>치명타 확률은 100%가 상한이며, 초과분은 낭비됩니다.</li>
                                <li>힐과 보호막은 치명타가 되지 않습니다.</li>
                                <li><EffectInlineTag name="HEAVY_STRIKE" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} /> 효과가 있는 스킬(<SkillInline character="Kitsune of Eternity Tamamo-no-Mae" skill="S1" /> 등)은 치명타가 되지 않습니다.</li>
                                <li>지속 데미지 효과는 치명타가 되지 않습니다.</li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="CHD"
                    desc="치명타 적중 시 데미지 증가량."
                    effect={{
                        buff: ["BT_STAT|ST_CRITICAL_DMG_RATE"],
                        debuff: ["BT_STAT|ST_CRITICAL_DMG_RATE"]
                    }}
                    details={
                        <>
                            <p>치명타 데미지는 치명타 적중 시 적용되는 보너스 데미지를 결정합니다. 계산식은 일반적으로 기본 데미지에 치명타 데미지 %를 곱합니다.</p>
                            <p className="mt-2">모든 유닛은 기본 치명타 데미지 <strong>150%</strong>로 시작합니다.</p>
                            <p className="mt-2 text-yellow-400">치명타 확률이 낮으면 치명타 데미지에 투자할 가치가 없습니다.</p>
                        </>
                    }
                />

                <StatCard
                    abbr="PEN"
                    desc="관통으로 대상 방어력의 일부를 무시할 수 있습니다."
                    effect={{
                        buff: ["BT_STAT|ST_PIERCE_POWER_RATE"],
                        debuff: ["BT_STAT|ST_PIERCE_POWER_RATE"]
                    }}
                    details={
                        <>
                            <p>관통은 데미지 계산 시 적의 방어력(DEF)의 일정 비율을 무시합니다. 관통이 높을수록 데미지 감소 계산에서 DEF의 영향이 줄어듭니다.</p>
                            <p className="mt-2">예를 들어, 대상이 <strong>2000 DEF</strong>이고 당신이 <strong>20% 관통</strong>을 가지면, 대상이 <strong>1600 DEF</strong>만 가진 것처럼 취급됩니다.</p>
                            <p className="mt-2">관통은 높은 DEF를 가진 탱커형 적에게 더 효과적입니다.</p>
                            <p className="mt-3 text-sm text-yellow-400">
                                <strong>참고:</strong> 적의 방어력이 0이면(합동 전투 등), 관통은 무의미해집니다.
                            </p>
                        </>
                    }
                />
            </StatGroup>

            {/* 방어 스탯 */}
            <StatGroup title="방어 스탯" color="blue">
                <StatCard
                    abbr="HP"
                    desc="체력이 0 이하로 떨어지면 전투에 참여할 수 없습니다."
                    details={
                        <>
                            <p>체력은 유닛이 쓰러지기 전에 받을 수 있는 총 데미지량을 나타냅니다. HP가 0이 되면 즉시 전투에서 제외됩니다.</p>
                            <p className="mt-2">공격력처럼 일부 스킬은 HP에 의존합니다(<SkillInline character="Demiurge Drakhan" skill="S1" /> 등).</p>
                            <p className="mt-3">힐 스킬로 HP를 보충하고, 다음과 같은 버프로 보호할 수 있습니다:</p>
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
                    desc="방어력이 높을수록 적에게 받는 데미지가 감소합니다."
                    effect={{
                        buff: ["BT_STAT|ST_DEF"],
                        debuff: ["BT_STAT|ST_DEF"]
                    }}
                    details={
                        <>
                            <p>방어력은 대부분의 소스에서 받는 데미지를 감소시킵니다. 일부 스킬은 방어력에 의존합니다(<SkillInline character="Caren" skill="S3" /> 등).</p>
                            <p className="mt-3">단, 일부 게임 내 메카닉은 DEF를 부분적으로 또는 완전히 무시할 수 있습니다:</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                <li><EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="buff" /></li>
                                <li><EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /></li>
                            </ul>
                        </>
                    }
                />
            </StatGroup>

            {/* 유틸리티 스탯 */}
            <StatGroup title="유틸리티 스탯" color="green">
                <StatCard
                    abbr="SPD"
                    desc="속도가 높을수록 더 자주 행동할 수 있습니다."
                    effect={{
                        buff: ["BT_STAT|ST_SPEED"],
                        debuff: ["BT_STAT|ST_SPEED"]
                    }}
                    details={
                        <>
                            <p>속도는 유닛의 턴이 얼마나 빨리 오는지 결정합니다. SPD가 높을수록 전투 중 더 자주 행동할 수 있습니다.</p>
                            <p className="mt-2">공격력처럼 일부 스킬은 SPD에 의존합니다(<SkillInline character="Stella" skill="S2" /> 등).</p>
                            <p className="mt-3 text-yellow-400">속도는 &quot;우선도&quot; 개념과 직접 연결되어 있으므로, 자세한 내용은 <strong>전투 기초</strong> 섹션에서 설명합니다.</p>
                        </>
                    }
                />
            </StatGroup>

            {/* 명중 & 회피 */}
            <StatGroup title="명중 & 회피" color="purple">
                <StatCard
                    abbr="ACC"
                    desc="적에게 공격을 성공적으로 적중시킬 확률을 증가시킵니다."
                    effect={{
                        buff: ["BT_STAT|ST_ACCURACY"],
                        debuff: ["BT_STAT|ST_ACCURACY"]
                    }}
                    details={
                        <>
                            <p>명중이 대상의 회피보다 높으면 공격은 100% 성공합니다.</p>
                            <p className="mt-3 font-semibold">중요 사항:</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li><StatInlineTag name="EVA" />로 대응됩니다.</li>
                                <li>미스 시 데미지 -50%, 치명타 불가.</li>
                                <li>특정 콘텐츠(보스나 PvP 등)에서는 높은 명중이 필요할 수 있습니다.</li>
                                <li>일부 스킬은 히트 전에 디버프를 부여하여 명중/회피 체크를 우회합니다.</li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="EVA"
                    desc="적의 공격을 회피할 확률을 증가시킵니다. 미스된 공격은 데미지 -50%, 치명타 불가."
                    effect={{
                        buff: ["BT_STAT|ST_AVOID"],
                        debuff: ["BT_STAT|ST_AVOID"]
                    }}
                    details={
                        <>
                            <p><StatInlineTag name="ACC" />로 대응되는 회피는 적의 공격을 피할 확률을 높입니다. 회피율 상한은 <strong>25%</strong>이며, 회피가 적의 명중보다 <strong>+40</strong> 이상 높을 때 달성됩니다.</p>
                            <p className="mt-3 font-semibold">미스 시:</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>데미지 50% 감소</li>
                                <li>치명타 불가</li>
                                <li>디버프 부여 불가</li>
                            </ul>
                        </>
                    }
                />
            </StatGroup>

            {/* 효과 적중 & 효과 저항 */}
            <StatGroup title="효과 적중 & 효과 저항" color="amber">
                <StatCard
                    abbr="EFF"
                    desc="효과 적중이 높을수록 대상이 디버프에 저항할 확률이 낮아집니다."
                    effect={{
                        buff: ["BT_STAT|ST_BUFF_CHANCE"],
                        debuff: ["BT_STAT|ST_BUFF_CHANCE"]
                    }}
                    details={
                        <>
                            <p>효과 적중은 디버프 부여 성공 확률을 높이며, <StatInlineTag name="RES" />로 대응됩니다.</p>
                            <p className="mt-2">효과 적중이 적의 효과 저항 이상이면 디버프 부여 기본 확률은 100%입니다.</p>
                            <p className="mt-2">일부 스킬은 효과 적중에 의존합니다(<CharacterLinkCard name="Gnosis Beth" icon={false} />의 <EffectInlineTag name="BT_DOT_2000092" type="debuff" /> 등).</p>
                        </>
                    }
                />

                <StatCard
                    abbr="RES"
                    desc="효과 저항이 높을수록 디버프에 저항할 확률이 증가합니다."
                    effect={{
                        buff: ["BT_STAT|ST_BUFF_RESIST"],
                        debuff: ["BT_STAT|ST_BUFF_RESIST"]
                    }}
                    details={
                        <>
                            <p>효과 저항은 디버프를 받을 확률을 낮추며, <StatInlineTag name="EFF" />로 대응됩니다. <EffectInlineTag name="BT_IMMUNE" type="buff" /> 버프로 디버프 면역이 됩니다.</p>
                            <p className="mt-3">효과 저항이 적의 효과 적중보다 높을 때:</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>RES − EFF = 0 → 100% 확률</li>
                                <li>RES − EFF = 100 → 50%</li>
                                <li>RES − EFF = 300 → 25%</li>
                                <li>RES − EFF = 900 → 10%</li>
                            </ul>
                            <p className="mt-3 text-yellow-400">참고: 일부 스킬은 효과 저항 체크를 우회합니다(<SkillInline character="Drakhan" skill="S2" /> 등).</p>
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
            {/* 치명타 & DoT */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-red-400">치명타 & DoT</h4>
                <Accordion
                    items={[
                        {
                            key: 'crit-cap',
                            title: '치명타 확률이 100%를 초과할 수 있나요?',
                            content: '아니요. 치명타 확률은 100%가 상한입니다. 초과분은 효과가 없습니다.'
                        },
                        {
                            key: 'crit-on-heal',
                            title: '힐이나 보호막이 치명타가 되나요?',
                            content: '아니요. 힐, 보호막, 유틸리티 스킬은 명시되지 않는 한 치명타가 되지 않습니다. 치명타 메카닉은 데미지 스킬에만 적용됩니다.'
                        },
                        {
                            key: 'dot-crit',
                            title: 'DoT는 치명타 확률이나 치명타 데미지의 영향을 받나요?',
                            content: '아니요. 지속 데미지 효과(화상, 출혈, 독 등)는 치명타 확률이나 치명타 데미지의 영향을 받지 않습니다. 치명타가 되지 않습니다.'
                        },
                        {
                            key: 'dot-scaling',
                            title: 'DoT는 공격력의 영향을 받나요?',
                            content: '네. 일부 DoT는 시전자의 공격력에 의존하지만, 직접 데미지보다 배율이 낮습니다.'
                        },
                        {
                            key: 'pen-vs-dots',
                            title: '관통이 DoT나 고정 데미지에 영향을 주나요?',
                            content: (
                                <>
                                    <p>DoT 종류에 따라 다릅니다. DEF로 감소되는 DoT는 관통의 혜택을 받습니다:</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li><EffectInlineTag name="BT_DOT_BLEED" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_POISON" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /></li>
                                    </ul>
                                    <p className="mt-3">하지만 DEF를 완전히 무시하고 관통의 영향을 받지 않는 DoT도 있습니다:</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_2000092" type="debuff" /></li>
                                    </ul>
                                    <p className="mt-3">고정 데미지는 항상 DEF를 무시하며 관통의 영향을 받지 않습니다.</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 명중, 미스 & 디버프 부여 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400">명중, 미스 & 디버프 부여</h4>
                <Accordion
                    items={[
                        {
                            key: 'acc-vs-eva',
                            title: '명중 vs 회피는 어떻게 작동하나요?',
                            content: '당신의 ACC와 적의 EVA를 비교합니다. ACC가 높으면 100% 명중. 낮으면 차이에 따라 미스 확률이 증가합니다.'
                        },
                        {
                            key: 'acc-vs-eff',
                            title: '명중과 효과 적중의 차이는?',
                            content: '명중은 회피에 대한 공격 성공 확률(공격이 맞는가?)을 결정하고, 효과 적중은 효과 저항에 대한 디버프 성공 확률을 결정합니다.'
                        },
                        {
                            key: 'debuff-on-miss',
                            title: '공격이 미스하면 디버프가 부여되나요?',
                            content: '아니요. 회피로 미스하면 디버프가 부여되지 않습니다. 단, 일부 특수 스킬은 히트 전이나 독립적으로 디버프를 부여합니다.'
                        },
                        {
                            key: 'guaranteed-debuffs',
                            title: '미스해도 디버프를 부여하는 스킬이 있나요?',
                            content: '네. 일부 스킬은 데미지를 주기 전이나 명중 체크에 의존하지 않고 디버프를 부여합니다. 보통 설명에 명시되어 있습니다.'
                        },
                        {
                            key: 'eff-res-formula',
                            title: '디버프 성공 확률의 최솟값이 있나요?',
                            content: '아니요. 성공 확률은 공격자의 효과 적중(EFF)과 대상의 효과 저항(RES) 차이에 의존합니다. EFF ≥ RES면 100% 성공. 그 외에는 RES가 EFF를 초과하는 양에 따라 확률이 감소합니다. 예를 들어, RES − EFF 차이가 300이면 25%, 900이면 10%만 됩니다.'
                        }
                    ]}
                />
            </div>

            {/* 방어 & 관통 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-blue-400">방어 & 관통</h4>
                <Accordion
                    items={[
                        {
                            key: 'pen-vs-high-def',
                            title: '관통은 높은 DEF에 더 효과적인가요?',
                            content: '네. 적의 DEF가 높을수록 관통으로 인한 데미지 증가가 커집니다. 데미지 공식에서 유효 DEF를 줄이기 때문입니다.'
                        },
                        {
                            key: 'fixed-damage-mitigation',
                            title: '방어력이 고정 데미지를 감소시킬 수 있나요?',
                            content: '아니요. 고정 데미지는 DEF를 무시합니다. 보호막이나 무적만으로 막을 수 있습니다.'
                        }
                    ]}
                />
            </div>

            {/* 스탯 의존 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-green-400">스탯 의존</h4>
                <Accordion
                    items={[
                        {
                            key: 'dual-scaling',
                            title: '스킬이 여러 스탯에 의존할 수 있나요?',
                            content: (
                                <>
                                    <p>정확히는 아닙니다. Outerplane에는 현재 두 스탯을 균등하게 사용하는 스킬(예: 50% ATK + 50% HP)이 없습니다. &quot;듀얼 스케일링&quot;이라고 불리는 것은 실제로 <strong>부차 의존</strong>입니다 — 메인 스탯(보통 ATK)에 HP, SPD, EVA 등의 부차 보너스가 추가됩니다.</p>
                                    <p className="mt-2">예를 들어, 일부 스킬은 ATK를 메인으로 시전자의 최대 HP나 속도에서 보너스를 얻습니다. <SkillInline character="Regina" skill="S3" />는 회피의 경미한 의존을 포함하고, <CharacterLinkCard name="Demiurge Stella" icon={false} />는 HP에서 부분 의존을 가집니다.</p>
                                    <p className="mt-2">이러한 부차 의존은 보통 작으며 장비 구성의 초점이 되어서는 안 됩니다. ATK 외의 스탯에 완전히 의존하는 스킬(HP 기반이나 DEF 기반 데미지 등)도 있습니다.</p>
                                </>
                            )
                        },
                        {
                            key: 'stat-scaling',
                            title: '스킬이 어떤 스탯을 사용하는지 어떻게 알 수 있나요?',
                            content: (
                                <>
                                    <p>아무것도 언급되지 않으면 보통 기본적으로 ATK 의존입니다.</p>
                                    <p className="mt-2">다른 스탯을 사용하면 다음과 같은 문구가 있습니다:</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li>&quot;주는 데미지는 공격력 <strong>대신</strong> 최대 체력에 비례하여 증가합니다.&quot;</li>
                                        <li>&quot;주는 데미지는 최대 체력에 비례하여 증가합니다.&quot; (ATK에 추가로)</li>
                                    </ul>
                                    <p className="mt-2">문구가 중요합니다: &quot;대신&quot;은 ATK 의존을 대체하고, 없으면 추가 의존을 의미합니다.</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 속도 & 우선도 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-cyan-400">속도 & 우선도</h4>
                <Accordion
                    items={[
                        {
                            key: 'speed-formula',
                            title: '속도는 어떻게 계산되나요?',
                            content: (
                                <>
                                    <p><strong>Outerplane</strong>에서 속도 계산의 기본 공식:</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        SPD = 기본 SPD + 장비 SPD + (기본 SPD × 세트 효과%)
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>기본 SPD:</strong> 캐릭터의 고유 미수정 속도.</li>
                                        <li><strong>장비 SPD:</strong> 장비에서 얻은 고정 속도.</li>
                                        <li>
                                            <strong>세트 효과:</strong>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                <li>속도 세트 없음 = 0</li>
                                                <li>2세트 속도 = 0.12 (12%)</li>
                                                <li>4세트 속도 = 0.25 (25%)</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'priority-formula',
                            title: '1턴 우선도는 어떻게 계산되나요?',
                            content: (
                                <>
                                    <p>전투 시작 시 초기 우선도 계산 공식:</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        우선도 = (SPD + 아군 속도 초월 보너스 + (SPD × 버프%)) × 100 / (최고 SPD + 최고 SPD 팀 아군 속도 초월 보너스 + (최고 SPD × 버프%))
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>SPD:</strong> 위에서 계산된 유닛의 총 속도.</li>
                                        <li><strong>최고 SPD:</strong> 모든 유닛 중 최고 SPD (제수로 사용).</li>
                                        <li><strong>아군 속도 초월 보너스:</strong> 초월에서 얻은 속도.</li>
                                        <li>
                                            <strong>버프:</strong>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                <li>속도 버프 없음 = 0</li>
                                                <li>속도 버프 = 0.3 (30%)</li>
                                                <li>속도 디버프 = -0.3 (-30%)</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'max-speed',
                            title: '이론상 최대 속도',
                            content: (
                                <>
                                    <p>이론상 최대 속도:</p>
                                    <ul className="list-disc list-inside mt-2">
                                        <li><strong>기본 속도:</strong> <ClassInlineTag name="Ranger" />의 154</li>
                                        <li><strong>장비 SPD:</strong> 138 (각 부위 18 + 악세사리 48)</li>
                                        <li><strong>세트 SPD:</strong> 38 (154 캐릭터 기준)</li>
                                        <li><strong>아군 속도 초월 보너스:</strong> 30 (<CharacterLinkCard name="Dianne" icon={false} /> + <CharacterLinkCard name="Mene" icon={false} /> + <CharacterLinkCard name="Demiurge Delta" icon={false} />)</li>
                                    </ul>
                                    <p className="mt-3">합계: <strong>360</strong> (속도 버프 포함 시 468)</p>
                                    <p className="mt-2"><CharacterLinkCard name="Ryu Lion" icon={false} />은 4성 초월 보너스로 더 올릴 수 있습니다: <strong>370</strong> (속도 버프 포함 시 481)</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 공식 & 계산 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-amber-400">공식 & 계산</h4>
                <Accordion
                    items={[
                        {
                            key: 'formula',
                            title: '계산 방식',
                            content: (
                                <>
                                    <p>다음 공식과 설명은 <strong>Enebe-NB</strong>가 수집하고 테스트했습니다. Outerplane의 전투 공식을 분석한 훌륭한 작업입니다.</p>
                                    <p className="mt-2">
                                        전체 참조는 여기:{' '}
                                        <a
                                            href="https://docs.google.com/spreadsheets/d/10Sl_b7n7_j-PxkNxYGZEvu7HvrJNyRYDSyyYLcUwDOU/edit?gid=938189457#gid=938189457"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 underline"
                                        >
                                            [Google Sheet - Outerplane Analysis by Enebe-NB]
                                        </a>
                                    </p>

                                    <h4 className="font-semibold mt-4">방어 감소</h4>
                                    <p><strong>공식:</strong> <code>f(DEF) = 1000 / (1000 + DEF)</code></p>
                                    <p className="mt-2">이 공식은 방어력에 의한 데미지 감소량을 결정합니다. DEF가 증가할수록 추가 포인트의 효과가 감소합니다(수확 체감).</p>
                                    <p className="mt-2">유효 HP(EHP)는 여기서 도출할 수 있습니다:</p>
                                    <p className="mt-1"><strong>유효 HP:</strong> <code>EHP = HP + (HP × DEF / 1000)</code></p>

                                    <h4 className="font-semibold mt-4">명중 vs 회피</h4>
                                    <p><code>EVA - ACC ≤ 0</code>이면 회피 확률 = 0%.</p>
                                    <p className="mt-2">그 외:</p>
                                    <p className="mt-1"><strong>공식:</strong> <code>확률 = min(25%, 1000 / (100 + (EVA - ACC)))</code></p>
                                    <p className="mt-2">즉, EVA가 적의 ACC를 40 이상 초과하면 회피율은 25%에서 멈춥니다. 그 이상의 EVA는 미스 확률에 영향을 주지 않습니다.</p>

                                    <h4 className="font-semibold mt-4">효과 적중 vs 효과 저항</h4>
                                    <p><code>EFF ≥ RES</code>면 디버프 성공 확률은 100%.</p>
                                    <p className="mt-2">그 외, 디버프 부여 확률은 다음으로 계산:</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        성공 확률 = 100 / (100 + (RES − EFF))
                                    </p>
                                </>
                            )
                        },
                        {
                            key: 'damage-formula',
                            title: 'Outerplane의 전체 데미지 공식은?',
                            content: (
                                <>
                                    <p>Outerplane에서 스킬 데미지를 계산하는 기본 공식:</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        Dmg = 속성 × 스킬 × ATK × 수정치 × (1000 / (1000 + (1 − PEN%) × DEF))
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>속성</strong>: 0.8 (불리), 1 (중립), 1.2 (유리)</li>
                                        <li><strong>스킬</strong>: 스킬 배율</li>
                                        <li><strong>ATK</strong>: 유닛의 메인 의존 스탯 (스킬/캐릭터에 따라 HP, DEF 등도 가능)</li>
                                        <li><strong>수정치</strong>: 치명타 데미지, 보너스 데미지%, 부차 의존(HP, 회피 등), 버스트 데미지 효과 포함</li>
                                        <li><strong>PEN%</strong>: 관통</li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-4">
                                        출처:{' '}
                                        <a
                                            href="https://discord.com/channels/1264787916660670605/1264811556059873312/1265103204128133191"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-400"
                                        >
                                            Fabool on EvaMains Discord (2024년 7월 23일)
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
            {/* 우선도 시스템 */}
            <section className="space-y-6">
                <GuideHeading level={2}>턴제 우선도 시스템</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>
                        <strong>Outerplane</strong>의 모든 전투를 100미터 원형 트랙으로 상상해 보세요.
                        각 캐릭터(아군과 적 모두)가 이 트랙을 달립니다.
                        가장 먼저 한 바퀴(100%)를 완주한 자가 액션 라인에 도달하여 <strong>턴을 가집니다</strong>.
                    </p>
                    <p>
                        게임 내에서 턴 순서 아이콘 <GuideIconInline name="IG_Menu_Btn_Action" text="" />을 클릭하면 이 진행 상황이 <strong>퍼센티지</strong>로 표시됩니다:
                    </p>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>0%</strong> = 출발선</li>
                        <li><strong>100%</strong> = 액션 라인 — 턴을 가짐</li>
                    </ul>
                </div>

                <Accordion
                    items={[
                        {
                            key: 'speed',
                            title: <><StatInlineTag name='SPD' /></>,
                            content: (
                                <>
                                    <p><StatInlineTag name='SPD' />는 캐릭터의 달리기 속도 — 트랙에서 얼마나 빨리 전진하는지 결정하는 스탯이라고 상상할 수 있습니다.</p>
                                    <ul className="list-disc list-inside ml-4 mt-3">
                                        <li><StatInlineTag name='SPD' />가 높을수록 100%에 더 빨리 도달.</li>
                                        <li>200 <StatInlineTag name='SPD' /> 캐릭터는 100인 캐릭터보다 2배 빠르게 움직입니다.</li>
                                        <li>즉, 한쪽이 1번 행동하는 동안 2번 행동할 수 있습니다.</li>
                                    </ul>
                                    <p className="mt-3">이것은 고정 턴 순서 시스템이 아닙니다 — 연속적인 흐름입니다. 캐릭터는 100%에 도달하자마자 행동합니다.</p>
                                </>
                            )
                        },
                        {
                            key: 'priority',
                            title: <><span className='text-amber-400'>우선도</span></>,
                            content: (
                                <>
                                    <p>일부 스킬이나 효과는 속도와 관계없이 트랙에서의 <strong>현재 위치</strong>를 변경합니다. 캐릭터가 트랙에서 앞이나 뒤로 텔레포트한다고 상상할 수 있습니다.</p>
                                    <p className="mt-2">이것을 <strong><span className='text-amber-400'>우선도</span>를 증가 또는 감소시킨다</strong>고 합니다.</p>
                                    <p className="mt-2">다른 게임에도 비슷한 시스템이 있습니다 — Epic Seven의 전투 준비나 Summoner&apos;s War의 ATB 게이지 등.</p>

                                    <p className="text-sm text-yellow-400 mt-4">
                                        우선도에는 공식 게임 내 아이콘이 없습니다. 하지만 이 웹사이트에서는 다음 아이콘을 사용합니다: <span style={{ filter: 'grayscale(1)' }}><GuideIconInline name="SC_Buff_Effect_Increase_Priority" text="" /></span>.
                                    </p>

                                    <p className="mt-4">직접 관련된 효과:</p>
                                    <p className="mt-2"><span className="text-sky-400">유익</span>: <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> — 캐릭터를 앞으로 밀음.</p>
                                    <p className="mt-1"><span className="text-red-400">해로움</span>: <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> — 캐릭터를 뒤로 밀음.</p>

                                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                                        <p className="font-semibold text-yellow-400">중요 사항:</p>
                                        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                                            <li>우선도는 100%를 초과하거나 0% 아래로 떨어지지 않습니다.</li>
                                            <li>여러 캐릭터가 다른 시점에 100%에 도달하면, 먼저 도달한 자가 먼저 행동합니다. 이것이 가장 일반적인 경우입니다.</li>
                                            <li>하지만 여러 캐릭터가 <strong>같은 액션 내에서</strong> 100%에 도달하면(예: 대량 +우선도 부스트로), 행동 순서는 고정 위치 우선도를 기반으로 합니다: <strong>오른쪽 앞 → 위 → 아래 → 왼쪽 뒤</strong></li>
                                            <li>이 위치 규칙은 여러 캐릭터가 정확히 같은 시간에 100%로 밀려날 때만 사용됩니다.</li>
                                            <li>⚠️ 100% <strong>이후</strong>에 적용된 추가 우선도 부스트는 무시되며 턴 순서에 영향을 주지 않습니다.</li>
                                            <li>그런 경우, 행동 팀이 항상 먼저 행동하고, 그 다음 적 팀 — 각각 위의 위치 규칙에 따라 타이를 해결합니다.</li>
                                        </ul>
                                    </div>
                                </>
                            )
                        }
                    ]}
                />
            </section>

            {/* 턴 흐름 */}
            <section className="space-y-6">
                <GuideHeading level={2}>턴 흐름 상세</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>캐릭터가 100% 우선도에 도달하면 턴은 여러 단계로 진행됩니다. 각 단계에서 특정 이벤트가 발생합니다:</p>

                    <div className="space-y-6 mt-6">
                        {/* 시작 단계 */}
                        <div className="border-l-4 border-green-500 pl-4">
                            <h4 className="text-lg font-bold text-green-400">1. 시작 단계</h4>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>모든 스킬 쿨다운이 1 감소.</li>
                                <li>지속 회복(HoT) 효과 적용(<EffectInlineTag name="BT_CONTINU_HEAL" type="buff" /> 등)</li>
                                <li>지속 데미지(DoT) 효과 적용(<EffectInlineTag name="BT_DOT_BLEED" type="debuff" /> 등)</li>
                            </ul>
                        </div>

                        {/* 행동 단계 */}
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="text-lg font-bold text-blue-400">2. 행동 단계</h4>
                            <p className="mt-2 text-yellow-400"><EffectInlineTag name="BT_STUN" type="debuff" /> 같은 행동 불가 효과를 받고 있으면, 이 단계는 건너뛰고 턴은 바로 종료 단계로 진행합니다.</p>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <h5 className="font-semibold text-blue-300">2-1: 선택 단계</h5>
                                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                        <li>강제 행동이 먼저 해결됩니다(<EffectInlineTag name="BT_AGGRO" type="debuff" /> 등), 즉시 히트 단계를 시작.</li>
                                        <li>그 후, 플레이어가 스킬과 타겟을 선택.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-blue-300">2-2: 히트 단계</h5>
                                    <div className="ml-4 mt-2 space-y-3">
                                        <div>
                                            <p className="font-medium">스킬은 세 단계로 실행됩니다:</p>
                                            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                                                <li>
                                                    <strong>프리히트:</strong> 스킬이 히트하기 전에 발생. 예를 들어, <SkillInline character="Drakhan" skill="S3" />의 EE+10은 히트 전에 <EffectInlineTag name="BT_DOT_CURSE" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />를 부여 — 스킬의 데미지가 디버프 수에 의존하므로 중요.
                                                </li>
                                                <li>
                                                    <strong>히트:</strong> 스킬이 연결 — 직접 데미지와 힐이 적용.
                                                </li>
                                                <li>
                                                    <strong>포스트히트:</strong> 스킬이 히트한 후 발생 — 예를 들어, <SkillInline character="Demiurge Vlada" skill="S3" />는 포스트히트에 <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />를 부여.
                                                </li>
                                            </ul>
                                        </div>
                                        <p>추가 히트가 발동(<SkillInline character="Ryu Lion" skill="S2" /> 등).</p>
                                        <p>아군 반응(<SkillInline character="Caren" skill="S2" /> 등)도 발동 가능. 이러한 후속 효과는 위치 순서로 해결: <strong>오른쪽 앞 → 위 → 아래 → 왼쪽 뒤</strong>.</p>
                                        <p>적 반응(<EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />, <EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" />, <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> 등)도 발생 가능하며, 같은 위치 순서를 따릅니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 종료 단계 */}
                        <div className="border-l-4 border-purple-500 pl-4">
                            <h4 className="text-lg font-bold text-purple-400">3. 종료 단계</h4>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>부활 효과 해결(<EffectInlineTag name="BT_REVIVAL" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />나 <SkillInline character="Demiurge Astei" skill="S2" /> 등).</li>
                                <li>남은 모든 버프와 디버프의 지속 시간이 1턴 감소 — 시작 단계에서 이미 처리된 것 제외.</li>
                                <li>남은 우선도 증감이 적용.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1턴 계산 */}
            <section className="space-y-6">
                <GuideHeading level={2}>1턴 계산</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>전투 시작 시, 가장 높은 <StatInlineTag name="SPD" />를 가진 유닛이 먼저 행동합니다. 다른 모든 유닛은 가장 빠른 유닛과 비교한 SPD에 비례한 우선도 값으로 시작합니다.</p>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-blue-300">예시:</p>
                        <ul className="list-disc list-inside ml-4 mt-2">
                            <li>가장 빠른 유닛이 <strong>300 SPD</strong>면 <strong>100%</strong> 우선도로 시작.</li>
                            <li><strong>200 SPD</strong> 유닛은 <strong>66%</strong>로 시작 (200 × 100 / 300).</li>
                            <li><strong>150 SPD</strong> 유닛은 <strong>50%</strong>로 시작 (150 × 100 / 300).</li>
                        </ul>
                    </div>

                    <p className="mt-4">하지만 게임에는 각 유닛의 시작 우선도에 적용되는 <strong>0-5%</strong>의 숨겨진 랜덤 변동이 있습니다. 결과적으로, 약간 느린 유닛이 먼저 행동할 수도 있습니다.</p>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-yellow-400">RNG 포함 예시:</p>
                        <p className="mt-2">유닛 A: 300 SPD → 100% +0% = 100%</p>
                        <p>유닛 B: 290 SPD → 96% + 5% = 101%</p>
                        <p className="mt-2">→ <strong>유닛 B가 먼저 행동합니다.</strong></p>
                    </div>

                    <p className="mt-4">이 메카닉은 <strong>PvP</strong>에서 특히 중요하며, 1턴이 경기 결과에 큰 영향을 미칠 수 있습니다.</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-sky-300">전투 시작 시 속도 버프</h4>
                    <p>일부 유닛은 <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />를 가지고 전투를 시작하여 턴 순서를 크게 바꿀 수 있습니다.</p>

                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-purple-300">예시:</p>
                        <p className="mt-2"><CharacterLinkCard name="Tamara" icon={false} />: 300 SPD → 100% 우선도</p>
                        <p><CharacterLinkCard name="Dahlia" icon={false} />: 280 SPD → 93% (280 × 100 / 300)</p>
                        <p className="mt-2">일반적으로 <CharacterLinkCard name="Tamara" icon={false} />가 먼저 행동합니다.</p>
                        <p className="mt-2">하지만 <CharacterLinkCard name="Dahlia" icon={false} />가 <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />로 시작하면(예: EE에서), 유효 SPD는:</p>
                        <p>280 × 1.3 = 364 → 100% 우선도</p>
                        <p><CharacterLinkCard name="Tamara" icon={false} />: 300 SPD → <strong>82%</strong> (300 × 100 / 364)</p>
                        <p className="mt-2">→ <strong><CharacterLinkCard name="Dahlia" icon={false} />가 먼저 행동합니다.</strong></p>
                    </div>

                    <p className="mt-4">일부 초월 특전은 팀 전체에 <StatInlineTag name="SPD" /> 보너스를 부여합니다(<CharacterLinkCard name="Mene" />나 <CharacterLinkCard name="Demiurge Delta" /> 등).</p>
                </div>
            </section>

            {/* 예외 */}
            <section className="space-y-6">
                <GuideHeading level={2}>특수 메카닉 & 예외</GuideHeading>

                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">추가 턴</h4>
                        <p>스킬이 <EffectInlineTag name="BT_ADDITIVE_TURN" type="buff" />를 적용하면, 캐릭터는 0% 우선도로 리셋되기 전에 즉시 완전한 턴(모든 단계 포함)을 가집니다.</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">데미우르고스 블라다의 패시브</h4>
                        <p>5★ <CharacterLinkCard name="Demiurge Vlada" />가 전투에 있으면, 적 팀의 모든 <strong>우선도 증가 효과</strong>가 <strong>50%</strong> 감소합니다.</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">아레나 필드 스킬</h4>
                        <p>아레나에서는 두 개의 필드 스킬이 적용됩니다:</p>
                        <ul className="list-disc list-inside ml-4 mt-3 space-y-2">
                            <li>
                                <GuideIconInline name="Skill_PVP_LeagueBuff_01" text="강자의 고동" /> <strong>강자의 고동</strong>: 골드 III 이후, 모든 영웅의 <StatInlineTag name="RES" />를 50 증가
                            </li>
                            <li>
                                <GuideIconInline name="Skill_PVP_Penalty" text="결투자의 맹세" /> <strong>결투자의 맹세</strong>: 부활 후 우선도 50% 감소. 10턴마다 모든 영웅에게 최대 HP의 10%를 고정 데미지로 줌 (<EffectInlineTag name="BT_INVINCIBLE" type="buff" />, <EffectInlineTag name="BT_UNDEAD" type="buff" /> 관통)
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

        </div>
    )
}

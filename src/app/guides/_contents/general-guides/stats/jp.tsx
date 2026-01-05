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
        { key: 'stats' as const, label: '基本ステータス' },
        { key: 'combat' as const, label: '戦闘の基本' },
        { key: 'faq' as const, label: 'FAQ' }
    ]

    const content = {
        stats: <StatsContent />,
        combat: <CombatBasicsContent />,
        faq: <FAQContent />
    }

    return (
        <div className="guide-content">
            {/* メインタイトル */}
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-sky-400 border-l-4 border-sky-500 pl-4">
                ステータス＆戦闘メカニクス
            </h2>

            {/* 紹介 */}
            <p className="text-neutral-300 mb-6 leading-relaxed">
                Outerplaneのステータスと戦闘メカニクスを網羅したガイドです。
            </p>

            {/* タブ */}
            <div className="flex justify-center mb-6 mt-4">
                <AnimatedTabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={setSelected}
                    pillColor="#0ea5e9"
                    scrollable={false}
                />
            </div>

            {/* コンテンツ */}
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
            <GuideHeading level={2}>コアステータス</GuideHeading>

            {/* 攻撃系ステータス */}
            <StatGroup title="攻撃系ステータス" color="red">
                <StatCard
                    abbr="ATK"
                    desc="攻撃力が高いほど、敵に与えるダメージが増加します。"
                    effect={{
                        buff: ["BT_STAT|ST_ATK"],
                        debuff: ["BT_STAT|ST_ATK"]
                    }}
                    details={
                        <>
                            <p>攻撃力はスキルの基本ダメージを直接増加させます。ただし、一部のスキルは他のステータスに依存するか、攻撃力を完全に無視します。</p>
                            <p className="mt-2">一部のDoT（継続ダメージ）は攻撃力の影響を受けます：</p>
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
                    desc="クリティカルヒットが発生する確率。クリティカルヒット時、クリティカルダメージに応じてダメージが増加します。"
                    effect={{
                        buff: ["BT_STAT|ST_CRITICAL_RATE"],
                        debuff: ["BT_STAT|ST_CRITICAL_RATE"]
                    }}
                    details={
                        <>
                            <p>デフォルトでは、ほとんどのキャラクターは低い基本クリ率から始まり、装備、バフ、特性、パッシブで上げる必要があります。クリ率100%で、対象となる全ての攻撃がクリティカルになります。</p>
                            <p className="mt-3 font-semibold">重要な注意点：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>クリ率は100%が上限で、超過分は無駄になります。</li>
                                <li>回復とシールドはクリティカルしません。</li>
                                <li><EffectInlineTag name="HEAVY_STRIKE" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />効果を持つスキル（<SkillInline character="Kitsune of Eternity Tamamo-no-Mae" skill="S1" />など）はクリティカルしません。</li>
                                <li>継続ダメージ効果はクリティカルしません。</li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="CHD"
                    desc="クリティカルヒット時のダメージ増加量。"
                    effect={{
                        buff: ["BT_STAT|ST_CRITICAL_DMG_RATE"],
                        debuff: ["BT_STAT|ST_CRITICAL_DMG_RATE"]
                    }}
                    details={
                        <>
                            <p>クリダメはクリティカルヒット時に適用されるボーナスダメージを決定します。計算式は通常、基本ダメージにクリダメ%を乗算します。</p>
                            <p className="mt-2">全てのユニットは基本クリダメ<strong>150%</strong>から始まります。</p>
                            <p className="mt-2 text-yellow-400">クリ率が低い場合、クリダメに投資する価値はありません。</p>
                        </>
                    }
                />

                <StatCard
                    abbr="PEN"
                    desc="貫通により、対象の防御力の一部を無視できます。"
                    effect={{
                        buff: ["BT_STAT|ST_PIERCE_POWER_RATE"],
                        debuff: ["BT_STAT|ST_PIERCE_POWER_RATE"]
                    }}
                    details={
                        <>
                            <p>貫通は、ダメージ計算時に敵の防御力（DEF）の一定割合を無視します。貫通が高いほど、ダメージ軽減計算でのDEFの影響が小さくなります。</p>
                            <p className="mt-2">例えば、対象が<strong>2000 DEF</strong>で、あなたが<strong>20%貫通</strong>を持っている場合、対象は<strong>1600 DEF</strong>しか持っていないかのように扱われます。</p>
                            <p className="mt-2">貫通は高DEFの耐久型の敵に対してより効果的です。</p>
                            <p className="mt-3 text-sm text-yellow-400">
                                <strong>注意：</strong>敵の防御力が0の場合（共同戦闘など）、貫通は無意味になります。
                            </p>
                        </>
                    }
                />
            </StatGroup>

            {/* 防御系ステータス */}
            <StatGroup title="防御系ステータス" color="blue">
                <StatCard
                    abbr="HP"
                    desc="体力が0以下になると、戦闘に参加できなくなります。"
                    details={
                        <>
                            <p>体力は、ユニットが倒されるまでに受けられるダメージの総量を表します。HPが0になると、そのユニットは即座に戦闘から除外されます。</p>
                            <p className="mt-2">攻撃力と同様に、一部のスキルはHPに依存します（<SkillInline character="Demiurge Drakhan" skill="S1" />など）。</p>
                            <p className="mt-3">回復スキルでHPを補充し、以下のようなバフで保護できます：</p>
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
                    desc="防御力が高いほど、敵から受けるダメージが減少します。"
                    effect={{
                        buff: ["BT_STAT|ST_DEF"],
                        debuff: ["BT_STAT|ST_DEF"]
                    }}
                    details={
                        <>
                            <p>防御力はほとんどのソースから受けるダメージを軽減します。一部のスキルは防御力に依存します（<SkillInline character="Caren" skill="S3" />など）。</p>
                            <p className="mt-3">ただし、一部のゲーム内メカニクスはDEFを部分的または完全に無視できます：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                <li><EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="buff" /></li>
                                <li><EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /></li>
                            </ul>
                        </>
                    }
                />
            </StatGroup>

            {/* ユーティリティステータス */}
            <StatGroup title="ユーティリティステータス" color="green">
                <StatCard
                    abbr="SPD"
                    desc="速度が高いほど、より頻繁に行動できます。"
                    effect={{
                        buff: ["BT_STAT|ST_SPEED"],
                        debuff: ["BT_STAT|ST_SPEED"]
                    }}
                    details={
                        <>
                            <p>速度は、ユニットのターンがどれだけ早く来るかを決定します。SPDが高いほど、戦闘中により頻繁に行動できます。</p>
                            <p className="mt-2">攻撃力と同様に、一部のスキルはSPDに依存します（<SkillInline character="Stella" skill="S2" />など）。</p>
                            <p className="mt-3 text-yellow-400">速度は「優先度」の概念と直接関連しているため、詳細は<strong>戦闘の基本</strong>セクションで説明します。</p>
                        </>
                    }
                />
            </StatGroup>

            {/* 命中＆回避 */}
            <StatGroup title="命中＆回避" color="purple">
                <StatCard
                    abbr="ACC"
                    desc="敵への攻撃成功確率を上昇させます。"
                    effect={{
                        buff: ["BT_STAT|ST_ACCURACY"],
                        debuff: ["BT_STAT|ST_ACCURACY"]
                    }}
                    details={
                        <>
                            <p>命中が対象の回避より高い場合、攻撃は100%成功します。</p>
                            <p className="mt-3 font-semibold">重要な注意点：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li><StatInlineTag name="EVA" />で対抗されます。</li>
                                <li>ミス時はダメージ-50%、クリティカル不可。</li>
                                <li>特定のコンテンツ（ボスやPvPなど）では高い命中が必要な場合があります。</li>
                                <li>一部のスキルはヒット前にデバフを付与し、命中/回避チェックを回避します。</li>
                            </ul>
                        </>
                    }
                />

                <StatCard
                    abbr="EVA"
                    desc="敵の攻撃を回避する確率を上昇させます。ミスした攻撃はダメージ-50%、クリティカル不可。"
                    effect={{
                        buff: ["BT_STAT|ST_AVOID"],
                        debuff: ["BT_STAT|ST_AVOID"]
                    }}
                    details={
                        <>
                            <p><StatInlineTag name="ACC" />で対抗される回避は、敵の攻撃を避ける確率を上げます。回避率の上限は<strong>25%</strong>で、回避が敵の命中より<strong>+40</strong>以上高い場合に達成されます。</p>
                            <p className="mt-3 font-semibold">ミス時：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>ダメージが50%減少</li>
                                <li>クリティカルヒット不可</li>
                                <li>デバフが付与されない</li>
                            </ul>
                        </>
                    }
                />
            </StatGroup>

            {/* 効果命中＆効果抵抗 */}
            <StatGroup title="効果命中＆効果抵抗" color="amber">
                <StatCard
                    abbr="EFF"
                    desc="効果命中が高いほど、対象がデバフに抵抗する確率が低下します。"
                    effect={{
                        buff: ["BT_STAT|ST_BUFF_CHANCE"],
                        debuff: ["BT_STAT|ST_BUFF_CHANCE"]
                    }}
                    details={
                        <>
                            <p>効果命中はデバフ付与の成功確率を上げ、<StatInlineTag name="RES" />で対抗されます。</p>
                            <p className="mt-2">効果命中が敵の効果抵抗以上の場合、デバフ付与の基本確率は100%です。</p>
                            <p className="mt-2">一部のスキルは効果命中に依存します（<CharacterLinkCard name="Gnosis Beth" icon={false} />の<EffectInlineTag name="BT_DOT_2000092" type="debuff" />など）。</p>
                        </>
                    }
                />

                <StatCard
                    abbr="RES"
                    desc="効果抵抗が高いほど、デバフに抵抗する確率が上昇します。"
                    effect={{
                        buff: ["BT_STAT|ST_BUFF_RESIST"],
                        debuff: ["BT_STAT|ST_BUFF_RESIST"]
                    }}
                    details={
                        <>
                            <p>効果抵抗はデバフを受ける確率を下げ、<StatInlineTag name="EFF" />で対抗されます。<EffectInlineTag name="BT_IMMUNE" type="buff" />バフでデバフ無効になれます。</p>
                            <p className="mt-3">効果抵抗が敵の効果命中より高い場合：</p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>RES − EFF = 0 → 100%確率</li>
                                <li>RES − EFF = 100 → 50%</li>
                                <li>RES − EFF = 300 → 25%</li>
                                <li>RES − EFF = 900 → 10%</li>
                            </ul>
                            <p className="mt-3 text-yellow-400">注意：一部のスキルは効果抵抗チェックを回避します（<SkillInline character="Drakhan" skill="S2" />など）。</p>
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
            {/* クリティカル＆DoT */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-red-400">クリティカル＆DoT</h4>
                <Accordion
                    items={[
                        {
                            key: 'crit-cap',
                            title: 'クリ率は100%を超えられますか？',
                            content: 'いいえ。クリ率は100%が上限です。超過分は効果がありません。'
                        },
                        {
                            key: 'crit-on-heal',
                            title: '回復やシールドはクリティカルしますか？',
                            content: 'いいえ。回復、シールド、ユーティリティスキルは明示されない限りクリティカルしません。クリティカルメカニクスはダメージスキルにのみ適用されます。'
                        },
                        {
                            key: 'dot-crit',
                            title: 'DoTはクリ率やクリダメに影響されますか？',
                            content: 'いいえ。継続ダメージ効果（火傷、出血、毒など）はクリ率やクリダメの影響を受けません。クリティカルしません。'
                        },
                        {
                            key: 'dot-scaling',
                            title: 'DoTは攻撃力に影響されますか？',
                            content: 'はい。一部のDoTは術者の攻撃力に依存しますが、直接ダメージより倍率は低めです。'
                        },
                        {
                            key: 'pen-vs-dots',
                            title: '貫通はDoTや固定ダメージに影響しますか？',
                            content: (
                                <>
                                    <p>DoTの種類によります。DEFで軽減されるDoTは貫通の恩恵を受けます：</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li><EffectInlineTag name="BT_DOT_BLEED" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_POISON" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /></li>
                                    </ul>
                                    <p className="mt-3">ただし、DEFを完全に無視し、貫通の影響を受けないDoTもあります：</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_2000092" type="debuff" /></li>
                                    </ul>
                                    <p className="mt-3">固定ダメージは常にDEFを無視し、貫通の影響を受けません。</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 命中、ミス＆デバフ付与 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400">命中、ミス＆デバフ付与</h4>
                <Accordion
                    items={[
                        {
                            key: 'acc-vs-eva',
                            title: '命中vs回避はどう機能しますか？',
                            content: 'あなたのACCと敵のEVAを比較します。ACCが高ければ100%命中。低ければ、差に応じてミス確率が上がります。'
                        },
                        {
                            key: 'acc-vs-eff',
                            title: '命中と効果命中の違いは？',
                            content: '命中は回避に対する攻撃成功確率（攻撃が当たるか？）を決定し、効果命中は効果抵抗に対するデバフ成功確率を決定します。'
                        },
                        {
                            key: 'debuff-on-miss',
                            title: '攻撃がミスした場合、デバフは付与されますか？',
                            content: 'いいえ。回避でミスした場合、デバフは付与されません。ただし、一部の特殊スキルはヒット前または独立してデバフを付与します。'
                        },
                        {
                            key: 'guaranteed-debuffs',
                            title: 'ミスしてもデバフを付与するスキルはありますか？',
                            content: 'はい。一部のスキルはダメージを与える前、または命中チェックに依存せずにデバフを付与します。通常、説明に明記されています。'
                        },
                        {
                            key: 'eff-res-formula',
                            title: 'デバフ成功確率の最低値はありますか？',
                            content: 'いいえ。成功確率は攻撃者の効果命中（EFF）と対象の効果抵抗（RES）の差に依存します。EFF ≥ RESなら100%成功。それ以外は、RESがEFFを超える量に応じて確率が下がります。例えば、RES − EFFの差が300なら25%、900なら10%のみです。'
                        }
                    ]}
                />
            </div>

            {/* 防御＆貫通 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-blue-400">防御＆貫通</h4>
                <Accordion
                    items={[
                        {
                            key: 'pen-vs-high-def',
                            title: '貫通は高DEFに対してより効果的ですか？',
                            content: 'はい。敵のDEFが高いほど、貫通によるダメージ増加が大きくなります。ダメージ計算式で有効DEFを減らすためです。'
                        },
                        {
                            key: 'fixed-damage-mitigation',
                            title: '防御力は固定ダメージを軽減できますか？',
                            content: 'いいえ。固定ダメージはDEFを無視します。シールドまたは無敵のみで防げます。'
                        }
                    ]}
                />
            </div>

            {/* ステータス依存 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-green-400">ステータス依存</h4>
                <Accordion
                    items={[
                        {
                            key: 'dual-scaling',
                            title: 'スキルは複数のステータスに依存できますか？',
                            content: (
                                <>
                                    <p>正確には違います。Outerplaneには現在、2つのステータスを均等に使うスキル（例：50% ATK + 50% HP）はありません。「デュアルスケーリング」と呼ばれるものは実際には<strong>副次依存</strong>です — メインステータス（通常ATK）に、HP、SPD、EVAなどの副次ボーナスが加わります。</p>
                                    <p className="mt-2">例えば、一部のスキルはATKをメインに、術者の最大HPや速度からボーナスを得ます。<SkillInline character="Regina" skill="S3" />は回避の軽微な依存を含み、<CharacterLinkCard name="Demiurge Stella" icon={false} />はHPからの部分依存を持ちます。</p>
                                    <p className="mt-2">これらの副次依存は通常小さく、装備構築の焦点にすべきではありません。ATK以外のステータスに完全に依存するスキル（HP依存やDEF依存ダメージなど）もあります。</p>
                                </>
                            )
                        },
                        {
                            key: 'stat-scaling',
                            title: 'スキルがどのステータスを使うかはどうやって分かりますか？',
                            content: (
                                <>
                                    <p>何も記載がなければ、通常はデフォルトでATK依存です。</p>
                                    <p className="mt-2">異なるステータスを使う場合、以下のような記述があります：</p>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        <li>「与えるダメージは攻撃力<strong>ではなく</strong>最大体力に比例して増加します。」</li>
                                        <li>「与えるダメージは最大体力に比例して増加します。」（ATKに加えて）</li>
                                    </ul>
                                    <p className="mt-2">表現が重要です：「ではなく」はATK依存を置き換え、それがない場合は追加依存を意味します。</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 速度＆優先度 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-cyan-400">速度＆優先度</h4>
                <Accordion
                    items={[
                        {
                            key: 'speed-formula',
                            title: '速度はどう計算されますか？',
                            content: (
                                <>
                                    <p><strong>Outerplane</strong>での速度計算の基本式：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        SPD = 基本SPD + 装備SPD + (基本SPD × セット効果%)
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>基本SPD：</strong>キャラクターの固有の未修正速度。</li>
                                        <li><strong>装備SPD：</strong>装備から得た固定速度。</li>
                                        <li>
                                            <strong>セット効果：</strong>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                <li>速度セットなし = 0</li>
                                                <li>2セット速度 = 0.12 (12%)</li>
                                                <li>4セット速度 = 0.25 (25%)</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'priority-formula',
                            title: '1ターン目の優先度はどう計算されますか？',
                            content: (
                                <>
                                    <p>戦闘開始時の初期優先度計算式：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        優先度 = (SPD + 味方速度超越ボーナス + (SPD × バフ%)) × 100 / (最高SPD + 最高SPDチーム味方速度超越ボーナス + (最高SPD × バフ%))
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>SPD：</strong>上記で計算されたユニットの総速度。</li>
                                        <li><strong>最高SPD：</strong>全ユニット中の最高SPD（除数として使用）。</li>
                                        <li><strong>味方速度超越ボーナス：</strong>超越からの速度。</li>
                                        <li>
                                            <strong>バフ：</strong>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                <li>速度バフなし = 0</li>
                                                <li>速度バフ = 0.3 (30%)</li>
                                                <li>速度デバフ = -0.3 (-30%)</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'max-speed',
                            title: '理論上の最大速度',
                            content: (
                                <>
                                    <p>理論上の最大速度：</p>
                                    <ul className="list-disc list-inside mt-2">
                                        <li><strong>基本速度：</strong><ClassInlineTag name="Ranger" />の154</li>
                                        <li><strong>装備SPD：</strong>138（各部位18 + アクセサリー48）</li>
                                        <li><strong>セットSPD：</strong>38（154キャラで）</li>
                                        <li><strong>味方速度超越ボーナス：</strong>30（<CharacterLinkCard name="Dianne" icon={false} /> + <CharacterLinkCard name="Mene" icon={false} /> + <CharacterLinkCard name="Demiurge Delta" icon={false} />）</li>
                                    </ul>
                                    <p className="mt-3">合計：<strong>360</strong>（速度バフ込みで468）</p>
                                    <p className="mt-2"><CharacterLinkCard name="Ryu Lion" icon={false} />は4つ星超越ボーナスでさらに上げられます：<strong>370</strong>（速度バフ込みで481）</p>
                                </>
                            )
                        }
                    ]}
                />
            </div>

            {/* 計算式 */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-amber-400">計算式</h4>
                <Accordion
                    items={[
                        {
                            key: 'formula',
                            title: '計算の仕組み',
                            content: (
                                <>
                                    <p>以下の計算式と説明は<strong>Enebe-NB</strong>によって収集・検証されました。Outerplaneの戦闘計算式を分析した素晴らしい仕事です。</p>
                                    <p className="mt-2">
                                        完全な参照はこちら：{' '}
                                        <a
                                            href="https://docs.google.com/spreadsheets/d/10Sl_b7n7_j-PxkNxYGZEvu7HvrJNyRYDSyyYLcUwDOU/edit?gid=938189457#gid=938189457"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 underline"
                                        >
                                            [Google Sheet - Outerplane Analysis by Enebe-NB]
                                        </a>
                                    </p>

                                    <h4 className="font-semibold mt-4">防御軽減</h4>
                                    <p><strong>計算式：</strong> <code>f(DEF) = 1000 / (1000 + DEF)</code></p>
                                    <p className="mt-2">この式は防御力によるダメージ軽減量を決定します。DEFが増えるほど、追加ポイントの効果は減少します（収穫逓減）。</p>
                                    <p className="mt-2">有効HP（EHP）はここから導出できます：</p>
                                    <p className="mt-1"><strong>有効HP：</strong> <code>EHP = HP + (HP × DEF / 1000)</code></p>

                                    <h4 className="font-semibold mt-4">命中vs回避</h4>
                                    <p><code>EVA - ACC ≤ 0</code>の場合、回避確率 = 0%。</p>
                                    <p className="mt-2">それ以外：</p>
                                    <p className="mt-1"><strong>計算式：</strong> <code>確率 = min(25%, 1000 / (100 + (EVA - ACC)))</code></p>
                                    <p className="mt-2">つまり、EVAが敵のACCを40以上超えると回避率は25%で頭打ち。それ以上のEVAはミス確率に影響しません。</p>

                                    <h4 className="font-semibold mt-4">効果命中vs効果抵抗</h4>
                                    <p><code>EFF ≥ RES</code>の場合、デバフ成功確率は100%。</p>
                                    <p className="mt-2">それ以外、デバフ付与確率は以下で計算：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        成功確率 = 100 / (100 + (RES − EFF))
                                    </p>
                                </>
                            )
                        },
                        {
                            key: 'damage-formula',
                            title: 'Outerplaneの完全なダメージ計算式は？',
                            content: (
                                <>
                                    <p>Outerplaneでスキルダメージを計算する基本式：</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit mt-2">
                                        Dmg = 属性 × スキル × ATK × 修正値 × (1000 / (1000 + (1 − PEN%) × DEF))
                                    </p>
                                    <ul className="list-disc list-inside mt-3">
                                        <li><strong>属性</strong>：0.8（不利）、1（中立）、1.2（有利）</li>
                                        <li><strong>スキル</strong>：スキル倍率</li>
                                        <li><strong>ATK</strong>：ユニットのメイン依存ステータス（スキル/キャラによってHP、DEFなども可）</li>
                                        <li><strong>修正値</strong>：クリダメ、ボーナスダメージ%、副次依存（HP、回避など）、バーストダメージ効果を含む</li>
                                        <li><strong>PEN%</strong>：貫通</li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-4">
                                        出典：{' '}
                                        <a
                                            href="https://discord.com/channels/1264787916660670605/1264811556059873312/1265103204128133191"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-blue-400"
                                        >
                                            Fabool on EvaMains Discord (2024年7月23日)
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
            {/* 優先度システム */}
            <section className="space-y-6">
                <GuideHeading level={2}>ターン制優先度システム</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>
                        <strong>Outerplane</strong>の全ての戦闘を100メートルの円形トラックとして想像してください。
                        各キャラクター（味方も敵も）がこのトラックを走ります。
                        最初に1周（100%）を完了した者がアクションラインに到達し、<strong>ターンを取ります</strong>。
                    </p>
                    <p>
                        ゲーム内では、ターン順アイコン<GuideIconInline name="IG_Menu_Btn_Action" text="" />をクリックすると、この進行状況が<strong>パーセンテージ</strong>で表示されます：
                    </p>
                    <ul className="list-disc list-inside ml-4">
                        <li><strong>0%</strong> = スタートライン</li>
                        <li><strong>100%</strong> = アクションライン — ターンを取る</li>
                    </ul>
                </div>

                <Accordion
                    items={[
                        {
                            key: 'speed',
                            title: <><StatInlineTag name='SPD' /></>,
                            content: (
                                <>
                                    <p><StatInlineTag name='SPD' />はキャラクターの走る速さ — トラック上でどれだけ早く進むかを決定するステータスと想像できます。</p>
                                    <ul className="list-disc list-inside ml-4 mt-3">
                                        <li><StatInlineTag name='SPD' />が高いほど、100%に早く到達。</li>
                                        <li>200 <StatInlineTag name='SPD' />のキャラクターは100のキャラクターの2倍速く動きます。</li>
                                        <li>つまり、一方が1回行動する間に2回行動できます。</li>
                                    </ul>
                                    <p className="mt-3">これは固定ターン順システムではなく、連続的な流れです。キャラクターは100%に達した瞬間に行動します。</p>
                                </>
                            )
                        },
                        {
                            key: 'priority',
                            title: <><span className='text-amber-400'>優先度</span></>,
                            content: (
                                <>
                                    <p>一部のスキルや効果は、速度に関係なく、トラック上の<strong>現在位置</strong>を変更します。キャラクターがトラック上を前方または後方にテレポートすると想像できます。</p>
                                    <p className="mt-2">これは<strong><span className='text-amber-400'>優先度</span>を増加または減少させる</strong>として知られています。</p>
                                    <p className="mt-2">他のゲームでも同様のシステムがあります — Epic Sevenの戦闘準備やSummoner&apos;s WarのATBゲージなど。</p>

                                    <p className="text-sm text-yellow-400 mt-4">
                                        優先度にはゲーム内の公式アイコンがありません。ただし、このウェブサイトでは以下のアイコンを使用しています：<span style={{ filter: 'grayscale(1)' }}><GuideIconInline name="SC_Buff_Effect_Increase_Priority" text="" /></span>。
                                    </p>

                                    <p className="mt-4">直接関連する効果：</p>
                                    <p className="mt-2"><span className="text-sky-400">有益</span>：<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> — キャラクターを前方に押す。</p>
                                    <p className="mt-1"><span className="text-red-400">有害</span>：<EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> — キャラクターを後方に押す。</p>

                                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                                        <p className="font-semibold text-yellow-400">重要な注意事項：</p>
                                        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                                            <li>優先度は100%を超えたり0%を下回ったりしません。</li>
                                            <li>複数のキャラクターが異なるタイミングで100%に達した場合、最初に到達した者が先に行動します。これが最も一般的なケースです。</li>
                                            <li>ただし、複数のキャラクターが<strong>同じアクション内で</strong>100%に達した場合（例：大量の+優先度ブーストにより）、行動順序は固定の位置優先度に基づきます：<strong>右前→上→下→左後</strong></li>
                                            <li>この位置ルールは、複数のキャラクターが同時に100%に押し上げられた場合にのみ使用されます。</li>
                                            <li>⚠️ 100%<strong>以降</strong>に適用された追加の優先度ブーストは無視され、ターン順序に影響しません。</li>
                                            <li>そのような場合、行動チームが常に先に行動し、その後敵チーム — それぞれ上記の位置ルールに基づいてタイを解決します。</li>
                                        </ul>
                                    </div>
                                </>
                            )
                        }
                    ]}
                />
            </section>

            {/* ターンフロー */}
            <section className="space-y-6">
                <GuideHeading level={2}>ターンフローの詳細</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>キャラクターが100%優先度に達すると、ターンは複数のフェーズで進行します。各フェーズで特定のイベントが発生します：</p>

                    <div className="space-y-6 mt-6">
                        {/* 開始フェーズ */}
                        <div className="border-l-4 border-green-500 pl-4">
                            <h4 className="text-lg font-bold text-green-400">1. 開始フェーズ</h4>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>全てのスキルクールダウンが1減少。</li>
                                <li>継続回復（HoT）効果が適用（<EffectInlineTag name="BT_CONTINU_HEAL" type="buff" />など）</li>
                                <li>継続ダメージ（DoT）効果が適用（<EffectInlineTag name="BT_DOT_BLEED" type="debuff" />など）</li>
                            </ul>
                        </div>

                        {/* アクションフェーズ */}
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="text-lg font-bold text-blue-400">2. アクションフェーズ</h4>
                            <p className="mt-2 text-yellow-400"><EffectInlineTag name="BT_STUN" type="debuff" />などの行動不能効果を受けている場合、このフェーズはスキップされ、ターンは直接終了フェーズに進みます。</p>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <h5 className="font-semibold text-blue-300">2-1: 選択フェーズ</h5>
                                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                        <li>強制行動が最初に解決されます（<EffectInlineTag name="BT_AGGRO" type="debuff" />など）、即座にヒットフェーズを開始。</li>
                                        <li>その後、プレイヤーがスキルとターゲットを選択。</li>
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-blue-300">2-2: ヒットフェーズ</h5>
                                    <div className="ml-4 mt-2 space-y-3">
                                        <div>
                                            <p className="font-medium">スキルは3段階で実行されます：</p>
                                            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                                                <li>
                                                    <strong>プレヒット：</strong>スキルがヒットする前に発生。例えば、<SkillInline character="Drakhan" skill="S3" />のEE+10はヒット前に<EffectInlineTag name="BT_DOT_CURSE" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />を付与 — スキルのダメージがデバフ数に依存するため重要。
                                                </li>
                                                <li>
                                                    <strong>ヒット：</strong>スキルが接続 — 直接ダメージと回復が適用。
                                                </li>
                                                <li>
                                                    <strong>ポストヒット：</strong>スキルがヒットした後に発生 — 例えば、<SkillInline character="Demiurge Vlada" skill="S3" />はポストヒットで<EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />を付与。
                                                </li>
                                            </ul>
                                        </div>
                                        <p>追加ヒットが発動（<SkillInline character="Ryu Lion" skill="S2" />など）。</p>
                                        <p>味方の反応（<SkillInline character="Caren" skill="S2" />など）も発動可能。これらのフォローアップ効果は位置順で解決：<strong>右前→上→下→左後</strong>。</p>
                                        <p>敵の反応（<EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />、<EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" />、<EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />など）も発生可能で、同じ位置順に従います。</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 終了フェーズ */}
                        <div className="border-l-4 border-purple-500 pl-4">
                            <h4 className="text-lg font-bold text-purple-400">3. 終了フェーズ</h4>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>復活効果が解決（<EffectInlineTag name="BT_REVIVAL" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} />や<SkillInline character="Demiurge Astei" skill="S2" />など）。</li>
                                <li>残りの全てのバフとデバフの持続時間が1ターン減少 — 開始フェーズで既に処理されたものを除く。</li>
                                <li>残りの優先度増減が適用。</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1ターン目の計算 */}
            <section className="space-y-6">
                <GuideHeading level={2}>1ターン目の計算</GuideHeading>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <p>戦闘開始時、最も高い<StatInlineTag name="SPD" />を持つユニットが最初に行動します。他の全てのユニットは、最速ユニットと比較したSPDに比例した優先度値から開始します。</p>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-blue-300">例：</p>
                        <ul className="list-disc list-inside ml-4 mt-2">
                            <li>最速ユニットが<strong>300 SPD</strong>の場合、<strong>100%</strong>優先度から開始。</li>
                            <li><strong>200 SPD</strong>のユニットは<strong>66%</strong>から開始（200 × 100 / 300）。</li>
                            <li><strong>150 SPD</strong>のユニットは<strong>50%</strong>から開始（150 × 100 / 300）。</li>
                        </ul>
                    </div>

                    <p className="mt-4">ただし、ゲームには各ユニットの開始優先度に適用される<strong>0-5%</strong>の隠れたランダム変動があります。その結果、わずかに遅いユニットでも先に行動する可能性があります。</p>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-yellow-400">RNGを含む例：</p>
                        <p className="mt-2">ユニットA：300 SPD → 100% +0% = 100%</p>
                        <p>ユニットB：290 SPD → 96% + 5% = 101%</p>
                        <p className="mt-2">→ <strong>ユニットBが先に行動します。</strong></p>
                    </div>

                    <p className="mt-4">このメカニクスは<strong>PvP</strong>で特に重要で、1ターン目が試合の結果に大きく影響する可能性があります。</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-sky-300">戦闘開始時の速度バフ</h4>
                    <p>一部のユニットは<EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />を持って戦闘を開始し、ターン順序を大きく変更する可能性があります。</p>

                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
                        <p className="font-semibold text-purple-300">例：</p>
                        <p className="mt-2"><CharacterLinkCard name="Tamara" icon={false} />：300 SPD → 100%優先度</p>
                        <p><CharacterLinkCard name="Dahlia" icon={false} />：280 SPD → 93%（280 × 100 / 300）</p>
                        <p className="mt-2">通常、<CharacterLinkCard name="Tamara" icon={false} />が先に行動します。</p>
                        <p className="mt-2">しかし、<CharacterLinkCard name="Dahlia" icon={false} />が<EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />を持って開始すると（例：EEから）、有効SPDは：</p>
                        <p>280 × 1.3 = 364 → 100%優先度</p>
                        <p><CharacterLinkCard name="Tamara" icon={false} />：300 SPD → <strong>82%</strong>（300 × 100 / 364）</p>
                        <p className="mt-2">→ <strong><CharacterLinkCard name="Dahlia" icon={false} />が先に行動します。</strong></p>
                    </div>

                    <p className="mt-4">一部の超越特典はチーム全体に<StatInlineTag name="SPD" />ボーナスを付与します（<CharacterLinkCard name="Mene" />や<CharacterLinkCard name="Demiurge Delta" />など）。</p>
                </div>
            </section>

            {/* 例外 */}
            <section className="space-y-6">
                <GuideHeading level={2}>特殊メカニクス＆例外</GuideHeading>

                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">追加ターン</h4>
                        <p>スキルが<EffectInlineTag name="BT_ADDITIVE_TURN" type="buff" />を適用すると、キャラクターは0%優先度にリセットされる前に、即座に完全なターン（全てのフェーズを含む）を取ります。</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">デミウルゴスヴラダのパッシブ</h4>
                        <p>5★ <CharacterLinkCard name="Demiurge Vlada" />が戦闘にいる場合、敵チームの全ての<strong>優先度増加効果</strong>が<strong>50%</strong>減少します。</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                        <h4 className="text-lg font-semibold text-amber-300">アリーナフィールドスキル</h4>
                        <p>アリーナでは、2つのフィールドスキルが適用されます：</p>
                        <ul className="list-disc list-inside ml-4 mt-3 space-y-2">
                            <li>
                                <GuideIconInline name="Skill_PVP_LeagueBuff_01" text="強者の鼓動" /> <strong>強者の鼓動</strong>：ゴールドIII以降、全てのヒーローの<StatInlineTag name="RES" />を50増加
                            </li>
                            <li>
                                <GuideIconInline name="Skill_PVP_Penalty" text="決闘者の誓い" /> <strong>決闘者の誓い</strong>：復活後、優先度を50%減少。10ターンごとに、全てのヒーローに最大HPの10%を固定ダメージとして与える（<EffectInlineTag name="BT_INVINCIBLE" type="buff" />、<EffectInlineTag name="BT_UNDEAD" type="buff" />を貫通）
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

        </div>
    )
}

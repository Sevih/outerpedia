'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import StatInlineTag from '@/app/components/StatInlineTag'
import Accordion from '@/app/components/ui/Accordion'
import GenericTabs from '@/app/components/Tabs'
import StatBlock from '@/app/components/guides/StatBlock'
import SkillInline from '@/app/components/SkillInline'
import GuideIconInline from '@/app/components/GuideIconInline';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ClassInlineTag from '@/app/components/ClassInlineTag';
import buffscollection from '@/data/buffs.json'
import debuffscollection from '@/data/debuffs.json'
import Image from 'next/image'


export default function BasicStatsGuide() {
    return (
        <GenericTabs
            defaultKey="stats"
            tabs={[
                {
                    key: 'stats',
                    label: 'Basic Stats',
                    content: <StatsContent />
                },
                {
                    key: 'combat',
                    label: 'Combat Basics',
                    content: <CombatBasicsContent />
                },
                {
                    key: 'buff',
                    label: 'Buffs',
                    content: <BuffBasics />
                },
                {
                    key: 'debuff',
                    label: 'Debuffs',
                    content: <DeBuffBasics />
                }
            ]}
        />
    )
}

function DeBuffBasics() {

    const customIconBuffs = new Set([
        'Buff Stealing',
        'Buff Removal',
        'Buff Reversal',
        'Detonate', 'Extinction',
        'Increase Debuff Duration',
        'Reduced Buff Duration', 
        'Uncounterrable',
        'Unique Resource Down'

        // Ajoute ici d'autres noms sans icône officielle
    ])

    const ignoreBuffs = new Set([
        'BT_AGGRO_IR',
        'BT_SEAL_ADDITIVE_ATTACK_IR',
        'BT_SEAL_ADDITIVE_TURN_IR',
        'BT_STAT|ST_ATK_IR',
        'BT_STONE_IR',
        'BT_STAT|ST_DEF_IR',
        'BT_STAT|ST_CRITICAL_RATE_IR',
        'BT_STUN_IR', 'BT_SYS_DEBUFF_ENHANCE_IR',
        'BT_SILENCE_IR',
        'BT_DOT_POISON_IR'
    ])

    const filteredBuffs = debuffscollection
        .filter(buff =>
            !buff.name.startsWith('UNIQUE') &&
            !ignoreBuffs.has(buff.name)
        )
        .sort((a, b) => a.label.localeCompare(b.label))

    return (
        <div className="flex flex-col md:flex-row gap-6 text-base leading-relaxed text-white">
            <div className="flex-1 space-y-4">
                <GuideHeading level={2}>Debuffs</GuideHeading>
                <p>
                    Debuffs are detrimental effects that are applied to characters.
                </p>
                <p className="text-orange-400 italic">
                    Those whose names appear in orange italics do not have an in-game icon. The one displayed is the custom icon used on this website.
                </p>
                <p>
                    Here is the list of those (excluding irremovable unique character mechanics):
                </p>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full table-auto border-separate border-spacing-y-2 text-sm">
                        <thead>
                            <tr className="text-left bg-white/5">
                                <th className="p-2 rounded-l">Icon</th>
                                <th className="p-2">Name</th>
                                <th className="p-2 rounded-r">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBuffs.map((buff) => {
                                const iconPath = `/images/ui/effect/${buff.icon}.png`; // .png pour l’affichage
                                const showEffectColor = !buff.description.toLowerCase().includes('cannot be removed');
                                const imageClass = showEffectColor ? 'debuff' : '';

                                return (
                                    <tr key={buff.name} className="bg-white/5 hover:bg-white/10 rounded-lg">
                                        <td className="p-2 rounded-l">
                                            <Image
                                                src={iconPath}
                                                alt={buff.label}
                                                width={32}
                                                height={32}
                                                className={`w-8 h-8 object-contain ${imageClass}`}
                                            />
                                        </td>
                                        <td className="p-2 font-medium">
                                            <span className={customIconBuffs.has(buff.label) ? 'text-orange-400 italic' : ''}>
                                                {buff.label}
                                            </span>
                                        </td>
                                        <td className="p-2 text-neutral-300 rounded-r">{buff.description}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function BuffBasics() {
    const customIconBuffs = new Set([
        'Heavy Strike',
        'Extra Turn',
        'Dual Attack',
        'Agile Respond',
        'Debuff Removal',
        'Increase Buff Duration',
        'Increase Priority',
        'Resurrection (Greater)',
        'Revenge'
        // Ajoute ici d'autres noms sans icône officielle
    ])

    const ignoreBuffs = new Set([
        'BT_STAT|ST_CRITICAL_RATE_IR',
        'BT_STAT|ST_AVOID_IR',
        'BT_STAT|ST_DEF_IR',
        'BT_STAT|ST_ATK_IR',
        'BT_STAT|ST_SPEED_IR',
        'BT_INVINCIBLE_IR',
        'BT_SYS_BUFF_ENHANCE_IR',
        'BT_DAMGE_TAKEN'
    ])

    const filteredBuffs = buffscollection
        .filter(buff =>
            !buff.name.startsWith('UNIQUE') &&
            !ignoreBuffs.has(buff.name)
        )
        .sort((a, b) => a.label.localeCompare(b.label))


    return (
        <div className="flex flex-col md:flex-row gap-6 text-base leading-relaxed text-white">
            <div className="flex-1 space-y-4">
                <GuideHeading level={2}>Buffs</GuideHeading>
                <p>
                    Buffs are beneficial effects that are applied to characters.
                </p>
                <p className="text-orange-400 italic">
                    Those whose names appear in orange italics do not have an in-game icon. The one displayed is the custom icon used on this website.
                </p>
                <p>
                    Here is the list of those (excluding irremovable unique character mechanics):
                </p>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full table-auto border-separate border-spacing-y-2 text-sm">
                        <thead>
                            <tr className="text-left bg-white/5">
                                <th className="p-2 rounded-l">Icon</th>
                                <th className="p-2">Name</th>
                                <th className="p-2 rounded-r">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBuffs.map((buff) => {
                                const iconPath = `/images/ui/effect/${buff.icon}.png`; // .png pour l’affichage
                                const showEffectColor = !buff.description.toLowerCase().includes('cannot be removed');
                                const imageClass = showEffectColor ? 'buff' : '';

                                return (
                                    <tr key={buff.name} className="bg-white/5 hover:bg-white/10 rounded-lg">
                                        <td className="p-2 rounded-l">
                                            <Image
                                                src={iconPath}
                                                alt={buff.label}
                                                width={32}
                                                height={32}
                                                className={`w-8 h-8 object-contain ${imageClass}`}
                                            />
                                        </td>
                                        <td className="p-2 font-medium">
                                            <span className={customIconBuffs.has(buff.label) ? 'text-orange-400 italic' : ''}>
                                                {buff.label}
                                            </span>
                                        </td>
                                        <td className="p-2 text-neutral-300 rounded-r">{buff.description}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function CombatBasicsContent() {
    return (
        <div className="flex flex-col md:flex-row gap-6 text-base leading-relaxed text-white">
            <div className="flex-1 space-y-4">
                <GuideHeading level={2}>Turn-Based Priority System</GuideHeading>
                <p>
                    Imagine every battle in <strong>Outerplane</strong> as a 100-meter circular racetrack.<br />
                    Each character — ally or enemy — runs along this track. <br />
                    The first to complete a full lap (100%) reaches the action line and gets to <strong>take their turn</strong>.
                </p>
                <p>
                    In-game, this progress is displayed as a <strong>percentage</strong> when you click the turn order icon <GuideIconInline name="IG_Menu_Btn_Action" text="" />:
                    <br />
                    <strong>0%</strong> = starting line
                    <br />
                    <strong>100%</strong> = action line — you take your turn
                </p>
                <Accordion
                    items={[
                        {
                            key: 'speed',
                            title: (
                                <>
                                    <StatInlineTag name='SPD' />
                                </>
                            ),
                            content: (
                                <>
                                    <p>
                                        You can imagine that <StatInlineTag name='SPD' /> is your character’s running speed — it’s the stat that determines how fast they advance on the track.
                                    </p>
                                    <ul className="list-disc list-inside">
                                        <li>Higher <StatInlineTag name='SPD' /> means you reach 100% faster.</li>
                                        <li>A character with 200 <StatInlineTag name='SPD' /> moves twice as fast as one with 100.</li>
                                        <li>This means they can act twice while the other acts only once.</li>
                                    </ul>

                                    <p>
                                        This isn&apos;t a fixed turn-order system — it&apos;s a continuous flow.
                                        Characters act as soon as they reach 100%.
                                    </p>
                                </>
                            )
                        },
                        {
                            key: 'priority',
                            title: (
                                <>
                                    <span className='text-amber-400'>Priority</span>
                                </>
                            ),
                            content: (
                                <>
                                    <p>
                                        Some skills or effects alter your <strong>current position</strong> on the track, regardless of your speed. You can imagine this as your character teleporting forward or backward on the track.<br />
                                        This is known as <strong>increasing or reducing <span className='text-amber-400'>priority</span></strong>. <br />
                                        In other games, similar systems exist — such as Combat Readiness in Epic Seven or the ATB gauge in Summoner’s War.
                                    </p>
                                    <p className="text-sm text-yellow-400">
                                        Priority has no official in-game icon. However, this website uses the following icon to represent it :<span style={{
                                            filter: 'grayscale(1)'
                                        }}><GuideIconInline name="SC_Buff_Effect_Increase_Priority" text="" /></span>.
                                    </p>
                                    <p>
                                        Here are the directly associated effects:
                                    </p>
                                    <p>
                                        <span className="text-sky-400">Beneficial</span> : <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> — pushes the character forward.
                                    </p>
                                    <p>
                                        <span className="text-red-400">Detrimental</span> : <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> — pushes the character backward.
                                    </p>
                                    <p className="text-sm text-yellow-400">
                                        <strong>Note: </strong>
                                        <span className="text-sm text-white">
                                            Priority can never exceed 100% or drop below 0%.<br /><br />

                                            When multiple characters reach 100% at different times, the one who gets there first will act first. This is the most common case.<br /><br />

                                            However, if multiple characters reach 100% <strong>within the same action</strong> (e.g. due to a mass +Priority boost), then the acting order is based on a fixed positional priority:<br />
                                            <strong>Front-right → Top → Bottom → Back-left</strong><br /><br />

                                            This positional rule is only used when multiple characters are pushed to 100% at the exact same time.<br />
                                            ⚠️ Additional Priority boosts applied <strong>after</strong> 100% are ignored and have no effect on the turn order.<br /><br />

                                            In such cases, the acting team always goes first, followed by the enemy team — each resolving ties based on the positional rule above.
                                        </span>
                                    </p>
                                </>
                            )
                        },
                        {
                            key: 'turn-flow',
                            title: (
                                <>
                                    <span className='text-amber-400'>Turn Flow Breakdown</span>
                                </>
                            ),
                            content: (
                                <>
                                    <p>When a character reaches 100% priority, their turn proceeds in several phases. Each phase triggers specific events:</p>

                                    <ul className="list-decimal list-inside space-y-1">
                                        <li>
                                            <strong>Starting Phase</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>All skill cooldowns are reduced by 1.</li>
                                                <li>Healing-over-time (HoT) effects are applied, such as <EffectInlineTag name="SYS_CONTINU_HEAL" type="buff" /></li>
                                                <li>Damage-over-time (DoT) effects are applied, such as <EffectInlineTag name="BT_DOT_BLEED" type="debuff" /></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Action Phase</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>If the unit is under crowd control effects like <EffectInlineTag name="BT_STUN" type="debuff" />, this phase is skipped and the turn proceeds directly to the Ending Phase.</li>
                                                <li>
                                                    <strong>2-1: Choice Phase</strong>
                                                    <ul className="list-disc list-inside ml-4">
                                                        <li>Forced actions are resolved first, such as <EffectInlineTag name="BT_AGGRO" type="debuff" />, which immediately starts the Hit Phase.</li>
                                                        <li>Then, the player selects a skill and a target.</li>
                                                    </ul>
                                                </li>
                                                <li>
                                                    <strong>2-2: Hit Phase</strong>
                                                    <ul className="list-disc list-inside ml-4">
                                                        <li>The skill executes in three stages:
                                                            <ul className="list-disc list-inside ml-4">
                                                                <li><strong>Pre-Hit:</strong> Happens before the skill hits. For example, <SkillInline character="Drakhan" skill="S3" />
                                                                    with EE+10 applies a <EffectInlineTag name="BT_DOT_CURSE" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} /> before it hits —
                                                                    important, as the skill’s damage scales with the number of debuffs.</li>
                                                                <li><strong>Hit:</strong> The skill connects — direct damage and healing are applied.</li>
                                                                <li><strong>Post-Hit:</strong> Triggers after the skill hits — for example, <SkillInline character="Demiurge Vlada" skill="S3" /> inflicts <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }}/> post-hit.</li>
                                                            </ul>
                                                        </li>
                                                        <li>Extra hits are triggered, such as <SkillInline character="Ryu Lion" skill="S2" />.</li>
                                                        <li>Ally reactions, like <SkillInline character="Caren" skill="S2" />, may also trigger. These follow-up effects are resolved in positional order: <strong>Front-right → Top → Bottom → Back-left</strong>.</li>
                                                        <li>Enemy reactions such as <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />, <EffectInlineTag name="SYS_REVENGE_HEAL" type="buff" /> or <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> may occur, and also follow this positional order.</li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Ending Phase</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>Revive effects are resolved, such as <EffectInlineTag name="BT_REVIVAL" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} /> or <SkillInline character="Demiurge Astei" skill="S2" />.</li>
                                                <li>All remaining buffs and debuffs decrease their duration by 1 turn — except those already processed during the Starting Phase.</li>
                                                <li>Any remaining priority gains or losses are now applied.</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'first-turn',
                            title: (
                                <>
                                    <span className='text-amber-400'>First Turn Calculation</span>
                                </>
                            ),
                            content: (
                                <>
                                    <p>At the start of battle, the unit with the highest <StatInlineTag name="SPD" /> will act first. All other units begin with a priority value proportional to their SPD compared to the fastest unit.</p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li>If the fastest unit has <strong>300 SPD</strong>, she starts at <strong>100%</strong> priority.</li>
                                        <li>A unit with <strong>200 SPD</strong> starts at <strong>66%</strong> (200 × 100 / 300).</li>
                                        <li>A unit with <strong>150 SPD</strong> starts at <strong>50%</strong> (150 × 100 / 300).</li>
                                    </ul>
                                    <p className="mt-2">However, the game includes a hidden random variation of <strong>0-5%</strong> applied to each unit’s starting priority.. As a result, a slightly slower unit may still act first.</p>
                                    <p className="text-sm text-yellow-400">
                                        Example:
                                        <br />
                                        Unit A: 300 SPD → 100% +0% = 100%
                                        <br />
                                        Unit B: 290 SPD → 96% + 5% = 101%
                                        <br />
                                        → <strong>Unit B will act first.</strong>
                                    </p>
                                    <p className="mt-2">This mechanic is especially important in <strong>PvP</strong>, where the first turn can greatly influence the outcome of a match.</p>
                                    <p className="mt-4">Some units may start the battle with a <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" />, significantly altering turn order.</p>
                                    <p>Example:
                                        <br />
                                        Tamara: 300 SPD → 100% priority
                                        <br />
                                        Dahlia: 280 SPD → 93% (280 × 100 / 300)
                                        <br />
                                        Normally, Tamara would go first.
                                        <br />
                                        But if Dahlia starts with a <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> (e.g., from her EE), her effective SPD becomes:
                                        <br />
                                        280 × 1.3 = 364 → 100% priority
                                        <br />
                                        Tamara: 300 SPD → <strong>82%</strong> (300 × 100 / 364)
                                        <br />
                                        → <strong>Dahlia will act first.</strong>
                                    </p>
                                    <p className="mt-2">Some transcendence perks also grant <StatInlineTag name="SPD" /> bonuses  to the entire team, such as with <CharacterLinkCard name="Mene" /> or <CharacterLinkCard name="Demiurge Delta" />.</p>
                                </>
                            )

                        },
                        {
                            key: 'exceptions',
                            title: (
                                <>
                                    <span className='text-amber-400'>Exceptions</span>
                                </>
                            ),
                            content: (
                                <>
                                    <p>
                                        In some cases, the previous rules don’t apply exactly. Here are a few known exceptions:
                                    </p>
                                    <ul className='list-disc list-inside mt-2'>
                                        <li>
                                            If a skill applies <EffectInlineTag name="BT_ADDITIVE_TURN" type="buff" />, the character will immediately take another full turn (including all phases) before resetting to 0% priority.
                                        </li>
                                        <li>
                                            If a 5★ <CharacterLinkCard name="Demiurge Vlada" /> is in battle, all <strong>priority gain effects</strong> on the enemy team are reduced by <strong>50%</strong>.
                                        </li>
                                        <li>
                                            In arena, two field skill are applied :
                                            <ul className='list-disc list-inside ml-5 mt-2'>
                                                <li><GuideIconInline name="Skill_PVP_LeagueBuff_01" text="Pulse of the mighty" />Pulse of the mighty : increase all heroes <StatInlineTag name="RES" /> by 50 after Gold III</li>
                                                <li><GuideIconInline name="Skill_PVP_Penalty" text="Duelist's Pledge" /> : decrease priority by 50% after resurrection. <br />Every 10 turn, deals 10% of max HP to all heroes as true damage (bypassing <EffectInlineTag name="BT_INVINCIBLE" type="buff" />, <EffectInlineTag name="BT_UNDEAD" type="buff" />) </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },

                    ]} />
                <GuideHeading level={2}>FAQ</GuideHeading>
                <Accordion
                    items={[
                        {
                            key: 'speed-formula',
                            title: 'How is speed calculated?',
                            content: (
                                <>
                                    <p>The base formula used to calculate speed in <strong>Outerplane</strong> is:</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit">
                                        SPD = Base SPD + Gear SPD + (Base SPD × Set Effect %)
                                    </p>
                                    <ul className="list-disc list-inside mt-2">
                                        <li><strong>Base SPD:</strong> The character&apos;s innate, unmodified speed.</li>
                                        <li><strong>Gear SPD:</strong> Flat speed gained from equipped gear.</li>
                                        <li>
                                            <strong>Set Effect:</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>0 if no Speed set equipped</li>
                                                <li>0.12 (12%) if 2-piece Speed set</li>
                                                <li>0.25 (25%) if 4-piece Speed set</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )

                        },
                        {
                            key: 'priority-formula',
                            title: 'How is turn 1 priority calculated?',
                            content: (
                                <>
                                    <p>The formula used to calculate initial priority at the start of battle:</p>
                                    <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit">
                                        Priority = (SPD + Ally Speed transcend bonus + (SPD × Buff %)) × 100 / (Top SPD + Top SPD team Ally Speed transcend bonus + (Top SPD × Buff %))
                                    </p>
                                    <ul className="list-disc list-inside mt-2">
                                        <li><strong>SPD:</strong> Total speed of the unit, as calculated above.</li>
                                        <li><strong>Top SPD:</strong> Highest SPD among all units (used as divisor).</li>
                                        <li><strong>Ally Speed transcend bonus:</strong> Speed from transcendence.</li>
                                        <li><strong>Buff:</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>0 if no buff speed</li>
                                                <li>0.3 (30%) if buff speed</li>
                                                <li>-0.3 (-30%) if malus speed</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        },
                        {
                            key: 'max-speed',
                            title: 'Max theoretical speed',
                            content: (
                                <>
                                    <p>The maximum theoretical speed is:</p>
                                    <ul className="list-disc list-inside mt-2">
                                        <li><strong>Base speed:</strong> 154 hit by <ClassInlineTag name="Ranger" /></li>
                                        <li><strong>Gear SPD:</strong> 138 (18 per piece + 48 from Accessory)</li>
                                        <li><strong>Set SPD:</strong> 38 (on a 154 character)</li>
                                        <li><strong>Ally Speed transcend bonus:</strong>30 (Dianne + Mene + Demiurge Delta)</li>
                                    </ul>
                                    <p>Leading to a grand total of : 360 (468 including the speed buff)</p>
                                    <p>Ryu Lion can go further with her 4 star transcend bonus : 370  (481 with speed buff) </p>
                                </>
                            )
                        },
                    ]
                    }
                />
            </div>
        </div>
    );
}

function StatsContent() {
    const sections = [
        { id: 'atk', label: 'Attack' },
        { id: 'def', label: 'Defense' },
        { id: 'hp', label: 'Health' },
        { id: 'spd', label: 'Speed' },
        { id: 'chc', label: 'Crit Chance' },
        { id: 'chd', label: 'Crit Damage' },
        { id: 'acc', label: 'Accuracy' },
        { id: 'eva', label: 'Evasion' },
        { id: 'eff', label: 'Effectiveness' },
        { id: 'res', label: 'Resilience' },
        { id: 'pen', label: 'Penetration' },
        { id: 'interactions', label: 'Important Interactions' }
    ]

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Content */}
            <div className="flex-1 space-y-16">
                {/* Mobile TOC */}
                <div className="md:hidden border-b border-white/10 pb-4 mb-8">
                    <h2 className="text-lg font-bold mb-2">Summary</h2>
                    <ul className="flex flex-wrap gap-4 text-sm">
                        {sections.map(({ id, label }) => (
                            <li key={id}>
                                <a href={`#${id}`} className="text-blue-400 hover:underline">
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sections */}
                <GuideHeading level={2}>Main Stats</GuideHeading>
                <div className="gap-6">
                    <section className="scroll-offset" id="atk">
                        <StatBlock
                            title="Attack"
                            abbr="ATK"
                            desc="The higher your attack, the more damage you deal to enemies."
                            effect={{
                                buff: ["BT_STAT|ST_ATK"],
                                debuff: ["BT_STAT|ST_ATK"]
                            }}
                            text={
                                <>
                                    <p>Attack directly increases the raw damage dealt by your skills.
                                        However, some skills scale with other stats or ignore Attack entirely.</p>
                                    <p>Some DoTs (damage over time) are impacted by attack like :</p>
                                    <ul className="ml-5">
                                        <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_BLEED" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_POISON" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /></li>
                                    </ul>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="def">
                        <StatBlock
                            title="Defense"
                            abbr="DEF"
                            desc="The higher your defense, the less damage you take from enemies."
                            effect={{
                                buff: ["BT_STAT|ST_DEF"],
                                debuff: ["BT_STAT|ST_DEF"]
                            }}
                            text={
                                <>
                                    <p>
                                        Defense reduces the amount of damage taken from most sources. Some skills are subject to scale with defense like <SkillInline character="Caren" skill="S3" />.
                                    </p>
                                    <p>
                                        However, some ingame mechanics can partially or completely ignore DEF, such as:
                                    </p>
                                    <ul className="ml-5">
                                        <li><EffectInlineTag name="BT_DOT_BURN" type="debuff" /></li>
                                        <li><EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="buff" /></li>
                                        <li><EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /></li>
                                    </ul>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="hp">
                        <StatBlock
                            title="Health"
                            abbr="HP"
                            desc="You can no longer participate in combat once your Health falls below zero."
                            effect={{
                                buff: [],
                                debuff: []
                            }}
                            text={
                                <>
                                    <p>
                                        Health represents the total amount of damage a unit can take before being defeated.
                                        Once HP reaches 0, the unit is immediately removed from combat.
                                    </p>
                                    <p>Like Attack, some skills scale with HP, such as <SkillInline character="Demiurge Drakhan" skill="S1" />.</p>
                                    <p>
                                        You can replenish HP with healing skills, and protect it with buffs like:
                                    </p>
                                    <ul className="ml-5">
                                        <li><EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /></li>
                                        <li><EffectInlineTag name="BT_INVINCIBLE" type="buff" /></li>
                                        <li><EffectInlineTag name="BT_UNDEAD" type="buff" /></li>
                                    </ul>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="spd">
                        <StatBlock
                            title="Speed"
                            abbr="SPD"
                            desc="The higher the speed, the more often you can act."
                            effect={{
                                buff: ["BT_STAT|ST_SPEED"],
                                debuff: ["BT_STAT|ST_SPEED"]
                            }}
                            text={
                                <>
                                    <p>
                                        Speed determines how quickly a unit&apos;s turn comes. The higher the SPD, the more frequently a unit can act during combat.
                                        This stat directly affects action order and overall tempo.
                                    </p>
                                    <p>
                                        Like Attack, some skills scale with SPD, such as <SkillInline character="Stella" skill="S2" />.
                                    </p>
                                    <p>
                                        Certain mechanics directly manipulate turn order or interact with SPD.
                                    </p>
                                    <p>Further details will be provided in the Combat Basics section, since Speed is directly linked to the concept of “Priority”.</p>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="chc">
                        <StatBlock
                            title="Crit Chance"
                            abbr="CHC"
                            desc="Chance for a critical hit to occur. When a critical hit occurs, the damage dealt is increased according to critical damage."
                            effect={{
                                buff: ["BT_STAT|ST_CRITICAL_RATE"],
                                debuff: ["BT_STAT|ST_CRITICAL_RATE"]
                            }}
                            text={
                                <>
                                    <p>
                                        By default, most characters start with a low base Crit Chance and must build it through gear, buffs, quirks, or passives.
                                        Reaching 100% Crit Chance guarantees that every eligible attack will crit.
                                    </p>
                                    <p>
                                        Important notes:
                                    </p>
                                    <ul className="ml-5">
                                        <li>Crit Chance is capped at 100% — any excess is wasted.</li>
                                        <li>Healing and Shielding cannot crit.</li>
                                        <li>Skills with <EffectInlineTag name="Heavy Strike" type="buff" triggerStyle={{ verticalAlign: 'middle', marginTop: '-6px' }} /> effect cannot crit like <SkillInline character="Kitsune of Eternity Tamamo-no-Mae" skill="S1" />.</li>
                                        <li>Damage over Time effects cannot crit.</li>
                                    </ul>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="chd">
                        <StatBlock
                            title="Crit Dmg"
                            abbr="CHD"
                            desc="Increase Damage upon scoring a critical hit."
                            effect={{
                                buff: ["BT_STAT|ST_CRITICAL_DMG_RATE"],
                                debuff: ["BT_STAT|ST_CRITICAL_DMG_RATE"]
                            }}
                            text={
                                <>
                                    <p>
                                        Crit Damage determines how much bonus damage is applied when you land a critical hit.
                                        The formula typically multiplies your base damage by a percentage defined by your Crit Dmg stat.
                                    </p>
                                    <p>
                                        All units start with a base Crit Damage of 150%.
                                    </p>
                                    <p>
                                        Investing in Crit Damage isn’t worthwhile if your Crit Chance is low.
                                    </p>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="acc">
                        <StatBlock
                            title="Accuracy"
                            abbr="ACC"
                            desc="Increases the chance of successfully landing an attack on an enemy. When the caster's Accuracy is higher than the target's Evasion, the caster's attacks have a 100% chance to succeed."
                            effect={{
                                buff: ["BT_STAT|ST_ACCURACY"],
                                debuff: ["BT_STAT|ST_ACCURACY"]
                            }}
                            text={
                                <>
                                    <p>
                                        It is especially important for units that rely on status effects to control enemies.
                                    </p>
                                    <p>
                                        Accuracy is compared directly against the target’s Evasion. If your ACC is higher, the effect or hit is guaranteed to succeed.
                                    </p>
                                    <p>
                                        Important notes :
                                    </p>
                                    <ul className="ml-5">
                                        <li>Countered by <StatInlineTag name="EVA" />.</li>
                                        <li>A miss results in -50% damage and cannot crit.</li>
                                        <li>Certain content (like bosses or PvP) may require high Accuracy to overcome enemy evasion or mechanics.</li>
                                        <li>Some skills apply their debuff before the hit, these are not subject to accuracy/evasion checks.</li>
                                    </ul>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="eva">
                        <StatBlock
                            title="Evasion"
                            abbr="EVA"
                            desc="Increases the chance of evading an enemy's attack. When an attack misses, damage is reduced by 50% and debuffs and critical hits will not land."
                            effect={{
                                buff: ["BT_STAT|ST_AVOID"],
                                debuff: ["BT_STAT|ST_AVOID"]
                            }}
                            text={
                                <>
                                    <p>
                                        Countered by <StatInlineTag name="ACC" />, Evasion increases the chance to avoid enemy attacks. The evasion rate caps at <strong>25%</strong>,
                                        which is reached when your Evasion stat is at least <strong>+40</strong> higher than the enemy&apos;s Accuracy.
                                    </p>
                                    <p>
                                        Important notes :
                                    </p>
                                    <ul className="ml-5">
                                        <li>Damage is reduced by 50% on miss.</li>
                                        <li>No Critical Hits can occur.</li>
                                        <li>Debuffs will not be applied.</li>
                                    </ul>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="eff">
                        <StatBlock
                            title="Effectiveness"
                            abbr="EFF"
                            desc="The higher the Effectiveness, the lower the chance the target has to resist debuffs."
                            effect={{
                                buff: ["BT_STAT|ST_BUFF_CHANCE"],
                                debuff: ["BT_STAT|ST_BUFF_CHANCE"]
                            }}
                            text={
                                <>
                                    <p>
                                        Effectiveness increases the chance of successfully applying debuffs and is countered by <StatInlineTag name="RES" />.
                                    </p>
                                    <p>
                                        If your Effectiveness is equal to or higher than the enemy&apos;s Resilience, the base chance to apply a debuff is 100%.
                                    </p>
                                    <p>
                                        Some skills can scale with Effectiveness, such as Gnosis Beth&apos;s <EffectInlineTag name="BT_DOT_ETERNAL_BLEED" type="debuff" />.
                                    </p>

                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="res">
                        <StatBlock
                            title="Resilience"
                            abbr="RES"
                            desc="The higher the Resilience, the higher the chance to resist debuffs."
                            effect={{
                                buff: ["BT_STAT|ST_BUFF_RESIST"],
                                debuff: ["BT_STAT|ST_BUFF_RESIST"]
                            }}
                            text={
                                <>
                                    <p>
                                        Resilience reduces the chance of receiving debuffs and is countered by <StatInlineTag name="EFF" />.
                                        It is especially important on PvP units and bosses to avoid being crowd-controlled or stat-reduced. You can be immune to debuff by providing your team the <EffectInlineTag name="BT_IMMUNE" type="buff" /> buff.
                                    </p>
                                    <p>
                                        When your RES is higher than the enemy’s EFF, the chance for them to successfully apply a debuff decreases.
                                    </p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li>RES − EFF = 0 → 100% chance</li>
                                        <li>RES − EFF = 100 → 50%</li>
                                        <li>RES − EFF = 300 → 25%</li>
                                        <li>RES − EFF = 900 → 10%</li>
                                    </ul>
                                    <p>
                                        Note: Some skills bypass the resilience check like <SkillInline character="Drakhan" skill="S2" />.
                                    </p>
                                </>
                            }
                        />
                    </section><section className="scroll-offset" id="pen">
                        <StatBlock
                            title="Penetration"
                            abbr="PEN"
                            desc="Penetration lets you ignore a portion of the target’s Defense"
                            effect={{
                                buff: ["BT_STAT|ST_PIERCE_POWER_RATE"],
                                debuff: []
                            }}
                            text={
                                <>
                                    <p>
                                        Penetration ignores a percentage of the enemy’s Defense (DEF) when calculating how much damage your attacks deal.
                                        The higher your PEN, the less DEF is counted in the damage reduction formula.
                                    </p>

                                    <p>
                                        For example, if your target has <strong>2000 DEF</strong> and you have <strong>20% PEN</strong>, it will behave as if they only had <strong>1600 DEF</strong>.
                                        This means your attacks will deal more damage.
                                    </p>

                                    <p>
                                        Penetration becomes more valuable against tanky enemies with high DEF.
                                    </p>

                                    <p className="text-sm text-yellow-400">
                                        <strong>Note:</strong> Penetration removes a portion of the target’s DEF, so the damage boost is not linear.
                                        The more DEF the enemy has, the more your PEN will matter. If the enemy got 0 defense (like in joint battle) penetration will become useless.
                                    </p>
                                </>
                            }
                        />

                    </section>

                </div>

                <section className="scroll-offset" id="interactions">
                    <GuideHeading level={2}>FAQ</GuideHeading>
                    <Accordion
                        items={[
                            {
                                key: 'crit-cap',
                                title: 'Can Crit Rate exceed 100%?',
                                content: 'No. Crit Rate is capped at 100%. Any excess has no effect.'
                            },
                            {
                                key: 'crit-on-heal',
                                title: 'Can healing or shielding crit?',
                                content: 'No. Healing, shielding, and utility skills cannot crit unless explicitly stated. Crit mechanics only apply to damage-dealing skills.'
                            },
                            {
                                key: 'dot-crit',
                                title: 'Do DoTs scale with Crit or Crit Damage?',
                                content: 'No. Damage over Time effects (burn, bleed, poison, etc.) do not scale with Crit Rate or Crit Damage. They cannot crit.'
                            },
                            {
                                key: 'dot-scaling',
                                title: 'Do DoTs scale with Attack?',
                                content: 'Yes. Some DoTs scale with the caster’s ATK stat, though the scaling ratio is usually lower than for direct damage.'
                            },
                            {
                                key: 'acc-vs-eva',
                                title: 'How does Accuracy vs Evasion work?',
                                content: 'Your ACC is compared to the enemy’s EVA. If your ACC is higher, you have a 100% chance to hit. If lower, the chance to miss increases based on the gap.'
                            },
                            {
                                key: 'acc-vs-eff',
                                title: 'What’s the difference between Accuracy and Effectiveness?',
                                content: 'Accuracy determines hit chance vs Evasion (can your attack land?), while Effectiveness determines whether debuffs succeed vs Resilience.'
                            },
                            {
                                key: 'debuff-on-miss',
                                title: 'Do debuffs apply if the attack misses?',
                                content: 'No. If an attack misses due to Evasion, it cannot apply debuffs. However, some special skills apply debuffs before or independently of the hit.'
                            },
                            {
                                key: 'guaranteed-debuffs',
                                title: 'Are there skills that apply debuffs even if the hit misses?',
                                content: 'Yes. Certain skills apply debuffs before dealing damage or without relying on Accuracy checks. These usually state it clearly in their description.'
                            },
                            {
                                key: 'eff-res-formula',
                                title: 'Is there a minimum debuff success chance?',
                                content: 'No. The success chance depends on the difference between the attacker\'s Effectiveness (EFF) and the target\'s Resilience (RES). If EFF ≥ RES, the success chance is 100%. Otherwise, the chance decreases with a lower bound that depends on how much RES exceeds EFF. For example, a RES − EFF difference of 300 leads to a 25% chance, and a difference of 900 leads to only 10%.'
                            },
                            {
                                key: 'pen-vs-high-def',
                                title: 'Is Penetration more effective against high DEF?',
                                content: 'Yes. The more DEF the enemy has, the greater the damage gain from Penetration, since it reduces the effective DEF used in the damage formula.'
                            },
                            {
                                key: 'pen-vs-dots',
                                title: 'Does Penetration affect DoT or true damage?',
                                content: 'No. Penetration only affects damage that is reduced by DEF. It has no effect on fixed damage or DoTs.'
                            },
                            {
                                key: 'fixed-damage-mitigation',
                                title: 'Can Defense reduce fixed damage?',
                                content: 'No. Fixed damage ignores DEF. Only shields or invincibility can prevent it.'
                            },
                            {
                                key: 'dual-scaling',
                                title: 'Can skills scale with more than one stat?',
                                content: (
                                    <>
                                        <p>
                                            Not exactly. Outerplane does not currently feature skills that use two stats evenly (e.g., 50% ATK + 50% HP).
                                            What is often referred to as “dual-scaling” is actually <strong>secondary scaling</strong> — a main stat (usually ATK), with a minor bonus from another stat like HP, SPD, or EVA.
                                        </p>
                                        <p className="mt-2">
                                            For example, some skills primarily scale with ATK but gain a bonus from the caster’s Max HP or Speed. <SkillInline character="Regina" skill="S3" /> includes minor scaling with Evasion, and D. Stella has partial scaling from HP.
                                        </p>
                                        <p className="mt-2">
                                            These secondary scalings are usually small and should not be the focus of gear building. There are also skills that use a stat other than ATK entirely — such as HP-based or DEF-based damage.
                                        </p>
                                    </>
                                )
                            }
                            ,
                            {
                                key: 'stat-scaling',
                                title: 'How do I know which stats are used for a skill?',
                                content: (
                                    <>
                                        <p>If nothing is mentioned, the skill usually scales with ATK by default.</p>
                                        <p>If it uses a different stat, you&apos;ll see one of these:</p>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>“Damage dealt increases proportional to Max Health <strong>instead of</strong> Attack.”</li>
                                            <li>“Damage dealt increases proportional to Max Health.” (in addition to ATK)</li>
                                        </ul>
                                        <p>The wording is important: “instead of” replaces ATK scaling, while without it means additional scaling.</p>
                                    </>
                                )
                            },
                            {
                                key: 'formula',
                                title: 'How calculations are done',
                                content: (
                                    <>
                                        <p>
                                            The following formulas and explanations were gathered and tested by <strong>Enebe-NB</strong>, who did an amazing job analyzing combat formulas in Outerplane.
                                        </p>
                                        <p>
                                            For full reference, the data is available here:{' '}
                                            <a
                                                href="https://docs.google.com/spreadsheets/d/10Sl_b7n7_j-PxkNxYGZEvu7HvrJNyRYDSyyYLcUwDOU/edit?gid=938189457#gid=938189457"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 underline"
                                            >
                                                [Google Sheet - Outerplane Analysis by Enebe-NB]
                                            </a>
                                        </p>
                                        <h4 className="font-semibold mt-4">🛡️ Defense Mitigation</h4>
                                        <p><strong>Formula:</strong> <code>f(DEF) = 1000 / (1000 + DEF)</code></p>
                                        <p>This formula determines how much damage is reduced by defense. As DEF increases, the effect of each additional point diminishes (diminishing returns).
                                        </p>
                                        <p>Effective Health (EHP) can be derived from it:</p>
                                        <p>
                                            <strong>Effective HP:</strong> <code>EHP = HP + (HP × DEF / 1000)</code>
                                        </p>

                                        <h4 className="font-semibold mt-4">🎯 Accuracy vs Evasion</h4>
                                        <p>
                                            If <code>EVA - ACC ≤ 0</code>, then chance to evade = 0%.
                                        </p>
                                        <p>
                                            Otherwise:
                                        </p>
                                        <p>
                                            <strong>Formula:</strong> <code>Ratio = min(25%, 1000 / (100 + (EVA - ACC)))</code>
                                        </p>
                                        <p>
                                            This means evasion caps at 25% when your EVA exceeds enemy ACC by 40 or more. Additional EVA beyond this gives no further miss chance.
                                        </p>

                                        <h4 className="font-semibold mt-4">🧪 Effectiveness vs Resilience</h4>
                                        <p>
                                            If <code>EFF ≥ RES</code>, the debuff success chance is 100%.
                                        </p>
                                        <p>
                                            Otherwise, the chance to apply a debuff is calculated using:
                                        </p>
                                        <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit">
                                            Success Chance = 100 / (100 + (RES − EFF))
                                        </p>

                                    </>
                                )

                            },
                            {
                                key: 'damage-formula',
                                title: 'What is the full damage formula in Outerplane?',
                                content: (
                                    <>
                                        <p>
                                            The base formula used to calculate skill damage in Outerplane is:
                                        </p>
                                        <p className="text-sm font-mono bg-black/40 p-2 rounded border border-white/10 w-fit">
                                            Dmg = Elemental × Skill × ATK × Modifiers × (1000 / (1000 + (1 − PEN%) × DEF))
                                        </p>
                                        <ul className="list-disc list-inside mt-2">
                                            <li><strong>Elemental</strong>: 0.8 (disadvantage), 1 (neutral), or 1.2 (advantage)</li>
                                            <li><strong>Skill</strong>: Skill multiplier</li>
                                            <li><strong>ATK</strong>: Your unit&apos;s main scaling stat (can also be HP, DEF, etc. depending on the skill/character)</li>
                                            <li><strong>Modifiers</strong>: Includes Crit Dmg, bonus damage %, secondary scalings (like HP or Evasion), and burst damage effects</li>
                                            <li><strong>PEN%</strong>: Penetration</li>
                                        </ul>
                                        <p className="text-sm text-gray-500 mt-4">
                                            Source:{' '}
                                            <a
                                                href="https://discord.com/channels/1264787916660670605/1264811556059873312/1265103204128133191"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline text-blue-400"
                                            >
                                                Fabool on EvaMains Discord (July 23, 2024)
                                            </a>
                                        </p>
                                    </>
                                )
                            }
                        ]
                        }
                    />
                </section>
            </div>
        </div>
    )
}

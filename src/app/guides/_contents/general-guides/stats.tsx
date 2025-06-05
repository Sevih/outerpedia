'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import StatInlineTag from '@/app/components/StatInlineTag'
import Accordion from '@/app/components/ui/Accordion'
import GenericTabs from '@/app/components/Tabs'
import StatBlock from '@/app/components/guides/StatBlock'

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
                    content: (
                        <div className="prose text-gray-300">
                            <p>Coming soon: detailed explanations of turn order, elemental advantage, and battle flow.</p>
                        </div>
                    )
                }
            ]}
        />
    )
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
                                        Defense reduces the amount of damage taken from most sources. Some skills are subject to scale with defense like Caren S3 : Final cleanup.
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
                                    <p>Like Attack, some skills scale with HP, such as Demiurge Drakhan’s S1.</p>
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
                                        Like Attack, some skills scale with SPD, such as Stella’s S2.
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
                                        <li>Skills with <EffectInlineTag name="Heavy Strike" type="buff" /> effect cannot crit.</li>
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
                                        If your Effectiveness is equal to or higher than the enemy&apos;s Resilience, the base chance to apply a debuff is 100% and the minimum success chance is <strong>25%</strong>, even with extreme differences.
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
                                    <ul className="list-disc list-inside">
                                        <li>EFF 100 vs RES 100 → 100%</li>
                                        <li>EFF 100 vs RES 200 → 50%</li>
                                        <li>EFF 100 vs RES 300 → 25%</li>
                                    </ul>
                                    <p>
                                        Note: Some skills bypass the resilience check like Drakhan S2.
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
                                content: 'Yes. Even with high RES, the minimum success chance is around 25% if the attacker’s EFF is low. Conversely, if EFF > RES, the success chance is 100%.'
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
        For example, some skills primarily scale with ATK but gain a bonus from the caster’s Max HP or Speed. Regina’s <strong>S3</strong> includes minor scaling with Evasion, and D. Stella has partial scaling from HP.
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
                                        <p>
                                            <strong>Formula:</strong> <code>f(DEF) = 1000 / (1000 + DEF)</code>
                                        </p>
                                        <p>
                                            This formula determines how much damage is reduced by defense. As DEF increases, the effect of each additional point diminishes (diminishing returns).
                                        </p>
                                        <p>
                                            Effective Health (EHP) can be derived from it:
                                        </p>
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
                                            If <code>EFF ≥ RES</code>, success chance = 100%.
                                        </p>
                                        <p>
                                            Otherwise:
                                        </p>
                                        <p>
                                            <strong>Formula:</strong> <code>Ratio = max(25%, 100 / (100 + (RES - EFF)))</code>
                                        </p>
                                        <p>
                                            This ensures a minimum 25% chance to apply debuffs even when Effectiveness is much lower than Resilience.
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

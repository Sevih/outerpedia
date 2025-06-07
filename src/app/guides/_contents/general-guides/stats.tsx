'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import StatInlineTag from '@/app/components/StatInlineTag'
import Accordion from '@/app/components/ui/Accordion'
import GenericTabs from '@/app/components/Tabs'
import StatBlock from '@/app/components/guides/StatBlock'
import SkillInline from '@/app/components/SkillInline'
import GuideIconInline from '@/app/components/GuideIconInline';

export default function BasicStatsGuide() {
    return (
        <GenericTabs
            defaultKey="combatFR"
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
                    key: 'combatFR',
                    label: 'Combat BasicsFR',
                    content: <CombatBasicsContentFR />
                }
            ]}
        />
    )
}

function CombatBasicsContentFR() {
    return (
        <div className="flex flex-col md:flex-row gap-6 text-base leading-relaxed text-white">
            <div className="flex-1 space-y-4">
                <GuideHeading level={2}>Système de Priorité au Tour par Tour</GuideHeading>

                <p>
                    Imagine chaque combat dans <strong>Outerplane</strong> comme une piste de course circulaire de 100 mètres.<br />
                    Chaque personnage — allié ou ennemi — court sur cette piste.<br />
                    Le premier à faire un tour complet (100%) atteint la ligne d’action et peut <strong>jouer son tour</strong>.
                </p>

                <p>
                    En jeu, cette progression est affichée en <strong>pourcentage</strong> lorsque vous cliquez sur l’icône de l’ordre d’action <GuideIconInline name="IG_Menu_Btn_Action" text="" /> :
                    <br />
                    <strong>0%</strong> = ligne de départ
                    <br />
                    <strong>100%</strong> = ligne d’action — le personnage joue
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
                                        On peut imaginer que la statistique <StatInlineTag name='SPD' /> représente la vitesse de course du personnage — c’est elle qui détermine la rapidité avec laquelle il progresse sur la piste.
                                    </p>
                                    <ul className="list-disc list-inside">
                                        <li>Plus la <StatInlineTag name='SPD' /> est élevée, plus vous atteignez les 100% rapidement.</li>
                                        <li>Un personnage avec 200 de <StatInlineTag name='SPD' /> se déplace deux fois plus vite qu’un autre avec 100.</li>
                                        <li>Il pourra donc jouer deux fois pendant que l’autre n’agira qu’une seule fois.</li>
                                    </ul>

                                    <p>
                                        Ce n’est pas un système à tour fixe — c’est un <strong>flux continu</strong> : les personnages agissent dès qu’ils atteignent 100%.
                                    </p>
                                </>
                            )
                        },
                        {
                            key: 'priority',
                            title: (
                                <>
                                    <span className='text-amber-400'>Priorité</span>
                                </>
                            ),
                            content: (
                                <>
                                    <p>
                                        Certaines compétences ou effets modifient votre <strong>position actuelle</strong> sur la piste, indépendamment de votre vitesse.
                                        Vous pouvez imaginer cela comme si le personnage se téléportait en avant ou en arrière.<br />
                                        On appelle cela un <strong>gain ou une perte de <span className='text-amber-400'>priorité</span></strong>.<br />
                                        D’autres jeux utilisent des systèmes similaires — comme la &quot;Combat Readiness&quot; dans *Epic Seven*, ou la jauge ATB dans *Summoner’s War*.
                                    </p>
                                    <p className="text-sm text-yellow-400">
                                        Il n’existe pas d’icône officielle pour représenter la priorité. Toutefois, ce site utilise l’icône suivante :<span style={{
                                            filter: 'grayscale(1)'
                                        }}><GuideIconInline name="SC_Buff_Effect_Increase_Priority" text="" /></span>.
                                    </p>
                                    <p>Voici les effets directement liés à cette mécanique :</p>
                                    <p>
                                        <span className="text-sky-400">Effet bénéfique</span> : <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> — propulse le personnage vers l’avant.
                                    </p>
                                    <p>
                                        <span className="text-red-400">Effet néfaste</span> : <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> — repousse le personnage en arrière.
                                    </p>
                                    <p className="text-sm text-yellow-400">
                                        <strong>Note :</strong>
                                        <span className="text-sm text-white">La priorité ne peut jamais dépasser 100%, ni descendre sous 0%.
                                            Si deux personnages atteignent 100% lors de la même action, celui qui y parvient en premier jouera en premier.
                                            Par exemple, si vous donnez +10% de priorité à un personnage à 98% et un autre à 95%, celui à 98% agira en premier.
                                        </span>
                                    </p>
                                </>
                            )
                        },
                        {
                            key: 'turn-flow',
                            title: (
                                <>
                                    <span className='text-amber-400'>Déroulement d’un Tour</span>
                                </>
                            ),
                            content: (
                                <>
                                    <p>Lorsqu’un personnage atteint 100% de priorité, son tour se déroule en plusieurs phases. Chaque phase déclenche des événements spécifiques :</p>

                                    <ul className="list-decimal list-inside space-y-1">
                                        <li>
                                            <strong>Phase de début</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>Les temps de recharge des compétences sont réduits de 1.</li>
                                                <li>Les effets de soin périodique (HoT) sont appliqués, comme <EffectInlineTag name="SYS_CONTINU_HEAL" type="buff" />.</li>
                                                <li>Les effets de dégâts sur la durée (DoT) sont appliqués, comme <EffectInlineTag name="BT_DOT_BLEED" type="debuff" />.</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Phase d’action</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>Si le personnage est sous un effet de contrôle comme <EffectInlineTag name="BT_STUN" type="debuff" />, cette phase est ignorée et le tour passe directement à la phase de fin.</li>
                                                <li>
                                                    <strong>2-1 : Phase de choix</strong>
                                                    <ul className="list-disc list-inside ml-4">
                                                        <li>Les actions forcées sont résolues en premier, comme <EffectInlineTag name="BT_AGGRO" type="debuff" />, ce qui lance immédiatement la phase d’impact.</li>
                                                        <li>Ensuite, le joueur choisit une compétence et une cible.</li>
                                                    </ul>
                                                </li>
                                                <li>
                                                    <strong>2-2 : Phase d’impact</strong>
                                                    <ul className="list-disc list-inside ml-4">
                                                        <li>La compétence s’exécute en trois étapes :
                                                            <ul className="list-disc list-inside ml-4">
                                                                <li><strong>Pré-impact :</strong> Avant que la compétence ne touche. Par exemple, <SkillInline character="Drakhan" skill="S3" /> avec EE+10 applique une <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> avant l’impact — important, car les dégâts dépendent du nombre de malus.</li>
                                                                <li><strong>Impact :</strong> La compétence touche — les dégâts ou soins sont appliqués.</li>
                                                                <li><strong>Post-impact :</strong> Après la compétence. Par exemple, <SkillInline character="Demiurge Vlada" skill="S3" /> inflige <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /> après avoir touché.</li>
                                                            </ul>
                                                        </li>
                                                        <li>Les coups supplémentaires sont déclenchés, comme <SkillInline character="Ryu Lion" skill="S2" />.</li>
                                                        <li>Réactions alliées possibles, comme <SkillInline character="Caren" skill="S2" />.</li>
                                                        <li>Réactions ennemies comme <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> ou <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />.</li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Phase de fin</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>Les effets de résurrection sont déclenchés, comme <EffectInlineTag name="BT_REVIVAL" type="buff" /> ou <SkillInline character="Demiurge Astei" skill="S2" />.</li>
                                                <li>Tous les buffs et debuffs restants perdent 1 tour de durée — sauf ceux déjà traités en phase de début.</li>
                                                <li>Les gains ou pertes de priorité restants sont appliqués.</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );
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
                                        Priority doesn’t have any official icon. However, this website uses the following icon to represent it:<span style={{
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
                                        <span className="text-sm text-white">Priority can never exceed 100% or drop below 0%.
                                            If two characters hit 100% within the same action, the one who reaches it first will act first.
                                            For example, if you give +10% priority to one character at 98% and another at 95%, the one at 98% will go first.
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
                                                                with EE+10 applies a <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> before it hits — 
                                                                important, as the skill’s damage scales with the number of debuffs.</li>
                                                                <li><strong>Hit:</strong> The skill connects — direct damage and healing are applied.</li>
                                                                <li><strong>Post-Hit:</strong> Triggers after the skill hits — for example, <SkillInline character="Demiurge Vlada" skill="S3" /> inflicts <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /> post-hit.</li>
                                                            </ul>
                                                        </li>
                                                        <li>Extra hits are triggered, such as <SkillInline character="Ryu Lion" skill="S2" />.</li>
                                                        <li>Ally reactions, like <SkillInline character="Caren" skill="S2" />, may also trigger.</li>
                                                        <li>Enemy reactions such as <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> or <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> may occur.</li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Ending Phase</strong>
                                            <ul className="list-disc list-inside ml-4">
                                                <li>Revive effects are resolved, such as <EffectInlineTag name="BT_REVIVAL" type="buff" /> or <SkillInline character="Demiurge Astei" skill="S2" />.</li>
                                                <li>All remaining buffs and debuffs decrease their duration by 1 turn — except those already processed during the Starting Phase.</li>
                                                <li>Any remaining priority gains or losses are now applied.</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </>
                            )
                        }]} />
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
                                        <li>Skills with <span className='align-top'><EffectInlineTag name="Heavy Strike" type="buff" /></span> effect cannot crit like <SkillInline character="Kitsune of Eternity Tamamo-no-Mae" skill="S1" />.</li>
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

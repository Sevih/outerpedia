'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import EquipmentInlineTag from '@/app/components/EquipmentInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

type NoteEntry =
    | { type: 'p'; string: string }
    | { type: 'ul'; items: string[] }

const teams = {
    team1: {
        label: 'Recommended Team',
        icon: 'SC_Buff_Stat_CriRate.webp',
        setup: [
            ['Akari'],
            ['Gnosis Nella', 'Iota'],
            ['Regina', 'Caren', 'Gnosis Dahlia', 'Demiurge Astei'],
            ['Tio', 'Monad Eva']
        ]
    },
    team2: {
        label: '1 run public',
        icon: 'IG_Buff_Seal_Counter.webp',
        setup: [
            ['Demiurge Stella'],
            ['Drakhan'],
            ['Regina',],
            ['Monad Eva']
        ],
        note: [
            {
                type: 'p',
                string: "This team requires precise setup but the payoff is that it doesn't rely on RNG."
            },
            {
                type: 'ul',
                items: [
                    "Drakhan must be faster than the boss, and MEva / Regina slower.",
                    "You don't want Drakhan's S3 to deal more than 40,000 damage on turn 1 — you want the boss to take one turn before enrage.",
                    "MEva must be 5★, use Saint's Ring and Vanguard's Charm, while the other 3 units run Rogue or Executioner."
                ]
            },
            {
                type: 'p',
                string: 'Here is the fight opening:'
            },
            {
                type: 'ul',
                items: [
                    "Drakhan starts with S3 to trigger a counter (giving MEva +50 AP with Vanguard's Charm and +25 AP from allies being hit via healer passive).",
                    "Queen uses S2 (giving MEva another +50 AP with Vanguard's Charm and +25 AP from allies being hit).",
                    "MEva takes the turn with 150 AP (200 if 6★ with a +10 Vanguard), self-cleanses with Saint's Ring, and can use S1 Burn 3 to cleanse the team.",
                    "The rest of the fight is straightforward — use Chain Attack with Drakhan if the boss isn't broken or if S2 is available."
                ]
            }
        ] as NoteEntry[]

    },
    team3: {
        label: 'One run kill',
        icon: 'SC_Buff_detonate.webp',
        setup: [
            ['Vlada'],
            ['Iota'],
            ['Maxie'],
            ['Fatal']
        ]
    }
}

export default function IrregularQueenGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Counters with S2 when debuffed, 100% crit chance</li>
                <li>Immune to WG damage unless debuffed</li>
                <li><strong>S3:</strong> AoE, grants a 3 turn <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /></li>
                <li><strong>S2:</strong> AoE, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_AGGRO" type="debuff" />. if it crits, remove all debuffs from the boss</li>
                <li><strong>S1:</strong> AoE, critical hits deal increased critical damage</li>
                <li>Enrages after taking 40,000 damage</li>
                <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> damages does not exceed 10 000. </li>
            </ul>

            <hr className="my-6 border-neutral-700" />
            <GuideHeading level={3}>Noticable Heroes</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Akari" />: Applies uncounterrable <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> <EffectInlineTag name="BT_SEALED" type="debuff" /> and <EffectInlineTag name="IG_Buff_DeBuffdurationIncrease" type="debuff" /> </li>
                <li><CharacterLinkCard name="Drakhan" />: Applies uncounterrable <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /></li>
                <li><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" /> 6★: Can&apos;t be countered and applies <EffectInlineTag name="BT_DOT_CURSE_IR" type="debuff" /> freely (except dual attack & chain)</li>
                <li><CharacterLinkCard name="Gnosis Nella" /><CharacterLinkCard name="Iota" />: Can <EffectInlineTag name="BT_STUN" type="debuff" /> the boss</li>
                <li><CharacterLinkCard name="Regina" /><CharacterLinkCard name="Caren" /><CharacterLinkCard name="Gnosis Dahlia" /><CharacterLinkCard name="Holy Night's Blessing Dianne" />: High damage dealers without relying on debuffs</li>
                <li><CharacterLinkCard name="Tio" />: Cleanses the <EffectInlineTag name="BT_AGGRO" type="debuff" /> from S2</li>
                <li><CharacterLinkCard name="Monad Eva" /><CharacterLinkCard name="Astei" /><CharacterLinkCard name="Demiurge Delta" /><CharacterLinkCard name="Dianne" /><CharacterLinkCard name="Shu" />: These units can cleanse <EffectInlineTag name="BT_AGGRO" type="debuff" />, but they need <EquipmentInlineTag name="Saint's Ring" type="amulet" /> in order to remove it from themselves at the start of their turn.</li>

            </ul>

            <hr className="my-6 border-neutral-700" />
            <TeamTabSelector teams={teams} />
            <hr className="my-6 border-neutral-700" />

            <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <p className="mb-2 text-neutral-300">
                    A sample video of the 1 run public team.
                </p>
                <YoutubeEmbed videoId="bPwKu7gjGWg" title="Irregular Queen - Pursuit Operation - 700K (1 run) by Sevih" />
                <br />
                <p className="mb-2 text-neutral-300">
                    A sample video of the One run kill team.
                    <span className="text-neutral-400 text-sm italic mt-2">
                        Run provided by <span className="text-white font-semibold">XuRenChao</span> (01/10/2025)
                    </span>
                </p>
                <YoutubeEmbed videoId="9Sr0YMGaro0" title="Irregular Queen (Post relaunch) - Pursuit Operation - 1 run kill (Auto) - by XuRenChao" />
            </div>
        </div>
    )
}

'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

type NoteEntry =
    | { type: 'p'; string: string }
    | { type: 'ul'; items: string[] }

const teams = {
    team1: {
        label: 'Non Crit Team',
        icon: 'SC_Buff_Effect_Heavy_bk.webp',
        setup: [
            ['Monad Eva','Stella','Saeran'],
            ['Gnosis Nella','Akari','Alice'],
            ['Rhona'],
            ['Kitsune of Eternity Tamamo-no-Mae']
        ]
    },
    team2: {
        label: 'Classic Team',
        icon: 'criticalhitchance.webp',
        setup: [
            ['Monad Eva','Stella','Saeran'],
            ['Skadi','Gnosis Nella','Akari','Alice'],
            ['Ryu Lion','Rey','Caren','Ame'],
            ['Maxwell','Gnosis Dahlia','Demiurge Astei']
        ],
        note: [
            {
                type: 'p',
                string: "Feel free to use any strong DPS character."
            }
        ] as NoteEntry[]
    }
}

export default function IrregularBlockbusterGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Gets a random buff every turn</li>
                <li>Reduced damage from crits and recovers WG by 50%</li>
                <li><strong>S3:</strong> Attacks all enemies, removes all buffs, inflicts <EffectInlineTag name="BT_SEALED" type="debuff" /> for 2 turns</li>
                <li><strong>S2:</strong> <EffectInlineTag name="BT_STUN" type="debuff" /> highest attack character for 2 turns</li>
                <li><strong>S1:</strong> Inflicts <EffectInlineTag name="BT_DOT_BLEED" type="debuff" /> for 2 turns</li>
                <li>Enrages after taking 4 turns</li>
                <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> damages does not exceed 5 000. </li>
            </ul>

            <hr className="my-6 border-neutral-700" />
            <GuideHeading level={3}>Noticable Heroes</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Monad Eva" /><CharacterLinkCard name="Stella" /><CharacterLinkCard name="Saeran" /> : can cleanse <EffectInlineTag name="BT_STUN" type="debuff" /> with <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                <li><CharacterLinkCard name="Alice" /><CharacterLinkCard name="Akari" /><CharacterLinkCard name="Gnosis Nella" /> : prevent boss from buffing with <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                <li><CharacterLinkCard name="Rhona" /><CharacterLinkCard name="Kitsune of Eternity Tamamo-no-Mae" /> : non-crit dps thanks to <EffectInlineTag name="HEAVY_STRIKE" type="buff" /></li>
            </ul>
            <p className="text-neutral-400 text-sm italic mb-4">
                Note:  You can just use any kind of DPS and ignore the WG
            </p>

            <hr className="my-6 border-neutral-700" />
            <TeamTabSelector teams={teams} />
            <hr className="my-6 border-neutral-700" />

            <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <p className="mb-2 text-neutral-300">
                    A sample video of a 1 run kill with a classic team
                </p>
                <YoutubeEmbed videoId="pgWkc6X6VNE" title="Blockbuster - Pursuit Operation - 1 run kill by Sevih" />
            </div>
        </div>
    )
}

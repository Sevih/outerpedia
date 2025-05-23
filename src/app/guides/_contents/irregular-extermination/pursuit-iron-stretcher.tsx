'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'


const teams = {
    team1: {
        label: 'Recommended Team',
        icon: 'SC_Buff_Stat_CriRate.webp',
        setup: [
            ['Caren','Poolside Trickster Regina','Regina'],
            ['Tamara','Skadi', 'Gnosis Nella', 'Akari','Edelweiss'],
            ['Gnosis Dahlia', 'Demiurge Astei','Aer','Beth'],
            ['Monad Eva','Luna','Nella','Omega Nadja']
        ]
    }
}

export default function IrregularIronStretcherGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Summons an add every turn</li>
                <li>Immune to WG damage if the add is alive</li>
                <li>Add inflicts <EffectInlineTag name="BT_SEALED" type="debuff" /> on death</li>
                <li><strong>S3:</strong> Attacks all enemies, grants 5 turn <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> to the boss and <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> to adds</li>
                <li><strong>S2:</strong> <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> by 20% and <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of the boss & adds by 20%</li>
                <li><strong>S1:</strong> <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> 2 buffs</li>
                <li>Enrages after taking 4 turns</li>
                <li><EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> damages does not exceed 5 000. </li>
            </ul>

            <hr className="my-6 border-neutral-700" />
            <GuideHeading level={3}>Noticable Heroes</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Caren" /> <CharacterLinkCard name="Poolside Trickster Regina" /> : <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> the <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> buff from boss</li>
                <li><CharacterLinkCard name="Tamara" /> :  Stalls boss skills with <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /></li>
                <li><CharacterLinkCard name="Gnosis Nella" /><CharacterLinkCard name="Akari" /><CharacterLinkCard name="Edelweiss" /> : <EffectInlineTag name="BT_SEALED" type="debuff" /> to prevent the <EffectInlineTag name="BT_INVINCIBLE" type="buff" /></li>
                <li><CharacterLinkCard name="Regina" /><CharacterLinkCard name="Aer" /> : <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> the <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> buff from boss</li>
            </ul>

            <hr className="my-6 border-neutral-700" />
            <TeamTabSelector teams={teams} />
            <hr className="my-6 border-neutral-700" />

            <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <YoutubeEmbed videoId="Enqp_g7xCqw" title="Iron Stretcher - Pursuit Operation - 1 run kill by Sevih" />
            </div>
        </div>
    )
}

'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
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
        <GuideTemplate
            title="Iron Stretcher Strategy Guide"
            introduction="Iron Stretcher summons an add every turn and becomes immune to WG damage while the add is alive. The boss can gain 5-turn Invincibility, making buff stealing and sealing essential strategies."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Iron Stretcher'
                                modeKey='Pursuit Operation'
                                defaultBossId='51202001'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Noticable Heroes</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Caren" /> <CharacterLinkCard name="Poolside Trickster Regina" /> : <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> the <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> buff from boss</li>
                                <li><CharacterLinkCard name="Tamara" /> :  Stalls boss skills with <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /></li>
                                <li><CharacterLinkCard name="Gnosis Nella" /> <CharacterLinkCard name="Akari" /> <CharacterLinkCard name="Edelweiss" /> : <EffectInlineTag name="BT_SEALED" type="debuff" /> to prevent the <EffectInlineTag name="BT_INVINCIBLE" type="buff" /></li>
                                <li><CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Aer" /> : <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> the <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> buff from boss</li>
                            </ul>

                            <hr className="my-6 border-neutral-700" />
                            <TeamTabSelector teams={teams} />
                            <hr className="my-6 border-neutral-700" />

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                                <YoutubeEmbed videoId="Enqp_g7xCqw" title="Iron Stretcher - Pursuit Operation - 1 run kill by Sevih" />
                            </div>
                        </>
                    ),
                },
            }}
        />
    )
}

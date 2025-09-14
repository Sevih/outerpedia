'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed';

const teams = {
    team1: {
        label: 'Suggested Core',
        icon: 'SC_Buff_Effect_Remove_Buff.webp',
        setup: [
            ['Demiurge Vlada', 'Eliza','Gnosis Nella', 'Francesca', 'Aer', 'Dahlia', 'Alice'],
            ['Nella', 'Demiurge Delta','Dianne', 'Astei', 'Monad Eva'],
            ['Maxwell', 'Gnosis Dahlia'],
            ['Demiurge Astei',  'Omega Nadja','Demiurge Stella','Stella', 'Caren']
        ]
    }
}

export default function ArsNova13Guide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Immune to <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                <li>Applies <EffectInlineTag name="BT_SEALED" type="debuff" /> and <EffectInlineTag name="BT_SILENCE" type="debuff" /></li>
                <li>Gains a  <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> buff that must be removed or stolen</li>
                <li>Fixed damage increases each turn and with more core adds alive</li>
                <li>Stops taking WG damage if your Chain Gauge reaches 150+</li>
                <li>Vulnerable to Priority manipulation</li>
            </ul>
            <hr className="my-6 border-neutral-700" />
            <GuideHeading level={3}>Tactical Tips</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>The main focus of this boss is to remove its Counterattack buff and eliminate the core adds that spawn regularly.</li>
                <li>The boss is immune to <EffectInlineTag name="BT_SEALED" type="debuff" />, so you must use buff removers or stealers.</li>
                <li>It deals fixed damage that increases each turn, especially if adds survive. Bring AoE damage to handle them.</li>
                <li>The boss applies <EffectInlineTag name="BT_SEALED" type="debuff" /> with S2 and <EffectInlineTag name="BT_SILENCE" type="debuff" /> with S3 so bring early <EffectInlineTag name="BT_IMMUNE" type="buff" /> to prevent Silence.</li>
                <li>Do not horde Chain Points, if you reach 150+, the boss becomes immune to WG damage.</li>
                <li>It&apos;s vulnerable to priority manipulation (pushback, etc.).</li>
            </ul>
            <hr className="my-6 border-neutral-700" />
            <TeamTabSelector teams={teams} />
            <hr className="my-6 border-neutral-700" />
            <div className="mb-4">
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                            
                            <YoutubeEmbed videoId="vsR7eGIbuFE" title="Ars Nova 13 – Clean Run Showcase by Sevih" />
            </div>
        </div>
    )
}

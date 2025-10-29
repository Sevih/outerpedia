'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import StatInlineTag from '@/app/components/StatInlineTag';
import GuideHeading from '@/app/components/GuideHeading'
import TeamTabSelector from '@/app/components/TeamTabSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ClassInlineTag from '@/app/components/ClassInlineTag';

type NoteEntry =
    | { type: 'p'; string: string }
    | { type: 'ul'; items: string[] }

const teams = {
    team1: {
        label: 'Recommended Team',
        icon: 'SC_Buff_Stat_CriRate.webp',
        setup: [
            ['Dianne'],
            ['Skadi'],            
            ['Caren','Demiurge Astei','Maxwell'],
            ['Gnosis Dahlia', "Holy Night's Blessing Dianne",'Ame']
        ],
        note: [
            {
                type: 'p',
                string: "Feel free to use any strong DPS character that don't rely on debuffs."
            }
        ] as NoteEntry[]
    },
    team2: {
        label: 'One run kill',
        icon: 'SC_Buff_Effect_Element_Superiority.webp',
        setup: [
            ['Dianne'],
            ['Skadi'],            
            ['Demiurge Luna'],
            ['Maxwell']
        ]
    },
}

export default function IrregularMutatedWyvreGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Permanent <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                <li><EffectInlineTag name="BT_STUN" type="debuff" /> everyone on Non-attack and <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> <EffectInlineTag name="BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK" type="buff" /> <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /></li>
                <li>Non critical hit makes him recovers 50% of WG</li>
                <li><strong>S3:</strong> Attacks all enemies, 3 turns <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="debuff" /> on highest attack hero, 3 turn  <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> on the boss</li>
                <li><strong>S2:</strong> 3 turn <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> on the boss, <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" /> on the team</li>
                <li><strong>S1:</strong> Forces the target to <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />, prioritizes <ClassInlineTag name="Ranger" /></li>
                <li>Enrages after 7 hero turns</li>
                <li><EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> damages does not exceed 5 000.</li>
             </ul>

            <hr className="my-6 border-neutral-700" />
            <GuideHeading level={3}>Noticable Heroes</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Dianne" /> :  <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                <li><CharacterLinkCard name="Skadi" /> : the only hero that got a <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> that bypass <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <StatInlineTag name="RES" /> check when fighting Irregulars<br />Gives <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> too</li>
            </ul>

            <hr className="my-6 border-neutral-700" />
            <TeamTabSelector teams={teams} />
            <hr className="my-6 border-neutral-700" />

            <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <YoutubeEmbed videoId="PCgNRKFlRGI" title="Mutated Wyvre - Pursuit Operation - 1 run kill by Sevih" />
            </div>
        </div>
    )
}

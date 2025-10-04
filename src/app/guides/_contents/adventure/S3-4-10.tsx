'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Hilde moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> with 2 allies.</li>
                <li><strong>S2</strong>: Single, used after being hit on the enemy with the lowest health. Inflict <EffectInlineTag name="BT_STONE" type="debuff" /> 1 turn.</li>
                <li><strong>S3</strong>: Single, <EffectInlineTag name="IG_Buff_BuffdurationReduce" type="debuff" /> by 1 turn.</li>
                <li><strong>Passive</strong>: when alone at the start of turn, <EffectInlineTag name="BT_RESURRECTION_G" type="buff" /> all slain allies.</li>
                <li><strong>Passive</strong>: when hit,  if at least one ally isn&apos;t debuffed, <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of the boss by 100%.</li>
                <li><strong>Passive</strong>: when at least 1 ally evades, inflict <EffectInlineTag name="BT_AGGRO_IR" type="debuff" /> taunted 4 turns. Ignore immunity. Can be activated only once during the battle.</li>
                <li><strong>Enrage</strong>: Every 4 turns. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />.</li>
                <li><strong>Enrage Ultimate</strong>: AoE used when enrage ends also grants <EffectInlineTag name="BT_STAT|ST_AVOID_IR" type="buff" /> to all allies.</li>
            </ul>
            <GuideHeading level={4}>Maxie moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of caster by 10%.</li>
                <li><strong>S2</strong>: Single, used after Roxie attack. Damage on the enemie with the highest attack. <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of caster by 25%.</li>
                <li><strong>S3</strong>: AoE, grant <EffectInlineTag name="BT_STAT|ST_ATK" type="buff" /><EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="buff" /> 1 turn and inflict 2 <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> 1 turn.</li>
            </ul>
            <GuideHeading level={4}>Roxie moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, 30% chance to inflict <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" />.</li>
                <li><strong>S2</strong>: Single, used after Maxie attack. Damage on the enemie with the highest speed. <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of caster by 25% and grants <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" /> to Maxie and herself.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> 2 turns.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Bring <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> to avoid getting <EffectInlineTag name="BT_AGGRO_IR" type="debuff" />.</li>
                <li>Healers with healing on S1 can help if you end up getting <EffectInlineTag name="BT_AGGRO_IR" type="debuff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Mero" />: for <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" />.</li>
                <li><CharacterLinkCard name="Gnosis Beth" /> <CharacterLinkCard name="Ember" /> : for landing debuff while getting hit.</li>
                <li><CharacterLinkCard name="Tamamo-no-Mae" /> <CharacterLinkCard name="Ember" /> : for <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" />.</li>
                <li><CharacterLinkCard name="Charlotte" /> <CharacterLinkCard name="Skadi" /> <CharacterLinkCard name="Sterope" />: for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" />.</li>
                <li><CharacterLinkCard name="Hilde" /> <CharacterLinkCard name="Edelweiss" /> : for damage sharing.</li>
            </ul>
        </div>
    )
}

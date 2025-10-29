'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ClassInlineTag from '@/app/components/ClassInlineTag'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Sphinx Guardian moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> before attacking. Prioritizes <ClassInlineTag name="Ranger" /> and inflicts Instant Death on <ClassInlineTag name="Ranger" />.</li>
                <li><strong>S2</strong>: AoE, inflicts <EffectInlineTag name="BT_SEALED" type="debuff" /> for 2 turns. <EffectInlineTag name="BT_SEAL_COUNTER" type="buff" />.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_AP_CHARGE" type="debuff" /> by 50. <EffectInlineTag name="BT_SEAL_COUNTER" type="buff" />.</li>
                <li><strong>Passive</strong>: If there are no <ClassInlineTag name="Ranger" /> enemies, enemy Speed becomes 0 and <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> by 100% at the end of the turn.</li>
                <li><strong>Passive</strong>: When inflicted with a debuff, gains <EffectInlineTag name="BT_STAT|ST_BUFF_RESIST" type="buff" /> for 2 turns.</li>
                <li><strong>Passive</strong>: Grants an <EffectInlineTag name="BT_ADDITIVE_TURN" type="buff" /> when defeating an enemy.</li>

                <li><strong>Enrage</strong>: Every 4 turns and last 3 turns. Gain <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" /> and <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" />, recovers Weakness Gauge by 10%.</li>
                <li><strong>Enrage Ultimate</strong>: AoE used when enrage ends.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>At least one <ClassInlineTag name="Ranger" /> is required to get turns.</li>
                <li>Avoid using <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" />.</li>
                <li>The boss is vulnerable to <EffectInlineTag name="BT_AGGRO" type="debuff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Ember" /> : Self inflicts <EffectInlineTag name="BT_MARKING" type="debuff" /> or inflicts <EffectInlineTag name="BT_AGGRO" type="debuff" />.</li>
                <li><CharacterLinkCard name="Veronica" /> : <EffectInlineTag name="BT_AGGRO" type="debuff" />.</li>
                <li><CharacterLinkCard name="Fatal" /> : <EffectInlineTag name="BT_STEALTHED" type="buff" />.</li>
                <li>Any <ClassInlineTag name="Ranger" />.</li>
                <li><CharacterLinkCard name="Nella" /><CharacterLinkCard name="Mene" /> : for <EffectInlineTag name="BT_RESURRECTION" type="buff" /></li>
            </ul>
        </div>
    )
}

'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Vladi Max moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, reduces chain point by 20.</li>
                <li><strong>S2</strong>: AoE, inflict <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> 2 turns.</li>
                <li><strong>S3</strong>: AoE, 20% chance to <EffectInlineTag name="BT_STUN" type="debuff" /> 4 turns. If enemy is inflicted by <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> chances go up to 100%</li>
                <li><strong>Passive</strong>: Does not trigger <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />, <EffectInlineTag name="SYS_REVENGE_HEAL" type="buff" /> or <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />.</li>
                <li><strong>Enrage</strong>: When health drops under 40%. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />. Increases Attack and Speed by 15%. Recovers 10% of weakness gauge.</li>
                <li><strong>Enrage Ultimate</strong>: used when enrage ends. Reduce action points and chain points by 100%.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Use characters with <EffectInlineTag name="BT_IMMUNE" type="buff" />, <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Astei" />: for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
            </ul>
        </div>
    )
}

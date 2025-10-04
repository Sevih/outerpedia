'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Grand Calamari moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: AoE.</li>
                <li><strong>S2</strong>: AoE, inflict <EffectInlineTag name="BT_SEALED" type="debuff" /> 2 turns.</li>
                <li><strong>S3</strong>: AoE, increases duration of debuffs by 1 turn. Damage increased if <EffectInlineTag name="BT_STUN" type="debuff" />.</li>
                <li><strong>Passive</strong>: after using a skill, <EffectInlineTag name="BT_STUN" type="debuff" /> 2 turns on the hero with the highest attack.</li>
                <li><strong>Enrage</strong>:  when health drops under 50%. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />. Gains 15% attack and speed.</li>
                <li><strong>Enrage Ultimate</strong>: used when enrage ends. AoE, <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> by 50% and <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> for 2 turns.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Stack chain points before Enrage. This way, you can burst it down and skip the ultimate.</li>
                <li>Bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> and/or <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> to negate the <EffectInlineTag name="BT_STUN" type="debuff" /> mechanic.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Astei" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                <li><CharacterLinkCard name="Saeran" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Tio" /> : for <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                <li><CharacterLinkCard name="Demiurge Stella" /> as a main DPS since she is immune to <EffectInlineTag name="BT_STUN" type="debuff" /></li>
            </ul>
        </div>
    )
}

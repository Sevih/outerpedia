'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Abyssal Calamity Apophis moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, if target has a debuff deals <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> equals to 30% of target&apos;s max HP.</li>
                <li><strong>S2</strong>: AoE, ignore defense if target has a debuff.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> 4 turns. Ignore immunity if target isn&apos;t granted <EffectInlineTag name="BT_STAT|ST_BUFF_RESIST" type="buff" />  . Does not trigger <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />, <EffectInlineTag name="SYS_REVENGE_HEAL" type="buff" /> or <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />.</li>
                <li><strong>Passive</strong>: Inflict <EffectInlineTag name="BT_SILENCE_IR" type="debuff" /> 1 turn to all enemies when the target perfome an action while <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> (ignore resilience and immunity).</li>
                <li><strong>Passive</strong>: At the end of enemies&apos; turn inflicted with  <EffectInlineTag name="BT_SILENCE_IR" type="debuff" />, deals <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> equals to 20% of target&apos;s max HP and heals the caster by 50%.</li>
                <li><strong>Passive</strong>: Greatly decreases damage taken from enemies inflicted by <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" />.</li>
                <li><strong>Passive</strong>: Does not trigger <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />, <EffectInlineTag name="SYS_REVENGE_HEAL" type="buff" /> or <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />.</li>   
                <li><strong>Enrage</strong>:  When health drops under 30%. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />.</li>
                <li><strong>Enrage Ultimate</strong>: Inflict <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> 3 turns to all enemies.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_BUFF_RESIST" type="buff" /> to prevent <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Lyla" /> <CharacterLinkCard name="Demiurge Delta" /> <CharacterLinkCard name="Leo" />: for <EffectInlineTag name="BT_STAT|ST_BUFF_RESIST" type="buff" />.</li>
                <li><CharacterLinkCard name="Dianne" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" />.</li>
                <li><CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" />.</li>
            </ul>
        </div>
    )
}

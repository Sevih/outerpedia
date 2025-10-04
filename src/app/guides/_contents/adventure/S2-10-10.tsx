'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Demiurge Drakhan moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, deals 30% of target HP as <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />.</li>
                <li><strong>S2</strong>: Single, <EffectInlineTag name="BT_ACTION_GAUGE" type="debuff" /> by 100%.</li>
                <li><strong>S3</strong>: Single, instantly kills enemies with HP &lt; 30%</li>
                <li><strong>Passive</strong>: When taking a critical hit, reset S3 cooldown and <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> by 35%.</li>
                <li><strong>Enrage</strong>: When health drops under 50%. Does not take weakness gauge damage.</li>
                <li><strong>Enrage Ultimate</strong>: used when enrage ends. Gain permanent <EffectInlineTag name="BT_STAT|ST_SPEED_IR" type="buff" />. Makes her S3 an AoE instead of a single target skill.</li>
            </ul>
            <GuideHeading level={4}>Demiurge Vlada moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" /> by 1 turn.</li>
                <li><strong>S2</strong>: AoE, used if an ally uses an AoE skill. Deals 30% of target HP as <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /></li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                <li><strong>Passive</strong>: Reduces enemies speed by 5% each turn (Max 20 stacks).</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Use characters with strong AoE healing skills.</li>
                <li>Take out Demiurge Vlada quickly so the speed debuff doesn&apos;t stack too high.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Mene" /> <CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Monad Eva" /> <CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Dianne" />: for healing</li>
            </ul>
        </div>
    )
}

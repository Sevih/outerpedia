'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100">
                ⚠️ This guide also applies to stage S2 Hard 8-10 ⚠️
            </div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Vlada moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, inflict <EffectInlineTag name="BT_DOT_BURN_IR" type="debuff" /> 2 turns.</li>
                <li><strong>S2</strong>: AoE, inflict <EffectInlineTag name="BT_DOT_BURN_IR" type="debuff" /> 2 turns.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_DETONATE" type="debuff" /> all <EffectInlineTag name="BT_DOT_BURN_IR" type="debuff" /> <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> debuffs.</li>
                <li><strong>Passive</strong>: Gains permanent <EffectInlineTag name="BT_SYS_BUFF_ENHANCE_IR" type="buff" />.</li>
                <li><strong>Passive</strong>: Does not take weakness gauge damage from <EffectInlineTag name="BT_DOT_BURN_IR" type="debuff" /> <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> enemies.</li>
                <li><strong>Enrage</strong>: When health drops under 40%. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" /> <EffectInlineTag name="BT_STAT|ST_SPEED_IR" type="buff" />. AoE attack.</li>          
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Use characters with <EffectInlineTag name="BT_IMMUNE" type="buff" />.</li>
                <li>Use <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /> to reduce <EffectInlineTag name="BT_DOT_BURN_IR" type="debuff" /> <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> damage.</li>
            </ul>
            <GuideHeading level={4}>Recommanded Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Nella" />: for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                <li><CharacterLinkCard name="Akari" /> <CharacterLinkCard name="Laplace" /> : <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /></li>
            </ul>
        </div>
    )
}

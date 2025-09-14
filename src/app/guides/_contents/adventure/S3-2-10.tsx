'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Betrayed Deshret moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, recovers Health by 15%.</li>
                <li><strong>S2</strong>: Single, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> and grant <EffectInlineTag name="BT_STAT|ST_VAMPIRIC" type="buff" />.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_STUN_IR" type="debuff" /> 3 turns</li>
                <li><strong>Passive</strong>: When hit by an enemy with lower accuracy than the boss, greatly reduces damage taken and grants <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
                <li><strong>Passive</strong>: If boss HP &gt; 85%, greatly increases damage dealt.</li>
                <li><strong>Passive</strong>: Reduces accuracy and effectiveness of non-<ElementInlineTag element='fire' /> enemies by 50%.</li>
                <li><strong>Enrage</strong>: When health drops under 50%. Does not take weakness gauge damage.</li>
                <li><strong>Enrage Ultimate</strong>: AoE used when enrage ends.  Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" />.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Use <ElementInlineTag element='fire' /> characters with either <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> or <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="debuff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommanded Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="K" /> : for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="debuff" /></li>
                <li><CharacterLinkCard name="Aer" /><CharacterLinkCard name="Kanon" /><CharacterLinkCard name="Lisha" /><CharacterLinkCard name="Mero" /> : for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /></li>
            </ul>
        </div>
    )
}

'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ClassInlineTag from '@/app/components/ClassInlineTag'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Abomination Hunter Belial moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, inflicts <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> 2 turns.</li>
                <li><strong>S2</strong>: AoE, inflicts <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> 3 turns.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_DETONATE" type="debuff" /> all <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> effect.</li>
                <li><strong>Passive</strong>: At the start of battle, <EffectInlineTag name="BT_DETONATE" type="debuff" /> of the caster&apos;s by 100% and inflicts 2 <EffectInlineTag name="BT_DOT_BURN_IR" type="debuff" /> on all enemies for 1 turns (ignores the target&apos;s resilience and immunity).</li>
                <li><strong>Passive</strong>: Does not take Weakness Gauge Damage if HP &gt; 80%.</li>
                <li><strong>Passive</strong>: At the end of a non <ClassInlineTag name="Defender" /> enemy&apos;s turn, inflicts <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> on the target for 2 turns.</li>
                <li><strong>Passive</strong>: Increases <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> dealt by the caster by 100%.</li>   
                <li><strong>Enrage</strong>:  Every 10 enemy actions. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" />.</li>
                <li><strong>Enrage Ultimate</strong>: <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" /> and inflicts instant death.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Bring <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> and/or <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> to deal with <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> (make sure to apply those at the end of the second battle).</li>
                <li>Bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> to block <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> after the first <EffectInlineTag name="BT_DETONATE" type="debuff" />.</li>
                <li>Bring <EffectInlineTag name="BT_RESURRECTION_G" type="buff" /> can be usefull too.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Leo" /> <CharacterLinkCard name="Monad Eva" /> : for <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
                <li><CharacterLinkCard name="Leo" /> <CharacterLinkCard name="Lyla" /> <CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Luna" /> <CharacterLinkCard name="Omega Nadja" /> <CharacterLinkCard name="Liselotte" />: for <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
                <li><CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_RESURRECTION_G" type="buff" />.</li>
                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Astei" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" />.</li>
            </ul>
        </div>
    )
}

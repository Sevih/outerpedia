'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Leo moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, grants <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> 2 turns.</li>
                <li><strong>S2</strong>: grants <EffectInlineTag name="BT_STAT|ST_DEF" type="buff" /> 3 turns on all allies.</li>
                <li><strong>S3</strong>: AoE, damage increases based on defense.</li>
                <li><strong>Passive</strong>: Greatly increases damage dealt if granted <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
                <li><strong>Passive</strong>: Defense increases based on missing health.</li>
                <li><strong>Passive</strong>: Reduces weakness damage by 50% while <CharacterLinkCard name='Alpha' /> is alive.</li>
            </ul>
            <GuideHeading level={4}>Alpha moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, 40% chances to <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> 2 turns.</li>
                <li><strong>S2</strong>: AoE, 70% chances to <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> 2 turns.</li>
                <li><strong>S3</strong>: AoE, 50% chances to <EffectInlineTag name="BT_STUN" type="debuff" /> 1 turn.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Bring <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> and/or <EffectInlineTag name="BT_IMMUNE" type="buff" /> to negates <CharacterLinkCard name='Alpha' />.</li>
                <li>Bring <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEALED" type="debuff" /> <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> to prevent <CharacterLinkCard name='Leo' /> to buff himself.</li>
                <li>Whichever the one you use, be sure that Leo isn&apost buffed when he is going for S3.</li>
                <li><strong>S3</strong>: AoE, 50% chances to <EffectInlineTag name="BT_STUN" type="debuff" /> 1 turn.</li>
            </ul>
            <GuideHeading level={4}>Recommanded Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Akari" />, <CharacterLinkCard name="Gnosis Nella" /> <CharacterLinkCard name="Luna" /> : for <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                <li><CharacterLinkCard name="Caren" />, <CharacterLinkCard name="Poolside Trickster Regina" />, <CharacterLinkCard name="Stella" /> : for <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /></li>
                <li><CharacterLinkCard name="Regina" />, <CharacterLinkCard name="Kappa" />, <CharacterLinkCard name="Aer" /> : for <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
                <li><CharacterLinkCard name="Astei" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                <li><CharacterLinkCard name="Saeran" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Tio" /> : for <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
            </ul>
        </div>
    )
}

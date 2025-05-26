'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ElementInlineTag from '@/app/components/ElementInline'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Regina moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of the caster by 20%.</li>
                <li><strong>S2</strong>: Single, triggered when evading. Grants <EffectInlineTag name="UNIQUE_REGINA_WORLD" type="buff" /> 2 turns.</li>
                <li><strong>S3</strong>: Single, <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" />.</li>
                <li><strong>Passive</strong>: Damage dealt increases based on Evasion.</li>
                <li><strong>Enrage</strong>: Every 10 enemies actions. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" /> <EffectInlineTag name="BT_STAT|ST_AVOID_IR" type="buff" />.</li>
                <li><strong>Enrage Ultimate</strong>: AoE used when enrage ends.</li>
            </ul>
            <GuideHeading level={4}>Hilde moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> with 2 allies.</li>
                <li><strong>S2</strong>: Single, used after being hit on the enemy with the lowest health. Inflict <EffectInlineTag name="BT_STONE" type="debuff" /> 1 turn.</li>
                <li><strong>S3</strong>: Single, <EffectInlineTag name="IG_Buff_BuffdurationReduce" type="debuff" /> by 1 turn.</li>
            </ul>

            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Bring <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> to cunter <EffectInlineTag name="UNIQUE_REGINA_WORLD" type="buff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommanded Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Demiurge Astei" /> : <ElementInlineTag element='dark' /> DPS with high penetration.</li>
                <li><CharacterLinkCard name="Charlotte" /> <CharacterLinkCard name="Skadi" /> <CharacterLinkCard name="Sterope" />: for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" />.</li>
            </ul>
        </div>
    )
}

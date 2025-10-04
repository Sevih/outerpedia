'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100">
                ⚠️ This guide also applies to stage S2 Hard 5-9 ⚠️
            </div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Astei moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> with Sterope.</li>
                <li><strong>S2</strong>: Heals all allies, <EffectInlineTag name="BT_COOL_CHARGE" type="buff" /> of ultimate skills. Recovers 30% of weakness gauge.</li>
                <li><strong>S3</strong>: Heals all allies,  inflict <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="debuff" /> 3 turns on all enemies.</li>
                <li><strong>Passive</strong>: Increases the Attack of all allies (except Astei) by 15% each turn.</li>
                <li><strong>Enrage</strong>: When health drops under 40%. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />. <EffectInlineTag name="BT_RESURRECTION_G" type="buff" /> all allies and <EffectInlineTag name="BT_SILENCE" type="debuff" /> 3 turns on all enemies. Does not take weakness gauge damage <strong>AFTER</strong> becoming enraged.</li>
            </ul>
            <GuideHeading level={4}>Sterope moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, if Sterope has a buff activates an additional attack and grants Divine Retribution (Increases damage dealt by all allies by 4% (Max 15 stacks)).</li>
                <li><strong>S3</strong>: Grants <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> 2 turns on all allies.</li>


                <li><strong>Passive</strong>: At the start of battle, inflicts <EffectInlineTag name="UNIQUE_KERAUNOS" type="debuff" /> for 3 turns on all units (allies and enemies).</li>
                <li><strong>Passive</strong>: When enemies use a non-attack skill, recovers all allies&apos; weakness gauge by 4 and health by 3%.</li>
                <li><strong>Passive</strong>: Inflict 700 <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> when hit and <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> of all allies by 10%.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>The boss has no immunities, so bring <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" />.</li>
                <li>Try to avoid using characters with non-offensive skills.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Demiurge Vlada" />, <CharacterLinkCard name="Sterope" />, <CharacterLinkCard name="Eternal" />: for <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /></li>
                <li><CharacterLinkCard name="Monad Eva" />, <CharacterLinkCard name="Dianne" /> : can heal without using non-offensive skills</li>
            </ul>
        </div>
    )
}

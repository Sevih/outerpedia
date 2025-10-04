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
                <li><strong>S1</strong>: Single, ignore 100% of defense but reduces all skil cooldown of the target.</li>
                <li><strong>S2</strong>: AoE, grants <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="buff" /> 5 turns.</li>
                <li><strong>S3</strong>: AoE, inflicts <EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="debuff" /> 9 turns.</li>
                <li><strong>Passive</strong>: Increases damage dealt against enemies without <EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="debuff" />.</li>
                <li><strong>Passive</strong>: Always inflicts <EffectInlineTag name="BT_SYS_DEBUFF_ENHANCE_IR" type="debuff" /> and <EffectInlineTag name="BT_SEALED_IR" type="debuff" /> on all enemies.</li>
                <li><strong>Passive</strong>: Damage from <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" /> will not exceed 1 000.</li>
                <li><strong>Enrage</strong>:  Every 30 enemy actions.</li>
                <li><strong>Enrage Ultimate</strong>: <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" /> Instantly kills all enemies.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Units with innate Penetration and Penetration-based builds are required.</li>
                <li>Also <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> will be needed to get rid of <EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="debuff" /> right when the boss is on the verge of breaking.</li>
                
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Gnosis Beth" /> <CharacterLinkCard name="Demiurge Luna" /> <CharacterLinkCard name="Gnosis Dahlia" /> <CharacterLinkCard name="Demiurge Astei" /> <CharacterLinkCard name="Ame" />: as DPS unit.</li>
            </ul>
        </div>
    )
}

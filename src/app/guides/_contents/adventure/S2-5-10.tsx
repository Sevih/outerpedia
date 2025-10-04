'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Demiurge Astei moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, grants <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> 6 turns. If already granted <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" />, activates S2.</li>
                <li><strong>S2</strong>: Single, grants <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" /> 6 turns. If granted <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" />, 70% chance to <EffectInlineTag name="BT_STONE" type="debuff" /> 2 turns all enemies.</li>
                <li><strong>S3</strong>: AoE, if target is <EffectInlineTag name="BT_STONE" type="debuff" /> it becomes <EffectInlineTag name="BT_STONE_IR" type="debuff" /> 6 turns (ignore immunity and resilience).</li>
                <li><strong>Passive</strong>: Inflict <EffectInlineTag name="BT_STONE" type="debuff" /> on a random enemy for 2 turns.</li>
                <li><strong>Passive</strong>: Takes weakness gauge damage only when enraged.</li>
                <li><strong>Enrage</strong>: When health drops under 50%. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />. Increases Attack and Speed by 15%. Recover weakness gauge by 10%.</li>
                <li><strong>Enrage Ultimate</strong>: used when enrage ends. AoE, deals lethal damage.</li>               
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Use 2 characters to handle <EffectInlineTag name="BT_STONE" type="debuff" /> mechanics with <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> and <EffectInlineTag name="BT_IMMUNE" type="buff" /> .</li>
                <li>If damage is a problem, try to bring a character that can prevent boss from taking buff <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommended Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Tio" /> <CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Faenan" /> <CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Monad Eva" />: choose any 2 for <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                <li><CharacterLinkCard name="Akari" /> : <EffectInlineTag name="BT_SEALED" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /></li>
                <li><CharacterLinkCard name="Edelweiss" /> <CharacterLinkCard name="Luna" /> : <EffectInlineTag name="BT_SEALED" type="debuff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                <li><CharacterLinkCard name="Veronica" /> <CharacterLinkCard name="Luna" /> : <EffectInlineTag name="BT_CALL_BACKUP" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                <li><CharacterLinkCard name="Stella" /> <CharacterLinkCard name="Demiurge Stella" /> : can&apos;t be <EffectInlineTag name="BT_STONE" type="debuff" /></li>
            </ul>
        </div>
    )
}

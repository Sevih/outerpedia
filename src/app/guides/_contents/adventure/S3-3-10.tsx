'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Fatal moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, grants <EffectInlineTag name="BT_STAT|ST_ATK" type="buff" /> 2 turns.</li>
                <li><strong>S2</strong>: <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />, grants <EffectInlineTag name="BT_STEALTHED" type="buff" /> 2 turns for the boss and <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> 2 turns for the foes.</li>
                <li><strong>S3</strong>: Single, if granted <EffectInlineTag name="BT_STEALTHED" type="buff" /> gain <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" /> and <EffectInlineTag name="BT_ADDITIVE_TURN" type="buff" /> on kill.</li>
                <li><strong>Passive</strong>: inflict <EffectInlineTag name="BT_SILENCE_IR" type="debuff" /> on <ElementInlineTag element='fire' /> enemies.</li>
                <li><strong>Passive</strong>: <EffectInlineTag name="BT_RESURRECTION_G" type="buff" /> foes when performing an action.</li>
                <li><strong>Passive</strong>: <EffectInlineTag name="IG_Buff_BuffdurationIncrease" type="buff" /> by 1 turn on all allies after performing an action.</li>
                <li><strong>Passive</strong>: Increase damage when granted <EffectInlineTag name="BT_STEALTHED" type="buff" />, damage taken cannot exceed 100 and does not take weakness gauge damage.</li>
                <li><strong>Enrage</strong>: After 10 enemy actions. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />.</li>
                <li><strong>Enrage Ultimate</strong>: AoE used when enrage ends. Damage increases every time this skill is used.</li>
            </ul>
            <GuideHeading level={4}>Sand Soldier Khopesh (foes) moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, grants <EffectInlineTag name="BT_STAT|ST_SPEED" type="buff" /> 1 turn to the caster.</li>                
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Avoid using <ElementInlineTag element='fire' /> heroes.</li>
                <li>Bring a speedy hero to apply <EffectInlineTag name="BT_SEALED" type="debuff" /> on foes before Fatal moves (around 270 speed).</li>
                <li>Bring a hero with either <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> or <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> to remove <EffectInlineTag name="BT_STEALTHED" type="buff" />.</li>
                <li><CharacterLinkCard name="Caren" /> is the MPV here since her S2 will still target Fatal while <EffectInlineTag name="BT_STEALTHED" type="buff" /></li>
            </ul>
            <GuideHeading level={4}>Recommanded Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Kappa" /><CharacterLinkCard name="Regina" /> : for <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
                <li><CharacterLinkCard name="Dahlia" /><CharacterLinkCard name="Demiurge Vlada" /><CharacterLinkCard name="Veronica" /><CharacterLinkCard name="Alice" /><CharacterLinkCard name="Gnosis Nella" /> : for AoE <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
                <li><CharacterLinkCard name="Akari" /><CharacterLinkCard name="Alice" /><CharacterLinkCard name="Gnosis Nella" /> : for <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                <li><CharacterLinkCard name="Caren" /><CharacterLinkCard name="Stella" /> : for <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /></li>
            </ul>
        </div>
    )
}

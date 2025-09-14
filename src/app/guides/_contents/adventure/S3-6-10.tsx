'use client'

import GuideHeading from '@/app/components/GuideHeading'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Ancient Foe moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: Single, <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> 3 turns.</li>
                <li><strong>S2</strong>: AoE, <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> 3 turns. Grants <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" /> 3 turns.</li>
                <li><strong>S3</strong>: AoE, <EffectInlineTag name="BT_DETONATE" type="debuff" /> all <EffectInlineTag name="BT_DOT_CURSE" type="debuff" />. If target&apos;s HP &lt; 70%, inflict <EffectInlineTag name="BT_FREEZE" type="debuff" /> (ignore immunity)</li>
                <li><strong>Passive</strong>: When attacking while granted <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" />, inflict <EffectInlineTag name="BT_DOT_CURSE_IR" type="debuff" /> 9 turns (ignore immunity).</li>
                <li><strong>Passive</strong>: When attacking <EffectInlineTag name="BT_FREEZE" type="debuff" /> target, penetrate 100% of target&apos;s defense and <EffectInlineTag name="BT_SEALED_RESURRECTION" type="debuff" /> if target is killed.</li>
                <li><strong>Passive</strong>: Does not trigger <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />, <EffectInlineTag name="SYS_REVENGE_HEAL" type="buff" /> or <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" />.</li>   
                <li><strong>Enrage</strong>: Every 10 enemies actions. Gain <EffectInlineTag name="BT_DAMGE_TAKEN" type="buff" /> <EffectInlineTag name="BT_STAT|ST_ATK_IR" type="buff" />.</li>
                <li><strong>Enrage Ultimate</strong>: AoE used when enrage ends. Inflict <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> 9 turns.</li>
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Bring <EffectInlineTag name="BT_SEALED" type="debuff" /> to prevent the boss getting <EffectInlineTag name="BT_STAT|ST_BUFF_CHANCE" type="buff" />.</li>
                <li>Bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> to deal with <EffectInlineTag name="BT_DOT_CURSE" type="debuff" /> and <EffectInlineTag name="BT_FREEZE" type="debuff" />.</li>
            </ul>
            <GuideHeading level={4}>Recommanded Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Demiurge Delta" /> <CharacterLinkCard name="Saeran" />: for <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />.</li>
                <li><CharacterLinkCard name="Akari" /> <CharacterLinkCard name="Luna" /> <CharacterLinkCard name="Gnosis Nella" /> <CharacterLinkCard name="Alice" /> : for <EffectInlineTag name="BT_SEALED" type="debuff" />.</li>
            </ul>
        </div>
    )
}

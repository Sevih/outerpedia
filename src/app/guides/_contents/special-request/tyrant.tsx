'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

const teamSetup = [
    ['Dianne', 'Saeran', 'Shu','Monad Eva'],
    ['Noa','Ame','Rey'],
    ['Charlotte','Tamara','Kappa','Rhona'],
    ['Ame','Rey','Delta']
]

export default function TyrantGuide() {
    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
            <p className="mb-4 text-neutral-300">
                The Toddler is a very unique fight that is more focused on cleansing debuffs quickly.
            </p>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>Upon entering the battle, you will be instantly stacked with <EffectInlineTag name="BT_DOT_POISON" type="debuff" />, <EffectInlineTag name="BT_DOT_BLEED" type="debuff" />, and <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> but so will the boss.</li>
                <li>These DoTs will kill you very quickly if not cleansed immediately.</li>
                <li>Since they are applied at the start of battle, agile responses that cleanse like <CharacterLinkCard name="Tio" />, <CharacterLinkCard name="Meva" />, <CharacterLinkCard name="Stella" /> will not trigger.</li>
                <li>Units with AoE cleansing are very important.</li>
                <li><CharacterLinkCard name="Dianne" />&#39;s S3 completely trivializes this boss by cleansing the full duration of all debuffs.</li>
                <li><CharacterLinkCard name="Saeran" />&#39;s Skill 2 Burst 2 is also viable, but you need to build enough AP in the first area to use it immediately.</li>
                <li>Once cleansed, you must use <strong>Burst Skills</strong>, <strong>Dual Attacks</strong>, and <strong>Chain Skills</strong> to damage his WG.</li>
                <li>Try to burst him down quickly since his damage increases rapidly over time.</li>
            </ul>
            <hr className="my-6 border-neutral-700" />
            <RecommendedTeam team={teamSetup} />
            <hr className="my-6 border-neutral-700" />

            <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <p className="mb-2 text-neutral-300">
                    A sample video of the recommended team in action will be added here soon.
                </p>
            </div>
        </div>
    )
}

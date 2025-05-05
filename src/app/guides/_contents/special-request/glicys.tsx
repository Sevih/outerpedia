'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'

const teamSetup = [
    ['Charlotte'],
    ['Noa'],
    ['Kappa'],
    ['Ame', 'Monad Eva','Rey', 'Delta','Kitsune of Eternity Tamamo-no-Mae', 'Saeran'],
  ]

export default function GlicysGuide() {
  return (
    <div>
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
      <p className="mb-4 text-neutral-300">
        Glicys&apos; core mechanic revolves around <strong>summoned mobs</strong> and the <EffectInlineTag name="BT_FREEZE" type="debuff" /> debuff.
      </p>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>She summons a <strong>small mob on the right side</strong>. Hitting it with <em>single-target skills</em> will lower both the mob&apos;s and boss&apos; DEF.</li>
        <li>The right mob applies <EffectInlineTag name="BT_FREEZE" type="debuff" /> with its attack.</li>
        <li>Using <em>single-target attacks</em> directly on the boss restores her WG untils adds are killed, so avoid it early.</li>
        <li>Glicys deals increased damage to frozen enemies (especially on <strong>Stage 13</strong>).</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Enrage Phase</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>At <strong>50% HP</strong>, Glicys enters <em>Enrage</em>, summoning a <strong>bigger mob on the left</strong>.</li>
        <li>Attacking the left mob without killing it will freeze your team. If you kill it while frozen, it prevents the freeze retaliation.</li>
        <li>She gains an <strong>irremovable Invulnerability</strong> buff during Enrage. Plan your burst accordingly.</li>
        <li>Your team should ideally be <strong>slower</strong> than Glicys to avoid punishing speed interactions.</li>
        <li>She will unleash a <strong>high-damage ultimate</strong> a few turns into Enrage. Prepare to mitigate or survive it.</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Stage 13 Mechanics</h3>
      <p className="text-neutral-300 mb-4">
        On Stage 13, Glicys&apos; attacks <strong>cannot be countered</strong>, and do not trigger <em>Agile Response</em> or <em>Revenge</em> effects.
      </p>

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

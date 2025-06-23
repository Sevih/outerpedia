'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

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
        <li>Attacking the left mob without killing it will <EffectInlineTag name="BT_FREEZE" type="debuff" /> your team unless it got oneshotted or died while our team get frozen</li>
        <li>She gains <EffectInlineTag name="BT_INVINCIBLE_IR" type="buff" />  buff during Enrage. Plan your burst accordingly.</li>
        <li>Your team should ideally be <strong>slower</strong> than Glicys to avoid punishing speed interactions.</li>
        <li>She will unleash a <strong>high-damage ultimate</strong> a few turns into Enrage.</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Stage 13 Mechanics</h3>
      <p className="text-neutral-300 mb-4">
        On Stage 13, Glicys&apos; attacks does not trigger <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" /> <EffectInlineTag name="SYS_BUFF_REVENGE" type="buff" /> <EffectInlineTag name="SYS_REVENGE_HEAL" type="buff" />.
      </p>

      <hr className="my-6 border-neutral-700" />

      <RecommendedTeam team={teamSetup} />

      <hr className="my-6 border-neutral-700" />
      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <YoutubeEmbed videoId="NikwWwstygo" title='combat footage'/>
      </div>


    </div>
  )
}

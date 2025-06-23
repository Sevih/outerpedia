'use client'

import EffectInlineTag from '@/app/components/EffectInlineTag'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const teamSetup = [
  ['Veronica'],
  ['Laplace'],
  ['Tamara'],
  ['Poolside Trickster Regina', 'Edelweiss', 'Monad Eva','Luna','Rin','Caren','Beth'],
]

export default function MeteosGuide() {
  return (
    <div>
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
      <p className="mb-4 text-neutral-300">
        The gimmick of this boss is mainly related to the <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> buff.
      </p>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>He has a special gauge that triggers an AoE counter every 5 actions, so <strong>Dual Attack</strong> and <strong>Chain Attack</strong> are recommended.</li>
        <li>He does more damage if he has debuffs — 2 to 3 debuffs are manageable.</li>
        <li>If he kills one of your teammates, he will use an <strong>instant kill move</strong> that removes all buffs first, deals damage, and blocks revival.</li>
        <li>On <strong>Stage 13</strong>, he gains <EffectInlineTag name="SYS_CONTINU_HEAL" type="buff" /> and heals after attacking.</li>
        <li><strong>Healers are useless</strong> as he blocks healing effects.</li>
        <li>His enrage is a powerful AoE attack.</li>
        <li>He also applies <EffectInlineTag name="BT_SEALED" type="debuff" /> on DPS units on higher stages.</li>
        <li>He does significantly less damage to units protected by <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />, even during Enrage — except for the instant kill move.</li>
      </ul>
       
      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li><CharacterLinkCard name="Veronica" /><br />
        A defender who grants <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> to the lowest HP ally each turn. She can solo Meteos up to stage 10. From stage 11 onward, Meteos deals more damage when fewer allies are alive. She also has <EffectInlineTag name="BT_STAT|ST_DEF" type="buff" /> and triggers Dual Attacks.</li>

        <li><CharacterLinkCard name="Laplace" /><br />
        A sub-DPS and support who grants team-wide <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> with her second skill. She also applies debuffs to reduce Meteos&#39;s damage. Her chain finisher deals <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />.</li>

        <li><CharacterLinkCard name="Caren" /><br />
        Can be your main DPS if built properly. Her damage is strong, especially when her second skill is triggered, which also <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" />.</li>

        <li><CharacterLinkCard name="Poolside Trickster Regina" /><br />
        Probably the best option if you have her. Her second skill <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> and deals heavy damage, while her third skill removes Meteos&#39;s counter gauge, delaying his AoE counter and resetting her second skill cooldown.</li>

        <li><CharacterLinkCard name="Edelweiss" /><br />
        A semi-tank with <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /> and buff steal. She can redirect some damage from allies to herself.</li>

        <li><CharacterLinkCard name="Monad Eva" /><br />
        While a healer, if you have her at 5★, she becomes a valuable pick. She boosts team damage significantly with double Dual Attack and provides <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <RecommendedTeam team={teamSetup} />
      <hr className="my-6 border-neutral-700" />
      
      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
          <YoutubeEmbed videoId="U2R6eEZgyuI" title='combat footage'/>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import VersionSelector from '@/app/components/VersionSelector'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

const teamSetup0325 = [
  ['Demiurge Delta','Dianne'],
  ['Delta','Idith','Hanbyul Lee'],
  ['Notia','Kappa','Stella'],
  ['Ame','Rey','Demiurge Stella'],
]

const versions: Record<string, { label: string; content: React.ReactNode }>= {
  default: {
    label: 'March 2025 Version',
    content: (
      <>
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
        <p className="mb-4 text-neutral-300">
          In the March 2025 version of Deep Sea Guardian, the boss takes the first turn and uses his ultimate immediately,
          stunning your whole team and ignoring <EffectInlineTag name="BT_IMMUNE" type="buff" />.
        </p>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li>Applies <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> and reduces AP gain (except for Healers).</li>
          <li>If your team has no duplicate classes, you gain <strong>50% free Resilience</strong>.</li>
          <li>Using a unit with ~300 Resilience helps avoid constant stuns.</li>
          <li><strong>Demiurge Delta</strong> with a Tier 4 <strong>Saint Ring</strong> can cleanse herself and the team with S3.</li>
          <li>The boss is fast, so counter-based units are a solid source of damage.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
        <ul className="list-disc list-inside text-neutral-300 mb-4">
          <li><CharacterLinkCard name="Demiurge Delta" />: Essential pick with <strong>Saint Ring</strong> to self-cleanse and team-cleanse with S3.</li>
          <li><CharacterLinkCard name="Delta" />: Grants team-wide counterattack buff. Needs average team speed except for Demiurge Delta.</li>
          <li><CharacterLinkCard name="Rey" /> / <CharacterLinkCard name="Ame" />: High damage dealers.</li>
          <li><CharacterLinkCard name="Dstella" />: Cannot be stunned and deals fixed damage (low compared to Rey/Ame).</li>
          <li><CharacterLinkCard name="Stella" />: Also stun-immune, provides minor support.</li>
          <li><CharacterLinkCard name="Notia" />: Damage dealer plus a ranger so you can pair her with Ame/Rey Ame/Delta.</li>
          <li><CharacterLinkCard name="Idith" />: Good alternative to Delta; counter-focused.</li>
          <li><CharacterLinkCard name="Hanbyul Lee" />: Provides counterattack buff to the team.</li>
          <li><CharacterLinkCard name="Kappa" /> (with EE): Buffs Earth-element units.</li>
          <li><CharacterLinkCard name="Dianne" />: Can replace Demiurge Delta for cleansing if needed.</li>
        </ul>
        <hr className="my-6 border-neutral-700" />
        <RecommendedTeam team={teamSetup0325} />
      </>
    ),
  },
  
  legacy2024: {
    label: 'Legacy (2024 Video)',
    content: (
      <>
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Legacy Video (2024-10-02)</h3>
        <p className="mb-4 text-neutral-300">
        No full written of this version has been made. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
        </p>
        <YoutubeEmbed videoId="pHi3CcaWhn0" title='Deep Sea Guardian Joint Boss Max Score! [OUTERPLANE]'/>
      </>
    ),
  },
  
}

export default function DeepSeaGuardianGuide() {
  const [selected, setSelected] = useState<string>('default')

  return (
    <div>
      <VersionSelector
        versions={versions}
        selected={selected}
        onSelect={setSelected}
      />
      {versions[selected].content}
    </div>
  )
}

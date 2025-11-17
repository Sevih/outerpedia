'use client'

import { useState, useCallback } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import BossDisplay from '@/app/components/BossDisplay'
import BeatlesTeamsData from './Beatles.json'
import type { TeamData } from '@/types/team'

const BeatlesTeams = BeatlesTeamsData as TeamData


export default function BeatlesGuide() {
  const [selectedMode, setSelectedMode] = useState('Special Request: Identification')
  const [miniBossId, setMiniBossId] = useState('407600462')

  const handleBossChange = useCallback((dekrilId: string) => {
    // Dek'Ril IDs are 4076003XX, Mek'Ril IDs are 4076004XX (just +100)
    const mekrilId = String(Number(dekrilId) + 100)
    setMiniBossId(mekrilId)
  }, [])

  return (
    <GuideTemplate
      title="Dek'Ril & Mek'Ril Strategy Guide"
      introduction="This boss&apos;s main gimmick is evasion. If you use AoE skills that aren&apos;t chain skills, it will gain an evasion buff. Characters that can inflict Evasion Down are recommended, along with single-target DPS."
      defaultVersion="default"
      versions={{
        default: {
          label: 'Guide',
          content: (
            <>
              <BossDisplay
                bossKey="Dek'Ril"
                modeKey='Special Request: Identification'
                onModeChange={setSelectedMode}
                onBossChange={handleBossChange}
                defaultBossId='407600362' />
              <MiniBossDisplay
                bosses={[
                  { bossKey: "Mek'Ril", defaultBossId: miniBossId }
                ]}
                modeKey='Special Request: Identification'
                controlledMode={selectedMode}
              />
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li>If you use AoE skills that aren&#39;t chain skills, it will gain an evasion buff.</li>
                <li>If it evades an attack, it will counterattack and inflict a <EffectInlineTag name="BT_DOT_POISON" type="debuff" /> debuff.</li>
                <li>The main boss is on the right side of the screen and is the only one attacking. The other one is a buffer that constantly buffs evasion. If killed, it will grant the main boss <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
                <li>Charactes that can inflict <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> are recommended, along with single-target DPS.</li>
                <li>Stage 13 : When hit, has an up to 90% chance to miss.</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Eternal" /><br />
                  Her skill set is mainly designed to fight Earth-element bosses. You can get her for free from the challenge quest required to face this boss.<br />
                  She has <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> and <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> along with other debuffs like <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" />.</li>

                <li><CharacterLinkCard name="Aer" /><br />
                  She&#39;s a PvE single-target DPS whose kit focuses on the boss. She can deal a lot of damage against Earth-element bosses and also has <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" />.</li>

                <li><CharacterLinkCard name="Mero" /><br />
                  While her skills are mainly AoE, they also apply evasion reduction debuffs to enemies and increase accuracy buffs for allies, reducing missed attacks. Her skills also provide team sustain through a lifesteal buff.</li>

                <li><CharacterLinkCard name="Meva" /> (especially at 5★)<br />
                  She has debuff-cleansing skills and unconditional dual attacks (at 5★), making her helpful for damage output.</li>

                <li><CharacterLinkCard name="Kanon" /><br />
                  She&#39;s a high-investment character but very strong in single-target attacks. She&#39;s also tanky, as her stats scale with DEF.</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={BeatlesTeams} defaultStage="1-10" icon='/images/ui/effect/fire.webp' replace={{ lead: "Stage ", mid: " to ", tail: "" }} />
              <hr className="my-6 border-neutral-700" />
              <div className="mb-4">
                <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
                <YoutubeEmbed videoId="eQmB1Uw9qL8" title='combat footage' />
              </div>
            </>
          ),
        },
      }}
    />
  )
}
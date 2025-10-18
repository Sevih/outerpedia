'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import guideDataRaw from '@/data/guides/guild-raid/planetary-control-unit.json' assert { type: 'json' }
import GuildRaidGuide from '@/app/components/guides/GuildRaidGuide'
import type { GuildRaidGuideVersion } from '@/app/components/guides/GuildRaidGuide'

const guideData = guideDataRaw as Record<string, GuildRaidGuideVersion>

export default function PlaneteryUnitGuidePage() {
  return (
    <GuideTemplate
      title="Planetary Control Unit Guild Raid Guide"
      introduction="Guild Raid guide for Planetary Control Unit. This guide covers both Phase 1 Geas Bosses and Phase 2 strategies with recommended team compositions."
      defaultVersion="default"
      versions={{
        default: {
          label: 'Guide',
          content: (
            <>
              <GuildRaidGuide guideData={guideData} />
            </>
          ),
        },
      }}
    />
  )
}
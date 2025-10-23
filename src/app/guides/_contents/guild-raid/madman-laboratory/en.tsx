'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import guideDataRaw from '@/data/guides/guild-raid/maxwell.json' assert { type: 'json' }
import GuildRaidGuide from '@/app/components/guides/GuildRaidGuide'
import type { GuildRaidGuideVersion } from '@/app/components/guides/GuildRaidGuide'

const guideData = guideDataRaw as Record<string, GuildRaidGuideVersion>

export default function MaxwellGuidePage() {
  return (
    <GuideTemplate
      title="Maxwell Guild Raid Guide"
      introduction="Guild Raid guide for Maxwell. This guide covers both Phase 1 Geas Bosses and Phase 2 strategies with recommended team compositions."
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
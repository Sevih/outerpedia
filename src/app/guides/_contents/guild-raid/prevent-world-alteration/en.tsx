'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import raidDataRaw from '@/data/raids/prevent-world-alteration/data.json' assert { type: 'json' }
import { GuildRaidPage } from '@/app/components/guild-raid'
import type { GuildRaidData } from '@/schemas/guild-raid.schema'

const raidData = raidDataRaw as GuildRaidData

export default function PreventWorldAlterationGuidePage() {
  return (
    <GuideTemplate
      title="Prevent World Alteration Guild Raid Guide"
      introduction="Guild Raid guide for Prevent World Alteration. This guide covers both Phase 1 Geas Bosses and Phase 2 strategies with recommended team compositions."
      defaultVersion="default"
      versions={{
        default: {
          label: 'Guide',
          content: <GuildRaidPage data={raidData} />,
        },
      }}
    />
  )
}
'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import raidDataRaw from '@/data/raids/frost-legion/data.json' assert { type: 'json' }
import { GuildRaidPage } from '@/app/components/guild-raid'
import type { GuildRaidData } from '@/schemas/guild-raid.schema'

const raidData = raidDataRaw as GuildRaidData

export default function FrostLegionGuidePage() {
  return (
    <GuideTemplate
      title="Frost Legion Guild Raid Guide"
      introduction="Guild Raid guide for Frost Legion. This guide covers both Phase 1 Geas Bosses and Phase 2 strategies with recommended team compositions."
      defaultVersion="default"
      versions={{
        default: {
          label: 'Guide',
          content: <GuildRaidPage data={raidData} defaultVersion="v2" />,
        },
      }}
    />
  )
}
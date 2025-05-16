import guideDataRaw from '@/data/guides/guild-raid/maxwell.json' assert { type: 'json' }
import GuildRaidGuide from '@/app/components/guides/GuildRaidGuide'
import type { GuildRaidGuideVersion } from '@/app/components/guides/GuildRaidGuide'

const guideData = guideDataRaw as Record<string, GuildRaidGuideVersion>

export default function MaxwellGuidePage() {
  return <GuildRaidGuide guideData={guideData} />
}

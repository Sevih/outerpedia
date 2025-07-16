import guideDataRaw from '@/data/guides/guild-raid/dignity-of-the-golden-kingdom.json' assert { type: 'json' }
import GuildRaidGuide from '@/app/components/guides/GuildRaidGuide'
import type { GuildRaidGuideVersion } from '@/app/components/guides/GuildRaidGuide'

const guideData = guideDataRaw as Record<string, GuildRaidGuideVersion>

export default function DignityOfTheGoldenKingdomGuidePage() {
  return (
    <div className="p-6">

    <GuildRaidGuide guideData={guideData} />
        </div>
    
  );
}

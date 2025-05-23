import guideDataRaw from '@/data/guides/guild-raid/maxwell.json' assert { type: 'json' }
import GuildRaidGuide from '@/app/components/guides/GuildRaidGuide'
import type { GuildRaidGuideVersion } from '@/app/components/guides/GuildRaidGuide'

const guideData = guideDataRaw as Record<string, GuildRaidGuideVersion>

export default function MaxwellGuidePage() {
  return (
    <div className="p-6">
         <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100">
        ⚠️ This guilde raid guide isn&apos;t accurate, it&apos;s just a placeholder until the next one. Do not use it as reference ⚠️
      </div>

    <GuildRaidGuide guideData={guideData} />
        </div>
    
  );
}

'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

export default function DrakhanGuide() {
  return (
    <GuideTemplate
      title="Drakhan World Boss Guide"
      introduction="No full written guide has been made yet. For now, we recommend watching this excellent video by Ducky:"
      defaultVersion="default"
      versions={{
        default: {
          label: 'Video Guide',
          content: (
            <>
              <YoutubeEmbed videoId="tX4Xhm4byAY" title="Holy Night Dianne Summons, Testing, and New World Boss by Ducky" startTime={12794}/>
            </>
          ),
        },
      }}
    />
  )
}
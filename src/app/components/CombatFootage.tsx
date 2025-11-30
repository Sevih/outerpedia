'use client'

import { useState } from 'react'
import GuideHeading from '@/app/components/GuideHeading'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import { useTenant } from '@/lib/contexts/TenantContext'
import { getT } from '@/i18n'

type VideoEntry = {
  videoId: string
  title: string
  author?: string
  date?: string
}

type SingleVideoProps = {
  videoId?: string
  title?: string
  author?: string
  date?: string
  videos?: never
}

type MultiVideoProps = {
  videos: VideoEntry[]
  videoId?: never
  title?: never
  author?: never
  date?: never
}

type Props = SingleVideoProps | MultiVideoProps

export default function CombatFootage(props: Props) {
  const { key: lang } = useTenant()
  const t = getT(lang)

  const videos: VideoEntry[] = props.videos
    ? props.videos
    : props.videoId && props.title
      ? [{ videoId: props.videoId, title: props.title, author: props.author, date: props.date }]
      : []

  const [selectedIndex, setSelectedIndex] = useState(0)

  const hasVideos = videos.length > 0
  const currentVideo = videos[selectedIndex]

  const tabs = videos.map((video, index) => ({
    key: String(index),
    label: video.title,
    icon: '/images/ui/effect/player.webp',
  }))

  return (
    <div className="mb-4">
      <GuideHeading level={3}>{t('guide.combatFootage')}</GuideHeading>
      {hasVideos ? (
        <>
          {videos.length > 1 && (
            <div className="flex justify-center mb-4">
              <AnimatedTabs
                tabs={tabs}
                selected={String(selectedIndex)}
                onSelect={(key) => setSelectedIndex(Number(key))}
                compact
              />
            </div>
          )}
          {currentVideo.author && (
            <p className="text-neutral-400 text-sm italic mt-2">
              {t('guide.runProvidedBy')} <span className="text-white font-semibold">{currentVideo.author}</span>
              {currentVideo.date && ` (${currentVideo.date})`}
            </p>
          )}
          <YoutubeEmbed videoId={currentVideo.videoId.trim()} title={currentVideo.title} />
        </>
      ) : (
        <p className="text-neutral-400 text-sm italic mt-2">
          {t('guide.noVideoYet')}
        </p>
      )}
    </div>
  )
}
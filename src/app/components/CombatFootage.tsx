'use client'

import GuideHeading from '@/app/components/GuideHeading'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import { useTenant } from '@/lib/contexts/TenantContext'
import { getT } from '@/i18n'

type Props = {
  videoId: string
  title: string
  author?: string
  date?: string
}

export default function CombatFootage({ videoId, title, author, date }: Props) {
  const { key: lang } = useTenant()
  const t = getT(lang)

  return (
    <div className="mb-4">
      <GuideHeading level={3}>{t('guide.combatFootage')}</GuideHeading>
      {author && (
        <p className="text-neutral-400 text-sm italic mt-2">
          {t('guide.runProvidedBy')} <span className="text-white font-semibold">{author}</span>
          {date && ` (${date})`}
        </p>
      )}
      <YoutubeEmbed videoId={videoId.trim()} title={title} />
    </div>
  )
}
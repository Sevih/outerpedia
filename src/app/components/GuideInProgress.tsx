import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'

interface GuideInProgressProps {
  /** Custom message to display instead of the default description */
  message?: string
}

export default function GuideInProgress({ message }: GuideInProgressProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-neutral-600 rounded-lg bg-neutral-800/50">
      <div className="relative w-32 h-32 mb-4">
        <Image
          src="/images/ui/underconstruc.webp"
          alt=""
          fill
          className="object-contain"
          sizes="128px"
        />
      </div>
      <h3 className="text-xl font-semibold text-neutral-200 mb-2">
        {t('guide.inProgress.title')}
      </h3>
      <p className="text-neutral-400 max-w-md">
        {message || t('guide.inProgress.description')}
      </p>
    </div>
  )
}

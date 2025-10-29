'use client'

import Image from 'next/image'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { ExclusiveEquipment } from '@/types/equipment'
import type { TenantKey } from '@/tenants/config'
import formatEffectText from '@/utils/formatText'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'

type Props = {
    ee: ExclusiveEquipment
    id: string
    lang: TenantKey
}


export default function EeDisplayMini({ ee, id, lang = 'en' }: Props) {
    const { t } = useI18n()
    const name = l(ee, 'name', lang)
    const mainStat = l(ee, 'mainStat', lang)
    const effect = l(ee, 'effect', lang)
    const effect10 = l(ee, 'effect10', lang)
    return (
        <Tooltip.Provider delayDuration={0}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <div className="cursor-help w-[40px] h-[40px]">
                        <Image
                            src={`/images/characters/ex/${id}.webp`}
                            alt={name}
                            width={40}
                            height={40}
                            className="object-cover rounded overflow-hidden"
                        />
                    </div>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                    <Tooltip.Content
                        side="top"
                        align="center"
                        className="z-50 px-3 py-2 rounded shadow-lg max-w-[260px] bg-neutral-800 text-white text-xs leading-snug"
                    >
                        <div className="text-yellow-300 text-sm font-bold text-center">
                            {name}
                        </div>
                        <div className="text-center text-sky-200 font-semibold">
                            {mainStat}
                        </div>
                        <p>
                            <span className="font-semibold text-white">{t('effect_label')}</span>{' '}
                            {formatEffectText(effect)}
                        </p>
                        <p>
                            <span className="font-semibold text-white">{t('effect_lv10_label')}</span>{' '}
                            {formatEffectText(effect10)}
                        </p>
                        <Tooltip.Arrow className="fill-neutral-800" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    )
}
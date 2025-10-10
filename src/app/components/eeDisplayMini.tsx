'use client'

import Image from 'next/image'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { ExclusiveEquipment } from '@/types/equipment'
import type { TenantKey } from '@/tenants/config'
import formatEffectText from '@/utils/formatText'
import { useI18n } from '@/lib/contexts/I18nContext'

type Props = {
    ee: ExclusiveEquipment
    id: string
    lang: TenantKey
}

// 🔧 Helper pour choisir la bonne clé en fonction de la langue
type LocalizableKey = 'name' | 'mainStat' | 'effect' | 'effect10'

function pickLangValue(  obj: ExclusiveEquipment,  key: LocalizableKey,  lang: TenantKey): string {
  // On projette l'objet sur un index signature strictement typé
  type I18nIndex =
    | LocalizableKey
    | `${LocalizableKey}_jp`
    | `${LocalizableKey}_kr`

  const o = obj as unknown as Record<I18nIndex, string | undefined>

  const base = o[key]
  const jp = o[`${key}_jp`]
  const kr = o[`${key}_kr`]

  if (lang === 'jp' && jp) return jp
  if (lang === 'kr' && kr) return kr
  return base ?? ''
}


export default function EeDisplayMini({ ee, id, lang = 'en' }: Props) {
    const { t } = useI18n()
    const name = pickLangValue(ee, 'name', lang)
    const mainStat = pickLangValue(ee, 'mainStat', lang)
    const effect = pickLangValue(ee, 'effect', lang)
    const effect10 = pickLangValue(ee, 'effect10', lang)
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
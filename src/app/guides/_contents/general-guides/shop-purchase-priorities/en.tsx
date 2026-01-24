'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import GuideHeading from '@/app/components/GuideHeading'
import { AnimatedTabs } from '@/app/components/AnimatedTabs'
import { lRec } from '@/lib/localize'
import { getT } from '@/i18n'

import {
    getTabs,
    SHOP_TAB_CONFIG,
    shopNotes,
    textOnlyShopsContent,
    LABELS,
    ShopTable,
    TextOnlyShopSection,
    type ShopKey
} from './helpers'
import { shopData } from './data'

const LANG = 'en' as const

export default function ShopPurchasePrioritiesGuide() {
    const searchParams = useSearchParams()
    const tabParam = (searchParams.get('tab') as ShopKey | null)
    const [selected, setSelected] = useState<ShopKey>('guild')

    const t = getT(LANG)
    const tabs = useMemo(() => getTabs(t), [t])

    useEffect(() => {
        if (tabParam && SHOP_TAB_CONFIG.some(tab => tab.key === tabParam)) setSelected(tabParam)
    }, [tabParam])

    const handleTabChange = (key: ShopKey) => {
        setSelected(key)
        const params = new URLSearchParams(window.location.search)
        if (key === 'guild') params.delete('tab')
        else params.set('tab', key)
        const qs = params.toString()
        const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`
        window.history.replaceState(null, '', newUrl)
    }

    const isTextOnlyShop = selected in textOnlyShopsContent

    return (
        <div className="space-y-6">
            <GuideHeading>{lRec(LABELS.title, LANG)}</GuideHeading>

            <p className="text-sm text-gray-300 leading-relaxed">
                {lRec(LABELS.description, LANG)}
            </p>

            <div className="flex justify-center mb-4">
                <AnimatedTabs
                    tabs={tabs}
                    selected={selected}
                    onSelect={handleTabChange}
                    pillColor="#10b981"
                />
            </div>

            {shopNotes[selected] && (
                <div className="text-sm text-gray-400 px-2 text-center space-y-2">
                    <p>{lRec(shopNotes[selected]!, LANG)}</p>
                </div>
            )}

            {isTextOnlyShop
                ? <TextOnlyShopSection shopKey={selected} lang={LANG} />
                : <ShopTable items={shopData[selected] ?? []} lang={LANG} />
            }
        </div>
    )
}

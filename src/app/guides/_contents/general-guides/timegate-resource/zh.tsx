'use client'

import { TimegateGuideContent, getTabs, getHeaders, type ResourceSource } from './helper'
import { data } from './data'
import { useI18n } from '@/lib/contexts/I18nContext'
import ItemInlineDisplay from '@/app/components/ItemInline'

export default function TimegatedResourcesGuide() {
    const { t } = useI18n()

    function renderSourceLabel(source: ResourceSource) {
        const baseLabel = t(source.sourceKey)

        if (source.costItem && source.costAmount) {
            return (
                <span className="inline-flex items-center gap-1 flex-wrap">
                    {baseLabel} (消耗 {source.costAmount} <ItemInlineDisplay names={[source.costItem]} />)
                </span>
            )
        }

        return baseLabel
    }

    return (
        <TimegateGuideContent
            data={data}
            tabs={getTabs(t)}
            title="限时资源指南"
            intro="本指南列出了《Outerplane》中所有可定期获取的每周和每月限时资源。请注意，这里显示的物品有时也可以通过限时活动或特殊商城礼包获得，但这些不包含在下表中。"
            renderSourceLabel={renderSourceLabel}
            headers={getHeaders(t)}
        />
    )
}

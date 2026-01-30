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
                    {baseLabel} (<ItemInlineDisplay names={[source.costItem]} /> {source.costAmount}個消費)
                </span>
            )
        }

        return baseLabel
    }

    return (
        <TimegateGuideContent
            data={data}
            tabs={getTabs(t)}
            title="時限リソースガイド"
            intro="このガイドでは、アウタープレーンで定期的に入手できる週間・月間の時限リソースをまとめています。なお、ここに記載されているアイテムは、期間限定イベントや特別なキャッシュショップパックでも入手できる場合がありますが、それらは下記の表には含まれていません。"
            renderSourceLabel={renderSourceLabel}
            headers={getHeaders(t)}
        />
    )
}

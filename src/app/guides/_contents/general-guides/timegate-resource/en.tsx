'use client'

import { TimegateGuideContent, getTabs, getHeaders, type ResourceSource } from './helper'
import { data } from './data'
import { useI18n } from '@/lib/contexts/I18nContext'
import ItemInlineDisplay from '@/app/components/ItemInline'

export default function TimegatedResourcesGuide() {
    const { t } = useI18n()

    // Source label renderer - uses i18n keys directly
    function renderSourceLabel(source: ResourceSource) {
        const baseLabel = t(source.sourceKey)

        // Handle composed sources with cost (e.g. Kate's Workshop with item cost)
        if (source.costItem && source.costAmount) {
            return (
                <span className="inline-flex items-center gap-1 flex-wrap">
                    {baseLabel} (cost {source.costAmount} <ItemInlineDisplay names={[source.costItem]} />)
                </span>
            )
        }

        return baseLabel
    }

    return (
        <TimegateGuideContent
            data={data}
            tabs={getTabs(t)}
            title="Timegated Resources Guide"
            intro="This guide lists all regular weekly and monthly sources of timegated resources in Outerplane. Please note that the items shown here can also occasionally be obtained through limited-time events or as part of special cash shop packs, which are not included in the tables below."
            renderSourceLabel={renderSourceLabel}
            headers={getHeaders(t)}
        />
    )
}

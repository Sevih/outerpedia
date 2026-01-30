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
                    {baseLabel} (<ItemInlineDisplay names={[source.costItem]} /> {source.costAmount}개 소모)
                </span>
            )
        }

        return baseLabel
    }

    return (
        <TimegateGuideContent
            data={data}
            tabs={getTabs(t)}
            title="시간제한 리소스 가이드"
            intro="이 가이드는 아우터플레인에서 정기적으로 획득할 수 있는 주간 및 월간 시간제한 리소스를 정리한 것입니다. 여기에 표시된 아이템은 기간 한정 이벤트나 특별 캐시샵 패키지를 통해서도 획득할 수 있지만, 아래 표에는 포함되어 있지 않습니다."
            renderSourceLabel={renderSourceLabel}
            headers={getHeaders(t)}
        />
    )
}

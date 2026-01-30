'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import { SectionTable, sortData } from './helpers'
import { DATA } from './data'

const sortedData = sortData(DATA)

export default function UnlockContentGuide() {
    return (
        <GuideTemplate
            title="콘텐츠 해금 가이드"
            introduction="OUTERPLANE의 많은 기능은 처음부터 사용할 수 없습니다. 스토리 진행에 따라 각 모드가 언제 해금되는지 정리했습니다."
            versions={{
                default: {
                    label: 'default',
                    content: <SectionTable data={sortedData} />
                }
            }}
        />
    )
}

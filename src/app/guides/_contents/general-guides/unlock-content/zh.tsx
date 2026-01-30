'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import { SectionTable, sortData } from './helpers'
import { DATA } from './data'

const sortedData = sortData(DATA)

export default function UnlockContentGuide() {
    return (
        <GuideTemplate
            title="内容解锁指南"
            introduction="OUTERPLANE的许多功能并非一开始就可用。以下是各模式在故事进程中解锁时间的概览。"
            versions={{
                default: {
                    label: 'default',
                    content: <SectionTable data={sortedData} />
                }
            }}
        />
    )
}

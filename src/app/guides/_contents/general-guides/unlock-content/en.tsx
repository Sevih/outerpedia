'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import { SectionTable, sortData } from './helpers'
import { DATA } from './data'

const sortedData = sortData(DATA)

export default function UnlockContentGuide() {
    return (
        <GuideTemplate
            title="Content Unlock Guide"
            introduction="Many features in OUTERPLANE are not available right away. Here is a quick overview of when each mode unlocks during the story."
            versions={{
                default: {
                    label: 'default',
                    content: <SectionTable data={sortedData} />
                }
            }}
        />
    )
}

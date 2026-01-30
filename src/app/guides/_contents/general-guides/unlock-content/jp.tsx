'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import { SectionTable, sortData } from './helpers'
import { DATA } from './data'

const sortedData = sortData(DATA)

export default function UnlockContentGuide() {
    return (
        <GuideTemplate
            title="コンテンツ解放ガイド"
            introduction="OUTERPLANEの多くの機能は最初から利用できるわけではありません。ストーリー進行に応じて各モードがいつ解放されるかをまとめました。"
            versions={{
                default: {
                    label: 'default',
                    content: <SectionTable data={sortedData} />
                }
            }}
        />
    )
}

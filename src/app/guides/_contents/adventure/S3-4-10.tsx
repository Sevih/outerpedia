'use client'

import GuideHeading from '@/app/components/GuideHeading'


export default function TyrantGuide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <GuideHeading level={4}>Hilde moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                
            </ul>
            <GuideHeading level={4}>Maxie moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">         
            </ul>
            <GuideHeading level={4}>Roxie moveset</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">          
            </ul>
            <GuideHeading level={4}>Advice</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
            </ul>
            <GuideHeading level={4}>Recommanded Characters</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">

            </ul>
        </div>
    )
}

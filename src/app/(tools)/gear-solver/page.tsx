import type { Metadata } from 'next';

import GearSolverWrapper from './GearSolverWrapper';
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
    title: `Gear Usage Finder | Outerpedia`,
    description: `Unsure which character can use your gear? This tool helps you find the best match based on equipment.`,
    keywords: ['Outerplane', 'Gear Finder', 'Recommended Gear', 'Weapons', 'Amulets', 'Sets', 'EvaMains', 'Outerpedia'],
    alternates: {
        canonical: 'https://outerpedia.com/gear-solver',
    },
    openGraph: {
        title: `Gear Usage Finder | Outerpedia`,
        description: `Unsure which character can use your gear? This tool helps you find the best match based on equipment.`,
        siteName: 'Outerpedia',
        url: 'https://outerpedia.com/gear-solver',
        type: 'website',
        images: [
            {
                url: 'https://outerpedia.com/images/ui/nav/gear-solver.png',
                width: 150,
                height: 150,
                alt: 'Gear Usage Finder – Outerpedia',
            },
        ],
    },
    twitter: {
        card: 'summary',
        title: `Gear Usage Finder | Outerpedia`,
        description: `Unsure which character can use your gear? This tool helps you find the best match based on equipment.`,
        images: ['https://outerpedia.com/images/ui/nav/gear-solver.png'],
    },
};

export default function Page() {
    return (
        <main className="p-6 max-w-5xl mx-auto">
            <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
                <Link href={`/tools`} className="relative block h-full w-full">
                    <Image
                        src="/images/ui/CM_TopMenu_Back.webp"
                        alt="Back"
                        fill
                        sizes='32px'
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                </Link>
            </div>
            <h1>Gear Usage Finder</h1>
            
            <p className="text-yellow-900 font-semibold bg-yellow-100 border border-yellow-300 rounded px-4 py-2 text-sm">
                ⚠️ The Gear Usage Finder tool is still under development — results may be incomplete or imprecise. Use it as a guide, not as a final answer.
            </p>
            <GearSolverWrapper />
        </main>
    );
}

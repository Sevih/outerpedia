'use client'

import Image from 'next/image'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { ExclusiveEquipment } from '@/types/equipment'

type Props = {
    ee: ExclusiveEquipment
    id: string
}

export default function EeDisplayMini({ ee, id }: Props) {
    return (
        <Tooltip.Provider delayDuration={0}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>

                    <div className="cursor-help w-fit h-fit">
                        <div
                            className="relative"
                            style={{ width: '40px', height: '40px' }} // ← dimensions explicites en style inline
                        >
                            <Image
                                src={`/images/characters/ex/${id}.webp`}
                                alt={ee.name}
                                width={40}
                                height={40}
                                sizes='40px'
                                className="object-contain"
                            />
                        </div>
                    </div>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                    <Tooltip.Content
                        side="top"
                        align="center"
                        className="z-50 px-3 py-2 rounded shadow-lg max-w-[260px] bg-neutral-800 text-white text-xs leading-snug"
                    >
                        <div className="text-yellow-300 text-sm font-bold text-center">
                            {ee.name}
                        </div>
                        <div className="text-center text-sky-200 font-semibold">
                            {ee.mainStat}
                        </div>
                        <div className="text-white whitespace-pre-line">Effect 0 :
                            {ee.effect}
                        </div>
                        <div className="text-yellow-400 whitespace-pre-line italic">Effect 10 :
                            {ee.effect10}
                        </div>
                        <Tooltip.Arrow className="fill-neutral-800" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    )
}
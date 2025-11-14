'use client'

import Image from 'next/image'
import { Phase1Boss } from '@/schemas/guild-raid.schema'

type Props = {
  bosses: Phase1Boss[]
  activeBossIndex: number
  onBossSelect: (index: number) => void
}

/**
 * Boss Selector Component
 * Displays clickable boss portraits for selection
 */
export function BossSelector({ bosses, activeBossIndex, onBossSelect }: Props) {
  return (
    <div className="flex gap-4 mb-4">
      {bosses.map((boss, index) => {
        // Format: vraiIdDuBoss-idImageDuBoss-versionDuBoss
        // Extract the middle part (idImageDuBoss) for the image
        const parts = boss.bossId.split('-')
        const rawImageId = parts[1] || parts[0] // Fallback to first part if no dash
        // Add leading zero if single digit (e.g., "6" -> "06")
        const imageId = rawImageId.length === 1 ? `0${rawImageId}` : rawImageId
        const bossNumber = index + 1 // Boss number is just the index in the array

        return (
          <div
            key={boss.bossId}
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => onBossSelect(index)}
          >
            <div
              className={`rounded-lg overflow-hidden border ${
                index === activeBossIndex
                  ? 'border-sky-400'
                  : 'border-neutral-700 opacity-40 grayscale'
              }`}
            >
              <Image
                src={`/images/guides/guild-raid/T_Raid_SubBoss_${imageId}.png`}
                alt={`Boss ${bossNumber}`}
                width={130}
                height={250}
                priority
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

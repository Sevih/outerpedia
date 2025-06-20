import React from 'react'
import bossData from '@/data/boss.json'
import Link from 'next/link'

type Props = {
  source?: string
  boss?: string
  mode?: string
}

type BossEntry = {
  id: string
  guide?: string
  category: string
}

const bossLookup: Record<string, BossEntry> = (() => {
  const flat: Record<string, BossEntry> = {}

  for (const section of bossData as Record<string, any[]>[]) {
    for (const [category, entries] of Object.entries(section)) {
      for (const group of entries as Record<string, { id: string; guide?: string }[]>[]) {
        for (const [bossName, bossArray] of Object.entries(group)) {
          const info = bossArray[0] as { id: string; guide?: string }
          flat[bossName] = {
            id: info.id,
            guide: info.guide,
            category,
          }
        }

      }
    }
  }

  return flat
})()

export default function ItemSourceBox({ source, boss, mode }: Props) {
  if (!source && !boss && !mode) return null

  const bossInfo = boss && typeof bossLookup[boss] === 'object' ? bossLookup[boss] : undefined

  
  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-2xl text-sm text-neutral-300">
      {source && (
        <p className="mb-1">
          <span className="font-semibold">Source:</span> {source}
        </p>
      )}
      {boss && (
        <p className="mb-1">
          <span className="font-semibold">Boss:</span> {boss}
          {bossInfo?.guide && (
            <>
              {' '}
              —{' '}
              <Link
                href={`/guides/special-request/${bossInfo.guide}`}
                className="text-amber-300 hover:underline"
              >
                View Guide
              </Link>
            </>
          )}
        </p>
      )}

      {mode && (
        <p>
          <span className="font-semibold">Mode:</span> {mode}
        </p>
      )}
    </div>
  )
}

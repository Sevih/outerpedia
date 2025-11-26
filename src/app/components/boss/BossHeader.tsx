'use client'

import ElementInlineTag from '../ElementInline'
import ClassInlineTag from '../ClassInlineTag'

type Props = {
  bossName: string
  bossSurname?: string
  className: string
  element: string
  level: number
  compact?: boolean
}

export default function BossHeader({ bossName, bossSurname, className, element, level, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-white truncate">{bossName}</h3>
        {bossSurname && <div className="text-xs text-neutral-400 truncate">{bossSurname}</div>}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-neutral-400">Level {level}</span>
          <ClassInlineTag name={className} notext />
          <ElementInlineTag element={element.toLowerCase()} notext />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-2 items-end text-sm">
        {bossSurname && <span className="text-neutral-400">{bossSurname}</span>}
        <span className="hidden sm:inline">
          <ClassInlineTag name={className} />
        </span>
        <span className="sm:hidden">
          <ClassInlineTag name={className} notext />
        </span>
        <span className="hidden sm:inline">
          <ElementInlineTag element={element.toLowerCase()} />
        </span>
        <span className="sm:hidden">
          <ElementInlineTag element={element.toLowerCase()} notext />
        </span>
        <span className="text-neutral-400">Level {level}</span>
      </div>
      <h3 className="text-2xl font-bold text-white">{bossName}</h3>
    </div>
  )
}

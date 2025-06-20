'use client'
import type {
  Set
} from '@/types/equipment'
export function renderSet(set: Set) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{set.name}</h1>
      {set.effect_2_4 && <p><strong>2-piece (Lv4):</strong> {set.effect_2_4}</p>}
      {set.effect_4_4 && <p><strong>4-piece (Lv4):</strong> {set.effect_4_4}</p>}
    </div>
  )
}

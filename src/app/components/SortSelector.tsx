'use client'

import { useEffect } from 'react'

export default function SortSelector() {
  useEffect(() => {
    const select = document.getElementById('sortSelector')
    const container = document.querySelector('[data-guide-grid]')

    if (!select || !container) return

    const handleSort = (e: Event) => {
      const value = (e.target as HTMLSelectElement).value
      const [key, order] = value.split('-')
      const cards = Array.from(container.children)

      cards.sort((a, b) => {
        const va = a.getAttribute(`data-${key}`)
        const vb = b.getAttribute(`data-${key}`)

        // fallback safe
        if (!va || !vb) return 0

        if (key === 'date' || key === 'weight') {
          const na = Number(va)
          const nb = Number(vb)
          if (!Number.isFinite(na) || !Number.isFinite(nb)) return 0
          return order === 'asc' ? na - nb : nb - na
        }

        return order === 'asc'
          ? va.localeCompare(vb)
          : vb.localeCompare(va)
      })

      // Appliquer le nouvel ordre
      cards.forEach((el) => container.appendChild(el))
    }

    select.addEventListener('change', handleSort)
    return () => select.removeEventListener('change', handleSort)
  }, [])

  return (
    <select
      id="sortSelector"
      className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1 text-sm"
    >
      {/* tri par défaut = weight asc */}
      <option value="weight-asc">Default (Weight)</option>
      <option value="date-desc">Date (Newest)</option>
      <option value="date-asc">Date (Oldest)</option>
      <option value="title-asc">Title A→Z</option>
      <option value="title-desc">Title Z→A</option>
      <option value="author-asc">Author A→Z</option>
      <option value="author-desc">Author Z→A</option>
    </select>
  )
}

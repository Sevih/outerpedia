'use client'

import { useEffect, useState } from 'react'

const elementColors: Record<string, string> = {
  fire: 'bg-red-600 text-white',
  water: 'bg-blue-600 text-white',
  light: 'bg-yellow-400 text-black',
  dark: 'bg-purple-700 text-white',
  earth: 'bg-emerald-600 text-white'
}

export default function Countdown({ endDate, element }: { endDate: string, element: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  function getTimeLeft() {
    const total = Date.parse(endDate) - Date.now()
    if (total <= 0) return 'Banner ended'

    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))

    return `${days}d ${hours}h${days === 0 ? ` ${minutes}m` : ''}`
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 60 * 1000)

    return () => clearInterval(timer)
  }, [])

  const badgeClass = elementColors[element] || 'bg-cyan-900 text-cyan-300'

  return (
    <span className={`inline-block ${badgeClass} text-xs font-semibold rounded px-2 py-1 mt-1`} style={{ fontFamily: '"Poppins", sans-serif' }}>
      Ends in: {timeLeft}
    </span>
  )
}

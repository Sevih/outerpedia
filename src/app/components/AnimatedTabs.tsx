'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

type TabData<T = string> = {
  key: T
  label: string
  icon?: string
  color?: string
}

type AnimatedTabsProps<T = string> = {
  tabs: TabData<T>[]
  selected: T
  onSelect: (key: T) => void
  pillColor?: string
  scrollable?: boolean
  compact?: boolean
}

export function AnimatedTabs<T extends string>({
  tabs,
  selected,
  onSelect,
  pillColor = '#0ea5e9',
  scrollable = false,
  compact = false,
}: AnimatedTabsProps<T>) {
  const [activeTabRef, setActiveTabRef] = useState<HTMLButtonElement | null>(null)
  const [style, setStyle] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    if (activeTabRef) {
      const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = activeTabRef
      setStyle({ top: offsetTop, left: offsetLeft, width: offsetWidth, height: offsetHeight })
    }
  }, [activeTabRef, selected])

  return (
    <div
      className={`relative rounded-full bg-gray-100 dark:bg-gray-800 p-1 ${scrollable ? 'overflow-x-auto whitespace-nowrap' : 'flex-wrap justify-center'
        }`}
    >
      <div className="relative overflow-hidden">
        {style && (
          <motion.div
            className="absolute z-0 rounded-full"
            style={{
              top: style.top,
              left: style.left,
              width: style.width,
              height: style.height,
              backgroundColor: pillColor
            }}
            animate={style}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        <div
          className={`relative z-10 flex items-center ${scrollable ? 'overflow-x-auto scrollbar-none whitespace-nowrap' : 'flex-wrap justify-center'
            }`}
        >
{tabs.map((tab) => {
  const isSelected = selected === tab.key

  // couleur inline UNIQUEMENT si sélectionné + tab.color fourni
  const styleColor = isSelected && tab.color ? { color: tab.color } : undefined

  // classes texte selon état + thème
  const textClass = isSelected
    ? (tab.color ? '' : 'text-white')              // actif: blanc par défaut si pas de color
    : 'text-gray-800 dark:text-white'              // inactif: noir en light, blanc en dark

  // icône noire si texte noir sélectionné
  const wantsBlackIcon =
    isSelected && !!tab.color && ['#000','#000000','black'].includes(tab.color.toLowerCase())
  const iconStyle = wantsBlackIcon ? { filter: 'brightness(0)' } : undefined

  return (
    <button
      key={tab.key}
      ref={(el) => { if (isSelected) setActiveTabRef(el) }}
      onClick={() => onSelect(tab.key)}
      className={`shrink-0 min-w-[80px] ${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}
        rounded-full font-medium flex items-center gap-2 transition-colors
        ${textClass} ${!isSelected ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : ''}`}
      style={styleColor}
    >
      {tab.icon && (
        <Image
          src={tab.icon}
          alt={tab.label}
          width={16}
          height={16}
          style={{ width: 16, height: 16, ...iconStyle }}
          className="object-contain"
        />
      )}
      <span>{tab.label}</span>
    </button>
  )
})}





        </div>
      </div>
    </div>

  )
}

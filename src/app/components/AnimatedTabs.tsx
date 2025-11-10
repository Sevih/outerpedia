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
  className={`relative rounded-full bg-gray-800 p-1 ${scrollable ? 'overflow-x-auto whitespace-nowrap' : 'flex-wrap justify-center'}`}
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
          {tabs.map((tab) => (
            <button
              key={tab.key}
              ref={(el) => {
                if (selected === tab.key) setActiveTabRef(el)
              }}
              onClick={() => onSelect(tab.key)}
              className={`shrink-0 min-w-[80px] ${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'
                } rounded-full font-medium flex items-center gap-2 transition-all ${selected === tab.key
                  ? 'text-white grayscale-0 opacity-100'
                  : 'text-gray-300 hover:bg-gray-700 grayscale opacity-60 hover:opacity-80 hover:grayscale-0'
                }`}
            >
              {tab.icon && (
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={20}
                  height={20}
                  style={{ width: 20, height: 20 }}
                  className="object-contain"
                />

              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

  )
}

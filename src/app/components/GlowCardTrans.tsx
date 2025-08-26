import React from 'react'
import GlowFrame from './GlowFrame'
import Image from 'next/image'

type Props = {
  title: string
  description: React.ReactNode
  image: string
  type: 'pve' | 'pvp'
}

export function RecoTrans({ title, description, image, type }: Props) {
  const glowShort = type === 'pve' ? 'blue' : 'red'

  return (    
    <div className="relative z-10 flex flex-col items-center text-center gap-4">
      {/* Cadre + GlowFrame imbriqués */}
      <div className="relative w-[65px] h-[90px]">
        <Image
          src="/images/ui/CLG_Ruins_Frame.png"
          alt="back Frame"
          fill
          priority
          className="object-contain z-0 pointer-events-none select-none"
        />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <GlowFrame src={image} alt={title} color={glowShort} size={35} />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="text-gray-300 text-sm">{description}</div>
    </div>
  )
}

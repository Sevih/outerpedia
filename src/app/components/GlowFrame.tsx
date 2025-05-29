'use client'

import Image from 'next/image'
import clsx from 'clsx'

type GlowFrameProps = {
  src: string
  alt: string
  color?: 'blue' | 'red'
  size?: number
}

export default function GlowFrame({
  src,
  alt,
  color = 'blue',
  size = 150,
}: GlowFrameProps) {
  const glowClass =
    color === 'red'
      ? 'from-red-500 to-pink-500'
      : 'from-cyan-400 to-blue-500'

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Glow animé */}
      <div
        className={clsx(
          'absolute inset-0 rounded-xl blur-xl opacity-60 animate-pulse z-0',
          'bg-gradient-to-br',
          glowClass
        )}
      ></div>

      {/* Image au-dessus */}
      <div className="relative z-10">
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}

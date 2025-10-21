'use client'

import Image from 'next/image'
import clsx from 'clsx'

type GlowFrameProps = {
  src: string
  alt: string
  color?: 'blue' | 'red' | 'green'
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
      : color === 'green'
        ? 'from-emerald-400 to-lime-500'
        : 'from-cyan-400 to-blue-500'

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Glow animé */}
      <div
        className={clsx(
          'absolute inset-0 rounded-xl blur-xl opacity-60 animate-[glowPulse_2.5s_ease-in-out_infinite] z-0',
          'bg-gradient-to-br',
          glowClass
        )}
      ></div>

      <style jsx>{`
  @keyframes glowPulse {
    0%, 100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`}</style>

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

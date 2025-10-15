'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

type Props = {
  fallback?: string
  size?: number
  alt?: string
}

export default function BackButton({ fallback = '/item', size = 32, alt = 'Back' }: Props) {
  const router = useRouter()

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push(fallback)
  }

  return (
    <button
      onClick={handleClick}
      className="relative w-8 h-8 cursor-pointer"
      aria-label={alt}
      type="button"
    >
      <Image
        src="/images/ui/CM_TopMenu_Back.webp"
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain opacity-80 hover:opacity-100 transition-opacity"
        priority
      />
    </button>
  )
}

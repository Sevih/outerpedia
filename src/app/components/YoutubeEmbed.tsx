'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function YoutubeEmbed({
  videoId,
  title,
  startTime = 0
}: {
  videoId?: string
  title: string
  startTime?: number
}) {
  const [play, setPlay] = useState(false)
  const [thumbnailIndex, setThumbnailIndex] = useState(0)
 //console.log(videoId);
  if (!videoId) return null

  // Cascade de fallbacks - on commence par hqdefault qui est quasi toujours disponible
  const thumbnailOptions = [
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // 480x360 (quasi toujours disponible)
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // 320x180
    `https://img.youtube.com/vi/${videoId}/default.jpg`,       // 120x90 (toujours disponible)
  ]

  const thumbnail = thumbnailOptions[thumbnailIndex]

  const handleImageError = () => {
    // Si l'image échoue, passe à la suivante
    if (thumbnailIndex < thumbnailOptions.length - 1) {
      setThumbnailIndex(thumbnailIndex + 1)
    }
  }

  return (
    <div className="w-full rounded overflow-hidden mt-6 aspect-video bg-black">
      {play ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startTime}`}
          title={title}
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div
          className="w-full h-full relative cursor-pointer group"
          onClick={() => setPlay(true)}
        >
          <Image
            key={thumbnail}
            src={thumbnail}
            alt={title}
            fill
            className="object-contain"
            unoptimized
            onError={handleImageError}
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-200">
            <div className="w-24 h-16 rounded-[12px] bg-[#FF0000] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="90"
                height="90"
                fill="white"
              >
                <polygon points="9,7 17,12 9,17" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

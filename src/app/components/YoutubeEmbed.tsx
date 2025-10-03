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
  const [imgError, setImgError] = useState(false)
 //console.log(videoId);
  if (!videoId) return null

  const thumbnail = imgError
    ? `https://img.youtube.com/vi_webp/${videoId}/hqdefault.webp`
    : `https://img.youtube.com/vi_webp/${videoId}/maxresdefault.webp`

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
            src={thumbnail}
            alt={title}
            fill
            className="object-contain"
            priority
            onError={() => setImgError(true)}
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

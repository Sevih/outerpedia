'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function YoutubeEmbed({ videoId, title }: { videoId?: string; title: string }) {
  const [play, setPlay] = useState(false)

  if (!videoId) return null

  return (
    <div className="w-full rounded overflow-hidden mt-6" style={{ height: '450px' }}>
      {play ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <div
          className="w-full h-full bg-black relative cursor-pointer group"
          onClick={() => setPlay(true)}
        >
          {/* Miniature YouTube */}
          <Image
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            className="object-cover"
          />

          {/* Overlay avec bouton style YouTube */}
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

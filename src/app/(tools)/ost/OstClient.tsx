'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import type { WithLocalizedFields } from '@/types/common'

type BaseTrack = {
  file: string
  name: string
  size: number
  duration: number
}

type Track = WithLocalizedFields<BaseTrack, 'name'>

interface Props {
  tracks: Track[]
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function OstClient({ tracks }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1)
      } else {
        setIsPlaying(false)
      }
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [currentTrackIndex, tracks.length])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || currentTrackIndex === null) return

    const track = tracks[currentTrackIndex]
    audio.src = `/audio/bgm/${track.file}.mp3`
    audio.play().catch(() => {
      setIsPlaying(false)
    })
  }, [currentTrackIndex, tracks])

  const playTrack = useCallback((index: number) => {
    if (currentTrackIndex === index) {
      const audio = audioRef.current
      if (audio) {
        if (isPlaying) {
          audio.pause()
        } else {
          audio.play()
        }
      }
    } else {
      setCurrentTrackIndex(index)
    }
  }, [currentTrackIndex, isPlaying])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    audio.currentTime = percent * duration
  }, [duration])

  const handlePrevious = useCallback(() => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }, [currentTrackIndex])

  const handleNext = useCallback(() => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    }
  }, [currentTrackIndex, tracks.length])

  return (
    <div className="min-h-screen pb-24">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="bg-gradient-to-b from-sky-900/40 to-transparent px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Playlist</p>
              <h1 className="text-2xl md:text-4xl font-bold">{t('ost.title')}</h1>
              <p className="text-sm text-gray-400 mt-1">OUTERPLANE / VAGames • {tracks.length} tracks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="mt-4">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[40px_1fr_70px_70px_50px] gap-4 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-neutral-800">
            <span>#</span>
            <span>Title</span>
            <span className="text-right">Duration</span>
            <span className="text-right">Size</span>
            <span></span>
          </div>

          {/* Tracks */}
          <div className="divide-y divide-neutral-800/50">
            {tracks.map((track, index) => {
              const isActive = currentTrackIndex === index
              const isCurrentlyPlaying = isActive && isPlaying

              return (
                <div
                  key={track.file}
                  className={`group grid grid-cols-[32px_1fr_50px] md:grid-cols-[40px_1fr_70px_70px_50px] gap-2 md:gap-4 px-2 md:px-4 py-3 items-center cursor-pointer transition-colors rounded-md ${
                    isActive
                      ? 'bg-sky-500/10'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => playTrack(index)}
                >
                  {/* Number / Play indicator */}
                  <div className="flex items-center justify-center">
                    {isCurrentlyPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-sky-500 animate-pulse" style={{ height: '100%', animationDelay: '0ms' }}></span>
                        <span className="w-1 bg-sky-500 animate-pulse" style={{ height: '60%', animationDelay: '150ms' }}></span>
                        <span className="w-1 bg-sky-500 animate-pulse" style={{ height: '80%', animationDelay: '300ms' }}></span>
                      </div>
                    ) : (
                      <>
                        <span className={`text-sm group-hover:hidden ${isActive ? 'text-sky-500' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                        <svg className="w-4 h-4 text-white hidden group-hover:block" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </>
                    )}
                  </div>

                  {/* Track name */}
                  <div className="min-w-0">
                    <p className={`truncate text-sm md:text-base ${isActive ? 'text-sky-500 font-medium' : 'text-gray-200'}`}>
                      {l(track, 'name', lang)}
                    </p>
                  </div>

                  {/* Duration (desktop) */}
                  <div className="hidden md:block text-right text-sm text-gray-400">
                    {formatTime(track.duration)}
                  </div>

                  {/* Size (desktop) */}
                  <div className="hidden md:block text-right text-sm text-gray-500">
                    {track.size.toFixed(1)} MB
                  </div>

                  {/* Duration (mobile) + Download */}
                  <div className="flex items-center justify-end gap-1">
                    <span className="md:hidden text-xs text-gray-500">{formatTime(track.duration)}</span>
                    <a
                      href={`/audio/bgm/${track.file}.mp3`}
                      download={`${track.file}.mp3`}
                      className="p-2 text-gray-500 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      title={`${t('ost.download')} (${track.size.toFixed(1)} MB)`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom player */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 z-50">
        {/* Progress bar (top of player) */}
        <div
          className="h-1 bg-neutral-700 cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-sky-500 group-hover:bg-sky-400 transition-colors relative"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-3 max-w-screen-xl mx-auto">
          {/* Track info (left) */}
          <div className="flex items-center gap-3 w-1/4 min-w-0">
            {currentTrack ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 rounded flex-shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l(currentTrack, 'name', lang)}</p>
                  <p className="text-xs text-gray-400">OUTERPLANE</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">{t('ost.selectTrack')}</p>
            )}
          </div>

          {/* Controls (center) */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentTrackIndex === 0 || currentTrackIndex === null}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                </svg>
              </button>

              <button
                onClick={() => currentTrackIndex !== null && playTrack(currentTrackIndex)}
                disabled={currentTrackIndex === null}
                className="p-2 bg-white hover:scale-105 disabled:bg-gray-600 disabled:hover:scale-100 rounded-full text-black transition-transform"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={currentTrackIndex === null || currentTrackIndex === tracks.length - 1}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Time display (desktop only) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <span>/</span>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right side (download) */}
          <div className="w-1/4 flex justify-end">
            {currentTrack && (
              <a
                href={`/audio/bgm/${currentTrack.file}.mp3`}
                download={`${currentTrack.file}.mp3`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden md:inline">{t('ost.download')}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

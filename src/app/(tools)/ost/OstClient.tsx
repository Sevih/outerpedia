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
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off')
  const [playHistory, setPlayHistory] = useState<number[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0
        audio.play()
        return
      }

      if (shuffle) {
        const availableIndices = tracks.map((_, i) => i).filter(i => i !== currentTrackIndex)
        if (availableIndices.length > 0) {
          const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
          setPlayHistory(prev => [...prev, randomIndex])
          setHistoryIndex(prev => prev + 1)
          setCurrentTrackIndex(randomIndex)
        }
        return
      }

      if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1)
      } else if (repeat === 'all') {
        setCurrentTrackIndex(0)
      } else {
        setIsPlaying(false)
      }
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setIsLoading(false)
      setError('Failed to load track')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [currentTrackIndex, tracks.length, shuffle, repeat, tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || currentTrackIndex === null) return

    setIsLoading(true)
    setError(null)
    const track = tracks[currentTrackIndex]
    audio.src = `/audio/bgm/${track.file}.mp3`
    audio.play().catch(() => {
      setIsPlaying(false)
      setIsLoading(false)
    })
  }, [currentTrackIndex, tracks])

  // Sync volume with audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const playTrack = useCallback((index: number, fromHistory = false) => {
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
      if (!fromHistory) {
        // Add to history when playing a new track (not from navigation)
        setPlayHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1)
          return [...newHistory, index]
        })
        setHistoryIndex(prev => prev + 1)
      }
      setCurrentTrackIndex(index)
    }
  }, [currentTrackIndex, isPlaying, historyIndex])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    audio.currentTime = percent * duration
  }, [duration])

  const handlePrevious = useCallback(() => {
    if (currentTrackIndex === null) return

    if (shuffle && historyIndex > 0) {
      // Go back in history
      const prevIndex = historyIndex - 1
      setHistoryIndex(prevIndex)
      setCurrentTrackIndex(playHistory[prevIndex])
    } else if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    } else if (repeat === 'all') {
      setCurrentTrackIndex(tracks.length - 1)
    }
  }, [currentTrackIndex, repeat, tracks.length, shuffle, historyIndex, playHistory])

  const handleNext = useCallback(() => {
    if (currentTrackIndex === null) return

    if (shuffle) {
      // Check if we can go forward in history
      if (historyIndex < playHistory.length - 1) {
        const nextIndex = historyIndex + 1
        setHistoryIndex(nextIndex)
        setCurrentTrackIndex(playHistory[nextIndex])
      } else {
        // Pick a random track and add to history
        const availableIndices = tracks.map((_, i) => i).filter(i => i !== currentTrackIndex)
        if (availableIndices.length > 0) {
          const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
          setPlayHistory(prev => [...prev, randomIndex])
          setHistoryIndex(prev => prev + 1)
          setCurrentTrackIndex(randomIndex)
        }
      }
    } else if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    } else if (repeat === 'all') {
      setCurrentTrackIndex(0)
    }
  }, [currentTrackIndex, shuffle, repeat, tracks, historyIndex, playHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const audio = audioRef.current

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (currentTrackIndex !== null && audio) {
            if (isPlaying) {
              audio.pause()
            } else {
              audio.play()
            }
          }
          break
        case 'ArrowLeft':
          if (audio && duration) {
            e.preventDefault()
            audio.currentTime = Math.max(0, audio.currentTime - 5)
          }
          break
        case 'ArrowRight':
          if (audio && duration) {
            e.preventDefault()
            audio.currentTime = Math.min(duration, audio.currentTime + 5)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(v => Math.min(1, v + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(v => Math.max(0, v - 0.1))
          break
        case 'KeyM':
          setIsMuted(m => !m)
          break
        case 'KeyN':
          handleNext()
          break
        case 'KeyP':
          handlePrevious()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTrackIndex, isPlaying, duration, handleNext, handlePrevious])

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
              <h1 className="text-2xl md:text-4xl font-bold">{t('ost.title')}</h1>
              <p className="text-sm text-gray-400 mt-1">OUTERPLANE / VAGames • {tracks.length} tracks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-4xl px-4 md:px-8 mt-4">
        <div className="p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-amber-200/90 text-sm">
            <p>{t('ost.disclaimer.line1')}</p>
            <p className="mt-1">{t('ost.disclaimer.line2')}</p>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="hidden md:block mt-3 text-xs text-gray-500">
          {t('ost.keyboardShortcuts')}: Space (play/pause) • ←→ (seek) • ↑↓ (volume) • M (mute) • N/P (next/prev)
        </p>
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
                    {isActive && isLoading ? (
                      <svg className="w-4 h-4 text-sky-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : isCurrentlyPlaying ? (
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
                <div className={`w-10 h-10 rounded flex-shrink-0 flex items-center justify-center ${error ? 'bg-red-500/20' : 'bg-gradient-to-br from-sky-500 to-sky-700'}`}>
                  {error ? (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${error ? 'text-red-400' : ''}`}>{l(currentTrack, 'name', lang)}</p>
                  <p className={`text-xs ${error ? 'text-red-400/70' : 'text-gray-400'}`}>{error || 'OUTERPLANE'}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">{t('ost.selectTrack')}</p>
            )}
          </div>

          {/* Controls (center) */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Shuffle */}
              <button
                onClick={() => setShuffle(s => !s)}
                className={`p-1 transition-colors ${shuffle ? 'text-sky-500' : 'text-gray-400 hover:text-white'}`}
                title="Shuffle"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
              </button>

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
                disabled={currentTrackIndex === null || isLoading}
                className="p-2 bg-white hover:scale-105 disabled:bg-gray-600 disabled:hover:scale-100 rounded-full text-black transition-transform"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : isPlaying ? (
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

              {/* Repeat */}
              <button
                onClick={() => setRepeat(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
                className={`p-1 transition-colors relative ${repeat !== 'off' ? 'text-sky-500' : 'text-gray-400 hover:text-white'}`}
                title={repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat off'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
                {repeat === 'one' && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
                )}
              </button>
            </div>

            {/* Time display (desktop only) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <span>/</span>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right side (volume + download) */}
          <div className="w-1/4 flex items-center justify-end gap-2">
            {/* Volume control */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsMuted(m => !m)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                  setIsMuted(false)
                }}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Download */}
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

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { audio as audioUrl } from '@/lib/audio';

/** Une piste de l'OST (schéma de `data/generated/bgm_mapping.json`). */
export interface BgmTrack {
  file: string;
  name: string;
  name_jp?: string;
  name_kr?: string;
  name_zh?: string;
  size: number;
  duration: number;
}

export interface OstStrings {
  download: string;
  selectTrack: string;
  disclaimer1: string;
  disclaimer2: string;
  keyboardShortcuts: string;
}

type Repeat = 'off' | 'one' | 'all';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Nom de piste localisé (repli sur l'anglais `name` si la langue manque). */
function trackName(track: BgmTrack, lang: Lang): string {
  if (lang === 'en' || lang === 'fr') return track.name;
  const key = `name_${lang}` as 'name_jp' | 'name_kr' | 'name_zh';
  return track[key] ?? track.name;
}

/**
 * Jukebox de l'OST : liste des pistes + lecteur fixe en bas (lecture, seek,
 * shuffle, repeat, volume, download) et raccourcis clavier. Logique reprise de
 * la V2 ; habillage refait sur les tokens sémantiques V3 (accent ciel conservé,
 * autorisé hors `guides/**`).
 */
export function OstPlayer({
  lang,
  tracks,
  strings,
}: {
  lang: Lang;
  tracks: BgmTrack[];
  strings: OstStrings;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<Repeat>('off');
  const [playHistory, setPlayHistory] = useState<number[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  const switchTrack = useCallback(
    (index: number) => {
      setCurrentTrackIndex(index);
      const el = audioRef.current;
      if (!el) return;
      setIsLoading(true);
      setError(null);
      el.src = audioUrl.bgm(tracks[index].file);
      el.play().catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
      });
    },
    [tracks],
  );

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTime = () => setCurrentTime(el.currentTime);
    const onDuration = () => setDuration(el.duration);
    const onEnded = () => {
      if (repeat === 'one') {
        el.currentTime = 0;
        el.play();
        return;
      }
      if (shuffle) {
        const pool = tracks.map((_, i) => i).filter((i) => i !== currentTrackIndex);
        if (pool.length > 0) {
          const next = pool[Math.floor(Math.random() * pool.length)];
          setPlayHistory((prev) => [...prev, next]);
          setHistoryIndex((prev) => prev + 1);
          switchTrack(next);
        }
        return;
      }
      if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
        switchTrack(currentTrackIndex + 1);
      } else if (repeat === 'all') {
        switchTrack(0);
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setError('Failed to load track');
    };

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('durationchange', onDuration);
    el.addEventListener('ended', onEnded);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('durationchange', onDuration);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('error', onError);
    };
  }, [currentTrackIndex, shuffle, repeat, switchTrack, tracks]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const playTrack = useCallback(
    (index: number) => {
      if (currentTrackIndex === index) {
        const el = audioRef.current;
        if (el) {
          if (isPlaying) el.pause();
          else el.play();
        }
        return;
      }
      setPlayHistory((prev) => [...prev.slice(0, historyIndex + 1), index]);
      setHistoryIndex((prev) => prev + 1);
      switchTrack(index);
    },
    [currentTrackIndex, isPlaying, historyIndex, switchTrack],
  );

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = audioRef.current;
      if (!el || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      el.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    },
    [duration],
  );

  const handlePrevious = useCallback(() => {
    if (currentTrackIndex === null) return;
    if (shuffle && historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      switchTrack(playHistory[prev]);
    } else if (currentTrackIndex > 0) {
      switchTrack(currentTrackIndex - 1);
    } else if (repeat === 'all') {
      switchTrack(tracks.length - 1);
    }
  }, [currentTrackIndex, repeat, shuffle, historyIndex, playHistory, switchTrack, tracks]);

  const handleNext = useCallback(() => {
    if (currentTrackIndex === null) return;
    if (shuffle) {
      if (historyIndex < playHistory.length - 1) {
        const next = historyIndex + 1;
        setHistoryIndex(next);
        switchTrack(playHistory[next]);
      } else {
        const pool = tracks.map((_, i) => i).filter((i) => i !== currentTrackIndex);
        if (pool.length > 0) {
          const next = pool[Math.floor(Math.random() * pool.length)];
          setPlayHistory((prev) => [...prev, next]);
          setHistoryIndex((prev) => prev + 1);
          switchTrack(next);
        }
      }
    } else if (currentTrackIndex < tracks.length - 1) {
      switchTrack(currentTrackIndex + 1);
    } else if (repeat === 'all') {
      switchTrack(0);
    }
  }, [currentTrackIndex, shuffle, repeat, historyIndex, playHistory, switchTrack, tracks]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const el = audioRef.current;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentTrackIndex !== null && el) {
            if (isPlaying) el.pause();
            else el.play();
          }
          break;
        case 'ArrowLeft':
          if (el && duration) {
            e.preventDefault();
            el.currentTime = Math.max(0, el.currentTime - 5);
          }
          break;
        case 'ArrowRight':
          if (el && duration) {
            e.preventDefault();
            el.currentTime = Math.min(duration, el.currentTime + 5);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'KeyM':
          setIsMuted((m) => !m);
          break;
        case 'KeyN':
          handleNext();
          break;
        case 'KeyP':
          handlePrevious();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentTrackIndex, isPlaying, duration, handleNext, handlePrevious]);

  return (
    <div className="mx-auto max-w-4xl pb-28">
      <audio ref={audioRef} />

      {/* En-tête */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-sky-700 shadow-lg md:size-20">
          <MusicGlyph className="text-content-strong size-8 md:size-10" />
        </div>
        <p className="text-content-subtle font-mono text-xs tracking-[0.12em] uppercase">
          OUTERPLANE / VA Games &middot; {tracks.length} tracks
        </p>
      </div>

      {/* Disclaimer + raccourcis */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
        <InfoGlyph className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div className="text-sm text-amber-200/90">
          <p>{strings.disclaimer1}</p>
          <p className="mt-1">{strings.disclaimer2}</p>
        </div>
      </div>
      <p className="text-content-subtle mt-3 hidden text-xs md:block">
        {strings.keyboardShortcuts}: Space &middot; &larr;&rarr; &middot; &uarr;&darr; &middot; M
        &middot; N/P
      </p>

      {/* Liste des pistes */}
      <div className="mt-4">
        <div className="border-line text-content-subtle hidden grid-cols-[40px_1fr_70px_70px_50px] gap-4 border-b px-4 py-2 text-xs tracking-wider uppercase md:grid">
          <span>#</span>
          <span>Title</span>
          <span className="text-right">Duration</span>
          <span className="text-right">Size</span>
          <span />
        </div>

        <div className="divide-line-subtle divide-y">
          {tracks.map((track, index) => {
            const isActive = currentTrackIndex === index;
            const nowPlaying = isActive && isPlaying;
            return (
              <div
                key={track.file}
                className={`group grid cursor-pointer grid-cols-[32px_1fr_50px] items-center gap-2 rounded-md px-2 py-3 transition-colors md:grid-cols-[40px_1fr_70px_70px_50px] md:gap-4 md:px-4 ${
                  isActive ? 'bg-sky-500/10' : 'hover:bg-surface-overlay'
                }`}
                onClick={() => playTrack(index)}
              >
                {/* Numéro / indicateur */}
                <div className="flex items-center justify-center">
                  {isActive && isLoading ? (
                    <SpinnerGlyph className="size-4 text-sky-400" />
                  ) : nowPlaying ? (
                    <div className="flex h-4 items-end gap-0.5">
                      <span className="w-1 animate-pulse bg-sky-400" style={{ height: '100%' }} />
                      <span
                        className="w-1 animate-pulse bg-sky-400"
                        style={{ height: '60%', animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1 animate-pulse bg-sky-400"
                        style={{ height: '80%', animationDelay: '300ms' }}
                      />
                    </div>
                  ) : (
                    <>
                      <span
                        className={`text-sm group-hover:hidden ${isActive ? 'text-sky-400' : 'text-content-subtle'}`}
                      >
                        {index + 1}
                      </span>
                      <PlayGlyph className="text-content-strong hidden size-4 group-hover:block" />
                    </>
                  )}
                </div>

                {/* Titre */}
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm md:text-base ${isActive ? 'font-medium text-sky-400' : 'text-content-strong'}`}
                  >
                    {trackName(track, lang)}
                  </p>
                </div>

                {/* Durée (desktop) */}
                <div className="text-content-muted hidden text-right text-sm md:block">
                  {formatTime(track.duration)}
                </div>
                {/* Taille (desktop) */}
                <div className="text-content-subtle hidden text-right text-sm md:block">
                  {track.size.toFixed(1)} MB
                </div>

                {/* Durée (mobile) + download */}
                <div className="flex items-center justify-end gap-1">
                  <span className="text-content-subtle text-xs md:hidden">
                    {formatTime(track.duration)}
                  </span>
                  <a
                    href={audioUrl.bgm(track.file)}
                    download={`${track.file}.mp3`}
                    className="text-content-subtle p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:text-sky-400"
                    onClick={(e) => e.stopPropagation()}
                    title={`${strings.download} (${track.size.toFixed(1)} MB)`}
                  >
                    <DownloadGlyph className="size-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lecteur fixe */}
      <div className="border-line bg-surface-base/95 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-sm">
        {/* Barre de progression */}
        <div className="group bg-surface-overlay h-1 cursor-pointer" onClick={handleSeek}>
          <div
            className="relative h-full bg-sky-500 transition-colors group-hover:bg-sky-400"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          >
            <div className="bg-content-strong absolute top-1/2 right-0 size-3 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Info piste */}
          <div className="flex min-w-0 items-center gap-3 md:w-1/4">
            {currentTrack ? (
              <>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded ${error ? 'bg-red-500/20' : 'bg-linear-to-br from-sky-500 to-sky-700'}`}
                >
                  {error ? (
                    <WarnGlyph className="size-5 text-red-400" />
                  ) : (
                    <MusicGlyph className="text-content-strong size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-medium ${error ? 'text-red-400' : 'text-content-strong'}`}
                  >
                    {trackName(currentTrack, lang)}
                  </p>
                  <p className={`text-xs ${error ? 'text-red-400/70' : 'text-content-subtle'}`}>
                    {error ?? 'OUTERPLANE'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-content-subtle text-sm">{strings.selectTrack}</p>
            )}
          </div>

          {/* Contrôles */}
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                type="button"
                onClick={() => setShuffle((s) => !s)}
                className={`p-1 transition-colors ${shuffle ? 'text-sky-400' : 'text-content-muted hover:text-content-strong'}`}
                title="Shuffle"
              >
                <ShuffleGlyph className="size-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentTrackIndex === 0 || currentTrackIndex === null}
                className="text-content-muted hover:text-content-strong p-1 transition-colors disabled:opacity-30"
              >
                <PrevGlyph className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => currentTrackIndex !== null && playTrack(currentTrackIndex)}
                disabled={currentTrackIndex === null || isLoading}
                className="bg-content-strong text-surface-base rounded-full p-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <SpinnerGlyph className="size-5" />
                ) : isPlaying ? (
                  <PauseGlyph className="size-5" />
                ) : (
                  <PlayGlyph className="size-5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentTrackIndex === null || currentTrackIndex === tracks.length - 1}
                className="text-content-muted hover:text-content-strong p-1 transition-colors disabled:opacity-30"
              >
                <NextGlyph className="size-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))
                }
                className={`relative p-1 transition-colors ${repeat !== 'off' ? 'text-sky-400' : 'text-content-muted hover:text-content-strong'}`}
                title={`Repeat ${repeat}`}
              >
                <RepeatGlyph className="size-4" />
                {repeat === 'one' && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
                )}
              </button>
            </div>
            <div className="text-content-muted hidden items-center gap-2 text-xs md:flex">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <span>/</span>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume + download */}
          <div className="flex items-center justify-end gap-2 md:w-1/4">
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="text-content-muted hover:text-content-strong p-1 transition-colors"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                <VolumeGlyph
                  className="size-5"
                  muted={isMuted || volume === 0}
                  low={volume < 0.5}
                />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="bg-surface-overlay h-1 w-20 cursor-pointer appearance-none rounded-lg accent-sky-500"
              />
            </div>
            {currentTrack && (
              <a
                href={audioUrl.bgm(currentTrack.file)}
                download={`${currentTrack.file}.mp3`}
                className="text-content-muted hover:text-content-strong flex items-center gap-2 px-3 py-1.5 text-sm transition-colors"
              >
                <DownloadGlyph className="size-4" />
                <span className="hidden md:inline">{strings.download}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Glyphes (SVG inline, hérite `currentColor`) --------------------------- */

function MusicGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}
function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}
function PrevGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
    </svg>
  );
}
function NextGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
    </svg>
  );
}
function ShuffleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </svg>
  );
}
function RepeatGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  );
}
function DownloadGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
function InfoGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function WarnGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}
function SpinnerGlyph({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ''}`} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
function VolumeGlyph({
  className,
  muted,
  low,
}: {
  className?: string;
  muted: boolean;
  low: boolean;
}) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      {muted ? (
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      ) : low ? (
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      ) : (
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      )}
    </svg>
  );
}

'use client'

import Image from 'next/image'
import React, { Suspense, useMemo, useState } from 'react'
import { EVENT_LOADERS } from '@/data/events/loaders'

export type EventCardMeta = {
  slug: string
  title: string
  start: string // ISO
  end: string   // ISO
  cover: string | null
  author?: string | null
  sourceUrl?: string | null
  summary?: string | null
}

type Props = {
  metas: EventCardMeta[]
  nowISO: string
}

type Status = 'upcoming' | 'active' | 'ended'

/* ───────────── Utils ───────────── */
function getStatus(m: EventCardMeta, now = new Date()): Status {
  const s = new Date(m.start).getTime()
  const t = new Date(m.end).getTime()
  const n = now.getTime()
  if (n < s) return 'upcoming'
  if (n <= t) return 'active'
  return 'ended'
}

function formatRange(startISO: string, endISO: string, tz = 'Europe/Paris'): string {
  const s = new Date(startISO)
  const e = new Date(endISO)

  const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: '2-digit' })
  const monthFmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, month: 'short' })

  return `${monthFmt.format(s)} ${dayFmt.format(s)} to ${monthFmt.format(e)} ${dayFmt.format(e)}, ${e.getUTCFullYear()}`
}

const STATUS_LABELS: Record<Status, string> = { upcoming: 'Upcoming', active: 'Active', ended: 'Ended' }
const STATUS_STYLES: Record<Status, string> = {
  upcoming: 'bg-blue-500/70 text-blue-100 ring-1 ring-inset ring-blue-500/50',
  active:   'bg-emerald-500/70 text-emerald-100 ring-1 ring-inset ring-emerald-500/50',
  ended:    'bg-zinc-500/70 text-zinc-100 ring-1 ring-inset ring-zinc-500/50',
}


const ITEMS_PER_PAGE = 10

/* ───────────── Lazy container ───────────── */
function EventBody({ slug }: { slug: string }) {
  const loader = EVENT_LOADERS[slug]
  if (!loader) return <div className="text-sm text-neutral-500 italic">No content component attached.</div>
  const Lazy = React.lazy(loader)
  return (
    <Suspense fallback={<div className="text-sm text-neutral-400">Loading event…</div>}>
      <Lazy />
    </Suspense>
  )
}

/* ───────────── Component ───────────── */
export default function EventHistoryClient({ metas, nowISO }: Props) {
  const now = useMemo(() => new Date(nowISO), [nowISO])

  const sorted = useMemo(
    () => [...metas].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()),
    [metas]
  )

  const [tab, setTab] = useState<'all' | Status>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  const withStatus = useMemo(
    () => sorted.map(m => ({ ...m, __status: getStatus(m, now) as Status })),
    [sorted, now]
  )

  const filteredByTab = useMemo(() => {
    if (tab === 'all') return withStatus
    return withStatus.filter(m => m.__status === tab)
  }, [withStatus, tab])

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return filteredByTab
    return filteredByTab.filter(m =>
      `${m.title} ${m.summary ?? ''}`.toLowerCase().includes(k)
    )
  }, [filteredByTab, q])

  // reset page si filtre/recherche changent
  useMemo(() => setPage(1), [tab, q]) // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, pageCount)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Filtres / recherche */}
      <div className="fle7x flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex overflow-hidden rounded-lg border border-white/10">
          {(['all', 'upcoming', 'active', 'ended'] as const).map(v => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={[
                'px-3 py-1.5 text-sm capitalize transition-colors',
                tab === v ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5',
              ].join(' ')}
            >
              {v}
            </button>
          ))}
        </div>

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search events..."
          className="w-full sm:w-96 rounded-lg bg-neutral-900 px-3 py-2 text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-rose-400"
        />
      </div>

      {/* Stats */}
      <div className="text-sm text-neutral-400">
        {filtered.length === 0
          ? 'No matching events'
          : `Showing ${startIdx + 1}-${Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
      </div>

      {/* Volets */}
      <div className="space-y-4">
        {pageItems.map(m => {
          const status = m.__status as Status
          const isOpen = !!openMap[m.slug]
          return (
            <article key={m.slug} className="rounded-xl border border-white/10 bg-zinc-900/60 overflow-hidden">
              <details
                className="group"
                open={isOpen}
                onToggle={ev => setOpenMap(s => ({ ...s, [m.slug]: (ev.target as HTMLDetailsElement).open }))}
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                    <div className="relative h-24 w-full sm:w-48 shrink-0">
                      {m.cover ? (
                        <Image
                          src={m.cover}
                          alt="cover"
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-cover rounded-lg border border-white/10"
                          priority={status === 'active'}
                        />
                      ) : (
                        <div className="absolute inset-0 rounded-lg border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                      )}
                      <span
                        className={[
                          'absolute left-2 top-2 rounded-full px-2 py-0.5 text-2xs font-medium',
                          STATUS_STYLES[status],
                        ].join(' ')}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-white line-clamp-2">{m.title}</h2>
                      <p className="text-xs text-zinc-400 mt-1">{formatRange(m.start, m.end)}</p>
                      {m.summary && (
                        <p className="mt-2 text-sm text-zinc-300 line-clamp-2 group-open:line-clamp-none">
                          {m.summary}
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-zinc-300 opacity-80 select-none">
                      <span className="group-open:hidden">Show details ↓</span>
                      <span className="hidden group-open:inline">Hide details ↑</span>
                    </div>
                  </div>
                </summary>

                <div className="border-top border-white/10 p-4">
                  {/* Lazy load du contenu réel */}
                  <EventBody slug={m.slug} />
                  {m.sourceUrl && (
                    <p className="mt-3">
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 hover:text-rose-300 underline"
                      >
                        Official source
                      </a>
                    </p>
                  )}
                </div>
              </details>
            </article>
          )
        })}
      </div>

      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded bg-neutral-800 px-3 py-1 text-sm text-white disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-neutral-300">Page {currentPage} / {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={currentPage >= pageCount}
            className="rounded bg-neutral-800 px-3 py-1 text-sm text-white disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

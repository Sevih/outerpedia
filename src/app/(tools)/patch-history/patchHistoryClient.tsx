'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import PatchedHtml from '@/app/components/PatchedHtml'

type Patch = {
  id: string
  title: string
  date: string            // "MM-DD-YYYY"
  date_iso?: string       // "2025-08-25T00:00:00.000Z"
  author?: string | null
  sourceUrl?: string | null
  coverImage?: string | null
  html: string
  images: string[]
}
type PatchWithKey = Patch & { __key: string }

const ITEMS_PER_PAGE = 10

/* ---------- Imports dynamiques (tous: { items: Patch[] }) ---------- */
type DatasetModule = { default: { items: Patch[] } } | { items: Patch[] }
type DatasetLoader = () => Promise<DatasetModule>

const DATASETS = {
  'patchnotes': () => import('@/../data/patchnotes.bundled.json'),
  'compendium': () => import('@/../data/compendium.bundled.json'),
  'developer-notes': () => import('@/../data/developer-notes.bundled.json'),
  'official-4-cut-cartoon': () => import('@/../data/official-4-cut-cartoon.bundled.json'),
  'probabilities': () => import('@/../data/probabilities.bundled.json'),
  'world-introduction': () => import('@/../data/world-introduction.bundled.json'),
  'event': () => import('@/../data/event.bundled.json'),
} satisfies Record<string, DatasetLoader>

type SrcKey = keyof typeof DATASETS

const SOURCES: { value: SrcKey; label: string }[] = [
  { value: 'patchnotes', label: 'Patch Notes' },
  { value: 'developer-notes', label: 'Developer Notes' },
  { value: 'world-introduction', label: 'World Introduction' },
  { value: 'compendium', label: 'Hero Compendium' },
  { value: 'official-4-cut-cartoon', label: 'Official 4‑Cut Cartoon' },
  { value: 'probabilities', label: 'Probabilities' },
  { value: 'event', label: 'Events' },
]

/* ---------- Utils dates / texte ---------- */
function parseMDYtoUTC(mdy: string): number {
  const m = mdy.match(/(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (!m) return 0
  const mm = parseInt(m[1], 10)
  const dd = parseInt(m[2], 10)
  const yyyy = parseInt(m[3], 10)
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return 0
  return Date.UTC(yyyy, mm - 1, dd, 0, 0, 0)
}
function dateKey(p: Patch): number {
  if (p.date_iso) {
    const t = Date.parse(p.date_iso)
    if (!Number.isNaN(t)) return t
  }
  return parseMDYtoUTC(p.date)
}
function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
function toMDYFromISO(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return ''
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  return `${mm}-${dd}-${yyyy}`
}
function labelDate(p: Patch): string {
  if (/^\d{2}-\d{2}-\d{4}$/.test(p.date)) return p.date
  if (p.date_iso) {
    const md = toMDYFromISO(p.date_iso)
    if (md) return md
  }
  const ts = parseMDYtoUTC(p.date)
  if (ts) return toMDYFromISO(new Date(ts).toISOString())
  return ''
}

/* ---------- Composant ---------- */
export default function PatchNotesViewer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Source initiale depuis ?src=…, fallback sur 'patchnotes'
  const initialSrc = useMemo<SrcKey>(() => {
    const param = (searchParams.get('src') || '').toLowerCase()
    return (Object.keys(DATASETS) as SrcKey[]).includes(param as SrcKey)
      ? (param as SrcKey)
      : 'patchnotes'
  }, [searchParams])

  const [src, setSrc] = useState<SrcKey>(initialSrc)
  const [data, setData] = useState<{ items: Patch[] } | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const activeLabel = SOURCES.find(s => s.value === src)?.label ?? ''

  // Mettre à jour l’URL quand la source change
  useEffect(() => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()))
    sp.set('src', src)
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
  }, [src, router, pathname, searchParams])

  // Charger le JSON (forme garantie { items: [...] })
  useEffect(() => {
    let cancelled = false
    setLoadErr(null)
    setData(null)

    DATASETS[src]()
      .then((mod) => {
        if (cancelled) return
        const root = 'default' in mod ? mod.default : mod
        setData({ items: root.items ?? [] })
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : String(e))
      })

    return () => { cancelled = true }
  }, [src])

  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  // ⚠️ items dérivé en useMemo pour satisfaire react-hooks/exhaustive-deps
  const items = useMemo(() => data?.items ?? [], [data])

  // tri du plus récent au plus ancien
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => dateKey(b) - dateKey(a))
  }, [items])

  // index de recherche (titre + texte du HTML)
  const searchIndex = useMemo(() => {
    return new Map(
      sorted.map(p => {
        const hay = (p.title + ' ' + stripHtmlToText(p.html || '')).toLowerCase()
        return [p.id, hay] as const
      })
    )
  }, [sorted])

  // filtrage
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return sorted
    return sorted.filter(p => (searchIndex.get(p.id) || '').includes(k))
  }, [sorted, searchIndex, q])



  useEffect(() => {
    setPage(1)
  }, [q, src])

  const pageCount = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE)

  const keyedPageItems: PatchWithKey[] = useMemo(() => {
    const seen = new Map<string, number>()
    return pageItems.map(p => {
      const n = seen.get(p.id) ?? 0
      seen.set(p.id, n + 1)
      return { ...p, __key: n ? `${p.id}--${n}` : p.id }
    })
  }, [pageItems])

  const canPrev = currentPage > 1
  const canNext = currentPage < pageCount

  return (
    <div className="space-y-6">
      {/* Sélecteur de source */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm text-neutral-400">
          Data source:&nbsp;
          <select
            className="rounded bg-neutral-800 px-2 py-1 text-white"
            value={src}
            onChange={(e) => setSrc(e.target.value as SrcKey)}
          >
            {SOURCES.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search..."
          className="w-full sm:w-72 rounded-lg bg-neutral-800 px-3 py-2 text-white"
        />
      </div>

      {/* États de chargement/erreur */}
      {!data && !loadErr && (
        <div className="text-sm text-neutral-400">Loading {src}…</div>
      )}
      {loadErr && (
        <div className="text-sm text-red-400">Failed to load: {loadErr}</div>
      )}
      {activeLabel && (
        <h1 className="text-xl font-semibold text-white">{activeLabel}</h1>
      )}

      {data && (
        <>
          <div className="text-sm text-neutral-400">
            {filtered.length === 0
              ? 'No results'
              : `Showing ${start + 1}-${Math.min(start + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
          </div>

          <div className="grid gap-6">
            {keyedPageItems.map(p => (
              <article key={p.__key} className="rounded-xl bg-neutral-900 p-4">
                <h2 className="text-lg font-bold text-white">{p.title}</h2>
                <div className="text-sm text-neutral-400 mb-2">
                  {labelDate(p)}
                  {p.sourceUrl && (
                    <>
                      {' • '}
                      <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                        Source
                      </a>
                    </>
                  )}
                </div>
                <details>
                  <summary className="cursor-pointer text-neutral-300">Show details</summary>
                  <PatchedHtml html={p.html} />
                </details>
              </article>
            ))}
          </div>

          {filtered.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                className="rounded bg-neutral-800 px-3 py-1 text-sm text-white disabled:opacity-40"
                onClick={() => canPrev && setPage(p => Math.max(1, p - 1))}
                disabled={!canPrev}
              >
                ← Prev
              </button>

              <span className="text-sm text-neutral-300">
                Page {currentPage} / {pageCount}
              </span>

              <button
                className="rounded bg-neutral-800 px-3 py-1 text-sm text-white disabled:opacity-40"
                onClick={() => canNext && setPage(p => Math.min(pageCount, p + 1))}
                disabled={!canNext}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

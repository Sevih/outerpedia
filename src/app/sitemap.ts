// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { getTenantServer } from '@/tenants/tenant.server'
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

const ROOT = process.cwd()
const CHAR_DIR = path.join(ROOT, 'src', 'data', 'char')
const GUIDE_REF_PATH = path.join(ROOT, 'src', 'data', 'guides', 'guides-ref.json')
const ITEM_FILES: Array<{ file: string; url: string }> = [
  { file: 'weapon', url: 'weapon' },
  { file: 'amulet', url: 'accessory' },
  { file: 'sets', url: 'set' },
]

const STATIC_PAGES = [
  '/',
  '/characters',
  '/equipments',
  '/tierlist',
  '/guides',
  '/changelog',
  '/tools',
  '/legal',
  '/coupons',
]

type GuideRef = Record<string, { category: string; last_updated?: string }>
type ItemData =
  | Array<{ name?: string; Name?: string }>
  | Record<string, { name?: string; Name?: string }>

function statMtime(p: string) {
  try {
    return fs.statSync(p).mtime
  } catch {
    return undefined
  }
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T
}

function toKebabCase(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { domain } = await getTenantServer()
  const base = (p: string) => `https://${domain}${p}`

  const urls: MetadataRoute.Sitemap = []

  // Static
  {
    const mtime = statMtime(path.join(ROOT, 'src', 'app', 'layout.tsx')) ?? new Date()
    for (const p of STATIC_PAGES) {
      urls.push({
        url: base(p),
        lastModified: mtime,
        changeFrequency: 'daily',
        priority: p === '/' ? 1.0 : 0.7,
      })
    }
  }

  // Characters
  if (fs.existsSync(CHAR_DIR)) {
    for (const f of fs.readdirSync(CHAR_DIR).filter((f) => f.endsWith('.json'))) {
      urls.push({
        url: base(`/characters/${f.replace(/\.json$/, '')}`),
        lastModified: statMtime(path.join(CHAR_DIR, f)) ?? new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Items
  for (const { file, url } of ITEM_FILES) {
    const fp = path.join(ROOT, 'src', 'data', `${file}.json`)
    if (!fs.existsSync(fp)) continue

    const data = readJson<ItemData>(fp)
    const list = Array.isArray(data) ? data : Object.values(data)
    const last = statMtime(fp) ?? new Date()

    for (const entry of list) {
      const raw = entry?.name ?? entry?.Name ?? ''
      const slug = toKebabCase(raw)
      if (!slug) continue
      urls.push({
        url: base(`/item/${url}/${slug}`),
        lastModified: last,
        changeFrequency: 'monthly',
        priority: 0.55,
      })
    }
  }

  // Guides
  if (fs.existsSync(GUIDE_REF_PATH)) {
    const ref = readJson<GuideRef>(GUIDE_REF_PATH)
    const fileM = statMtime(GUIDE_REF_PATH) ?? new Date()
    for (const [slug, meta] of Object.entries(ref)) {
      const lm =
        meta.last_updated && !Number.isNaN(Date.parse(meta.last_updated))
          ? new Date(meta.last_updated)
          : fileM
      urls.push({
        url: base(`/guides/${meta.category}/${slug}`),
        lastModified: lm,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  return urls
}

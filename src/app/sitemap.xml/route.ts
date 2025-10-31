// src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { VA_AVAILABLE_LANGUAGES } from '@/tenants/config'
import { getNewsSlugs, type NewsCategory } from '@/lib/news'

// ——— Domains (fixes, car 3 tenants EN/JP/KR) ———
const DOMAIN_EN = 'https://outerpedia.com'
const DOMAIN_JP = 'https://jp.outerpedia.com'
const DOMAIN_KR = 'https://kr.outerpedia.com'
const DOMAIN_ZH = 'https://zh.outerpedia.com'

// ——— Helpers ———
const ROOT = process.cwd()
const CHAR_DIR = path.join(ROOT, 'src', 'data', 'char')
const GUIDE_REF_PATH = path.join(ROOT, 'src', 'data', 'guides', 'guides-ref.json')
const ITEM_FILES: Array<{ file: string; url: string }> = [
    { file: 'weapon', url: 'weapon' },
    { file: 'amulet', url: 'accessory' },
    { file: 'sets', url: 'set' },
]

const STATIC_PAGES = [
    '/', '/characters', '/equipments', '/tierlist', '/guides',
    '/changelog', '/tools', '/legal', '/coupons', '/patch-history',
]

const NEWS_CATEGORIES: NewsCategory[] = [
    // VA Live categories
    'notice', 'maintenance', 'issues', 'event', 'winners',
    // Legacy categories
    'patchnotes', 'compendium', 'developer-notes', 'official-4-cut-cartoon',
    'probabilities', 'world-introduction', 'media-archives',
]

function xmlEscape(s: string) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function toKebabCase(str = '') {
    return String(str)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

function statMtime(p: string) {
    try { return fs.statSync(p).mtime } catch { return undefined }
}

function readJson<T>(p: string): T {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T
}

// ——— Page collection (une seule fois) ———
type Page = { path: string; lastmod?: string; isLiveArticle?: boolean }

function collectPages(): Page[] {
    const pages: Page[] = []

    // Static
    {
        const lm = (statMtime(path.join(ROOT, 'src', 'app', 'layout.tsx')) ?? new Date())
            .toISOString().split('T')[0]
        for (const p of STATIC_PAGES) pages.push({ path: p, lastmod: lm })
    }

    // Characters
    if (fs.existsSync(CHAR_DIR)) {
        for (const f of fs.readdirSync(CHAR_DIR).filter(f => f.endsWith('.json'))) {
            const mtime = statMtime(path.join(CHAR_DIR, f)) ?? new Date()
            pages.push({
                path: `/characters/${f.replace(/\.json$/, '')}`,
                lastmod: mtime.toISOString().split('T')[0],
            })
        }
    }

    // Items
    for (const { file, url } of ITEM_FILES) {
        const fp = path.join(ROOT, 'src', 'data', `${file}.json`)
        if (!fs.existsSync(fp)) continue
        type ItemFile = Array<{ name?: string; Name?: string }> | Record<string, { name?: string; Name?: string }>
        const raw = readJson<ItemFile>(fp)
        const list: Array<{ name?: string; Name?: string }> = Array.isArray(raw) ? raw : Object.values(raw)
        const lm = (statMtime(fp) ?? new Date()).toISOString().split('T')[0]
        for (const e of list) {
            const slug = toKebabCase(e?.name ?? e?.Name ?? '')
            if (slug) pages.push({ path: `/item/${url}/${slug}`, lastmod: lm })
        }
    }

    // Guides
    if (fs.existsSync(GUIDE_REF_PATH)) {
        const ref = readJson<Record<string, { category: string; last_updated?: string }>>(GUIDE_REF_PATH)
        const fileLm = (statMtime(GUIDE_REF_PATH) ?? new Date()).toISOString().split('T')[0]
        for (const [slug, meta] of Object.entries(ref)) {
            const lm = meta.last_updated && !Number.isNaN(Date.parse(meta.last_updated))
                ? new Date(meta.last_updated).toISOString().split('T')[0]
                : fileLm
            pages.push({ path: `/guides/${meta.category}/${slug}`, lastmod: lm })
        }
    }

    // Patch History (legacy + live articles)
    // Les articles "live" sont spécifiques à chaque langue (live-en-, live-kr-, live-ja-)
    // et ne doivent pas avoir d'alternates. Seuls les articles legacy ont des alternates.
    const newsPathsSet = new Set<string>()
    for (const lang of VA_AVAILABLE_LANGUAGES) {
        for (const category of NEWS_CATEGORIES) {
            const slugs = getNewsSlugs(category, lang)
            for (const slug of slugs) {
                const newsPath = `/patch-history/${category}/${slug}`
                if (!newsPathsSet.has(newsPath)) {
                    newsPathsSet.add(newsPath)
                    // Marquer si c'est un article live (spécifique à une langue)
                    const isLiveArticle = slug.startsWith('live-')
                    pages.push({
                        path: newsPath,
                        lastmod: new Date().toISOString().split('T')[0],
                        isLiveArticle // Flag pour désactiver les alternates
                    })
                }
            }
        }
    }

    // Dédoublonnage
    const map = new Map<string, Page>()
    for (const p of pages) {
        const prev = map.get(p.path)
        if (!prev || (p.lastmod && !prev.lastmod)) map.set(p.path, p)
    }
    return Array.from(map.values())
}

// ——— XML rendering (avec alternates en, ja, ko + x-default) ———
function renderSitemapXml(pages: Page[]): string {
    const body = pages.map(p => {
        const en = `${DOMAIN_EN}${p.path}`
        const ja = `${DOMAIN_JP}${p.path}`
        const ko = `${DOMAIN_KR}${p.path}`
        const zh = `${DOMAIN_ZH}${p.path}`
        const last = p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''

        // Les articles live sont spécifiques à une langue
        if (p.isLiveArticle) {
            // Déterminer le domaine en fonction du préfixe live-XX-
            let primaryUrl = en
            if (p.path.includes('/live-ja-')) primaryUrl = ja
            else if (p.path.includes('/live-kr-')) primaryUrl = ko
            else if (p.path.includes('/live-zh-')) primaryUrl = zh
            // live-en- ou pas de préfixe spécifique -> EN par défaut

            return `
  <url>
    <loc>${xmlEscape(primaryUrl)}</loc>
    ${last}
  </url>`.trim()
        }

        // Articles legacy : avec alternates
        const alternates = `
    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(en)}"/>
    <xhtml:link rel="alternate" hreflang="ja" href="${xmlEscape(ja)}"/>
    <xhtml:link rel="alternate" hreflang="ko" href="${xmlEscape(ko)}"/>
    <xhtml:link rel="alternate" hreflang="zh" href="${xmlEscape(zh)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(en)}"/>`

        return `
  <url>
    <loc>${xmlEscape(en)}</loc>
    ${last}${alternates}
  </url>`.trim()
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`
}

export const dynamic = 'force-dynamic'

export async function GET() {
    const pages = collectPages()
    // Si un jour tu dépasses ~45k URLs, implémente un index ici.
    const xml = renderSitemapXml(pages)
    return new NextResponse(xml, {
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
}

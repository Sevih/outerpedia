// src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

// ——— Domains (fixes, car 3 tenants EN/JP/KR) ———
const DOMAIN_EN = 'https://outerpedia.com'
const DOMAIN_JP = 'https://jp.outerpedia.com'
const DOMAIN_KR = 'https://kr.outerpedia.com'
const DOMAIN_ZH = 'https://zh.outerpedia.com'

// ——— Helpers ———
const ROOT = process.cwd()
const CHAR_DIR = path.join(ROOT, 'src', 'data', 'char')
const GUIDE_REF_PATH = path.join(ROOT, 'src', 'data', 'guides', 'guides-ref.json')
// Item files removed from sitemap (noindex)

const STATIC_PAGES = [
    '/', '/characters', '/equipments', '/tierlist', '/guides',
    '/changelog', '/tools', '/legal', '/coupons', '/patch-history',
]

function xmlEscape(s: string) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

// toKebabCase removed (no longer needed after removing items from sitemap)

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

    // Items pages are excluded from sitemap (noindex)

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

    // Patch History pages are excluded from sitemap (noindex)

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
            if (p.path.includes('/live-jp-')) primaryUrl = ja
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

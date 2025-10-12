import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import type { EventDef, EventMeta } from './registry.types'

const EVENT_DIR = path.join(process.cwd(), 'src/data/events')

// Event actif par défaut (fallback)
export const ACTIVE_EVENT_SLUG_DEFAULT: string | null = '20251011-video'

// charge tous les events (*.tsx sauf les fichiers de registry)
export async function loadAllEvents(): Promise<EventDef[]> {
    const files = fs
        .readdirSync(EVENT_DIR)
        .filter((f) => /\.tsx?$/.test(f) && !/registry/i.test(f))

    const out: EventDef[] = []
    for (const file of files) {
        const full = path.join(EVENT_DIR, file)
        // ⚠️ Attention: importer des .tsx par file:// ne marche pas en prod Next.
        // Voir la solution "registry.generated.ts" si tu buildes vraiment avec Next.
        const mod = await import(pathToFileURL(full).href)
        const def = (mod?.default ?? null) as EventDef | null
        if (def?.meta?.slug && 'Page' in def && typeof def.Page === 'function') {
            out.push(def)
        }
    }
    return out
}

export async function getEvents(): Promise<EventDef[]> {
    return loadAllEvents()
}

export async function getActiveEvent(): Promise<EventDef | null> {
    // Slug final pris depuis l'ENV (si défini) sinon la constante par défaut
    const slug = process.env.NEXT_PUBLIC_ACTIVE_EVENT_SLUG ?? ACTIVE_EVENT_SLUG_DEFAULT
    if (!slug) return null

    const all = await loadAllEvents()
    return all.find((e) => e.meta.slug === slug) ?? null
}

export async function getActiveEventMeta(): Promise<EventMeta | null> {
    const ev = await getActiveEvent()
    return ev?.meta ?? null
}

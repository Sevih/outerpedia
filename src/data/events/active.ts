import type { EventDef } from './registry.types'
import { EVENTS } from './registry.generated'

/** Utils sûres */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function isString(v: unknown): v is string {
  return typeof v === 'string'
}

/** Vérifie qu'un item du tableau est bien un EventDef valide (sans any) */
function isEventDef(x: unknown): x is EventDef {
  if (!isRecord(x)) return false

  const page = (x as { Page?: unknown }).Page
  if (typeof page !== 'function') return false

  const meta = (x as { meta?: unknown }).meta
  if (!isRecord(meta)) return false

  const slug = meta.slug
  const title = meta.title
  const start = meta.start
  const end = meta.end

  return isString(slug) && isString(title) && isString(start) && isString(end)
}

/** Parse 'YYYY-MM-DD' comme UTC 00:00, sinon ISO standard */
function parseStartUTC(s: string): number {
  if (!s) return NaN
  return s.includes('T') ? Date.parse(s) : Date.parse(`${s}T00:00:00Z`)
}

/** Parse 'YYYY-MM-DD' comme UTC 23:59:59.999, sinon ISO standard */
function parseEndUTC(s: string): number {
  if (!s) return NaN
  return s.includes('T') ? Date.parse(s) : Date.parse(`${s}T23:59:59.999Z`)
}

/** Retourne l'event actif (le plus récent par date de début) */
export function getActiveEvent(now: Date = new Date()): EventDef | null {
  const valid: EventDef[] = (EVENTS as unknown[]).filter(isEventDef)
  const ts = now.getTime()
  const active = valid.filter(e => {
    const s = parseStartUTC(e.meta.start)
    const end = parseEndUTC(e.meta.end)
    return isFinite(s) && isFinite(end) && ts >= s && ts <= end
  })
  active.sort((a, b) => parseStartUTC(b.meta.start) - parseStartUTC(a.meta.start))
  return active[0] ?? null
}

/** Retourne la liste de tous les events actifs */
export function getActiveEvents(now: Date = new Date()): EventDef[] {
  const ts = now.getTime()
  const valid: EventDef[] = (EVENTS as unknown[]).filter(isEventDef)
  return valid
    .filter(e => {
      const s = parseStartUTC(e.meta.start)
      const end = parseEndUTC(e.meta.end)
      return isFinite(s) && isFinite(end) && ts >= s && ts <= end
    })
    .sort((a, b) => parseStartUTC(b.meta.start) - parseStartUTC(a.meta.start))
}

/** Prochain event à venir */
export function getUpcomingEvent(now: Date = new Date()): EventDef | null {
  const ts = now.getTime()
  const valid: EventDef[] = (EVENTS as unknown[]).filter(isEventDef)
  const upcoming = valid
    .map(e => ({ e, s: parseStartUTC(e.meta.start) }))
    .filter(x => isFinite(x.s) && x.s > ts)
    .sort((a, b) => a.s - b.s)
  return upcoming[0]?.e ?? null
}

/** Actif sinon prochain */
export function getActiveOrNext(now: Date = new Date()): EventDef | null {
  return getActiveEvent(now) ?? getUpcomingEvent(now)
}

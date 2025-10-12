// src/lib/contexts/server-i18n.ts
import { cache } from 'react'

export type Lng = 'en' | 'jp' | 'kr'
export type Messages = Record<string, string>
type TValues = Record<string, unknown>

export type TFunction = {
    (key: string): string
    (key: string, values: TValues): string
}

function formatICU(template: string, values: TValues) {
    const withPlural = template.replace(
        /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g,
        (_m, varName: string, one: string, other: string) => {
            const raw = values[varName]
            const n = typeof raw === 'number' ? raw : Number(raw)
            return (n === 1 ? one : other).replace(/#/g, String(n))
        }
    )
    return withPlural.replace(
        /\{(\w+)\}/g,
        (_m, varName: string) => (values[varName] !== undefined ? String(values[varName]) : '')
    )
}

function makeT<T extends Messages>(dict: T) {
    const base: Messages = dict
    const t = ((key: keyof T | string, values?: TValues) => {
        const template = base[String(key)] ?? String(key)
        return values ? formatICU(template, values) : template
    }) as {
        <K extends keyof T>(key: K): string
        <K extends keyof T>(key: K, values: TValues): string
        (key: string): string
        (key: string, values: TValues): string
    }
    return t
}


// 🔒 Import explicite par langue (pas d’indexation dynamique)
async function importLocale(lang: Lng): Promise<Messages> {
    switch (lang) {
        case 'en': return (await import('@/i18n/locales/en')).default
        case 'jp': return (await import('@/i18n/locales/jp')).default
        case 'kr': return (await import('@/i18n/locales/kr')).default
        default: return (await import('@/i18n/locales/en')).default
    }
}

export const loadMessages = cache(async (lang: Lng): Promise<Messages> => {
    // 🛡️ garde-fou au cas où `lang` est mal détecté au runtime
    const safeLang: Lng = (['en', 'jp', 'kr'] as const).includes(lang) ? lang : 'en'
    return importLocale(safeLang)
})

export const getServerI18n = cache(async (lang: Lng) => {
    const dict = await loadMessages(lang)
    const t = makeT(dict)
    return { t, messages: dict, lang }
})

// Optionnel : assure qu’on ne renvoie que 'en' | 'jp' | 'kr'
export function detectLangFromHost(host?: string): Lng {
    if (!host) return 'en'
    if (host.startsWith('jp.')) return 'jp'
    if (host.startsWith('kr.')) return 'kr'
    return 'en'
}

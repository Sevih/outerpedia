// src/lib/contexts/server-i18n.ts
import { cache } from 'react'
import { getAvailableLanguages, type TenantKey } from '@/tenants/config'
import { importLocale, type Messages } from '@/i18n'

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

export const loadMessages = cache(async (lang: TenantKey): Promise<Messages> => {
    // 🛡️ garde-fou au cas où `lang` est mal détecté au runtime
    const availableLanguages = getAvailableLanguages()
    const safeLang: TenantKey = availableLanguages.includes(lang) ? lang : 'en'
    return importLocale(safeLang)
})

export const getServerI18n = cache(async (lang: TenantKey) => {
    const dict = await loadMessages(lang)
    const t = makeT(dict)
    return { t, messages: dict, lang }
})

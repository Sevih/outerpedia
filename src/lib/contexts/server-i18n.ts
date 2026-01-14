// src/lib/contexts/server-i18n.ts
import { cache, Fragment, createElement, type ReactNode } from 'react'
import { getAvailableLanguages, type TenantKey } from '@/tenants/config'
import { importLocale, type Messages } from '@/i18n'

type TValues = Record<string, unknown>

/**
 * Converts \n in a string to <br /> elements for JSX rendering
 */
function nl2jsx(text: string): ReactNode {
    if (!text.includes('\n')) return text
    const parts = text.split('\n')
    return parts.map((line, i) =>
        createElement(Fragment, { key: i }, line, i < parts.length - 1 && createElement('br'))
    )
}

// Note: t() returns string when no \n, ReactNode otherwise - typed as string for compatibility
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

    const getRaw = (key: string, values?: TValues): string => {
        const template = base[key]

        // En développement, on crash si la clé n'existe pas
        if (template === undefined) {
            if (process.env.NODE_ENV === 'development') {
                throw new Error(`[i18n] Missing translation key: "${key}"`)
            }
            // En production, on fallback sur la clé (pour éviter de casser le site)
            return key
        }

        return values ? formatICU(template, values) : template
    }

    const t = ((key: keyof T | string, values?: TValues) => {
        return nl2jsx(getRaw(String(key), values))
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
